import { Link } from 'react-router-dom'

// ── Social icons ──────────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

/**
 * Production-grade footer — brand block with logo + tagline + socials,
 * navigation columns, trust badges, and a full legal bottom bar.
 *
 * Pattern: Amazon / ASOS / Shopify stores — dark footer for visual separation,
 * wide brand column, social links, payment icons, and legal links.
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Main grid ─────────────────────────────────────────────── */}
        <div className="py-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* Brand column — wider, anchors the footer */}
          <div className="space-y-5">
            <Link to="/" aria-label="Byafa home" className="inline-block">
              <img
                src="/logo.png"
                alt="Byafa"
                className="h-14 w-auto brightness-0 invert"
              />
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Quality goods, delivered fast. Real reviews, transparent pricing — no surprises at checkout.
            </p>

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              SSL secured &amp; PCI compliant
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Byafa on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Byafa on X (Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Byafa on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">
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
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">
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
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">
              Help
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@byafa.com"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Contact support
                </a>
              </li>
              {['Shipping info', 'Returns & refunds', 'FAQ', 'Size guide'].map((label) => (
                <li key={label}>
                  <span className="text-sm text-gray-500 cursor-default">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Payment methods strip ──────────────────────────────────── */}
        <div className="border-t border-gray-800 py-6 flex flex-wrap items-center gap-3">
          <span className="text-xs text-gray-500 mr-1">We accept:</span>
          {[
            { label: 'Visa', icon: '💳' },
            { label: 'Mastercard', icon: '💳' },
            { label: 'Amex', icon: '💳' },
            { label: 'PayPal', icon: '🅿️' },
            { label: 'Stripe', icon: '🔒' },
          ].map(({ label, icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-400"
            >
              {icon} {label}
            </span>
          ))}
        </div>

        {/* ── Legal bottom bar ───────────────────────────────────────── */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 order-2 sm:order-1">
            © {currentYear} Byafa. All rights reserved.
          </p>

          <nav aria-label="Legal links" className="flex flex-wrap items-center gap-x-5 gap-y-2 order-1 sm:order-2">
            {[
              { label: 'Privacy Policy', href: '#' },
              { label: 'Terms of Service', href: '#' },
              { label: 'Cookie Policy', href: '#' },
              { label: 'Accessibility', href: '#' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

      </div>
    </footer>
  )
}
