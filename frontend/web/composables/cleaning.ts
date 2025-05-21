import { ref, computed, onMounted } from 'vue'
import { useCleaningService, type Cleaning, type CleaningCreate, type CleaningUpdate } from '~/services/cleaning'

export const useCleaning = () => {
  const cleaningService = useCleaningService()
  
  /**
   * Hook pour récupérer un service de nettoyage par ID
   */
  const useFetchCleaning = (cleaningId: number) => {
    const cleaning = ref<Cleaning | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchCleaning = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await cleaningService.getCleaningById(cleaningId)
        
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          cleaning.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchCleaning()
    })
    
    return { cleaning, loading, error, refresh: fetchCleaning }
  }
  
  /**
   * Hook pour récupérer un service de nettoyage associé à une commande
   */
  const useFetchCleaningByOrder = (orderId: number) => {
    const cleaning = ref<Cleaning | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchCleaning = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await cleaningService.getCleaningByOrder(orderId)
        
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          cleaning.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchCleaning()
    })
    
    return { cleaning, loading, error, refresh: fetchCleaning }
  }
  
  /**
   * Création d'un service de nettoyage
   */
  const createCleaning = async (data: CleaningCreate) => {
    try {
      const response = await cleaningService.createCleaning(data)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la création du service de nettoyage:', error)
      return null
    }
  }
  
  /**
   * Mise à jour d'un service de nettoyage
   */
  const updateCleaning = async (cleaningId: number, data: CleaningUpdate) => {
    try {
      const response = await cleaningService.updateCleaning(cleaningId, data)
      return response.error ? false : true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service de nettoyage:', error)
      return false
    }
  }
  
  /**
   * Formater le type de lieu pour l'affichage
   */
  const formatLocationType = (type: string) => {
    const locationTypes = {
      'maison': 'Maison',
      'bureau': 'Bureau',
      'véhicule': 'Véhicule'
    }
    
    return locationTypes[type as keyof typeof locationTypes] || type
  }
  
  return {
    useFetchCleaning,
    useFetchCleaningByOrder,
    createCleaning,
    updateCleaning,
    formatLocationType
  }
}