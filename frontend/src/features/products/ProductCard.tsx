import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/product.types'
import { StarRating } from '../../components/ui/StarRating'
import { formatCurrency } from '../../utils/formatCurrency'
import { cloudinaryThumb } from '../../utils/cloudinaryImage'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const dispatch = useAppDispatch()
  const cartQuantity = useAppSelector(
    (s) => s.cart.items.find((i) => i.productId === product._id)?.quantity ?? 0
  )
  const [adding, setAdding] = useState(false)

  const rawImage = product.images[0] ?? 'https://placehold.co/400x300?text=No+Image'
  const image = cloudinaryThumb(rawImage, 400, 300)
  const inStock = product.stockQuantity > 0
  const isLowStock = inStock && product.stockQuantity <= 5
  const canAdd = inStock && cartQuantity < product.stockQuantity

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!canAdd || adding) return
    setAdding(true)
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? '',
        quantity: 1,
        stockQuantity: product.stockQuantity,
      })
    )
    dispatch(addToast({ message: `${product.name} added to cart`, type: 'success' }))
    // Reset after brief feedback window
    window.setTimeout(() => setAdding(false), 800)
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      aria-label={`View ${product.name}`}
    >
      {/* Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Stock badge — top left */}
        {!inStock && (
          <span className="absolute top-2 left-2 rounded-full bg-gray-800/80 px-2.5 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
        {isLowStock && (
          <span className="absolute top-2 left-2 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-xs font-semibold text-white">
            Only {product.stockQuantity} left
          </span>
        )}

        {/* Quick Add to Cart — appears on hover (desktop) / always visible (mobile) */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 md:block">
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            aria-label={`Add ${product.name} to cart`}
            className={[
              'w-full py-2.5 text-sm font-semibold transition-colors',
              canAdd
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            {adding ? '✓ Added!' : !inStock ? 'Out of stock' : cartQuantity > 0 ? `Add more (${cartQuantity} in cart)` : 'Add to cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">
          {product.category}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>
        <StarRating
          average={product.ratings.average}
          count={product.ratings.count}
        />
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <p className="text-base font-bold text-gray-900">
            {formatCurrency(product.price)}
          </p>
          {/* Mobile Add to Cart — always visible below price */}
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            aria-label={`Add ${product.name} to cart`}
            className={[
              'md:hidden shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              canAdd
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            {adding ? '✓' : !inStock ? 'Sold out' : '+ Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}
