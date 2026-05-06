# Story 6.3: Shipping Notification Email

**Status:** done
**Epic:** 6 — Order Management (Customer)
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to receive an email when my order status changes to "shipped",
so that I know my order is on its way.

## Acceptance Criteria

**AC1 — Email triggered on shipped status:**
Given an admin updates an order status to `shipped`
When the status update is saved
Then Nodemailer sends a shipping notification email to the customer

**AC2 — Email content:**
Given the shipping email is sent
When the customer receives it
Then the email includes: order ID, list of items, and a message that the order has shipped

**AC3 — Send once:**
Given the order has already been set to `shipped` once
When the status is updated again (e.g., to `delivered`)
Then no additional shipping email is sent

**AC4 — Non-blocking failure:**
Given the email service fails
When the error is caught
Then the error is logged but the status update still succeeds

## Tasks

- [x] `backend/src/services/email.service.ts` — `sendShippingNotificationEmail()` function
- [x] `backend/src/services/order.service.ts` — call shipping email when status changes to `shipped`

## Dev Notes

### Architecture references
- Trigger condition: `if (newStatus === 'shipped' && previousStatus !== 'shipped')`
- Fetch customer email: `User.findById(order.userId).select('email name')`
- Email subject: `Your Order #${orderId} Has Shipped!`
- Non-blocking: wrap email call in try/catch, log error, don't throw

### Key files
- `backend/src/services/email.service.ts` — sendShippingNotificationEmail
- `backend/src/services/order.service.ts` — updateOrderStatus with email trigger

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ sendShippingNotificationEmail function in email service
- ✅ Email triggered only when status transitions to 'shipped'
- ✅ Customer email fetched from User model
- ✅ Email failure is non-blocking

### File List
- `backend/src/services/email.service.ts`
- `backend/src/services/order.service.ts`
