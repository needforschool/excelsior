/**
   * Récupération des commandes de l'utilisateur courant
   * Cette fonction utilise le token d'authentification pour récupérer les commandes de l'utilisateur connecté
   */
  const getCurrentUserOrders = async (params?: { skip?: number; limit?: number }) => {
    return await api.get<Order[]>('/orders', params)
  }// Service spécifique pour les appels API liés aux commandes
import { useApi } from '~/lib/api'

export interface Order {
  id: number
  user_id: number
  service_type: string
  latitude: number
  longitude: number
  status: string
  created_at: string
}

export interface OrderCreate {
  service_type: string
  latitude: number
  longitude: number
  user_id?: number // Optionnel, car peut être récupéré via le token
}

export interface OrderUpdate {
  status?: string
}

export const useOrderService = () => {
  const api = useApi()
  
  /**
   * Création d'une commande
   */
  const createOrder = async (orderData: OrderCreate) => {
    return await api.post<Order>('/orders', orderData)
  }
  
  /**
   * Récupération de toutes les commandes
   */
  const getAllOrders = async (params?: { skip?: number; limit?: number }) => {
    return await api.get<Order[]>('/orders', params)
  }
  
  /**
   * Récupération d'une commande par ID
   */
  const getOrderById = async (orderId: number) => {
    return await api.get<Order>(`/orders/${orderId}`)
  }
  
  /**
   * Récupération des commandes d'un utilisateur
   */
  const getUserOrders = async (userId: number, params?: { skip?: number; limit?: number }) => {
    return await api.get<Order[]>(`/users/${userId}/orders`, params)
  }
  
  /**
   * Mise à jour du statut d'une commande
   */
  const updateOrderStatus = async (orderId: number, orderData: OrderUpdate) => {
    return await api.patch<Order>(`/orders/${orderId}`, orderData)
  }
  
  /**
   * Suppression d'une commande
   */
  const deleteOrder = async (orderId: number) => {
    return await api.delete(`/orders/${orderId}`)
  }
  
  return {
    createOrder,
    getAllOrders,
    getOrderById,
    getUserOrders,
    getCurrentUserOrders,
    updateOrderStatus,
    deleteOrder
  }
}