// src/components/ui/Button.jsx
const VARIANTS = {
  primary:   { background: '#DC2626', color: '#FFFFFF', border: 'none' },
  secondary: { background: '#F4F4F5', color: '#18181B', border: 'none' },
  outline:   { background: 'transparent', color: '#E4E4E7', border: '1px solid #52525B' },
  ghost:     { background: 'transparent', color: '#A1A1AA', border: 'none' },
  danger:    { background: 'rgba(220,38,38,0.1)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.3)' },
}

const HOVER = {
  primary:   { background: '#B91C1C' },
  secondary: { background: '#FFFFFF' },
  outline:   { background: '#27272A', borderColor: '#71717A' },
  ghost:     { background: '#27272A', color: '#FAFAFA' },
  danger:    { background: 'rgba(220,38,38,0.2)' },
}

const SIZES = {
  sm: { padding: '6px 12px', fontSize: '12px', gap: '6px' },
  md: { padding: '8px 16px', fontSize: '14px', gap: '8px' },
  lg: { padding: '10px 24px', fontSize: '14px', gap: '8px' },
}

const Button = ({
  children, variant = 'primary', size = 'md',
  className = '', disabled = false, loading = false,
  onClick, type = 'button', style = {},
}) => {
  const base = VARIANTS[variant]
  const sz = SIZES[size]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 500, borderRadius: '8px', cursor: 'pointer',
        transition: 'all 150ms', whiteSpace: 'nowrap', outline: 'none',
        opacity: disabled || loading ? 0.4 : 1,
        pointerEvents: disabled || loading ? 'none' : 'auto',
        gap: sz.gap, padding: sz.padding, fontSize: sz.fontSize,
        background: base.background, color: base.color,
        border: base.border || 'none',
        ...style,
      }}
      onMouseEnter={e => {
        const h = HOVER[variant]
        if (h.background) e.currentTarget.style.background = h.background
        if (h.color) e.currentTarget.style.color = h.color
        if (h.borderColor) e.currentTarget.style.borderColor = h.borderColor
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = base.background
        e.currentTarget.style.color = base.color
        if (base.border) e.currentTarget.style.border = base.border
      }}
    >
      {loading && (
        <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} className="animate-spin" fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button