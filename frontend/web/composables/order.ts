// Composable pour gérer les commandes
import { useOrderStore } from '~/stores/order'
import { type Order, type OrderCreate } from '~/services/order'

export const useOrder = () => {
  const orderStore = useOrderStore()
  
  /**
   * Hook pour récupérer les commandes de l'utilisateur
   */
  const useFetchUserOrders = () => {
    const orders = computed(() => orderStore.orders)
    const loading = computed(() => orderStore.loading)
    const error = computed(() => orderStore.error)
    
    const fetchOrders = async () => {
      await orderStore.fetchUserOrders()
    }
    
    onMounted(() => {
      fetchOrders()
    })
    
    return { orders, loading, error, refresh: fetchOrders }
  }
  
  /**
   * Hook pour récupérer une commande par ID
   */
  const useFetchOrder = (orderId: number) => {
    const order = computed(() => orderStore.currentOrder)
    const loading = computed(() => orderStore.loading)
    const error = computed(() => orderStore.error)
    
    const fetchOrder = async () => {
      await orderStore.fetchOrderById(orderId)
    }
    
    onMounted(() => {
      fetchOrder()
    })
    
    return { order, loading, error, refresh: fetchOrder }
  }
  
  /**
   * Création d'une commande
   */
  const createOrder = async (orderData: OrderCreate) => {
    return await orderStore.createOrder(orderData)
  }
  
  /**
   * Mise à jour du statut d'une commande
   */
  const updateOrderStatus = async (orderId: number, status: string) => {
    return await orderStore.updateOrderStatus(orderId, status)
  }
  
  /**
   * Annulation d'une commande
   */
  const cancelOrder = async (orderId: number) => {
    return await orderStore.cancelOrder(orderId)
  }
  
  return {
    useFetchUserOrders,
    useFetchOrder,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    activeOrders: computed(() => orderStore.activeOrders),
    completedOrders: computed(() => orderStore.completedOrders),
    cancelledOrders: computed(() => orderStore.cancelledOrders)
  }
}