import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { CartItemRow } from './CartItemRow'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'

export default function CartPage() {
  const navigate = useNavigate()
  const items = useAppSelector((s) => s.cart.items)
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
    } else {
      navigate('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        {/* Empty cart illustration */}
        <svg
          className="h-20 w-20 text-gray-200"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13L5.4 5M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z"
          />
        </svg>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="mt-1 text-sm text-gray-500">
            Looks like you haven't added anything yet.
          </p>
        </div>
        <Button onClick={() => navigate('/products')}>
          Browse products
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Your cart{' '}
        <span className="text-base font-normal text-gray-400">
          ({totalItems} item{totalItems !== 1 ? 's' : ''})
        </span>
      </h1>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ── Item list ─────────────────────────────────────────────── */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 px-6">
          <ul aria-label="Cart items">
            {items.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </ul>
        </div>

        {/* ── Order summary ─────────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 rounded-xl border border-gray-200 bg-white shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">
            Order summary
          </h2>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <dt>
                Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})
              </dt>
              <dd className="font-medium text-gray-900">
                {formatCurrency(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between text-gray-600">
              <dt>Shipping</dt>
              <dd className="text-gray-400 italic">Calculated at checkout</dd>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
              <dt>Total</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
          </dl>

          <Button className="w-full" size="lg" onClick={handleCheckout}>
            Proceed to checkout
          </Button>

          {!isAuthenticated && (
            <p className="text-xs text-center text-gray-400">
              You'll be asked to sign in before checkout.
            </p>
          )}

          <Link
            to="/products"
            className="block text-center text-sm text-emerald-600 hover:underline"
          >
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
