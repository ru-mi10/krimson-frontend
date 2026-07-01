// src/components/CodePreviewModal.jsx
// Renders generated JSX code live using in-browser Babel + React via CDN inside an iframe.
import { useState, useEffect, useRef } from 'react'
import { X, Sparkles, Save, Loader, Code2, Eye } from 'lucide-react'
import client from '../api/client'
import Button from './ui/Button'

const buildSrcDoc = (code) => `
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, system-ui, sans-serif; background: #09090B; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<GeneratedPage />);
  </script>
</body>
</html>
`

const CodePreviewModal = ({ system, page, theme, onClose, onSaved }) => {
  const [code, setCode] = useState(page.generatedCode || '')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState(page.generatedCode ? 'preview' : 'code')

  const generate = async () => {
    setGenerating(true)
    setError('')
    try {
      const { data } = await client.post('/ai/generate-page-code', {
        pageName: page.name,
        pageDescription: page.description,
        systemName: system.name,
        themeTokens: theme?.tokens || {},
      })
      setCode(data.code)
      setView('preview')
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await client.put(`/systems/${system.slug}/pages/${page.slug}/code`, { code })
      onSaved(data.page)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: '#00000090' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-4xl h-[85vh] rounded-2xl border flex flex-col overflow-hidden"
        style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: '#27272A' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{page.name}</p>
            <p className="text-xs" style={{ color: '#52525B' }}>Generate and preview real page code</p>
          </div>
          <div className="flex items-center gap-2">
            {code && (
              <div className="flex items-center rounded-lg border p-0.5" style={{ borderColor: '#27272A' }}>
                <button onClick={() => setView('preview')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={{ backgroundColor: view === 'preview' ? '#18181B' : 'transparent', color: view === 'preview' ? '#FAFAFA' : '#52525B' }}>
                  <Eye size={12} /> Preview
                </button>
                <button onClick={() => setView('code')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={{ backgroundColor: view === 'code' ? '#18181B' : 'transparent', color: view === 'code' ? '#FAFAFA' : '#52525B' }}>
                  <Code2 size={12} /> Code
                </button>
              </div>
            )}
            <button onClick={onClose} style={{ color: '#52525B' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden relative">
          {!code ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-2xl border flex items-center justify-center"
                style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
                <Sparkles size={20} style={{ color: '#DC2626' }} />
              </div>
              <p className="text-xs text-center max-w-xs" style={{ color: '#52525B' }}>
                No code generated yet for this page. Generate a real React component using your System's theme.
              </p>
              <Button onClick={generate} loading={generating}>
                <Sparkles size={14} /> Generate Code
              </Button>
              {error && (
                <p className="text-xs px-3 py-2 rounded-lg"
                  style={{ color: '#FCA5A5', backgroundColor: '#DC262615' }}>{error}</p>
              )}
            </div>
          ) : view === 'preview' ? (
            <iframe
              title="preview"
              srcDoc={buildSrcDoc(code)}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          ) : (
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 text-xs font-mono resize-none outline-none"
              style={{ backgroundColor: '#09090B', color: '#A1A1AA' }}
            />
          )}
        </div>

        {/* Footer */}
        {code && (
          <div className="flex items-center justify-between px-5 py-3 border-t flex-shrink-0"
            style={{ borderColor: '#27272A' }}>
            <button onClick={generate} disabled={generating}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: '#52525B' }}>
              {generating ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Regenerate
            </button>
            <div className="flex items-center gap-3">
              {error && <p className="text-xs" style={{ color: '#FCA5A5' }}>{error}</p>}
              <Button size="sm" onClick={save} loading={saving}>
                {saved ? 'Saved' : <><Save size={13} /> Save to Page</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CodePreviewModal