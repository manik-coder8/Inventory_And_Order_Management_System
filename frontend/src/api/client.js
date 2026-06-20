import axios from 'axios'

// In Docker/production, set VITE_API_URL at build time to point at the backend's public URL.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Normalize error messages so components can show something useful.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error.response?.data?.detail ||
      error.message ||
      'Something went wrong. Please try again.'
    return Promise.reject(
      typeof detail === 'string' ? new Error(detail) : new Error(JSON.stringify(detail))
    )
  }
)

export default api
