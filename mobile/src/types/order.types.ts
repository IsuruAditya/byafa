export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface ShippingAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface Order {
  _id: string
  userId: string
  items: OrderItem[]
  shippingAddress: ShippingAddress
  totalAmount: number
  status: OrderStatus
  stripePaymentIntentId: string
  stripeChargeId?: string
  createdAt: string
  updatedAt: string
}
