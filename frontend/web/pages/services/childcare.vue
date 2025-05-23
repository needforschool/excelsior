<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Commander un service de garde d'enfants</h1>
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
          <h2 class="mb-4 text-xl font-semibold">Informations de garde d'enfants</h2>
          
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
                <Label for="duration">Durée (heures)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  min="1" 
                  max="8"
                  v-model="formData.duration"
                  class="mt-1"
                  required
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label for="childCount">Nombre d'enfants</Label>
                <Input 
                  id="childCount" 
                  type="number" 
                  min="1" 
                  max="5"
                  v-model="formData.childCount"
                  class="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label for="serviceType">Type de service</Label>
                <Select v-model="formData.serviceType" class="w-full mt-1" required>
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="home">Garde à domicile</option>
                  <option value="school">Accompagnement école</option>
                  <option value="activities">Accompagnement activités</option>
                  <option value="pickup">Récupération à l'école</option>
                </Select>
              </div>
            </div>
            
            <div>
              <Label for="childrenAges">Âge des enfants</Label>
              <Textarea 
                id="childrenAges" 
                v-model="formData.childrenAges"
                placeholder="Ex: 5 ans, 7 ans, 10 ans"
                class="mt-1"
                rows="2"
                required
              />
            </div>
            
            <div v-if="formData.serviceType === 'home'">
              <Label for="homeAddress">Adresse du domicile</Label>
              <Textarea 
                id="homeAddress" 
                v-model="formData.homeAddress"
                placeholder="Entrez l'adresse du domicile"
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
            
            <div v-if="formData.serviceType === 'school' || formData.serviceType === 'pickup'">
              <Label for="schoolName">Nom et adresse de l'école</Label>
              <Textarea 
                id="schoolName" 
                v-model="formData.schoolName"
                placeholder="Ex: École Jean Jaurès, 10 rue des Écoles"
                class="mt-1"
                rows="2"
                required
              />
            </div>
            
            <div v-if="formData.serviceType === 'activities'">
              <Label for="activityDetails">Détails de l'activité</Label>
              <Textarea 
                id="activityDetails" 
                v-model="formData.activityDetails"
                placeholder="Ex: Cours de natation au club des dauphins, 15 rue des sports"
                class="mt-1"
                rows="2"
                required
              />
            </div>
            
            <div v-if="formData.serviceType === 'school' || formData.serviceType === 'activities' || formData.serviceType === 'pickup'">
              <Label for="destination">Destination après l'activité</Label>
              <Textarea 
                id="destination" 
                v-model="formData.destination"
                placeholder="Ex: Domicile, Grand-parents, etc."
                class="mt-1"
                rows="2"
                required
              />
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
                placeholder="Allergies, particularités à connaître, etc."
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
              <span class="font-medium">Garde d'enfants</span>
            </div>
            
            <div v-if="formData.serviceType" class="flex items-center justify-between">
              <span class="text-sm">Type</span>
              <span class="font-medium">{{ formatServiceType(formData.serviceType) }}</span>
            </div>
            
            <div v-if="formData.childCount" class="flex items-center justify-between">
              <span class="text-sm">Nombre d'enfants</span>
              <span class="font-medium">{{ formData.childCount }}</span>
            </div>
            
            <div v-if="formData.duration" class="flex items-center justify-between">
              <span class="text-sm">Durée</span>
              <span class="font-medium">{{ formData.duration }}h</span>
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
            
            <div v-if="childrenMultiplier > 1" class="flex items-center justify-between mb-2">
              <span class="text-sm">Supplément enfants</span>
              <span class="font-medium">{{ formatPrice(basePrice * (childrenMultiplier - 1)) }}</span>
            </div>
            
            <div class="flex items-center justify-between pt-2 mt-2 font-semibold border-t border-muted">
              <span>Total</span>
              <span>{{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
          
          <p class="mt-4 text-xs text-center text-muted-foreground">
            Le prix final peut varier en fonction de la durée réelle du service.
          </p>
        </div>
        
        <!-- Avantages du service -->
        <div class="p-6 mt-6 rounded-lg shadow-sm bg-muted">
          <h3 class="mb-3 font-semibold">Pourquoi choisir notre service de garde d'enfants ?</h3>
          <ul class="space-y-2">
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Éducateurs professionnels et qualifiés</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Vérification des antécédents</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Suivi en temps réel via l'application</span>
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
import { useChildAssistance } from '~/composables/childAssistance'
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
const { createChildAssistance } = useChildAssistance()

// Vérifier si l'utilisateur est connecté
onMounted(() => {
  if (!authStore.isAuthenticated) {
    toast({
      title: "Authentification requise",
      description: "Vous devez être connecté pour commander un service",
      variant: "destructive",
    })
    router.push('/auth?redirect=/services/childcare')
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
  formData.value.duration = 2
  formData.value.childCount = 1
})

// État de chargement et d'erreur
const loading = ref(false)
const error = ref(null)

// Données du formulaire
const formData = ref({
  date: '',
  duration: 2,
  childCount: 1,
  serviceType: '',
  childrenAges: '',
  homeAddress: '',
  schoolName: '',
  activityDetails: '',
  destination: '',
  selectedServices: [],
  specialInstructions: ''
})

// Services disponibles
const availableServices = ref([
  { id: 'meals', name: 'Préparation des repas', included: false, extraPrice: 10 },
  { id: 'homework', name: 'Aide aux devoirs', included: false, extraPrice: 15 },
  { id: 'activities', name: 'Activités créatives', included: false, extraPrice: 12 },
  { id: 'bath', name: 'Bain et coucher', included: false, extraPrice: 10 },
  { id: 'languages', name: 'Initiation aux langues', included: false, extraPrice: 20 },
  { id: 'firstaid', name: 'Personnel formé premiers secours', included: false, extraPrice: 8 }
])

// Prix de base en fonction du type de service et de la durée
const basePrice = computed(() => {
  const hourlyRate = (() => {
    switch (formData.value.serviceType) {
      case 'home':
        return 25
      case 'school':
        return 20
      case 'activities':
        return 22
      case 'pickup':
        return 18
      default:
        return 0
    }
  })()
  
  return hourlyRate * formData.value.duration
})

// Multiplicateur en fonction du nombre d'enfants
const childrenMultiplier = computed(() => {
  const childCount = parseInt(formData.value.childCount) || 1
  if (childCount === 1) return 1
  if (childCount === 2) return 1.5
  if (childCount === 3) return 1.8
  return 2 // Pour 4 enfants ou plus
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
  return (basePrice.value * childrenMultiplier.value) + extraServicesPrice.value
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
      formData.value.homeAddress = `Position actuelle (${position.coords.latitude}, ${position.coords.longitude})`
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

// Formatter le type de service
const formatServiceType = (type) => {
  const serviceTypes = {
    'home': 'Garde à domicile',
    'school': 'Accompagnement école',
    'activities': 'Accompagnement activités',
    'pickup': 'Récupération à l\'école'
  }
  
  return serviceTypes[type] || type
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
      service_type: 'garde enfant',
      latitude,
      longitude
    }
    
    const orderResponse = await createOrder(orderData)
    
    if (!orderResponse) {
      throw new Error('Erreur lors de la création de la commande')
    }
    
    // Déterminer la destination en fonction du type de service
    let destination = ''
    if (formData.value.serviceType === 'home') {
      destination = formData.value.homeAddress
    } else if (formData.value.serviceType === 'pickup' || formData.value.serviceType === 'school' || formData.value.serviceType === 'activities') {
      destination = formData.value.destination
    }
    
    // Créer le service de garde d'enfant associé
    const childAssistanceData = {
      order_id: orderResponse.id,
      guardian_name: 'En attente d\'assignation', // Sera assigné par le système
      child_count: parseInt(formData.value.childCount),
      destination
    }
    
    await createChildAssistance(childAssistanceData)
    
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