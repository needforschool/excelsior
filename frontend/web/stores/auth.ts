// Store pour gérer l'état d'authentification
import { defineStore } from 'pinia'
import { type User } from '~/services/user'

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isClient: (state) => state.user?.role === 'client',
    isProvider: (state) => state.user?.role === 'prestataire'
  },
  
  actions: {
    setToken(token: string) {
      this.token = token
      // Stocker le token dans localStorage pour persistance
      if (process.client) {
        localStorage.setItem('auth_token', token)
      }
    },
    
    setUser(user: User) {
      this.user = user
    },
    
    setLoading(loading: boolean) {
      this.loading = loading
    },
    
    setError(error: string | null) {
      this.error = error
    },
    
    async initialize() {
      if (process.client) {
        // Récupérer le token depuis localStorage
        const token = localStorage.getItem('auth_token')
        if (token) {
          this.token = token
          await this.fetchCurrentUser()
        }
      }
    },
    
    async fetchCurrentUser() {
      const { useUserService } = await import('~/services/user')
      const userService = useUserService()
      
      this.loading = true
      this.error = null
      
      try {
        const response = await userService.getCurrentUser()
        
        if (response.error) {
          this.error = response.error
          this.logout()
          return false
        }
        
        if (response.data) {
          this.user = response.data
          return true
        }
        
        return false
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
        this.logout()
        return false
      } finally {
        this.loading = false
      }
    },
    
    async login(email: string, password: string) {
      const { useUserService } = await import('~/services/user')
      const userService = useUserService()
      
      this.loading = true
      this.error = null
      
      try {
        const response = await userService.login({
          username: email,
          password
        })
        
        if (response.error) {
          this.error = response.error
          return false
        }
        
        if (response.data) {
          this.setToken(response.data.access_token)
          await this.fetchCurrentUser()
          return true
        }
        
        return false
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async register(name: string, email: string, password: string, role: 'client' | 'prestataire') {
      const { useUserService } = await import('~/services/user')
      const userService = useUserService()
      
      this.loading = true
      this.error = null
      
      try {
        const response = await userService.register({
          name,
          email,
          password,
          role
        })
        
        if (response.error) {
          this.error = response.error
          return false
        }
        
        // Connexion automatique après inscription
        if (response.data) {
          return await this.login(email, password)
        }
        
        return false
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
        return false
      } finally {
        this.loading = false
      }
    },
    
    logout() {
      this.token = null
      this.user = null
      
      // Supprimer le token du localStorage
      if (process.client) {
        localStorage.removeItem('auth_token')
      }
    }
  }
})