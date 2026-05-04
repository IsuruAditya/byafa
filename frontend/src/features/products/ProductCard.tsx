import { Link } from 'react-router-dom'
import type { Product } from '../../types/product.types'
import { StarRating } from '../../components/ui/StarRating'
import { formatCurrency } from '../../utils/formatCurrency'
import { cloudinaryThumb } from '../../utils/cloudinaryImage'

interface ProductCardProps {
  product: Product
  priority?: boolean // true for first card — skip lazy load for LCP
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const rawImage = product.images[0] ?? 'https://placehold.co/400x300?text=No+Image'
  const image = cloudinaryThumb(rawImage, 400, 300)
  const inStock = product.stockQuantity > 0

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      aria-label={product.name}
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
        {!inStock && (
          <span className="absolute top-2 left-2 rounded-full bg-gray-800/80 px-2 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
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
        <p className="mt-auto pt-2 text-base font-bold text-gray-900">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  )
}
