export interface Review {
  _id: string
  productId: string
  userId: { _id: string; name: string } | string
  orderId: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}
