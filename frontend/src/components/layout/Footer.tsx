import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-indigo-600">Byafa</p>
          <nav aria-label="Footer navigation">
            <ul className="flex items-center gap-6 text-sm text-gray-500">
              <li>
                <Link to="/products" className="hover:text-indigo-600 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-indigo-600 transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-600 transition-colors">
                  Account
                </Link>
              </li>
            </ul>
          </nav>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Byafa
          </p>
        </div>
      </div>
    </footer>
  )
}
