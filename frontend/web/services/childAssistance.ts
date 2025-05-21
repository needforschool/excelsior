import { useApi } from '~/lib/api'

export interface ChildAssistance {
  id: number
  order_id: number
  guardian_name: string
  child_count: number
  destination: string
  status: string
  created_at: string
}

export interface ChildAssistanceCreate {
  order_id: number
  guardian_name: string
  child_count: number
  destination: string
}

export interface ChildAssistanceUpdate {
  guardian_name?: string
  child_count?: number
  destination?: string
  status?: string
}

export const useChildAssistanceService = () => {
  const api = useApi()
  
  /**
   * Création d'un service de garde d'enfant
   */
  const createChildAssistance = async (childAssistanceData: ChildAssistanceCreate) => {
    return await api.post<ChildAssistance>('/child-assistances', childAssistanceData)
  }
  
  /**
   * Récupération de tous les services de garde d'enfant
   */
  const getAllChildAssistances = async (params?: { skip?: number; limit?: number }) => {
    return await api.get<ChildAssistance[]>('/child-assistances', params)
  }
  
  /**
   * Récupération d'un service de garde d'enfant par ID
   */
  const getChildAssistanceById = async (childAssistanceId: number) => {
    return await api.get<ChildAssistance>(`/child-assistances/${childAssistanceId}`)
  }
  
  /**
   * Récupération du service de garde d'enfant associé à une commande
   */
  const getChildAssistanceByOrder = async (orderId: number) => {
    return await api.get<ChildAssistance>(`/orders/${orderId}/child-assistance`)
  }
  
  /**
   * Mise à jour d'un service de garde d'enfant
   */
  const updateChildAssistance = async (childAssistanceId: number, childAssistanceData: ChildAssistanceUpdate) => {
    return await api.patch<ChildAssistance>(`/child-assistances/${childAssistanceId}`, childAssistanceData)
  }
  
  return {
    createChildAssistance,
    getAllChildAssistances,
    getChildAssistanceById,
    getChildAssistanceByOrder,
    updateChildAssistance
  }
}