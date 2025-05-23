import { ref, computed, onMounted } from 'vue'
import { useTransportService, type Transport, type TransportCreate, type TransportUpdate } from '~/services/transport'

export const useTransport = () => {
  const transportService = useTransportService()
  
  /**
   * Hook pour récupérer un transport par ID
   */
  const useFetchTransport = (transportId: number) => {
    const transport = ref<Transport | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchTransport = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await transportService.getTransportById(transportId)
        
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          transport.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchTransport()
    })
    
    return { transport, loading, error, refresh: fetchTransport }
  }
  
  /**
   * Hook pour récupérer un transport associé à une commande
   */
  const useFetchTransportByOrder = (orderId: number) => {
    const transport = ref<Transport | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchTransport = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await transportService.getTransportByOrder(orderId)
        
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          transport.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchTransport()
    })
    
    return { transport, loading, error, refresh: fetchTransport }
  }
  
  /**
   * Création d'un transport
   */
  const createTransport = async (data: TransportCreate) => {
    try {
      const response = await transportService.createTransport(data)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la création du transport:', error)
      return null
    }
  }
  
  /**
   * Mise à jour d'un transport
   */
  const updateTransport = async (transportId: number, data: TransportUpdate) => {
    try {
      const response = await transportService.updateTransport(transportId, data)
      return response.error ? false : true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du transport:', error)
      return false
    }
  }
  
  return {
    useFetchTransport,
    useFetchTransportByOrder,
    createTransport,
    updateTransport
  }
}