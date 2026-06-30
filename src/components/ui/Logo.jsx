// src/components/ui/Logo.jsx
const Logo = ({ size = 'md' }) => {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' }
  return (
    <span className={`font-bold tracking-tight ${sizes[size]}`}>
      <span style={{ color: '#DC2626' }}>K</span>
      <span style={{ color: '#FAFAFA' }}>rimson</span>
    </span>
  )
}

export default Logo