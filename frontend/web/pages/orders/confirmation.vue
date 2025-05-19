<template>
  <div class="container max-w-3xl px-4 py-12 mx-auto">
    <div class="p-8 text-center rounded-lg shadow-sm bg-card">
      <!-- Icône de succès -->
      <div class="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full">
        <LucideCheckCircle class="w-10 h-10 text-green-600" />
      </div>
      
      <h1 class="mb-3 text-2xl font-bold">Commande confirmée !</h1>
      <p class="mb-6 text-muted-foreground">
        Votre commande a été enregistrée avec succès. Un email de confirmation a été envoyé à {{ userEmail }}.
      </p>
      
      <!-- Détails de la commande -->
      <div class="p-6 mb-6 text-left rounded-lg bg-muted">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold">Détails de la commande</h2>
          <span class="text-sm font-medium">Référence : {{ orderRef }}</span>
        </div>
        
        <div class="space-y-4">
          <div class="flex justify-between">
            <div>
              <h3 class="font-medium">{{ orderDetails.service }}</h3>
              <p class="text-sm text-muted-foreground">{{ formatDate(orderDetails.scheduledDate) }}</p>
            </div>
            <p class="font-medium">{{ formatPrice(orderDetails.price) }}</p>
          </div>
          
          <div v-if="orderDetails.options && orderDetails.options.length > 0">
            <h3 class="mb-2 text-sm font-medium">Options supplémentaires :</h3>
            <div v-for="option in orderDetails.options" :key="option.id" class="flex justify-between text-sm">
              <span>{{ option.name }}</span>
              <span>{{ formatPrice(option.price) }}</span>
            </div>
          </div>
          
          <div class="pt-3 mt-3 border-t border-border">
            <div class="flex justify-between font-semibold">
              <span>Total</span>
              <span>{{ formatPrice(orderDetails.totalPrice) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Prochaines étapes -->
      <div class="p-6 mb-6 text-left rounded-lg bg-primary/5">
        <h2 class="mb-3 font-semibold">Prochaines étapes</h2>
        <ul class="space-y-3">
          <li class="flex items-start">
            <LucideCheck class="mr-2 h-4 w-4 mt-0.5 text-green-600" />
            <span>Vous recevrez un email de confirmation avec les détails de votre commande.</span>
          </li>
          <li class="flex items-start">
            <LucideUser class="mr-2 h-4 w-4 mt-0.5 text-primary" />
            <span>Un prestataire sera assigné à votre commande et vous serez notifié.</span>
          </li>
          <li class="flex items-start">
            <LucideMapPin class="mr-2 h-4 w-4 mt-0.5 text-primary" />
            <span>Vous pourrez suivre en temps réel le prestataire le jour de votre prestation.</span>
          </li>
          <li class="flex items-start">
            <LucideStar class="mr-2 h-4 w-4 mt-0.5 text-primary" />
            <span>Après la prestation, vous pourrez évaluer le service reçu.</span>
          </li>
        </ul>
      </div>
      
      <!-- Actions -->
      <NuxtLink to="/orders">
        <Button>
          <LucideClipboard class="w-4 h-4 mr-2" />
          Voir mes commandes
        </Button>
      </NuxtLink>
      <NuxtLink to="/services">
        <Button variant="outline">
          <LucideShoppingBag class="w-4 h-4 mr-2" />
          Commander un autre service
        </Button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { 
  LucideCheckCircle, 
  LucideCheck, 
  LucideUser, 
  LucideMapPin, 
  LucideStar, 
  LucideClipboard, 
  LucideShoppingBag 
} from 'lucide-vue-next'

// Données simulées
const userEmail = ref('jean.dupont@exemple.com')
const orderRef = ref('QS-8901')

// Détails de la commande (simulés)
const orderDetails = ref({
  service: 'Nettoyage de Véhicule',
  scheduledDate: '2024-03-25T14:00:00',
  price: 49.99,
  options: [
    {
      id: 'premium-wax',
      name: 'Cire Premium',
      price: 19.99
    },
    {
      id: 'leather-treatment',
      name: 'Traitement du cuir',
      price: 14.99
    }
  ],
  totalPrice: 84.97
})

// Formater la date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Intl.DateTimeFormat('fr-FR', options).format(date)
}

// Formater le prix
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(price)
}
</script>