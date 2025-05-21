<template>
  <div class="p-4 rounded-lg bg-card">
    <h3 class="mb-3 text-lg font-semibold">Détails de la garde d'enfants</h3>
    
    <div v-if="loading" class="flex justify-center py-4">
      <LucideLoader class="w-6 h-6 animate-spin text-primary" />
    </div>
    
    <div v-else-if="error" class="p-3 mb-3 rounded-md bg-destructive/10 text-destructive">
      {{ error }}
    </div>
    
    <div v-else-if="childAssistance" class="space-y-3">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <span class="text-sm font-medium text-muted-foreground">Nom du gardien</span>
          <p>{{ childAssistance.guardian_name }}</p>
        </div>
        
        <div>
          <span class="text-sm font-medium text-muted-foreground">Nombre d'enfants</span>
          <p>{{ childAssistance.child_count }} enfant{{ childAssistance.child_count > 1 ? 's' : '' }}</p>
        </div>
        
        <div>
          <span class="text-sm font-medium text-muted-foreground">Destination</span>
          <p>{{ childAssistance.destination }}</p>
        </div>
        
        <div>
          <span class="text-sm font-medium text-muted-foreground">Statut</span>
          <p :class="getStatusColor(childAssistance.status)">{{ formatStatus(childAssistance.status) }}</p>
        </div>
        
        <div>
          <span class="text-sm font-medium text-muted-foreground">Date</span>
          <p>{{ formatDate(childAssistance.created_at) }}</p>
        </div>
      </div>
      
      <div v-if="showContactButton && childAssistance.status === 'en cours'" class="pt-3 mt-3 border-t border-muted">
        <Button class="w-full sm:w-auto" @click="contactGuardian">
          <LucidePhone class="w-4 h-4 mr-2" />
          Contacter le gardien
        </Button>
      </div>
    </div>
    
    <div v-else class="py-3 text-center text-muted-foreground">
      Aucune information de garde d'enfants disponible
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { LucideLoader, LucidePhone } from 'lucide-vue-next'

const props = defineProps({
  childAssistance: {
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

// Formatter le statut
const formatStatus = (status) => {
  const statusMap = {
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
    'en cours': 'text-blue-600',
    'terminé': 'text-green-600',
    'annulé': 'text-red-600'
  }
  
  return colorMap[status] || ''
}

// Contacter le gardien
const contactGuardian = () => {
  emit('contact', props.childAssistance)
}
</script>