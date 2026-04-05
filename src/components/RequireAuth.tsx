import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const returnTo = `${location.pathname}${location.search}` || '/'
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: returnTo === '/login' ? '/' : returnTo }}
      />
    )
  }

  return <Outlet />
}
