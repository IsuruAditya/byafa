import { useState, useEffect, useCallback } from 'react'
import { adminGetAnalyticsApi, type AnalyticsData } from '../../api/adminApi'
import { formatCurrency } from '../../utils/formatCurrency'
import { Spinner } from '../../components/ui/Spinner'

type Period = '7d' | '30d' | '90d'

function getPeriodDates(period: Period): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  if (period === '7d')  from.setDate(from.getDate() - 7)
  if (period === '30d') from.setDate(from.getDate() - 30)
  if (period === '90d') from.setDate(from.getDate() - 90)
  return { from: from.toISOString(), to: to.toISOString() }
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-400',
  processing: 'bg-blue-400',
  shipped:    'bg-violet-400',
  delivered:  'bg-green-500',
  cancelled:  'bg-red-400',
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('30d')

  const fetchAnalytics = useCallback(async (p: Period) => {
    setLoading(true)
    try {
      const { from, to } = getPeriodDates(p)
      const res = await adminGetAnalyticsApi(from, to)
      if (res.success && res.data) setData(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchAnalytics(period) }, [fetchAnalytics, period])

  const totalOrdersInPeriod = data?.ordersByStatus.reduce((s, o) => s + o.count, 0) ?? 0
  const maxRevenue = data?.revenueByDay.reduce((m, d) => Math.max(m, d.revenue), 0) ?? 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                period === p ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-100',
              ].join(' ')}
            >
              {p === '7d' ? 'Last 7 days' : p === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !data ? (
        <p className="text-red-600">Failed to load analytics.</p>
      ) : (
        <div className="space-y-6">

          {/* Revenue by day — bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Revenue over time</h2>
            {data.revenueByDay.length === 0 ? (
              <p className="text-sm text-gray-400">No revenue data for this period.</p>
            ) : (
              <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                {data.revenueByDay.map((d) => {
                  const heightPct = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0
                  return (
                    <div key={d._id} className="flex flex-col items-center gap-1 flex-1 min-w-[28px] group relative">
                      <div
                        className="w-full bg-emerald-500 rounded-t hover:bg-emerald-600 transition-colors cursor-default"
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                        title={`${d._id}: ${formatCurrency(d.revenue)} (${d.orders} orders)`}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                        {d._id}<br />{formatCurrency(d.revenue)}<br />{d.orders} orders
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top products */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Top products by revenue</h2>
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-gray-400">No sales data for this period.</p>
              ) : (
                <ul className="space-y-3">
                  {data.topProducts.map((p, i) => (
                    <li key={p._id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                      <img
                        src={p.image || 'https://placehold.co/32x32?text=?'}
                        alt={p.name}
                        className="h-8 w-8 rounded-md object-cover border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.unitsSold} units sold</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">
                        {formatCurrency(p.revenue)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Orders by status */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Orders by status</h2>
              {data.ordersByStatus.length === 0 ? (
                <p className="text-sm text-gray-400">No orders for this period.</p>
              ) : (
                <div className="space-y-3">
                  {data.ordersByStatus.map((s) => {
                    const pct = totalOrdersInPeriod > 0 ? (s.count / totalOrdersInPeriod) * 100 : 0
                    return (
                      <div key={s._id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-gray-700">{s._id}</span>
                          <span className="font-medium text-gray-900">{s.count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${STATUS_STYLES[s._id] ?? 'bg-gray-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
