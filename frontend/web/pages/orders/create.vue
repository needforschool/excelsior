<template>
  <div class="container px-4 py-6 mx-auto">
    <div class="max-w-2xl mx-auto">
      <h1 class="mb-6 text-2xl font-bold">Créer une nouvelle commande</h1>
      
      <!-- Message d'erreur -->
      <div v-if="error" class="p-4 mb-6 rounded-md bg-destructive/10 text-destructive">
        {{ error }}
      </div>
      
      <form @submit.prevent="submitOrder" class="p-6 rounded-lg shadow-sm bg-card">
        <div class="space-y-4">
          <div>
            <Label for="service_type">Type de service</Label>
            <Select 
              id="service_type" 
              v-model="formData.service_type"
              class="w-full mt-1"
              required
            >
              <option value="" disabled>Sélectionnez un service</option>
              <option value="transport">Transport et Livraison</option>
              <option value="nettoyage">Nettoyage Véhicule</option>
              <option value="déménagement">Déménagement</option>
              <option value="dépannage">Dépannage Auto</option>
              <option value="garde enfant">Garde d'Enfants</option>
            </Select>
          </div>
          
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label for="latitude">Latitude</Label>
              <Input 
                id="latitude" 
                v-model="formData.latitude"
                type="number"
                step="0.000001"
                placeholder="Exemple: 48.856614"
                class="mt-1"
                required
              />
            </div>
            <div>
              <Label for="longitude">Longitude</Label>
              <Input 
                id="longitude" 
                v-model="formData.longitude"
                type="number"
                step="0.000001"
                placeholder="Exemple: 2.352222"
                class="mt-1"
                required
              />
            </div>
          </div>
          
          <div>
            <Button 
              type="button" 
              variant="outline" 
              class="w-full"
              @click="useCurrentLocation"
            >
              <LucideMapPin class="w-4 h-4 mr-2" />
              Utiliser ma position actuelle
            </Button>
          </div>
          
          <!-- Note: Dans une application réelle, vous pourriez intégrer une carte pour sélectionner l'emplacement -->
          
          <div class="pt-4 mt-4 border-t border-muted">
            <Button 
              type="submit" 
              class="w-full"
              :disabled="loading"
            >
              <LucideLoader v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              Créer la commande
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast/use-toast'
import { useOrder } from '~/composables/order'
import { useAuthStore } from '~/stores/auth'
import { 
  LucideMapPin,
  LucideLoader
} from 'lucide-vue-next'

const router = useRouter()
const { toast } = useToast()
const { createOrder } = useOrder()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)

// Vérification de l'authentification
onMounted(() => {
  if (!authStore.isAuthenticated) {
    toast({
      title: "Authentification requise",
      description: "Vous devez être connecté pour créer une commande",
      variant: "destructive",
    })
    router.push('/auth?redirect=/orders/create')
  }
})

// Données du formulaire
const formData = ref({
  service_type: '',
  latitude: '',
  longitude: ''
})

// Utiliser la position actuelle (géolocalisation)
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
      formData.value.latitude = position.coords.latitude
      formData.value.longitude = position.coords.longitude
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

// Soumettre la commande
const submitOrder = async () => {
  // Vérifier si l'utilisateur est connecté
  if (!authStore.isAuthenticated) {
    error.value = 'Vous devez être connecté pour créer une commande'
    return
  }
  
  // Validation des données
  if (!formData.value.service_type) {
    error.value = 'Veuillez sélectionner un type de service'
    return
  }
  
  if (!formData.value.latitude || !formData.value.longitude) {
    error.value = 'Veuillez fournir des coordonnées valides'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // Créer la commande - on n'utilise pas user_id, l'API va l'identifier par le token
    const orderData = {
      service_type: formData.value.service_type,
      latitude: parseFloat(formData.value.latitude),
      longitude: parseFloat(formData.value.longitude)
    }
    
    const newOrder = await createOrder(orderData)
    
    if (newOrder) {
      toast({
        title: "Succès",
        description: "Commande créée avec succès",
      })
      // Rediriger vers la page de détail de la commande
      router.push(`/orders/${newOrder.id}`)
    } else {
      error.value = 'Erreur lors de la création de la commande'
    }
  } catch (err) {
    console.error('Erreur lors de la création de la commande', err)
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>