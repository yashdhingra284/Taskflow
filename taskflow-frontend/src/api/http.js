import { API_BASE_URL } from './config.js'

const TOKEN_KEY = 'taskflow_token'

export class ApiError extends Error {
  constructor(message, status = 0, detail = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function buildQuery(params) {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export async function request(path, { method = 'GET', body, params } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    console.log("REQUEST:", method, `${API_BASE_URL}${path}${buildQuery(params)}`)
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection and try again.')
  }

  if (!response.ok) {
    let detail = null
    try {
      const data = await response.json()
      detail = data.detail ?? data
    } catch {
      detail = null
    }
    const message =
      typeof detail === 'string'
        ? detail
        : detail?.message ?? `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, detail)
  }

  if (response.status === 204) return null
  return response.json()
}
