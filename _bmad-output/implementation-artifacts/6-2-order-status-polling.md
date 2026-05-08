# Story 6.2: Order Status Polling

**Status:** done
**Epic:** 6 — Order Management (Customer)
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want my order status to update automatically while I'm viewing my order,
so that I can see when my order is being processed or shipped without refreshing.

## Acceptance Criteria

**AC1 — Polling endpoint:**
Given `GET /api/v1/orders/:id/status` is called
Then it returns `{ success: true, data: { status } }` — lightweight, no full order data

**AC2 — Frontend polling:**
Given I am on the order detail page
Then `useOrderStatusPolling` polls every 60 seconds
And if the returned status differs from current, `setOrder` is called to update the UI
And polling stops when status is `delivered` or `cancelled` (terminal states)
And polling stops when I navigate away (cleanup on unmount)

**AC3 — No unnecessary polls:**
Given the order is already in a terminal state when the page loads
Then no polling interval is started

## Tasks

- [x] `backend/src/api/controllers/order.controller.ts` — `getMyOrderStatus()`
- [x] `backend/src/api/routes/order.routes.ts` — `GET /:id/status`
- [x] `frontend/src/features/orders/useOrderStatusPolling.ts`

## Dev Notes

### useOrderStatusPolling
```ts
export function useOrderStatusPolling({ orderId, currentStatus, onStatusChange }) {
  const statusRef = useRef(currentStatus)
  useEffect(() => { statusRef.current = currentStatus }, [currentStatus])

  const poll = useCallback(async () => {
    const terminal = ['delivered', 'cancelled']
    if (terminal.includes(statusRef.current)) return
    const { data } = await axiosInstance.get(`/orders/${orderId}/status`)
    if (data.data.status !== statusRef.current) onStatusChange(data.data.status)
  }, [orderId, onStatusChange])

  useEffect(() => {
    const terminal = ['delivered', 'cancelled']
    if (terminal.includes(currentStatus)) return
    const interval = setInterval(() => void poll(), 60_000)
    return () => clearInterval(interval)
  }, [currentStatus, poll])
}
```

### statusRef pattern
`useRef` keeps the latest status accessible inside the interval callback without
causing the interval to be recreated on every status change. This prevents the
"stale closure" problem where the interval always sees the initial status value.

### Polling interval: 60 seconds
Per architecture decision. Admin dashboard polls every 30s (different hook).

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `GET /:id/status` — lightweight endpoint, ownership check via `getOrderById()`
- ✅ `useOrderStatusPolling` — statusRef pattern, terminal state guard, cleanup on unmount
- ✅ Used in `OrderDetailPage` — `onStatusChange` updates local order state

### File List
- `backend/src/api/controllers/order.controller.ts` (getMyOrderStatus)
- `backend/src/api/routes/order.routes.ts`
- `frontend/src/features/orders/useOrderStatusPolling.ts`
