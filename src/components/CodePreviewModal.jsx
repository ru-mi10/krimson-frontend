// src/components/CodePreviewModal.jsx
import { useState, useEffect, useRef } from 'react'
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
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone@7.23.10/babel.min.js"><\/script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, system-ui, sans-serif; background: #09090B; }
    #error-box {
      display: none;
      padding: 20px 24px;
      background: #0f0505;
      border-left: 3px solid #DC2626;
      margin: 16px;
      border-radius: 8px;
    }
    #error-title { color: #FCA5A5; font-size: 13px; font-weight: 600; margin-bottom: 8px; font-family: monospace; }
    #error-msg { color: #F87171; font-size: 12px; font-family: monospace; white-space: pre-wrap; line-height: 1.6; }
    #error-hint { color: #71717A; font-size: 11px; margin-top: 12px; font-family: monospace; }
  </style>
</head>
<body>
  <div id="error-box">
    <div id="error-title">⚠ Syntax Error</div>
    <div id="error-msg"></div>
    <div id="error-hint">Fix the error in the Code tab and the preview will update automatically.</div>
  </div>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;
    try {
      ${cleaned}
      const container = document.getElementById('root');
      const root = ReactDOM.createRoot(container);
      root.render(React.createElement(GeneratedPage));
    } catch(err) {
      const box = document.getElementById('error-box');
      box.style.display = 'block';
      document.getElementById('root').style.display = 'none';
      // Format error message with location if available
      let msg = err.message || String(err);
      document.getElementById('error-msg').textContent = msg;
    }
  </script>
</body>
</html>
`
}

// Pre-validate code with Babel before sending to iframe
// Returns null if valid, error string if invalid
const validateCode = (code) => {
  try {
    if (typeof window !== 'undefined' && window.Babel) {
      window.Babel.transform(code, { presets: ['react'] })
    }
    return null
  } catch (err) {
    return err.message || 'Syntax error'
  }
}

const CodePreviewModal = ({ system, page, theme, onClose, onSaved }) => {
  const [code, setCode] = useState(page.generatedCode || '')
  const [previewCode, setPreviewCode] = useState(page.generatedCode || '')
  const [syntaxError, setSyntaxError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState(page.generatedCode ? 'preview' : 'code')
  const [chatMsg, setChatMsg] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [modifying, setModifying] = useState(false)
  const chatBottomRef = useRef(null)
  const debounceRef = useRef(null)

  // Load Babel standalone into window so we can pre-validate code
  useEffect(() => {
    if (!window.Babel) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@babel/standalone@7.23.10/babel.min.js'
      document.head.appendChild(script)
    }
  }, [])

  // Auto re-render preview 800ms after user stops editing code
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      // Pre-validate before updating preview
      if (window.Babel) {
        try {
          window.Babel.transform(code, { presets: ['react'] })
          setSyntaxError('')
          setPreviewCode(code)
        } catch (err) {
          setSyntaxError(err.message || 'Syntax error')
          // Don't update preview on syntax error — keep last valid state
        }
      } else {
        // Babel not loaded yet — just update preview
        setSyntaxError('')
        setPreviewCode(code)
      }
    }, 800)
    return () => clearTimeout(debounceRef.current)
  }, [code])

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
      setPreviewCode(data.code)
      setView('preview')
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const modifyCode = async () => {
    if (!chatMsg.trim() || !code) return
    const instruction = chatMsg.trim()
    setModifying(true)
    setError('')
    setChatMsg('')

    // Add user message to history immediately
    const userMsg = { role: 'user', content: instruction, ts: Date.now() }
    setChatHistory(prev => [...prev, userMsg])

    try {
      const { data } = await client.post('/ai/modify-page-code', {
        currentCode: code,
        instruction,
        themeTokens: theme?.tokens || {},
        history: chatHistory.map(m => ({ role: m.role, content: m.content })),
      })
      setCode(data.code)
      setPreviewCode(data.code)
      setView('preview')
      // Add AI response to history
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.summary || 'Done.', ts: Date.now() }])
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      setError(err.response?.data?.message || 'Modification failed')
      setChatHistory(prev => [...prev, { role: 'assistant', content: '⚠ Failed. Please try again.', ts: Date.now() }])
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
              srcDoc={buildSrcDoc(previewCode)}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="flex flex-col h-full">
              {syntaxError && (
                <div className="flex-shrink-0 px-4 py-3 border-b"
                  style={{ backgroundColor: '#0f0505', borderColor: '#DC262640', borderLeft: '3px solid #DC2626' }}>
                  <p className="text-xs font-semibold font-mono mb-1" style={{ color: '#FCA5A5' }}>
                    ⚠ Syntax Error
                  </p>
                  <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed" style={{ color: '#F87171' }}>
                    {syntaxError}
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#52525B' }}>
                    Fix the error above — preview will update automatically when valid.
                  </p>
                </div>
              )}
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 p-4 text-xs font-mono resize-none outline-none"
                style={{ backgroundColor: '#09090B', color: '#A1A1AA' }}
              />
            </div>
          )}
        </div>

        {/* Chat history + input */}
        {code && (
          <div className="flex flex-col border-t flex-shrink-0" style={{ borderColor: '#27272A', maxHeight: '200px' }}>
            {chatHistory.length > 0 && (
              <div className="overflow-y-auto px-4 py-3 flex flex-col gap-2" style={{ backgroundColor: '#0D0D0F' }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-xs px-3 py-1.5 rounded-lg text-xs"
                      style={{
                        backgroundColor: msg.role === 'user' ? '#DC262620' : '#18181B',
                        color: msg.role === 'user' ? '#FCA5A5' : '#A1A1AA',
                        border: `1px solid ${msg.role === 'user' ? '#DC262640' : '#27272A'}`,
                      }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 border-t" style={{ borderColor: '#27272A', backgroundColor: '#0D0D0F' }}>
              <input type="text" placeholder='Ask AI to modify, e.g. "add a search bar"'
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