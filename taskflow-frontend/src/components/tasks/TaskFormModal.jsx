import { useEffect, useState } from 'react'
import { tasksApi } from '../../api/tasks.js'
import { ApiError } from '../../api/http.js'
import { TASK_STATUSES, TASK_PRIORITIES } from '../../lib/constants.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Input, Textarea, Select } from '../ui/FormControls.jsx'
import { ErrorBanner } from '../ui/Feedback.jsx'
import { categoriesApi } from '../../api/categories.js'

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  cat_id: '',
}

function validate(form) {
  const errors = {}

  if (!form.title.trim()) {
    errors.title = 'Title is required.'
  }

  if (form.description && form.description.length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer.'
  }

  if (!form.cat_id) {
    errors.cat_id = 'Category is required.'
  }

  return errors
}

export function TaskFormModal({ open, onClose, task = null, onSaved }) {
  const isEdit = Boolean(task)
  const toast = useToast()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)

  useEffect(() => {
    if (!open) return

    setErrors({})
    setServerError('')
    setCategoryError('')
    setNewCategoryName('')

    if (task) {
      setForm({
        title: task.title ?? '',
        description: task.description ?? '',
        status: task.status ?? 'todo',
        priority: task.priority ?? 'medium',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
        cat_id: task.cat_id ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }

    const loadCategories = async () => {
      setCategoriesLoading(true)

      try {
        const data = await categoriesApi.list()
        setCategories(data)
      } catch (error) {
        console.error('Failed to load categories:', error)
        setCategoryError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load categories.'
        )
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [open, task])

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))

    setErrors((e) =>
      e[name] ? { ...e, [name]: undefined } : e
    )
  }

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim()

    if (!name) {
      setCategoryError('Category name is required.')
      return
    }

    setCreatingCategory(true)
    setCategoryError('')

    try {
      const created = await categoriesApi.create({
        cat_name: name,
      })

      /*
       * Add the newly-created category to our local list.
       */
      setCategories((current) => [...current, created])

      /*
       * Automatically select the newly-created category.
       *
       * If the API only returns a message instead of the category object,
       * we'll handle that below by reloading the categories.
       */
      if (created?.cat_id) {
        setField('cat_id', String(created.cat_id))
      } else {
        const updatedCategories = await categoriesApi.list()
        setCategories(updatedCategories)

        const newCategory = updatedCategories.find(
          (category) => category.cat_name === name
        )

        if (newCategory) {
          setField('cat_id', String(newCategory.cat_id))
        }
      }

      setNewCategoryName('')
      toast.success(`Category "${name}" created.`)
    } catch (error) {
      setCategoryError(
        error instanceof ApiError
          ? error.message
          : 'Unable to create category.'
      )
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleSubmit = async () => {
    const nextErrors = validate(form)

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSaving(true)
    setServerError('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status || null,
      due_date: form.due_date || null,
      cat_id: Number(form.cat_id),
    }

    try {
      const saved = isEdit
        ? await tasksApi.update(task.id, payload)
        : await tasksApi.create(payload)

      toast.success(isEdit ? 'Task updated.' : 'Task created.')

      onSaved?.(saved)
      onClose()
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  /*
   * When creating a NEW task and there are no categories,
   * show the category creation UI instead of the task form.
   */
  const needsCategory =
    !isEdit &&
    !categoriesLoading &&
    categories.length === 0

  return (
    <Modal
      open={open}
      onClose={saving || creatingCategory ? undefined : onClose}
      title={
        needsCategory
          ? 'Create a Category First'
          : isEdit
            ? 'Edit Task'
            : 'Create Task'
      }
      description={
        needsCategory
          ? 'You need at least one category before you can create a task.'
          : isEdit
            ? 'Update the task details below.'
            : 'Add a new task to your list.'
      }
      size="md"
      footer={
        needsCategory ? (
          <Button
            onClick={handleCreateCategory}
            loading={creatingCategory}
            disabled={!newCategoryName.trim()}
          >
            Create category
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              loading={saving}
            >
              {isEdit ? 'Save changes' : 'Create task'}
            </Button>
          </>
        )
      }
    >
      {categoriesLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-slate-500">
            Loading categories...
          </p>
        </div>
      ) : needsCategory ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-sm font-medium text-slate-700">
              You don't have any categories yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Create your first category and then we'll use it for this task.
            </p>
          </div>

          <Input
            name="newCategoryName"
            label="Category name"
            placeholder="e.g. College"
            value={newCategoryName}
            onChange={(e) => {
              setNewCategoryName(e.target.value)
              setCategoryError('')
            }}
            error={categoryError}
            autoFocus
          />
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
          noValidate
        >
          <Input
            name="title"
            label="Title"
            placeholder="What needs to be done?"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            error={errors.title}
            autoFocus
          />

          <Textarea
            name="description"
            label="Description"
            placeholder="Add more detail (optional)"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            error={errors.description}
            rows={4}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              name="status"
              label="Status"
              value={form.status}
              onChange={(e) => setField('status', e.target.value)}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>

            <Select
              name="priority"
              label="Priority"
              value={form.priority}
              onChange={(e) => setField('priority', e.target.value)}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>

            <Select
              name="cat_id"
              label="Category"
              value={form.cat_id}
              onChange={(e) => setField('cat_id', e.target.value)}
              error={errors.cat_id}
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option
                  key={category.cat_id}
                  value={category.cat_id}
                >
                  {category.cat_name}
                </option>
              ))}
            </Select>

            <Input
              name="due_date"
              label="Due date"
              type="date"
              value={form.due_date}
              onChange={(e) => setField('due_date', e.target.value)}
            />
          </div>

          <ErrorBanner message={serverError} />
        </form>
      )}
    </Modal>
  )
}