import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Input, Alert } from '../components/ui/index'
import logo from '../assets/logo.png'
import './LoginPage.css'

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email.trim(), password, remember)
      toast({ type: 'success', message: `Welcome back! Redirecting...` })
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      {/* Card */}
      <div className="login-card fade-up">
        {/* Logo */}
        <div className="login-logo-wrap">
          <img src={logo} alt="EduPoint Learning Center" className="login-logo" />
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome Back</h1>
          <p>Sign in to manage attendance</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && <Alert tone="error">{error}</Alert>}

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@edupoint.com"
            required
            autoFocus
            autoComplete="username"
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />

          <div className="login-row">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>

          <button type="submit" className="btn-grad login-submit" disabled={loading}>
            {loading ? (
              <><span className="spinner" /> Signing in…</>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer">© {new Date().getFullYear()} Edupoint Learning Center</p>
      </div>
    </div>
  )
}
