import Stripe from 'stripe'
import { env } from '../config/env'

// Single Stripe instance — reused across serverless invocations
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
})

export default stripe
