import { Navigate, Outlet } from 'react-router-dom'
import { getStoredUser, getToken } from '../utils/auth'
import NotFound from '../pages/NotFound'

function ProtectedRoute({ adminOnly = false }) {
  const token = getToken()
  const user = getStoredUser()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <NotFound />
  }

  return <Outlet />
}

export default ProtectedRoute