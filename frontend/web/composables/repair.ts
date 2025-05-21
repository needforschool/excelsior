import { ref, computed, onMounted } from 'vue'
import { useRepairService, type Repair, type RepairCreate, type RepairUpdate } from '~/services/repair'

export const useRepair = () => {
  const repairService = useRepairService()
  
  /**
   * Hook pour récupérer un service de dépannage par ID
   */
  const useFetchRepair = (repairId: number) => {
    const repair = ref<Repair | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchRepair = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await repairService.getRepairById(repairId)
        
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          repair.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchRepair()
    })
    
    return { repair, loading, error, refresh: fetchRepair }
  }
  
  /**
   * Hook pour récupérer un service de dépannage associé à une commande
   */
  const useFetchRepairByOrder = (orderId: number) => {
    const repair = ref<Repair | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchRepair = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await repairService.getRepairByOrder(orderId)
        
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          repair.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchRepair()
    })
    
    return { repair, loading, error, refresh: fetchRepair }
  }
  
  /**
   * Création d'un service de dépannage
   */
  const createRepair = async (data: RepairCreate) => {
    try {
      const response = await repairService.createRepair(data)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la création du service de dépannage:', error)
      return null
    }
  }
  
  /**
   * Mise à jour d'un service de dépannage
   */
  const updateRepair = async (repairId: number, data: RepairUpdate) => {
    try {
      const response = await repairService.updateRepair(repairId, data)
      return response.error ? false : true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service de dépannage:', error)
      return false
    }
  }
  
  /**
   * Formater le type de problème pour l'affichage
   */
  const formatIssueType = (type: string) => {
    const issueTypes = {
      'batterie': 'Problème de batterie',
      'pneu': 'Problème de pneu',
      'moteur': 'Problème de moteur',
      'autre': 'Autre problème'
    }
    
    return issueTypes[type as keyof typeof issueTypes] || type
  }
  
  return {
    useFetchRepair,
    useFetchRepairByOrder,
    createRepair,
    updateRepair,
    formatIssueType
  }
}