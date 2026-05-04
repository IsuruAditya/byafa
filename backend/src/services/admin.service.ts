import { Product } from '../models/Product.model'
import { Order } from '../models/Order.model'
import { User } from '../models/User.model'
import { AppError } from '../utils/AppError'
import { uploadProductImage, deleteProductImage } from './cloudinary.service'
import stripe from './stripe.service'
import { updateOrderStatus } from './order.service'
import { sendShippingNotificationEmail } from './email.service'
import type { OrderStatus } from '../models/Order.model'

// ── Product CRUD ────────────────────────────────────────────────────────────

export interface ProductInput {
  name: string
  description: string
  price: number
  category: string
  stockQuantity: number
  imageFiles?: Express.Multer.File[]
  existingImages?: string[] // URLs to keep from a previous upload
}

export async function createProduct(input: ProductInput) {
  const { name, description, price, category, stockQuantity, imageFiles = [], existingImages = [] } = input

  const uploadedUrls = await Promise.all(
    imageFiles.map((f) => uploadProductImage(f.buffer, f.originalname))
  )

  return Product.create({
    name,
    description,
    price,
    category: category.toLowerCase(),
    stockQuantity,
    images: [...existingImages, ...uploadedUrls],
  })
}

export async function updateProduct(
  productId: string,
  input: ProductInput
) {
  const { name, description, price, category, stockQuantity, imageFiles = [], existingImages = [] } = input

  const product = await Product.findById(productId)
  if (!product) throw new AppError('Product not found', 404)

  // Delete images that were removed
  const removedImages = product.images.filter((url) => !existingImages.includes(url))
  await Promise.all(removedImages.map(deleteProductImage))

  // Upload new images
  const uploadedUrls = await Promise.all(
    imageFiles.map((f) => uploadProductImage(f.buffer, f.originalname))
  )

  return Product.findByIdAndUpdate(
    productId,
    {
      name,
      description,
      price,
      category: category.toLowerCase(),
      stockQuantity,
      images: [...existingImages, ...uploadedUrls],
    },
    { new: true, runValidators: true }
  )
}

export async function deleteProduct(productId: string) {
  const product = await Product.findById(productId)
  if (!product) throw new AppError('Product not found', 404)

  // Clean up Cloudinary images
  await Promise.all(product.images.map(deleteProductImage))
  await Product.findByIdAndDelete(productId)
}

export async function updateInventory(productId: string, stockQuantity: number) {
  if (stockQuantity < 0) throw new AppError('Stock quantity cannot be negative', 400)

  const product = await Product.findByIdAndUpdate(
    productId,
    { stockQuantity },
    { new: true, runValidators: true }
  )
  if (!product) throw new AppError('Product not found', 404)
  return product
}

// ── Order Management ────────────────────────────────────────────────────────

export interface AdminOrderQuery {
  search?: string
  status?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export async function getAdminOrders(query: AdminOrderQuery) {
  const { search, status, from, to, page = 1, pageSize = 20 } = query

  const filter: Record<string, unknown> = {}

  if (status) filter['status'] = status

  if (from || to) {
    filter['createdAt'] = {
      ...(from && { $gte: new Date(from) }),
      ...(to   && { $lte: new Date(to) }),
    }
  }

  // Search by order ID (partial hex match) or customer email
  if (search?.trim()) {
    const users = await User.find({
      email: { $regex: search.trim(), $options: 'i' },
    }).select('_id')
    const userIds = users.map((u) => u._id)

    const isObjectId = /^[a-f\d]{24}$/i.test(search.trim())
    filter['$or'] = [
      ...(userIds.length ? [{ userId: { $in: userIds } }] : []),
      ...(isObjectId ? [{ _id: search.trim() }] : []),
    ]
  }

  const safePage     = Math.max(1, page)
  const safePageSize = Math.min(Math.max(1, pageSize), 100)
  const skip         = (safePage - 1) * safePageSize

  const [data, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safePageSize)
      .populate('userId', 'name email')
      .lean(),
    Order.countDocuments(filter),
  ])

  return {
    data,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.ceil(total / safePageSize),
    },
  }
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const order = await updateOrderStatus(orderId, status)

  // Trigger shipping email when status changes to shipped
  if (status === 'shipped') {
    const user = await User.findById(order.userId)
    if (user) {
      sendShippingNotificationEmail(user.email, user.name, order).catch((err) =>
        console.error('Failed to send shipping email:', err)
      )
    }
  }

  return order
}

export async function issueRefund(orderId: string) {
  const order = await Order.findById(orderId)
  if (!order) throw new AppError('Order not found', 404)

  if (!order.stripeChargeId) {
    throw new AppError('No charge ID found for this order — cannot refund', 400)
  }

  // Create Stripe refund
  await stripe.refunds.create({ charge: order.stripeChargeId })

  // Update order status to cancelled
  return updateOrderStatus(orderId, 'cancelled')
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [todayOrders, pendingOrders, recentOrders, revenueResult] =
    await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ status: 'pending' }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .lean(),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay },
            status: { $in: ['processing', 'shipped', 'delivered'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ])

  const todayRevenue: number =
    revenueResult[0] ? (revenueResult[0].total as number) : 0

  return {
    todayOrderCount: todayOrders,
    todayRevenue,
    pendingOrderCount: pendingOrders,
    recentOrders,
  }
}

export async function getRevenueSummary(from: string, to: string) {
  const fromDate = new Date(from)
  const toDate   = new Date(to)

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw new AppError('Invalid date range', 400)
  }

  const [result] = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: fromDate, $lte: toDate },
        status: { $in: ['processing', 'shipped', 'delivered'] },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue:    { $sum: '$totalAmount' },
        totalOrders:     { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' },
      },
    },
  ])

  return {
    totalRevenue:      result ? (result.totalRevenue as number)      : 0,
    totalOrders:       result ? (result.totalOrders as number)       : 0,
    averageOrderValue: result ? Math.round((result.averageOrderValue as number) * 100) / 100 : 0,
    from: fromDate.toISOString(),
    to:   toDate.toISOString(),
  }
}
