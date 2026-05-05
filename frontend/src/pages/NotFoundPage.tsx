import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>Page Not Found | Byafa</title>
      </Helmet>
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        {/* Large 404 */}
        <p className="text-8xl font-extrabold text-emerald-600 leading-none mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Page not found
        </h1>
        <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It may have been
          moved, deleted, or never existed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Go to homepage
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Go back
          </button>
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Browse products
          </Link>
        </div>
      </div>
    </>
  )
}
