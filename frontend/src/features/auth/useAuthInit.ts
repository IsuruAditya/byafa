import { useEffect, useState } from 'react'
import { useAppDispatch } from '../../store/hooks'
import { setCredentials } from '../../store/slices/authSlice'
import { getMeApi } from '../../api/authApi'
import { store } from '../../store'
import axios from 'axios'

/**
 * Runs once on app mount. Calls GET /auth/me to rehydrate auth state.
 *
 * Flow:
 *  1. GET /auth/me — Axios attaches access token from Redux if present
 *  2. If 401 → Axios interceptor calls POST /auth/refresh via httpOnly cookie,
 *     stores the new access token in Redux via updateAccessToken, retries /me
 *  3. If refresh also fails → interceptor dispatches logout(), user stays logged out
 *  4. `isInitializing` stays true until the check settles, preventing a flash
 *     of unauthenticated UI on reload
 */
export function useAuthInit() {
  const dispatch = useAppDispatch()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const res = await getMeApi()
        if (!cancelled && res.success && res.data) {
          // Read the token from the store at this moment — the interceptor may
          // have already called updateAccessToken with a refreshed token by now
          const currentToken = store.getState().auth.accessToken ?? ''
          dispatch(
            setCredentials({
              user: res.data.user,
              accessToken: currentToken,
            })
          )
        }
      } catch (err) {
        // 401 after failed refresh → interceptor already dispatched logout()
        // Any other network error → stay logged out silently
        if (!axios.isAxiosError(err) || err.response?.status !== 401) {
          console.error('Auth init error:', err)
        }
      } finally {
        if (!cancelled) setIsInitializing(false)
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, []) // run once on mount only — dispatch is stable

  return { isInitializing }
}
