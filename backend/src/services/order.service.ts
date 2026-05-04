import mongoose from 'mongoose'
import stripe from './stripe.service'
import { Product } from '../models/Product.model'
import { Order } from '../models/Order.model'
import type { IShippingAddress, IOrder } from '../models/Order.model'
import { AppError } from '../utils/AppError'

export interface CartItemInput {
  productId: string
  quantity: number
}

export interface CreatePaymentIntentInput {
  userId: string
  items: CartItemInput[]
  shippingAddress: IShippingAddress
}

export interface PaymentIntentResult {
  clientSecret: string
  totalAmount: number
}

/**
 * Validates stock for all cart items atomically, then creates a Stripe
 * Payment Intent. The order is NOT created here — it is created by the
 * webhook handler after payment succeeds (Story 5.3).
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<PaymentIntentResult> {
  const { userId, items, shippingAddress } = input

  // ── 1. Load all products in one query ──────────────────────────────────
  const productIds = items.map((i) => i.productId)
  const products = await Product.find({ _id: { $in: productIds } })

  if (products.length !== productIds.length) {
    throw new AppError('One or more products not found', 404)
  }

  // ── 2. Validate stock for each item ────────────────────────────────────
  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.productId)!
    if (product.stockQuantity < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${product.name}". Only ${product.stockQuantity} left.`,
        409
      )
    }
  }

  // ── 3. Calculate total (always from DB prices — never trust client) ────
  const totalCents = items.reduce((sum, item) => {
    const product = products.find((p) => p._id.toString() === item.productId)!
    return sum + Math.round(product.price * 100) * item.quantity
  }, 0)

  // ── 4. Build metadata for the webhook to reconstruct the order ─────────
  const orderMetadata = {
    userId,
    shippingAddress: JSON.stringify(shippingAddress),
    items: JSON.stringify(
      items.map((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId
        )!
        return {
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images[0] ?? '',
        }
      })
    ),
  }

  // ── 5. Create Stripe Payment Intent ────────────────────────────────────
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'usd',
    metadata: orderMetadata,
    automatic_payment_methods: { enabled: true },
  })

  if (!paymentIntent.client_secret) {
    throw new AppError('Failed to create payment intent', 500)
  }

  return {
    clientSecret: paymentIntent.client_secret,
    totalAmount: totalCents / 100,
  }
}

/**
 * Creates an Order document and atomically decrements stock.
 * Called exclusively by the Stripe webhook handler (Story 5.3).
 * Idempotent — if an order with this paymentIntentId already exists, returns it.
 */
export async function createOrderFromWebhook(
  paymentIntentId: string,
  chargeId: string | null,
  metadata: Record<string, string>
): Promise<IOrder> {
  // Idempotency check — duplicate webhook delivery
  const existing = await Order.findOne({
    stripePaymentIntentId: paymentIntentId,
  })
  if (existing) return existing

  const userId = metadata['userId']
  const shippingAddress = JSON.parse(
    metadata['shippingAddress'] ?? '{}'
  ) as IShippingAddress
  const items = JSON.parse(metadata['items'] ?? '[]') as Array<{
    productId: string
    name: string
    price: number
    quantity: number
    image: string
  }>

  const totalAmount = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  )

  // Use a session for atomic order creation + stock decrement
  const session = await mongoose.startSession()
  let order: IOrder

  try {
    await session.withTransaction(async () => {
      // Decrement stock atomically for each item
      for (const item of items) {
        const result = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            stockQuantity: { $gte: item.quantity }, // guard against oversell
          },
          { $inc: { stockQuantity: -item.quantity } },
          { session, new: true }
        )

        if (!result) {
          throw new AppError(
            `Stock no longer available for product ${item.productId}`,
            409
          )
        }
      }

      // Create the order
      const [created] = await Order.create(
        [
          {
            userId,
            items: items.map((i) => ({
              productId: i.productId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              image: i.image,
            })),
            shippingAddress,
            totalAmount,
            status: 'processing',
            stripePaymentIntentId: paymentIntentId,
            ...(chargeId && { stripeChargeId: chargeId }),
          },
        ],
        { session }
      )

      order = created
    })
  } finally {
    await session.endSession()
  }

  return order!
}

export async function getOrdersByUser(userId: string): Promise<IOrder[]> {
  return Order.find({ userId }).sort({ createdAt: -1 }).lean() as Promise<IOrder[]>
}

export async function getOrderById(
  orderId: string,
  userId: string
): Promise<IOrder> {
  if (!orderId.match(/^[a-f\d]{24}$/i)) {
    throw new AppError('Order not found', 404)
  }

  const order = await Order.findOne({ _id: orderId, userId }).lean()
  if (!order) throw new AppError('Order not found', 404)

  return order as unknown as IOrder
}

/**
 * Updates order status — used by admin endpoints (Epic 8).
 * Returns the updated order so the caller can trigger emails if needed.
 */
export async function updateOrderStatus(
  orderId: string,
  status: import('../models/Order.model').OrderStatus
): Promise<IOrder> {
  if (!orderId.match(/^[a-f\d]{24}$/i)) {
    throw new AppError('Order not found', 404)
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  )

  if (!order) throw new AppError('Order not found', 404)
  return order
}
