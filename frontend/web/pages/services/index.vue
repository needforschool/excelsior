<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
      <div>
        <h1 class="text-2xl font-bold">Nos services</h1>
        <p class="mt-1 text-muted-foreground">Sélectionnez un service pour passer une commande</p>
      </div>
      
      <!-- Filtres de recherche -->
      <div class="w-full md:w-auto">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <LucideSearch class="w-4 h-4 text-muted-foreground" />
          </div>
          <Input 
            v-model="searchTerm"
            placeholder="Rechercher un service..."
            class="w-full pl-10 md:w-60"
          />
        </div>
      </div>
    </div>
    
    <!-- Catégories de services -->
    <div class="flex flex-wrap gap-2 mb-6">
      <Button 
        variant="outline" 
        :class="{ 'bg-primary/10': selectedCategory === 'all' }"
        @click="selectedCategory = 'all'"
      >
        Tous
      </Button>
      <Button 
        v-for="category in categories" 
        :key="category.id"
        variant="outline"
        :class="{ 'bg-primary/10': selectedCategory === category.id }"
        @click="selectedCategory = category.id"
      >
        {{ category.name }}
      </Button>
    </div>
    
    <!-- Liste des services -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="service in filteredServices" 
        :key="service.id"
        class="overflow-hidden transition-shadow rounded-lg shadow-sm bg-card hover:shadow-md"
      >
        <div class="relative aspect-video bg-muted">
          <div class="absolute inset-0 flex items-center justify-center">
            <component :is="getServiceIconComponent(service.icon)" class="w-12 h-12 text-muted-foreground" />
          </div>
        </div>
        
        <div class="p-5">
          <h3 class="mb-2 text-lg font-semibold">{{ service.name }}</h3>
          <p class="mb-4 text-sm text-muted-foreground">{{ service.description }}</p>
          
          <div class="flex items-center justify-between">
            <p class="font-semibold">{{ formatPrice(service.price) }}</p>
            <NuxtLink :to="`/services/${service.id}`">
              <Button>
                Commander
              </Button>
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <!-- Pas de résultats -->
      <div v-if="filteredServices.length === 0" class="py-8 text-center col-span-full">
        <LucideSearchX class="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p class="text-muted-foreground">Aucun service ne correspond à votre recherche</p>
      </div>
    </div>
    
    <!-- Section promotionnelle -->
    <div class="p-6 mt-12 rounded-lg bg-primary/5">
      <div class="grid items-center grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 class="mb-3 text-xl font-bold">Devenez prestataire</h2>
          <p class="mb-4 text-muted-foreground">
            Rejoignez notre réseau de prestataires et augmentez vos revenus en proposant vos services à des milliers de clients potentiels.
          </p>
          <NuxtLink to="/become-provider">
            <Button variant="outline">
              En savoir plus
            </Button>
          </NuxtLink>
        </div>
        <div class="p-5 rounded-lg shadow-sm bg-card">
          <h3 class="mb-2 font-semibold">Les avantages</h3>
          <ul class="space-y-2">
            <li class="flex items-start">
              <LucideCheckCircle class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Fixez vos propres horaires et tarifs</span>
            </li>
            <li class="flex items-start">
              <LucideCheckCircle class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Paiements sécurisés et réguliers</span>
            </li>
            <li class="flex items-start">
              <LucideCheckCircle class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Support client et assistance 7j/7</span>
            </li>
            <li class="flex items-start">
              <LucideCheckCircle class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Développez votre clientèle facilement</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  LucideSearch, 
  LucideSearchX, 
  LucideCheckCircle, 
  LucideTruck, 
  LucidePackage, 
  LucideCar, 
  LucideHome, 
  LucideBox, 
  LucideWrench, 
  LucideUsers, 
  LucideHeart 
} from 'lucide-vue-next'

// États
const searchTerm = ref('')
const selectedCategory = ref('all')

// Catégories de services
const categories = [
  { id: 'transport', name: 'Transport' },
  { id: 'cleaning', name: 'Nettoyage' },
  { id: 'moving', name: 'Déménagement' },
  { id: 'repair', name: 'Dépannage' },
  { id: 'childcare', name: 'Garde d\'enfants' }
]

// Données des services
const services = [
  {
    id: 'transport-express',
    category: 'transport',
    name: 'Transport Express',
    description: 'Livraison express de vos colis dans l\'heure qui suit votre commande.',
    price: 24.99,
    icon: 'truck'
  },
  {
    id: 'transport-standard',
    category: 'transport',
    name: 'Transport Standard',
    description: 'Livraison de vos colis dans les 4 heures suivant votre commande.',
    price: 14.99,
    icon: 'package'
  },
  {
    id: 'car-cleaning',
    category: 'cleaning',
    name: 'Nettoyage de Véhicule',
    description: 'Service complet de nettoyage intérieur et extérieur de votre véhicule.',
    price: 49.99,
    icon: 'car'
  },
  {
    id: 'home-cleaning',
    category: 'cleaning',
    name: 'Nettoyage Maison',
    description: 'Service de nettoyage complet de votre domicile par des experts.',
    price: 79.99,
    icon: 'home'
  },
  {
    id: 'small-moving',
    category: 'moving',
    name: 'Petit Déménagement',
    description: 'Service de déménagement pour petit volume (studio ou T1).',
    price: 149.99,
    icon: 'box'
  },
  {
    id: 'medium-moving',
    category: 'moving',
    name: 'Déménagement Moyen',
    description: 'Service de déménagement pour volume moyen (T2 ou T3).',
    price: 249.99,
    icon: 'truck'
  },
  {
    id: 'car-repair',
    category: 'repair',
    name: 'Dépannage Automobile',
    description: 'Service de dépannage et réparation sur place de votre véhicule.',
    price: 89.99,
    icon: 'wrench'
  },
  {
    id: 'towing',
    category: 'repair',
    name: 'Remorquage',
    description: 'Service de remorquage de votre véhicule vers un garage partenaire.',
    price: 119.99,
    icon: 'truck'
  },
  {
    id: 'childcare-school',
    category: 'childcare',
    name: 'Accompagnement École',
    description: 'Service d\'accompagnement de vos enfants à l\'école ou activités.',
    price: 29.99,
    icon: 'users'
  },
  {
    id: 'childcare-home',
    category: 'childcare',
    name: 'Garde à Domicile',
    description: 'Service de garde d\'enfants à votre domicile par des professionnels.',
    price: 39.99,
    icon: 'heart'
  }
]

// Filtrer les services en fonction de la recherche et de la catégorie
const filteredServices = computed(() => {
  return services.filter(service => {
    const searchMatch = searchTerm.value === '' || 
      service.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const categoryMatch = selectedCategory.value === 'all' || 
      service.category === selectedCategory.value
    
    return searchMatch && categoryMatch
  })
})

// Formatage des prix
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

// Fonction pour obtenir le composant d'icône en fonction du nom
const getServiceIconComponent = (iconName) => {
  const iconMap = {
    'truck': LucideTruck,
    'package': LucidePackage,
    'car': LucideCar,
    'home': LucideHome,
    'box': LucideBox,
    'wrench': LucideWrench,
    'users': LucideUsers,
    'heart': LucideHeart
  }
  
  return iconMap[iconName] || LucidePackage
}
</script>