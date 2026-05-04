import { Router } from 'express'
import { body } from 'express-validator'
import * as orderController from '../controllers/order.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'

const router = Router()

// All order routes require authentication
router.use(authMiddleware)

// POST /api/v1/orders/create-payment-intent
router.post(
  '/create-payment-intent',
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('items must be a non-empty array'),
    body('items.*.productId')
      .isMongoId()
      .withMessage('Each item must have a valid productId'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Each item quantity must be at least 1'),
    body('shippingAddress.fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),
    body('shippingAddress.addressLine1')
      .trim()
      .notEmpty()
      .withMessage('Address line 1 is required'),
    body('shippingAddress.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('shippingAddress.state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    body('shippingAddress.postalCode')
      .trim()
      .notEmpty()
      .withMessage('Postal code is required'),
    body('shippingAddress.country')
      .trim()
      .notEmpty()
      .withMessage('Country is required'),
  ],
  validate,
  orderController.createPaymentIntent
)

// GET /api/v1/orders
router.get('/', orderController.getMyOrders)

// GET /api/v1/orders/:id
router.get('/:id', orderController.getMyOrderById)

// GET /api/v1/orders/:id/status  — lightweight polling endpoint
router.get('/:id/status', orderController.getMyOrderStatus)

export default router
