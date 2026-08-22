import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../api/user.js'
import { ApiError } from '../api/http.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { Avatar } from '../components/ui/Avatar.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/FormControls.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { ErrorBanner } from '../components/ui/Feedback.jsx'

const PASSWORD_MIN = 8

function validatePasswordForm(form) {
  const errors = {}
  if (!form.current) errors.current = 'Current password is required.'
  if (!form.next) errors.next = 'New password is required.'
  else if (form.next.length < PASSWORD_MIN)
    errors.next = `New password must be at least ${PASSWORD_MIN} characters.`
  if (!form.confirm) errors.confirm = 'Please confirm your new password.'
  else if (form.confirm !== form.next) errors.confirm = 'Passwords do not match.'
  return errors
}

const EMPTY_PASSWORD_FORM = { current: '', next: '', confirm: '' }

export function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [pwForm, setPwForm] = useState(EMPTY_PASSWORD_FORM)
  const [pwErrors, setPwErrors] = useState({})
  const [pwServerError, setPwServerError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const setPwField = (name, value) => {
    setPwForm((f) => ({ ...f, [name]: value }))
    setPwErrors((e) => (e[name] ? { ...e, [name]: undefined } : e))
    if (pwServerError) setPwServerError('')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const errors = validatePasswordForm(pwForm)
    setPwErrors(errors)
    if (Object.keys(errors).length > 0) return

    setPwSaving(true)
    setPwServerError('')
    try {
      await userApi.changePassword(pwForm.current, pwForm.next)
      setPwForm(EMPTY_PASSWORD_FORM)
      toast.success('Password changed successfully.')
    } catch (error) {
      setPwServerError(
        error instanceof ApiError ? error.message : 'Unable to change password. Please try again.',
      )
    } finally {
      setPwSaving(false)
    }
  }

  const openDeleteDialog = () => {
    setDeleteConfirmText('')
    setDeleteError('')
    setDeleteOpen(true)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') return
    setDeleting(true)
    setDeleteError('')
    try {
      await userApi.deleteAccount()
      logout()
      navigate('/login', { replace: true })
      toast.info('Your account has been deleted.')
    } catch (error) {
      setDeleteError(
        error instanceof ApiError ? error.message : 'Unable to delete your account. Please try again.',
      )
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Profile</h1>
      <p className="mt-0.5 text-sm text-slate-500">Manage your account settings.</p>

      <section className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <Avatar name={user?.name} size="lg" />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-slate-900">{user?.name}</h2>
          <p className="truncate text-sm text-slate-500">{user?.email}</p>
          <p className="mt-1 text-xs text-slate-400">Member since {memberSince(user)}</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-base font-bold text-slate-900">Change password</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Choose a strong password you don't use anywhere else.
        </p>
        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4" noValidate>
          <ErrorBanner message={pwServerError} />
          <Input
            name="current"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={pwForm.current}
            onChange={(e) => setPwField('current', e.target.value)}
            error={pwErrors.current}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="next"
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder={`At least ${PASSWORD_MIN} characters`}
              value={pwForm.next}
              onChange={(e) => setPwField('next', e.target.value)}
              error={pwErrors.next}
            />
            <Input
              name="confirm"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              value={pwForm.confirm}
              onChange={(e) => setPwField('confirm', e.target.value)}
              error={pwErrors.confirm}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={pwSaving}>
              Update password
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-red-700">Delete account</h2>
            <p className="mt-0.5 max-w-md text-sm text-red-600/80">
              Permanently delete your account and all your tasks. This action cannot be undone.
            </p>
          </div>
          <Button variant="danger" onClick={openDeleteDialog} className="shrink-0">
            Delete account
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete your account?"
        message="This will permanently delete your account and every task you've created. This action cannot be undone."
        confirmLabel="Delete my account"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        confirmDisabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteOpen(false)}
      >
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            Type <span className="font-bold">DELETE</span> to confirm.
          </p>
          <Input
            name="delete-confirm"
            placeholder="DELETE"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            invalid={deleteConfirmText !== '' && deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
            className="mt-2"
            aria-label="Type DELETE to confirm account deletion"
          />
          <ErrorBanner message={deleteError} className="mt-2" />
        </div>
      </ConfirmDialog>
    </div>
  )
}

function memberSince(user) {
  if (!user?.created_at) return 'recently'
  const date = new Date(user.created_at)
  if (Number.isNaN(date.getTime())) return 'recently'
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}