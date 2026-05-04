import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { clearCart } from '../../store/slices/cartSlice'
import { logoutApi } from '../../api/authApi'
import { Button } from '../ui/Button'

export function Navbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  )

  async function handleLogout() {
    try {
      await logoutApi()
    } catch {
      // Even if the API call fails, clear local state
    } finally {
      dispatch(logout())
      dispatch(clearCart())
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Byafa
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Cart — always visible */}
          <Link
            to="/cart"
            className="relative text-gray-600 hover:text-indigo-600 transition-colors"
            aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13L5.4 5M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
            {cartCount > 0 && (
              <span
                aria-live="polite"
                aria-atomic="true"
                className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/orders"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Orders
              </Link>
              <Link
                to="/profile"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {user?.name}
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
