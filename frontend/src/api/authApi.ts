import axiosInstance from './axiosInstance'
import type { User } from '../types/user.types'
import type { ApiResponse } from '../types/api.types'

interface AuthData {
  user: User
  accessToken: string
}

export async function registerApi(payload: {
  name: string
  email: string
  password: string
}): Promise<ApiResponse<AuthData>> {
  const { data } = await axiosInstance.post<ApiResponse<AuthData>>(
    '/auth/register',
    payload
  )
  return data
}

export async function loginApi(payload: {
  email: string
  password: string
}): Promise<ApiResponse<AuthData>> {
  const { data } = await axiosInstance.post<ApiResponse<AuthData>>(
    '/auth/login',
    payload
  )
  return data
}

export async function logoutApi(): Promise<void> {
  await axiosInstance.post('/auth/logout')
}

export async function getMeApi(): Promise<ApiResponse<{ user: User }>> {
  const { data } = await axiosInstance.get<ApiResponse<{ user: User }>>(
    '/auth/me'
  )
  return data
}

export async function updateProfileApi(payload: {
  name?: string
  email?: string
}): Promise<ApiResponse<{ user: User }>> {
  const { data } = await axiosInstance.patch<ApiResponse<{ user: User }>>(
    '/auth/profile',
    payload
  )
  return data
}

export async function deleteAccountApi(): Promise<ApiResponse> {
  const { data } = await axiosInstance.delete<ApiResponse>('/auth/account')
  return data
}
