import mongoose, { Document, Schema } from 'mongoose'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface IOrderItem {
  productId: mongoose.Types.ObjectId
  name: string
  price: number       // price snapshot at time of order
  quantity: number
  image: string
}

export interface IShippingAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId
  items: IOrderItem[]
  shippingAddress: IShippingAddress
  totalAmount: number
  status: OrderStatus
  stripePaymentIntentId: string
  stripeChargeId?: string
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name:     { type: String, required: true },
    price:    { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image:    { type: String, default: '' },
  },
  { _id: false } // sub-documents don't need their own _id
)

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName:     { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city:         { type: String, required: true, trim: true },
    state:        { type: String, required: true, trim: true },
    postalCode:   { type: String, required: true, trim: true },
    country:      { type: String, required: true, trim: true },
  },
  { _id: false }
)

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true, // idempotency — prevents duplicate orders from duplicate webhooks
    },
    stripeChargeId: {
      type: String,
    },
  },
  { timestamps: true }
)

// Indexes for order queries
orderSchema.index({ userId: 1, createdAt: -1 }) // customer order history
orderSchema.index({ status: 1, createdAt: -1 }) // admin order management
orderSchema.index({ createdAt: -1 })             // recent orders polling

export const Order = mongoose.model<IOrder>('Order', orderSchema)
