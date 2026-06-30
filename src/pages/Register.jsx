// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import useAuth from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const Register = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await client.post('/auth/register', form)
      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold" style={{ color: '#FAFAFA' }}>Create your account</h2>
        <p className="text-sm mt-1" style={{ color: '#52525B' }}>Start building your first System</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Full Name" type="text" placeholder="Your name"
          value={form.fullName} onChange={set('fullName')} required />
        <Input label="Username" type="text" placeholder="yourhandle"
          value={form.username} onChange={set('username')} required />
        <Input label="Email" type="email" placeholder="you@example.com"
          value={form.email} onChange={set('email')} required />
        <Input label="Password" type="password" placeholder="Min. 8 characters"
          value={form.password} onChange={set('password')} required />

        {error && (
          <p className="text-xs text-center py-2 px-3 rounded-lg"
            style={{ color: '#FCA5A5', backgroundColor: '#DC262615', border: '1px solid #DC262630' }}>
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full mt-1">
          Create account
        </Button>
      </form>

      <p className="text-xs text-center" style={{ color: '#52525B' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#A1A1AA' }}
          onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
          onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}>
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default Register