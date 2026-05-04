import { Router, raw } from 'express'
import type { Request, Response } from 'express'
import stripe from '../../services/stripe.service'
import { createOrderFromWebhook } from '../../services/order.service'
import { sendOrderConfirmationEmail } from '../../services/email.service'
import { User } from '../../models/User.model'
import { env } from '../../config/env'

const router = Router()

/**
 * POST /api/v1/webhooks/stripe
 *
 * Stripe sends signed webhook events here. We MUST:
 *  1. Use the raw request body (not parsed JSON) for signature verification
 *  2. Verify the Stripe-Signature header before processing anything
 *  3. Return 200 quickly — Stripe retries on non-2xx responses
 *  4. Be idempotent — Stripe may deliver the same event more than once
 *
 * The raw body parser is applied per-route here (not globally) so it
 * doesn't interfere with express.json() on other routes.
 */
router.post(
  '/stripe',
  raw({ type: 'application/json' }), // raw body required for sig verification
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature']

    if (!sig) {
      res.status(400).json({ success: false, message: 'Missing Stripe signature' })
      return
    }

    if (!env.STRIPE_WEBHOOK_SECRET || env.STRIPE_WEBHOOK_SECRET === 'whsec_placeholder') {
      console.warn('⚠️  STRIPE_WEBHOOK_SECRET not configured — skipping verification in dev')
      res.json({ received: true })
      return
    }

    let event: ReturnType<typeof stripe.webhooks.constructEvent>

    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Webhook signature verification failed:', message)
      res.status(400).json({ success: false, message: `Webhook error: ${message}` })
      return
    }

    // ── Handle events ──────────────────────────────────────────────────
    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object
          const chargeId =
            typeof paymentIntent.latest_charge === 'string'
              ? paymentIntent.latest_charge
              : null

          const order = await createOrderFromWebhook(
            paymentIntent.id,
            chargeId,
            paymentIntent.metadata as Record<string, string>
          )

          console.log(`✅ Order created: ${order._id as string} for PI ${paymentIntent.id}`)

          // Send confirmation email — fire-and-forget, don't block webhook response
          const userId = paymentIntent.metadata['userId']
          if (userId) {
            User.findById(userId)
              .then((user) => {
                if (user) {
                  return sendOrderConfirmationEmail(user.email, user.name, order)
                }
              })
              .catch((err) =>
                console.error('❌ Failed to send confirmation email:', err)
              )
          }
          break
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object
          console.warn(
            `⚠️  Payment failed for PI ${paymentIntent.id}:`,
            paymentIntent.last_payment_error?.message
          )
          // No order created — customer will see failure in the UI
          break
        }

        default:
          // Acknowledge unhandled event types without error
          break
      }
    } catch (err) {
      // Log but still return 200 — prevents Stripe from retrying indefinitely
      // for errors that won't be fixed by retrying (e.g. duplicate key)
      console.error(`❌ Error processing webhook event ${event.type}:`, err)
    }

    // Always acknowledge receipt to Stripe
    res.json({ received: true })
  }
)

export default router
