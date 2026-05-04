import { Router } from 'express'
import { body } from 'express-validator'
import * as authController from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'

const router = Router()

// POST /api/v1/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,
  authController.register
)

// POST /api/v1/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
)

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh)

// POST /api/v1/auth/logout
router.post('/logout', authController.logout)

// GET /api/v1/auth/me  (protected)
router.get('/me', authMiddleware, authController.getMe)

// PATCH /api/v1/auth/profile  (protected)
router.patch(
  '/profile',
  authMiddleware,
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
  ],
  validate,
  authController.updateProfile
)

// DELETE /api/v1/auth/account  (protected)
router.delete('/account', authMiddleware, authController.deleteAccount)

export default router
