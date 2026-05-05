import { useEffect, useRef, useCallback } from 'react'
import { adminGetDashboardApi, type DashboardStats } from '../../api/adminApi'

const POLL_INTERVAL_MS = 30_000 // 30 seconds per architecture spec

interface UseAdminPollingOptions {
  onNewOrder?: (stats: DashboardStats) => void
  onError?: (error: unknown) => void
  enabled?: boolean
}

/**
 * Polls GET /admin/dashboard every 30 seconds.
 * Calls onNewOrder when the today's order count increases between polls.
 * Stops automatically when the component unmounts.
 *
 * Returns a manual `refresh` function for immediate re-fetch.
 */
export function useAdminPolling({
  onNewOrder,
  onError,
  enabled = true,
}: UseAdminPollingOptions = {}) {
  const prevOrderCountRef = useRef<number | null>(null)

  const poll = useCallback(async () => {
    try {
      const res = await adminGetDashboardApi()
      if (!res.success || !res.data) return

      const stats = res.data

      // Detect new orders between polls
      if (
        onNewOrder &&
        prevOrderCountRef.current !== null &&
        stats.todayOrderCount > prevOrderCountRef.current
      ) {
        onNewOrder(stats)
      }

      prevOrderCountRef.current = stats.todayOrderCount
      return stats
    } catch (error) {
      onError?.(error)
    }
  }, [onNewOrder, onError])

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => void poll(), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [enabled, poll])

  return { refresh: poll }
}
