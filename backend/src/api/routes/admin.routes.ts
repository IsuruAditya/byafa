import { Router } from 'express'
import { body, query } from 'express-validator'
import multer from 'multer'
import * as adminController from '../controllers/admin.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { validate } from '../middleware/validate.middleware'

const router = Router()

// All admin routes require a valid JWT AND admin role
router.use(authMiddleware, requireRole('admin'))

// Multer — store uploads in memory (passed to Cloudinary as buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

// ── Products ─────────────────────────────────────────────────────────────────

// GET /api/v1/admin/ping — smoke test
router.get('/ping', (_req, res) => {
  res.json({ success: true, message: 'Admin access confirmed' })
})

// POST /api/v1/admin/products
router.post(
  '/products',
  upload.array('images', 5),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('stockQuantity').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  validate,
  adminController.createProduct
)

// PUT /api/v1/admin/products/:id
router.put(
  '/products/:id',
  upload.array('images', 5),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('stockQuantity').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  validate,
  adminController.updateProduct
)

// DELETE /api/v1/admin/products/:id
router.delete('/products/:id', adminController.deleteProduct)

// PATCH /api/v1/admin/products/:id/inventory
router.patch(
  '/products/:id/inventory',
  [
    body('stockQuantity')
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
  ],
  validate,
  adminController.updateInventory
)

// ── Orders ────────────────────────────────────────────────────────────────────

// GET /api/v1/admin/orders/:id — single order detail
router.get('/orders/:id', adminController.getAdminOrderById)

// GET /api/v1/admin/orders
router.get(
  '/orders',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  ],
  validate,
  adminController.getAdminOrders
)

// PATCH /api/v1/admin/orders/:id/status
router.patch(
  '/orders/:id/status',
  [
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status value'),
  ],
  validate,
  adminController.updateOrderStatus
)

// POST /api/v1/admin/orders/:id/refund
router.post('/orders/:id/refund', adminController.issueRefund)

// ── Dashboard ─────────────────────────────────────────────────────────────────

// GET /api/v1/admin/dashboard
router.get('/dashboard', adminController.getDashboard)

// GET /api/v1/admin/summary?from=&to=
router.get(
  '/summary',
  [
    query('from').notEmpty().withMessage('from date is required'),
    query('to').notEmpty().withMessage('to date is required'),
  ],
  validate,
  adminController.getRevenueSummary
)

export default router
