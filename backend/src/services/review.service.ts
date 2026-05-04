import mongoose from 'mongoose'
import { Review } from '../models/Review.model'
import { Product } from '../models/Product.model'
import { Order } from '../models/Order.model'
import { AppError } from '../utils/AppError'

export interface CreateReviewInput {
  productId: string
  userId: string
  orderId: string
  rating: number
  comment: string
}

/**
 * Recalculates and persists the product's average rating and review count.
 * Called after every create/delete review operation.
 */
async function syncProductRatings(
  productId: string,
  session?: mongoose.ClientSession
): Promise<void> {
  const [result] = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ])

  const average = result ? Math.round((result.average as number) * 10) / 10 : 0
  const count = result ? (result.count as number) : 0

  await Product.findByIdAndUpdate(
    productId,
    { 'ratings.average': average, 'ratings.count': count },
    { session }
  )
}

export async function createReview(input: CreateReviewInput) {
  const { productId, userId, orderId, rating, comment } = input

  // Verify the order belongs to this user and contains the product
  const order = await Order.findOne({
    _id: orderId,
    userId,
    'items.productId': new mongoose.Types.ObjectId(productId),
  })

  if (!order) {
    throw new AppError(
      'You can only review products from your own orders',
      403
    )
  }

  // Check for duplicate review
  const existing = await Review.findOne({ productId, userId })
  if (existing) {
    throw new AppError('You have already reviewed this product', 409)
  }

  const review = await Review.create({
    productId,
    userId,
    orderId,
    rating,
    comment,
  })

  await syncProductRatings(productId)

  return review
}

export async function getReviewsByProduct(productId: string) {
  if (!productId.match(/^[a-f\d]{24}$/i)) {
    throw new AppError('Product not found', 404)
  }

  return Review.find({ productId })
    .sort({ createdAt: -1 })
    .populate('userId', 'name') // include reviewer name only
    .lean()
}
