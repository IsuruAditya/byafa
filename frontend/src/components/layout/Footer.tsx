import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Main columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand column */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <img src="/logo.png" alt="Byafa" className="h-9 w-auto" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Quality goods, delivered fast. Real reviews, transparent pricing,
              and shipping you can track in real time.
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              <li><Link to="/products" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">All products</Link></li>
              <li><Link to="/products?category=electronics" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=clothing" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Clothing</Link></li>
              <li><Link to="/products?category=home" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Home & Living</Link></li>
              <li><Link to="/products?category=books" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Books</Link></li>
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Account
            </h3>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Sign in</Link></li>
              <li><Link to="/register" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Create account</Link></li>
              <li><Link to="/orders" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">My orders</Link></li>
              <li><Link to="/profile" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Profile</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Stay in the loop
            </h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              New arrivals, exclusive deals and updates — straight to your inbox.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault() }}
              className="space-y-2"
            >
              <input
                type="email"
                placeholder="Your email address"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Byafa. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>🔒 Secure payments by Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
