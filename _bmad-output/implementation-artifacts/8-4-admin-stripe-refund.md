# Story 8.4: Admin Stripe Refund

**Status:** done
**Epic:** 8 — Admin Dashboard & Store Management
**Project context:** `_bmad-output/project-context.md`

## Story

As an admin,
I want to initiate a refund for an order via Stripe,
so that I can resolve payment issues for customers.

## Acceptance Criteria

**AC1 — Refund initiation:**
Given I am viewing an order detail page as admin
When I click "Issue Refund" and confirm
Then `POST /api/v1/admin/orders/:id/refund` calls the Stripe refund API with the order's `stripeChargeId`
And the order status is updated to `cancelled`
And a success message confirms the refund was initiated

**AC2 — Refund failure:**
Given the Stripe refund API returns an error
When the error is caught
Then an error message is shown to the admin
And the order status is not changed

**AC3 — Confirmation modal:**
Given I click "Issue Refund"
When the modal appears
Then I must confirm before the refund is processed
And the modal shows the order total being refunded

## Tasks

- [x] `backend/src/services/admin.service.ts` — `refundOrder()` function
- [x] `backend/src/services/stripe.service.ts` — `createRefund()` function
- [x] `backend/src/api/controllers/admin.controller.ts` — `refundOrder()` handler
- [x] `backend/src/api/routes/admin.routes.ts` — `POST /api/v1/admin/orders/:id/refund`
- [x] `frontend/src/features/admin/AdminOrderDetail.tsx` — refund button with confirmation modal

## Dev Notes

### Architecture references
- Stripe refund: `stripe.refunds.create({ charge: order.stripeChargeId })`
- Status update: only update to `cancelled` after successful Stripe refund
- Error handling: catch Stripe errors, return 400 with Stripe error message
- Confirmation modal: use `Modal` component from `frontend/src/components/ui/Modal.tsx`

### Key files
- `backend/src/services/stripe.service.ts` — createRefund
- `backend/src/services/admin.service.ts` — refundOrder
- `frontend/src/features/admin/AdminOrderDetail.tsx` — refund UI

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ POST /api/v1/admin/orders/:id/refund endpoint
- ✅ Stripe refund created using stripeChargeId
- ✅ Order status updated to cancelled only on success
- ✅ Confirmation modal before refund
- ✅ Error message shown if Stripe refund fails

### File List
- `backend/src/services/stripe.service.ts`
- `backend/src/services/admin.service.ts`
- `backend/src/api/controllers/admin.controller.ts`
- `backend/src/api/routes/admin.routes.ts`
- `frontend/src/features/admin/AdminOrderDetail.tsx`
