import { cn } from '../../lib/utils.js'
import { Icon } from './icons.jsx'

export function EmptyState({ icon = 'inbox', title, message, action, className = '' }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Icon name={icon} className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}