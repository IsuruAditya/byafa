/**
 * Web stub for @stripe/stripe-react-native.
 * The real package is native-only and will crash the web bundler.
 * Checkout is disabled on web — this stub prevents the import from failing.
 */
import React from 'react'

export const StripeProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children)

export function useStripe() {
  return {
    initPaymentSheet: async () => ({ error: { message: 'Not supported on web' } }),
    presentPaymentSheet: async () => ({ error: { message: 'Not supported on web' } }),
  }
}
