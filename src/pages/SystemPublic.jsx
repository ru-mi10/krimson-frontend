// src/pages/SystemPublic.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GitFork, Layers, Eye, Clock, ArrowLeft, Globe, GitBranch, Loader } from 'lucide-react'
import client from '../api/client'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import useAuth from '../hooks/useAuth'

const categoryLabel = {
  crm: 'CRM', analytics: 'Analytics', ecommerce: 'Ecommerce',
  saas: 'SaaS', portfolio: 'Portfolio', fintech: 'Fintech',
  healthcare: 'Healthcare', education: 'Education',
  productivity: 'Productivity', other: 'Other',
}

const SystemPublic = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [system, setSystem] = useState(null)
  const [pages, setPages] = useState([])
  const [theme, setTheme] = useState(null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [forking, setForking] = useState(false)
  const [forkName, setForkName] = useState('')
  const [showForkModal, setShowForkModal] = useState(false)
  const [forkError, setForkError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await client.get(`/systems/${slug}`)
        setSystem(data.system)
        setPages(data.pages || [])
        setTheme(data.theme)
        setForkName(`${data.system.name} (Fork)`)
        const vRes = await client.get(`/systems/${slug}/versions`)
        setVersions(vRes.data.versions || [])
      } catch {
        navigate('/explore')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const handleFork = async () => {
    if (!isAuthenticated) return navigate('/register')
    if (!forkName.trim()) return
    setForking(true)
    setForkError('')
    try {
      const { data } = await client.post(`/systems/${slug}/fork`, { name: forkName.trim() })
      navigate(`/systems/${data.system.slug}`)
    } catch (err) {
      setForkError(err.response?.data?.message || 'Fork failed')
      setForking(false)
    }
  }

  const isOwner = user && system?.ownerId?._id?.toString() === user._id?.toString()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#09090B' }}>
        <Loader size={20} className="animate-spin" style={{ color: '#3F3F46' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#09090B', color: '#FAFAFA' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b sticky top-0 z-10"
        style={{ borderColor: '#27272A', backgroundColor: '#09090B' }}>
        <button onClick={() => navigate('/')}>
          <Logo size="md" />
        </button>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button onClick={() => navigate('/dashboard')}
              className="text-sm px-4 py-2 rounded-lg border transition-colors duration-150"
              style={{ borderColor: '#27272A', color: '#A1A1AA', backgroundColor: '#111113' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3F3F46'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#27272A'}>
              Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/register')}
              className="text-sm font-medium px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#DC2626', color: '#FAFAFA' }}>
              Get started
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-12 flex flex-col gap-10">

        {/* Back */}
        <button onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-xs w-fit transition-colors duration-150"
          style={{ color: '#52525B' }}
          onMouseEnter={e => e.currentTarget.style.color = '#A1A1AA'}
          onMouseLeave={e => e.currentTarget.style.color = '#52525B'}>
          <ArrowLeft size={13} /> Back to Explore
        </button>

        {/* System header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ backgroundColor: '#DC262620', color: '#DC2626' }}>
              {system?.name?.[0]}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>{system?.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full border"
                  style={{ color: '#4ADE80', backgroundColor: '#14532D20', borderColor: '#15803D30' }}>
                  Published
                </span>
                {system?.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ color: '#52525B', borderColor: '#27272A', backgroundColor: '#18181B' }}>
                    {categoryLabel[system.category]}
                  </span>
                )}
              </div>
              {system?.description && (
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: '#71717A' }}>
                  {system.description}
                </p>
              )}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: '#27272A', color: '#71717A' }}>
                    {system?.ownerId?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs" style={{ color: '#52525B' }}>
                    {system?.ownerId?.username}
                  </span>
                </div>
                {system?.forkedFrom?.systemName && (
                  <span className="text-xs flex items-center gap-1" style={{ color: '#52525B' }}>
                    <GitFork size={10} /> Forked from {system.forkedFrom.systemName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isOwner ? (
              <Button size="md" variant="secondary"
                onClick={() => navigate(`/systems/${slug}`)}>
                Open in Explorer
              </Button>
            ) : (
              <Button size="md" onClick={() => setShowForkModal(true)}>
                <GitFork size={14} /> Fork System
              </Button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 py-4 border-y" style={{ borderColor: '#18181B' }}>
          {[
            { icon: Layers, value: pages.length, label: 'Pages' },
            { icon: GitFork, value: system?.stats?.forkCount ?? 0, label: 'Forks' },
            { icon: Eye, value: system?.stats?.viewCount ?? 0, label: 'Views' },
            { icon: GitBranch, value: versions.length, label: 'Versions' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={14} style={{ color: '#3F3F46' }} />
              <span className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{value}</span>
              <span className="text-xs" style={{ color: '#52525B' }}>{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <Clock size={13} style={{ color: '#3F3F46' }} />
            <span className="text-xs" style={{ color: '#52525B' }}>
              {new Date(system?.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Pages */}
          <div className="col-span-2 flex flex-col gap-4">
            <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Pages</h2>
            <div className="flex flex-col gap-1">
              {pages.length === 0 ? (
                <div className="flex items-center justify-center py-8 rounded-lg border border-dashed"
                  style={{ borderColor: '#27272A' }}>
                  <p className="text-xs" style={{ color: '#52525B' }}>No pages in this System yet.</p>
                </div>
              ) : (
                pages.map((page, i) => (
                <div key={page._id}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-lg border"
                  style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
                  <span className="text-xs font-mono w-4 flex-shrink-0"
                    style={{ color: '#3F3F46' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{page.name}</p>
                    {page.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#52525B' }}>{page.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-mono" style={{ color: '#3F3F46' }}>/{page.slug}</span>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">

            {/* Theme preview */}
            {theme && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Theme</h2>
                <div className="rounded-xl border overflow-hidden"
                  style={{ borderColor: '#27272A', backgroundColor: '#111113' }}>
                  <div className="h-10 flex items-center px-3 gap-2 border-b"
                    style={{ backgroundColor: theme.tokens?.backgroundColor || '#09090B', borderColor: theme.tokens?.borderColor || '#27272A' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.tokens?.accentColor || '#DC2626' }} />
                    <div className="h-1.5 w-16 rounded" style={{ backgroundColor: theme.tokens?.borderColor || '#27272A' }} />
                  </div>
                  <div className="p-3 flex flex-col gap-2" style={{ backgroundColor: theme.tokens?.surfaceColor || '#111113' }}>
                    {['accentColor', 'backgroundColor', 'surfaceColor', 'borderColor'].map(key => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs capitalize" style={{ color: '#52525B' }}>
                          {key.replace('Color', '').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono" style={{ color: '#3F3F46' }}>
                            {theme.tokens?.[key] || '—'}
                          </span>
                          <div className="w-3.5 h-3.5 rounded-full border"
                            style={{ backgroundColor: theme.tokens?.[key] || '#09090B', borderColor: '#27272A' }} />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: theme.tokens?.borderColor || '#27272A' }}>
                      <span className="text-xs" style={{ color: '#52525B' }}>Font</span>
                      <span className="text-xs font-mono" style={{ color: '#3F3F46' }}>{theme.tokens?.fontFamily || 'Inter'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Versions */}
            {versions.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Versions</h2>
                <div className="flex flex-col gap-1.5">
                  {versions.slice(0, 5).map((v, i) => (
                    <div key={v._id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border"
                      style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: i === 0 ? '#DC2626' : '#3F3F46' }} />
                        <span className="text-xs font-medium" style={{ color: '#A1A1AA' }}>{v.name}</span>
                      </div>
                      <span className="text-xs" style={{ color: '#3F3F46' }}>
                        {new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fork CTA */}
            {!isOwner && (
              <div className="rounded-xl border p-4 flex flex-col gap-3"
                style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
                <p className="text-xs font-medium" style={{ color: '#FAFAFA' }}>Use this System</p>
                <p className="text-xs leading-relaxed" style={{ color: '#52525B' }}>
                  Fork it and make it yours. Rename pages, change the theme, evolve it.
                </p>
                <Button size="sm" onClick={() => setShowForkModal(true)} className="w-full">
                  <GitFork size={13} /> Fork System
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fork Modal */}
      {showForkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: '#00000080' }}
          onClick={(e) => e.target === e.currentTarget && setShowForkModal(false)}>
          <div className="w-full max-w-md rounded-2xl border p-6 flex flex-col gap-5"
            style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>Fork this System</h3>
              <p className="text-xs" style={{ color: '#52525B' }}>
                A complete copy will be added to your workspace.
              </p>
            </div>

            {/* Attribution */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
              style={{ backgroundColor: '#18181B' }}>
              <GitFork size={12} style={{ color: '#52525B' }} />
              <span className="text-xs" style={{ color: '#52525B' }}>
                Forked from <span style={{ color: '#A1A1AA' }}>{system?.name}</span> by{' '}
                <span style={{ color: '#A1A1AA' }}>{system?.ownerId?.username}</span>
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#A1A1AA' }}>
                Your System Name
              </label>
              <input type="text" value={forkName}
                onChange={e => setForkName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                style={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#FAFAFA' }}
                onFocus={e => e.target.style.borderColor = '#3F3F46'}
                onBlur={e => e.target.style.borderColor = '#27272A'} />
            </div>

            {forkError && (
              <p className="text-xs text-center py-2 px-3 rounded-lg"
                style={{ color: '#FCA5A5', backgroundColor: '#DC262615', border: '1px solid #DC262630' }}>
                {forkError}
              </p>
            )}

            <div className="flex gap-2">
              <Button loading={forking} onClick={handleFork} className="flex-1">
                <GitFork size={14} /> Fork System
              </Button>
              <Button variant="secondary" onClick={() => setShowForkModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemPublic