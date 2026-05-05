import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminUpdateOrderStatusApi, adminIssueRefundApi, adminGetOrderByIdApi } from '../../api/adminApi'
import type { Order, OrderStatus } from '../../types/order.types'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/slices/uiSlice'
import axios from 'axios'

const STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)

  useEffect(() => {
    if (!id) return
    adminGetOrderByIdApi(id)
      .then((res) => {
        if (res.success && res.data) {
          setOrder(res.data)
          setSelectedStatus(res.data.status)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusUpdate() {
    if (!id || !order) return
    setIsUpdating(true)
    try {
      const res = await adminUpdateOrderStatusApi(id, selectedStatus)
      if (res.success && res.data) {
        setOrder(res.data)
        dispatch(addToast({ message: 'Order status updated', type: 'success' }))
      }
    } catch {
      dispatch(addToast({ message: 'Failed to update status', type: 'error' }))
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleRefund() {
    if (!id) return
    setIsRefunding(true)
    try {
      const res = await adminIssueRefundApi(id)
      if (res.success && res.data) {
        setOrder(res.data)
        dispatch(addToast({ message: 'Refund issued successfully', type: 'success' }))
        setShowRefundModal(false)
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string ?? 'Refund failed')
        : 'Refund failed'
      dispatch(addToast({ message, type: 'error' }))
    } finally {
      setIsRefunding(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!order) return <p className="text-red-600">Order not found.</p>

  const addr = order.shippingAddress

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/orders" className="text-sm text-emerald-600 hover:underline">
            ← Orders
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status update */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Update status</h2>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={handleStatusUpdate}
            isLoading={isUpdating}
            disabled={selectedStatus === order.status}
            className="w-full"
          >
            Save status
          </Button>
        </div>

        {/* Refund */}
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-red-600">Refund</h2>
          <p className="text-xs text-gray-500">
            Issues a full refund via Stripe and cancels the order.
          </p>
          <Button
            variant="danger"
            size="sm"
            className="w-full"
            disabled={order.status === 'cancelled' || !order.stripeChargeId}
            onClick={() => setShowRefundModal(true)}
          >
            Issue refund
          </Button>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3 md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">Items</h2>
          <ul className="divide-y divide-gray-100">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 py-2">
                <img
                  src={item.image || 'https://placehold.co/40x40?text=?'}
                  alt={item.name}
                  className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-sm">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-2">
          <h2 className="text-sm font-semibold text-gray-900">Shipping address</h2>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="font-medium">{addr.fullName}</p>
            <p>{addr.addressLine1}</p>
            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
            <p>{addr.city}, {addr.state} {addr.postalCode}</p>
            <p>{addr.country}</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRefundModal}
        onClose={() => { if (!isRefunding) setShowRefundModal(false) }}
        title="Issue refund"
      >
        <p className="text-sm text-gray-600">
          This will issue a full refund of <strong>{formatCurrency(order.totalAmount)}</strong> via
          Stripe and cancel the order. This cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setShowRefundModal(false)} disabled={isRefunding}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRefund} isLoading={isRefunding}>
            Confirm refund
          </Button>
        </div>
      </Modal>
    </div>
  )
}
