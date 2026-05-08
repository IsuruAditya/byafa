# Story 5.4: Order Confirmation Email

**Status:** done
**Epic:** 5 — Checkout & Payment
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to receive an order confirmation email immediately after my payment is confirmed,
so that I have a record of my purchase.

## Acceptance Criteria

**AC1 — Email content:**
Given a Stripe webhook confirms a successful payment
When the order is created
Then Nodemailer sends an HTML email to the customer's registered email
And the email includes: order ID (last 8 chars uppercased), items table with qty and prices, shipping address, total amount
And the email has a "View my orders" CTA button linking to `{CLIENT_URL}/orders`

**AC2 — Failure tolerance:**
Given email sending fails (SMTP error, missing credentials)
Then the failure is logged but does NOT cause the webhook handler to return non-200
And the order is still created successfully

**AC3 — Missing credentials:**
Given `EMAIL_USER` or `EMAIL_PASS` is not set
Then the transporter is `null` and emails are silently skipped with a console warning

## Tasks

- [x] `backend/src/services/email.service.ts` — `sendOrderConfirmationEmail()`, `sendShippingNotificationEmail()`

## Dev Notes

### Nodemailer setup
```ts
function createTransporter() {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) return null
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS }
  })
}
const transporter = createTransporter()  // module-level singleton
```

### Gmail App Password
`EMAIL_PASS` must be a Gmail App Password (16-char), NOT the account password.
Enable at: Google Account → Security → 2-Step Verification → App Passwords.

### HTML email template
Uses inline styles (email clients strip `<style>` tags).
`baseTemplate(title, body)` wraps content in a consistent branded layout.
Brand color: `#4f46e5` (indigo-600) in email header — matches Byafa brand.

### Order ID display
```ts
String(order._id).slice(-8).toUpperCase()  // e.g. "A3F2B1C9"
```

### Fire-and-forget pattern (webhook handler)
```ts
sendOrderConfirmationEmail(user.email, user.name, order)
  .catch(err => console.error('Failed to send confirmation email:', err))
// No await — webhook returns 200 immediately
```

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `sendOrderConfirmationEmail()` — HTML template, items table, shipping address, CTA
- ✅ `sendShippingNotificationEmail()` — simpler template, order ID, tracking link
- ✅ Lazy transporter — null when credentials missing, warns to console
- ✅ Both functions are fire-and-forget in callers

### File List
- `backend/src/services/email.service.ts`
