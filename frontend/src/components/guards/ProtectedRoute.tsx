import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const location = useLocation()

  // user === null and isAuthenticated === false means not logged in
  // We check user specifically so we don't redirect before auth init resolves
  if (!isAuthenticated && user === null) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
