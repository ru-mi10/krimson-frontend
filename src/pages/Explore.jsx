// src/pages/Explore.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, GitFork, Layers, Eye, Compass } from 'lucide-react'
import client from '../api/client'
import Logo from '../components/ui/Logo'
import useAuth from '../hooks/useAuth'

const CATEGORIES = ['all', 'crm', 'analytics', 'ecommerce', 'saas', 'portfolio', 'fintech', 'healthcare', 'education', 'productivity']

const categoryLabel = {
  all: 'All', crm: 'CRM', analytics: 'Analytics', ecommerce: 'Ecommerce',
  saas: 'SaaS', portfolio: 'Portfolio', fintech: 'Fintech',
  healthcare: 'Healthcare', education: 'Education', productivity: 'Productivity',
}

const SystemCard = ({ system, onClick }) => (
  <div onClick={onClick}
    className="rounded-xl border p-5 flex flex-col gap-4 cursor-pointer transition-all duration-150 group"
    style={{ backgroundColor: '#111113', borderColor: '#27272A' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#3F3F46'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#27272A'}>

    {/* Header */}
    <div className="flex items-start justify-between gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: '#DC262620', color: '#DC2626' }}>
        {system.name?.[0]}
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full border flex-shrink-0"
        style={{ color: '#52525B', borderColor: '#27272A', backgroundColor: '#18181B' }}>
        {categoryLabel[system.category] || system.category}
      </span>
    </div>

    {/* Info */}
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{system.name}</p>
      {system.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#52525B' }}>
          {system.description}
        </p>
      )}
    </div>

    {/* Owner */}
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: '#27272A', color: '#71717A' }}>
        {system.ownerId?.username?.[0]?.toUpperCase()}
      </div>
      <span className="text-xs" style={{ color: '#52525B' }}>
        {system.ownerId?.username}
      </span>
    </div>

    {/* Stats */}
    <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: '#1C1C1F' }}>
      <div className="flex items-center gap-1.5">
        <Layers size={11} style={{ color: '#3F3F46' }} />
        <span className="text-xs" style={{ color: '#52525B' }}>{system.pageCount ?? 0} pages</span>
      </div>
      <div className="flex items-center gap-1.5">
        <GitFork size={11} style={{ color: '#3F3F46' }} />
        <span className="text-xs" style={{ color: '#52525B' }}>{system.stats?.forkCount ?? 0} forks</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Eye size={11} style={{ color: '#3F3F46' }} />
        <span className="text-xs" style={{ color: '#52525B' }}>{system.stats?.viewCount ?? 0} views</span>
      </div>
    </div>
  </div>
)

const SkeletonCard = () => (
  <div className="rounded-xl border p-5 flex flex-col gap-4 animate-pulse"
    style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#1C1C1F' }} />
    <div className="flex flex-col gap-2">
      <div className="h-4 w-32 rounded" style={{ backgroundColor: '#1C1C1F' }} />
      <div className="h-3 w-full rounded" style={{ backgroundColor: '#1C1C1F' }} />
      <div className="h-3 w-3/4 rounded" style={{ backgroundColor: '#1C1C1F' }} />
    </div>
    <div className="h-3 w-20 rounded" style={{ backgroundColor: '#1C1C1F' }} />
    <div className="flex gap-3 pt-3 border-t" style={{ borderColor: '#1C1C1F' }}>
      <div className="h-3 w-16 rounded" style={{ backgroundColor: '#1C1C1F' }} />
      <div className="h-3 w-16 rounded" style={{ backgroundColor: '#1C1C1F' }} />
    </div>
  </div>
)

const Explore = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    const fetchSystems = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ sort, limit: 24 })
        if (search.trim()) params.append('q', search.trim())
        if (category !== 'all') params.append('category', category)
        const { data } = await client.get(`/explore?${params}`)
        setSystems(data.systems || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    const timeout = setTimeout(fetchSystems, search ? 400 : 0)
    return () => clearTimeout(timeout)
  }, [search, category, sort])

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
            <>
              <button onClick={() => navigate('/login')}
                className="text-sm transition-colors duration-150"
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
            </>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col gap-10">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Compass size={14} style={{ color: '#DC2626' }} />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#52525B' }}>
              Explore
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#FAFAFA' }}>
            Browse UI Systems
          </h1>
          <p className="text-sm" style={{ color: '#52525B' }}>
            Discover complete product foundations. Fork them. Evolve them.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#52525B' }} />
              <input type="text" placeholder="Search Systems..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border outline-none transition-colors"
                style={{ backgroundColor: '#111113', borderColor: '#27272A', color: '#FAFAFA' }}
                onFocus={e => e.target.style.borderColor = '#3F3F46'}
                onBlur={e => e.target.style.borderColor = '#27272A'} />
            </div>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-xs px-3 py-2.5 rounded-lg border outline-none"
              style={{ backgroundColor: '#111113', borderColor: '#27272A', color: '#A1A1AA' }}>
              <option value="recent">Recent</option>
              <option value="popular">Most Viewed</option>
              <option value="forked">Most Forked</option>
            </select>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border"
                style={{
                  backgroundColor: category === cat ? '#18181B' : 'transparent',
                  borderColor: category === cat ? '#3F3F46' : 'transparent',
                  color: category === cat ? '#FAFAFA' : '#52525B',
                }}>
                {categoryLabel[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : systems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-2xl border flex items-center justify-center"
              style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
              <Compass size={20} style={{ color: '#3F3F46' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>No Systems found</p>
            <p className="text-xs" style={{ color: '#52525B' }}>
              {search ? 'Try a different search term.' : 'Be the first to publish a System.'}
            </p>
            {isAuthenticated && (
              <button onClick={() => navigate('/systems/create')}
                className="text-xs px-4 py-2 rounded-lg mt-1 transition-colors duration-150"
                style={{ backgroundColor: '#DC2626', color: '#FAFAFA' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#B91C1C'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#DC2626'}>
                Create a System
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs" style={{ color: '#3F3F46' }}>
              {systems.length} System{systems.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {systems.map(system => (
                <SystemCard key={system._id} system={system}
                  onClick={() => navigate(`/systems/${system.slug}/public`)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Explore