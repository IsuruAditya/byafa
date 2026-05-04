import { Router } from 'express'
import { body } from 'express-validator'
import * as reviewController from '../controllers/review.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'

const router = Router()

// GET /api/v1/reviews/product/:productId  — public
router.get('/product/:productId', reviewController.getProductReviews)

// POST /api/v1/reviews  — authenticated customers only
router.post(
  '/',
  authMiddleware,
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('orderId').isMongoId().withMessage('Valid orderId is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Comment must be between 10 and 1000 characters'),
  ],
  validate,
  reviewController.createReview
)

export default router
