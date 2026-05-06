# Story 5.4: Order Confirmation Email

**Status:** done
**Epic:** 5 — Checkout & Payment
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to receive an order confirmation email immediately after my payment is confirmed,
so that I have a record of my purchase.

## Acceptance Criteria

**AC1 — Email sent on order creation:**
Given a Stripe webhook confirms a successful payment
When the order is created
Then Nodemailer sends an email to the customer's registered email address

**AC2 — Email content:**
Given the confirmation email is sent
When the customer receives it
Then the email includes: order ID, list of items with quantities and prices, shipping address, and total amount

**AC3 — Email transport:**
Given the email service is configured
When an email is sent
Then it uses Gmail SMTP with app password authentication (`GMAIL_USER`, `GMAIL_APP_PASSWORD`)

**AC4 — Non-blocking failure:**
Given the email service fails
When the error is caught
Then the error is logged but the webhook handler still returns 200 to Stripe
And the order is not rolled back due to email failure

## Tasks

- [x] `backend/src/services/email.service.ts` — `sendOrderConfirmationEmail()` function
- [x] `backend/src/config/env.ts` — `GMAIL_USER`, `GMAIL_APP_PASSWORD` env vars

## Dev Notes

### Architecture references
- Nodemailer transport: `nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })`
- Email template: HTML string with order details table
- Error handling: `try/catch` around `transporter.sendMail()`, log error, don't throw
- Subject line: `Order Confirmation — Order #${orderId}`

### Key files
- `backend/src/services/email.service.ts` — email sending logic
- `backend/src/services/order.service.ts` — calls email service after order creation

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Nodemailer configured with Gmail SMTP
- ✅ HTML email template with order details
- ✅ Email failure is non-blocking (logged, not thrown)
- ✅ sendOrderConfirmationEmail called from webhook handler

### File List
- `backend/src/services/email.service.ts`
