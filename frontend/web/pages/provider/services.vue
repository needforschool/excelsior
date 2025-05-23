<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Mes services</h1>
      <NuxtLink to="/dashboard/provider">
        <Button variant="outline" size="sm">
          <LucideArrowLeft class="w-4 h-4 mr-2" />
          Retour au dashboard
        </Button>
      </NuxtLink>
    </div>
    
    <!-- Filtres -->
    <div class="flex flex-col gap-4 mb-6 md:flex-row">
      <div class="relative flex-grow">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <LucideSearch class="w-4 h-4 text-muted-foreground" />
        </div>
        <Input 
          v-model="searchTerm"
          placeholder="Rechercher un service..."
          class="pl-10"
        />
      </div>
      
      <div class="flex gap-3">
        <!-- Filtre par statut -->
        <Select v-model="statusFilter">
          <SelectTrigger class="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en attente">En attente</SelectItem>
            <SelectItem value="accepté">Accepté</SelectItem>
            <SelectItem value="en cours">En cours</SelectItem>
            <SelectItem value="terminé">Terminé</SelectItem>
            <SelectItem value="annulé">Annulé</SelectItem>
          </SelectContent>
        </Select>
        
        <!-- Filtre par service -->
        <Select v-model="serviceTypeFilter">
          <SelectTrigger class="w-48">
            <SelectValue placeholder="Type de service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les services</SelectItem>
            <SelectItem value="transport">Transport et Livraison</SelectItem>
            <SelectItem value="nettoyage">Nettoyage Véhicule</SelectItem>
            <SelectItem value="déménagement">Déménagement</SelectItem>
            <SelectItem value="dépannage">Dépannage Auto</SelectItem>
            <SelectItem value="garde enfant">Garde d'Enfants</SelectItem>
          </SelectContent>
        </Select>
        
        <!-- Filtre par ordre de tri -->
        <Select v-model="sortOrder">
          <SelectTrigger class="w-48">
            <SelectValue placeholder="Tri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Plus récents d'abord</SelectItem>
            <SelectItem value="oldest">Plus anciens d'abord</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <!-- Liste des services -->
    <div class="overflow-hidden rounded-lg shadow-sm bg-card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-muted">
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Référence</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Client</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Service</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Date</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Statut</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-muted">
            <tr v-for="service in filteredServices" :key="service.id" class="hover:bg-muted/50">
              <td class="px-4 py-4 whitespace-nowrap">
                <p class="text-sm font-medium">{{ service.id }}</p>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <p class="text-sm">{{ service.clientName }}</p>
                <p class="text-xs text-muted-foreground">{{ service.clientEmail }}</p>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-secondary">
                    <component :is="getServiceIconComponent(service.serviceType)" class="w-4 h-4" />
                  </div>
                  <p class="text-sm">{{ service.serviceType }}</p>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <p class="text-sm">{{ formatDate(service.date) }}</p>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                      :class="getStatusClass(service.status)">
                  {{ capitalizeStatus(service.status) }}
                </span>
              </td>
              <td class="px-4 py-4 text-right whitespace-nowrap">
                <div class="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" @click="viewServiceDetails(service.id)">
                    <LucideEye class="w-4 h-4" />
                  </Button>
                  <Button 
                    v-if="service.status === 'accepté'" 
                    variant="ghost" 
                    size="sm"
                    @click="updateServiceStatus(service.id, 'en cours')"
                  >
                    <LucidePlay class="w-4 h-4" />
                  </Button>
                  <Button 
                    v-if="service.status === 'en cours'" 
                    variant="ghost" 
                    size="sm"
                    @click="updateServiceStatus(service.id, 'terminé')"
                  >
                    <LucideCheckCircle class="w-4 h-4 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <LucideMessageSquare class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pas de services -->
      <div v-if="filteredServices.length === 0" class="p-10 text-center">
        <LucidePackageX class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 class="mb-2 text-lg font-medium">Aucun service trouvé</h3>
        <p class="mb-6 text-muted-foreground">
          {{ 
            searchTerm || statusFilter !== 'all' || serviceTypeFilter !== 'all' 
              ? 'Aucun service ne correspond à vos critères de recherche' 
              : 'Vous n\'avez pas encore de services à afficher'
          }}
        </p>
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
              Affichage de <span class="font-medium">{{ paginationStart }}</span> à <span class="font-medium">{{ paginationEnd }}</span> sur <span class="font-medium">{{ totalServices }}</span> services
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { useAuthStore } from '~/stores/auth'
import { 
  LucideSearch, 
  LucideArrowLeft,
  LucideEye, 
  LucideMessageSquare, 
  LucidePlay,
  LucideCheckCircle,
  LucideChevronLeft,
  LucideChevronRight,
  LucideTruck,
  LucideSprayCan,
  LucideBox,
  LucideWrench,
  LucideUsers,
  LucidePackageX
} from 'lucide-vue-next'

const router = useRouter()
const { toast } = useToast()
const authStore = useAuthStore()

// États pour les filtres
const searchTerm = ref('')
const statusFilter = ref('all')
const serviceTypeFilter = ref('all')
const sortOrder = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 10

// Vérification de l'authentification et du rôle
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isProvider) {
    toast({
      title: "Accès refusé",
      description: "Vous devez être connecté en tant que prestataire pour accéder à cette page",
      variant: "destructive",
    })
    router.push('/auth?redirect=/provider/services')
  }
})

// Données simulées des services (à remplacer par un appel API)
const services = ref([
  {
    id: 'SVC-4567',
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@exemple.fr',
    serviceType: 'Transport et Livraison',
    date: '2024-03-23T10:15:00',
    status: 'en cours',
    details: {
      pickup: '15 Rue des Lilas, Paris',
      dropoff: '27 Avenue Victor Hugo, Paris',
      packageSize: 'Moyen'
    }
  },
  {
    id: 'SVC-4568',
    clientName: 'Sophie Martin',
    clientEmail: 'sophie.martin@exemple.fr',
    serviceType: 'Déménagement',
    date: '2024-03-24T09:00:00',
    status: 'accepté',
    details: {
      from: '12 Rue du Commerce, Paris',
      to: '5 Boulevard Saint-Michel, Paris',
      items: 'Studio (petit volume)'
    }
  },
  {
    id: 'SVC-4566',
    clientName: 'Thomas Bernard',
    clientEmail: 'thomas.bernard@exemple.fr',
    serviceType: 'Nettoyage Véhicule',
    date: '2024-03-22T14:30:00',
    status: 'terminé',
    details: {
      location: '8 Rue de Vaugirard, Paris',
      carType: 'Berline',
      serviceLevel: 'Premium'
    }
  },
  {
    id: 'SVC-4565',
    clientName: 'Marie Lambert',
    clientEmail: 'marie.lambert@exemple.fr',
    serviceType: 'Transport et Livraison',
    date: '2024-03-21T16:45:00',
    status: 'terminé',
    details: {
      pickup: '3 Avenue des Ternes, Paris',
      dropoff: '18 Rue Oberkampf, Paris',
      packageSize: 'Petit'
    }
  },
  {
    id: 'SVC-4564',
    clientName: 'Pierre Durand',
    clientEmail: 'pierre.durand@exemple.fr',
    serviceType: 'Dépannage Auto',
    date: '2024-03-20T11:30:00',
    status: 'terminé',
    details: {
      location: 'Périphérique Sud, Porte d\'Orléans',
      problem: 'Pneu crevé',
      carType: 'SUV'
    }
  }
])

// Filtrer les services
const filteredServices = computed(() => {
  return services.value.filter(service => {
    // Filtre de recherche
    const searchMatch = searchTerm.value === '' || 
      service.id.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      service.clientName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      service.clientEmail.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    // Filtre de statut
    const statusMatch = statusFilter.value === 'all' || 
      service.status === statusFilter.value
    
    // Filtre de type de service
    const serviceTypeMatch = serviceTypeFilter.value === 'all' || 
      service.serviceType.toLowerCase().includes(serviceTypeFilter.value.toLowerCase())
    
    return searchMatch && statusMatch && serviceTypeMatch
  }).sort((a, b) => {
    // Tri par date
    if (sortOrder.value === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    } else {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    }
  })
})

// Pagination
const totalServices = computed(() => filteredServices.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalServices.value / itemsPerPage)))

// Services affichés sur la page courante
const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredServices.value.slice(start, end)
})

const paginationStart = computed(() => {
  return totalServices.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, totalServices.value)
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

// Réinitialiser la page lorsque les filtres changent
watch([searchTerm, statusFilter, serviceTypeFilter, sortOrder], () => {
  currentPage.value = 1
})

// Mettre à jour le statut d'un service
const updateServiceStatus = (serviceId, newStatus) => {
  const service = services.value.find(s => s.id === serviceId)
  if (service) {
    service.status = newStatus
    
    toast({
      title: "Statut mis à jour",
      description: `Le statut du service ${serviceId} a été mis à jour avec succès`,
    })
  }
}

// Voir les détails d'un service
const viewServiceDetails = (serviceId) => {
  router.push(`/provider/services/${serviceId}`)
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
  
  return iconMap[serviceType] || LucideTruck
}

// Mettre la première lettre en majuscule
const capitalizeStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Obtenir la classe CSS en fonction du statut
const getStatusClass = (status) => {
  const statusMap = {
    'en attente': 'bg-yellow-500/10 text-yellow-500',
    'accepté': 'bg-purple-500/10 text-purple-500',
    'en cours': 'bg-blue-500/10 text-blue-500',
    'terminé': 'bg-green-500/10 text-green-500',
    'annulé': 'bg-red-500/10 text-red-500'
  }
  
  return statusMap[status] || 'bg-gray-500/10 text-gray-500'
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
</script>