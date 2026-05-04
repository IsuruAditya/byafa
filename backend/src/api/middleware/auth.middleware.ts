import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../../utils/generateTokens'
import { User } from '../../models/User.model'
import { AppError } from '../../utils/AppError'

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401)
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyAccessToken(token) // throws JsonWebTokenError on invalid

  const user = await User.findById(payload.userId)
  if (!user) {
    throw new AppError('User no longer exists', 401)
  }

  req.user = user
  next()
}
