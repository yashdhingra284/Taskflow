import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TASK_STATUSES, TASK_PRIORITIES, DUE_FILTER_OPTIONS, DEFAULT_FILTERS } from '../../lib/constants.js'
import { cn } from '../../lib/utils.js'
import { Button } from '../ui/Button.jsx'

const GROUP_LABELS = {
  status: 'Status',
  priority: 'Priority',
  due: 'Due date',
}

const OPTIONS = {
  status: [{ value: 'all', label: 'All statuses' }, ...TASK_STATUSES],
  priority: [{ value: 'all', label: 'All priorities' }, ...TASK_PRIORITIES],
  due: DUE_FILTER_OPTIONS,
}

export function FilterPanel({ open, onClose, filters, onApply, anchorRef }) {
  const [draft, setDraft] = useState(filters)
  const panelRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  useEffect(() => {
    if (!open) return
    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (!rect) return
      let left = rect.left
      const width = 320
      if (left + width > window.innerWidth - 16) left = Math.max(16, window.innerWidth - width - 16)
      setPosition({ top: rect.bottom + 8, left })
    }
    update()
    window.addEventListener('resize', update)
    const onPointerDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', update)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, anchorRef, onClose])

  const hasActiveFilters = Object.entries(DEFAULT_FILTERS).some(
    ([key, value]) => draft[key] !== value,
  )

const filterOptions = (
  <div className="space-y-4 sm:space-y-5">
    {(['status', 'priority', 'due']).map((group) => (
      <fieldset key={group}>
        <legend className="mb-2 text-sm font-semibold text-slate-900">
          {GROUP_LABELS[group]}
        </legend>

        <div className="space-y-1.5">
          {OPTIONS[group].map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                draft[group] === option.value
                  ? 'bg-brand-50 text-brand-800'
                  : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              <input
                type="radio"
                name={group}
                value={option.value}
                checked={draft[group] === option.value}
                onChange={() =>
                  setDraft((d) => ({
                    ...d,
                    [group]: option.value,
                  }))
                }
                className="h-4 w-4 accent-brand-600"
              />

              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    ))}
  </div>
)

const filterActions = (
  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    <Button
      variant="ghost"
      onClick={() => setDraft({ ...DEFAULT_FILTERS })}
      disabled={!hasActiveFilters}
      className="sm:px-2"
    >
      Clear filters
    </Button>

    <Button
      onClick={() => {
        onApply(draft)
        onClose()
      }}
    >
      Apply filters
    </Button>
  </div>
)

  if (typeof window === 'undefined') return null

  return (
    <>
      {window.matchMedia('(min-width: 640px)').matches && open
        ? createPortal(
<div
  ref={panelRef}
  role="dialog"
  aria-label="Task filters"
 className="fixed z-50 flex w-80 flex-col rounded-xl border border-slate-200 bg-white shadow-popover animate-scale-in"
  style={{
  top: position.top,
  left: position.left,
  maxHeight: `calc(100dvh - ${position.top}px - 16px)`,
}}
>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Filters</h2>
                {hasActiveFilters && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                    {Object.values(draft).filter((v) => v !== 'all').length} active
                  </span>
                )}
              </div>
<div className="min-h-0 flex-1 overflow-y-auto px-5">
  {filterOptions}
</div>

<div className="shrink-0 border-t border-slate-200 bg-white p-5">
  {filterActions}
</div>
            </div>,
            document.body,
          )
        : open
          ? createPortal(
              <div className="fixed inset-0 z-50 flex items-end sm:hidden" role="dialog" aria-modal="true" aria-label="Task filters">
                <div className="absolute inset-0 bg-slate-900/50 animate-fade-in" onClick={onClose} />
                <div
                  ref={panelRef}
                  className="relative z-10 max-h-[85dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-6 shadow-modal animate-slide-up"
                >
                  <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">Filters</h2>
                    {hasActiveFilters && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        {Object.values(draft).filter((v) => v !== 'all').length} active
                      </span>
                    )}
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto">
  {filterOptions}
</div>

<div className="border-t border-slate-200 bg-white pt-4">
  {filterActions}
</div>
                </div>
              </div>,
              document.body,
            )
          : null}
    </>
  )
}