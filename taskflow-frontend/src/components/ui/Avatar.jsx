import { cn } from '../../lib/utils.js'

export function Avatar({ name, size = 'md', className = '' }) {
  const initials = (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-16 w-16 text-xl',
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700',
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}