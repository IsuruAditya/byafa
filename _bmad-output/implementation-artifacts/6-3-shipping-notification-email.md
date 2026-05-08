# Story 6.3: Shipping Notification Email

**Status:** done
**Epic:** 6 — Order Management (Customer)
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to receive an email when my order status changes to "shipped",
so that I know my order is on its way.

## Acceptance Criteria

**AC1 — Email trigger:**
Given an admin updates an order status to `shipped`
When `PATCH /api/v1/admin/orders/:id/status` is processed
Then `sendShippingNotificationEmail()` is called for the customer

**AC2 — Email content:**
Then the email includes: order ID, a "Your order has shipped" message
And a "Track my order" CTA linking to `{CLIENT_URL}/orders/{orderId}`

**AC3 — Failure tolerance:**
Given email sending fails
Then the status update still succeeds
And the error is logged but not surfaced to the admin

**AC4 — Only on shipped:**
Given the admin sets status to any value other than `shipped`
Then no email is sent

## Tasks

- [x] `backend/src/services/admin.service.ts` — `adminUpdateOrderStatus()` triggers email
- [x] `backend/src/services/email.service.ts` — `sendShippingNotificationEmail()`

## Dev Notes

### adminUpdateOrderStatus
```ts
export async function adminUpdateOrderStatus(orderId, status) {
  const order = await updateOrderStatus(orderId, status)  // delegates to order.service
  if (status === 'shipped') {
    const user = await User.findById(order.userId)
    if (user) {
      sendShippingNotificationEmail(user.email, user.name, order)
        .catch(err => console.error('Failed to send shipping email:', err))
    }
  }
  return order
}
```

### Fire-and-forget
Email is NOT awaited — the admin's status update response is not delayed by email sending.
Failure is logged but does not roll back the status update.

### Email template
Simpler than order confirmation — just the shipped message and tracking link.
Uses same `baseTemplate()` wrapper for consistent branding.

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `adminUpdateOrderStatus()` — delegates to `updateOrderStatus()`, triggers email on shipped
- ✅ `sendShippingNotificationEmail()` — HTML template with tracking CTA
- ✅ Fire-and-forget with error logging

### File List
- `backend/src/services/admin.service.ts` (adminUpdateOrderStatus)
- `backend/src/services/email.service.ts` (sendShippingNotificationEmail)
