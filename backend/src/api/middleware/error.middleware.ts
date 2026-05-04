import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../utils/AppError'

interface ValidationError {
  field: string
  message: string
}

interface ExtendedError extends Error {
  statusCode?: number
  isValidation?: boolean
  errors?: ValidationError[]
}

export const errorMiddleware = (
  err: ExtendedError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Validation errors from validate.middleware
  if (err.isValidation) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    })
    return
  }

  // Operational errors (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
    return
  }

  // Mongoose duplicate key
  if ((err as NodeJS.ErrnoException).code === '11000') {
    res.status(409).json({
      success: false,
      message: 'A record with that value already exists',
    })
    return
  }

  // Unhandled errors — never expose stack in production
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}
