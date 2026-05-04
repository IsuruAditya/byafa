import { useState, FormEvent } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'

interface StripePaymentFormProps {
  totalAmount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (message: string) => void
}

export function StripePaymentForm({
  totalAmount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    try {
      // Confirm the payment — Stripe handles 3DS, redirects, etc.
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return URL after redirect-based payment methods
          return_url: `${window.location.origin}/checkout/complete`,
        },
        redirect: 'if_required', // avoid redirect for card payments
      })

      if (error) {
        onError(error.message ?? 'Payment failed. Please try again.')
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      } else {
        onError('Payment was not completed. Please try again.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 flex justify-between text-sm">
        <span className="text-gray-600">Total due today</span>
        <span className="font-bold text-gray-900">
          {formatCurrency(totalAmount)}
        </span>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || !elements}
        isLoading={isProcessing}
      >
        Pay {formatCurrency(totalAmount)}
      </Button>
    </form>
  )
}
