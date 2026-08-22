import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../api/http.js'
import { DEMO_CREDENTIALS } from '../api/mock.js'
import { Input } from '../components/ui/FormControls.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ErrorBanner } from '../components/ui/Feedback.jsx'
import { AuthLayout, AuthLink } from './AuthLayout.jsx'

function validate(form) {
  const errors = {}
  if (!form.email.trim()) errors.email = 'Email or username is required.'
  if (!form.password) errors.password = 'Password is required.'
  return errors
}

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e))
    if (serverError) setServerError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setServerError('')
    try {
      await login({ email: form.email.trim(), password: form.password })
      const from = location.state?.from
      navigate(from && from !== '/login' ? from : '/tasks', { replace: true })
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : 'Unable to log in. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = () => {
    setForm({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password })
    setErrors({})
    setServerError('')
  }

  return (
    <AuthLayout title="Log in" subtitle="Sign in to manage your tasks.">
      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <ErrorBanner message={serverError} />

        <Input
          name="email"
          label="Email or username"
          type="text"
          autoComplete="username"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          autoFocus
        />

        <div>
          <Input
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-500">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-3.5 w-3.5 accent-brand-600"
              />
              Show password
            </label>
            <button
              type="button"
              onClick={fillDemo}
              className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              Use demo account
            </button>
          </div>
        </div>

        <Button type="submit" loading={submitting} className="w-full" size="lg">
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account? <AuthLink to="/register">Create one</AuthLink>
      </p>
      <p className="mt-2 text-center text-xs text-slate-400">
        Demo: demo@taskflow.app · demo1234
      </p>
    </AuthLayout>
  )
}