import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { tasksApi } from '../api/tasks.js'
import { ApiError } from '../api/http.js'
import { formatDate, formatDateTime, isOverdue, cn } from '../lib/utils.js'
import { useToast } from '../context/ToastContext.jsx'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { ErrorState } from '../components/ui/Feedback.jsx'
import { Icon } from '../components/ui/icons.jsx'
import { TaskFormModal } from '../components/tasks/TaskFormModal.jsx'

export function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [completing, setCompleting] = useState(false)

  const loadTask = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await tasksApi.get(id)
      setTask(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load this task.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadTask()
  }, [loadTask, reloadKey])

  const handleDelete = async () => {
    console.log("DELETE HANDLER CALLED")
    setDeleting(true)
    try {
      console.log("DELETE ID:", id)
      await tasksApi.remove(id)
      toast.success('Task deleted.')
      navigate('/tasks')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Unable to delete this task.')
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await tasksApi.update(task.id, {
        title: task.title,
        description: task.description,
        status: 'done',
        priority: task.priority,
        due_date: task.due_date,
        cat_id: Number(task.cat_id),
      })
      toast.success(`"${task.title}" completed.`)
      setReloadKey((k) => k + 1)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Unable to complete this task.')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link
        to="/tasks"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-600"
      >
        <Icon name="arrowLeft" className="h-4 w-4" />
        Back to tasks
      </Link>

      {error ? (
        <div className="mt-6">
          <ErrorState
            title="Couldn't load this task"
            message={error}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        </div>
      ) : loading || !task ? (
        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="h-6 w-2/3 skeleton rounded" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-4/5 skeleton rounded" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 skeleton rounded-full" />
            <div className="h-6 w-16 skeleton rounded-full" />
          </div>
        </div>
      ) : (
        <article className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {task.title}
              </h1>
              <div className="flex shrink-0 gap-2">
                {task.status !== 'done' && (
                  <Button
                    size="sm"
                    onClick={handleComplete}
                    loading={completing}
                    icon={<Icon name="check" className="h-4 w-4" />}
                  >
                    Mark as completed
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                  icon={<Icon name="pencil" className="h-4 w-4" />}
                >
                  Edit
                </Button>
                <Button
                  variant="dangerSecondary"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  icon={<Icon name="trash" className="h-4 w-4" />}
                >
                  Delete
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-sm font-bold tracking-wide text-slate-900 uppercase">
              Description
            </h2>
            <p className={cn('mt-2 text-sm leading-7 whitespace-pre-wrap text-slate-600')}>
              {task.description || (
                <span className="italic text-slate-400">No description provided.</span>
              )}
            </p>

            <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <DetailItem label="Status" value={statusLabel(task.status)} />
              <DetailItem label="Priority" value={priorityLabel(task.priority)} />
              <DetailItem
                label="Due date"
                value={
                  task.due_date ? (
                    <span className={isOverdue(task.due_date) && task.status !== 'done' ? 'font-semibold text-red-600' : ''}>
                      {formatDate(task.due_date)}
                      {isOverdue(task.due_date) && task.status !== 'done' && ' (overdue)'}
                    </span>
                  ) : (
                    <span className="text-slate-400">No due date</span>
                  )
                }
              />
              <DetailItem label="Created" value={formatDateTime(task.created_at)} />
              <DetailItem label="Last updated" value={formatDateTime(task.updated_at)} />
              <DetailItem label="Task ID" value={<span className="font-mono text-xs">{task.id}</span>} />
            </dl>
          </div>
        </article>
      )}

      <TaskFormModal
        open={editOpen}
        task={task}
        onClose={() => setEditOpen(false)}
        onSaved={() => setReloadKey((k) => k + 1)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete task"
        message={`"${task?.title}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete task"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  )
}

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' }

function statusLabel(status) {
  return STATUS_LABELS[status] ?? status
}
function priorityLabel(priority) {
  return PRIORITY_LABELS[priority] ?? priority
}