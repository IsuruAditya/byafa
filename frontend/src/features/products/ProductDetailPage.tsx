import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getProductByIdApi } from '../../api/productsApi'
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
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  // orderId from a completed order containing this product — enables review form
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null)

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  // How many of this item are already in the cart
  const cartQuantity = useAppSelector(
    (s) => s.cart.items.find((i) => i.productId === id)?.quantity ?? 0
  )

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

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

  // Keep stock in sync when product first loads
  useEffect(() => {
    if (product) refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id])

  // Fetch reviews
  useEffect(() => {
    if (!id) return
    getProductReviewsApi(id)
      .then((res) => { if (res.success && res.data) setReviews(res.data) })
      .catch(() => {/* non-critical */})
  }, [id])

  // Find an eligible order for the review form (authenticated users only)
  useEffect(() => {
    if (!isAuthenticated || !id) return
    getMyOrdersApi()
      .then((res) => {
        if (!res.success || !res.data) return
        const order = res.data.find(
          (o) =>
            o.status !== 'cancelled' &&
            o.items.some((item) => item.productId === id)
        )
        if (order) setEligibleOrderId(order._id)
      })
      .catch(() => {/* non-critical */})
  }, [isAuthenticated, id])

  async function handleAddToCart() {
    if (!product) return
    setAddingToCart(true)
    try {
      dispatch(
        addToCart({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0] ?? '',
          quantity: 1,
          stockQuantity: stock,
        })
      )
      dispatch(addToast({ message: `${product.name} added to cart`, type: 'success' }))
      // Refresh stock count after adding to cart
      await refresh()
    } finally {
      setAddingToCart(false)
    }
  }

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
        <Link
          to="/products"
          className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Back to products
        </Link>
      </div>
    )
  }

  const images =
    product.images.length > 0
      ? product.images
      : ['https://placehold.co/600x400?text=No+Image']

  // Optimised variants
  const fullImages = images.map((url) => cloudinaryFull(url, 800))
  const thumbImages = images.map((url) => cloudinaryThumb(url, 64, 64))

  const canAddMore = stock > cartQuantity
  const outOfStock = stock === 0

  return (
    <>
      <Helmet>
        <title>{product.name} | Byafa</title>
        <meta name="description" content={product.description.slice(0, 160)} />
        {/* Open Graph */}
        <meta property="og:title" content={`${product.name} | Byafa`} />
        <meta property="og:description" content={product.description.slice(0, 160)} />
        {product.images[0] && (
          <meta property="og:image" content={product.images[0]} />
        )}
        <meta property="og:type" content="product" />
      </Helmet>

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/products" className="hover:text-indigo-600 transition-colors">
              Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="capitalize text-gray-400">{product.category}</li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-700 font-medium truncate max-w-[200px]">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ── Images ─────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 aspect-4/3">
            <img
              src={fullImages[selectedImage]}
              alt={product.name}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </div>

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
                    selectedImage === i
                      ? 'border-indigo-500'
                      : 'border-transparent hover:border-gray-300',
                  ].join(' ')}
                >
                  <img
                    src={thumbImages[i]}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ───────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Category + name */}
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-500">
              {product.category}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <StarRating
            average={product.ratings.average}
            count={product.ratings.count}
            size="md"
          />

          {/* Price */}
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(product.price)}
          </p>

          {/* Stock status */}
          <div className="flex items-center gap-2 text-sm">
            {outOfStock ? (
              <span className="font-medium text-red-600">Out of stock</span>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                <span className="text-gray-600">
                  {refreshing ? (
                    <span className="inline-flex items-center gap-1">
                      <Spinner size="sm" /> Checking stock…
                    </span>
                  ) : (
                    <>
                      <span className="font-medium text-gray-900">{stock}</span> in stock
                      {cartQuantity > 0 && (
                        <span className="ml-1 text-gray-400">
                          ({cartQuantity} in your cart)
                        </span>
                      )}
                    </>
                  )}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Add to cart */}
          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={outOfStock || !canAddMore}
            isLoading={addingToCart}
            onClick={() => void handleAddToCart()}
          >
            {outOfStock
              ? 'Out of stock'
              : !canAddMore
              ? 'Max quantity in cart'
              : 'Add to cart'}
          </Button>

          {!canAddMore && !outOfStock && (
            <p className="text-xs text-amber-600">
              You already have the maximum available quantity in your cart.
            </p>
          )}
        </div>
      </div>

      {/* ── Reviews ──────────────────────────────────────────────────── */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Customer reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-base font-normal text-gray-400">
              ({reviews.length})
            </span>
          )}
        </h2>

        {/* Review form — only for users who purchased this product */}
        {eligibleOrderId && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Write a review
            </h3>
            <ReviewForm
              productId={product._id}
              orderId={eligibleOrderId}
              onReviewSubmitted={(review) => {
                setReviews((prev) => [review, ...prev])
                setEligibleOrderId(null) // hide form after submission
              }}
            />
          </div>
        )}

        <ReviewList reviews={reviews} />
      </div>
    </>
  )
}
