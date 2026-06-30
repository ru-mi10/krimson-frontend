// src/layouts/AppLayout.jsx
import { useState } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Compass, Plus, LogOut, Menu, X } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import Logo from '../components/ui/Logo'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/explore', icon: Compass, label: 'Explore' },
]

const AppLayout = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#09090B', color: '#FAFAFA' }}>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: '#09090B', borderColor: '#27272A' }}>
        <Logo size="sm" />
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: '#A1A1AA' }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', top: '49px' }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`w-56 flex flex-col fixed inset-y-0 left-0 z-20 border-r transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ backgroundColor: '#09090B', borderColor: '#27272A', paddingTop: '0' }}
      >
        {/* Logo - hidden on mobile since top bar has it */}
        <div className="hidden md:block px-5 py-5 border-b" style={{ borderColor: '#27272A' }}>
          <Logo />
        </div>
        <div className="md:hidden h-[49px]" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${isActive
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
                }
              `}
              style={({ isActive }) => isActive ? { backgroundColor: '#18181B' } : {}}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          <button
            onClick={() => { navigate('/systems/create'); setMobileOpen(false) }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
              text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors duration-150 mt-1"
          >
            <Plus size={16} />
            Create System
          </button>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t" style={{ borderColor: '#27272A' }}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ backgroundColor: '#111113' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: '#DC2626' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">{user?.username}</p>
            </div>
            <button onClick={handleLogout}
              className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-56 min-h-screen pt-[49px] md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout