/**
 * Shared TypeScript types for the backend.
 * Domain-specific types live in their respective model files.
 * This file exports cross-cutting types used across multiple modules.
 */

/** Standard API success response shape */
export interface ApiSuccessResponse<T = undefined> {
  success: true
  message?: string
  data?: T
}

/** Standard API error response shape */
export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Array<{ field: string; message: string }>
}

export type ApiResponse<T = undefined> = ApiSuccessResponse<T> | ApiErrorResponse

/** Pagination metadata returned with list endpoints */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** Standard paginated response shape */
export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: PaginationMeta
}

/** JWT token payload stored in access tokens */
export interface TokenPayload {
  userId: string
  role: 'customer' | 'admin'
}
