import { useApi } from '~/lib/api'

export interface Cleaning {
  id: number
  order_id: number
  location_type: string
  cleaning_duration: number
  status: string
  created_at: string
}

export interface CleaningCreate {
  order_id: number
  location_type: string
  cleaning_duration: number
}

export interface CleaningUpdate {
  location_type?: string
  cleaning_duration?: number
  status?: string
}

export const useCleaningService = () => {
  const api = useApi()
  
  /**
   * Création d'un service de nettoyage
   */
  const createCleaning = async (cleaningData: CleaningCreate) => {
    return await api.post<Cleaning>('/cleanings', cleaningData)
  }
  
  /**
   * Récupération de tous les services de nettoyage
   */
  const getAllCleanings = async (params?: { skip?: number; limit?: number }) => {
    return await api.get<Cleaning[]>('/cleanings', params)
  }
  
  /**
   * Récupération d'un service de nettoyage par ID
   */
  const getCleaningById = async (cleaningId: number) => {
    return await api.get<Cleaning>(`/cleanings/${cleaningId}`)
  }
  
  /**
   * Récupération du service de nettoyage associé à une commande
   */
  const getCleaningByOrder = async (orderId: number) => {
    return await api.get<Cleaning>(`/orders/${orderId}/cleaning`)
  }
  
  /**
   * Mise à jour d'un service de nettoyage
   */
  const updateCleaning = async (cleaningId: number, cleaningData: CleaningUpdate) => {
    return await api.patch<Cleaning>(`/cleanings/${cleaningId}`, cleaningData)
  }
  
  return {
    createCleaning,
    getAllCleanings,
    getCleaningById,
    getCleaningByOrder,
    updateCleaning
  }
}