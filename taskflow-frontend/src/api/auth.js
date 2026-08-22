import { USE_MOCK } from './config.js'
import { request, setToken, getToken } from './http.js'
import { mockApi } from './mock.js'

// Auth API contract (FastAPI):
//   POST /auth/login    { email, password }            -> { access_token, user }
//   POST /auth/register { name, email, password }      -> { access_token, user }
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
        const token = await request('/loginuser', { method: 'POST', body: credentials })
        setToken(token)
        return { access_token: token}
      },
      async register(payload) {
        const res = await request('/registeruser', { method: 'POST', body: payload })
        setToken(res.access_token)
        return res
      },
      async updatePassword(payload){
        return request('/update_password',{
          method:'PUT',
          body: JSON.stringify(payload),
        })
      },
      async me() {
        return request('/users/me')
      },
      logout() {
        setToken(null)
      },
    }
