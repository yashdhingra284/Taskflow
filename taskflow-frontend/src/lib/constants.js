export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const STATUS_META = {
  todo: {
    label: 'To Do',
    badge: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-400',
  },

  in_progress: {
    label: 'In Progress',
    badge: 'bg-sky-100 text-sky-700',
    dot: 'bg-sky-500',
  },

  done: {
    label: 'Done',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
}

export const PRIORITY_META = {
  low: {
    label: 'Low',
    badge: 'bg-slate-100 text-slate-600',
  },

  medium: {
    label: 'Medium',
    badge: 'bg-amber-100 text-amber-700',
  },

  high: {
    label: 'High',
    badge: 'bg-red-100 text-red-700',
  },
}

export const PRIORITY_RANK = {
  high: 1,
  medium: 2,
  low: 3,
}

export function normalizePriority(value) {
  if (value === null || value === undefined || value === '') {
    return value
  }

  return String(value).toLowerCase()
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'due_date', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title A–Z' },
]

export const PAGE_SIZE = 12

export const DEFAULT_FILTERS = {
  status: 'all',
  priority: 'all',
  due: 'all',
}

export const DUE_FILTER_OPTIONS = [
  { value: 'all', label: 'Any due date' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due_soon', label: 'Due within 7 days' },
  { value: 'no_due', label: 'No due date' },
]