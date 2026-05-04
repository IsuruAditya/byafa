import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { clearCart } from '../../store/slices/cartSlice'
import { logoutApi } from '../../api/authApi'

// ── Icons ────────────────────────────────────────────────────────────────────

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13L5.4 5M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── Nav link active style helper ─────────────────────────────────────────────

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'text-sm font-medium transition-colors',
    isActive
      ? 'text-indigo-600'
      : 'text-gray-600 hover:text-gray-900',
  ].join(' ')

// ── Main component ────────────────────────────────────────────────────────────

export function Navbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  )

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close drawer on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  async function handleLogout() {
    try { await logoutApi() } catch { /* clear local state regardless */ }
    dispatch(logout())
    dispatch(clearCart())
    setDrawerOpen(false)
    setAccountOpen(false)
    navigate('/', { replace: true })
  }

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <>
      {/* ── Header bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* ── Left: Logo ──────────────────────────────────────── */}
            <Link
              to="/"
              className="shrink-0 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors tracking-tight"
            >
              Byafa
            </Link>

            {/* ── Center: Desktop nav links ───────────────────────── */}
            <nav
              className="hidden md:flex items-center gap-8"
              aria-label="Main navigation"
            >
              <NavLink to="/products" className={navLinkClass}>
                Shop
              </NavLink>
              <NavLink
                to="/products?category=electronics"
                className={navLinkClass}
              >
                Electronics
              </NavLink>
              <NavLink
                to="/products?category=clothing"
                className={navLinkClass}
              >
                Clothing
              </NavLink>
              <NavLink
                to="/products?category=home"
                className={navLinkClass}
              >
                Home
              </NavLink>
            </nav>

            {/* ── Right: Actions ──────────────────────────────────── */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount !== 1 ? 's' : ''}` : ''}`}
              >
                <CartIcon />
                {cartCount > 0 && (
                  <span
                    aria-live="polite"
                    aria-atomic="true"
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Account — desktop only */}
              <div className="relative hidden md:block" ref={accountRef}>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => setAccountOpen((o) => !o)}
                      className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      aria-expanded={accountOpen}
                      aria-haspopup="true"
                    >
                      <UserIcon />
                      <span className="max-w-[100px] truncate">{user?.name}</span>
                      <ChevronDownIcon />
                    </button>

                    {/* Dropdown */}
                    {accountOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
                          {user?.role === 'admin' && (
                            <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        <Link
                          to="/orders"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          My orders
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Profile
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            Admin dashboard
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex md:hidden h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
                aria-expanded={drawerOpen}
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────── */}

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          aria-hidden="true"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col md:hidden',
          'transition-transform duration-300 ease-in-out',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-gray-200 shrink-0">
          <Link
            to="/"
            onClick={closeDrawer}
            className="text-xl font-bold text-indigo-600 tracking-tight"
          >
            Byafa
          </Link>
          <button
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1" aria-label="Mobile navigation">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Shop
          </p>
          {[
            { to: '/products', label: 'All products' },
            { to: '/products?category=electronics', label: 'Electronics' },
            { to: '/products?category=clothing', label: 'Clothing' },
            { to: '/products?category=home', label: 'Home & Living' },
            { to: '/products?category=books', label: 'Books' },
            { to: '/products?category=sports', label: 'Sports' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={closeDrawer}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
            >
              {label}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Account
                </p>
                <Link
                  to="/orders"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                >
                  My orders
                </Link>
                <Link
                  to="/profile"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                >
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeDrawer}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    Admin dashboard
                  </Link>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Drawer footer — auth actions */}
        <div className="shrink-0 border-t border-gray-200 px-4 py-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeDrawer}
                className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={closeDrawer}
                className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
