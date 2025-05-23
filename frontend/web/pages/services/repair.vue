<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Commander un service de dépannage</h1>
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
          <h2 class="mb-4 text-xl font-semibold">Informations de dépannage</h2>
          
          <form @submit.prevent="submitOrder" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label for="issueType">Type de problème</Label>
                <Select v-model="formData.issueType" class="w-full mt-1" required>
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="batterie">Problème de batterie</option>
                  <option value="pneu">Problème de pneu</option>
                  <option value="moteur">Problème de moteur</option>
                  <option value="autre">Autre problème</option>
                </Select>
              </div>
              
              <div>
                <Label for="urgency">Niveau d'urgence</Label>
                <Select v-model="formData.urgency" class="w-full mt-1" required>
                  <option value="" disabled>Sélectionnez un niveau</option>
                  <option value="low">Faible - Dans les 24h</option>
                  <option value="medium">Moyen - Dans les 3h</option>
                  <option value="high">Élevé - Immédiat</option>
                </Select>
              </div>
            </div>
            
            <div v-if="formData.issueType === 'autre'">
              <Label for="otherIssueDescription">Description du problème</Label>
              <Textarea 
                id="otherIssueDescription" 
                v-model="formData.otherIssueDescription"
                placeholder="Décrivez votre problème en détail"
                class="mt-1"
                rows="3"
                required
              />
            </div>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label for="vehicleType">Type de véhicule</Label>
                <Select v-model="formData.vehicleType" class="w-full mt-1" required>
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="car">Voiture</option>
                  <option value="motorcycle">Moto</option>
                  <option value="van">Utilitaire</option>
                  <option value="truck">Camion</option>
                </Select>
              </div>
              
              <div>
                <Label for="vehicleModel">Modèle du véhicule</Label>
                <Input 
                  id="vehicleModel" 
                  v-model="formData.vehicleModel"
                  placeholder="Ex: Renault Clio 2018"
                  class="mt-1"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label for="location">Adresse du dépannage</Label>
              <Textarea 
                id="location" 
                v-model="formData.location"
                placeholder="Entrez l'adresse où vous vous trouvez"
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
              <Label for="specialInstructions">Instructions spéciales</Label>
              <Textarea 
                id="specialInstructions" 
                v-model="formData.specialInstructions"
                placeholder="Instructions particulières pour le technicien"
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
              <span class="font-medium">Dépannage automobile</span>
            </div>
            
            <div v-if="formData.issueType" class="flex items-center justify-between">
              <span class="text-sm">Type de problème</span>
              <span class="font-medium">{{ formatIssueType(formData.issueType) }}</span>
            </div>
            
            <div v-if="formData.urgency" class="flex items-center justify-between">
              <span class="text-sm">Niveau d'urgence</span>
              <span class="font-medium">{{ formatUrgency(formData.urgency) }}</span>
            </div>
            
            <div v-if="formData.vehicleType" class="flex items-center justify-between">
              <span class="text-sm">Type de véhicule</span>
              <span class="font-medium">{{ formatVehicleType(formData.vehicleType) }}</span>
            </div>
          </div>
          
          <div class="pt-4 mt-4 border-t border-muted">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm">Prix de base</span>
              <span class="font-medium">{{ formatPrice(basePrice) }}</span>
            </div>
            
            <div v-if="urgencyFee > 0" class="flex items-center justify-between mb-2">
              <span class="text-sm">Frais d'urgence</span>
              <span class="font-medium">{{ formatPrice(urgencyFee) }}</span>
            </div>
            
            <div class="flex items-center justify-between pt-2 mt-2 font-semibold border-t border-muted">
              <span>Total estimé</span>
              <span>{{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
          
          <p class="mt-4 text-xs text-center text-muted-foreground">
            Le prix final peut varier en fonction de la complexité réelle du problème et des pièces nécessaires.
          </p>
        </div>
        
        <!-- Avantages du service -->
        <div class="p-6 mt-6 rounded-lg shadow-sm bg-muted">
          <h3 class="mb-3 font-semibold">Pourquoi choisir notre service de dépannage ?</h3>
          <ul class="space-y-2">
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Intervention rapide en moins de 30 minutes</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Techniciens certifiés et qualifiés</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Diagnostic précis et transparent</span>
            </li>
            <li class="flex items-start">
              <LucideCheck class="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span class="text-sm">Suivi en temps réel de l'intervention</span>
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
import { useRepair } from '~/composables/repair'
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
const { createRepair } = useRepair()

// Vérifier si l'utilisateur est connecté
onMounted(() => {
  if (!authStore.isAuthenticated) {
    toast({
      title: "Authentification requise",
      description: "Vous devez être connecté pour commander un service",
      variant: "destructive",
    })
    router.push('/auth?redirect=/services/repair')
  }
})

// État de chargement et d'erreur
const loading = ref(false)
const error = ref(null)

// Données du formulaire
const formData = ref({
  issueType: '',
  urgency: '',
  otherIssueDescription: '',
  vehicleType: '',
  vehicleModel: '',
  location: '',
  specialInstructions: ''
})

// Prix de base en fonction du type de problème
const basePrice = computed(() => {
  switch (formData.value.issueType) {
    case 'batterie':
      return 59.99
    case 'pneu':
      return 49.99
    case 'moteur':
      return 89.99
    case 'autre':
      return 69.99
    default:
      return 0
  }
})

// Frais supplémentaires en fonction de l'urgence
const urgencyFee = computed(() => {
  switch (formData.value.urgency) {
    case 'low':
      return 0
    case 'medium':
      return 15
    case 'high':
      return 30
    default:
      return 0
  }
})

// Prix total estimé
const totalPrice = computed(() => {
  return basePrice.value + urgencyFee.value
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
      formData.value.location = `Position actuelle (${position.coords.latitude}, ${position.coords.longitude})`
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

// Formatter le type de problème
const formatIssueType = (type) => {
  const issueTypes = {
    'batterie': 'Problème de batterie',
    'pneu': 'Problème de pneu',
    'moteur': 'Problème de moteur',
    'autre': 'Autre problème'
  }
  
  return issueTypes[type] || type
}

// Formatter le niveau d'urgence
const formatUrgency = (urgency) => {
  const urgencyLevels = {
    'low': 'Faible - Dans les 24h',
    'medium': 'Moyen - Dans les 3h',
    'high': 'Élevé - Immédiat'
  }
  
  return urgencyLevels[urgency] || urgency
}

// Formatter le type de véhicule
const formatVehicleType = (type) => {
  const vehicleTypes = {
    'car': 'Voiture',
    'motorcycle': 'Moto',
    'van': 'Utilitaire',
    'truck': 'Camion'
  }
  
  return vehicleTypes[type] || type
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
      service_type: 'dépannage',
      latitude,
      longitude
    }
    
    const orderResponse = await createOrder(orderData)
    
    if (!orderResponse) {
      throw new Error('Erreur lors de la création de la commande')
    }
    
    // Créer le service de dépannage associé
    const repairData = {
      order_id: orderResponse.id,
      issue_type: formData.value.issueType,
      technician_name: null // Sera assigné par le système
    }
    
    await createRepair(repairData)
    
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