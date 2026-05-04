import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMyOrderByIdApi } from '../api/ordersApi'
import type { Order, OrderStatus } from '../types/order.types'
import { formatCurrency } from '../utils/formatCurrency'
import { Spinner } from '../components/ui/Spinner'
import { useOrderStatusPolling } from '../features/orders/useOrderStatusPolling'

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
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
      <Link to="/orders" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
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
          <Link to="/orders" className="text-sm text-indigo-600 hover:underline">
            ← My orders
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400">
            Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <span className={`text-sm font-medium px-3 py-1.5 rounded-full border capitalize ${STATUS_STYLES[order.status] ?? ''}`}>
          {order.status}
        </span>
      </div>

      {/* Progress tracker — only for non-cancelled orders */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={[
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                    i <= currentStep
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400',
                  ].join(' ')}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs capitalize font-medium ${i <= currentStep ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">Items ordered</h2>
          <ul className="divide-y divide-gray-100">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={item.image || 'https://placehold.co/56x56?text=?'}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-2">
          <h2 className="text-sm font-semibold text-gray-900">Shipping address</h2>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="font-medium text-gray-900">{addr.fullName}</p>
            <p>{addr.addressLine1}</p>
            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
            <p>{addr.city}, {addr.state} {addr.postalCode}</p>
            <p>{addr.country}</p>
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-2">
          <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
          <dl className="text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(order.totalAmount)}</dd>
            </div>
            <div className="flex justify-between text-gray-600">
              <dt>Shipping</dt>
              <dd className="text-gray-400">Free</dd>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
              <dt>Total paid</dt>
              <dd>{formatCurrency(order.totalAmount)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
