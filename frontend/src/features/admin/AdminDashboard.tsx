import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  adminGetDashboardApi,
  adminGetRevenueSummaryApi,
  adminGetInventoryApi,
  type DashboardStats,
  type RevenueSummary,
} from '../../api/adminApi'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/slices/uiSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import { Spinner } from '../../components/ui/Spinner'

const POLL_INTERVAL_MS = 30_000

type Period = 'today' | 'week' | 'month'

function getPeriodDates(period: Period): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString()

  if (period === 'today') {
    const from = new Date(now)
    from.setHours(0, 0, 0, 0)
    return { from: from.toISOString(), to }
  }
  if (period === 'week') {
    const from = new Date(now)
    from.setDate(from.getDate() - 7)
    return { from: from.toISOString(), to }
  }
  // month
  const from = new Date(now)
  from.setDate(1)
  from.setHours(0, 0, 0, 0)
  return { from: from.toISOString(), to }
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [summary, setSummary] = useState<RevenueSummary | null>(null)
  const [period, setPeriod] = useState<Period>('today')
  const [loading, setLoading] = useState(true)
  const [lowStockCount, setLowStockCount] = useState(0)
  const prevOrderCount = useRef<number | null>(null)

  const fetchDashboard = useCallback(async (isPolling = false) => {
    try {
      const res = await adminGetDashboardApi()
      if (res.success && res.data) {
        // Notify on new orders during polling
        if (
          isPolling &&
          prevOrderCount.current !== null &&
          res.data.todayOrderCount > prevOrderCount.current
        ) {
          dispatch(addToast({ message: '🛒 New order received!', type: 'info' }))
        }
        prevOrderCount.current = res.data.todayOrderCount
        setStats(res.data)
      }
    } catch {
      // Non-critical during polling
    } finally {
      if (!isPolling) setLoading(false)
    }
  }, [dispatch])

  const fetchSummary = useCallback(async (p: Period) => {
    const { from, to } = getPeriodDates(p)
    try {
      const res = await adminGetRevenueSummaryApi(from, to)
      if (res.success && res.data) setSummary(res.data)
    } catch {
      // Non-critical
    }
  }, [])

  const fetchLowStock = useCallback(async () => {
    try {
      const res = await adminGetInventoryApi()
      if (res.success && res.data) {
        setLowStockCount(res.data.summary.lowStock + res.data.summary.outOfStock)
      }
    } catch {
      // Non-critical
    }
  }, [])

  // Initial load
  useEffect(() => {
    void fetchDashboard()
    void fetchSummary(period)
    void fetchLowStock()
  }, [fetchDashboard, fetchSummary, fetchLowStock, period])

  // Polling every 30s
  useEffect(() => {
    const interval = setInterval(() => void fetchDashboard(true), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  // Refetch summary when period changes
  useEffect(() => {
    void fetchSummary(period)
  }, [period, fetchSummary])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Today's stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's orders" value={stats?.todayOrderCount ?? 0} />
        <StatCard label="Today's revenue" value={formatCurrency(stats?.todayRevenue ?? 0)} />
        <StatCard label="Pending orders" value={stats?.pendingOrderCount ?? 0} />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Manage</p>
          <div className="mt-2 flex flex-col gap-1.5">
            <Link to="/admin/orders" className="text-sm font-medium text-emerald-600 hover:underline">View all orders →</Link>
            <Link to="/admin/products" className="text-sm font-medium text-emerald-600 hover:underline">Manage products →</Link>
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800">
                {lowStockCount} product{lowStockCount !== 1 ? 's' : ''} need restocking
              </p>
              <p className="text-xs text-yellow-600">Low or out of stock items require attention</p>
            </div>
          </div>
          <Link to="/admin/inventory">
            <button className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors">
              View inventory
            </button>
          </Link>
        </div>
      )}

      {/* Revenue summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Revenue summary</h2>
          <div className="flex gap-1">
            {(['today', 'week', 'month'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={[
                  'px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors',
                  period === p
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100',
                ].join(' ')}
              >
                {p === 'week' ? 'Last 7 days' : p === 'month' ? 'This month' : 'Today'}
              </button>
            ))}
          </div>
        </div>
        {summary && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400">Revenue</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Orders</p>
              <p className="text-xl font-bold text-gray-900">{summary.totalOrders}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg order value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.averageOrderValue)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm text-emerald-600 hover:underline">
            View all →
          </Link>
        </div>
        {stats?.recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {stats?.recentOrders.map((o) => {
              const customer = typeof o.userId === 'object' && o.userId !== null
                ? (o.userId as unknown as { name: string; email: string })
                : null
              return (
                <li key={o._id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">
                      #{o._id.slice(-8).toUpperCase()}
                    </p>
                    {customer && (
                      <p className="text-xs text-gray-400">{customer.email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(o.totalAmount)}</p>
                    <p className="text-xs text-gray-400 capitalize">{o.status}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
