import axios from 'axios'
import { store } from '../store'
import { updateAccessToken, logout } from '../store/slices/authSlice'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: true, // sends httpOnly refresh token cookie automatically
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

// Track whether a refresh is already in flight to avoid parallel refresh calls
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

// Response interceptor — attempt token refresh on 401, then retry original request
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
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
      // Refresh token is sent automatically via httpOnly cookie
      const { data } = await axiosInstance.post<{ accessToken: string }>(
        '/auth/refresh'
      )
      const newToken = data.accessToken
      store.dispatch(updateAccessToken(newToken))
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      processPendingQueue(null, newToken)
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processPendingQueue(refreshError, null)
      const wasAuthenticated = store.getState().auth.isAuthenticated
      store.dispatch(logout())
      // Only hard-redirect to login if the user had an active session.
      // During the initial auth-init check the user is not yet authenticated,
      // so we must NOT redirect — the app hasn't rendered yet.
      if (wasAuthenticated) {
        window.location.href = '/login'
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance
