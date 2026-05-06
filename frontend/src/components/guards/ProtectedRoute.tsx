import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (!isAuthenticated && user === null) {
    // Admin paths redirect to the admin login portal, not the storefront login
    const isAdminPath = location.pathname.startsWith('/admin')
    const loginPath = isAdminPath ? '/admin/login' : '/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  return <Outlet />
}
