import { useEffect, useRef, useCallback } from 'react'
import axiosInstance from '../../api/axiosInstance'
import type { OrderStatus } from '../../types/order.types'

const POLL_INTERVAL_MS = 60_000 // 60 seconds per architecture spec

interface UseOrderStatusPollingOptions {
  orderId: string
  currentStatus: OrderStatus
  onStatusChange: (newStatus: OrderStatus) => void
}

/**
 * Polls GET /orders/:id/status every 60 seconds.
 * Stops automatically when the order reaches a terminal state
 * (delivered or cancelled) — no point polling further.
 */
export function useOrderStatusPolling({
  orderId,
  currentStatus,
  onStatusChange,
}: UseOrderStatusPollingOptions) {
  const statusRef = useRef(currentStatus)

  // Keep ref in sync so the interval closure always sees the latest status
  useEffect(() => {
    statusRef.current = currentStatus
  }, [currentStatus])

  const poll = useCallback(async () => {
    const terminal: OrderStatus[] = ['delivered', 'cancelled']
    if (terminal.includes(statusRef.current)) return

    try {
      const { data } = await axiosInstance.get<{
        success: boolean
        data: { status: OrderStatus }
      }>(`/orders/${orderId}/status`)

      if (data.success && data.data.status !== statusRef.current) {
        onStatusChange(data.data.status)
      }
    } catch {
      // Non-critical — silently skip failed polls
    }
  }, [orderId, onStatusChange])

  useEffect(() => {
    const terminal: OrderStatus[] = ['delivered', 'cancelled']
    if (terminal.includes(currentStatus)) return

    const interval = setInterval(() => void poll(), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [currentStatus, poll])
}
