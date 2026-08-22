import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Navbar } from './Navbar.jsx'
import { TaskFormModal } from '../tasks/TaskFormModal.jsx'

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
          <svg
            className="h-6 w-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div className="h-4 w-32 skeleton rounded" />
      </div>
    </div>
  )
}

// "Can this user access a protected page?"
export function RequireAuth() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}

export function RedirectIfAuthed({ children }) {
  const { user, initializing } = useAuth()
  if (initializing) return <PageLoader />
  if (user) return <Navigate to="/tasks" replace />
  return children
}

function Shell({ children }) {
  const [createOpen, setCreateOpen] = useState(false)
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar onCreateTask={() => setCreateOpen(true)} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-4">
        <p className="text-center text-xs text-slate-400">TaskFlow — stay on track.</p>
      </footer>
      <TaskFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => window.dispatchEvent(new CustomEvent('taskflow:task-saved'))}
      />
    </div>
  )
}