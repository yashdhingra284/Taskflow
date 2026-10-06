import { useEffect, useState } from 'react'
import { categoriesApi } from '../api/categories.js'
import { ApiError } from '../api/http.js'
import { useToast } from '../context/ToastContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { Input } from '../components/ui/FormControls.jsx'
import { ErrorState } from '../components/ui/Feedback.jsx'
import { Icon } from '../components/ui/icons.jsx'

export function Categories() {
  const toast = useToast()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [renameCategory, setRenameCategory] = useState(null)
  const [deleteCategory, setDeleteCategory] = useState(null)

  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const loadCategories = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await categoriesApi.list()
      setCategories(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setCategories([])
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to load categories.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleCreate = async () => {
    if (!name.trim()) return

    setSaving(true)

    try {
      await categoriesApi.create({
        cat_name: name.trim(),
      })

      toast.success('Category created.')
      setName('')
      setCreateOpen(false)
      await loadCategories()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Unable to create category.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleRename = async () => {
    if (!name.trim() || !renameCategory) return

    setSaving(true)

    try {
      await categoriesApi.rename(renameCategory.cat_id, {
        cat_name: name.trim(),
      })

      toast.success('Category renamed.')
      setRenameCategory(null)
      setName('')
      await loadCategories()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Unable to rename category.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteCategory) return

    setSaving(true)

    try {
      await categoriesApi.delete(deleteCategory.cat_id)

      toast.success('Category and its tasks deleted.')
      setDeleteCategory(null)
      await loadCategories()

      window.dispatchEvent(new Event('taskflow:task-saved'))
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Unable to delete category.'
      )
    } finally {
      setSaving(false)
    }
  }

  const openRename = (category) => {
    setRenameCategory(category)
    setName(category.cat_name)
  }

  const openCreate = () => {
    setName('')
    setCreateOpen(true)
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Categories
        </h1>

        <div className="mt-6 text-sm text-slate-500">
          Loading categories…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load your categories"
        message={error}
        onRetry={loadCategories}
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Categories
          </h1>

          <p className="mt-0.5 text-sm text-slate-500">
            Organize your tasks into categories.
          </p>
        </div>

        <Button
          onClick={openCreate}
          icon={<Icon name="plus" className="h-4 w-4" />}
        >
          New category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <h2 className="text-sm font-semibold text-slate-900">
            No categories yet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create your first category to organize your tasks.
          </p>

          <div className="mt-4">
            <Button onClick={openCreate}>
              Create category
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.cat_id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon name="folder" className="h-4 w-4" />
                  </div>

                  <h2 className="truncate text-sm font-bold text-slate-900">
                    {category.cat_name}
                  </h2>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openRename(category)}
                    className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Rename ${category.cat_name}`}
                  >
                    <Icon name="edit" className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteCategory(category)}
                    className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${category.cat_name}`}
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={saving ? undefined : () => setCreateOpen(false)}
        title="Create Category"
        description="Create a category to organize your tasks."
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCreateOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreate}
              loading={saving}
              disabled={!name.trim()}
            >
              Create category
            </Button>
          </>
        }
      >
        <Input
          label="Category name"
          placeholder="e.g. College"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </Modal>

      <Modal
        open={Boolean(renameCategory)}
        onClose={saving ? undefined : () => setRenameCategory(null)}
        title="Rename Category"
        description="Update the category name."
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRenameCategory(null)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleRename}
              loading={saving}
              disabled={!name.trim()}
            >
              Save changes
            </Button>
          </>
        }
      >
        <Input
          label="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteCategory)}
        onCancel={() => setDeleteCategory(null)}
        onConfirm={handleDelete}
        loading={saving}
        destructive
        title="Delete category?"
        confirmLabel="Delete category"
        message={
          deleteCategory
            ? `Deleting "${deleteCategory.cat_name}" will permanently delete this category and all tasks under it. This action cannot be undone.`
            : ''
        }
      />
    </div>
  )
}