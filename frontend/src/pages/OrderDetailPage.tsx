import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMyOrderByIdApi } from '../api/ordersApi'
import type { Order, OrderStatus } from '../types/order.types'
import { formatCurrency } from '../utils/formatCurrency'
import { Spinner } from '../components/ui/Spinner'
import { useOrderStatusPolling } from '../features/orders/useOrderStatusPolling'

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  processing: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  shipped:    'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  delivered:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  cancelled:  'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
}

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(() => {
    if (!id) return
    getMyOrderByIdApi(id)
      .then((res) => { if (res.success && res.data) setOrder(res.data) })
      .catch(() => setError('Failed to load order.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  // Poll for status updates every 60s until terminal state
  useOrderStatusPolling({
    orderId: id ?? '',
    currentStatus: order?.status ?? 'pending',
    onStatusChange: (newStatus: OrderStatus) => {
      setOrder((prev) => prev ? { ...prev, status: newStatus } : prev)
    },
  })

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  if (error || !order) return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-600">{error ?? 'Order not found.'}</p>
      <Link to="/orders" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline">
        ← Back to orders
      </Link>
    </div>
  )

  const addr = order.shippingAddress
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/orders" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
            ← My orders
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`text-sm font-medium px-3 py-1.5 rounded-full border capitalize ${STATUS_STYLES[order.status] ?? ''}`}>
          {order.status}
        </span>
      </div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={[
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                    i <= currentStep
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500',
                  ].join(' ')}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs capitalize font-medium ${i <= currentStep ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < currentStep ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Items ordered</h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
                  <img src={item.image || 'https://placehold.co/56x56?text=?'} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-gray-100">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Shipping address</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <p className="font-medium text-gray-900 dark:text-gray-100">{addr.fullName}</p>
            <p>{addr.addressLine1}</p>
            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
            <p>{addr.city}, {addr.state} {addr.postalCode}</p>
            <p>{addr.country}</p>
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Payment</h2>
          <dl className="text-sm space-y-1">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(order.totalAmount)}</dd>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <dt>Shipping</dt>
              <dd className="text-gray-400 dark:text-gray-500">Free</dd>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
              <dt>Total paid</dt>
              <dd>{formatCurrency(order.totalAmount)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
