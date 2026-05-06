import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { setCredentials } from '../../store/slices/authSlice'
import { loginApi } from '../../api/authApi'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import axios from 'axios'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect back to the page the user was trying to visit, or home
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

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
        dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }))
        navigate(from, { replace: true })
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message: string =
          err.response?.data?.message ?? 'Login failed. Please try again.'
        setError('root', { message })
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <img src="/logo.png" alt="Byafa" className="h-12 w-auto mx-auto dark:brightness-0 dark:invert" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {errors.root && (
            <p
              className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2"
              role="alert"
            >
              {errors.root.message}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
