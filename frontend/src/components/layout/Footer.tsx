import { Link } from 'react-router-dom'

/**
 * Site footer — navigation links, legal, and trust badges only.
 * Industry standard (ASOS, Zara, Shopify): footer is purely informational.
 * Newsletter signup lives in its own section above this.
 */
export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Main columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-10">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <Link to="/" aria-label="Byafa home">
              <img src="/logo.png" alt="Byafa" className="h-9 w-auto" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Quality goods, delivered fast. Real reviews, transparent pricing.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/products', label: 'All products' },
                { to: '/products?category=electronics', label: 'Electronics' },
                { to: '/products?category=clothing', label: 'Clothing' },
                { to: '/products?category=home', label: 'Home & Living' },
                { to: '/products?category=books', label: 'Books' },
                { to: '/products?category=sports', label: 'Sports' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Account
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/login', label: 'Sign in' },
                { to: '/register', label: 'Create account' },
                { to: '/orders', label: 'My orders' },
                { to: '/profile', label: 'Profile' },
                { to: '/cart', label: 'Cart' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Help
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@byafa.com" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  Contact us
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-600">Shipping info</span>
              </li>
              <li>
                <span className="text-sm text-gray-600">Returns</span>
              </li>
              <li>
                <span className="text-sm text-gray-600">FAQ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar — legal + trust badges */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 order-2 sm:order-1">
            © {new Date().getFullYear()} Byafa. All rights reserved.
          </p>

          {/* Payment trust badges */}
          <div className="flex items-center gap-3 order-1 sm:order-2">
            <span className="text-xs text-gray-400 mr-1">Secure payments:</span>
            {/* Stripe badge */}
            <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
              🔒 Stripe
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
              💳 Visa
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
              💳 Mastercard
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
