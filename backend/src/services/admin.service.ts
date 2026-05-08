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

export interface AdminProductQuery {
  search?: string
  category?: string
  page?: number
  pageSize?: number
}

export async function getAdminProducts(query: AdminProductQuery) {
  const { search, category, page = 1, pageSize = 20 } = query

  const filter: Record<string, unknown> = {}

  if (search?.trim()) {
    filter.$text = { $search: search.trim() }
  }

  if (category?.trim()) {
    filter.category = category.trim().toLowerCase()
  }

  const safePage     = Math.max(1, page)
  const safePageSize = Math.min(Math.max(1, pageSize), 100)
  const skip         = (safePage - 1) * safePageSize

  const [data, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safePageSize)
      .lean(),
    Product.countDocuments(filter),
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

export interface ProductInput {
  name: string
  description: string
  price: number
  costPrice?: number
  category: string
  stockQuantity: number
  lowStockThreshold?: number
  imageFiles?: Express.Multer.File[]
  existingImages?: string[] // URLs to keep from a previous upload
}

export async function createProduct(input: ProductInput) {
  const { name, description, price, costPrice = 0, category, stockQuantity, lowStockThreshold = 5, imageFiles = [], existingImages = [] } = input

  const uploadedUrls = await Promise.all(
    imageFiles.map((f) => uploadProductImage(f.buffer, f.originalname))
  )

  return Product.create({
    name,
    description,
    price,
    costPrice,
    category: category.toLowerCase(),
    stockQuantity,
    lowStockThreshold,
    images: [...existingImages, ...uploadedUrls],
  })
}

export async function updateProduct(
  productId: string,
  input: ProductInput
) {
  const { name, description, price, costPrice = 0, category, stockQuantity, lowStockThreshold = 5, imageFiles = [], existingImages = [] } = input

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
      costPrice,
      category: category.toLowerCase(),
      stockQuantity,
      lowStockThreshold,
      images: [...existingImages, ...uploadedUrls],
    },
    { returnDocument: 'after', runValidators: true }
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
    { returnDocument: 'after', runValidators: true }
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

export async function getAdminOrderById(orderId: string) {
  if (!orderId.match(/^[a-f\d]{24}$/i)) {
    throw new AppError('Order not found', 404)
  }
  const order = await Order.findById(orderId)
    .populate('userId', 'name email')
    .lean()
  if (!order) throw new AppError('Order not found', 404)
  return order
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
        totalRevenue:      { $sum: '$totalAmount' },
        totalOrders:       { $sum: 1 },
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

// ── Inventory Overview ──────────────────────────────────────────────────────

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface InventoryItem {
  _id: string
  name: string
  category: string
  price: number
  costPrice: number
  stockQuantity: number
  lowStockThreshold: number
  images: string[]
  status: StockStatus
}

export async function getInventoryOverview() {
  const products = await Product.find()
    .select('name category price costPrice stockQuantity lowStockThreshold images')
    .sort({ stockQuantity: 1 })
    .lean()

  const items: InventoryItem[] = products.map((p) => {
    let status: StockStatus = 'in_stock'
    if (p.stockQuantity === 0) status = 'out_of_stock'
    else if (p.stockQuantity <= (p.lowStockThreshold ?? 5)) status = 'low_stock'

    return {
      _id: (p._id as { toString(): string }).toString(),
      name: p.name,
      category: p.category,
      price: p.price,
      costPrice: p.costPrice ?? 0,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold ?? 5,
      images: p.images,
      status,
    }
  })

  const outOfStock = items.filter((i) => i.status === 'out_of_stock').length
  const lowStock   = items.filter((i) => i.status === 'low_stock').length
  const inStock    = items.filter((i) => i.status === 'in_stock').length
  const totalUnits = items.reduce((s, i) => s + i.stockQuantity, 0)
  const totalValue = items.reduce((s, i) => s + i.stockQuantity * i.costPrice, 0)

  return { items, summary: { outOfStock, lowStock, inStock, totalUnits, totalValue } }
}

export async function adjustStock(
  productId: string,
  adjustment: number,
  note?: string
) {
  void note // reserved for future stock-movement log
  const product = await Product.findById(productId)
  if (!product) throw new AppError('Product not found', 404)

  const newQty = product.stockQuantity + adjustment
  if (newQty < 0) throw new AppError('Adjustment would result in negative stock', 400)

  return Product.findByIdAndUpdate(
    productId,
    { stockQuantity: newQty },
    { returnDocument: 'after', runValidators: true }
  )
}

// ── Customers ───────────────────────────────────────────────────────────────

export interface CustomerQuery {
  search?: string
  page?: number
  pageSize?: number
}

export async function getCustomers(query: CustomerQuery) {
  const { search, page = 1, pageSize = 20 } = query

  const filter: Record<string, unknown> = { role: 'customer' }
  if (search?.trim()) {
    filter['$or'] = [
      { name:  { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
    ]
  }

  const safePage     = Math.max(1, page)
  const safePageSize = Math.min(Math.max(1, pageSize), 100)
  const skip         = (safePage - 1) * safePageSize

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safePageSize)
      .lean(),
    User.countDocuments(filter),
  ])

  // Enrich with order stats per customer
  const userIds = users.map((u) => u._id)
  const orderStats = await Order.aggregate([
    { $match: { userId: { $in: userIds }, status: { $in: ['processing', 'shipped', 'delivered'] } } },
    { $group: { _id: '$userId', orderCount: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
  ])

  const statsMap = new Map(
    orderStats.map((s) => [s._id.toString(), { orderCount: s.orderCount as number, totalSpent: s.totalSpent as number }])
  )

  const data = users.map((u) => {
    const stats = statsMap.get((u._id as { toString(): string }).toString()) ?? { orderCount: 0, totalSpent: 0 }
    return {
      _id: (u._id as { toString(): string }).toString(),
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      orderCount: stats.orderCount,
      totalSpent: stats.totalSpent,
    }
  })

  return {
    data,
    pagination: { page: safePage, pageSize: safePageSize, total, totalPages: Math.ceil(total / safePageSize) },
  }
}

// ── Analytics ───────────────────────────────────────────────────────────────

export async function getAnalytics(from: string, to: string) {
  const fromDate = new Date(from)
  const toDate   = new Date(to)

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw new AppError('Invalid date range', 400)
  }

  const matchPaid = {
    createdAt: { $gte: fromDate, $lte: toDate },
    status: { $in: ['processing', 'shipped', 'delivered'] },
  }

  const [topProducts, ordersByStatus, revenueByDay] = await Promise.all([
    // Top 10 products by revenue in period
    Order.aggregate([
      { $match: matchPaid },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name:        { $first: '$items.name' },
          image:       { $first: '$items.image' },
          unitsSold:   { $sum: '$items.quantity' },
          revenue:     { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),

    // Orders grouped by status
    Order.aggregate([
      { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Daily revenue for the period
    Order.aggregate([
      { $match: matchPaid },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ])

  return {
    topProducts: topProducts as Array<{ _id: string; name: string; image: string; unitsSold: number; revenue: number }>,
    ordersByStatus: ordersByStatus as Array<{ _id: string; count: number }>,
    revenueByDay: revenueByDay as Array<{ _id: string; revenue: number; orders: number }>,
  }
}
