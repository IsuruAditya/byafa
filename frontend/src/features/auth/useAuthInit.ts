import { useEffect, useState } from 'react'
import { useAppDispatch } from '../../store/hooks'
import { setCredentials, updateAccessToken } from '../../store/slices/authSlice'
import { getMeApi } from '../../api/authApi'
import { store } from '../../store'
import axios from 'axios'

/**
 * Runs once on app mount to rehydrate auth state from the server.
 *
 * Flow:
 * 1. If no access token in Redux, attempt a silent refresh via the httpOnly
 *    refresh cookie using a plain axios call (bypasses the interceptor to
 *    avoid retry loops).
 * 2. If refresh succeeds, store the new token and call GET /auth/me.
 * 3. If refresh fails (no valid session), mark init as done — user is logged out.
 */
export function useAuthInit() {
  const dispatch = useAppDispatch()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const currentToken = store.getState().auth.accessToken

        if (!currentToken) {
          // Use a plain axios instance — NOT the intercepted axiosInstance —
          // to avoid the response interceptor triggering another refresh on 401,
          // which would cause an infinite loop.
          try {
            const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'
            const { data } = await axios.post<{
              success: boolean
              data: { accessToken: string }
            }>(
              `${baseURL}/auth/refresh`,
              {},
              { withCredentials: true }
            )
            if (data.success && data.data?.accessToken) {
              dispatch(updateAccessToken(data.data.accessToken))
            } else {
              // Refresh returned success:false — no valid session
              return
            }
          } catch {
            // 401 or network error — no valid session, stay logged out
            return
          }
        }

        // We have a valid access token — fetch the user profile
        const res = await getMeApi()
        if (!cancelled && res.success && res.data) {
          const latestToken = store.getState().auth.accessToken ?? ''
          dispatch(setCredentials({ user: res.data.user, accessToken: latestToken }))
        }
      } catch (err) {
        if (!axios.isAxiosError(err) || err.response?.status !== 401) {
          console.error('Auth init error:', err)
        }
      } finally {
        if (!cancelled) setIsInitializing(false)
      }
    }

    void init()
    return () => { cancelled = true }
  }, [dispatch])

  return { isInitializing }
}
