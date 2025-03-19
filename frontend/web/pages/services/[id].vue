<template>
  <div class="container px-4 py-6 mx-auto">
    <!-- En-tête avec navigation et titre -->
    <div class="mb-6">
      <Button variant="ghost" class="mb-4" as="NuxtLink" to="/services">
        <LucideArrowLeft class="w-4 h-4 mr-2" />
        Retour aux services
      </Button>
      <h1 class="text-2xl font-bold">{{ service.name }}</h1>
    </div>
    
    <!-- Contenu principal -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Informations sur le service -->
      <div class="lg:col-span-2">
        <div class="overflow-hidden rounded-lg shadow-sm bg-card">
          <!-- Image/Icône du service -->
          <div class="relative aspect-video bg-muted">
            <div class="absolute inset-0 flex items-center justify-center">
              <component :is="getServiceIconComponent(service.icon)" class="w-20 h-20 text-muted-foreground" />
            </div>
          </div>
          
          <!-- Description et détails -->
          <div class="p-6">
            <h2 class="mb-4 text-xl font-semibold">À propos de ce service</h2>
            <p class="mb-6 text-muted-foreground">{{ service.description }}</p>
            
            <h3 class="mb-3 font-semibold">Ce qui est inclus</h3>
            <ul class="mb-6 space-y-2">
              <li v-for="(feature, index) in service.features" :key="index" class="flex items-start">
                <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>{{ feature }}</span>
              </li>
            </ul>
            
            <h3 class="mb-3 font-semibold">Informations importantes</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex items-center">
                <LucideClock class="w-5 h-5 mr-2 text-muted-foreground" />
                <span class="text-sm">{{ service.duration }}</span>
              </div>
              <div class="flex items-center">
                <LucideMapPin class="w-5 h-5 mr-2 text-muted-foreground" />
                <span class="text-sm">{{ service.location }}</span>
              </div>
              <div class="flex items-center">
                <LucideUsers class="w-5 h-5 mr-2 text-muted-foreground" />
                <span class="text-sm">{{ service.providers }} prestataires disponibles</span>
              </div>
              <div class="flex items-center">
                <LucideStar class="w-5 h-5 mr-2 text-yellow-500" />
                <span class="text-sm">{{ service.rating }} ({{ service.reviews }} avis)</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Avis des clients -->
        <div class="p-6 mt-6 rounded-lg shadow-sm bg-card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Avis des clients</h2>
            <Select v-model="reviewFilter" class="w-40">
              <option value="recent">Plus récents</option>
              <option value="positive">Mieux notés</option>
              <option value="critical">Plus critiques</option>
            </Select>
          </div>
          
          <div class="space-y-4">
            <div v-for="review in filteredReviews" :key="review.id" class="pb-4 border-b border-muted last:border-0">
              <div class="flex items-start justify-between">
                <div class="flex items-center">
                  <div class="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-secondary">
                    <span class="text-xs">{{ getReviewerInitials(review.reviewer) }}</span>
                  </div>
                  <div>
                    <p class="font-medium">{{ review.reviewer }}</p>
                    <p class="text-xs text-muted-foreground">{{ formatReviewDate(review.date) }}</p>
                  </div>
                </div>
                <div class="flex items-center">
                  <span class="mr-1 font-bold">{{ review.rating }}</span>
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                </div>
              </div>
              <p class="mt-3 text-sm">{{ review.comment }}</p>
            </div>
            
            <!-- Pas d'avis -->
            <div v-if="filteredReviews.length === 0" class="py-6 text-center">
              <p class="text-muted-foreground">Aucun avis disponible pour ce service</p>
            </div>
          </div>
          
          <Button v-if="reviews.length > displayedReviews" variant="outline" class="w-full mt-4" @click="loadMoreReviews">
            Voir plus d'avis
          </Button>
        </div>
      </div>
      
      <!-- Formulaire de commande -->
      <div>
        <div class="sticky p-6 rounded-lg shadow-sm bg-card top-4">
          <h2 class="mb-4 text-xl font-semibold">Commander ce service</h2>
          
          <div class="space-y-4">
            <div>
              <Label for="date">Date et heure</Label>
              <Input 
                id="date" 
                type="datetime-local" 
                v-model="orderForm.date"
                class="mt-1"
              />
            </div>
            
            <div>
              <Label for="address">Adresse</Label>
              <Textarea 
                id="address" 
                v-model="orderForm.address"
                placeholder="Entrez l'adresse complète"
                class="mt-1"
                rows="3"
              />
            </div>
            
            <div v-if="service.options && service.options.length > 0">
              <Label>Options supplémentaires</Label>
              <div class="mt-1 space-y-2">
                <div v-for="option in service.options" :key="option.id" class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      :id="option.id"
                      type="checkbox"
                      v-model="orderForm.selectedOptions"
                      :value="option.id"
                      class="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary"
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label :for="option.id" class="font-medium">
                      {{ option.name }} (+{{ formatPrice(option.price) }})
                    </label>
                    <p class="text-muted-foreground">{{ option.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label for="notes">Notes spéciales</Label>
              <Textarea 
                id="notes" 
                v-model="orderForm.notes"
                placeholder="Instructions particulières pour le prestataire"
                class="mt-1"
                rows="3"
              />
            </div>
          </div>
          
          <div class="mt-6 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Prix du service</span>
              <span>{{ formatPrice(service.price) }}</span>
            </div>
            <div v-if="optionsTotal > 0" class="flex items-center justify-between text-sm">
              <span>Options supplémentaires</span>
              <span>{{ formatPrice(optionsTotal) }}</span>
            </div>
            <div class="flex items-center justify-between pt-2 font-semibold border-t border-muted">
              <span>Total</span>
              <span>{{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
          
          <Button class="w-full mt-4" size="lg" @click="placeOrder">
            Commander maintenant
          </Button>
          
          <p class="mt-4 text-xs text-center text-muted-foreground">
            En commandant, vous acceptez nos <a href="#" class="underline">conditions générales</a> et notre <a href="#" class="underline">politique de confidentialité</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { 
  LucideArrowLeft,
  LucideCheck,
  LucideClock,
  LucideMapPin,
  LucideUsers,
  LucideStar,
  LucideCar,
  LucidePackage,
  LucideTruck,
  LucideWrench,
  LucideHome,
  LucideBox,
  LucideHeart
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const serviceId = route.params.id

// État pour le formulaire de commande
const orderForm = ref({
  date: '',
  address: '',
  selectedOptions: [],
  notes: ''
})

// État pour les filtres d'avis
const reviewFilter = ref('recent')
const displayedReviews = ref(3)

// Récupération des données du service (simulé)
const service = ref({
  // Ces données seraient normalement récupérées depuis une API
  id: serviceId,
  name: 'Nettoyage de Véhicule',
  description: 'Service complet de nettoyage intérieur et extérieur de votre véhicule. Nos experts utilisent des produits de qualité professionnelle pour rendre votre véhicule comme neuf. Le service inclut l\'aspiration, le nettoyage des sièges, des tapis, du tableau de bord et des vitres.',
  price: 49.99,
  icon: 'car',
  duration: 'Environ 2 heures',
  location: 'À votre domicile ou lieu de travail',
  providers: 45,
  rating: 4.8,
  reviews: 125,
  features: [
    'Nettoyage extérieur complet',
    'Nettoyage intérieur en profondeur',
    'Aspiration des sièges et tapis',
    'Nettoyage des vitres intérieures et extérieures',
    'Traitement des surfaces plastiques et cuir',
    'Désodorisation de l\'habitacle'
  ],
  options: [
    {
      id: 'premium-wax',
      name: 'Cire Premium',
      description: 'Application d\'une cire premium pour une protection longue durée',
      price: 19.99
    },
    {
      id: 'leather-treatment',
      name: 'Traitement du cuir',
      description: 'Traitement spécial pour sièges et détails en cuir',
      price: 14.99
    },
    {
      id: 'odor-removal',
      name: 'Traitement anti-odeurs',
      description: 'Élimination complète des odeurs tenaces',
      price: 9.99
    }
  ]
})

// Données simulées d'avis clients
const reviews = ref([
  {
    id: 1,
    reviewer: 'Jean Dupont',
    date: '2024-03-12T10:15:00',
    rating: 5,
    comment: 'Service impeccable ! Ma voiture n\'a jamais été aussi propre. Le prestataire était ponctuel et très professionnel.'
  },
  {
    id: 2,
    reviewer: 'Marie Lambert',
    date: '2024-03-05T16:30:00',
    rating: 4,
    comment: 'Très bon service, rapide et efficace. J\'aurais aimé un peu plus d\'attention sur les détails des vitres, mais dans l\'ensemble très satisfaite.'
  },
  {
    id: 3,
    reviewer: 'Philippe Martin',
    date: '2024-02-28T14:20:00',
    rating: 5,
    comment: 'Excellent service ! Le prestataire est arrivé à l\'heure et a fait un travail remarquable. Je recommande vivement.'
  },
  {
    id: 4,
    reviewer: 'Sophie Durand',
    date: '2024-02-22T09:45:00',
    rating: 3,
    comment: 'Service correct mais un peu cher pour ce qui est fait. J\'ai dû signaler quelques endroits oubliés.'
  },
  {
    id: 5,
    reviewer: 'Ahmed Bennani',
    date: '2024-02-15T11:30:00',
    rating: 5,
    comment: 'Parfait ! Ma voiture brille comme au premier jour. Le prestataire a été très attentif à mes demandes.'
  }
])

// Filtrer les avis
const filteredReviews = computed(() => {
  let filtered = [...reviews.value]
  
  // Appliquer le filtre
  switch (reviewFilter.value) {
    case 'recent':
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
      break
    case 'positive':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'critical':
      filtered.sort((a, b) => a.rating - b.rating)
      break
  }
  
  return filtered.slice(0, displayedReviews.value)
})

// Calculer le prix total des options sélectionnées
const optionsTotal = computed(() => {
  if (!service.value.options) return 0
  
  return service.value.options
    .filter(option => orderForm.value.selectedOptions.includes(option.id))
    .reduce((total, option) => total + option.price, 0)
})

// Calculer le prix total
const totalPrice = computed(() => {
  return service.value.price + optionsTotal.value
})

// Fonction pour obtenir le composant d'icône en fonction du nom
const getServiceIconComponent = (iconName) => {
  const iconMap = {
    'car': LucideCar,
    'truck': LucideTruck,
    'package': LucidePackage,
    'home': LucideHome,
    'box': LucideBox,
    'wrench': LucideWrench,
    'users': LucideUsers,
    'heart': LucideHeart
  }
  
  return iconMap[iconName] || LucidePackage
}

// Initialiser le formulaire avec la date actuelle
onMounted(() => {
  const now = new Date()
  // Ajouter 2 heures à la date actuelle
  now.setHours(now.getHours() + 2)
  
  // Formater la date pour l'input datetime-local
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  orderForm.value.date = `${year}-${month}-${day}T${hours}:${minutes}`
})

// Fonctions utilitaires
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

const formatReviewDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  }).format(date)
}

const getReviewerInitials = (reviewer) => {
  return reviewer
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Charger plus d'avis
const loadMoreReviews = () => {
  displayedReviews.value += 3
}

// Placer la commande
const placeOrder = () => {
  // Ici, vous feriez un appel API pour enregistrer la commande
  console.log('Commande placée:', {
    serviceId: service.value.id,
    serviceName: service.value.name,
    ...orderForm.value,
    price: service.value.price,
    optionsTotal: optionsTotal.value,
    totalPrice: totalPrice.value
  })
  
  // Redirection vers une page de confirmation
  router.push('/orders/confirmation')
}
</script>