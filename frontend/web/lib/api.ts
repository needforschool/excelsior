// Service API pour gérer les appels au backend
import { useAuthStore } from '~/stores/auth'

const API_URL = process.env.API_URL || 'http://localhost:8080/api'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

/**
 * Client API pour les appels au backend
 */
export const useApi = () => {
  /**
   * Effectue un appel API avec la méthode GET
   */
  const get = async <T = any>(
    endpoint: string, 
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> => {
    try {
      const authStore = useAuthStore()
      const queryParams = params ? `?${new URLSearchParams(params)}` : ''
      const url = `${API_URL}${endpoint}${queryParams}`
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { 
          data: null, 
          error: errorData.detail || 'Une erreur est survenue', 
          status: response.status 
        }
      }
      
      const data = await response.json()
      return { data, error: null, status: response.status }
    } catch (error) {
      console.error('API GET error:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Une erreur réseau est survenue', 
        status: 500 
      }
    }
  }
  
  /**
   * Effectue un appel API avec la méthode POST
   */
  const post = async <T = any>(
    endpoint: string, 
    data?: any
  ): Promise<ApiResponse<T>> => {
    try {
      const authStore = useAuthStore()
      const url = `${API_URL}${endpoint}`
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { 
          data: null, 
          error: errorData.detail || 'Une erreur est survenue', 
          status: response.status 
        }
      }
      
      const responseData = await response.json()
      return { data: responseData, error: null, status: response.status }
    } catch (error) {
      console.error('API POST error:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Une erreur réseau est survenue', 
        status: 500 
      }
    }
  }
  
  /**
   * Effectue un appel API avec la méthode PATCH
   */
  const patch = async <T = any>(
    endpoint: string, 
    data?: any
  ): Promise<ApiResponse<T>> => {
    try {
      const authStore = useAuthStore()
      const url = `${API_URL}${endpoint}`
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { 
          data: null, 
          error: errorData.detail || 'Une erreur est survenue', 
          status: response.status 
        }
      }
      
      const responseData = await response.json()
      return { data: responseData, error: null, status: response.status }
    } catch (error) {
      console.error('API PATCH error:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Une erreur réseau est survenue', 
        status: 500 
      }
    }
  }
  
  /**
   * Effectue un appel API avec la méthode DELETE
   */
  const del = async <T = any>(
    endpoint: string
  ): Promise<ApiResponse<T>> => {
    try {
      const authStore = useAuthStore()
      const url = `${API_URL}${endpoint}`
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { 
          data: null, 
          error: errorData.detail || 'Une erreur est survenue', 
          status: response.status 
        }
      }
      
      return { data: null, error: null, status: response.status }
    } catch (error) {
      console.error('API DELETE error:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Une erreur réseau est survenue', 
        status: 500 
      }
    }
  }
  
  return {
    get,
    post,
    patch,
    delete: del
  }
}