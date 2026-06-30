// src/hooks/useAuth.js
import useAuthStore from '../store/authStore'

const useAuth = () => {
  const { user, token, isLoading, setAuth, logout, fetchMe } = useAuthStore()
  return { user, token, isLoading, isAuthenticated: !!token, setAuth, logout, fetchMe }
}

export default useAuth