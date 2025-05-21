import { ref, computed, onMounted } from 'vue'
import { useChildAssistanceService, type ChildAssistance, type ChildAssistanceCreate, type ChildAssistanceUpdate } from '~/services/childAssistance'

export const useChildAssistance = () => {
  const childAssistanceService = useChildAssistanceService()
  
  /**
   * Hook pour récupérer un service de garde d'enfant par ID
   */
  const useFetchChildAssistance = (childAssistanceId: number) => {
    const childAssistance = ref<ChildAssistance | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchChildAssistance = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await childAssistanceService.getChildAssistanceById(childAssistanceId)
        
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          childAssistance.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchChildAssistance()
    })
    
    return { childAssistance, loading, error, refresh: fetchChildAssistance }
  }
  
  /**
   * Hook pour récupérer un service de garde d'enfant associé à une commande
   */
  const useFetchChildAssistanceByOrder = (orderId: number) => {
    const childAssistance = ref<ChildAssistance | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchChildAssistance = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await childAssistanceService.getChildAssistanceByOrder(orderId)
        
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          childAssistance.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchChildAssistance()
    })
    
    return { childAssistance, loading, error, refresh: fetchChildAssistance }
  }
  
  /**
   * Création d'un service de garde d'enfant
   */
  const createChildAssistance = async (data: ChildAssistanceCreate) => {
    try {
      const response = await childAssistanceService.createChildAssistance(data)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la création du service de garde d\'enfant:', error)
      return null
    }
  }
  
  /**
   * Mise à jour d'un service de garde d'enfant
   */
  const updateChildAssistance = async (childAssistanceId: number, data: ChildAssistanceUpdate) => {
    try {
      const response = await childAssistanceService.updateChildAssistance(childAssistanceId, data)
      return response.error ? false : true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service de garde d\'enfant:', error)
      return false
    }
  }
  
  return {
    useFetchChildAssistance,
    useFetchChildAssistanceByOrder,
    createChildAssistance,
    updateChildAssistance
  }
}