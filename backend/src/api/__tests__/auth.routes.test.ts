import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app, createAuthToken, authedRequest } from '../../test/helpers'
import { makeUserInput } from '../../test/factories'

const BASE = '/api/v1/auth'

// ── POST /register ────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  it('201 — creates user and returns tokens', async () => {
    const input = makeUserInput()
    const res = await request(app).post(`${BASE}/register`).send(input)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user.email).toBe(input.email)
    expect(res.body.data.accessToken).toBeTruthy()
    expect(res.body.data.refreshToken).toBeTruthy()
    // Password must never be returned
    expect(res.body.data.user.password).toBeUndefined()
  })

  it('sets an httpOnly refreshToken cookie', async () => {
    const res = await request(app).post(`${BASE}/register`).send(makeUserInput())

    const cookies = res.headers['set-cookie'] as unknown as string[]
    const cookieStr = Array.isArray(cookies) ? cookies.join(';') : String(cookies)
    expect(cookieStr).toMatch(/refreshToken=/)
    expect(cookieStr).toMatch(/HttpOnly/i)
  })

  it('409 — duplicate email', async () => {
    const input = makeUserInput({ email: 'dup@example.com' })
    await request(app).post(`${BASE}/register`).send(input)
    const res = await request(app).post(`${BASE}/register`).send(input)

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('400 — missing name', async () => {
    const { name: _n, ...noName } = makeUserInput()
    const res = await request(app).post(`${BASE}/register`).send(noName)

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.errors).toBeDefined()
  })

  it('400 — invalid email', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ name: 'Test', email: 'not-an-email', password: 'password123' })

    expect(res.status).toBe(400)
  })

  it('400 — password too short', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ name: 'Test', email: 'test@example.com', password: 'short' })

    expect(res.status).toBe(400)
  })
})

// ── POST /login ───────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  it('200 — returns tokens for valid credentials', async () => {
    const input = makeUserInput()
    await request(app).post(`${BASE}/register`).send(input)

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: input.email, password: input.password })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeTruthy()
  })

  it('401 — wrong password', async () => {
    const input = makeUserInput()
    await request(app).post(`${BASE}/register`).send(input)

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: input.email, password: 'wrongpassword' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('401 — non-existent email', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'nobody@example.com', password: 'password123' })

    expect(res.status).toBe(401)
  })

  it('400 — missing password field', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'test@example.com' })

    expect(res.status).toBe(400)
  })
})

// ── POST /refresh ─────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  it('200 — returns new access token via cookie', async () => {
    const input = makeUserInput()
    const registerRes = await request(app).post(`${BASE}/register`).send(input)
    const cookies = registerRes.headers['set-cookie'] as unknown as string[]

    const res = await request(app)
      .post(`${BASE}/refresh`)
      .set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeTruthy()
  })

  it('200 — returns new access token via request body (mobile flow)', async () => {
    const input = makeUserInput()
    const registerRes = await request(app).post(`${BASE}/register`).send(input)
    const { refreshToken } = registerRes.body.data

    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeTruthy()
  })

  it('401 — no token provided', async () => {
    const res = await request(app).post(`${BASE}/refresh`)
    expect(res.status).toBe(401)
  })

  it('401 — invalid token', async () => {
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken: 'invalid-token' })

    expect(res.status).toBe(401)
  })
})

// ── POST /logout ──────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  it('200 — clears the cookie and invalidates the token', async () => {
    const input = makeUserInput()
    const registerRes = await request(app).post(`${BASE}/register`).send(input)
    const cookies = registerRes.headers['set-cookie'] as unknown as string[]
    const { refreshToken } = registerRes.body.data

    const logoutRes = await request(app)
      .post(`${BASE}/logout`)
      .set('Cookie', cookies)

    expect(logoutRes.status).toBe(200)
    expect(logoutRes.body.success).toBe(true)

    // Token should now be invalid
    const refreshRes = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken })

    expect(refreshRes.status).toBe(401)
  })

  it('200 — succeeds even with no token (idempotent)', async () => {
    const res = await request(app).post(`${BASE}/logout`)
    expect(res.status).toBe(200)
  })
})

// ── GET /me ───────────────────────────────────────────────────────────────────

describe('GET /api/v1/auth/me', () => {
  it('200 — returns current user for authenticated request', async () => {
    const { token, user } = await createAuthToken()
    const res = await authedRequest(token).get(`${BASE}/me`)

    expect(res.status).toBe(200)
    expect(res.body.data.user.email).toBe(user.email)
    expect(res.body.data.user.password).toBeUndefined()
  })

  it('401 — rejects unauthenticated request', async () => {
    const res = await request(app).get(`${BASE}/me`)
    expect(res.status).toBe(401)
  })

  it('401 — rejects invalid token', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', 'Bearer invalid.token.here')

    expect(res.status).toBe(401)
  })
})

// ── PATCH /profile ────────────────────────────────────────────────────────────

describe('PATCH /api/v1/auth/profile', () => {
  it('200 — updates name', async () => {
    const { token } = await createAuthToken()
    const res = await authedRequest(token)
      .patch(`${BASE}/profile`)
      .send({ name: 'Updated Name' })

    expect(res.status).toBe(200)
    expect(res.body.data.user.name).toBe('Updated Name')
  })

  it('409 — email already taken', async () => {
    const { token } = await createAuthToken()
    const other = makeUserInput({ email: 'taken@example.com' })
    await request(app).post(`${BASE}/register`).send(other)

    const res = await authedRequest(token)
      .patch(`${BASE}/profile`)
      .send({ email: 'taken@example.com' })

    expect(res.status).toBe(409)
  })

  it('401 — unauthenticated', async () => {
    const res = await request(app)
      .patch(`${BASE}/profile`)
      .send({ name: 'Ghost' })

    expect(res.status).toBe(401)
  })
})

// ── DELETE /account ───────────────────────────────────────────────────────────

describe('DELETE /api/v1/auth/account', () => {
  it('200 — deletes the account', async () => {
    const { token } = await createAuthToken()
    const res = await authedRequest(token).delete(`${BASE}/account`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('401 — unauthenticated', async () => {
    const res = await request(app).delete(`${BASE}/account`)
    expect(res.status).toBe(401)
  })
})
