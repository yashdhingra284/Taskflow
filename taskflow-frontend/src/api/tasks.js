import { USE_MOCK } from './config.js'
import { request, getToken } from './http.js'
import { mockApi } from './mock.js'

// Tasks API contract (FastAPI):
//   GET    /tasks                     params: search, status, priority, due, sort, page, page_size
//                                    -> { items: Task[], total, page, page_size }
//   POST   /tasks    { title, description, status, priority, due_date }  -> Task
//   GET    /tasks/:id                                                    -> Task
//   PUT    /tasks/:id  { title, description, status, priority, due_date } -> Task
//   DELETE /tasks/:id                                                    -> 204
//   Task: { id, title, description, status, priority, due_date, category, cat_id,
//           created_at, updated_at }

const pickTask = ({ id, title, description, status, priority, due_date, created_at, updated_at, cat_id, category, cat_name }) => ({
  id,
  title,
  description,
  status,
  priority,
  due_date,
  created_at,
  updated_at,
  cat_id: cat_id ?? null,
  category: category ?? cat_name ?? null,
})

export const tasksApi = USE_MOCK
  ? {
      list(params) {
        return mockApi.listTasks({ token: getToken(), ...params })
      },
      get(id) {
        return mockApi.getTask({ token: getToken(), id })
      },
      create(data) {
        return mockApi.createTask({ token: getToken(), data })
      },
      update(id, data) {
        return mockApi.updateTask({ token: getToken(), id, data })
      },
      remove(id) {
        return mockApi.deleteTask({ token: getToken(), id })
      },
    }
  : {
      list(params) {
const {
  page = 1,
  page_size = 12,
  sort = 'newest',
  status = 'all',
  priority = 'all',
  due = 'all',
} = params

return request('/gettask', {
  params: {
    page,
    limit: page_size,
    sort,
    status,
    priority,
    due,
  },
}).then((res) => ({
  items: res.items.map((task) => ({
    id: task.task_id,
    title: task.Title,
    description: task.Description,
    priority: task.Priority,
    due_date: task.Due_Date,
    status: task.Status,
    category: task.Category,
    cat_id: task.cat_id,
    created_at: task.created_at,
    updated_at: task.updated_at,
  })),
  total: res.total,
  page,
  page_size,
}))
      },
get(id) {
  return request(`/tasks/${id}`).then((task) => ({
    id: task.task_id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    due_date: task.due_date,
    status: task.status,
    category: task.cat_name,
    cat_id: task.cat_id,
    created_at: task.created_at,
    updated_at: task.updated_at,
  }))
},
      create(data) {
        return request('/createTask', { method: 'POST', body: data })
      },
      update(id, data) {
        return request(`/update_task/${id}`, { method: 'PUT', body: data })
      },
search(query, page = 1, page_size = 12, filters = {}) {
  return request('/search_task', {
    params: {
      query,
      page,
      limit: page_size,
      status: filters.status,
      priority: filters.priority,
      due: filters.due,
    },
  }).then((res) => ({
    items: res.items.map((task) => ({
      id: task.task_id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date,
      status: task.status,
      category: task.cat_name,
      cat_id: task.cat_id,
      created_at: task.created_at,
      updated_at: task.updated_at,
    })),
    total: res.total,
    page,
    page_size,
  }))
},
      remove(id) {
        console.log("REMOVE API ID:", id)
        return request(`/delete_task/${id}`, { method: 'DELETE' })
      },
    }