# Story 6.1: Order History and Detail Pages

**Status:** done
**Epic:** 6 — Order Management (Customer)
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to view my order history and the details of each order,
so that I can track what I've purchased.

## Acceptance Criteria

**AC1 — Order history:**
Given I am logged in and navigate to my order history
When the page loads
Then `GET /api/v1/orders` returns my orders sorted by `createdAt` descending
And each order shows: order ID, date, status badge, total amount, and a link to the detail page
And an empty state is shown if I have no orders

**AC2 — Order detail:**
Given I click on an order
When the order detail page loads
Then `GET /api/v1/orders/:id` returns the full order including items, shipping address, status, and timestamps
And each item shows: product name, quantity, unit price, and line total

**AC3 — Authorization:**
Given I try to access another user's order
When `GET /api/v1/orders/:id` is called
Then a 403 response is returned: `{ success: false, message: "Forbidden" }`

## Tasks

- [x] `backend/src/services/order.service.ts` — `getUserOrders()`, `getOrderById()`
- [x] `backend/src/api/controllers/order.controller.ts` — `getUserOrders()`, `getOrderById()` handlers
- [x] `backend/src/api/routes/order.routes.ts` — `GET /api/v1/orders`, `GET /api/v1/orders/:id`
- [x] `frontend/src/pages/OrderHistoryPage.tsx` — order history list
- [x] `frontend/src/pages/OrderDetailPage.tsx` — order detail view
- [x] `frontend/src/api/ordersApi.ts` — `getUserOrdersApi()`, `getOrderByIdApi()`

## Dev Notes

### Architecture references
- Auth guard: `req.user._id` must match `order.userId` for detail endpoint
- Status badge: color-coded by status (pending=yellow, processing=blue, shipped=purple, delivered=green, cancelled=red)
- Date formatting: use `formatDate()` utility from `frontend/src/utils/formatDate.ts`

### Key files
- `backend/src/services/order.service.ts` — order queries
- `frontend/src/pages/OrderHistoryPage.tsx` — list view
- `frontend/src/pages/OrderDetailPage.tsx` — detail view

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ getUserOrders returns orders sorted by createdAt desc
- ✅ getOrderById checks userId matches req.user._id (403 if not)
- ✅ OrderHistoryPage with status badges and links to detail
- ✅ OrderDetailPage with full order breakdown
- ✅ Empty state for no orders

### File List
- `backend/src/services/order.service.ts`
- `backend/src/api/controllers/order.controller.ts`
- `backend/src/api/routes/order.routes.ts`
- `frontend/src/pages/OrderHistoryPage.tsx`
- `frontend/src/pages/OrderDetailPage.tsx`
- `frontend/src/api/ordersApi.ts`
