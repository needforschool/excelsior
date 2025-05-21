<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Commander un service de transport</h1>
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
          <h2 class="mb-4 text-xl font-semibold">Informations de transport</h2>
          
          <form @submit.prevent="submitOrder" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label for="date">Date et heure du transport</Label>
                <Input 
                  id="date" 
                  type="datetime-local" 
                  v-model="formData.date"
                  class="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label for="vehicleType">Type de véhicule</Label>
                <Select v-model="formData.vehicleType" class="w-full mt-1" required>
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="voiture">Voiture</option>
                  <option value="camion">Camion</option>
                  <option value="moto">Moto (livraison rapide)</option>
                </Select>
              </div>
            </div>
            
            <div>
              <Label for="pickupAddress">Adresse de départ</Label>
              <Textarea 
                id="pickupAddress" 
                v-model="formData.pickupAddress"
                placeholder="Entrez l'adresse complète de prise en charge"
                class="mt-1"
                rows="2"
                required
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                class="mt-1"
                @click="useCurrentLocationForPickup"
              >
                <LucideMapPin class="w-4 h-4 mr-2" />
                Utiliser ma position actuelle
              </Button>
            </div>
            
            <div>
              <Label for="dropoffAddress">Adresse de destination</Label>
              <Textarea 
                id="dropoffAddress" 
                v-model="formData.dropoffAddress"
                placeholder="Entrez l'adresse complète de livraison"
                class="mt-1"
                rows="2"
                required
              />
            </div>
            
            <div>
              <Label for="packageDetails">Détails du colis</Label>
              <Textarea 
                id="packageDetails" 
                v-model="formData.packageDetails"
                placeholder="Dimensions, poids, contenu, etc."
                class="mt-1"
                rows="3"
              />
            </div>
            
            <div>
              <Label for="specialInstructions">Instructions spéciales</Label>
              <Textarea 
                id="specialInstructions" 
                v-model="formData.specialInstructions"
                placeholder="Instructions particulières pour le transporteur"
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
              <span class="font-medium">Transport</span>
            </div>
            
            <div v-if="formData.vehicleType" class="flex items-center justify-between">
              <span class="text-sm">Type de véhicule</span>
              <span class="font-medium">{{ formatVehicleType(formData.vehicleType) }}</span>
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
            Le prix final peut varier en fonction de la distance et du temps réel du trajet.
          </p>
        </div>
        
        <!-- Avantages du service -->
        <div class="p-6 mt-6 rounded-lg shadow-sm bg-muted">
          <h3 class="mb-3 font-semibold">Pourquoi choisir notre service de transport ?</h3>
          <ul class="space-y-2">
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Livraison en moins d'une heure</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Suivi en temps réel</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Transporteurs vérifiés</span>
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
import { useTransport } from '~/composables/transport'
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
const { createTransport } = useTransport()

// Vérifier si l'utilisateur est connecté
onMounted(() => {
  if (!authStore.isAuthenticated) {
    toast({
      title: "Authentification requise",
      description: "Vous devez être connecté pour commander un service",
      variant: "destructive",
    })
    router.push('/auth?redirect=/services/transport')
  }
  
  // Initialiser la date avec la date actuelle + 1 heure
  const now = new Date()
  now.setHours(now.getHours() + 1)
  
  // Formater la date pour l'input datetime-local
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  formData.value.date = `${year}-${month}-${day}T${hours}:${minutes}`
})

// État de chargement et d'erreur
const loading = ref(false)
const error = ref(null)

// Données du formulaire
const formData = ref({
  date: '',
  vehicleType: '',
  pickupAddress: '',
  dropoffAddress: '',
  packageDetails: '',
  specialInstructions: ''
})

// Prix de base en fonction du type de véhicule
const basePrice = computed(() => {
  switch (formData.value.vehicleType) {
    case 'moto':
      return 15.99
    case 'voiture':
      return 24.99
    case 'camion':
      return 39.99
    default:
      return 0
  }
})

// Estimation du prix en fonction de la distance (simulé)
const distancePriceEstimate = computed(() => {
  if (!formData.value.pickupAddress || !formData.value.dropoffAddress) {
    return 0
  }
  
  // Simulation d'un calcul de distance, en réalité on utiliserait une API comme Google Maps
  return Math.floor(Math.random() * 10) + 5 // Entre 5 et 15 euros
})

// Prix total estimé
const totalPrice = computed(() => {
  return basePrice.value + distancePriceEstimate.value
})

// Utiliser la position actuelle pour l'adresse de départ
const useCurrentLocationForPickup = () => {
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
      formData.value.pickupAddress = `Position actuelle (${position.coords.latitude}, ${position.coords.longitude})`
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

// Formatter le type de véhicule
const formatVehicleType = (type) => {
  const vehicleTypes = {
    'voiture': 'Voiture',
    'camion': 'Camion',
    'moto': 'Moto (livraison rapide)'
  }
  
  return vehicleTypes[type] || type
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
    // Simuler les coordonnées à partir des adresses
    // Dans une application réelle, on utiliserait une API de géocodage
    const latitude = 48.856614 + (Math.random() * 0.1 - 0.05)
    const longitude = 2.352222 + (Math.random() * 0.1 - 0.05)
    
    // Créer la commande
    const orderData = {
      service_type: 'transport',
      latitude,
      longitude
    }
    
    const orderResponse = await createOrder(orderData)
    
    if (!orderResponse) {
      throw new Error('Erreur lors de la création de la commande')
    }
    
    // Créer le service de transport associé
    const transportData = {
      order_id: orderResponse.id,
      vehicle_type: formData.value.vehicleType,
      driver_name: 'Affectation en cours...',
      driver_contact: null
    }
    
    await createTransport(transportData)
    
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