import { cn } from '../../lib/utils.js'
import { normalizePriority } from '../../lib/constants.js'

const STATUS_DOT = {
  todo: 'bg-slate-400',
  in_progress: 'bg-sky-500',
  done: 'bg-emerald-500',
}

export function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        STATUS_BG[status] ?? 'bg-slate-100 text-slate-700',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[status] ?? 'bg-slate-400')} />
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

export function PriorityBadge({ priority, className = '' }) {
  const key = normalizePriority(priority)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        PRIORITY_BG[key] ?? 'bg-slate-100 text-slate-600',
        className,
      )}
    >
      {PRIORITY_LABEL[key] ?? key}
    </span>
  )
}

const STATUS_BG = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-sky-100 text-sky-700',
  done: 'bg-emerald-100 text-emerald-700',
}

const STATUS_LABEL = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

const PRIORITY_BG = {
  'Least Imp': 'bg-slate-100 text-slate-600',
  Imp: 'bg-amber-100 text-amber-700',
  'Most Imp': 'bg-red-100 text-red-700',
}

const PRIORITY_LABEL = {
  'Least Imp': 'Low',
  Imp: 'Medium',
  'Most Imp': 'High',
}