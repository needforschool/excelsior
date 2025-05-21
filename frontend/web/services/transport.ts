import { useApi } from '~/lib/api'

export interface Transport {
  id: number
  order_id: number
  vehicle_type: string
  driver_name: string
  driver_contact: string | null
  status: string
  created_at: string
}

export interface TransportCreate {
  order_id: number
  vehicle_type: string
  driver_name: string
  driver_contact?: string
}

export interface TransportUpdate {
  vehicle_type?: string
  driver_name?: string
  driver_contact?: string
  status?: string
}

export const useTransportService = () => {
  const api = useApi()
  
  /**
   * Création d'un transport
   */
  const createTransport = async (transportData: TransportCreate) => {
    return await api.post<Transport>('/transports', transportData)
  }
  
  /**
   * Récupération de tous les transports
   */
  const getAllTransports = async (params?: { skip?: number; limit?: number }) => {
    return await api.get<Transport[]>('/transports', params)
  }
  
  /**
   * Récupération d'un transport par ID
   */
  const getTransportById = async (transportId: number) => {
    return await api.get<Transport>(`/transports/${transportId}`)
  }
  
  /**
   * Récupération du transport associé à une commande
   */
  const getTransportByOrder = async (orderId: number) => {
    return await api.get<Transport>(`/orders/${orderId}/transport`)
  }
  
  /**
   * Mise à jour d'un transport
   */
  const updateTransport = async (transportId: number, transportData: TransportUpdate) => {
    return await api.patch<Transport>(`/transports/${transportId}`, transportData)
  }
  
  return {
    createTransport,
    getAllTransports,
    getTransportById,
    getTransportByOrder,
    updateTransport
  }
}