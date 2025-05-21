import { ref, computed, onMounted } from 'vue'
import { useMovingService, type Moving, type MovingCreate, type MovingUpdate } from '~/services/moving'

export const useMoving = () => {
  const movingService = useMovingService()
  
  /**
   * Hook pour récupérer un service de déménagement par ID
   */
  const useFetchMoving = (movingId: number) => {
    const moving = ref<Moving | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchMoving = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await movingService.getMovingById(movingId)
        
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          moving.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchMoving()
    })
    
    return { moving, loading, error, refresh: fetchMoving }
  }
  
  /**
   * Hook pour récupérer un service de déménagement associé à une commande
   */
  const useFetchMovingByOrder = (orderId: number) => {
    const moving = ref<Moving | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchMoving = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await movingService.getMovingByOrder(orderId)
        
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          moving.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchMoving()
    })
    
    return { moving, loading, error, refresh: fetchMoving }
  }
  
  /**
   * Création d'un service de déménagement
   */
  const createMoving = async (data: MovingCreate) => {
    try {
      const response = await movingService.createMoving(data)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la création du service de déménagement:', error)
      return null
    }
  }
  
  /**
   * Mise à jour d'un service de déménagement
   */
  const updateMoving = async (movingId: number, data: MovingUpdate) => {
    try {
      const response = await movingService.updateMoving(movingId, data)
      return response.error ? false : true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service de déménagement:', error)
      return false
    }
  }
  
  /**
   * Formater la taille du camion pour l'affichage
   */
  const formatTruckSize = (size: string) => {
    const truckSizes = {
      'petit': 'Petit (jusqu\'à 12m³)',
      'moyen': 'Moyen (jusqu\'à 20m³)',
      'grand': 'Grand (jusqu\'à 30m³)'
    }
    
    return truckSizes[size as keyof typeof truckSizes] || size
  }
  
  return {
    useFetchMoving,
    useFetchMovingByOrder,
    createMoving,
    updateMoving,
    formatTruckSize
  }
}