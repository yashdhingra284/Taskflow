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
  priority: 'Imp',
  due_date: '',
}

function validate(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Title is required.'
  if (form.description && form.description.length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer.'
  }

  if (!form.cat_id) errors.cat_id = 'Category is required.'
  if (!form.due_date) errors.due_date = 'Due date is required.'
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

  useEffect(() => {
    if (!open) return
    setErrors({})
    setServerError('')
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
  try {
    const data = await categoriesApi.list()
    setCategories(data)
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

loadCategories()
  }, [open, task])

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e))
  }

  const handleSubmit = async () => {
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

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
      setServerError(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={isEdit ? 'Edit Task' : 'Create Task'}
      description={isEdit ? 'Update the task details below.' : 'Add a new task to your list.'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
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
              <option key={category.cat_id} value={category.cat_id}>
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
            error = {errors.due_date}
          />
        </div>
        <ErrorBanner message={serverError} />
      </form>
    </Modal>
  )
}