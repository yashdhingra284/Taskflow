import { USE_MOCK } from './config.js'
import { request, setToken, getToken } from './http.js'
import { mockApi } from './mock.js'

// Auth API contract (FastAPI):
//   POST /loginuser    { email, password }            -> { access_token, token_type }
//   POST /registeruser { name, email, password }      -> { access_token, token_type }
//   GET  /users/me                                     -> user

export const authApi = USE_MOCK
  ? {
      async login(credentials) {
        const res = await mockApi.login(credentials)
        setToken(res.access_token)
        return res
      },
      async register(payload) {
        const res = await mockApi.register(payload)
        setToken(res.access_token)
        return res
      },
      async me() {
        return mockApi.me(getToken())
      },
      logout() {
        setToken(null)
      },
    }
  : {
      async login(credentials) {
        const res = await request('/loginuser', { method: 'POST', body: credentials })
        setToken(res.access_token)
        return res
      },
      async register(payload) {
        const res = await request('/registeruser', { method: 'POST', body: payload })
        setToken(res.access_token)
        return res
      },
      async me() {
        return request('/users/me')
      },
      logout() {
        setToken(null)
      },
    }
