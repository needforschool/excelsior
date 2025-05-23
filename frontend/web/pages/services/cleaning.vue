<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Commander un service de nettoyage</h1>
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
          <h2 class="mb-4 text-xl font-semibold">Informations de nettoyage</h2>
          
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
                <Label for="locationType">Type de lieu</Label>
                <Select v-model="formData.locationType" class="w-full mt-1" required>
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="maison">Maison</option>
                  <option value="bureau">Bureau</option>
                  <option value="véhicule">Véhicule</option>
                </Select>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label for="cleaningDuration">Durée estimée (heures)</Label>
                <Input 
                  id="cleaningDuration" 
                  type="number" 
                  min="1" 
                  max="8"
                  v-model="formData.cleaningDuration"
                  class="mt-1"
                  required
                />
              </div>
              
              <div v-if="formData.locationType === 'véhicule'">
                <Label for="vehicleType">Type de véhicule</Label>
                <Select v-model="formData.vehicleType" class="w-full mt-1" required>
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="small">Petite voiture</option>
                  <option value="medium">Voiture moyenne</option>
                  <option value="large">SUV / Grande voiture</option>
                </Select>
              </div>
              
              <div v-else-if="formData.locationType === 'maison' || formData.locationType === 'bureau'">
                <Label for="area">Surface (m²)</Label>
                <Input 
                  id="area" 
                  type="number" 
                  min="10" 
                  max="500"
                  v-model="formData.area"
                  class="mt-1"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label for="address">Adresse</Label>
              <Textarea 
                id="address" 
                v-model="formData.address"
                placeholder="Entrez l'adresse complète"
                class="mt-1"
                rows="2"
                required
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                class="mt-1"
                @click="useCurrentLocation"
              >
                <LucideMapPin class="w-4 h-4 mr-2" />
                Utiliser ma position actuelle
              </Button>
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
              <Label for="specialInstructions">Instructions spéciales</Label>
              <Textarea 
                id="specialInstructions" 
                v-model="formData.specialInstructions"
                placeholder="Instructions particulières pour le nettoyeur"
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
              <span class="font-medium">Nettoyage</span>
            </div>
            
            <div v-if="formData.locationType" class="flex items-center justify-between">
              <span class="text-sm">Type de lieu</span>
              <span class="font-medium">{{ formatLocationType(formData.locationType) }}</span>
            </div>
            
            <div v-if="formData.date" class="flex items-center justify-between">
              <span class="text-sm">Date</span>
              <span class="font-medium">{{ formatDate(formData.date) }}</span>
            </div>
            
            <div v-if="formData.cleaningDuration" class="flex items-center justify-between">
              <span class="text-sm">Durée</span>
              <span class="font-medium">{{ formData.cleaningDuration }} heure(s)</span>
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
            
            <div class="flex items-center justify-between pt-2 mt-2 font-semibold border-t border-muted">
              <span>Total</span>
              <span>{{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
          
          <p class="mt-4 text-xs text-center text-muted-foreground">
            Le prix final peut varier en fonction des services supplémentaires demandés lors de l'intervention.
          </p>
        </div>
        
        <!-- Avantages du service -->
        <div class="p-6 mt-6 rounded-lg shadow-sm bg-muted">
          <h3 class="mb-3 font-semibold">Pourquoi choisir notre service de nettoyage ?</h3>
          <ul class="space-y-2">
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Nettoyeurs professionnels qualifiés</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Produits écologiques</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Satisfaction garantie</span>
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
import { useCleaning } from '~/composables/cleaning'
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
const { createCleaning } = useCleaning()

// Vérifier si l'utilisateur est connecté
onMounted(() => {
  if (!authStore.isAuthenticated) {
    toast({
      title: "Authentification requise",
      description: "Vous devez être connecté pour commander un service",
      variant: "destructive",
    })
    router.push('/auth?redirect=/services/cleaning')
  }
  
  // Initialiser la date avec la date actuelle + 24 heures
  const now = new Date()
  now.setHours(now.getHours() + 24)
  
  // Formater la date pour l'input datetime-local
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  formData.value.date = `${year}-${month}-${day}T${hours}:${minutes}`
  
  // Valeurs par défaut
  formData.value.cleaningDuration = 2
})

// État de chargement et d'erreur
const loading = ref(false)
const error = ref(null)

// Données du formulaire
const formData = ref({
  date: '',
  locationType: '',
  cleaningDuration: 2,
  vehicleType: '',
  area: '',
  address: '',
  selectedServices: [],
  specialInstructions: ''
})

// Services disponibles
const availableServices = ref([
  { id: 'basic', name: 'Nettoyage standard', included: true, extraPrice: 0 },
  { id: 'deep', name: 'Nettoyage en profondeur', included: false, extraPrice: 15 },
  { id: 'windows', name: 'Nettoyage des vitres', included: false, extraPrice: 10 },
  { id: 'floors', name: 'Nettoyage spécial sols', included: false, extraPrice: 12 },
  { id: 'appliances', name: 'Nettoyage des appareils électroménagers', included: false, extraPrice: 20 },
  { id: 'eco', name: 'Produits 100% écologiques', included: false, extraPrice: 5 }
])

// Prix de base en fonction du type de lieu et de la durée
const basePrice = computed(() => {
  const hourlyRate = (() => {
    switch (formData.value.locationType) {
      case 'maison':
        return 30
      case 'bureau':
        return 35
      case 'véhicule':
        return 25
      default:
        return 0
    }
  })()
  
  return hourlyRate * formData.value.cleaningDuration
})

// Prix des services supplémentaires
const extraServicesPrice = computed(() => {
  return formData.value.selectedServices.reduce((total, serviceId) => {
    const service = availableServices.value.find(s => s.id === serviceId)
    return total + (service?.extraPrice || 0)
  }, 0)
})

// Prix total
const totalPrice = computed(() => {
  return basePrice.value + extraServicesPrice.value
})

// Utiliser la position actuelle pour l'adresse
const useCurrentLocation = () => {
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
      formData.value.address = `Position actuelle (${position.coords.latitude}, ${position.coords.longitude})`
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

// Formatter le type de lieu
const formatLocationType = (type) => {
  const locationTypes = {
    'maison': 'Maison',
    'bureau': 'Bureau',
    'véhicule': 'Véhicule'
  }
  
  return locationTypes[type] || type
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
      service_type: 'nettoyage',
      latitude,
      longitude
    }
    
    const orderResponse = await createOrder(orderData)
    
    if (!orderResponse) {
      throw new Error('Erreur lors de la création de la commande')
    }
    
    // Créer le service de nettoyage associé
    const cleaningData = {
      order_id: orderResponse.id,
      location_type: formData.value.locationType,
      cleaning_duration: formData.value.cleaningDuration
    }
    
    await createCleaning(cleaningData)
    
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