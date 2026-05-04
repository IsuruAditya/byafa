import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { env } from '../config/env'
import { RefreshToken } from '../models/RefreshToken.model'
import mongoose from 'mongoose'

export interface TokenPayload {
  userId: string
  role: 'customer' | 'admin'
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export async function generateRefreshToken(
  userId: mongoose.Types.ObjectId
): Promise<string> {
  const rawToken = crypto.randomBytes(64).toString('hex')
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex')

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  await RefreshToken.create({
    userId,
    token: hashedToken,
    expiresAt,
  })

  return rawToken // send raw token to client; store only the hash
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}
