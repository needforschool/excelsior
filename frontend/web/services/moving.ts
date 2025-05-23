import { useApi } from '~/lib/api'

export interface Moving {
  id: number
  order_id: number
  team_size: number
  truck_size: string
  status: string
  created_at: string
}

export interface MovingCreate {
  order_id: number
  team_size: number
  truck_size: string
}

export interface MovingUpdate {
  team_size?: number
  truck_size?: string
  status?: string
}

export const useMovingService = () => {
  const api = useApi()
  
  /**
   * Création d'un service de déménagement
   */
  const createMoving = async (movingData: MovingCreate) => {
    return await api.post<Moving>('/movings', movingData)
  }
  
  /**
   * Récupération de tous les services de déménagement
   */
  const getAllMovings = async (params?: { skip?: number; limit?: number }) => {
    return await api.get<Moving[]>('/movings', params)
  }
  
  /**
   * Récupération d'un service de déménagement par ID
   */
  const getMovingById = async (movingId: number) => {
    return await api.get<Moving>(`/movings/${movingId}`)
  }
  
  /**
   * Récupération du service de déménagement associé à une commande
   */
  const getMovingByOrder = async (orderId: number) => {
    return await api.get<Moving>(`/orders/${orderId}/moving`)
  }
  
  /**
   * Mise à jour d'un service de déménagement
   */
  const updateMoving = async (movingId: number, movingData: MovingUpdate) => {
    return await api.patch<Moving>(`/movings/${movingId}`, movingData)
  }
  
  return {
    createMoving,
    getAllMovings,
    getMovingById,
    getMovingByOrder,
    updateMoving
  }
}