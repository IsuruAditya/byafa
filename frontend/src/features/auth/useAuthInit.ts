import { useEffect, useState } from 'react'
import { useAppDispatch } from '../../store/hooks'
import { setCredentials } from '../../store/slices/authSlice'
import { getMeApi } from '../../api/authApi'
import { store } from '../../store'
import axios from 'axios'

/**
 * Runs once on app mount. Calls GET /auth/me to rehydrate auth state.
 * Also merges any guest cart items into the authenticated session on login.
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
          const currentToken = store.getState().auth.accessToken ?? ''
          dispatch(
            setCredentials({
              user: res.data.user,
              accessToken: currentToken,
            })
          )
          // Guest cart is already in Redux/localStorage — no merge needed.
          // The cart persists across login automatically via localStorage rehydration.
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
    return () => {
      cancelled = true
    }
  }, [])

  return { isInitializing }
}
