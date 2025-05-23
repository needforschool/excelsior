// Service spécifique pour les appels API liés aux utilisateurs
import { useApi } from '~/lib/api'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'client' | 'prestataire'
  created_at: string
  phone?: string
  address?: string
  avatar?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'client' | 'prestataire'
}

export const useUserService = () => {
  const api = useApi()
  
  /**
   * Connexion utilisateur
   */
  const login = async (credentials: LoginRequest) => {
    return await api.post<AuthResponse>('/token', credentials)
  }
  
  /**
   * Inscription utilisateur
   */
  const register = async (userData: RegisterRequest) => {
    return await api.post<User>('/users', userData)
  }
  
  /**
   * Récupération du profil utilisateur connecté
   */
  const getCurrentUser = async () => {
    return await api.get<User>('/users/me')
  }
  
  /**
   * Récupération d'un utilisateur par ID
   */
  const getUserById = async (userId: number) => {
    return await api.get<User>(`/users/${userId}`)
  }
  
  /**
   * Mise à jour du profil utilisateur
   */
  const updateProfile = async (userId: number, userData: Partial<User>) => {
    return await api.patch<User>(`/users/${userId}`, userData)
  }
  
  return {
    login,
    register,
    getCurrentUser,
    getUserById,
    updateProfile
  }
}