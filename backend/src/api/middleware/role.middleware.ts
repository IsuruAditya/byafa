import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../utils/AppError'

export function requireRole(...roles: Array<'customer' | 'admin'>) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    if (!_req.user) {
      throw new AppError('Authentication required', 401)
    }
    if (!roles.includes(_req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403)
    }
    next()
  }
}
