import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import { createPaymentIntentApi } from '../../api/ordersApi'
import type { ShippingAddress } from '../../types/order.types'
import { ShippingForm } from './ShippingForm'
import { StripePaymentForm } from './StripePaymentForm'
import { formatCurrency } from '../../utils/formatCurrency'
import axios from 'axios'

// Load Stripe outside component to avoid re-creating on every render
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string
)

type Step = 'shipping' | 'payment'

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector((s) => s.cart.items)

  const [step, setStep] = useState<Step>('shipping')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  async function handleShippingSubmit(address: ShippingAddress) {
    setIsCreatingIntent(true)
    setIntentError(null)
    try {
      const res = await createPaymentIntentApi({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: address,
      })

      if (res.success && res.data) {
        setClientSecret(res.data.clientSecret)
        setTotalAmount(res.data.totalAmount)
        setShippingAddress(address)
        setStep('payment')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setIntentError(
          err.response?.data?.message ??
            'Failed to initialise payment. Please try again.'
        )
      }
    } finally {
      setIsCreatingIntent(false)
    }
  }

  function handlePaymentSuccess(paymentIntentId: string) {
    dispatch(clearCart())
    dispatch(
      addToast({ message: 'Payment successful! Your order is confirmed.', type: 'success' })
    )
    navigate(`/checkout/complete?payment_intent=${paymentIntentId}`, {
      replace: true,
    })
  }

  function handlePaymentError(message: string) {
    dispatch(addToast({ message, type: 'error' }))
  }

  // Order summary sidebar — shared across both steps
  const OrderSummary = () => (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Order summary</h2>
      <ul className="space-y-3 text-sm">
        {items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-2">
            <span className="text-gray-600 line-clamp-1">
              {item.name}{' '}
              <span className="text-gray-400">× {item.quantity}</span>
            </span>
            <span className="font-medium text-gray-900 shrink-0">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900">
        <span>Total</span>
        <span>{formatCurrency(step === 'payment' ? totalAmount : subtotal)}</span>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl">
      {/* Step indicator */}
      <nav className="mb-8" aria-label="Checkout steps">
        <ol className="flex items-center gap-2 text-sm">
          {(['shipping', 'payment'] as Step[]).map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300" aria-hidden="true">→</span>}
              <span
                className={[
                  'font-medium capitalize',
                  step === s ? 'text-indigo-600' : 'text-gray-400',
                ].join(' ')}
                aria-current={step === s ? 'step' : undefined}
              >
                {s}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ── Main form area ─────────────────────────────────────────── */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          {step === 'shipping' && (
            <>
              <h1 className="text-lg font-semibold text-gray-900 mb-5">
                Shipping address
              </h1>
              {intentError && (
                <p
                  className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
                  role="alert"
                >
                  {intentError}
                </p>
              )}
              <ShippingForm
                onSubmit={(addr) => void handleShippingSubmit(addr)}
                isLoading={isCreatingIntent}
              />
            </>
          )}

          {step === 'payment' && clientSecret && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-lg font-semibold text-gray-900">
                  Payment
                </h1>
                <button
                  onClick={() => setStep('shipping')}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  ← Edit shipping
                </button>
              </div>

              {/* Shipping summary */}
              {shippingAddress && (
                <div className="mb-5 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">
                    {shippingAddress.fullName}
                  </p>
                  <p>{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && (
                    <p>{shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {shippingAddress.city}, {shippingAddress.state}{' '}
                    {shippingAddress.postalCode}
                  </p>
                  <p>{shippingAddress.country}</p>
                </div>
              )}

              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance: { theme: 'stripe' } }}
              >
                <StripePaymentForm
                  totalAmount={totalAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </>
          )}
        </div>

        {/* ── Order summary ─────────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0">
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
