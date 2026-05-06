import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

export function AdminRoute() {
  const user = useAppSelector((s) => s.auth.user)

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
