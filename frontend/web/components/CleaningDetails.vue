<template>
  <div class="p-4 rounded-lg bg-card">
    <h3 class="mb-3 text-lg font-semibold">Détails du service de nettoyage</h3>
    
    <div v-if="loading" class="flex justify-center py-4">
      <LucideLoader class="w-6 h-6 animate-spin text-primary" />
    </div>
    
    <div v-else-if="error" class="p-3 mb-3 rounded-md bg-destructive/10 text-destructive">
      {{ error }}
    </div>
    
    <div v-else-if="cleaning" class="space-y-3">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <span class="text-sm font-medium text-muted-foreground">Type de lieu</span>
          <p>{{ formatLocationType(cleaning.location_type) }}</p>
        </div>
        
        <div>
          <span class="text-sm font-medium text-muted-foreground">Durée</span>
          <p>{{ formatDuration(cleaning.cleaning_duration) }}</p>
        </div>
        
        <div>
          <span class="text-sm font-medium text-muted-foreground">Statut</span>
          <p :class="getStatusColor(cleaning.status)">{{ formatStatus(cleaning.status) }}</p>
        </div>
        
        <div>
          <span class="text-sm font-medium text-muted-foreground">Date</span>
          <p>{{ formatDate(cleaning.created_at) }}</p>
        </div>
      </div>
      
      <div v-if="showContactButton && ['préparation', 'en cours'].includes(cleaning.status)" class="pt-3 mt-3 border-t border-muted">
        <Button class="w-full sm:w-auto" @click="contactCleaner">
          <LucidePhone class="w-4 h-4 mr-2" />
          Contacter le prestataire
        </Button>
      </div>
    </div>
    
    <div v-else class="py-3 text-center text-muted-foreground">
      Aucune information de nettoyage disponible
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { LucideLoader, LucidePhone } from 'lucide-vue-next'

const props = defineProps({
  cleaning: {
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

// Formatter le type de lieu
const formatLocationType = (type) => {
  const locationTypes = {
    'maison': 'Maison',
    'bureau': 'Bureau',
    'véhicule': 'Véhicule'
  }
  
  return locationTypes[type] || type
}

// Formatter la durée
const formatDuration = (duration) => {
  return `${duration} heure${duration > 1 ? 's' : ''}`
}

// Formatter le statut
const formatStatus = (status) => {
  const statusMap = {
    'préparation': 'En préparation',
    'en cours': 'En cours',
    'terminé': 'Terminé',
    'annulé': 'Annulé'
  }
  
  return statusMap[status] || status
}

// Formater la date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', 
    month: 'long',
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(date)
}

// Obtenir la couleur du statut
const getStatusColor = (status) => {
  const colorMap = {
    'préparation': 'text-yellow-600',
    'en cours': 'text-blue-600',
    'terminé': 'text-green-600',
    'annulé': 'text-red-600'
  }
  
  return colorMap[status] || ''
}

// Contacter le prestataire
const contactCleaner = () => {
  emit('contact', props.cleaning)
}
</script>