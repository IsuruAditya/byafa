import mongoose, { Document, Schema } from 'mongoose'

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  rating: number       // 1–5
  comment: string
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
)

// One review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true })
// Fetch all reviews for a product efficiently
reviewSchema.index({ productId: 1, createdAt: -1 })

export const Review = mongoose.model<IReview>('Review', reviewSchema)
