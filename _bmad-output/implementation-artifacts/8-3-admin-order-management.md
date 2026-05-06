# Story 8.3: Admin Order Management

**Status:** done
**Epic:** 8 — Admin Dashboard & Store Management
**Project context:** `_bmad-output/project-context.md`

## Story

As an admin,
I want to view, search, filter, and update all orders,
so that I can manage fulfillment and resolve customer issues.

## Acceptance Criteria

**AC1 — Order list:**
Given I am on the admin orders page
When the page loads
Then `GET /api/v1/admin/orders` returns all orders paginated, sorted by `createdAt` descending
And I can search by customer email or order ID
And I can filter by order status
And I can filter by date range

**AC2 — Order detail:**
Given I click on an order
When the order detail page loads
Then I see full order details: customer info, items, shipping address, payment info, and current status

**AC3 — Update order status:**
Given I select a new status and save
When `PATCH /api/v1/admin/orders/:id/status` is called
Then the order status is updated
And if status is set to `shipped`, the shipping notification email is triggered

## Tasks

- [x] `backend/src/services/admin.service.ts` — `getAdminOrders()`, `updateOrderStatus()`
- [x] `backend/src/api/controllers/admin.controller.ts` — admin order handlers
- [x] `backend/src/api/routes/admin.routes.ts` — admin order routes
- [x] `frontend/src/features/admin/AdminOrderList.tsx` — order list with search/filter
- [x] `frontend/src/features/admin/AdminOrderDetail.tsx` — order detail with status update
- [x] `frontend/src/api/adminApi.ts` — admin order API functions

## Dev Notes

### Architecture references
- Search: `$or: [{ 'customer.email': regex }, { _id: orderId }]` — populate customer from User
- Date filter: `createdAt: { $gte: from, $lte: to }`
- Status update: check previous status before sending shipping email
- Populate: `.populate('userId', 'name email')` for customer info

### Key files
- `backend/src/services/admin.service.ts` — getAdminOrders, updateOrderStatus
- `frontend/src/features/admin/AdminOrderList.tsx` — list with filters
- `frontend/src/features/admin/AdminOrderDetail.tsx` — detail with status dropdown

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ GET /api/v1/admin/orders with search, status filter, date range, pagination
- ✅ PATCH /api/v1/admin/orders/:id/status with shipping email trigger
- ✅ AdminOrderList with search and filter controls
- ✅ AdminOrderDetail with status update dropdown
- ✅ Customer info populated from User model

### File List
- `backend/src/services/admin.service.ts`
- `backend/src/api/controllers/admin.controller.ts`
- `backend/src/api/routes/admin.routes.ts`
- `frontend/src/features/admin/AdminOrderList.tsx`
- `frontend/src/features/admin/AdminOrderDetail.tsx`
- `frontend/src/api/adminApi.ts`
