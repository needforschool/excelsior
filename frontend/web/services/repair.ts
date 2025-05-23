import { useApi } from '~/lib/api'

export interface Repair {
  id: number
  order_id: number
  issue_type: string
  technician_name: string | null
  status: string
  created_at: string
}

export interface RepairCreate {
  order_id: number
  issue_type: string
  technician_name?: string | null
}

export interface RepairUpdate {
  issue_type?: string
  technician_name?: string | null
  status?: string
}

export const useRepairService = () => {
  const api = useApi()
  
  /**
   * Création d'un service de dépannage
   */
  const createRepair = async (repairData: RepairCreate) => {
    return await api.post<Repair>('/repairs', repairData)
  }
  
  /**
   * Récupération de tous les services de dépannage
   */
  const getAllRepairs = async (params?: { skip?: number; limit?: number }) => {
    return await api.get<Repair[]>('/repairs', params)
  }
  
  /**
   * Récupération d'un service de dépannage par ID
   */
  const getRepairById = async (repairId: number) => {
    return await api.get<Repair>(`/repairs/${repairId}`)
  }
  
  /**
   * Récupération du service de dépannage associé à une commande
   */
  const getRepairByOrder = async (orderId: number) => {
    return await api.get<Repair>(`/orders/${orderId}/repair`)
  }
  
  /**
   * Mise à jour d'un service de dépannage
   */
  const updateRepair = async (repairId: number, repairData: RepairUpdate) => {
    return await api.patch<Repair>(`/repairs/${repairId}`, repairData)
  }
  
  return {
    createRepair,
    getAllRepairs,
    getRepairById,
    getRepairByOrder,
    updateRepair
  }
}