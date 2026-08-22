import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../api/http.js'
import { Input } from '../components/ui/FormControls.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ErrorBanner } from '../components/ui/Feedback.jsx'
import { AuthLayout, AuthLink } from './AuthLayout.jsx'

const PASSWORD_MIN = 8

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Full name is required.'
  else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.'

  const email = form.email.trim()
  if (!email) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'

  if (!form.password) errors.password = 'Password is required.'
  else if (form.password.length < PASSWORD_MIN)
    errors.password = `Password must be at least ${PASSWORD_MIN} characters.`

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.'
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.'

  return errors
}

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/tasks', { replace: true })
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : 'Unable to create your account. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start organizing your work in minutes.">
      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <ErrorBanner message={serverError} />

        <Input
          name="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          error={errors.name}
          autoFocus
        />

        <Input
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
        />

        <div>
          <Input
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={`At least ${PASSWORD_MIN} characters`}
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
            hint={`Use at least ${PASSWORD_MIN} characters.`}
          />
        </div>

        <Input
          name="confirmPassword"
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={(e) => setField('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
        />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Show passwords
        </label>

        <Button type="submit" loading={submitting} className="w-full" size="lg">
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account? <AuthLink to="/login">Log in</AuthLink>
      </p>
    </AuthLayout>
  )
}