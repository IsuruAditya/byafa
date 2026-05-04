import axiosInstance from './axiosInstance'
import type { Order, ShippingAddress } from '../types/order.types'
import type { ApiResponse } from '../types/api.types'

export interface CreatePaymentIntentPayload {
  items: Array<{ productId: string; quantity: number }>
  shippingAddress: ShippingAddress
}

export interface PaymentIntentData {
  clientSecret: string
  totalAmount: number
}

export async function createPaymentIntentApi(
  payload: CreatePaymentIntentPayload
): Promise<ApiResponse<PaymentIntentData>> {
  const { data } = await axiosInstance.post<ApiResponse<PaymentIntentData>>(
    '/orders/create-payment-intent',
    payload
  )
  return data
}

export async function getMyOrdersApi(): Promise<ApiResponse<Order[]>> {
  const { data } = await axiosInstance.get<ApiResponse<Order[]>>('/orders')
  return data
}

export async function getMyOrderByIdApi(
  id: string
): Promise<ApiResponse<Order>> {
  const { data } = await axiosInstance.get<ApiResponse<Order>>(`/orders/${id}`)
  return data
}
