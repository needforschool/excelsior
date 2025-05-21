<template>
  <div class="p-4 rounded-lg bg-card">
    <h3 class="mb-3 text-lg font-semibold">Détails du transport</h3>
    
    <div v-if="loading" class="flex justify-center py-4">
      <LucideLoader class="w-6 h-6 animate-spin text-primary" />
    </div>
    
    <div v-else-if="error" class="p-3 mb-3 rounded-md bg-destructive/10 text-destructive">
      {{ error }}
    </div>
    
    <div v-else-if="transport" class="space-y-3">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <span class="text-sm font-medium text-muted-foreground">Type de véhicule</span>
          <p>{{ formatVehicleType(transport.vehicle_type) }}</p>
        </div>
        
        <div>
          <span class="text-sm font-medium text-muted-foreground">Statut</span>
          <p :class="getStatusColor(transport.status)">{{ formatStatus(transport.status) }}</p>
        </div>
        
        <div>
          <span class="text-sm font-medium text-muted-foreground">Conducteur</span>
          <p>{{ transport.driver_name }}</p>
        </div>
        
        <div v-if="transport.driver_contact">
          <span class="text-sm font-medium text-muted-foreground">Contact</span>
          <p>{{ transport.driver_contact }}</p>
        </div>
      </div>
      
      <div v-if="showContactButton && transport.status === 'en route'" class="pt-3 mt-3 border-t border-muted">
        <Button class="w-full sm:w-auto" @click="contactDriver">
          <LucidePhone class="w-4 h-4 mr-2" />
          Contacter le chauffeur
        </Button>
      </div>
    </div>
    
    <div v-else class="py-3 text-center text-muted-foreground">
      Aucune information de transport disponible
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { LucideLoader, LucidePhone } from 'lucide-vue-next'

const props = defineProps({
  transport: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  showContactButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['contact'])

// Formatter le type de véhicule
const formatVehicleType = (type) => {
  const vehicleTypes = {
    'voiture': 'Voiture',
    'camion': 'Camion',
    'moto': 'Moto'
  }
  
  return vehicleTypes[type] || type
}

// Formatter le statut
const formatStatus = (status) => {
  const statusMap = {
    'en route': 'En route',
    'livré': 'Livré',
    'annulé': 'Annulé'
  }
  
  return statusMap[status] || status
}

// Obtenir la couleur du statut
const getStatusColor = (status) => {
  const colorMap = {
    'en route': 'text-blue-600',
    'livré': 'text-green-600',
    'annulé': 'text-red-600'
  }
  
  return colorMap[status] || ''
}

// Contacter le chauffeur
const contactDriver = () => {
  emit('contact', props.transport)
}
</script>