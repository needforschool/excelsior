import { useOrder } from '~/composables/order'
import { useTransport } from '~/composables/transport'
import { useCleaning } from '~/composables/cleaning'
import { useMoving } from '~/composables/moving'
import { useRepair } from '~/composables/repair'
import { useChildAssistance } from '~/composables/childAssistance'

/**
 * Composable pour gérer les détails de service associés à une commande
 */
export const useServiceDetails = (orderId: number, serviceType: string) => {
  // États communs
  const serviceDetails = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Fetch le service approprié en fonction du type
  const fetchServiceDetails = async () => {
    loading.value = true
    error.value = null
    
    try {
      let response = null
      
      switch (serviceType) {
        case 'transport':
          const { getTransportByOrder } = useTransport()
          response = await getTransportByOrder(orderId)
          break
          
        case 'nettoyage':
          const { getCleaningByOrder } = useCleaning()
          response = await getCleaningByOrder(orderId)
          break
          
        case 'déménagement':
          const { getMovingByOrder } = useMoving()
          response = await getMovingByOrder(orderId)
          break
          
        case 'dépannage':
          const { getRepairByOrder } = useRepair()
          response = await getRepairByOrder(orderId)
          break
          
        case 'garde enfant':
          const { getChildAssistanceByOrder } = useChildAssistance()
          response = await getChildAssistanceByOrder(orderId)
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
  
  // Formater le type de service pour l'affichage
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
  
  // Récupérer le composant approprié pour afficher les détails du service
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
  
  // Exécuter la requête au chargement du composant
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