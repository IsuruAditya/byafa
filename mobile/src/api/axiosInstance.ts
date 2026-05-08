import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { store } from '../store'
import { updateAccessToken, logout } from '../store/slices/authSlice'

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach access token from Redux auth state
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Track whether a refresh is already in flight
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processPendingQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  pendingQueue = []
}

// Response interceptor — attempt token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Never retry the refresh endpoint itself — prevents infinite loop
    if (originalRequest.url?.includes('/auth/refresh')) {
      store.dispatch(logout())
      await SecureStore.deleteItemAsync('refreshToken')
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosInstance(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // On mobile, refresh token is stored in SecureStore (not cookies)
      const refreshToken = await SecureStore.getItemAsync('refreshToken')
      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axiosInstance.post<{
        success: boolean
        data: { accessToken: string }
      }>('/auth/refresh', { refreshToken })

      const newToken = data.data.accessToken
      store.dispatch(updateAccessToken(newToken))
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      processPendingQueue(null, newToken)
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processPendingQueue(refreshError, null)
      await SecureStore.deleteItemAsync('refreshToken')
      store.dispatch(logout())
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance
