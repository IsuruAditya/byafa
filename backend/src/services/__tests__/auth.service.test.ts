import { describe, it, expect } from 'vitest'
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  updateProfile,
  deleteAccount,
} from '../auth.service'
import { User } from '../../models/User.model'
import { RefreshToken } from '../../models/RefreshToken.model'
import { AppError } from '../../utils/AppError'
import { makeUserInput } from '../../test/factories'
import crypto from 'crypto'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function createAndRegister(overrides = {}) {
  const input = makeUserInput(overrides)
  const result = await registerUser(input)
  return { input, result }
}

// ── registerUser ─────────────────────────────────────────────────────────────

describe('registerUser', () => {
  it('creates a user and returns tokens', async () => {
    const { input, result } = await createAndRegister()

    expect(result.user.email).toBe(input.email)
    expect(result.user.name).toBe(input.name)
    expect(result.user.role).toBe('customer')
    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
  })

  it('hashes the password — raw password is never stored', async () => {
    const { input } = await createAndRegister()
    const dbUser = await User.findOne({ email: input.email }).select('+password')
    expect(dbUser!.password).not.toBe(input.password)
    expect(dbUser!.password).toMatch(/^\$2[ab]\$/) // bcrypt hash prefix
  })

  it('stores a hashed refresh token in RefreshToken collection', async () => {
    const { result } = await createAndRegister()
    const hashed = crypto.createHash('sha256').update(result.refreshToken).digest('hex')
    const stored = await RefreshToken.findOne({ token: hashed })
    expect(stored).not.toBeNull()
  })

  it('throws 409 when email is already in use', async () => {
    const input = makeUserInput({ email: 'dup@example.com' })
    await registerUser(input)

    await expect(registerUser(input)).rejects.toMatchObject({
      statusCode: 409,
      message: 'Email already in use',
    })
  })

  it('assigns role "customer" by default', async () => {
    const { result } = await createAndRegister()
    expect(result.user.role).toBe('customer')
  })
})

// ── loginUser ────────────────────────────────────────────────────────────────

describe('loginUser', () => {
  it('returns tokens for valid credentials', async () => {
    const { input } = await createAndRegister()
    const result = await loginUser(input.email, input.password)

    expect(result.user.email).toBe(input.email)
    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
  })

  it('throws 401 for wrong password', async () => {
    const { input } = await createAndRegister()

    await expect(loginUser(input.email, 'wrongpassword')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid email or password',
    })
  })

  it('throws 401 for non-existent email', async () => {
    await expect(loginUser('nobody@example.com', 'password123')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid email or password',
    })
  })

  it('creates a new refresh token on each login', async () => {
    const { input } = await createAndRegister()
    const login1 = await loginUser(input.email, input.password)
    const login2 = await loginUser(input.email, input.password)

    expect(login1.refreshToken).not.toBe(login2.refreshToken)
  })
})

// ── refreshAccessToken ───────────────────────────────────────────────────────

describe('refreshAccessToken', () => {
  it('returns a new access token for a valid refresh token', async () => {
    const { result } = await createAndRegister()
    const refreshed = await refreshAccessToken(result.refreshToken)

    expect(refreshed.accessToken).toBeTruthy()
    // Access token is a valid JWT string
    expect(refreshed.accessToken.split('.')).toHaveLength(3)
  })

  it('throws 401 for an invalid token', async () => {
    await expect(refreshAccessToken('not-a-real-token')).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('throws 401 for an already-used / deleted token', async () => {
    const { result } = await createAndRegister()
    await logoutUser(result.refreshToken) // invalidate it

    await expect(refreshAccessToken(result.refreshToken)).rejects.toMatchObject({
      statusCode: 401,
    })
  })
})

// ── logoutUser ───────────────────────────────────────────────────────────────

describe('logoutUser', () => {
  it('removes the refresh token from the database', async () => {
    const { result } = await createAndRegister()
    const hashed = crypto.createHash('sha256').update(result.refreshToken).digest('hex')

    await logoutUser(result.refreshToken)

    const stored = await RefreshToken.findOne({ token: hashed })
    expect(stored).toBeNull()
  })

  it('does not throw when given an unknown token', async () => {
    await expect(logoutUser('unknown-token')).resolves.not.toThrow()
  })
})

// ── updateProfile ────────────────────────────────────────────────────────────

describe('updateProfile', () => {
  it('updates name successfully', async () => {
    const { result } = await createAndRegister()
    const updated = await updateProfile({ userId: result.user.id, name: 'New Name' })

    expect(updated.name).toBe('New Name')
  })

  it('updates email successfully', async () => {
    const { result } = await createAndRegister()
    const newEmail = `new-${Date.now()}@example.com`
    const updated = await updateProfile({ userId: result.user.id, email: newEmail })

    expect(updated.email).toBe(newEmail)
  })

  it('throws 409 when new email is already taken by another user', async () => {
    const { result: user1 } = await createAndRegister({ email: 'user1@example.com' })
    const { result: user2 } = await createAndRegister({ email: 'user2@example.com' })

    await expect(
      updateProfile({ userId: user2.user.id, email: user1.user.email })
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('throws 404 for a non-existent userId', async () => {
    await expect(
      updateProfile({ userId: '000000000000000000000000', name: 'Ghost' })
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})

// ── deleteAccount ────────────────────────────────────────────────────────────

describe('deleteAccount', () => {
  it('removes the user document', async () => {
    const { result } = await createAndRegister()
    await deleteAccount(result.user.id)

    const user = await User.findById(result.user.id)
    expect(user).toBeNull()
  })

  it('invalidates all refresh tokens for the user', async () => {
    const { result } = await createAndRegister()
    const dbUser = await User.findOne({ email: result.user.email })

    await deleteAccount(result.user.id)

    const tokens = await RefreshToken.find({ userId: dbUser!._id })
    expect(tokens).toHaveLength(0)
  })

  it('throws 404 for a non-existent userId', async () => {
    await expect(deleteAccount('000000000000000000000000')).rejects.toMatchObject({
      statusCode: 404,
    })
  })
})

// ── AppError shape ───────────────────────────────────────────────────────────

describe('AppError', () => {
  it('is an instance of Error', () => {
    const err = new AppError('test', 400)
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('test')
    expect(err.statusCode).toBe(400)
  })
})
