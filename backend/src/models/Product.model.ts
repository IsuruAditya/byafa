import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stockQuantity: number
  ratings: {
    average: number
    count: number
  }
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
)

// Indexes for catalog queries
productSchema.index({ name: 'text', description: 'text' }) // full-text search
productSchema.index({ category: 1 })                       // category filter
productSchema.index({ price: 1 })                          // price sort
productSchema.index({ 'ratings.average': -1 })             // popularity sort
productSchema.index({ createdAt: -1 })                     // newest sort

export const Product = mongoose.model<IProduct>('Product', productSchema)
