// src/pages/SystemExplorer.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layers, Palette, GitBranch, Activity,
  Plus, Trash2, GripVertical, Sparkles, Globe,
  Clock, GitFork, Eye, ChevronRight, Check, Loader,
  RotateCcw, Code2, Download
} from 'lucide-react'
import client from '../api/client'
import Button from '../components/ui/Button'
import CodePreviewModal from '../components/CodePreviewModal'

// ── Sidebar sections ───────────────────────────────────────────────────────
const SECTIONS = [
  { key: 'pages', label: 'Pages', icon: Layers },
  { key: 'theme', label: 'Theme', icon: Palette },
  { key: 'versions', label: 'Versions', icon: GitBranch },
  { key: 'activity', label: 'Activity', icon: Activity },
]

// ── Activity event labels ──────────────────────────────────────────────────
const activityLabel = {
  system_created: 'Created this System',
  system_updated: 'Updated System details',
  system_published: 'Published System',
  system_archived: 'Archived System',
  page_created: (m) => `Added page "${m.pageName}"`,
  page_updated: (m) => `Updated page "${m.pageName}"`,
  page_deleted: (m) => `Deleted page "${m.pageName}"`,
  page_reordered: 'Reordered pages',
  theme_updated: 'Updated theme',
  version_created: (m) => `Created version "${m.versionName}"`,
  system_forked: (m) => `Forked by ${m.forkedByUsername}`,
  forked_from: (m) => `Forked from "${m.sourceSystemName}"`,
}

const getActivityLabel = (type, metadata) => {
  const val = activityLabel[type]
  if (!val) return type
  if (typeof val === 'function') return val(metadata || {})
  return val
}

// ── Pages Section ──────────────────────────────────────────────────────────
const PagesSection = ({ system, pages, setPages, theme }) => {
  const [newPageName, setNewPageName] = useState('')
  const [adding, setAdding] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [codePage, setCodePage] = useState(null)

  const addPage = async () => {
    if (!newPageName.trim()) return
    setAdding(true)
    try {
      const { data } = await client.post(`/systems/${system.slug}/pages`, {
        name: newPageName.trim(),
        order: pages.length,
      })
      setPages(prev => [...prev, data.page])
      setNewPageName('')
      setShowInput(false)
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const deletePage = async (pageSlug, pageId) => {
    setDeletingId(pageId)
    try {
      await client.delete(`/systems/${system.slug}/pages/${pageSlug}`)
      setPages(prev => prev.filter(p => p._id !== pageId))
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const suggestPages = async () => {
    setAiLoading(true)
    try {
      const { data } = await client.post('/ai/suggest-pages', {
        systemName: system.name,
        existingPages: pages.map(p => p.name),
      })
      const newPages = await Promise.all(
        data.pages.map((p, i) =>
          client.post(`/systems/${system.slug}/pages`, {
            name: p.name, description: p.description,
            icon: p.icon, order: pages.length + i,
          }).then(r => r.data.page).catch(() => null)
        )
      )
      setPages(prev => [...prev, ...newPages.filter(Boolean)])
    } catch (err) {
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>Pages</h2>
          <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>
            {pages.length} page{pages.length !== 1 ? 's' : ''} in this System
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={suggestPages} disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors duration-150 disabled:opacity-40"
            style={{ backgroundColor: '#111113', borderColor: '#27272A', color: '#A1A1AA' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3F3F46'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#27272A'}>
            {aiLoading ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI Suggest
          </button>
          <Button size="sm" onClick={() => setShowInput(true)}>
            <Plus size={13} /> Add Page
          </Button>
        </div>
      </div>

      {/* Add page input */}
      {showInput && (
        <div className="flex gap-2 p-3 rounded-lg border" style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
          <input autoFocus type="text" placeholder="Page name..."
            value={newPageName}
            onChange={e => setNewPageName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addPage(); if (e.key === 'Escape') setShowInput(false) }}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: '#FAFAFA' }} />
          <Button size="sm" loading={adding} onClick={addPage}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowInput(false); setNewPageName('') }}>Cancel</Button>
        </div>
      )}

      {/* Pages list */}
      <div className="flex flex-col gap-1">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl border border-dashed"
            style={{ borderColor: '#27272A' }}>
            <Layers size={20} style={{ color: '#3F3F46' }} />
            <p className="text-xs" style={{ color: '#52525B' }}>No pages yet. Add your first page.</p>
          </div>
        ) : (
          pages.map((page, i) => (
            <div key={page._id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border group transition-all duration-150"
              style={{ backgroundColor: '#111113', borderColor: '#27272A' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3F3F46'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#27272A'}>
              <GripVertical size={14} style={{ color: '#3F3F46' }} className="cursor-grab" />
              <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono flex-shrink-0"
                style={{ backgroundColor: '#18181B', color: '#52525B' }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{page.name}</p>
                {page.description && (
                  <p className="text-xs truncate mt-0.5" style={{ color: '#52525B' }}>{page.description}</p>
                )}
              </div>
              <span className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: '#3F3F46' }}>
                /{page.slug}
              </span>
              {page.generatedCode && (
                <span className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: '#14532D20', color: '#4ADE80' }}>
                  Coded
                </span>
              )}
              <button onClick={() => setCodePage(page)}
                className="p-1 rounded transition-colors"
                style={{ color: '#52525B' }}
                onMouseEnter={e => e.currentTarget.style.color = '#A1A1AA'}
                onMouseLeave={e => e.currentTarget.style.color = '#52525B'}>
                <Code2 size={13} />
              </button>
              <button onClick={() => deletePage(page.slug, page._id)}
                disabled={deletingId === page._id}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                style={{ color: '#52525B' }}
                onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#52525B'}>
                {deletingId === page._id
                  ? <Loader size={13} className="animate-spin" />
                  : <Trash2 size={13} />}
              </button>
            </div>
          ))
        )}
      </div>

      {codePage && (
        <CodePreviewModal
          system={system}
          page={codePage}
          theme={theme}
          onClose={() => setCodePage(null)}
          onSaved={(updatedPage) => {
            setPages(prev => prev.map(p => p._id === updatedPage._id ? updatedPage : p))
            setCodePage(updatedPage)
          }}
        />
      )}
    </div>
  )
}

// ── Theme Section ──────────────────────────────────────────────────────────
const ThemeSection = ({ system, theme, setTheme }) => {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [tokens, setTokens] = useState(theme?.tokens || {})

  const setToken = (key, value) => setTokens(t => ({ ...t, [key]: value }))

  const saveTheme = async () => {
    setSaving(true)
    try {
      const { data } = await client.put(`/systems/${system.slug}/theme`, { tokens })
      setTheme(data.theme)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const suggestTheme = async () => {
    setAiLoading(true)
    try {
      const { data } = await client.post('/ai/suggest-theme', {
        systemName: system.name,
        category: system.category,
        appearance: tokens.appearance || 'dark',
      })
      setTokens(t => ({ ...t, ...data.suggestion.tokens }))
    } catch (err) {
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  const ColorToken = ({ label, tokenKey }) => (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#1C1C1F' }}>
      <span className="text-xs" style={{ color: '#A1A1AA' }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono" style={{ color: '#52525B' }}>{tokens[tokenKey] || '—'}</span>
        <div className="relative w-7 h-7 rounded-lg overflow-hidden border cursor-pointer"
          style={{ borderColor: '#27272A', backgroundColor: tokens[tokenKey] || '#09090B' }}>
          <input type="color" value={tokens[tokenKey] || '#09090B'}
            onChange={e => setToken(tokenKey, e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
      </div>
    </div>
  )

  const SelectToken = ({ label, tokenKey, options }) => (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#1C1C1F' }}>
      <span className="text-xs" style={{ color: '#A1A1AA' }}>{label}</span>
      <select value={tokens[tokenKey] || options[0]}
        onChange={e => setToken(tokenKey, e.target.value)}
        className="text-xs rounded-lg px-2 py-1.5 border outline-none"
        style={{ backgroundColor: '#18181B', borderColor: '#27272A', color: '#FAFAFA' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>Theme</h2>
          <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>Controls the entire System's visual identity</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={suggestTheme} disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors duration-150 disabled:opacity-40"
            style={{ backgroundColor: '#111113', borderColor: '#27272A', color: '#A1A1AA' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3F3F46'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#27272A'}>
            {aiLoading ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI Suggest
          </button>
          <Button size="sm" loading={saving} onClick={saveTheme}>
            {saved ? <><Check size={13} /> Saved</> : 'Save Theme'}
          </Button>
        </div>
      </div>

      {/* Preview bar */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#27272A' }}>
        <div className="h-12 flex items-center px-4 gap-3"
          style={{ backgroundColor: tokens.backgroundColor || '#09090B', borderBottom: `1px solid ${tokens.borderColor || '#27272A'}` }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tokens.accentColor || '#DC2626' }} />
          <span className="text-xs font-medium" style={{ color: tokens.primaryTextColor || '#FAFAFA', fontFamily: tokens.fontFamily || 'Inter' }}>
            {system.name}
          </span>
          <div className="ml-auto flex gap-2">
            {['', '', ''].map((_, i) => (
              <div key={i} className="h-1.5 rounded-full" style={{ width: `${[32, 24, 20][i]}px`, backgroundColor: tokens.borderColor || '#27272A' }} />
            ))}
          </div>
        </div>
        <div className="h-20 flex gap-0" style={{ backgroundColor: tokens.surfaceColor || '#111113' }}>
          <div className="w-24 h-full border-r" style={{ borderColor: tokens.borderColor || '#27272A', backgroundColor: tokens.backgroundColor || '#09090B' }}>
            {['', '', ''].map((_, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-2">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: i === 0 ? tokens.accentColor || '#DC2626' : tokens.borderColor || '#27272A' }} />
                <div className="h-1.5 rounded flex-1" style={{ backgroundColor: tokens.borderColor || '#27272A' }} />
              </div>
            ))}
          </div>
          <div className="flex-1 p-3 grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border p-2" style={{ backgroundColor: tokens.backgroundColor || '#09090B', borderColor: tokens.borderColor || '#27272A' }}>
                <div className="h-1.5 w-8 rounded mb-1.5" style={{ backgroundColor: tokens.borderColor || '#27272A' }} />
                <div className="h-2.5 w-12 rounded" style={{ backgroundColor: tokens.accentColor ? `${tokens.accentColor}30` : '#27272A' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Token controls */}
      <div className="rounded-xl border divide-y-0" style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
        <div className="px-5 py-4">
          <p className="text-xs font-medium mb-3" style={{ color: '#52525B' }}>APPEARANCE</p>
          <SelectToken label="Mode" tokenKey="appearance" options={['dark', 'light']} />
          <ColorToken label="Accent Color" tokenKey="accentColor" />
          <ColorToken label="Background" tokenKey="backgroundColor" />
          <ColorToken label="Surface" tokenKey="surfaceColor" />
          <ColorToken label="Border" tokenKey="borderColor" />
          <ColorToken label="Primary Text" tokenKey="primaryTextColor" />
          <ColorToken label="Secondary Text" tokenKey="secondaryTextColor" />
        </div>
        <div className="px-5 py-4 border-t" style={{ borderColor: '#1C1C1F' }}>
          <p className="text-xs font-medium mb-3" style={{ color: '#52525B' }}>TYPOGRAPHY & SHAPE</p>
          <SelectToken label="Font Family" tokenKey="fontFamily"
            options={['Inter', 'Geist', 'Space Grotesk', 'Outfit', 'Plus Jakarta Sans']} />
          <SelectToken label="Font Size" tokenKey="fontSize" options={['compact', 'default', 'comfortable']} />
          <SelectToken label="Border Radius" tokenKey="borderRadius" options={['none', 'subtle', 'default', 'rounded']} />
          <SelectToken label="Motion" tokenKey="motion" options={['none', 'subtle', 'default']} />
        </div>
      </div>
    </div>
  )
}

// ── Versions Section ───────────────────────────────────────────────────────
const VersionsSection = ({ system, versions, setVersions }) => {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [restoringId, setRestoringId] = useState(null)

  const createVersion = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const { data } = await client.post(`/systems/${system.slug}/versions`, {
        name: name.trim(), description: desc.trim()
      })
      setVersions(prev => [data.version, ...prev])
      setName('')
      setDesc('')
      setShowForm(false)
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const restoreVersion = async (versionId) => {
    setRestoringId(versionId)
    try {
      await client.post(`/systems/${system.slug}/versions/${versionId}/restore`)
      window.location.reload()
    } catch (err) {
      console.error(err)
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>Versions</h2>
          <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>Snapshots of your System's evolution</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={13} /> Create Version
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border p-4 flex flex-col gap-3"
          style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
          <input type="text" placeholder="Version name (e.g. v1.0, Beta)"
            value={name} onChange={e => setName(e.target.value)}
            className="w-full text-sm bg-transparent outline-none border-b py-2"
            style={{ borderColor: '#27272A', color: '#FAFAFA' }} />
          <input type="text" placeholder="Description (optional)"
            value={desc} onChange={e => setDesc(e.target.value)}
            className="w-full text-sm bg-transparent outline-none border-b py-2"
            style={{ borderColor: '#27272A', color: '#FAFAFA' }} />
          <div className="flex gap-2">
            <Button size="sm" loading={creating} onClick={createVersion}>Save Snapshot</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl border border-dashed"
            style={{ borderColor: '#27272A' }}>
            <GitBranch size={20} style={{ color: '#3F3F46' }} />
            <p className="text-xs" style={{ color: '#52525B' }}>No versions yet. Create your first snapshot.</p>
          </div>
        ) : (
          versions.map((v, i) => (
            <div key={v._id}
              className="flex items-start gap-4 p-4 rounded-xl border group transition-all duration-150"
              style={{ backgroundColor: '#111113', borderColor: '#27272A' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3F3F46'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#27272A'}>
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 0 ? '#DC2626' : '#3F3F46' }} />
                {i < versions.length - 1 && <div className="w-px flex-1 min-h-4" style={{ backgroundColor: '#27272A' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{v.name}</p>
                  {i === 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#DC262615', color: '#FCA5A5' }}>
                      Latest
                    </span>
                  )}
                </div>
                {v.description && <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>{v.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs" style={{ color: '#3F3F46' }}>
                    {v.snapshot?.pages?.length ?? 0} pages
                  </span>
                  <span className="text-xs" style={{ color: '#3F3F46' }}>
                    {new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              {i > 0 && (
                <button onClick={() => restoreVersion(v._id)} disabled={restoringId === v._id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border"
                  style={{ borderColor: '#27272A', color: '#A1A1AA', backgroundColor: '#18181B' }}>
                  {restoringId === v._id ? <Loader size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                  Restore
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Activity Section ───────────────────────────────────────────────────────
const ActivitySection = ({ system }) => {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get(`/systems/${system.slug}/activity`)
      .then(({ data }) => setActivity(data.activity))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [system.slug])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>Activity</h2>
        <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>Everything that has happened to this System</p>
      </div>
      <div className="flex flex-col gap-1">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg animate-pulse"
              style={{ backgroundColor: '#111113' }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#27272A' }} />
              <div className="h-3 rounded flex-1" style={{ backgroundColor: '#1C1C1F' }} />
              <div className="h-3 w-16 rounded" style={{ backgroundColor: '#1C1C1F' }} />
            </div>
          ))
        ) : activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl border border-dashed"
            style={{ borderColor: '#27272A' }}>
            <Activity size={20} style={{ color: '#3F3F46' }} />
            <p className="text-xs" style={{ color: '#52525B' }}>No activity yet.</p>
          </div>
        ) : (
          activity.map((a) => (
            <div key={a._id} className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ backgroundColor: '#111113' }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#DC2626' }} />
              <p className="flex-1 text-xs" style={{ color: '#A1A1AA' }}>
                {getActivityLabel(a.type, a.metadata)}
              </p>
              <span className="text-xs flex-shrink-0" style={{ color: '#3F3F46' }}>
                {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Main SystemExplorer ────────────────────────────────────────────────────
const SystemExplorer = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [section, setSection] = useState('pages')
  const [system, setSystem] = useState(null)
  const [pages, setPages] = useState([])
  const [theme, setTheme] = useState(null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await client.get(`/systems/${slug}`)
        setSystem(data.system)
        setPages(data.pages || [])
        setTheme(data.theme)
        const vRes = await client.get(`/systems/${slug}/versions`)
        setVersions(vRes.data.versions || [])
      } catch {
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const handleExport = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('krimson_token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/export/${slug}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-krimson.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const handlePublish = async () => {    setPublishing(true)
    try {
      const { data } = await client.post(`/systems/${slug}/publish`)
      setSystem(data.system)
    } catch (err) {
      console.error(err)
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#09090B' }}>
        <Loader size={20} className="animate-spin" style={{ color: '#3F3F46' }} />
      </div>
    )
  }

  const isPublished = system?.status === 'published'

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#09090B' }}>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b"
        style={{ borderColor: '#27272A', backgroundColor: '#09090B' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')}
            className="text-xs transition-colors duration-150"
            style={{ color: '#52525B' }}
            onMouseEnter={e => e.currentTarget.style.color = '#A1A1AA'}
            onMouseLeave={e => e.currentTarget.style.color = '#52525B'}>
            Dashboard
          </button>
          <ChevronRight size={12} style={{ color: '#3F3F46' }} />
          <span className="text-xs font-medium" style={{ color: '#FAFAFA' }}>{system?.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full border ml-1"
            style={{
              color: isPublished ? '#4ADE80' : '#71717A',
              backgroundColor: isPublished ? '#14532D20' : '#18181B',
              borderColor: isPublished ? '#15803D30' : '#27272A',
            }}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
          {system?.forkedFrom?.systemName && (
            <span className="text-xs flex items-center gap-1" style={{ color: '#52525B' }}>
              <GitFork size={10} /> Forked from {system.forkedFrom.systemName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPublished && (
            <button onClick={() => navigate(`/systems/${slug}/public`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors duration-150"
              style={{ borderColor: '#27272A', color: '#A1A1AA', backgroundColor: '#111113' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3F3F46'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#27272A'}>
              <Eye size={12} /> View Public
            </button>
          )}
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors duration-150 disabled:opacity-40"
            style={{ borderColor: '#27272A', color: '#A1A1AA', backgroundColor: '#111113' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3F3F46'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#27272A'}>
            {exporting ? <Loader size={12} className="animate-spin" /> : <Download size={12} />}
            Export
          </button>
          {!isPublished && (
            <Button size="sm" loading={publishing} onClick={handlePublish}>
              <Globe size={13} /> Publish
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left sidebar */}
        <div className="w-full md:w-48 flex-shrink-0 border-r-0 md:border-r border-b md:border-b-0 flex flex-col py-2 md:py-4"
          style={{ borderColor: '#27272A', backgroundColor: '#09090B' }}>
          {/* System info - hidden on mobile to save space */}
          <div className="hidden md:block px-4 pb-4 mb-4 border-b" style={{ borderColor: '#18181B' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-2"
              style={{ backgroundColor: '#DC262620', color: '#DC2626' }}>
              {system?.name?.[0]}
            </div>
            <p className="text-xs font-medium leading-tight" style={{ color: '#FAFAFA' }}>{system?.name}</p>
            <p className="text-xs mt-0.5 capitalize" style={{ color: '#52525B' }}>{system?.category}</p>
          </div>

          {/* Nav */}
          <nav className="flex flex-row md:flex-col gap-0.5 px-2 overflow-x-auto">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setSection(key)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 text-left flex-shrink-0"
                style={{
                  backgroundColor: section === key ? '#18181B' : 'transparent',
                  color: section === key ? '#FAFAFA' : '#52525B',
                }}>
                <Icon size={14} />
                {label}
                {key === 'pages' && pages.length > 0 && (
                  <span className="hidden md:inline ml-auto text-xs" style={{ color: '#3F3F46' }}>{pages.length}</span>
                )}
                {key === 'versions' && versions.length > 0 && (
                  <span className="hidden md:inline ml-auto text-xs" style={{ color: '#3F3F46' }}>{versions.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main canvas */}
        <div className="flex-1 p-5 md:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {section === 'pages' && (
              <PagesSection system={system} pages={pages} setPages={setPages} theme={theme} />
            )}
            {section === 'theme' && (
              <ThemeSection system={system} theme={theme} setTheme={setTheme} />
            )}
            {section === 'versions' && (
              <VersionsSection system={system} versions={versions} setVersions={setVersions} />
            )}
            {section === 'activity' && (
              <ActivitySection system={system} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemExplorer