import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getProductsApi } from '../../api/productsApi'
import { adminDeleteProductApi } from '../../api/adminApi'
import type { Product } from '../../types/product.types'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/slices/uiSlice'

export default function AdminProductList() {
  const dispatch = useAppDispatch()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getProductsApi({ pageSize: 100 })
      setProducts(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchProducts() }, [fetchProducts])

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await adminDeleteProductApi(deleteTarget._id)
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id))
      dispatch(addToast({ message: 'Product deleted', type: 'success' }))
      setDeleteTarget(null)
    } catch {
      dispatch(addToast({ message: 'Failed to delete product', type: 'error' }))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/admin/products/new">
          <Button size="sm">+ Add product</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Price</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Stock</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0] ?? 'https://placehold.co/40x40?text=?'}
                        alt={p.name}
                        className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                      />
                      <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500">{p.category}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stockQuantity === 0 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${p._id}/edit`}>
                        <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(p)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-center text-gray-400 py-12 text-sm">No products yet.</p>
          )}
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => { if (!isDeleting) setDeleteTarget(null) }}
        title="Delete product"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
