import { Router } from 'express'
import { query } from 'express-validator'
import * as productController from '../controllers/product.controller'
import { validate } from '../middleware/validate.middleware'

const router = Router()

// GET /api/v1/products
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page must be a positive integer')
      .toInt(),
    query('pageSize')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('pageSize must be between 1 and 100')
      .toInt(),
    query('sortBy')
      .optional()
      .isIn(['price_asc', 'price_desc', 'newest', 'popularity'])
      .withMessage('sortBy must be one of: price_asc, price_desc, newest, popularity'),
    query('search')
      .optional()
      .isString()
      .trim()
      .escape(),
    query('category')
      .optional()
      .isString()
      .trim()
      .escape(),
  ],
  validate,
  productController.getCatalog
)

// GET /api/v1/products/:id
router.get('/:id', productController.getProductById)

export default router
