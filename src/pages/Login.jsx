// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import useAuth from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const Login = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await client.post('/auth/login', form)
      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold" style={{ color: '#FAFAFA' }}>Welcome back</h2>
        <p className="text-sm mt-1" style={{ color: '#52525B' }}>Sign in to your workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com"
          value={form.email} onChange={set('email')} required />
        <Input label="Password" type="password" placeholder="Your password"
          value={form.password} onChange={set('password')} required />

        {error && (
          <p className="text-xs text-center py-2 px-3 rounded-lg"
            style={{ color: '#FCA5A5', backgroundColor: '#DC262615', border: '1px solid #DC262630' }}>
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full mt-1">
          Sign in
        </Button>
      </form>

      <p className="text-xs text-center" style={{ color: '#52525B' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#A1A1AA' }}
          onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
          onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}>
          Create one
        </Link>
      </p>
    </div>
  )
}

export default Login