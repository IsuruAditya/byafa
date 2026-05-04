import { Link } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice'
import type { CartItem } from '../../store/slices/cartSlice'
import { formatCurrency } from '../../utils/formatCurrency'

interface CartItemRowProps {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const dispatch = useAppDispatch()

  function handleQuantityChange(value: string) {
    const qty = parseInt(value, 10)
    if (!isNaN(qty)) {
      dispatch(updateQuantity({ productId: item.productId, quantity: qty }))
    }
  }

  function handleRemove() {
    dispatch(removeFromCart(item.productId))
  }

  return (
    <li className="flex gap-4 py-5">
      {/* Thumbnail */}
      <Link
        to={`/products/${item.productId}`}
        className="shrink-0 h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={item.image || 'https://placehold.co/80x80?text=?'}
          alt={item.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <Link
          to={`/products/${item.productId}`}
          className="text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2"
        >
          {item.name}
        </Link>
        <p className="text-sm text-gray-500">
          {formatCurrency(item.price)} each
        </p>

        {/* Quantity controls */}
        <div className="mt-auto flex items-center gap-3">
          <div className="flex items-center rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() =>
                dispatch(
                  updateQuantity({
                    productId: item.productId,
                    quantity: item.quantity - 1,
                  })
                )
              }
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
              className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={item.stockQuantity}
              value={item.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              aria-label={`Quantity for ${item.name}`}
              className="w-10 text-center text-sm font-medium text-gray-900 border-x border-gray-300 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() =>
                dispatch(
                  updateQuantity({
                    productId: item.productId,
                    quantity: item.quantity + 1,
                  })
                )
              }
              disabled={item.quantity >= item.stockQuantity}
              aria-label="Increase quantity"
              className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
            aria-label={`Remove ${item.name} from cart`}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Line total */}
      <p className="shrink-0 text-sm font-bold text-gray-900 self-start pt-0.5">
        {formatCurrency(item.price * item.quantity)}
      </p>
    </li>
  )
}
