# Story 8.6: Admin Income and Expense Summary

**Status:** done
**Epic:** 8 — Admin Dashboard & Store Management
**Project context:** `_bmad-output/project-context.md`

## Story

As an admin,
I want to view income and expense summaries by time period,
so that I can understand the financial health of the store.

## Acceptance Criteria

**AC1 — Summary by time period:**
Given I am on the admin dashboard
When I select a time period (today, this week, this month, custom range)
Then `GET /api/v1/admin/summary?from=&to=` returns total revenue, total orders, and average order value for the period

**AC2 — Revenue calculation:**
Given the summary is calculated
When orders are aggregated
Then revenue is calculated from orders with status `processing`, `shipped`, or `delivered` only
And cancelled and pending orders are excluded

**AC3 — Display:**
Given the summary data is returned
When it renders on the dashboard
Then total revenue, total orders, and average order value are displayed clearly

## Tasks

- [x] `backend/src/services/admin.service.ts` — `getRevenueSummary()` function
- [x] `backend/src/api/controllers/admin.controller.ts` — `getRevenueSummary()` handler
- [x] `backend/src/api/routes/admin.routes.ts` — `GET /api/v1/admin/summary`
- [x] `frontend/src/features/admin/AdminDashboard.tsx` — summary section with period selector

## Dev Notes

### Architecture references
- Aggregation pipeline: `$match` by date range and status, `$group` to sum totalAmount and count
- Average order value: `totalRevenue / totalOrders`
- Date params: ISO string format `?from=2026-01-01T00:00:00Z&to=2026-01-31T23:59:59Z`
- Period presets: today, this week, this month map to date ranges on the frontend

### Key files
- `backend/src/services/admin.service.ts` — getRevenueSummary with aggregation
- `frontend/src/features/admin/AdminDashboard.tsx` — period selector and summary display

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ GET /api/v1/admin/summary with from/to date params
- ✅ MongoDB aggregation for revenue, order count, average order value
- ✅ Only processing/shipped/delivered orders counted
- ✅ Period selector (today, week, month, custom) on dashboard

### File List
- `backend/src/services/admin.service.ts`
- `backend/src/api/controllers/admin.controller.ts`
- `backend/src/api/routes/admin.routes.ts`
- `frontend/src/features/admin/AdminDashboard.tsx`
