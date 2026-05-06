import { Request, Response } from 'express'
import * as authService from '../../services/auth.service'
import { env } from '../../config/env'

const REFRESH_COOKIE = 'refreshToken'

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as {
    name: string
    email: string
    password: string
  }

  const result = await authService.registerUser({ name, email, password })

  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions)

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      // Also returned in body so mobile clients can store it in SecureStore
      refreshToken: result.refreshToken,
    },
  })
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string }

  const result = await authService.loginUser(email, password)

  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions)

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      // Also returned in body so mobile clients can store it in SecureStore
      refreshToken: result.refreshToken,
    },
  })
}

export async function refresh(req: Request, res: Response): Promise<void> {
  // Accept refresh token from cookie (web) OR request body (mobile)
  const rawToken =
    (req.cookies[REFRESH_COOKIE] as string | undefined) ??
    (req.body as { refreshToken?: string } | undefined)?.refreshToken

  if (!rawToken) {
    res.status(401).json({ success: false, message: 'No refresh token provided' })
    return
  }

  const result = await authService.refreshAccessToken(rawToken)

  res.status(200).json({
    success: true,
    data: { accessToken: result.accessToken },
  })
}

export async function logout(req: Request, res: Response): Promise<void> {
  // Accept refresh token from cookie (web) OR request body (mobile)
  const rawToken =
    (req.cookies[REFRESH_COOKIE] as string | undefined) ??
    (req.body as { refreshToken?: string } | undefined)?.refreshToken

  if (rawToken) {
    await authService.logoutUser(rawToken)
  }

  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  res.status(200).json({ success: true, message: 'Logged out successfully' })
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = req.user!
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id as string,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  })
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { name, email } = req.body as { name?: string; email?: string }
  const userId = req.user!.id as string

  const updated = await authService.updateProfile({ userId, name, email })

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updated },
  })
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id as string
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string
    newPassword: string
  }

  await authService.changePassword(userId, currentPassword, newPassword)

  res.status(200).json({ success: true, message: 'Password changed successfully' })
}

export async function deleteAccount(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id as string

  await authService.deleteAccount(userId)

  // Clear the refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  res.status(200).json({ success: true, message: 'Account deleted successfully' })
}
