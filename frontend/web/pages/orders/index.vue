<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Mes commandes</h1>
      <NuxtLink to="/services">
        <Button>
          <LucidePlus class="w-4 h-4 mr-2" />
          Nouvelle commande
        </Button>
      </NuxtLink>
    </div>
    
    <!-- Message d'erreur -->
    <div v-if="error" class="p-4 mb-6 rounded-md bg-destructive/10 text-destructive">
      {{ error }}
    </div>
    
    <!-- Filtres et recherche -->
    <div class="flex flex-col gap-4 mb-6 md:flex-row">
      <div class="relative flex-grow">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <LucideSearch class="w-4 h-4 text-muted-foreground" />
        </div>
        <Input 
          v-model="searchTerm"
          placeholder="Rechercher une commande..."
          class="pl-10"
        />
      </div>
      
      <div class="flex gap-3">
        <Select v-model="statusFilter" class="w-40">
          <option value="all">Tous les statuts</option>
          <option value="en cours">En cours</option>
          <option value="terminé">Terminé</option>
          <option value="annulé">Annulé</option>
        </Select>
        
        <Select v-model="serviceFilter" class="w-48">
          <option value="all">Tous les services</option>
          <option value="transport">Transport</option>
          <option value="nettoyage">Nettoyage</option>
          <option value="déménagement">Déménagement</option>
          <option value="dépannage">Dépannage</option>
          <option value="garde enfant">Garde d'enfants</option>
        </Select>
        
        <Select v-model="sortOrder" class="w-48">
          <option value="newest">Plus récents d'abord</option>
          <option value="oldest">Plus anciens d'abord</option>
        </Select>
      </div>
    </div>
    
    <!-- Chargement -->
    <div v-if="loading" class="flex items-center justify-center py-10">
      <LucideLoader class="w-8 h-8 animate-spin text-primary" />
    </div>
    
    <!-- Liste des commandes -->
    <div v-else-if="filteredOrders.length" class="overflow-hidden rounded-lg shadow-sm bg-card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-muted">
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Référence</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Service</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Date</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Statut</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-muted">
            <tr v-for="order in displayedOrders" :key="order.id" class="hover:bg-muted/50">
              <td class="px-4 py-4 whitespace-nowrap">
                <p class="text-sm font-medium">{{ order.id }}</p>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-secondary">
                    <component :is="getServiceIconComponent(order.service_type)" class="w-4 h-4" />
                  </div>
                  <p class="text-sm">{{ formatServiceType(order.service_type) }}</p>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <p class="text-sm">{{ formatDate(order.created_at) }}</p>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                      :class="getStatusClass(order.status)">
                  {{ capitalizeStatus(order.status) }}
                </span>
              </td>
              <td class="px-4 py-4 text-right whitespace-nowrap">
                <div class="flex justify-end space-x-2">
                  <NuxtLink :to="`/orders/${order.id}`">
                    <Button variant="ghost" size="sm">
                      <LucideEye class="w-4 h-4" />
                    </Button>
                  </NuxtLink>
                  <Button v-if="order.status === 'en cours'" variant="ghost" size="sm">
                    <LucideMessageSquare class="w-4 h-4" />
                  </Button>
                  <Button 
                    v-if="canCancel(order)" 
                    variant="ghost" 
                    size="sm"
                    @click="confirmCancelOrder(order)"
                  >
                    <LucideXCircle class="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-muted">
        <div class="flex justify-between flex-1 sm:hidden">
          <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="currentPage--">Précédent</Button>
          <Button variant="outline" size="sm" :disabled="currentPage === totalPages" @click="currentPage++">Suivant</Button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-muted-foreground">
              Affichage de <span class="font-medium">{{ paginationStart }}</span> à <span class="font-medium">{{ paginationEnd }}</span> sur <span class="font-medium">{{ totalOrders }}</span> commandes
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <Button 
                variant="outline" 
                size="sm" 
                class="rounded-l-md"
                :disabled="currentPage === 1" 
                @click="currentPage--"
              >
                <span class="sr-only">Précédent</span>
                <LucideChevronLeft class="w-4 h-4" />
              </Button>
              
              <Button 
                v-for="page in displayedPages" 
                :key="page" 
                variant="outline" 
                size="sm"
                :class="{ 'bg-primary text-primary-foreground': page === currentPage }"
                @click="currentPage = page"
              >
                {{ page }}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                class="rounded-r-md"
                :disabled="currentPage === totalPages" 
                @click="currentPage++"
              >
                <span class="sr-only">Suivant</span>
                <LucideChevronRight class="w-4 h-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pas de commandes -->
    <div v-else-if="!loading" class="p-10 text-center rounded-lg shadow-sm bg-card">
      <LucidePackageX class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 class="mb-2 text-lg font-medium">Aucune commande trouvée</h3>
      <p class="mb-6 text-muted-foreground">
        {{ 
          searchTerm || statusFilter !== 'all' || serviceFilter !== 'all' 
            ? 'Aucune commande ne correspond à vos critères de recherche' 
            : 'Vous n\'avez pas encore passé de commande'
        }}
      </p>
      <NuxtLink to="/services">
        <Button>
          <LucidePlus class="w-4 h-4 mr-2" />
          Commander un service
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useOrder } from '~/composables/order'
import { useToast } from '@/components/ui/toast/use-toast'
import { useAuthStore } from '~/stores/auth'
import { 
  LucideSearch, 
  LucidePlus, 
  LucideEye, 
  LucideMessageSquare, 
  LucideXCircle,
  LucideChevronLeft,
  LucideChevronRight,
  LucideTruck,
  LucideSprayCan,
  LucideBox,
  LucideWrench,
  LucideUsers,
  LucidePackage,
  LucidePackageX,
  LucideLoader
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// Récupération des commandes
const { useFetchUserOrders, cancelOrder } = useOrder()
const { orders, loading, error, refresh } = useFetchUserOrders()

// Toast pour les notifications
const { toast } = useToast()

// Vérification de l'authentification
onMounted(() => {
  if (!authStore.isAuthenticated) {
    toast({
      title: "Authentification requise",
      description: "Vous devez être connecté pour accéder à vos commandes",
      variant: "destructive",
    })
    router.push('/auth?redirect=/orders')
    return
  }
  
  // Assurons-nous de rafraîchir les commandes
  refresh()
})

// États pour les filtres
const searchTerm = ref('')
const statusFilter = ref('all')
const serviceFilter = ref('all')
const sortOrder = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 10

// État pour la modal d'annulation
const cancelModal = ref({
  show: false,
  loading: false,
  order: null
})

// Filtrer les commandes
const filteredOrders = computed(() => {
  if (!orders.value) return []
  
  return orders.value.filter(order => {
    // Filtre de recherche (sur l'ID)
    const searchMatch = searchTerm.value === '' || 
      order.id.toString().includes(searchTerm.value)
    
    // Filtre de statut
    const statusMatch = statusFilter.value === 'all' || 
      order.status === statusFilter.value
    
    // Filtre de service
    const serviceMatch = serviceFilter.value === 'all' || 
      order.service_type === serviceFilter.value
    
    return searchMatch && statusMatch && serviceMatch
  }).sort((a, b) => {
    // Tri par date
    if (sortOrder.value === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
  })
})

// Pagination
const totalOrders = computed(() => filteredOrders.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalOrders.value / itemsPerPage)))

const displayedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredOrders.value.slice(start, end)
})

const paginationStart = computed(() => {
  return totalOrders.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, totalOrders.value)
})

const displayedPages = computed(() => {
  if (totalPages.value <= 5) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1)
  }
  
  // Afficher 5 pages autour de la page actuelle
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// Reset page when filters change
watch([searchTerm, statusFilter, serviceFilter, sortOrder], () => {
  currentPage.value = 1
})

// Formatter le type de service
const formatServiceType = (type) => {
  const serviceTypes = {
    'transport': 'Transport et Livraison',
    'nettoyage': 'Nettoyage Véhicule',
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
    month: 'short',
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(date)
}

// Obtenir l'icône en fonction du type de service
const getServiceIconComponent = (serviceType) => {
  const iconMap = {
    'transport': LucideTruck,
    'nettoyage': LucideSprayCan,
    'déménagement': LucideBox,
    'dépannage': LucideWrench,
    'garde enfant': LucideUsers
  }
  
  return iconMap[serviceType] || LucidePackage
}

// Mettre la première lettre en majuscule
const capitalizeStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Obtenir la classe CSS en fonction du statut
const getStatusClass = (status) => {
  const statusMap = {
    'en cours': 'bg-blue-500/10 text-blue-500',
    'terminé': 'bg-green-500/10 text-green-500',
    'annulé': 'bg-red-500/10 text-red-500'
  }
  
  return statusMap[status] || 'bg-gray-500/10 text-gray-500'
}

// Vérifier si une commande peut être annulée
const canCancel = (order) => {
  return order.status === 'en cours'
}

// Ouvrir la modal de confirmation d'annulation
const confirmCancelOrder = (order) => {
  cancelModal.value = {
    show: true,
    loading: false,
    order: order
  }
}

// Procéder à l'annulation de la commande
const processCancelOrder = async () => {
  if (!cancelModal.value.order) return
  
  cancelModal.value.loading = true
  
  try {
    const success = await cancelOrder(cancelModal.value.order.id)
    
    if (success) {
      toast({
        title: "Commande annulée",
        description: "Votre commande a été annulée avec succès",
      })
      cancelModal.value.show = false
      // Rafraîchir la liste des commandes
      refresh()
    } else {
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
      description: "Erreur lors de l'annulation de la commande",
      variant: "destructive",
    })
  } finally {
    cancelModal.value.loading = false
  }
}
</script>