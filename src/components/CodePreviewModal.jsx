// src/components/CodePreviewModal.jsx
import { useState } from 'react'
import { X, Sparkles, Save, Loader, Code2, Eye, Send } from 'lucide-react'
import client from '../api/client'
import Button from './ui/Button'

const buildSrcDoc = (code) => {
  // Strip ES module export syntax — Babel UMD mode doesn't support it
  const cleaned = code
    .replace(/export\s+default\s+function\s+GeneratedPage/g, 'function GeneratedPage')
    .replace(/export\s+default\s+GeneratedPage\s*;?/g, '')
    .replace(/export\s+\{[^}]*\}\s*;?/g, '')

  return `
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone@7.23.10/babel.min.js"><\/script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, system-ui, sans-serif; background: #09090B; }
    #error-box { padding:16px; color:#FCA5A5; background:#1a0505; font-family:monospace; font-size:12px; white-space:pre-wrap; display:none; }
  </style>
</head>
<body>
  <div id="error-box"></div>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect } = React;
    try {
      ${cleaned}
      const container = document.getElementById('root');
      const root = ReactDOM.createRoot(container);
      root.render(React.createElement(GeneratedPage));
    } catch(err) {
      document.getElementById('error-box').style.display = 'block';
      document.getElementById('error-box').textContent = 'Error: ' + err.message;
    }
  </script>
</body>
</html>
`
}

const CodePreviewModal = ({ system, page, theme, onClose, onSaved }) => {
  const [code, setCode] = useState(page.generatedCode || '')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState(page.generatedCode ? 'preview' : 'code')
  const [chatMsg, setChatMsg] = useState('')
  const [modifying, setModifying] = useState(false)

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

  const modifyCode = async () => {
    if (!chatMsg.trim() || !code) return
    setModifying(true)
    setError('')
    try {
      const { data } = await client.post('/ai/modify-page-code', {
        currentCode: code,
        instruction: chatMsg.trim(),
        themeTokens: theme?.tokens || {},
      })
      setCode(data.code)
      setChatMsg('')
      setView('preview')
    } catch (err) {
      setError(err.response?.data?.message || 'Modification failed')
    } finally {
      setModifying(false)
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

        <div className="flex-1 overflow-hidden relative">
          {!code ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-2xl border flex items-center justify-center"
                style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
                <Sparkles size={20} style={{ color: '#DC2626' }} />
              </div>
              <p className="text-xs text-center max-w-xs" style={{ color: '#52525B' }}>
                No code generated yet. Generate a real React component using your System's theme.
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

        {/* Modify chat bar */}
        {code && (
          <div className="flex items-center gap-2 px-5 py-3 border-t flex-shrink-0"
            style={{ borderColor: '#27272A', backgroundColor: '#0D0D0F' }}>
            <input type="text" placeholder='Ask AI to modify this page, e.g. "add a search bar"'
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && modifyCode()}
              className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none"
              style={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#FAFAFA' }} />
            <button onClick={modifyCode} disabled={modifying || !chatMsg.trim()}
              className="p-2 rounded-lg transition-colors disabled:opacity-40"
              style={{ backgroundColor: '#DC2626', color: '#FAFAFA' }}>
              {modifying ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        )}

        {code && (
          <div className="flex items-center justify-between px-5 py-3 border-t flex-shrink-0"
            style={{ borderColor: '#27272A' }}>
            <button onClick={generate} disabled={generating}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: '#52525B' }}>
              {generating ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Regenerate from scratch
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