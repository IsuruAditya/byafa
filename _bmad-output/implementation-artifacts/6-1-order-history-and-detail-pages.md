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
Given I navigate to `/orders`
Then `GET /api/v1/orders` returns my orders sorted by `createdAt` descending
And each order shows: order ID (last 8 chars), date, status badge, total, link to detail

**AC2 — Empty state:**
Given I have no orders
Then a "No orders yet" message is shown

**AC3 — Order detail:**
Given I click on an order
Then `GET /api/v1/orders/:id` returns the full order
And I see: items with images, shipping address, payment summary, status badge
And a visual progress tracker (Pending → Processing → Shipped → Delivered) is shown
And a 403 is returned if I try to access another user's order

## Tasks

- [x] `backend/src/services/order.service.ts` — `getOrdersByUser()`, `getOrderById()`
- [x] `backend/src/api/controllers/order.controller.ts` — `getMyOrders()`, `getMyOrderById()`
- [x] `backend/src/api/routes/order.routes.ts` — `GET /`, `GET /:id`
- [x] `frontend/src/pages/OrderHistoryPage.tsx`
- [x] `frontend/src/pages/OrderDetailPage.tsx`
- [x] `frontend/src/api/ordersApi.ts` — `getMyOrdersApi()`, `getMyOrderByIdApi()`

## Dev Notes

### getOrderById ownership check
```ts
const order = await Order.findOne({ _id: orderId, userId })
if (!order) throw new AppError('Order not found', 404)
```
Using `findOne({ _id, userId })` instead of `findById` enforces ownership — returns null (→ 404)
if the order exists but belongs to a different user. This is intentional — 404 not 403,
to avoid leaking that the order ID exists.

### Progress tracker
```ts
const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']
const currentStep = STATUS_STEPS.indexOf(order.status)
```
Cancelled orders skip the tracker entirely.
Steps before `currentStep` show a checkmark; `currentStep` shows the step number; future steps are greyed.

### Status badge colors
```ts
const STATUS_STYLES = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped:    'bg-violet-50 text-violet-700 border-violet-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}
```

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `getOrdersByUser()` — sorted by createdAt desc, `.lean()`
- ✅ `getOrderById()` — ownership check via `findOne({ _id, userId })`
- ✅ OrderHistoryPage — list with status badges, empty state
- ✅ OrderDetailPage — progress tracker, items, shipping, payment summary

### File List
- `backend/src/services/order.service.ts` (getOrdersByUser, getOrderById)
- `backend/src/api/controllers/order.controller.ts`
- `backend/src/api/routes/order.routes.ts`
- `frontend/src/pages/OrderHistoryPage.tsx`
- `frontend/src/pages/OrderDetailPage.tsx`
- `frontend/src/api/ordersApi.ts`
