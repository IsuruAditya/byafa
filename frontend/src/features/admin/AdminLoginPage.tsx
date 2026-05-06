import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setCredentials } from '../../store/slices/authSlice'
import { loginApi } from '../../api/authApi'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import axios from 'axios'
import { useEffect } from 'react'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

/**
 * Standalone admin login page — completely separate from the storefront login.
 * Only allows users with role='admin' to proceed.
 * Pattern: Shopify /admin, WooCommerce /wp-admin, Magento /admin
 */
export default function AdminLoginPage() {
  const dispatch   = useAppDispatch()
  const navigate   = useNavigate()
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)

  // Already logged in as admin — go straight to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      const res = await loginApi({ email: values.email, password: values.password })

      if (res.success && res.data) {
        if (res.data.user.role !== 'admin') {
          setError('root', { message: 'Access denied. This portal is for administrators only.' })
          return
        }
        dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }))
        navigate('/admin', { replace: true })
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message: string = err.response?.data?.message ?? 'Login failed. Please try again.'
        setError('root', { message })
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-900">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-gray-900 border-r border-gray-800">
        <img src="/logo.png" alt="Byafa" className="h-16 w-auto brightness-0 invert mb-8" />
        <h1 className="text-3xl font-bold text-white mb-3">Byafa Admin</h1>
        <p className="text-gray-400 text-center max-w-xs leading-relaxed">
          Manage your products, orders, inventory, customers, and analytics from one place.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-xs">
          {[
            { label: 'Products', icon: '🛍️' },
            { label: 'Inventory', icon: '📦' },
            { label: 'Orders', icon: '🚚' },
            { label: 'Analytics', icon: '📈' },
          ].map(({ label, icon }) => (
            <div key={label} className="flex items-center gap-2.5 bg-gray-800 rounded-xl px-4 py-3">
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-medium text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="Byafa" className="h-12 w-auto brightness-0 invert mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Admin Portal</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-1">Sign in to Admin</h2>
            <p className="text-sm text-gray-400 mb-6">Administrator access only</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {errors.root && (
                <div className="rounded-lg bg-red-900/40 border border-red-700 px-3 py-2.5" role="alert">
                  <p className="text-sm text-red-400">{errors.root.message}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                isLoading={isSubmitting}
              >
                Sign in to Admin
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            Not an admin?{' '}
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
              Go to storefront →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
