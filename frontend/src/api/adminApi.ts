import axiosInstance from './axiosInstance'
import type { Product } from '../types/product.types'
import type { Order, OrderStatus } from '../types/order.types'
import type { ApiResponse, PaginatedResponse } from '../types/api.types'

// ── Products ─────────────────────────────────────────────────────────────────

export interface AdminProductParams {
  search?: string
  category?: string
  page?: number
  pageSize?: number
}

export async function adminGetProductsApi(
  params: AdminProductParams = {}
): Promise<PaginatedResponse<Product>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Product>>(
    '/admin/products',
    { params }
  )
  return data
}

export async function adminCreateProductApi(
  formData: FormData
): Promise<ApiResponse<Product>> {
  const { data } = await axiosInstance.post<ApiResponse<Product>>(
    '/admin/products',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

export async function adminUpdateProductApi(
  id: string,
  formData: FormData
): Promise<ApiResponse<Product>> {
  const { data } = await axiosInstance.put<ApiResponse<Product>>(
    `/admin/products/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

export async function adminDeleteProductApi(id: string): Promise<ApiResponse> {
  const { data } = await axiosInstance.delete<ApiResponse>(`/admin/products/${id}`)
  return data
}

export async function adminUpdateInventoryApi(
  id: string,
  stockQuantity: number
): Promise<ApiResponse<Product>> {
  const { data } = await axiosInstance.patch<ApiResponse<Product>>(
    `/admin/products/${id}/inventory`,
    { stockQuantity }
  )
  return data
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface AdminOrderParams {
  search?: string
  status?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export async function adminGetOrderByIdApi(id: string): Promise<ApiResponse<Order>> {
  const { data } = await axiosInstance.get<ApiResponse<Order>>(`/admin/orders/${id}`)
  return data
}

export async function adminGetOrdersApi(
  params: AdminOrderParams
): Promise<PaginatedResponse<Order>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Order>>(
    '/admin/orders',
    { params }
  )
  return data
}

export async function adminUpdateOrderStatusApi(
  id: string,
  status: OrderStatus
): Promise<ApiResponse<Order>> {
  const { data } = await axiosInstance.patch<ApiResponse<Order>>(
    `/admin/orders/${id}/status`,
    { status }
  )
  return data
}

export async function adminIssueRefundApi(
  id: string
): Promise<ApiResponse<Order>> {
  const { data } = await axiosInstance.post<ApiResponse<Order>>(
    `/admin/orders/${id}/refund`
  )
  return data
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  todayOrderCount: number
  todayRevenue: number
  pendingOrderCount: number
  recentOrders: Order[]
}

export async function adminGetDashboardApi(): Promise<ApiResponse<DashboardStats>> {
  const { data } = await axiosInstance.get<ApiResponse<DashboardStats>>(
    '/admin/dashboard'
  )
  return data
}

export interface RevenueSummary {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  from: string
  to: string
}

export async function adminGetRevenueSummaryApi(
  from: string,
  to: string
): Promise<ApiResponse<RevenueSummary>> {
  const { data } = await axiosInstance.get<ApiResponse<RevenueSummary>>(
    '/admin/summary',
    { params: { from, to } }
  )
  return data
}
