import nodemailer from 'nodemailer'
import { env } from '../config/env'
import type { IOrder } from '../models/Order.model'

// Lazy-initialise the transporter so missing EMAIL_USER/PASS in dev
// doesn't crash the server — emails just won't send.
function createTransporter() {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    return null
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS, // Gmail App Password (not account password)
    },
  })
}

const transporter = createTransporter()

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function itemsTable(order: IOrder): string {
  return order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('')
}

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,sans-serif;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background:#4f46e5;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">Byafa</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                © ${new Date().getFullYear()} Byafa. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Email senders ──────────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  toEmail: string,
  toName: string,
  order: IOrder
): Promise<void> {
  if (!transporter) {
    console.warn('⚠️  Email not configured — skipping order confirmation email')
    return
  }

  const addr = order.shippingAddress
  const addressLines = [
    addr.addressLine1,
    addr.addressLine2,
    `${addr.city}, ${addr.state} ${addr.postalCode}`,
    addr.country,
  ]
    .filter(Boolean)
    .join('<br />')

  const html = baseTemplate(
    'Order Confirmed',
    `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
       Order confirmed! 🎉
     </h1>
     <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
       Hi ${toName}, thanks for your order. We're getting it ready.
     </p>

     <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:.05em;">
       Order #${(order._id as string).toString().slice(-8).toUpperCase()}
     </p>

     <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
       <thead>
         <tr style="background:#f9fafb;">
           <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Item</th>
           <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;">Qty</th>
           <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;">Total</th>
         </tr>
       </thead>
       <tbody>
         ${itemsTable(order)}
       </tbody>
       <tfoot>
         <tr>
           <td colspan="2" style="padding:10px 12px;font-weight:700;font-size:14px;">Total</td>
           <td style="padding:10px 12px;font-weight:700;font-size:14px;text-align:right;">
             ${formatCurrency(order.totalAmount)}
           </td>
         </tr>
       </tfoot>
     </table>

     <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:.05em;">
       Shipping to
     </p>
     <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
       ${addr.fullName}<br />${addressLines}
     </p>

     <a href="${env.CLIENT_URL}/orders"
        style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
       View my orders
     </a>`
  )

  await transporter.sendMail({
    from: `"Byafa" <${env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Order confirmed — #${(order._id as string).toString().slice(-8).toUpperCase()}`,
    html,
  })
}

export async function sendShippingNotificationEmail(
  toEmail: string,
  toName: string,
  order: IOrder
): Promise<void> {
  if (!transporter) {
    console.warn('⚠️  Email not configured — skipping shipping notification email')
    return
  }

  const html = baseTemplate(
    'Your order has shipped',
    `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
       Your order is on its way! 🚚
     </h1>
     <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
       Hi ${toName}, your order #${(order._id as string).toString().slice(-8).toUpperCase()} has been shipped
       and is on its way to you.
     </p>

     <a href="${env.CLIENT_URL}/orders/${order._id as string}"
        style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
       Track my order
     </a>`
  )

  await transporter.sendMail({
    from: `"Byafa" <${env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your order has shipped — #${(order._id as string).toString().slice(-8).toUpperCase()}`,
    html,
  })
}
