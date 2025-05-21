<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Commander un service de déménagement</h1>
      <NuxtLink to="/services">
        <Button variant="outline">
          <LucideArrowLeft class="w-4 h-4 mr-2" />
          Retour aux services
        </Button>
      </NuxtLink>
    </div>
    
    <!-- Message d'erreur -->
    <div v-if="error" class="p-4 mb-6 rounded-md bg-destructive/10 text-destructive">
      {{ error }}
    </div>
    
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Formulaire de commande -->
      <div class="lg:col-span-2">
        <div class="p-6 rounded-lg shadow-sm bg-card">
          <h2 class="mb-4 text-xl font-semibold">Informations de déménagement</h2>
          
          <form @submit.prevent="submitOrder" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label for="date">Date et heure</Label>
                <Input 
                  id="date" 
                  type="datetime-local" 
                  v-model="formData.date"
                  class="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label for="teamSize">Taille de l'équipe</Label>
                <Select v-model="formData.teamSize" class="w-full mt-1" required>
                  <option value="" disabled>Sélectionnez une taille</option>
                  <option value="1">1 personne</option>
                  <option value="2">2 personnes</option>
                  <option value="3">3 personnes</option>
                  <option value="4">4 personnes</option>
                  <option value="5">5 personnes</option>
                </Select>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label for="truckSize">Taille du camion</Label>
                <Select v-model="formData.truckSize" class="w-full mt-1" required>
                  <option value="" disabled>Sélectionnez une taille</option>
                  <option value="petit">Petit (jusqu'à 12m³)</option>
                  <option value="moyen">Moyen (jusqu'à 20m³)</option>
                  <option value="grand">Grand (jusqu'à 30m³)</option>
                </Select>
              </div>
              
              <div>
                <Label for="moveType">Type de déménagement</Label>
                <Select v-model="formData.moveType" class="w-full mt-1" required>
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="studio">Studio</option>
                  <option value="apartment">Appartement</option>
                  <option value="house">Maison</option>
                  <option value="office">Bureau</option>
                  <option value="partial">Déménagement partiel</option>
                </Select>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label for="fromAddress">Adresse de départ</Label>
                <Textarea 
                  id="fromAddress" 
                  v-model="formData.fromAddress"
                  placeholder="Entrez l'adresse complète de départ"
                  class="mt-1"
                  rows="2"
                  required
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  class="mt-1"
                  @click="useCurrentLocationForFrom"
                >
                  <LucideMapPin class="w-4 h-4 mr-2" />
                  Utiliser ma position actuelle
                </Button>
              </div>
              
              <div>
                <Label for="toAddress">Adresse d'arrivée</Label>
                <Textarea 
                  id="toAddress" 
                  v-model="formData.toAddress"
                  placeholder="Entrez l'adresse complète d'arrivée"
                  class="mt-1"
                  rows="2"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label>Services inclus</Label>
              <div class="grid grid-cols-1 gap-2 mt-1 sm:grid-cols-2">
                <div v-for="(service, index) in availableServices" :key="index" class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      :id="`service-${index}`"
                      type="checkbox"
                      v-model="formData.selectedServices"
                      :value="service.id"
                      class="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary"
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label :for="`service-${index}`" class="font-medium">
                      {{ service.name }} 
                      <span v-if="service.extraPrice">(+{{ formatPrice(service.extraPrice) }})</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label for="itemDetails">Détails des objets à déménager</Label>
              <Textarea 
                id="itemDetails" 
                v-model="formData.itemDetails"
                placeholder="Listez les principaux objets à déménager (meubles volumineux, électroménager, etc.)"
                class="mt-1"
                rows="3"
              />
            </div>
            
            <div>
              <Label for="specialInstructions">Instructions spéciales</Label>
              <Textarea 
                id="specialInstructions" 
                v-model="formData.specialInstructions"
                placeholder="Instructions particulières pour l'équipe de déménagement"
                class="mt-1"
                rows="3"
              />
            </div>
            
            <div class="flex justify-end">
              <Button type="submit" :disabled="loading">
                <LucideLoader v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                Continuer
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Résumé et prix -->
      <div>
        <div class="sticky p-6 rounded-lg shadow-sm bg-card top-4">
          <h2 class="mb-4 text-xl font-semibold">Résumé de la commande</h2>
          
          <div class="mb-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm">Service</span>
              <span class="font-medium">Déménagement</span>
            </div>
            
            <div v-if="formData.moveType" class="flex items-center justify-between">
              <span class="text-sm">Type</span>
              <span class="font-medium">{{ formatMoveType(formData.moveType) }}</span>
            </div>
            
            <div v-if="formData.truckSize" class="flex items-center justify-between">
              <span class="text-sm">Taille du camion</span>
              <span class="font-medium">{{ formatTruckSize(formData.truckSize) }}</span>
            </div>
            
            <div v-if="formData.teamSize" class="flex items-center justify-between">
              <span class="text-sm">Équipe</span>
              <span class="font-medium">{{ formData.teamSize }} personne(s)</span>
            </div>
            
            <div v-if="formData.date" class="flex items-center justify-between">
              <span class="text-sm">Date</span>
              <span class="font-medium">{{ formatDate(formData.date) }}</span>
            </div>
          </div>
          
          <div class="pt-4 mt-4 border-t border-muted">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm">Prix de base</span>
              <span class="font-medium">{{ formatPrice(basePrice) }}</span>
            </div>
            
            <div v-if="extraServicesPrice > 0" class="flex items-center justify-between mb-2">
              <span class="text-sm">Services supplémentaires</span>
              <span class="font-medium">{{ formatPrice(extraServicesPrice) }}</span>
            </div>
            
            <div v-if="distancePriceEstimate > 0" class="flex items-center justify-between mb-2">
              <span class="text-sm">Estimation distance</span>
              <span class="font-medium">{{ formatPrice(distancePriceEstimate) }}</span>
            </div>
            
            <div class="flex items-center justify-between pt-2 mt-2 font-semibold border-t border-muted">
              <span>Total estimé</span>
              <span>{{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
          
          <p class="mt-4 text-xs text-center text-muted-foreground">
            Le prix final peut varier en fonction du temps réel passé, des services supplémentaires et de la distance effective.
          </p>
        </div>
        
        <!-- Avantages du service -->
        <div class="p-6 mt-6 rounded-lg shadow-sm bg-muted">
          <h3 class="mb-3 font-semibold">Pourquoi choisir notre service de déménagement ?</h3>
          <ul class="space-y-2">
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Équipe professionnelle et qualifiée</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Équipement adapté à tous types de déménagements</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Sécurité de vos biens garantie</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Assurance incluse</span>
            </li>
          </ul>
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast/use-toast'
import { useAuthStore } from '~/stores/auth'
import { useOrder } from '~/composables/order'
import { useMoving } from '~/composables/moving'
import { 
  LucideArrowLeft,
  LucideCheck,
  LucideMapPin,
  LucideLoader
} from 'lucide-vue-next'

const router = useRouter()
const { toast } = useToast()
const authStore = useAuthStore()
const { createOrder } = useOrder()
const { createMoving } = useMoving()

// Vérifier si l'utilisateur est connecté
onMounted(() => {
  if (!authStore.isAuthenticated) {
    toast({
      title: "Authentification requise",
      description: "Vous devez être connecté pour commander un service",
      variant: "destructive",
    })
    router.push('/auth?redirect=/services/moving')
  }
  
  // Initialiser la date avec la date actuelle + 48 heures
  const now = new Date()
  now.setHours(now.getHours() + 48)
  
  // Formater la date pour l'input datetime-local
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  formData.value.date = `${year}-${month}-${day}T${hours}:${minutes}`
  
  // Valeurs par défaut
  formData.value.teamSize = "2"
  formData.value.truckSize = "moyen"
})

// État de chargement et d'erreur
const loading = ref(false)
const error = ref(null)

// Données du formulaire
const formData = ref({
  date: '',
  teamSize: '',
  truckSize: '',
  moveType: '',
  fromAddress: '',
  toAddress: '',
  selectedServices: [],
  itemDetails: '',
  specialInstructions: ''
})

// Services disponibles
const availableServices = ref([
  { id: 'packing', name: 'Emballage des affaires', included: false, extraPrice: 50 },
  { id: 'furniture', name: 'Démontage/remontage des meubles', included: false, extraPrice: 60 },
  { id: 'heavy', name: 'Manutention objets lourds', included: false, extraPrice: 40 },
  { id: 'disposal', name: 'Évacuation des déchets', included: false, extraPrice: 30 },
  { id: 'storage', name: 'Stockage temporaire (1 semaine)', included: false, extraPrice: 100 },
  { id: 'insurance', name: 'Assurance premium', included: false, extraPrice: 25 }
])

// Prix de base en fonction du type de déménagement, de la taille de l'équipe et du camion
const basePrice = computed(() => {
  if (!formData.value.teamSize || !formData.value.truckSize || !formData.value.moveType) {
    return 0
  }
  
  const teamSizePrice = parseInt(formData.value.teamSize) * 50 // 50€ par personne
  
  let truckSizePrice = 0
  switch (formData.value.truckSize) {
    case 'petit':
      truckSizePrice = 80
      break
    case 'moyen':
      truckSizePrice = 120
      break
    case 'grand':
      truckSizePrice = 180
      break
  }
  
  let moveTypeMultiplier = 1
  switch (formData.value.moveType) {
    case 'studio':
      moveTypeMultiplier = 1
      break
    case 'apartment':
      moveTypeMultiplier = 1.2
      break
    case 'house':
      moveTypeMultiplier = 1.5
      break
    case 'office':
      moveTypeMultiplier = 1.3
      break
    case 'partial':
      moveTypeMultiplier = 0.8
      break
  }
  
  return (teamSizePrice + truckSizePrice) * moveTypeMultiplier
})

// Prix des services supplémentaires
const extraServicesPrice = computed(() => {
  return formData.value.selectedServices.reduce((total, serviceId) => {
    const service = availableServices.value.find(s => s.id === serviceId)
    return total + (service?.extraPrice || 0)
  }, 0)
})

// Estimation du prix en fonction de la distance (simulé)
const distancePriceEstimate = computed(() => {
  if (!formData.value.fromAddress || !formData.value.toAddress) {
    return 0
  }
  
  // Simulation d'un calcul de distance, en réalité on utiliserait une API comme Google Maps
  return Math.floor(Math.random() * 20) + 10 // Entre 10 et 30 euros
})

// Prix total estimé
const totalPrice = computed(() => {
  return basePrice.value + extraServicesPrice.value + distancePriceEstimate.value
})

// Utiliser la position actuelle pour l'adresse de départ
const useCurrentLocationForFrom = () => {
  if (!navigator.geolocation) {
    toast({
      title: "Erreur",
      description: "La géolocalisation n'est pas prise en charge par votre navigateur",
      variant: "destructive",
    })
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // Dans une application réelle, on utiliserait une API de géocodage inverse
      // pour obtenir l'adresse à partir des coordonnées
      formData.value.fromAddress = `Position actuelle (${position.coords.latitude}, ${position.coords.longitude})`
      toast({
        title: "Succès",
        description: "Position actuelle récupérée",
      })
    },
    (err) => {
      console.error('Erreur de géolocalisation', err)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer votre position",
        variant: "destructive",
      })
    }
  )
}

// Formatter le type de déménagement
const formatMoveType = (type) => {
  const moveTypes = {
    'studio': 'Studio',
    'apartment': 'Appartement',
    'house': 'Maison',
    'office': 'Bureau',
    'partial': 'Déménagement partiel'
  }
  
  return moveTypes[type] || type
}

// Formatter la taille du camion
const formatTruckSize = (size) => {
  const truckSizes = {
    'petit': 'Petit (jusqu\'à 12m³)',
    'moyen': 'Moyen (jusqu\'à 20m³)',
    'grand': 'Grand (jusqu\'à 30m³)'
  }
  
  return truckSizes[size] || size
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

// Formater le prix
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

// Soumettre la commande
const submitOrder = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Simuler les coordonnées à partir de l'adresse
    // Dans une application réelle, on utiliserait une API de géocodage
    const latitude = 48.856614 + (Math.random() * 0.1 - 0.05)
    const longitude = 2.352222 + (Math.random() * 0.1 - 0.05)
    
    // Créer la commande
    const orderData = {
      service_type: 'déménagement',
      latitude,
      longitude
    }
    
    const orderResponse = await createOrder(orderData)
    
    if (!orderResponse) {
      throw new Error('Erreur lors de la création de la commande')
    }
    
    // Créer le service de déménagement associé
    const movingData = {
      order_id: orderResponse.id,
      team_size: parseInt(formData.value.teamSize),
      truck_size: formData.value.truckSize
    }
    
    await createMoving(movingData)
    
    // Rediriger vers la page de confirmation
    router.push('/orders/confirmation')
  } catch (err) {
    console.error('Erreur lors de la création de la commande', err)
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de la création de la commande'
    
    toast({
      title: "Erreur",
      description: error.value,
      variant: "destructive",
    })
  } finally {
    loading.value = false
  }
}
</script>