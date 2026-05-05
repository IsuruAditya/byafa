import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getProductsApi } from '../../api/productsApi'
import type { Product, SortOption } from '../../types/product.types'
import type { PaginatedResponse } from '../../types/api.types'
import { useDebounce } from '../../hooks/useDebounce'
import { ProductCard } from './ProductCard'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'

const CATEGORIES = ['all', 'electronics', 'clothing', 'books', 'home', 'sports']

const SORT_OPTIONS: { value: SortOption | ''; label: string }[] = [
  { value: 'newest',     label: 'Newest' },
  { value: 'popularity', label: 'Most popular' },
  { value: 'price_asc',  label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
]

const PAGE_SIZE = 12

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive state from URL so filters are shareable / bookmarkable
  const [search,   setSearch]   = useState(searchParams.get('search')   ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all')
  const [sortBy,   setSortBy]   = useState<SortOption>(
    (searchParams.get('sortBy') as SortOption) ?? 'newest'
  )
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'))

  const debouncedSearch = useDebounce(search, 300)

  const [result,  setResult]  = useState<PaginatedResponse<Product> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProductsApi({
        search:   debouncedSearch || undefined,
        category: category !== 'all' ? category : undefined,
        sortBy,
        page,
        pageSize: PAGE_SIZE,
      })
      setResult(data)
    } catch {
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category, sortBy, page])

  // Sync URL params whenever filters change
  useEffect(() => {
    const params: Record<string, string> = { sortBy, page: String(page) }
    if (debouncedSearch) params['search'] = debouncedSearch
    if (category !== 'all') params['category'] = category
    setSearchParams(params, { replace: true })
  }, [debouncedSearch, category, sortBy, page, setSearchParams])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  // Reset to page 1 when filters change (not when page itself changes)
  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }
  function handleCategoryChange(value: string) {
    setCategory(value)
    setPage(1)
  }
  function handleSortChange(value: SortOption) {
    setSortBy(value)
    setPage(1)
  }

  const products = result?.data ?? []
  const pagination = result?.pagination

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Shop | Byafa</title>
        <meta name="description" content="Browse our full catalog of electronics, clothing, books, home goods and more. Filter by category, sort by price or popularity." />
      </Helmet>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : 'Products'}
          </h1>
          {pagination && !loading && (
            <p className="mt-1 text-sm text-gray-500">
              {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        {search && (
          <button
            onClick={() => { setSearch(''); setPage(1) }}
            className="text-sm text-emerald-600 hover:underline"
          >
            Clear search ×
          </button>
        )}
      </div>

      {/* Filters bar — sort + category only, search is in navbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            aria-pressed={category === cat}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors',
              category === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:border-emerald-400 hover:text-emerald-600',
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => void fetchProducts()}
            className="mt-3 text-sm font-medium text-emerald-600 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No products found.</p>
          <button
            onClick={() => {
              handleSearchChange('')
              handleCategoryChange('all')
            }}
            className="mt-3 text-sm font-medium text-emerald-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Product grid — 1 col mobile, 2 tablet, 3 desktop */}
          <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Product list"
          >
            {products.map((product, index) => (
              <li key={product._id}>
                <ProductCard product={product} priority={index === 0} />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
