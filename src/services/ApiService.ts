// src/services/api.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    'X-AccessPoint': 'mobile'
  }
})

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    const fullUrl = new URL(
      config.url || '',
      config.baseURL || API_BASE_URL
    ).toString()

    console.log('========================================')
    console.log('🚀 AXIOS REQUEST')
    console.log('Method:', config.method?.toUpperCase())
    console.log('Base URL:', config.baseURL || API_BASE_URL)
    console.log('Resource:', config.url)
    console.log('Full URL:', fullUrl)
    console.log('Headers:', config.headers)
    console.log('Params:', config.params)
    console.log('Data:', config.data)
    console.log('========================================')

    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error) => {
    const originalRequest = error.config

    console.error('🚨 API Error:', error?.response || error)

   
   
    return Promise.reject(error)
  }
)
const ApiService = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.get(url, config).then((res) => res.data)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.post(url, data, config).then((res) => res.data)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.put(url, data, config).then((res) => res.data)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.delete(url, config).then((res) => res.data)
  },

  upload<T = any>(url: string, payload: FormData): Promise<T> {
    return apiClient
      .post(url, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((res) => res.data)
  }
}

export default ApiService
