import Stripe from 'stripe'
import { env } from '../config/env'

// Single Stripe instance — reused across invocations
// Explicit `InstanceType` avoids the TS2883 "cannot be named" error
const stripe: InstanceType<typeof Stripe> = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
})

export default stripe
