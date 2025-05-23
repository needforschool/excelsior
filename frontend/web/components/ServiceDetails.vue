<template>
  <div>
    <!-- Détails spécifiques du service selon le type -->
    <div v-if="order">
      <component 
        :is="serviceComponent"
        v-if="serviceComponent && serviceDetailsData"
        v-bind="componentProps"
        :loading="loading"
        :error="error"
        @contact="$emit('contact', $event)"
      />
      
      <div v-else-if="loading" class="flex justify-center p-6">
        <LucideLoader class="w-6 h-6 animate-spin text-primary" />
      </div>
      
      <div v-else-if="error" class="p-4 rounded-md bg-destructive/10 text-destructive">
        {{ error }}
      </div>
      
      <div v-else class="p-6 text-center rounded-lg bg-card">
        <LucideInfo class="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
        <p class="text-muted-foreground">Aucun détail spécifique disponible pour ce service</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { LucideLoader, LucideInfo } from 'lucide-vue-next'
import { useServiceDetails } from '~/composables/serviceDetails'

// Importation dynamique des composants de détail de service
const TransportDetails = defineAsyncComponent(() => import('~/components/TransportDetails.vue'))
const CleaningDetails = defineAsyncComponent(() => import('~/components/CleaningDetails.vue'))
const MovingDetails = defineAsyncComponent(() => import('~/components/MovingDetails.vue'))
const RepairDetails = defineAsyncComponent(() => import('~/components/RepairDetails.vue'))
const ChildAssistanceDetails = defineAsyncComponent(() => import('~/components/ChildAssistanceDetails.vue'))

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['contact'])

// Récupérer les détails du service associé à la commande
const { 
  serviceDetails, 
  loading, 
  error, 
  getServiceComponent 
} = useServiceDetails(props.order.id, props.order.service_type)

// Déterminer quel composant afficher
const serviceComponent = computed(() => {
  if (!serviceDetails.value) return null
  
  const componentName = getServiceComponent()
  
  switch (componentName) {
    case 'TransportDetails':
      return TransportDetails
    case 'CleaningDetails':
      return CleaningDetails
    case 'MovingDetails':
      return MovingDetails
    case 'RepairDetails':
      return RepairDetails
    case 'ChildAssistanceDetails':
      return ChildAssistanceDetails
    default:
      return null
  }
})

// Préparer les données pour le composant dynamique
const serviceDetailsData = computed(() => {
  return serviceDetails.value
})

// Préparer les props pour le composant dynamique
const componentProps = computed(() => {
  if (!serviceDetailsData.value) return {}
  
  // Déterminer les props à passer en fonction du type de service
  switch (props.order.service_type) {
    case 'transport':
      return { transport: serviceDetailsData.value }
    case 'nettoyage':
      return { cleaning: serviceDetailsData.value }
    case 'déménagement':
      return { moving: serviceDetailsData.value }
    case 'dépannage':
      return { repair: serviceDetailsData.value }
    case 'garde enfant':
      return { childAssistance: serviceDetailsData.value }
    default:
      return {}
  }
})
</script>