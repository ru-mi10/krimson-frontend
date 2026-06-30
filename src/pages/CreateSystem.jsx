// src/pages/CreateSystem.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Plus, X, Loader } from 'lucide-react'
import client from '../api/client'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const CATEGORIES = [
  'crm', 'analytics', 'ecommerce', 'saas',
  'portfolio', 'fintech', 'healthcare', 'education',
  'productivity', 'other'
]

const CreateSystem = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', description: '', category: 'saas', visibility: 'private'
  })
  const [prompt, setPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleAISuggest = async () => {
    if (!prompt.trim()) return
    setAiLoading(true)
    setSuggestion(null)
    try {
      const { data } = await client.post('/ai/suggest-system', { prompt })
      setSuggestion(data.suggestion)
      setForm(f => ({
        ...f,
        name: data.suggestion.name,
        description: data.suggestion.description,
        category: data.suggestion.category,
      }))
    } catch (err) {
      setError(err.response?.data?.message || 'AI suggestion failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        tags: suggestion?.tags || [],
      }
      const { data } = await client.post('/systems', payload)

      // If AI suggested pages, create them
      if (suggestion?.pages?.length) {
        await Promise.all(
          suggestion.pages.map((p, i) =>
            client.post(`/systems/${data.system.slug}/pages`, {
              name: p.name,
              description: p.description,
              icon: p.icon,
              order: i,
            }).catch(() => null)
          )
        )
      }

      navigate(`/systems/${data.system.slug}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create System')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-5 md:p-8" style={{ backgroundColor: '#09090B' }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold" style={{ color: '#FAFAFA' }}>Create a System</h1>
          <p className="text-sm" style={{ color: '#52525B' }}>
            Define your product foundation.
          </p>
        </div>

        {/* AI Prompt */}
        <div className="rounded-xl border p-5 flex flex-col gap-4"
          style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: '#DC2626' }} />
            <span className="text-xs font-medium" style={{ color: '#A1A1AA' }}>
              AI Assistant — optional
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder='Describe your product, e.g. "A CRM for marketing agencies"'
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAISuggest()}
              className="flex-1 px-3 py-2.5 text-sm rounded-lg border bg-transparent"
              style={{
                backgroundColor: '#09090B',
                borderColor: '#27272A',
                color: '#FAFAFA',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#3F3F46'}
              onBlur={e => e.target.style.borderColor = '#27272A'}
            />
            <button
              onClick={handleAISuggest}
              disabled={aiLoading || !prompt.trim()}
              className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-150 disabled:opacity-40"
              style={{ backgroundColor: '#18181B', color: '#A1A1AA', border: '1px solid #27272A' }}
              onMouseEnter={e => !aiLoading && (e.currentTarget.style.backgroundColor = '#27272A')}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#18181B'}>
              {aiLoading ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Suggest
            </button>
          </div>

          {/* AI Suggested pages preview */}
          {suggestion?.pages?.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: '#1C1C1F' }}>
              <p className="text-xs" style={{ color: '#52525B' }}>Suggested pages</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestion.pages.map((p) => (
                  <span key={p.name} className="text-xs px-2.5 py-1 rounded-lg border"
                    style={{ backgroundColor: '#18181B', borderColor: '#27272A', color: '#A1A1AA' }}>
                    {p.name}
                  </span>
                ))}
              </div>
              <p className="text-xs" style={{ color: '#3F3F46' }}>
                These pages will be created automatically with your System.
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="System Name"
            type="text"
            placeholder="Agency CRM, Fintech Dashboard, SaaS Admin..."
            value={form.name}
            onChange={set('name')}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider"
              style={{ color: '#A1A1AA' }}>
              Description
            </label>
            <textarea
              placeholder="What does this System do?"
              value={form.description}
              onChange={set('description')}
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-lg border resize-none"
              style={{
                backgroundColor: '#09090B',
                borderColor: '#27272A',
                color: '#FAFAFA',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#3F3F46'}
              onBlur={e => e.target.style.borderColor = '#27272A'}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider"
              style={{ color: '#A1A1AA' }}>
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150 border"
                  style={{
                    backgroundColor: form.category === cat ? '#DC262615' : '#111113',
                    borderColor: form.category === cat ? '#DC262640' : '#27272A',
                    color: form.category === cat ? '#FCA5A5' : '#52525B',
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider"
              style={{ color: '#A1A1AA' }}>
              Visibility
            </label>
            <div className="flex gap-2">
              {[
                { value: 'private', label: 'Private', desc: 'Only you' },
                { value: 'unlisted', label: 'Unlisted', desc: 'Link only' },
                { value: 'public', label: 'Public', desc: 'Everyone' },
              ].map(({ value, label, desc }) => (
                <button key={value} type="button"
                  onClick={() => setForm(f => ({ ...f, visibility: value }))}
                  className="flex-1 px-3 py-2.5 rounded-lg border text-left transition-all duration-150"
                  style={{
                    backgroundColor: form.visibility === value ? '#18181B' : '#111113',
                    borderColor: form.visibility === value ? '#3F3F46' : '#27272A',
                  }}>
                  <p className="text-xs font-medium" style={{ color: form.visibility === value ? '#FAFAFA' : '#52525B' }}>
                    {label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#3F3F46' }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-center py-2 px-3 rounded-lg"
              style={{ color: '#FCA5A5', backgroundColor: '#DC262615', border: '1px solid #DC262630' }}>
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={loading} size="md">
              Create System
            </Button>
            <Button type="button" variant="ghost" size="md"
              onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateSystem