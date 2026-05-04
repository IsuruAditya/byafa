import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrdersApi } from '../api/ordersApi'
import type { Order } from '../types/order.types'
import { formatCurrency } from '../utils/formatCurrency'
import { Spinner } from '../components/ui/Spinner'

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped:    'bg-violet-50 text-violet-700 border-violet-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyOrdersApi()
      .then((res) => { if (res.success && res.data) setOrders(res.data) })
      .catch(() => setError('Failed to load orders. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  )

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <h1 className="text-xl font-bold text-gray-900">No orders yet</h1>
      <p className="text-sm text-gray-500">When you place an order it will appear here.</p>
      <Link to="/products" className="text-sm font-medium text-emerald-600 hover:underline">
        Start shopping
      </Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My orders</h1>

      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order._id}>
            <Link
              to={`/orders/${order._id}`}
              className="block rounded-xl border border-gray-200 bg-white shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[order.status] ?? ''}`}>
                    {order.status}
                  </span>
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
