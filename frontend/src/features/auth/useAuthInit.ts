import { useEffect, useState } from 'react'
import { useAppDispatch } from '../../store/hooks'
import { setCredentials, updateAccessToken } from '../../store/slices/authSlice'
import { getMeApi } from '../../api/authApi'
import axiosInstance from '../../api/axiosInstance'
import { store } from '../../store'
import axios from 'axios'

/**
 * Runs once on app mount to rehydrate auth state from the server.
 *
 * Flow:
 * 1. Call GET /auth/me with the current access token (empty on hard refresh)
 * 2. If 401, the Axios interceptor automatically calls POST /auth/refresh
 *    using the httpOnly refresh token cookie, gets a new access token,
 *    updates Redux, and retries the /me request
 * 3. If refresh also fails (no valid session), user stays logged out
 *
 * This prevents the ProtectedRoute from flashing the login page for
 * authenticated users on hard refresh.
 */
export function useAuthInit() {
  const dispatch = useAppDispatch()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // Attempt to get a fresh access token via the refresh cookie first.
        // This ensures we always have a valid token even after a hard refresh
        // where the Redux store is empty.
        const currentToken = store.getState().auth.accessToken
        if (!currentToken) {
          try {
            const { data } = await axiosInstance.post<{
              success: boolean
              data: { accessToken: string }
            }>('/auth/refresh')
            if (data.success && data.data.accessToken) {
              dispatch(updateAccessToken(data.data.accessToken))
            }
          } catch {
            // No valid refresh token — user is not authenticated
            return
          }
        }

        const res = await getMeApi()
        if (!cancelled && res.success && res.data) {
          const latestToken = store.getState().auth.accessToken ?? ''
          dispatch(
            setCredentials({
              user: res.data.user,
              accessToken: latestToken,
            })
          )
        }
      } catch (err) {
        if (!axios.isAxiosError(err) || err.response?.status !== 401) {
          console.error('Auth init error:', err)
        }
        // 401 means no valid session — user stays logged out, which is correct
      } finally {
        if (!cancelled) setIsInitializing(false)
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [dispatch])

  return { isInitializing }
}
