import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminGetOrdersApi } from '../../api/adminApi'
import type { Order } from '../../types/order.types'
import { formatCurrency } from '../../utils/formatCurrency'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { useDebounce } from '../../hooks/useDebounce'

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}

const STATUSES = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const debouncedSearch = useDebounce(search, 300)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminGetOrdersApi({
        search: debouncedSearch || undefined,
        status: status || undefined,
        page,
        pageSize: 20,
      })
      setOrders(res.data)
      setTotalPages(res.pagination.totalPages)
      setTotal(res.pagination.total)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, page])

  useEffect(() => { void fetchOrders() }, [fetchOrders])

  function handleSearchChange(v: string) { setSearch(v); setPage(1) }
  function handleStatusChange(v: string) { setStatus(v); setPage(1) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Orders <span className="text-base font-normal text-gray-400">({total})</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search by email or order ID…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All statuses'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Order</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const customer = typeof o.userId === 'object' && o.userId !== null
                    ? (o.userId as unknown as { name: string; email: string })
                    : null
                  return (
                    <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        #{o._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {customer ? (
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-xs text-gray-400">{customer.email}</p>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(o.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border capitalize ${STATUS_STYLES[o.status] ?? ''}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/orders/${o._id}`}
                          className="text-sm font-medium text-indigo-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-center text-gray-400 py-12 text-sm">No orders found.</p>
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
