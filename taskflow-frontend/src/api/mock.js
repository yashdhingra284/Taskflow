import { ApiError } from './http.js'
import { getDb, saveDbAndReturn, DEMO_EMAIL, DEMO_PASSWORD } from './mockDb.js'
import { normalizePriority } from '../lib/constants.js'

const LATENCY = 450

function delay() {
  return new Promise((resolve) => setTimeout(resolve, LATENCY + Math.random() * 200))
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, created_at: user.created_at }
}

function assertSession(db, token) {
  if (!token || !db.sessions[token]) {
    throw new ApiError('Your session has expired. Please log in again.', 401)
  }
  return db.users.find((u) => u.id === db.sessions[token])
}

function assertOwner(task, userId) {
  if (!task || task.owner_id !== userId) {
    throw new ApiError('Task not found.', 404)
  }
  return task
}

export const mockApi = {
  async login({ email, password }) {
    await delay()
    const db = getDb()
    const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (!user || user.password !== password) {
      throw new ApiError('Invalid email or password.', 401)
    }
    const token = `token-${user.id}-${Date.now()}`
    db.sessions[token] = user.id
    return saveDbAndReturn(db, {
      access_token: token,
      token_type: 'bearer',
      user: publicUser(user),
    })
  },

  async register({ name, email, password }) {
    await delay()
    const db = getDb()
    if (db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
      throw new ApiError('An account with this email already exists.', 409)
    }
    const user = {
      id: `u-${db.nextUserId++}`,
      name,
      email,
      password,
      created_at: new Date().toISOString(),
    }
    db.users.push(user)
    const token = `token-${user.id}-${Date.now()}`
    db.sessions[token] = user.id
    return saveDbAndReturn(db, {
      access_token: token,
      token_type: 'bearer',
      user: publicUser(user),
    })
  },

  async me(token) {
    await delay()
    const db = getDb()
    return saveDbAndReturn(db, publicUser(assertSession(db, token)))
  },

  async listTasks({ token, search, status, priority, due, sort, page, page_size }) {
    await delay()
    const db = getDb()
    const user = assertSession(db, token)

    let items = db.tasks.filter((t) => t.owner_id === user.id)

    if (search) {
      const q = String(search).toLowerCase()
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q),
      )
    }
    if (status && status !== 'all') items = items.filter((t) => t.status === status)
    if (priority && priority !== 'all') items = items.filter((t) => normalizePriority(t.priority) === normalizePriority(priority))

    if (due && due !== 'all') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const inSevenDays = new Date(today)
      inSevenDays.setDate(inSevenDays.getDate() + 7)
      if (due === 'overdue') {
        items = items.filter(
          (t) => t.due_date && new Date(t.due_date) < today && t.status !== 'done',
        )
      } else if (due === 'due_soon') {
        items = items.filter(
          (t) => t.due_date && new Date(t.due_date) >= today && new Date(t.due_date) <= inSevenDays,
        )
      } else if (due === 'no_due') {
        items = items.filter((t) => !t.due_date)
      }
    }

    const priorityRank = { 'Most Imp': 0, Imp: 1, 'Least Imp': 2 }
    const sorters = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      due_date: (a, b) => {
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date) - new Date(b.due_date)
      },
      priority: (a, b) => priorityRank[normalizePriority(a.priority)] - priorityRank[normalizePriority(b.priority)],
      title: (a, b) => a.title.localeCompare(b.title),
    }
    items.sort(sorters[sort ?? 'newest'])

    const total = items.length
    const size = page_size ?? 12
    const start = ((page ?? 1) - 1) * size
    const paged = items.slice(start, start + size)

    return {
items: paged.map(
  ({
    id,
    title,
    description,
    status,
    priority,
    due_date,
    created_at,
    updated_at,
    cat_id,
  }) => ({
    id,
    title,
    description,
    status,
    priority,
    due_date,
    created_at,
    updated_at,
    cat_id,
  }),
),
      total,
      page: page ?? 1,
      page_size: size,
    }
  },

  async getTask({ token, id }) {
    await delay()
    const db = getDb()
    const user = assertSession(db, token)
    return saveDbAndReturn(db, assertOwner(db.tasks.find((t) => t.id === id), user.id))
  },

  async createTask({ token, data }) {
    await delay()
    const db = getDb()
    const user = assertSession(db, token)
    const now = new Date().toISOString()
    const task = {
      id: `t-${String(db.nextTaskId++).padStart(2, '0')}`,
      title: data.title,
      description: data.description ?? '',
      status: data.status ?? 'todo',
      priority: data.priority ?? 'Imp',
      due_date: data.due_date ?? null,
      created_at: now,
      updated_at: now,
      owner_id: user.id,
    }
    db.tasks.push(task)
    return saveDbAndReturn(db, { ...task })
  },

  async updateTask({ token, id, data }) {
    await delay()
    const db = getDb()
    const user = assertSession(db, token)
    const task = assertOwner(db.tasks.find((t) => t.id === id), user.id)
    Object.assign(task, {
      title: data.title,
      description: data.description ?? '',
      status: data.status,
      priority: data.priority,
      due_date: data.due_date ?? null,
      updated_at: new Date().toISOString(),
    })
    return saveDbAndReturn(db, { ...task })
  },

  async deleteTask({ token, id }) {
    await delay()
    const db = getDb()
    const user = assertSession(db, token)
    const index = db.tasks.findIndex((t) => t.id === id && t.owner_id === user.id)
    if (index === -1) throw new ApiError('Task not found.', 404)
    db.tasks.splice(index, 1)
    saveDbAndReturn(db, null)
    return null
  },

  async changePassword({ token, current_password, new_password }) {
    await delay()
    const db = getDb()
    const user = assertSession(db, token)
    if (user.password !== current_password) {
      throw new ApiError('Current password is incorrect.', 400)
    }
    user.password = new_password
    saveDbAndReturn(db, null)
    return null
  },

  async deleteAccount({ token }) {
    await delay()
    const db = getDb()
    const user = assertSession(db, token)
    db.tasks = db.tasks.filter((t) => t.owner_id !== user.id)
    db.users = db.users.filter((u) => u.id !== user.id)
    delete db.sessions[token]
    saveDbAndReturn(db, null)
    return null
  },
}

export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD }
