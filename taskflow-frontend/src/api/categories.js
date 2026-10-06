import { request } from './http.js'

export const categoriesApi = {
  list() {
    return request('/get_category')
  },

  create(data) {
    return request('/create_category', {
      method: 'POST',
      body: data,
    })
  },

  rename(catId, data) {
    return request(`/rename_category/${catId}`, {
      method: 'PUT',
      body: data,
    })
  },

  delete(catId) {
    return request(`/delete_category/${catId}`, {
      method: 'DELETE',
    })
  },
}