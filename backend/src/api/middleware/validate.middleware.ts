import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      // express-validator v7 uses 'path' instead of 'param'
      field: (e as { path?: string; param?: string }).path ?? (e as { path?: string; param?: string }).param ?? '',
      message: e.msg as string,
    }))
    // Pass as a plain object so error middleware can detect it
    const err = Object.assign(new Error('Validation failed'), {
      statusCode: 400,
      isValidation: true,
      errors: formatted,
    })
    return next(err)
  }
  next()
}
