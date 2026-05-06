# Story 8.5: Admin Dashboard with Polling

**Status:** done
**Epic:** 8 — Admin Dashboard & Store Management
**Project context:** `_bmad-output/project-context.md`

## Story

As an admin,
I want a dashboard showing today's orders, revenue, and pending fulfillments that updates automatically,
so that I can monitor store activity in real time.

## Acceptance Criteria

**AC1 — Dashboard metrics:**
Given I am logged in as admin and on the dashboard
When the page loads
Then `GET /api/v1/admin/dashboard` returns: today's order count, today's revenue, pending order count, and recent orders (last 5)
And these metrics are displayed prominently

**AC2 — Auto-refresh polling:**
Given I am on the dashboard
When 30 seconds have elapsed
Then the dashboard data is automatically refreshed
And polling stops when I navigate away

**AC3 — New order notification:**
Given the order count increases between polls
When the new data is received
Then a toast notification appears: "New order received!"

## Tasks

- [x] `backend/src/services/admin.service.ts` — `getDashboardStats()` function
- [x] `backend/src/api/controllers/admin.controller.ts` — `getDashboardStats()` handler
- [x] `backend/src/api/routes/admin.routes.ts` — `GET /api/v1/admin/dashboard`
- [x] `frontend/src/features/admin/AdminDashboard.tsx` — dashboard component
- [x] `frontend/src/features/admin/useAdminPolling.ts` — polling hook

## Dev Notes

### Architecture references
- Today's orders: `Order.countDocuments({ createdAt: { $gte: startOfDay } })`
- Today's revenue: `Order.aggregate([{ $match: { createdAt: { $gte: startOfDay }, status: { $in: ['processing', 'shipped', 'delivered'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])`
- Polling: `useAdminPolling(30_000)` custom hook
- New order detection: compare previous order count with current count

### Key files
- `backend/src/services/admin.service.ts` — getDashboardStats
- `frontend/src/features/admin/AdminDashboard.tsx` — dashboard UI
- `frontend/src/features/admin/useAdminPolling.ts` — 30s polling hook

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ GET /api/v1/admin/dashboard with today's stats and recent orders
- ✅ AdminDashboard with metric cards
- ✅ useAdminPolling hook with 30s interval and cleanup
- ✅ New order toast notification on count increase

### File List
- `backend/src/services/admin.service.ts`
- `backend/src/api/controllers/admin.controller.ts`
- `backend/src/api/routes/admin.routes.ts`
- `frontend/src/features/admin/AdminDashboard.tsx`
- `frontend/src/features/admin/useAdminPolling.ts`
