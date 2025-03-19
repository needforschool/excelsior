<template>
  <div class="container px-4 py-6 mx-auto">
    <h1 class="mb-6 text-2xl font-bold">Mon profil</h1>
    
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Informations personnelles -->
      <div class="lg:col-span-2">
        <div class="p-6 rounded-lg shadow-sm bg-card">
          <h2 class="mb-4 text-xl font-semibold">Informations personnelles</h2>
          
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label for="firstName">Prénom</Label>
                <Input 
                  id="firstName" 
                  v-model="profileForm.firstName"
                  placeholder="Votre prénom"
                  class="mt-1"
                />
              </div>
              <div>
                <Label for="lastName">Nom</Label>
                <Input 
                  id="lastName" 
                  v-model="profileForm.lastName"
                  placeholder="Votre nom"
                  class="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label for="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                v-model="profileForm.email"
                placeholder="exemple@email.com"
                class="mt-1"
                disabled
              />
              <p class="mt-1 text-xs text-muted-foreground">L'email ne peut pas être modifié. Contactez le support pour changer votre adresse email.</p>
            </div>
            
            <div>
              <Label for="phone">Téléphone</Label>
              <Input 
                id="phone" 
                v-model="profileForm.phone"
                placeholder="06 12 34 56 78"
                class="mt-1"
              />
            </div>
            
            <div>
              <Label for="address">Adresse</Label>
              <Textarea 
                id="address" 
                v-model="profileForm.address"
                placeholder="Votre adresse complète"
                class="mt-1"
                rows="3"
              />
            </div>
            
            <div class="flex justify-end">
              <Button type="submit" :disabled="isUpdating">
                <LucideLoader v-if="isUpdating" class="w-4 h-4 mr-2 animate-spin" />
                Mettre à jour
              </Button>
            </div>
          </form>
        </div>
        
        <!-- Préférences de notifications -->
        <div class="p-6 mt-6 rounded-lg shadow-sm bg-card">
          <h2 class="mb-4 text-xl font-semibold">Préférences de notifications</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Notifications par email</h3>
                <p class="text-sm text-muted-foreground">Recevez des emails pour les mises à jour importantes</p>
              </div>
              <Switch v-model="notifications.email" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Notifications push</h3>
                <p class="text-sm text-muted-foreground">Recevez des notifications sur votre appareil</p>
              </div>
              <Switch v-model="notifications.push" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">SMS</h3>
                <p class="text-sm text-muted-foreground">Recevez des SMS pour les alertes urgentes</p>
              </div>
              <Switch v-model="notifications.sms" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Newsletter</h3>
                <p class="text-sm text-muted-foreground">Recevez nos offres et actualités</p>
              </div>
              <Switch v-model="notifications.newsletter" />
            </div>
          </div>
          
          <div class="flex justify-end mt-4">
            <Button variant="outline" @click="saveNotificationPreferences" :disabled="isSavingNotifications">
              <LucideLoader v-if="isSavingNotifications" class="w-4 h-4 mr-2 animate-spin" />
              Enregistrer les préférences
            </Button>
          </div>
        </div>
      </div>
      
      <!-- Sécurité et paiement -->
      <div>
        <!-- Photo de profil -->
        <div class="p-6 text-center rounded-lg shadow-sm bg-card">
          <div class="relative w-24 h-24 mx-auto mb-4 rounded-full bg-muted">
            <div v-if="profileForm.avatar" class="w-full h-full overflow-hidden rounded-full">
              <img :src="profileForm.avatar" alt="Avatar" class="object-cover w-full h-full" />
            </div>
            <div v-else class="flex items-center justify-center w-full h-full text-3xl font-semibold rounded-full">
              {{ userInitials }}
            </div>
            <Button variant="outline" size="sm" class="absolute bottom-0 right-0 w-8 h-8 p-0 rounded-full">
              <LucidePencil class="w-4 h-4" />
            </Button>
          </div>
          <h3 class="text-lg font-semibold">{{ profileForm.firstName }} {{ profileForm.lastName }}</h3>
          <p class="text-sm text-muted-foreground">Membre depuis {{ memberSince }}</p>
        </div>
        
        <!-- Sécurité du compte -->
        <div class="p-6 mt-6 rounded-lg shadow-sm bg-card">
          <h2 class="mb-4 text-xl font-semibold">Sécurité du compte</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="font-medium">Changer le mot de passe</h3>
              <p class="text-sm text-muted-foreground">Mettez à jour votre mot de passe pour sécuriser votre compte</p>
              <Button variant="outline" class="w-full mt-2" as="NuxtLink" to="/profile/password">
                <LucideKey class="w-4 h-4 mr-2" />
                Modifier le mot de passe
              </Button>
            </div>
            
            <div>
              <h3 class="font-medium">Authentification à deux facteurs</h3>
              <p class="text-sm text-muted-foreground">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
              <Button variant="outline" class="w-full mt-2" as="NuxtLink" to="/profile/2fa">
                <LucideShield class="w-4 h-4 mr-2" />
                Configurer la 2FA
              </Button>
            </div>
          </div>
        </div>
        
        <!-- Moyens de paiement -->
        <div class="p-6 mt-6 rounded-lg shadow-sm bg-card">
          <h2 class="mb-4 text-xl font-semibold">Moyens de paiement</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 rounded-md bg-muted">
              <div class="flex items-center">
                <LucideCreditCard class="w-5 h-5 mr-3" />
                <div>
                  <p class="font-medium">**** **** **** 4242</p>
                  <p class="text-xs text-muted-foreground">Expire le 12/25</p>
                </div>
              </div>
              <div>
                <Button variant="ghost" size="sm">
                  <LucideTrash2 class="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button variant="outline" class="w-full" as="NuxtLink" to="/profile/payment">
              <LucidePlus class="w-4 h-4 mr-2" />
              Ajouter un moyen de paiement
            </Button>
          </div>
        </div>
        
        <!-- Suppression du compte -->
        <div class="p-6 mt-6 rounded-lg shadow-sm bg-card">
          <h2 class="mb-3 text-xl font-semibold text-destructive">Supprimer mon compte</h2>
          <p class="mb-4 text-sm text-muted-foreground">
            Attention, cette action est irréversible et supprimera toutes vos données.
          </p>
          <Button variant="destructive" @click="showDeleteAccountModal = true">
            <LucideTrash2 class="w-4 h-4 mr-2" />
            Supprimer mon compte
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation pour la suppression du compte -->
    <div v-if="showDeleteAccountModal" class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div class="w-full max-w-md p-6 rounded-lg shadow-lg bg-card">
        <h2 class="mb-4 text-xl font-semibold">Supprimer votre compte</h2>
        <p class="mb-4">Cette action est irréversible. Toutes vos données personnelles, historique de commandes et préférences seront définitivement supprimées.</p>
        
        <div class="mb-4">
          <Label for="confirmDelete">Tapez "SUPPRIMER" pour confirmer</Label>
          <Input 
            id="confirmDelete"
            v-model="deleteConfirmation"
            placeholder="SUPPRIMER"
            class="mt-1"
          />
        </div>
        
        <div class="flex justify-end space-x-3">
          <Button variant="outline" @click="showDeleteAccountModal = false">
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            :disabled="deleteConfirmation !== 'SUPPRIMER' || isDeleting"
            @click="deleteAccount"
          >
            <LucideLoader v-if="isDeleting" class="w-4 h-4 mr-2 animate-spin" />
            Confirmer la suppression
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  LucideLoader, 
  LucidePencil, 
  LucideKey, 
  LucideShield, 
  LucideCreditCard, 
  LucideTrash2, 
  LucidePlus 
} from 'lucide-vue-next'

// État du formulaire de profil
const profileForm = ref({
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@exemple.com',
  phone: '06 12 34 56 78',
  address: '123 Rue de Paris\n75001 Paris',
  avatar: null // URL de l'avatar, null si pas d'avatar
})

// État des préférences de notifications
const notifications = ref({
  email: true,
  push: true,
  sms: false,
  newsletter: true
})

// États pour les actions
const isUpdating = ref(false)
const isSavingNotifications = ref(false)
const showDeleteAccountModal = ref(false)
const deleteConfirmation = ref('')
const isDeleting = ref(false)

// Calcul des initiales de l'utilisateur
const userInitials = computed(() => {
  const firstInitial = profileForm.value.firstName ? profileForm.value.firstName[0] : ''
  const lastInitial = profileForm.value.lastName ? profileForm.value.lastName[0] : ''
  return (firstInitial + lastInitial).toUpperCase()
})

// Date d'inscription formatée
const memberSince = computed(() => {
  // Simulons une date d'inscription
  const date = new Date('2023-05-15')
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date)
})

// Mise à jour du profil
const updateProfile = async () => {
  isUpdating.value = true
  
  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mise à jour réussie
    console.log('Profil mis à jour :', profileForm.value)
    
    // Ici, vous feriez un appel API réel
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil :', error)
  } finally {
    isUpdating.value = false
  }
}

// Enregistrement des préférences de notifications
const saveNotificationPreferences = async () => {
  isSavingNotifications.value = true
  
  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Enregistrement réussi
    console.log('Préférences de notifications enregistrées :', notifications.value)
    
    // Ici, vous feriez un appel API réel
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des préférences :', error)
  } finally {
    isSavingNotifications.value = false
  }
}

// Suppression du compte
const deleteAccount = async () => {
  isDeleting.value = true
  
  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Suppression réussie
    console.log('Compte supprimé')
    
    // Redirection vers la page d'accueil
    // navigateTo('/')
  } catch (error) {
    console.error('Erreur lors de la suppression du compte :', error)
  } finally {
    isDeleting.value = false
    showDeleteAccountModal.value = false
  }
}
</script>