// Store pour gérer l'état des commandes
import { defineStore } from 'pinia'
import { type Order, type OrderCreate, type OrderUpdate } from '~/services/order'
import { useAuthStore } from '~/stores/auth'

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
}

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null
  }),
  
  getters: {
    activeOrders: (state) => state.orders.filter(order => order.status === 'en cours'),
    completedOrders: (state) => state.orders.filter(order => order.status === 'terminé'),
    cancelledOrders: (state) => state.orders.filter(order => order.status === 'annulé')
  },
  
  actions: {
    setOrders(orders: Order[]) {
      this.orders = orders
    },
    
    setCurrentOrder(order: Order | null) {
      this.currentOrder = order
    },
    
    setLoading(loading: boolean) {
      this.loading = loading
    },
    
    setError(error: string | null) {
      this.error = error
    },
    
    async fetchUserOrders() {
      const { useOrderService } = await import('~/services/order')
      const orderService = useOrderService()
      const authStore = useAuthStore()
      
      // Vérifions si l'utilisateur a un token, même si les infos utilisateur ne sont pas chargées
      if (!authStore.token) {
        this.error = "L'utilisateur doit être connecté pour voir ses commandes"
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        // Si l'API permet de récupérer les commandes de l'utilisateur courant sans ID
        const response = await orderService.getAllOrders()
        
        if (response.error) {
          this.error = response.error
          return
        }
        
        if (response.data) {
          this.orders = response.data
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
      } finally {
        this.loading = false
      }
    },
    
    async fetchOrderById(orderId: number) {
      const { useOrderService } = await import('~/services/order')
      const orderService = useOrderService()
      
      this.loading = true
      this.error = null
      
      try {
        const response = await orderService.getOrderById(orderId)
        
        if (response.error) {
          this.error = response.error
          return
        }
        
        if (response.data) {
          this.currentOrder = response.data
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
      } finally {
        this.loading = false
      }
    },
    
    async createOrder(orderData: OrderCreate) {
      const { useOrderService } = await import('~/services/order')
      const orderService = useOrderService()
      
      this.loading = true
      this.error = null
      
      try {
        // Utiliser directement les données, sans vérifier user_id
        const response = await orderService.createOrder(orderData)
        
        if (response.error) {
          this.error = response.error
          return null
        }
        
        if (response.data) {
          // Ajouter la nouvelle commande à la liste
          this.orders.push(response.data)
          this.currentOrder = response.data
          return response.data
        }
        
        return null
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
        return null
      } finally {
        this.loading = false
      }
    },
    
    async updateOrderStatus(orderId: number, status: string) {
      const { useOrderService } = await import('~/services/order')
      const orderService = useOrderService()
      
      this.loading = true
      this.error = null
      
      try {
        const orderData: OrderUpdate = { status }
        const response = await orderService.updateOrderStatus(orderId, orderData)
        
        if (response.error) {
          this.error = response.error
          return false
        }
        
        if (response.data) {
          // Mettre à jour la commande dans la liste
          const index = this.orders.findIndex(order => order.id === orderId)
          if (index !== -1) {
            this.orders[index] = response.data
          }
          
          // Mettre à jour la commande courante si c'est la même
          if (this.currentOrder && this.currentOrder.id === orderId) {
            this.currentOrder = response.data
          }
          
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
    
    async cancelOrder(orderId: number) {
      return await this.updateOrderStatus(orderId, 'annulé')
    }
  }
})