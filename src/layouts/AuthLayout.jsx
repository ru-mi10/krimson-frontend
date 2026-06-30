// src/layouts/AuthLayout.jsx
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Logo from '../components/ui/Logo'

const AuthLayout = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#09090B' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo size="lg" />
        </div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout