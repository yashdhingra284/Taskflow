import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { cn } from '../../lib/utils.js'
import { Avatar } from '../ui/Avatar.jsx'
import { Icon } from '../ui/icons.jsx'

function Logo() {
  return (
    <Link to="/tasks" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-sm">
        <svg
          className="h-5 w-5 text-white"
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
      <span className="text-lg font-extrabold tracking-tight text-slate-900">
        Task<span className="text-brand-600">Flow</span>
      </span>
    </Link>
  )
}

function ProfileMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <Avatar name={user?.name} size="sm" />
        <span className="hidden text-sm font-semibold text-slate-700 md:block">{user?.name}</span>
        <Icon name="chevronDown" className="hidden h-4 w-4 text-slate-400 md:block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-popover animate-scale-in"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <MenuItem to="/profile" onClick={() => setOpen(false)} icon="user">
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} icon="logout" danger>
            Log out
          </MenuItem>
        </div>
      )}
    </div>
  )
}

function MenuItem({ to, onClick, icon, children, danger = false }) {
  const classes = cn(
    'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors',
    danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50',
  )
  if (to) {
    return (
      <NavLink to={to} onClick={onClick} role="menuitem" className={classes}>
        <Icon name={icon} className="h-4 w-4" />
        {children}
      </NavLink>
    )
  }
  return (
    <button type="button" onClick={onClick} role="menuitem" className={classes}>
      <Icon name={icon} className="h-4 w-4" />
      {children}
    </button>
  )
}

export function Navbar({ onCreateTask }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              Tasks
            </NavLink>
          </nav>
          <button
            type="button"
            onClick={onCreateTask}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 sm:px-4"
          >
            <Icon name="plus" className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}