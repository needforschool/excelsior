<template>
  <div class="container px-4 py-6 mx-auto">
    
    <h1 class="mb-6 text-2xl font-bold">Tableau de bord prestataire</h1>
    
    <!-- Cartes statistiques -->
    <div class="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
      <div class="p-5 rounded-lg shadow-sm bg-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Services en cours</p>
            <h3 class="mt-1 text-2xl font-bold">{{ stats.activeServices }}</h3>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <LucidePackage class="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
      <div class="p-5 rounded-lg shadow-sm bg-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Services terminés</p>
            <h3 class="mt-1 text-2xl font-bold">{{ stats.completedServices }}</h3>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
            <LucideCheckCircle class="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>
      <div class="p-5 rounded-lg shadow-sm bg-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Revenus du mois</p>
            <h3 class="mt-1 text-2xl font-bold">{{ formatPrice(stats.monthlyEarnings) }}</h3>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
            <LucideCreditCard class="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>
      <div class="p-5 rounded-lg shadow-sm bg-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Note moyenne</p>
            <h3 class="mt-1 text-2xl font-bold">{{ stats.averageRating }}/5</h3>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10">
            <LucideStar class="w-5 h-5 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Demandes de service et disponibilités -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Demandes en attente -->
      <div class="lg:col-span-2">
        <div class="p-5 rounded-lg shadow-sm bg-card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Demandes en attente</h2>
            <Button variant="outline" size="sm" @click="refreshPendingRequests">
              <LucideRefreshCw class="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
          <div class="space-y-3">
            <div v-for="request in pendingRequests" :key="request.id" class="p-3 rounded-md bg-muted">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
                      <component :is="getServiceIconComponent(request.serviceType)" class="w-4 h-4" />
                    </div>
                    <div>
                      <h4 class="text-sm font-medium">{{ request.serviceType }}</h4>
                      <p class="text-xs text-muted-foreground">{{ formatDate(request.date) }}</p>
                      <p class="text-xs text-muted-foreground">{{ request.location }}</p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Button variant="ghost" size="sm" class="text-red-500" @click="rejectRequest(request.id)">
                    <LucideX class="w-4 h-4" />
                  </Button>
                  <Button variant="default" size="sm" @click="acceptRequest(request.id)">
                    <LucideCheck class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div v-if="pendingRequests.length === 0" class="py-6 text-center">
              <p class="text-muted-foreground">Aucune demande en attente</p>
            </div>
          </div>
        </div>
        
        <!-- Services en cours -->
        <div class="p-5 mt-6 rounded-lg shadow-sm bg-card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Services en cours</h2>
            <NuxtLink to="/provider/services" class="text-sm text-primary hover:underline">Voir tous</NuxtLink>
          </div>
          <div class="space-y-3">
            <div v-for="service in activeServices" :key="service.id" class="p-3 rounded-md bg-muted">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
                      <component :is="getServiceIconComponent(service.serviceType)" class="w-4 h-4" />
                    </div>
                    <div>
                      <h4 class="text-sm font-medium">{{ service.serviceType }}</h4>
                      <p class="text-xs text-muted-foreground">{{ formatDate(service.date) }}</p>
                      <p class="text-xs text-muted-foreground">{{ service.clientName }}</p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Button variant="outline" size="sm" @click="updateServiceStatus(service.id, 'en cours')">
                    <LucidePlay class="w-4 h-4 mr-1" />
                    Démarrer
                  </Button>
                  <Button variant="outline" size="sm" @click="updateServiceStatus(service.id, 'terminé')">
                    <LucideCheckCircle class="w-4 h-4 mr-1" />
                    Terminer
                  </Button>
                </div>
              </div>
            </div>
            
            <div v-if="activeServices.length === 0" class="py-6 text-center">
              <p class="text-muted-foreground">Aucun service en cours</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Gestion des disponibilités -->
      <div>
        <div class="p-5 rounded-lg shadow-sm bg-card">
          <h2 class="mb-4 text-lg font-bold">Mes disponibilités</h2>
          
          <div class="mb-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Statut de disponibilité</h3>
                <p class="text-sm text-muted-foreground">Êtes-vous disponible pour de nouveaux services ?</p>
              </div>
              <Switch v-model="availability.isAvailable" />
            </div>
          </div>
          
          <div class="mb-4">
            <h3 class="mb-2 font-medium">Jours disponibles</h3>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="(value, day) in availability.days" :key="day" class="flex items-center">
                <div class="flex items-center h-5">
                  <input
                    :id="day"
                    type="checkbox"
                    v-model="availability.days[day]"
                    class="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label :for="day" class="font-medium">
                    {{ formatDay(day) }}
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <h3 class="mb-2 font-medium">Heures disponibles</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="startTime">Début</Label>
                <Input 
                  id="startTime" 
                  type="time"
                  v-model="availability.hours.start"
                  class="mt-1"
                />
              </div>
              <div>
                <Label for="endTime">Fin</Label>
                <Input 
                  id="endTime" 
                  type="time"
                  v-model="availability.hours.end"
                  class="mt-1"
                />
              </div>
            </div>
          </div>
          
          <Button class="w-full" @click="saveAvailability">
            <LucideSave class="w-4 h-4 mr-2" />
            Enregistrer les disponibilités
          </Button>
        </div>
        
        <!-- Solde et paiement -->
        <div class="p-5 mt-6 rounded-lg shadow-sm bg-card">
          <h2 class="mb-4 text-lg font-bold">Mon solde</h2>
          <div class="p-4 mb-4 rounded-md bg-muted">
            <div class="flex items-center justify-between">
              <p class="text-sm">Solde disponible</p>
              <p class="text-xl font-bold">{{ formatPrice(balance.available) }}</p>
            </div>
            <div class="flex items-center justify-between mt-2">
              <p class="text-sm">En attente</p>
              <p class="text-sm">{{ formatPrice(balance.pending) }}</p>
            </div>
          </div>
          <Button class="w-full" variant="outline">
            <LucideBanknote class="w-4 h-4 mr-2" />
            Retirer vers mon compte bancaire
          </Button>
        </div>
        
        <!-- Notifications -->
        <div class="p-5 mt-6 rounded-lg shadow-sm bg-primary text-primary-foreground">
          <h3 class="mb-2 font-semibold">Notifications</h3>
          <p class="mb-3 text-sm">Vous avez <span class="font-bold">3</span> nouvelles demandes de service potentielles dans votre zone.</p>
          <Button variant="secondary" size="sm">Voir les détails</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'
import { 
  LucidePackage,
  LucideCheckCircle,
  LucideCreditCard,
  LucideStar,
  LucideRefreshCw,
  LucideCheck,
  LucideX,
  LucidePlay,
  LucideSave,
  LucideBanknote,
  LucideTruck,
  LucideSprayCan,
  LucideBox,
  LucideWrench,
  LucideUsers
} from 'lucide-vue-next'

const { toast } = useToast()

// Données simulées de statistiques
const stats = ref({
  activeServices: 3,
  completedServices: 42,
  monthlyEarnings: 1250.75,
  averageRating: 4.7
})

// Données simulées de demandes en attente
const pendingRequests = ref([
  { 
    id: 'REQ-8901', 
    serviceType: 'Transport et Livraison', 
    date: '2024-03-24T14:30:00', 
    location: '15 Rue des Lilas, 75010 Paris',
    clientName: 'Marie Lambert'
  },
  { 
    id: 'REQ-8902', 
    serviceType: 'Nettoyage Véhicule', 
    date: '2024-03-24T16:45:00', 
    location: '27 Avenue Victor Hugo, 75016 Paris',
    clientName: 'Thomas Dubois'
  }
])

// Données simulées de services en cours
const activeServices = ref([
  { 
    id: 'SVC-4567', 
    serviceType: 'Transport et Livraison', 
    date: '2024-03-23T10:15:00', 
    clientName: 'Jean Dupont',
    status: 'accepté'
  },
  { 
    id: 'SVC-4568', 
    serviceType: 'Déménagement', 
    date: '2024-03-24T09:00:00', 
    clientName: 'Sophie Martin',
    status: 'accepté'
  }
])

// Données de disponibilité
const availability = ref({
  isAvailable: true,
  days: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  },
  hours: {
    start: '08:00',
    end: '18:00'
  }
})

// Données de solde
const balance = ref({
  available: 780.25,
  pending: 150.50
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

// Formater le jour de la semaine
const formatDay = (day) => {
  const days = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  }
  
  return days[day] || day
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
  
  return iconMap[serviceType] || LucidePackage
}

// Actualiser les demandes en attente
const refreshPendingRequests = () => {
  // Simulation d'une requête API
  toast({
    title: "Actualisé",
    description: "Les demandes en attente ont été actualisées",
  })
}

// Accepter une demande
const acceptRequest = (requestId) => {
  // Simulation d'une requête API
  pendingRequests.value = pendingRequests.value.filter(req => req.id !== requestId)
  
  // Ajouter à la liste des services actifs
  const request = pendingRequests.value.find(req => req.id === requestId)
  if (request) {
    activeServices.value.push({
      id: `SVC-${Math.floor(Math.random() * 1000)}`,
      serviceType: request.serviceType,
      date: request.date,
      clientName: request.clientName,
      status: 'accepté'
    })
  }
  
  toast({
    title: "Demande acceptée",
    description: `Vous avez accepté la demande ${requestId}`,
  })
}

// Rejeter une demande
const rejectRequest = (requestId) => {
  // Simulation d'une requête API
  pendingRequests.value = pendingRequests.value.filter(req => req.id !== requestId)
  
  toast({
    title: "Demande rejetée",
    description: `Vous avez rejeté la demande ${requestId}`,
  })
}

// Mettre à jour le statut d'un service
const updateServiceStatus = (serviceId, status) => {
  // Simulation d'une requête API
  const service = activeServices.value.find(svc => svc.id === serviceId)
  if (service) {
    service.status = status
    
    // Si le service est terminé, le retirer de la liste des services actifs
    if (status === 'terminé') {
      activeServices.value = activeServices.value.filter(svc => svc.id !== serviceId)
      stats.value.activeServices--
      stats.value.completedServices++
    }
  }
  
  toast({
    title: "Statut mis à jour",
    description: `Le statut du service ${serviceId} a été mis à jour`,
  })
}

// Enregistrer les disponibilités
const saveAvailability = () => {
  // Simulation d'une requête API
  toast({
    title: "Disponibilités enregistrées",
    description: "Vos disponibilités ont été mises à jour avec succès",
  })
}
</script>