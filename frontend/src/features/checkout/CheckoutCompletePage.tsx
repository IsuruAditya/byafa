import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string
)

/**
 * Landing page after redirect-based payment methods (e.g. bank redirects).
 * Stripe appends ?payment_intent=... and ?payment_intent_client_secret=...
 * to the return_url. We retrieve the PaymentIntent to confirm its status.
 */
export default function CheckoutCompletePage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const clientSecret = searchParams.get('payment_intent_client_secret')

    if (!clientSecret) {
      // Arrived here from a direct (non-redirect) payment — already succeeded
      setStatus('success')
      return
    }

    stripePromise.then(async (stripe) => {
      if (!stripe) { setStatus('error'); return }
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
      setStatus(paymentIntent?.status === 'succeeded' ? 'success' : 'error')
    }).catch(() => setStatus('error'))
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-24 text-gray-400 text-sm">
        Confirming your payment…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md py-16 text-center space-y-4">
        <p className="text-xl font-bold text-red-600">Payment not completed</p>
        <p className="text-sm text-gray-500">
          Something went wrong. Please check your order history or try again.
        </p>
        <Link to="/cart" className="text-sm font-medium text-indigo-600 hover:underline">
          Return to cart
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md py-16 text-center space-y-4">
      <div className="flex justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl">
          ✓
        </span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Order confirmed!</h1>
      <p className="text-sm text-gray-500">
        Thank you for your purchase. You'll receive a confirmation email shortly.
      </p>
      <div className="flex justify-center gap-4 pt-2">
        <Link
          to="/orders"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          View my orders
        </Link>
        <Link
          to="/products"
          className="text-sm font-medium text-gray-500 hover:underline"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
