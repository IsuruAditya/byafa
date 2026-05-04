import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getProductsApi } from '../api/productsApi'
import type { Product } from '../types/product.types'
import { ProductCard } from '../features/products/ProductCard'
import { Spinner } from '../components/ui/Spinner'

const CATEGORIES = [
  { label: 'Electronics', value: 'electronics', emoji: '💻' },
  { label: 'Clothing', value: 'clothing', emoji: '👕' },
  { label: 'Home & Living', value: 'home', emoji: '🏠' },
  { label: 'Books', value: 'books', emoji: '📚' },
  { label: 'Sports', value: 'sports', emoji: '⚽' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProductsApi({ sortBy: 'popularity', pageSize: 4 })
      .then((res) => {
        if (res.data) setFeatured(res.data)
      })
      .catch(() => {
        // Non-critical — page still renders without featured products
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Helmet>
        <title>Byafa — Shop Online</title>
        <meta
          name="description"
          content="Shop the latest electronics, clothing, books, home goods and more at Byafa. Fast shipping, real reviews, secure checkout."
        />
        <meta property="og:title" content="Byafa — Shop Online" />
        <meta
          property="og:description"
          content="Quality goods, delivered fast. Browse our full catalog at Byafa."
        />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-12 bg-gray-900 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
        aria-label="Hero"
      >
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Copy */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-4">
              New arrivals 2026
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
              Quality goods,<br className="hidden sm:block" /> delivered fast.
            </h1>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Handpicked products with real reviews, transparent pricing, and
              shipping you can track in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                Shop now
              </Link>
              <button
                onClick={() =>
                  document
                    .getElementById('categories')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center justify-center rounded-md border border-gray-600 px-6 py-3 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
              >
                Browse categories
              </button>
            </div>
          </div>

          {/* Hero visual — decorative product grid placeholder */}
          <div
            className="hidden lg:grid grid-cols-2 gap-3 w-80 shrink-0"
            aria-hidden="true"
          >
            {[
              'bg-emerald-900',
              'bg-gray-700',
              'bg-gray-700',
              'bg-emerald-900',
            ].map((bg, i) => (
              <div
                key={i}
                className={`${bg} rounded-xl aspect-square flex items-center justify-center text-3xl`}
              >
                {['💻', '👕', '🏠', '📚'][i]}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────── */}
      <section id="categories" className="mb-14" aria-labelledby="categories-heading">
        <h2
          id="categories-heading"
          className="text-xl font-bold text-gray-900 mb-5"
        >
          Shop by category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => navigate(`/products?category=${cat.value}`)}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
            >
              <span className="text-3xl" aria-hidden="true">
                {cat.emoji}
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────────────────── */}
      <section aria-labelledby="featured-heading" className="mb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 id="featured-heading" className="text-xl font-bold text-gray-900">
            Featured products
          </h2>
          <Link
            to="/products"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500 text-sm">No products yet.</p>
            <Link
              to="/products"
              className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline"
            >
              Browse catalog
            </Link>
          </div>
        ) : (
          <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Featured products"
          >
            {featured.map((product, index) => (
              <li key={product._id}>
                <ProductCard product={product} priority={index === 0} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Trust strip ───────────────────────────────────────────────── */}
      <section
        className="-mx-4 sm:-mx-6 lg:-mx-8 bg-white border-t border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-10 -mb-8"
        aria-label="Why shop with us"
      >
        <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl" aria-hidden="true">🔒</span>
            <p className="text-sm font-semibold text-gray-900">Secure checkout</p>
            <p className="text-xs text-gray-500">
              Payments processed by Stripe — your card details are never stored.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl" aria-hidden="true">📦</span>
            <p className="text-sm font-semibold text-gray-900">Real-time tracking</p>
            <p className="text-xs text-gray-500">
              Track your order status live from your account dashboard.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl" aria-hidden="true">⭐</span>
            <p className="text-sm font-semibold text-gray-900">Verified reviews</p>
            <p className="text-xs text-gray-500">
              Reviews only from customers who actually purchased the product.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
