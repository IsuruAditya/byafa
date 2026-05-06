import axiosInstance from './axiosInstance'
import type { Product, SortOption } from '../types/product.types'
import type { PaginatedResponse, ApiResponse } from '../types/api.types'

export interface CatalogParams {
  search?: string
  category?: string
  sortBy?: SortOption
  page?: number
  pageSize?: number
}

export async function getProductsApi(
  params: CatalogParams
): Promise<PaginatedResponse<Product>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Product>>(
    '/products',
    { params }
  )
  return data
}

export async function getProductByIdApi(id: string): Promise<ApiResponse<Product>> {
  const { data } = await axiosInstance.get<ApiResponse<Product>>(`/products/${id}`)
  return data
}
