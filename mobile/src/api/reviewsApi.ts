import axiosInstance from './axiosInstance'
import type { Review } from '../types/review.types'
import type { ApiResponse } from '../types/api.types'

export async function getProductReviewsApi(
  productId: string
): Promise<ApiResponse<Review[]>> {
  const { data } = await axiosInstance.get<ApiResponse<Review[]>>(
    `/reviews/product/${productId}`
  )
  return data
}

export async function createReviewApi(payload: {
  productId: string
  orderId: string
  rating: number
  comment: string
}): Promise<ApiResponse<Review>> {
  const { data } = await axiosInstance.post<ApiResponse<Review>>(
    '/reviews',
    payload
  )
  return data
}
