import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  adminGetInventoryApi,
  adminAdjustStockApi,
  type InventoryItem,
  type InventoryOverview,
} from '../../api/adminApi'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/slices/uiSlice'

const STATUS_STYLES = {
  in_stock:      'bg-green-50 text-green-700 border-green-200',
  low_stock:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  out_of_stock:  'bg-red-50 text-red-700 border-red-200',
}

const STATUS_LABELS = {
  in_stock:      'In stock',
  low_stock:     'Low stock',
  out_of_stock:  'Out of stock',
}

export default function AdminInventory() {
  const dispatch = useAppDispatch()
  const [data, setData] = useState<InventoryOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null)
  const [adjustment, setAdjustment] = useState(0)
  const [note, setNote] = useState('')
  const [isAdjusting, setIsAdjusting] = useState(false)

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminGetInventoryApi()
      if (res.success && res.data) setData(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchInventory() }, [fetchInventory])

  async function handleAdjust() {
    if (!adjustTarget || adjustment === 0) return
    setIsAdjusting(true)
    try {
      await adminAdjustStockApi(adjustTarget._id, adjustment, note)
      dispatch(addToast({ message: 'Stock adjusted', type: 'success' }))
      setAdjustTarget(null)
      setAdjustment(0)
      setNote('')
      void fetchInventory()
    } catch {
      dispatch(addToast({ message: 'Failed to adjust stock', type: 'error' }))
    } finally {
      setIsAdjusting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!data) return <p className="text-red-600">Failed to load inventory.</p>

  const { items, summary } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Link to="/admin/products/new">
          <Button size="sm">+ Add product</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total units</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{summary.totalUnits}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Inventory value</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(summary.totalValue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 shadow-sm p-5">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">In stock</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{summary.inStock}</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-5">
          <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Low stock</p>
          <p className="mt-1 text-2xl font-bold text-yellow-700">{summary.lowStock}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Out of stock</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{summary.outOfStock}</p>
        </div>
      </div>

      {/* Inventory table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Price</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Cost</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Margin</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Stock</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const margin = item.price > 0 ? ((item.price - item.costPrice) / item.price) * 100 : 0
              return (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.images[0] ?? 'https://placehold.co/40x40?text=?'}
                        alt={item.name}
                        className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                      />
                      <span className="font-medium text-gray-900 line-clamp-1">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500">{item.category}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(item.costPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={margin > 30 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                      {margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={item.status === 'out_of_stock' ? 'text-red-600 font-bold' : 'text-gray-900'}>
                      {item.stockQuantity}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">/ {item.lowStockThreshold}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_STYLES[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setAdjustTarget(item)}
                      >
                        Adjust
                      </Button>
                      <Link to={`/admin/products/${item._id}/edit`}>
                        <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">No products yet.</p>
        )}
      </div>

      {/* Adjust stock modal */}
      <Modal
        isOpen={!!adjustTarget}
        onClose={() => { if (!isAdjusting) { setAdjustTarget(null); setAdjustment(0); setNote('') } }}
        title="Adjust stock"
      >
        {adjustTarget && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">{adjustTarget.name}</p>
              <p className="text-xs text-gray-400">Current stock: {adjustTarget.stockQuantity}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Adjustment</label>
              <input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(parseInt(e.target.value, 10) || 0)}
                placeholder="e.g. +10 or -5"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400">
                New stock: {adjustTarget.stockQuantity + adjustment}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Restock from supplier"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => { setAdjustTarget(null); setAdjustment(0); setNote('') }}
                disabled={isAdjusting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdjust}
                isLoading={isAdjusting}
                disabled={adjustment === 0}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
