// src/pages/Landing.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'

const SYSTEMS = [
  { name: 'Agency CRM', pages: ['Dashboard', 'Clients', 'Analytics', 'Billing', 'Settings'], category: 'CRM' },
  { name: 'Fintech Dashboard', pages: ['Overview', 'Transactions', 'Portfolio', 'Reports', 'Compliance'], category: 'Fintech' },
  { name: 'Healthcare Platform', pages: ['Patients', 'Appointments', 'Records', 'Billing', 'Staff'], category: 'Healthcare' },
  { name: 'SaaS Admin', pages: ['Dashboard', 'Users', 'Subscriptions', 'Analytics', 'Settings'], category: 'SaaS' },
]

const SystemCard = ({ system, active }) => (
  <div
    className="absolute inset-0 transition-all duration-700"
    style={{ opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(12px)' }}
  >
    <div className="rounded-xl border overflow-hidden h-full"
      style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#27272A', backgroundColor: '#18181B' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#DC2626' }} />
          <span className="text-xs font-medium" style={{ color: '#FAFAFA' }}>{system.name}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full border"
          style={{ color: '#A1A1AA', borderColor: '#27272A', backgroundColor: '#09090B' }}>
          {system.category}
        </span>
      </div>
      <div className="flex" style={{ height: 'calc(100% - 41px)' }}>
        <div className="w-32 border-r py-3 flex flex-col gap-0.5 px-2"
          style={{ borderColor: '#27272A', backgroundColor: '#0D0D0F' }}>
          {system.pages.map((page, i) => (
            <div key={page}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md"
              style={{
                backgroundColor: i === 0 ? '#18181B' : 'transparent',
                color: i === 0 ? '#FAFAFA' : '#52525B',
              }}>
              <div className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: i === 0 ? '#DC2626' : '#3F3F46' }} />
              <span className="text-xs truncate">{page}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg p-3 border"
                style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
                <div className="h-1.5 w-8 rounded mb-2" style={{ backgroundColor: '#27272A' }} />
                <div className="h-3 w-12 rounded" style={{ backgroundColor: '#3F3F46' }} />
              </div>
            ))}
          </div>
          <div className="flex-1 rounded-lg border p-3"
            style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
            <div className="h-1.5 w-16 rounded mb-3" style={{ backgroundColor: '#27272A' }} />
            <div className="flex items-end gap-1 h-16">
              {[40,65,45,80,55,90,70,85,60,95,75,88].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    backgroundColor: i === 10 ? '#DC2626' : '#27272A',
                    opacity: i === 10 ? 1 : 0.6,
                  }} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border" style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 border-b last:border-0"
                style={{ borderColor: '#27272A' }}>
                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: '#27272A' }} />
                <div className="h-1.5 rounded flex-1" style={{ backgroundColor: '#27272A' }} />
                <div className="h-1.5 w-10 rounded" style={{ backgroundColor: '#27272A' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const Landing = () => {
  const navigate = useNavigate()
  const [activeSystem, setActiveSystem] = useState(0)
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
    intervalRef.current = setInterval(() => {
      setActiveSystem(prev => (prev + 1) % SYSTEMS.length)
    }, 3000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const switchSystem = (i) => {
    setActiveSystem(i)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActiveSystem(prev => (prev + 1) % SYSTEMS.length)
    }, 3000)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#09090B', color: '#FAFAFA' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: '#27272A' }}>
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/explore')}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors duration-150"
            style={{ color: '#A1A1AA' }}
            onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
            onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}>
            Explore
          </button>
          <button onClick={() => navigate('/login')}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors duration-150"
            style={{ color: '#A1A1AA' }}
            onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
            onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}>
            Sign in
          </button>
          <button onClick={() => navigate('/register')}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150"
            style={{ backgroundColor: '#DC2626', color: '#FAFAFA' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#B91C1C'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#DC2626'}>
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-8 py-20 grid grid-cols-2 gap-20 items-center">

          {/* Left */}
          <div className="flex flex-col gap-8 transition-all duration-1000"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)' }}>

            <div className="flex items-center gap-2 w-fit">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#DC2626' }} />
              <span className="text-xs font-medium tracking-widest uppercase"
                style={{ color: '#A1A1AA' }}>
                System-first UI builder
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-bold leading-none tracking-tight"
                style={{ fontSize: '52px', color: '#FAFAFA' }}>
                Build UI Systems.
              </h1>
              <h1 className="font-bold leading-none tracking-tight"
                style={{ fontSize: '52px', color: '#27272A' }}>
                Not just components.
              </h1>
            </div>

            <p className="text-base leading-relaxed max-w-md" style={{ color: '#71717A' }}>
              Create complete product foundations. Version them. Fork them.
              Evolve them. The System is the artifact — not the code.
            </p>

            <div className="flex items-center gap-5">
              <button onClick={() => navigate('/register')}
                className="px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{ backgroundColor: '#DC2626', color: '#FAFAFA' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#B91C1C'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#DC2626'}>
                Create your first System
              </button>
              <button onClick={() => navigate('/explore')}
                className="text-sm transition-colors duration-150"
                style={{ color: '#52525B' }}
                onMouseEnter={e => e.currentTarget.style.color = '#A1A1AA'}
                onMouseLeave={e => e.currentTarget.style.color = '#52525B'}>
                Browse Systems →
              </button>
            </div>

            <div className="flex items-center gap-8 pt-4 border-t" style={{ borderColor: '#18181B' }}>
              {[
                { value: 'System-first', label: 'Architecture' },
                { value: 'Version', label: 'Everything' },
                { value: 'Fork', label: 'Freely' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{value}</span>
                  <span className="text-xs" style={{ color: '#52525B' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="transition-all duration-1000"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: '200ms'
            }}>
            <div className="flex items-center gap-1 mb-3">
              {SYSTEMS.map((s, i) => (
                <button key={s.name} onClick={() => switchSystem(i)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                  style={{
                    backgroundColor: activeSystem === i ? '#18181B' : 'transparent',
                    color: activeSystem === i ? '#FAFAFA' : '#52525B',
                    border: `1px solid ${activeSystem === i ? '#27272A' : 'transparent'}`,
                  }}>
                  {s.category}
                </button>
              ))}
            </div>
            <div className="relative" style={{ height: '360px' }}>
              {SYSTEMS.map((system, i) => (
                <SystemCard key={system.name} system={system} active={activeSystem === i} />
              ))}
            </div>
            <p className="text-center text-xs mt-3" style={{ color: '#3F3F46' }}>
              Complete product foundations — not isolated components
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="border-t" style={{ borderColor: '#18181B' }}>
        <div className="max-w-7xl mx-auto px-8 py-20">
          <p className="text-xs font-medium tracking-widest uppercase mb-12 text-center"
            style={{ color: '#3F3F46' }}>
            How Krimson works
          </p>
          <div className="grid grid-cols-4 gap-0">
            {[
              { step: '01', title: 'Create a System', desc: 'Name your product foundation. Add a description and category.' },
              { step: '02', title: 'Define Pages', desc: 'Add product surfaces — Dashboard, Analytics, Billing, Settings.' },
              { step: '03', title: 'Set the Theme', desc: 'One theme controls the entire System. Colors, type, motion.' },
              { step: '04', title: 'Version & Publish', desc: 'Snapshot your System. Publish it. Let others fork and evolve it.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4 px-6 border-l first:border-l-0"
                style={{ borderColor: '#18181B' }}>
                <span className="text-xs font-mono mt-0.5 flex-shrink-0"
                  style={{ color: '#DC2626' }}>{step}</span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{title}</span>
                  <span className="text-xs leading-relaxed" style={{ color: '#52525B' }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-8 py-6 flex items-center justify-between"
        style={{ borderColor: '#18181B' }}>
        <Logo size="sm" />
        <span className="text-xs" style={{ color: '#3F3F46' }}>
          The System is the product.
        </span>
      </div>
    </div>
  )
}

export default Landing