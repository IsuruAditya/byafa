import crypto from 'crypto'
import { User } from '../models/User.model'
import { RefreshToken } from '../models/RefreshToken.model'
import { AppError } from '../utils/AppError'
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generateTokens'
import mongoose from 'mongoose'

interface RegisterInput {
  name: string
  email: string
  password: string
}

interface AuthResult {
  user: { id: string; name: string; email: string; role: 'customer' | 'admin' }
  accessToken: string
  refreshToken: string
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const { name, email, password } = input

  const existing = await User.findOne({ email })
  if (existing) {
    throw new AppError('Email already in use', 409)
  }

  const user = await User.create({ name, email, password })

  const accessToken = generateAccessToken({
    userId: user.id as string,
    role: user.role,
  })
  const refreshToken = await generateRefreshToken(
    user._id as mongoose.Types.ObjectId
  )

  return {
    user: { id: user.id as string, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResult> {
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401)
  }

  const accessToken = generateAccessToken({
    userId: user.id as string,
    role: user.role,
  })
  const refreshToken = await generateRefreshToken(
    user._id as mongoose.Types.ObjectId
  )

  return {
    user: { id: user.id as string, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  }
}

export async function refreshAccessToken(
  rawToken: string
): Promise<{ accessToken: string }> {
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex')

  const stored = await RefreshToken.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  })

  if (!stored) {
    throw new AppError('Invalid or expired refresh token', 401)
  }

  const user = await User.findById(stored.userId)
  if (!user) {
    throw new AppError('User not found', 401)
  }

  const accessToken = generateAccessToken({
    userId: user.id as string,
    role: user.role,
  })

  return { accessToken }
}

export async function logoutUser(rawToken: string): Promise<void> {
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex')

  await RefreshToken.deleteOne({ token: hashedToken })
}

interface UpdateProfileInput {
  userId: string
  name?: string
  email?: string
}

interface ProfileResult {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ProfileResult> {
  const { userId, name, email } = input

  // Check email uniqueness if changing email
  if (email) {
    const conflict = await User.findOne({ email, _id: { $ne: userId } })
    if (conflict) {
      throw new AppError('Email already in use', 409)
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { ...(name && { name }), ...(email && { email }) },
    { returnDocument: 'after', runValidators: true }
  )

  if (!user) {
    throw new AppError('User not found', 404)
  }

  return { id: user.id as string, name: user.name, email: user.email, role: user.role }
}

export async function deleteAccount(userId: string): Promise<void> {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  // Invalidate all refresh tokens for this user
  await RefreshToken.deleteMany({ userId })

  // Delete the user document
  await User.findByIdAndDelete(userId)
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findById(userId)
  if (!user) throw new AppError('User not found', 404)

  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) throw new AppError('Current password is incorrect', 400)

  user.password = newPassword
  await user.save() // pre-save hook re-hashes the password
}
