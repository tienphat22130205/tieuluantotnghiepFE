import axios from 'axios'

/**
 * Axios instance cấu hình sẵn baseURL & interceptors.
 * Tất cả service đều import instance này để gọi API.
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ──── Request Interceptor ────
// Tự động gắn token vào header mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ──── Response Interceptor ────
// Xử lý lỗi chung (401 → redirect login, 500 → log)
api.interceptors.response.use(
  (response) => response.data, // Trả thẳng data, bỏ wrapper axios
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error.response?.data || error.message)
  }
)

export default api
