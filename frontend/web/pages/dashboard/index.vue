<template>
  <div class="container px-4 py-6 mx-auto">
    <h1 class="mb-6 text-2xl font-bold">Tableau de bord</h1>
    
    <!-- Cartes statistiques -->
    <div class="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
      <div class="p-5 rounded-lg shadow-sm bg-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Commandes en cours</p>
            <h3 class="mt-1 text-2xl font-bold">{{ stats.activeOrders }}</h3>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <LucidePackage class="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
      <div class="p-5 rounded-lg shadow-sm bg-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Commandes terminées</p>
            <h3 class="mt-1 text-2xl font-bold">{{ stats.completedOrders }}</h3>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
            <LucideCheckCircle class="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>
      <div class="p-5 rounded-lg shadow-sm bg-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total dépensé</p>
            <h3 class="mt-1 text-2xl font-bold">{{ formatPrice(stats.totalSpent) }}</h3>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
            <LucideCreditCard class="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>
      <div class="p-5 rounded-lg shadow-sm bg-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Note moyenne</p>
            <h3 class="mt-1 text-2xl font-bold">{{ stats.averageRating }}/5</h3>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10">
            <LucideStar class="w-5 h-5 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Commandes récentes et actions rapides -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Commandes récentes -->
      <div class="lg:col-span-2">
        <div class="p-5 rounded-lg shadow-sm bg-card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Commandes récentes</h2>
            <NuxtLink to="/orders" class="text-sm text-primary hover:underline">Voir toutes</NuxtLink>
          </div>
          <div class="space-y-3">
            <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between p-3 rounded-md bg-muted">
              <div>
                <div class="flex items-center gap-3">
                  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
                    <component :is="getServiceIconComponent(order.serviceType)" class="w-4 h-4" />
                  </div>
                  <div>
                    <h4 class="text-sm font-medium">{{ order.serviceType }}</h4>
                    <p class="text-xs text-muted-foreground">{{ formatDate(order.date) }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center px-2 py-1 text-xs rounded-full" 
                      :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
                <NuxtLink :to="`/orders/${order.id}`">
                  <Button variant="ghost" size="sm">
                    <LucideArrowRight class="w-4 h-4" />
                  </Button>
                </NuxtLink>
              </div>
            </div>
            
            <div v-if="recentOrders.length === 0" class="py-6 text-center">
              <p class="text-muted-foreground">Aucune commande récente</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions rapides -->
      <div>
        <div class="p-5 rounded-lg shadow-sm bg-card">
          <h2 class="mb-4 text-lg font-bold">Actions rapides</h2>
          <div class="space-y-3">
            <NuxtLink to="/services">
              <Button class="justify-start w-full" variant="outline">
                <LucidePlusCircle class="w-4 h-4 mr-2" />
                Nouvelle commande
              </Button>
            </NuxtLink>
            <NuxtLink to="/profile">
              <Button class="justify-start w-full" variant="outline">
                <LucideUser class="w-4 h-4 mr-2" />
                Modifier profil
              </Button>
            </NuxtLink>
            <NuxtLink to="/payments">
              <Button class="justify-start w-full" variant="outline">
                <LucideCreditCard class="w-4 h-4 mr-2" />
                Gérer paiements
              </Button>
            </NuxtLink>
            <NuxtLink to="/support">
              <Button class="justify-start w-full" variant="outline">
                <LucideHelpCircle class="w-4 h-4 mr-2" />
                Besoin d'aide
              </Button>
            </NuxtLink>
          </div>
        </div>
        
        <!-- Promo ou message d'information -->
        <div class="p-5 mt-4 rounded-lg shadow-sm bg-primary text-primary-foreground">
          <h3 class="mb-2 font-semibold">Offre spéciale !</h3>
          <p class="mb-3 text-sm">Bénéficiez de -20% sur votre prochaine commande de transport avec le code QUICK20.</p>
          <Button variant="secondary" size="sm">Copier le code</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast/use-toast'
import { useAuthStore } from '~/stores/auth'
import { 
  LucidePackage,
  LucideCheckCircle,
  LucideCreditCard,
  LucideStar,
  LucideArrowRight,
  LucidePlusCircle,
  LucideUser,
  LucideHelpCircle,
  LucideTruck,
  LucideSprayCan,
  LucideBox,
  LucideWrench,
  LucideUsers
} from 'lucide-vue-next'

const router = useRouter()
const { toast } = useToast()
const authStore = useAuthStore()

// Vérification de l'authentification et redirection selon le rôle
onMounted(() => {
  if (!authStore.isAuthenticated) {
    toast({
      title: "Authentification requise",
      description: "Vous devez être connecté pour accéder au tableau de bord",
      variant: "destructive",
    })
    router.push('/auth?redirect=/dashboard')
    return
  }
  
  // Rediriger les prestataires vers leur dashboard spécifique
  if (authStore.isProvider) {
    router.push('/dashboard/provider')
    return
  }
  
  // Vérifier que c'est bien un client
  if (!authStore.isClient) {
    toast({
      title: "Accès refusé",
      description: "Ce tableau de bord est réservé aux clients",
      variant: "destructive",
    })
    router.push('/')
    return
  }
})

// Données simulées de statistiques
const stats = ref({
  activeOrders: 2,
  completedOrders: 15,
  totalSpent: 384.50,
  averageRating: 4.8
})

// Données simulées de commandes récentes
const recentOrders = ref([
  { 
    id: 'QS-7890', 
    serviceType: 'Transport et Livraison', 
    date: '2024-03-19T15:30:00', 
    status: 'En cours' 
  },
  { 
    id: 'QS-7889', 
    serviceType: 'Nettoyage Véhicule', 
    date: '2024-03-18T10:15:00', 
    status: 'Terminé' 
  },
  { 
    id: 'QS-7885', 
    serviceType: 'Déménagement', 
    date: '2024-03-15T09:00:00', 
    status: 'Terminé' 
  }
])

// Formatage des prix
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

// Formatage des dates
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(date)
}

// Obtenir le composant d'icône en fonction du type de service
const getServiceIconComponent = (serviceType) => {
  const iconMap = {
    'Transport et Livraison': LucideTruck,
    'Nettoyage Véhicule': LucideSprayCan,
    'Déménagement': LucideBox,
    'Dépannage Auto': LucideWrench,
    'Garde d\'Enfants': LucideUsers
  }
  
  return iconMap[serviceType] || LucidePackage
}

// Obtenir la classe CSS en fonction du statut
const getStatusClass = (status) => {
  const statusMap = {
    'En cours': 'bg-blue-500/10 text-blue-500',
    'Terminé': 'bg-green-500/10 text-green-500',
    'Annulé': 'bg-red-500/10 text-red-500',
    'En attente': 'bg-yellow-500/10 text-yellow-500'
  }
  
  return statusMap[status] || 'bg-gray-500/10 text-gray-500'
}
</script>