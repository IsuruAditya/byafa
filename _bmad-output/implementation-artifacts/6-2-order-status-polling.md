# Story 6.2: Order Status Polling

**Status:** done
**Epic:** 6 — Order Management (Customer)
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want my order status to update automatically while I'm viewing my order,
so that I can see when my order is being processed or shipped without refreshing.

## Acceptance Criteria

**AC1 — Polling behavior:**
Given I am on the order detail page
When the page is open
Then `GET /api/v1/orders/:id/status` is polled every 60 seconds
And the displayed status updates if the server returns a new status

**AC2 — Cleanup on unmount:**
Given I navigate away from the order detail page
When the component unmounts
Then the polling interval is cleared (no memory leaks)

**AC3 — Status endpoint:**
Given `GET /api/v1/orders/:id/status` is called
When the request is processed
Then it returns `{ success: true, data: { status } }` with the current order status

## Tasks

- [x] `backend/src/api/routes/order.routes.ts` — `GET /api/v1/orders/:id/status`
- [x] `backend/src/api/controllers/order.controller.ts` — `getOrderStatus()` handler
- [x] `frontend/src/features/orders/useOrderStatusPolling.ts` — polling hook

## Dev Notes

### Architecture references
- Polling interval: `setInterval(fetchStatus, 60_000)` in `useEffect`
- Cleanup: return `() => clearInterval(intervalId)` from useEffect
- Status endpoint: lightweight query, only returns `{ status }` field
- Update condition: only update local state if status has changed

### Key files
- `frontend/src/features/orders/useOrderStatusPolling.ts` — custom hook
- `backend/src/api/routes/order.routes.ts` — status endpoint

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ useOrderStatusPolling hook with 60s interval
- ✅ Cleanup on unmount via useEffect return
- ✅ Status-only endpoint for lightweight polling
- ✅ Local state updated only when status changes

### File List
- `backend/src/api/controllers/order.controller.ts`
- `backend/src/api/routes/order.routes.ts`
- `frontend/src/features/orders/useOrderStatusPolling.ts`
