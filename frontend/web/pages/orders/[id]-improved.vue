<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold">Suivi de commande #{{ $route.params.id }}</h1>
      <NuxtLink to="/orders">
        <Button variant="outline" size="sm">Retour</Button>
      </NuxtLink>
    </div>
    
    <!-- Message d'erreur -->
    <div v-if="error" class="p-4 mb-6 rounded-md bg-destructive/10 text-destructive">
      {{ error }}
    </div>
    
    <!-- Chargement -->
    <div v-if="loading" class="flex items-center justify-center py-10">
      <LucideLoader class="w-8 h-8 animate-spin text-primary" />
    </div>
    
    <!-- Contenu de la commande -->
    <div v-else-if="order" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Map de suivi (placeholder) -->
      <div class="lg:col-span-2 bg-muted rounded-lg p-4 h-[500px] flex items-center justify-center">
        <div class="text-center">
          <p class="mb-2 text-muted-foreground">Carte de suivi en temps réel</p>
          <p class="text-sm text-muted-foreground">
            Intégration avec Azure Maps pour le suivi du prestataire (simulée)
          </p>
          <!-- Coordonnées de la commande -->
          <div class="inline-block p-3 mt-4 rounded-md bg-card">
            <p class="text-sm"><strong>Latitude:</strong> {{ order.latitude }}</p>
            <p class="text-sm"><strong>Longitude:</strong> {{ order.longitude }}</p>
          </div>
        </div>
      </div>
      
      <!-- Informations de commande -->
      <div class="p-6 rounded-lg shadow-sm bg-card">
        <h2 class="mb-4 text-xl font-bold">Détails de la commande</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Statut</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="w-3 h-3 rounded-full" :class="getStatusColorClass(order.status)"></span>
              <p class="font-medium">{{ capitalizeStatus(order.status) }}</p>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Service</h3>
            <p class="mt-1">{{ formatServiceType(order.service_type) }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Date de commande</h3>
            <p class="mt-1">{{ formatDate(order.created_at) }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Adresse</h3>
            <p class="mt-1">{{ formatAddress(order.latitude, order.longitude) }}</p>
          </div>
        </div>
        
        <div class="mt-6 space-y-3">
          <Button class="w-full" @click="contactProvider">Contacter le prestataire</Button>
          <Button 
            v-if="canCancel(order)" 
            variant="outline" 
            class="w-full" 
            @click="confirmCancelOrder"
          >
            Annuler la commande
          </Button>
        </div>
      </div>
      
      <!-- Détails spécifiques du service -->
      <div v-if="order" class="lg:col-span-3">
        <ServiceDetails 
          :order="order"
          @contact="contactServiceProvider"
        />
      </div>
    </div>
    
    <!-- Commande non trouvée -->
    <div v-else-if="!loading && !error" class="p-10 text-center rounded-lg shadow-sm bg-card">
      <LucidePackageX class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 class="mb-2 text-lg font-medium">Commande non trouvée</h3>
      <p class="mb-6 text-muted-foreground">
        La commande que vous recherchez n'existe pas ou a été supprimée.
      </p>
      <NuxtLink to="/orders">
        <Button>
          Voir mes commandes
        </Button>
      </NuxtLink>
    </div>
    
    <!-- Modal de confirmation d'annulation -->
    <div v-if="cancelModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div class="w-full max-w-md p-6 rounded-lg shadow-lg bg-card">
        <h2 class="mb-4 text-xl font-semibold">Annuler la commande</h2>
        <p class="mb-4">Êtes-vous sûr de vouloir annuler cette commande ? Cette action ne peut pas être annulée.</p>
        
        <div class="flex justify-end space-x-3">
          <Button variant="outline" @click="cancelModal.show = false">
            Non, garder ma commande
          </Button>
          <Button 
            variant="destructive" 
            :disabled="cancelModal.loading"
            @click="processCancelOrder"
          >
            <LucideLoader v-if="cancelModal.loading" class="w-4 h-4 mr-2 animate-spin" />
            Oui, annuler la commande
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Modal pour contacter le prestataire -->
    <div v-if="contactModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div class="w-full max-w-md p-6 rounded-lg shadow-lg bg-card">
        <h2 class="mb-4 text-xl font-semibold">Contacter le prestataire</h2>
        <p class="mb-4">Cette fonctionnalité sera bientôt disponible. En attendant, vous pouvez contacter notre service client.</p>
        
        <div class="flex justify-end">
          <Button @click="contactModal.show = false">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useOrder } from '~/composables/order'
import { useToast } from '@/components/ui/toast/use-toast'
import { useAuthStore } from '~/stores/auth'
import ServiceDetails from '~/components/ServiceDetails.vue'
import { 
  LucideLoader,
  LucidePackageX
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const orderId = parseInt(route.params.id)
const { toast } = useToast()
const authStore = useAuthStore()

// Vérification de l'authentification
onMounted(() => {
  if (!authStore.isAuthenticated) {
    toast({
      title: "Authentification requise",
      description: "Vous devez être connecté pour accéder à cette commande",
      variant: "destructive",
    })
    router.push('/auth?redirect=' + route.fullPath)
    return
  }
  
  // Force le rafraîchissement des données
  refresh()
})

// Récupération de la commande
const { useFetchOrder, cancelOrder } = useOrder()
const { order, loading, error, refresh } = useFetchOrder(orderId)

// États pour les modals
const cancelModal = ref({
  show: false,
  loading: false
})

const contactModal = ref({
  show: false
})

// Formatter le type de service
const formatServiceType = (type) => {
  const serviceTypes = {
    'transport': 'Transport et Livraison',
    'nettoyage': 'Nettoyage',
    'déménagement': 'Déménagement',
    'dépannage': 'Dépannage Auto',
    'garde enfant': 'Garde d\'Enfants'
  }
  
  return serviceTypes[type] || type
}

// Formatter les dates
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

// Formater une adresse à partir des coordonnées (simulé)
const formatAddress = (lat, lng) => {
  // Dans un cas réel, on utiliserait un service de géocodage inverse
  // pour obtenir l'adresse à partir des coordonnées
  return `Adresse basée sur les coordonnées (${lat}, ${lng})`
}

// Mettre la première lettre en majuscule
const capitalizeStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Obtenir la classe de couleur en fonction du statut
const getStatusColorClass = (status) => {
  const statusMap = {
    'en cours': 'bg-blue-500',
    'terminé': 'bg-green-500',
    'annulé': 'bg-red-500'
  }
  
  return statusMap[status] || 'bg-gray-500'
}

// Vérifier si une commande peut être annulée
const canCancel = (order) => {
  return order && order.status === 'en cours'
}

// Ouvrir la modal de confirmation d'annulation
const confirmCancelOrder = () => {
  cancelModal.value = {
    show: true,
    loading: false
  }
}

// Procéder à l'annulation de la commande
const processCancelOrder = async () => {
  if (!order.value) return
  
  cancelModal.value.loading = true
  
  try {
    const success = await cancelOrder(order.value.id)
    
    if (success) {
      // Fermer la modal
      cancelModal.value.show = false
      // Rafraîchir les données de la commande
      refresh()
      // Notification de succès
      toast({
        title: "Commande annulée",
        description: "Votre commande a été annulée avec succès",
      })
    } else {
      // Notification d'erreur
      toast({
        title: "Erreur",
        description: "Erreur lors de l'annulation de la commande",
        variant: "destructive",
      })
    }
  } catch (err) {
    console.error('Erreur lors de l\'annulation de la commande', err)
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de l'annulation de la commande",
      variant: "destructive",
    })
  } finally {
    cancelModal.value.loading = false
  }
}

// Ouvrir la modal pour contacter le prestataire
const contactProvider = () => {
  contactModal.value.show = true
}

// Contacter le prestataire du service spécifique
const contactServiceProvider = (service) => {
  console.log('Contacter le prestataire du service:', service)
  contactModal.value.show = true
}
</script>