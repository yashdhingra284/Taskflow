import { Link } from 'react-router-dom'

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-brand-50 via-slate-50 to-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-sm">
            <svg
              className="h-7 w-7 text-white"
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
        </div>
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">
          Task<span className="text-brand-600">Flow</span>
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">{subtitle}</p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  )
}

export function AuthLayout({ title, subtitle, children }) {
  return <AuthShell title={title} subtitle={subtitle}>{children}</AuthShell>
}

export function AuthLink({ to, children }) {
  return (
    <Link
      to={to}
      className="font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
    >
      {children}
    </Link>
  )
}