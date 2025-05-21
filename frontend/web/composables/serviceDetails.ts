import { ref, onMounted } from 'vue'
import { useTransportService, type Transport } from '~/services/transport'
import { useCleaningService, type Cleaning } from '~/services/cleaning'
import { useMovingService, type Moving } from '~/services/moving'
import { useRepairService, type Repair } from '~/services/repair'
import { useChildAssistanceService, type ChildAssistance } from '~/services/childAssistance'

// Create a union type for all possible service types
type ServiceDetails = Transport | Cleaning | Moving | Repair | ChildAssistance | null

/**
 * Composable for managing service details associated with an order
 */
export const useServiceDetails = (orderId: number, serviceType: string) => {
  // Common states
  const serviceDetails = ref<ServiceDetails>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Fetch the appropriate service based on the type
  const fetchServiceDetails = async () => {
    loading.value = true
    error.value = null
    
    try {
      let response = null
      
      switch (serviceType) {
        case 'transport':
          const transportService = useTransportService()
          response = await transportService.getTransportByOrder(orderId)
          break
          
        case 'nettoyage':
          const cleaningService = useCleaningService()
          response = await cleaningService.getCleaningByOrder(orderId)
          break
          
        case 'déménagement':
          const movingService = useMovingService()
          response = await movingService.getMovingByOrder(orderId)
          break
          
        case 'dépannage':
          const repairService = useRepairService()
          response = await repairService.getRepairByOrder(orderId)
          break
          
        case 'garde enfant':
          const childAssistanceService = useChildAssistanceService()
          response = await childAssistanceService.getChildAssistanceByOrder(orderId)
          break
          
        default:
          error.value = `Type de service non pris en charge: ${serviceType}`
          return
      }
      
      if (response && response.data) {
        serviceDetails.value = response.data
      } else if (response && response.error) {
        error.value = response.error
      } else {
        error.value = `Aucun détail de service trouvé pour cette commande`
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des détails'
    } finally {
      loading.value = false
    }
  }
  
  // Format service type for display
  const formatServiceType = (type: string) => {
    const serviceTypes = {
      'transport': 'Transport et Livraison',
      'nettoyage': 'Nettoyage',
      'déménagement': 'Déménagement',
      'dépannage': 'Dépannage Auto',
      'garde enfant': 'Garde d\'Enfants'
    }
    
    return serviceTypes[type as keyof typeof serviceTypes] || type
  }
  
  // Get the appropriate component to display service details
  const getServiceComponent = () => {
    switch (serviceType) {
      case 'transport':
        return 'TransportDetails'
      case 'nettoyage':
        return 'CleaningDetails'
      case 'déménagement':
        return 'MovingDetails'
      case 'dépannage':
        return 'RepairDetails'
      case 'garde enfant':
        return 'ChildAssistanceDetails'
      default:
        return null
    }
  }
  
  // Execute the request when the component loads
  onMounted(() => {
    fetchServiceDetails()
  })
  
  return {
    serviceDetails,
    loading,
    error,
    formatServiceType,
    getServiceComponent,
    refresh: fetchServiceDetails
  }
}