import { useState } from 'react'
import { Link } from 'react-router-dom'
import { tasksApi } from '../../api/tasks.js'
import { ApiError } from '../../api/http.js'
import { useToast } from '../../context/ToastContext.jsx'
import { formatDate, isOverdue, cn } from '../../lib/utils.js'
import { StatusBadge, PriorityBadge } from '../ui/Badge.jsx'
import { Icon } from '../ui/icons.jsx'


export function TaskCard({ task, onEdit, onChanged }) {
  const toast = useToast()
  const [completing, setCompleting] = useState(false)
  const overdue = isOverdue(task.due_date) && task.status !== 'done'

  const handleComplete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("TASK BEFORE UPDATE:", task)
    console.log("TASK ID:", task.id)
    console.log("TASK CAT ID:", task.cat_id)

    if (completing || task.status === 'done') return
    setCompleting(true)
    try {
      await tasksApi.update(task.id, {
        title: task.title,
        description: task.description,
        status: 'done',
        priority: task.priority,
        due_date: task.due_date,
        cat_id: task.cat_id,
      })
      toast.success(`"${task.title}" completed.`)
      onChanged?.()
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Unable to complete this task. Please try again.',
      )
    } finally {
      setCompleting(false)
    }
  }

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900 group-hover:text-brand-700">
          {task.title}
        </h3>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onEdit?.(task)
          }}
          className="shrink-0 rounded-md p-1.5 text-slate-300 opacity-100 transition-all hover:bg-slate-100 hover:text-brand-600 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
          aria-label={`Edit ${task.title}`}
        >
          <Icon name="pencil" className="h-4 w-4" />
        </button>
      </div>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-500">{task.description}</p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        {task.due_date ? (
          <span
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium',
              overdue ? 'text-red-600' : 'text-slate-500',
            )}
          >
            <Icon name="calendar" className="h-3.5 w-3.5" />
            {overdue ? 'Overdue · ' : 'Due '}
            {formatDate(task.due_date)}
          </span>
        ) : (
          <span />
        )}

        {task.status !== 'done' && (
          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-60"
            aria-label={`Mark "${task.title}" as completed`}
          >
            {completing ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
            ) : (
              <Icon name="check" className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Mark as completed</span>
            <span className="sm:hidden">Complete</span>
          </button>
        )}
      </div>
    </Link>
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="h-4 w-3/4 skeleton rounded" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-2/3 skeleton rounded" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-5 w-16 skeleton rounded-full" />
        <div className="h-5 w-14 skeleton rounded-full" />
      </div>
      <div className="mt-4 h-6 skeleton rounded" />
    </div>
  )
}