import { useState, useEffect, useCallback } from 'react'
import { adminGetCustomersApi, type CustomerRecord } from '../../api/adminApi'
import { formatCurrency } from '../../utils/formatCurrency'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { useDebounce } from '../../hooks/useDebounce'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const debouncedSearch = useDebounce(search, 300)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminGetCustomersApi({
        search: debouncedSearch || undefined,
        page,
        pageSize: 20,
      })
      setCustomers(res.data)
      setTotalPages(res.pagination.totalPages)
      setTotal(res.pagination.total)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page])

  useEffect(() => { void fetchCustomers() }, [fetchCustomers])

  function handleSearchChange(v: string) { setSearch(v); setPage(1) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Customers <span className="text-base font-normal text-gray-400">({total})</span>
        </h1>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Orders</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Total spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {c.orderCount}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(c.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 && (
              <p className="text-center text-gray-400 py-12 text-sm">No customers found.</p>
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
