import { useCallback, useEffect, useRef, useState } from 'react'
import { tasksApi } from '../api/tasks.js'
import { ApiError } from '../api/http.js'
import { DEFAULT_FILTERS, PAGE_SIZE, SORT_OPTIONS } from '../lib/constants.js'
import { debounce } from '../lib/utils.js'
import { Button } from '../components/ui/Button.jsx'
import { ErrorState } from '../components/ui/Feedback.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Icon } from '../components/ui/icons.jsx'
import { TaskCard, TaskCardSkeleton } from '../components/tasks/TaskCard.jsx'
import { Pagination } from '../components/tasks/Pagination.jsx'
import { FilterPanel } from '../components/tasks/FilterPanel.jsx'
import { TaskFormModal } from '../components/tasks/TaskFormModal.jsx'

const SKELETON_COUNT = 8

function hasActiveFilters(filters) {
  return Object.entries(DEFAULT_FILTERS).some(([key, value]) => filters[key] !== value)
}

export function Tasks() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterButtonRef = useRef(null)
  const [editingTask, setEditingTask] = useState(null)

  const debouncedSearch = useRef(
    debounce((value) => {
      setSearch(value)
      setPage(1)
    }, 300),
  ).current

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
let res

if (search) {
  res = await tasksApi.search(search, page, PAGE_SIZE,filters)
} else {
  res = await tasksApi.list({
    status: filters.status,
    priority: filters.priority,
    due: filters.due,
    sort,
    page,
    page_size: PAGE_SIZE,
  })
}
      setData(res)
    } catch (err) {
      setData(null)
      setError(err instanceof ApiError ? err.message : 'Unable to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [search, filters, sort, page])

  useEffect(() => {
    loadTasks()
  }, [loadTasks, reloadKey])

  const applyFilters = (nextFilters) => {
    setFilters(nextFilters)
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS })
    setPage(1)
    setFiltersOpen(false)
  }

  useEffect(() => {
    const onTaskSaved = () => setReloadKey((k) => k + 1)
    window.addEventListener('taskflow:task-saved', onTaskSaved)
    return () => window.removeEventListener('taskflow:task-saved', onTaskSaved)
  }, [])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1
  const activeFilterCount = Object.values(filters).filter((v) => v !== 'all').length
  const isFiltered = search !== '' || hasActiveFilters(filters)

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Tasks</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {loading
              ? 'Loading tasks…'
              : data
                ? `${data.total} ${data.total === 1 ? 'task' : 'tasks'}${isFiltered ? ' found' : ''}`
                : 'Manage your tasks'}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setEditingTask({})}
          icon={<Icon name="plus" className="h-4 w-4" />}
          className="sm:hidden"
        >
          New task
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              debouncedSearch(e.target.value)
            }}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-10 pl-10 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          {loading && search !== '' && (
            <span className="absolute top-1/2 right-3 -translate-y-1/2">
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
                role="status"
                aria-label="Searching"
              />
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            ref={filterButtonRef}
            type="button"
            onClick={() => {
  console.log("FILTER BUTTON CLICKED")
  setFiltersOpen((v) => !v)
}}
            aria-haspopup="dialog"
            aria-expanded={filtersOpen}
            className={`relative inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-3.5 text-sm font-semibold shadow-sm transition-colors ${
              hasActiveFilters(filters)
                ? 'border-brand-300 text-brand-700 hover:bg-brand-50'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon name="sliders" className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
              aria-label="Sort tasks"
              className="h-10 appearance-none rounded-lg border border-slate-300 bg-white pr-9 pl-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon
              name="chevronDown"
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Icon name="x" className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorState
            title="Couldn't load your tasks"
            message={error}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        ) : loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          search !== '' || hasActiveFilters(filters) ? (
            <NoResults
              search={search}
              onClearFilters={() => {
                setSearch('')
                setSearchInput('')
                clearFilters()
              }}
            />
          ) : (
            <NoTasks onCreate={() => setEditingTask({})} />
          )
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {data.items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => setEditingTask(t)}
                  onChanged={() => setReloadKey((k) => k + 1)}
                />
              ))}
            </div>
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={data.total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <FilterPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={applyFilters}
        anchorRef={filterButtonRef}
      />

      <TaskFormModal
        open={editingTask !== null}
        task={editingTask && Object.keys(editingTask).length > 0 ? editingTask : null}
        onClose={() => setEditingTask(null)}
        onSaved={() => {
          if (search !== '' || hasActiveFilters(filters)) {
            loadTasks()
          } else {
            setReloadKey((k) => k + 1)
          }
        }}
      />
    </div>
  )
}

function NoTasks({ onCreate }) {
  return (
    <EmptyState
      icon="clipboard"
      title="No tasks yet"
      message="Get started by creating your first task. It only takes a moment."
      action={
        <Button onClick={onCreate} icon={<Icon name="plus" className="h-4 w-4" />}>
          Create your first task
        </Button>
      }
    />
  )
}

function NoResults({ onClearFilters }) {
  return (
    <EmptyState
      icon="search"
      title="No matching tasks"
      message="Try adjusting your search or filters to find what you're looking for."
      action={
        <Button variant="secondary" onClick={onClearFilters}>
          Clear search & filters
        </Button>
      }
    />
  )
}