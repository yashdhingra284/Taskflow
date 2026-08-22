import { USE_MOCK } from './config.js'
import { request, getToken } from './http.js'
import { mockApi } from './mock.js'

// User API contract (FastAPI):
//   PUT    /users/me/password  { current_password, new_password } -> 204
//   DELETE /users/me                                             -> 204

export const userApi = USE_MOCK
  ? {
      changePassword(current_password, new_password) {
        return mockApi.changePassword({ token: getToken(), current_password, new_password })
      },
      deleteAccount() {
        return mockApi.deleteAccount({ token: getToken() })
      },
    }
  : {
      changePassword(current_password, new_password) {
        return request('/update_password', {
          method: 'PUT',
          body: { current_password, new_password },
        })
      },
      deleteAccount() {
        return request('/delete_user', { method: 'DELETE' })
      },
    }