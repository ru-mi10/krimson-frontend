// src/components/ui/Input.jsx
const Input = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-3 py-2.5 text-sm rounded-lg
          bg-zinc-900 border text-zinc-100
          placeholder:text-zinc-600
          focus:outline-none focus:ring-1
          transition-colors duration-150
          ${error
            ? 'border-red-600 focus:border-red-600 focus:ring-red-600/30'
            : 'border-zinc-800 focus:border-zinc-600 focus:ring-zinc-600/20'
          }
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default Input