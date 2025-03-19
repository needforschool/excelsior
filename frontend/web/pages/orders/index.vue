<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Mes commandes</h1>
      <Button as="NuxtLink" to="/services">
        <LucidePlus class="w-4 h-4 mr-2" />
        Nouvelle commande
      </Button>
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
          <option value="Transport et Livraison">Transport</option>
          <option value="Nettoyage Véhicule">Nettoyage</option>
          <option value="Déménagement">Déménagement</option>
          <option value="Dépannage Auto">Dépannage</option>
          <option value="Garde d'Enfants">Garde d'enfants</option>
        </Select>
        
        <Select v-model="sortOrder" class="w-48">
          <option value="newest">Plus récents d'abord</option>
          <option value="oldest">Plus anciens d'abord</option>
          <option value="price-high">Prix (décroissant)</option>
          <option value="price-low">Prix (croissant)</option>
        </Select>
      </div>
    </div>
    
    <!-- Liste des commandes -->
    <div class="overflow-hidden rounded-lg shadow-sm bg-card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-muted">
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Référence</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Service</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Date</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Prestataire</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Prix</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Statut</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-muted">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-muted/50">
              <td class="px-4 py-4 whitespace-nowrap">
                <p class="text-sm font-medium">{{ order.id }}</p>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-secondary">
                    <component :is="getServiceIconComponent(order.serviceType)" class="w-4 h-4" />
                  </div>
                  <p class="text-sm">{{ order.serviceType }}</p>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <p class="text-sm">{{ formatDate(order.date) }}</p>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-primary/10">
                    <span class="text-xs">{{ getProviderInitials(order.provider) }}</span>
                  </div>
                  <p class="text-sm">{{ order.provider }}</p>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <p class="text-sm">{{ formatPrice(order.price) }}</p>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                      :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-4 py-4 text-right whitespace-nowrap">
                <div class="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" as="NuxtLink" :to="`/orders/${order.id}`">
                    <LucideEye class="w-4 h-4" />
                  </Button>
                  <Button v-if="order.status === 'En cours'" variant="ghost" size="sm">
                    <LucideMessageSquare class="w-4 h-4" />
                  </Button>
                  <Button v-if="canCancel(order)" variant="ghost" size="sm">
                    <LucideXCircle class="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
            
            <!-- Pas de résultats -->
            <tr v-if="filteredOrders.length === 0">
              <td colspan="7" class="px-4 py-8 text-center">
                <p class="text-muted-foreground">Aucune commande ne correspond à votre recherche</p>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
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
  LucidePackage
} from 'lucide-vue-next'

// États des filtres
const searchTerm = ref('')
const statusFilter = ref('all')
const serviceFilter = ref('all')
const sortOrder = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 10

// Données simulées des commandes
const allOrders = ref([
  { 
    id: 'QS-7890', 
    serviceType: 'Transport et Livraison', 
    date: '2024-03-19T15:30:00',
    provider: 'Jean Dupont',
    price: 34.99,
    status: 'En cours' 
  },
  { 
    id: 'QS-7889', 
    serviceType: 'Nettoyage Véhicule',
    date: '2024-03-18T10:15:00',
    provider: 'Marie Lambert',
    price: 59.90,
    status: 'Terminé' 
  },
  { 
    id: 'QS-7885', 
    serviceType: 'Déménagement',
    date: '2024-03-15T09:00:00',
    provider: 'Philippe Martin',
    price: 149.00,
    status: 'Terminé' 
  },
  { 
    id: 'QS-7880', 
    serviceType: 'Dépannage Auto', 
    date: '2024-03-10T14:20:00',
    provider: 'Ahmed Bennani',
    price: 85.50,
    status: 'Terminé' 
  },
  { 
    id: 'QS-7872', 
    serviceType: 'Garde d\'Enfants', 
    date: '2024-03-05T08:00:00',
    provider: 'Sophie Durand',
    price: 120.00,
    status: 'Terminé' 
  },
  { 
    id: 'QS-7865', 
    serviceType: 'Transport et Livraison', 
    date: '2024-02-28T16:45:00',
    provider: 'Lucas Moreau',
    price: 29.99,
    status: 'Annulé' 
  }
])

// Filtrer les commandes en fonction des critères sélectionnés
const filteredOrders = computed(() => {
  // Appliquer les filtres
  let filtered = allOrders.value.filter(order => {
    // Filtre de recherche
    const searchMatch = searchTerm.value === '' || 
      order.id.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      order.serviceType.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      order.provider.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    // Filtre de statut
    const statusMatch = statusFilter.value === 'all' || 
      order.status.toLowerCase() === statusFilter.value.toLowerCase()
    
    // Filtre de service
    const serviceMatch = serviceFilter.value === 'all' || 
      order.serviceType === serviceFilter.value
    
    return searchMatch && statusMatch && serviceMatch
  })
  
  // Appliquer le tri
  switch (sortOrder.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
      break
    case 'oldest':
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
      break
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price)
      break
  }
  
  return filtered
})

// Pagination
const totalOrders = computed(() => filteredOrders.value.length)
const totalPages = computed(() => Math.ceil(totalOrders.value / itemsPerPage))
const paginatedOrders = computed(() => {
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
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(date)
}

// Obtenir l'icône en fonction du type de service
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

// Obtenir les initiales du prestataire
const getProviderInitials = (provider) => {
  return provider
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
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

// Vérifier si une commande peut être annulée
const canCancel = (order) => {
  return order.status === 'En cours' || order.status === 'En attente'
}
</script>