import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getProductByIdApi, getProductsApi } from '../../api/productsApi'
import { getProductReviewsApi } from '../../api/reviewsApi'
import type { Product } from '../../types/product.types'
import type { Review } from '../../types/review.types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import { useStockPolling } from './useStockPolling'
import { StarRating } from '../../components/ui/StarRating'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { ProductCard } from './ProductCard'
import { formatCurrency } from '../../utils/formatCurrency'
import { cloudinaryFull, cloudinaryThumb } from '../../utils/cloudinaryImage'
import { ReviewList } from '../reviews/ReviewList'
import { ReviewForm } from '../reviews/ReviewForm'
import { getMyOrdersApi } from '../../api/ordersApi'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null)

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const cartQuantity = useAppSelector(
    (s) => s.cart.items.find((i) => i.productId === id)?.quantity ?? 0
  )

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    setSelectedImage(0)
    setRelatedProducts([])

    getProductByIdApi(id)
      .then((res) => {
        if (res.success && res.data) setProduct(res.data)
        else setError('Product not found.')
      })
      .catch(() => setError('Failed to load product. Please try again.'))
      .finally(() => setLoading(false))
  }, [id])

  const { stock, refreshing, refresh } = useStockPolling(
    id ?? '',
    product?.stockQuantity ?? 0
  )

  useEffect(() => {
    if (product) {
      refresh()
      // Fetch related products from same category
      getProductsApi({ category: product.category, pageSize: 4 })
        .then((res) => {
          if (res.data) {
            setRelatedProducts(res.data.filter((p) => p._id !== product._id).slice(0, 4))
          }
        })
        .catch(() => {/* non-critical */})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id])

  useEffect(() => {
    if (!id) return
    getProductReviewsApi(id)
      .then((res) => { if (res.success && res.data) setReviews(res.data) })
      .catch(() => {/* non-critical */})
  }, [id])

  useEffect(() => {
    if (!isAuthenticated || !id) return
    getMyOrdersApi()
      .then((res) => {
        if (!res.success || !res.data) return
        const order = res.data.find(
          (o) => o.status !== 'cancelled' && o.items.some((item) => item.productId === id)
        )
        if (order) setEligibleOrderId(order._id)
      })
      .catch(() => {/* non-critical */})
  }, [isAuthenticated, id])

  // Close lightbox on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!lightboxOpen) return
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setSelectedImage((i) => Math.min(i + 1, (product?.images.length ?? 1) - 1))
      if (e.key === 'ArrowLeft') setSelectedImage((i) => Math.max(i - 1, 0))
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, product?.images.length])

  // Lock scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  const handleAddToCart = useCallback(async () => {
    if (!product) return
    setAddingToCart(true)
    try {
      dispatch(addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? '',
        quantity: 1,
        stockQuantity: stock,
      }))
      dispatch(addToast({ message: `${product.name} added to cart`, type: 'success' }))
      await refresh()
    } finally {
      setAddingToCart(false)
    }
  }, [product, stock, dispatch, refresh])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm text-red-600">{error ?? 'Product not found.'}</p>
        <Link to="/products" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline">
          ← Back to products
        </Link>
      </div>
    )
  }

  const images = product.images.length > 0 ? product.images : ['https://placehold.co/600x400?text=No+Image']
  const fullImages = images.map((url) => cloudinaryFull(url, 1200))
  const displayImages = images.map((url) => cloudinaryFull(url, 800))
  const thumbImages = images.map((url) => cloudinaryThumb(url, 80, 80))

  const canAddMore = stock > cartQuantity
  const outOfStock = stock === 0

  return (
    <>
      <Helmet>
        <title>{product.name} | Byafa</title>
        <meta name="description" content={product.description.slice(0, 160)} />
        <meta property="og:title" content={`${product.name} | Byafa`} />
        <meta property="og:description" content={product.description.slice(0, 160)} />
        {product.images[0] && <meta property="og:image" content={product.images[0]} />}
        <meta property="og:type" content="product" />
      </Helmet>

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image viewer"
          >
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl leading-none px-2"
                onClick={(e) => { e.stopPropagation(); setSelectedImage((i) => Math.max(i - 1, 0)) }}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl leading-none px-2"
                onClick={(e) => { e.stopPropagation(); setSelectedImage((i) => Math.min(i + 1, images.length - 1)) }}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
          <img
            src={fullImages[selectedImage]}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-white/60 text-sm">
            {selectedImage + 1} / {images.length} · Click outside or press Esc to close
          </p>
        </div>
      )}

      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li><Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/products" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Products</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to={`/products?category=${product.category}`} className="capitalize hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{product.category}</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ── Images ─────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Main image */}
          <button
            className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-4/3 cursor-zoom-in relative group"
            onClick={() => setLightboxOpen(true)}
            aria-label="View full size image"
          >
            <img
              src={displayImages[selectedImage]}
              alt={product.name}
              fetchPriority="high"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              🔍 Zoom
            </span>
          </button>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={selectedImage === i}
                  className={[
                    'shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors',
                    selectedImage === i ? 'border-emerald-500' : 'border-transparent hover:border-gray-300',
                  ].join(' ')}
                >
                  <img src={thumbImages[i]} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ───────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Category + name */}
          <div>
            <Link
              to={`/products?category=${product.category}`}
              className="text-sm font-medium uppercase tracking-wide text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300"
            >
              {product.category}
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <StarRating average={product.ratings.average} count={product.ratings.count} size="md" />

          {/* Price */}
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(product.price)}
          </p>

          {/* Stock status */}
          <div className="flex items-center gap-2 text-sm">
            {outOfStock ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                Out of stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                {refreshing ? (
                  <span className="inline-flex items-center gap-1"><Spinner size="sm" /> Checking…</span>
                ) : stock <= 5 ? (
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Only {stock} left in stock — order soon</span>
                ) : (
                  <>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">In Stock</span>
                    {cartQuantity > 0 && <span className="text-gray-400 dark:text-gray-500">({cartQuantity} in cart)</span>}
                  </>
                )}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
            {product.description}
          </p>

          {/* Add to cart */}
          {outOfStock ? (
            <div className="space-y-3">
              <Button size="lg" className="w-full" disabled>
                Out of stock
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                💌 Want to be notified when this is back?{' '}
                <a href="mailto:support@byafa.com?subject=Restock notification" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  Email us
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                disabled={!canAddMore}
                isLoading={addingToCart}
                onClick={() => void handleAddToCart()}
              >
                {!canAddMore ? 'Max quantity in cart' : 'Add to cart'}
              </Button>
              {!canAddMore && (
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  You have the maximum available quantity in your cart.
                </p>
              )}
            </div>
          )}

          {/* Trust signals */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>🔒</span> Secure checkout via Stripe — card details never stored
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>📦</span> Real-time order tracking from your account
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>⭐</span> Reviews from verified purchasers only
            </p>
          </div>
        </div>
      </div>

      {/* ── Related products ─────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">You might also like</h2>
            <Link
              to={`/products?category=${product.category}`}
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
            >
              View all {product.category} →
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <li key={p._id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Reviews ──────────────────────────────────────────────────── */}
      <div className="mt-14 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Customer reviews
            {reviews.length > 0 && (
              <span className="ml-2 text-base font-normal text-gray-400 dark:text-gray-500">({reviews.length})</span>
            )}
          </h2>
          {product.ratings.count > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{product.ratings.average.toFixed(1)}</span>
              <StarRating average={product.ratings.average} count={product.ratings.count} />
            </div>
          )}
        </div>

        {eligibleOrderId && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">✍️ Write a review</h3>
            <ReviewForm
              productId={product._id}
              orderId={eligibleOrderId}
              onReviewSubmitted={(review) => {
                setReviews((prev) => [review, ...prev])
                setEligibleOrderId(null)
              }}
            />
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <ReviewList reviews={reviews} />
        )}
      </div>

      {/* ── Sticky mobile Add to Cart bar ────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 shadow-lg">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.price)}</p>
        </div>
        <Button
          size="md"
          disabled={outOfStock || !canAddMore}
          isLoading={addingToCart}
          onClick={() => void handleAddToCart()}
          className="shrink-0"
        >
          {outOfStock ? 'Out of stock' : !canAddMore ? 'Max qty' : 'Add to cart'}
        </Button>
      </div>
      {/* Spacer so sticky bar doesn't cover content on mobile */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  )
}
