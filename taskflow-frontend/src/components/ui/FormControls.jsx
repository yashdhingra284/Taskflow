import { forwardRef } from 'react'
import { cn } from '../../lib/utils.js'

const baseClasses =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-colors ' +
  'placeholder:text-slate-400 focus:outline-none focus:ring-2 '

const stateClasses = (invalid) =>
  invalid
    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
    : 'border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-brand-100'

export const Input = forwardRef(function Input(
  { label, error, hint, invalid, id, className = '', ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={invalid || Boolean(error)}
        className={cn(baseClasses, stateClasses(invalid || Boolean(error)), className)}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, id, className = '', rows = 4, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(baseClasses, stateClasses(Boolean(error)), 'resize-y', className)}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
})

export const Select = forwardRef(function Select(
  { label, error, hint, id, className = '', children, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(
            baseClasses,
            stateClasses(Boolean(error)),
            'appearance-none pr-9',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
})