import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { clearCart } from '../../store/slices/cartSlice'
import { logoutApi } from '../../api/authApi'
import { ThemeToggle } from '../ui/ThemeToggle'

// ── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  )
}

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

// ── Component ─────────────────────────────────────────────────────────────────

export function Navbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  )

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setDrawerOpen(false); setAccountOpen(false) }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`)
      setSearchQuery('')
      setDrawerOpen(false)
    }
  }

  const closeDrawer = () => setDrawerOpen(false)

  const CATEGORIES = [
    { to: '/products', label: 'All Products' },
    { to: '/products?category=electronics', label: 'Electronics' },
    { to: '/products?category=clothing', label: 'Clothing' },
    { to: '/products?category=home', label: 'Home & Living' },
    { to: '/products?category=books', label: 'Books' },
    { to: '/products?category=sports', label: 'Sports' },
  ]

  return (
    <>
      {/* ── Announcement bar — scrolls with page (not sticky) ────────── */}
      <div className="bg-emerald-600 text-white text-xs font-medium text-center py-2 px-4 tracking-wide">
        🚚 Free shipping on orders over $50 &nbsp;·&nbsp; Secure checkout via Stripe
      </div>

      {/* ── Sticky header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-900/50">

        {/* ── Row 1: Logo | Search (centered) | Actions ─────────────── */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 gap-4">

              {/* Col 1: Logo — left */}
              <Link to="/" className="shrink-0 flex items-center">
                <img src="/logo.png" alt="Byafa" className="h-11 w-auto dark:brightness-0 dark:invert" />
              </Link>

              {/* Col 2: Search — truly centered */}
              <form
                onSubmit={handleSearch}
                className="hidden md:flex w-full max-w-2xl mx-auto"
                role="search"
              >
                <div className="flex w-full rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-emerald-400 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-gray-50 dark:bg-gray-800">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands and more…"
                    className="flex-1 px-5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent focus:outline-none"
                    aria-label="Search products"
                  />
                  <button
                    type="submit"
                    className="px-5 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 font-medium text-sm"
                    aria-label="Search"
                  >
                    <SearchIcon />
                    <span className="hidden lg:inline">Search</span>
                  </button>
                </div>
              </form>

              {/* Col 3: Actions — right */}
              <div className="flex items-center gap-1">

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount !== 1 ? 's' : ''}` : ''}`}
                >
                  <CartIcon />
                  {cartCount > 0 && (
                    <span
                      aria-live="polite"
                      aria-atomic="true"
                      className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* Account — desktop */}
                <div className="relative hidden md:block" ref={accountRef}>
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => setAccountOpen((o) => !o)}
                        className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-expanded={accountOpen}
                        aria-haspopup="true"
                      >
                        <UserIcon />
                        <span className="max-w-[90px] truncate hidden lg:inline">{user?.name}</span>
                        <ChevronDownIcon />
                      </button>

                      {accountOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/50 py-1 z-50">
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            {user?.role === 'admin' && (
                              <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <Link to="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <span>📦</span> My orders
                          </Link>
                          <Link to="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <span>👤</span> Profile
                          </Link>
                          {user?.role === 'admin' && (
                            <Link to="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                              <span>⚙️</span> Admin dashboard
                            </Link>
                          )}
                          <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                            <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <span>🚪</span> Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-3 py-2 whitespace-nowrap">
                        Sign in
                      </Link>
                      <Link to="/register" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap">
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

                {/* Theme toggle — desktop */}
                <div className="hidden md:flex">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 1.5: Mobile search bar ─────────────────────────────── */}
        <div className="md:hidden border-b border-gray-100 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-900">
          <form onSubmit={handleSearch} role="search">
            <div className="flex rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden focus-within:border-emerald-500 bg-gray-50 dark:bg-gray-800">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent focus:outline-none"
                aria-label="Search products"
              />
              <button type="submit" className="px-4 bg-emerald-600 text-white flex items-center justify-center" aria-label="Search">
                <SearchIcon />
              </button>
            </div>
          </form>
        </div>

        {/* ── Row 2: Category nav — desktop only ───────────────────── */}
        <nav
          className="hidden md:block border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900"
          aria-label="Category navigation"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-0 h-11 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    [
                      'px-4 h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px',
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400'
                        : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600',
                    ].join(' ')
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" aria-hidden="true" onClick={closeDrawer} />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          'fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-2xl flex flex-col md:hidden',
          'transition-transform duration-300 ease-in-out',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <Link to="/" onClick={closeDrawer} className="shrink-0">
            <img src="/logo.png" alt="Byafa" className="h-11 w-auto dark:brightness-0 dark:invert" />
          </Link>
          <button
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Mobile search */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <form onSubmit={handleSearch} role="search">
            <div className="flex rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden focus-within:border-emerald-500 bg-white dark:bg-gray-800">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent focus:outline-none"
                aria-label="Search products"
              />
              <button type="submit" className="px-4 bg-emerald-600 text-white flex items-center justify-center" aria-label="Search">
                <SearchIcon />
              </button>
            </div>
          </form>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto" aria-label="Mobile navigation">
          <div className="px-4 pt-4 pb-2">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Shop</p>
            {CATEGORIES.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeDrawer}
                className="flex items-center rounded-lg px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {isAuthenticated && (
            <div className="px-4 pt-2 pb-4 border-t border-gray-100 dark:border-gray-700">
              <p className="px-3 pt-3 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Account</p>
              <Link to="/orders" onClick={closeDrawer} className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <span>📦</span> My orders
              </Link>
              <Link to="/profile" onClick={closeDrawer} className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <span>👤</span> Profile
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={closeDrawer} className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                  <span>⚙️</span> Admin dashboard
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Drawer footer */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-4 space-y-2">
          {/* Theme toggle — mobile */}
          <ThemeToggle showLabel />

          {isAuthenticated ? (
            <>
              <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-800 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeDrawer} className="flex w-full items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Sign in
              </Link>
              <Link to="/register" onClick={closeDrawer} className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
