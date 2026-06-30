// src/App.jsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'

import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Explore from './pages/Explore'
import SystemExplorer from './pages/SystemExplorer'
import SystemPublic from './pages/SystemPublic'
import CreateSystem from './pages/CreateSystem'

const App = () => {
  const { fetchMe } = useAuth()

  useEffect(() => {
    fetchMe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/systems/:slug/public" element={<SystemPublic />} />

        {/* Auth */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* App */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/systems/create" element={<CreateSystem />} />
          <Route path="/systems/:slug" element={<SystemExplorer />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App