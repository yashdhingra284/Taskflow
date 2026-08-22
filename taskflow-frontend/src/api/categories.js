import { request } from './http.js'

export const categoriesApi = {
  list() {
    return request('/get_category')
  },
}