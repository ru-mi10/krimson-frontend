// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, GitFork, Eye, Clock, ArrowRight, Layers } from 'lucide-react'
import client from '../api/client'
import useAuth from '../hooks/useAuth'
import Button from '../components/ui/Button'

const statusColor = {
  draft: { bg: '#18181B', text: '#71717A', border: '#27272A', label: 'Draft' },
  published: { bg: '#14532D20', text: '#4ADE80', border: '#15803D30', label: 'Published' },
  archived: { bg: '#27272A', text: '#52525B', border: '#3F3F46', label: 'Archived' },
}

const categoryLabel = {
  crm: 'CRM', analytics: 'Analytics', ecommerce: 'Ecommerce',
  saas: 'SaaS', portfolio: 'Portfolio', fintech: 'Fintech',
  healthcare: 'Healthcare', education: 'Education',
  productivity: 'Productivity', other: 'Other',
}

const SystemCard = ({ system, onClick }) => {
  const s = statusColor[system.status] || statusColor.draft
  return (
    <div onClick={onClick}
      className="rounded-xl border p-5 flex flex-col gap-4 cursor-pointer transition-all duration-150 group"
      style={{ backgroundColor: '#111113', borderColor: '#27272A' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#3F3F46'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#27272A'}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-semibold truncate" style={{ color: '#FAFAFA' }}>
            {system.name}
          </span>
          {system.description && (
            <span className="text-xs leading-relaxed line-clamp-2" style={{ color: '#52525B' }}>
              {system.description}
            </span>
          )}
        </div>
        <ArrowRight size={14} className="flex-shrink-0 mt-0.5 transition-transform duration-150 group-hover:translate-x-0.5"
          style={{ color: '#3F3F46' }} />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full border"
          style={{ color: s.text, backgroundColor: s.bg, borderColor: s.border }}>
          {s.label}
        </span>
        {system.category && (
          <span className="text-xs" style={{ color: '#3F3F46' }}>
            {categoryLabel[system.category] || system.category}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: '#1C1C1F' }}>
        <div className="flex items-center gap-1.5">
          <Layers size={11} style={{ color: '#3F3F46' }} />
          <span className="text-xs" style={{ color: '#52525B' }}>
            {system.pageCount ?? 0} pages
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <GitFork size={11} style={{ color: '#3F3F46' }} />
          <span className="text-xs" style={{ color: '#52525B' }}>
            {system.stats?.forkCount ?? 0} forks
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Clock size={11} style={{ color: '#3F3F46' }} />
          <span className="text-xs" style={{ color: '#3F3F46' }}>
            {new Date(system.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}

const EmptyState = ({ onCreateClick }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-5">
    <div className="w-14 h-14 rounded-2xl border flex items-center justify-center"
      style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
      <Layers size={22} style={{ color: '#3F3F46' }} />
    </div>
    <div className="text-center flex flex-col gap-1.5">
      <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>No Systems yet</p>
      <p className="text-xs" style={{ color: '#52525B' }}>
        Create your first System to start building.
      </p>
    </div>
    <Button onClick={onCreateClick} size="md">
      <Plus size={14} /> Create System
    </Button>
  </div>
)

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const { data } = await client.get('/systems')
        // Fetch page counts
        const withCounts = await Promise.all(
          data.systems.map(async (s) => {
            try {
              const res = await client.get(`/systems/${s.slug}/pages`)
              return { ...s, pageCount: res.data.pages.length }
            } catch {
              return { ...s, pageCount: 0 }
            }
          })
        )
        setSystems(withCounts)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSystems()
  }, [])

  const filtered = filter === 'all' ? systems : systems.filter(s => s.status === filter)

  const counts = {
    all: systems.length,
    draft: systems.filter(s => s.status === 'draft').length,
    published: systems.filter(s => s.status === 'published').length,
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#09090B' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold" style={{ color: '#FAFAFA' }}>
              {user?.fullName?.split(' ')[0]}'s Workspace
            </h1>
            <p className="text-sm" style={{ color: '#52525B' }}>
              {counts.all === 0
                ? 'No Systems yet'
                : `${counts.all} System${counts.all !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button onClick={() => navigate('/systems/create')}>
            <Plus size={14} /> New System
          </Button>
        </div>

        {/* Filter tabs */}
        {counts.all > 0 && (
          <div className="flex items-center gap-1 border-b pb-0" style={{ borderColor: '#18181B' }}>
            {[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'draft', label: 'Draft', count: counts.draft },
              { key: 'published', label: 'Published', count: counts.published },
            ].map(({ key, label, count }) => (
              <button key={key} onClick={() => setFilter(key)}
                className="px-4 py-2.5 text-xs font-medium border-b-2 transition-all duration-150 -mb-px"
                style={{
                  color: filter === key ? '#FAFAFA' : '#52525B',
                  borderBottomColor: filter === key ? '#DC2626' : 'transparent',
                  backgroundColor: 'transparent',
                }}>
                {label}
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: filter === key ? '#27272A' : '#18181B',
                    color: filter === key ? '#A1A1AA' : '#3F3F46',
                  }}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border p-5 flex flex-col gap-4 animate-pulse"
                style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
                <div className="h-4 w-32 rounded" style={{ backgroundColor: '#1C1C1F' }} />
                <div className="h-3 w-full rounded" style={{ backgroundColor: '#1C1C1F' }} />
                <div className="h-3 w-20 rounded" style={{ backgroundColor: '#1C1C1F' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreateClick={() => navigate('/systems/create')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(system => (
              <SystemCard
                key={system._id}
                system={system}
                onClick={() => navigate(`/systems/${system.slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard