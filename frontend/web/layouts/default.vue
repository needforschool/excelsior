<template>
  <div class="flex flex-col min-h-screen bg-background">
    <header class="border-b bg-card">
      <div class="container flex items-center justify-between px-4 py-4 mx-auto">
        <NuxtLink to="/" class="flex items-center text-xl font-bold text-primary">
          <LucideTruck class="w-6 h-6 mr-2" />
          QuickServe
        </NuxtLink>
        
        <nav class="hidden space-x-6 md:flex">
          <NuxtLink to="/services" class="text-foreground hover:text-primary">Services</NuxtLink>
          <NuxtLink v-if="authStore.isAuthenticated" to="/dashboard" class="text-foreground hover:text-primary">Dashboard</NuxtLink>
          <NuxtLink v-if="authStore.isAuthenticated" to="/orders" class="text-foreground hover:text-primary">Mes commandes</NuxtLink>
          <NuxtLink to="/support" class="text-foreground hover:text-primary">Support</NuxtLink>
        </nav>
        
        <div class="flex items-center gap-4">
          <!-- Navigation buttons for unauthenticated users -->
          <NuxtLink v-if="!authStore.isAuthenticated" to="/auth">
            <Button variant="outline">Se connecter</Button>
          </NuxtLink>
          <NuxtLink v-if="!authStore.isAuthenticated" to="/auth?register=true">
            <Button>S'inscrire</Button>
          </NuxtLink>
          
          <!-- User profile dropdown -->
          <div v-else class="relative">
            <Button 
              variant="ghost" 
              @click="menuOpen = !menuOpen" 
              class="flex items-center gap-2 menuButton"
            >
              <div v-if="authStore.user" class="flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full bg-primary/10">
                {{ userInitials }}
              </div>
            </Button>
            
            <!-- Menu dropdown -->
            <div v-if="menuOpen" class="absolute right-0 z-10 w-48 py-1 mt-2 rounded-md shadow-lg bg-card">
              <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                <div class="flex items-center">
                  <LucideUser class="w-4 h-4 mr-2" />
                  Mon profil
                </div>
              </NuxtLink>
              <NuxtLink to="/orders" class="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                <div class="flex items-center">
                  <LucideClipboard class="w-4 h-4 mr-2" />
                  Mes commandes
                </div>
              </NuxtLink>
              <NuxtLink to="/dashboard" class="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                <div class="flex items-center">
                  <LucideLayoutDashboard class="w-4 h-4 mr-2" />
                  Tableau de bord
                </div>
              </NuxtLink>
              <button @click="logout" class="block w-full px-4 py-2 text-sm text-left text-destructive hover:bg-accent">
                <div class="flex items-center">
                  <LucideLogOut class="w-4 h-4 mr-2" />
                  Se déconnecter
                </div>
              </button>
            </div>
          </div>
          
          <!-- Mobile menu button -->
          <Button variant="ghost" size="sm" class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
            <LucideMenu class="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="border-t md:hidden border-border">
        <div class="container px-4 py-3 mx-auto space-y-1">
          <NuxtLink to="/services" class="block px-3 py-2 rounded-md hover:bg-muted">Services</NuxtLink>
          <NuxtLink v-if="authStore.isAuthenticated" to="/dashboard" class="block px-3 py-2 rounded-md hover:bg-muted">Dashboard</NuxtLink>
          <NuxtLink v-if="authStore.isAuthenticated" to="/orders" class="block px-3 py-2 rounded-md hover:bg-muted">Mes commandes</NuxtLink>
          <NuxtLink to="/support" class="block px-3 py-2 rounded-md hover:bg-muted">Support</NuxtLink>
          
          <div v-if="authStore.isAuthenticated" class="pt-2 mt-2 border-t border-border">
            <NuxtLink to="/profile" class="block px-3 py-2 rounded-md hover:bg-muted">Mon profil</NuxtLink>
            <button @click="logout" class="block w-full px-3 py-2 text-left rounded-md text-destructive hover:bg-muted">
              Se déconnecter
            </button>
          </div>
          
          <div v-else class="pt-2 mt-2 border-t border-border">
            <NuxtLink to="/auth" class="block px-3 py-2 rounded-md hover:bg-muted">Se connecter</NuxtLink>
            <NuxtLink to="/auth?register=true" class="block px-3 py-2 rounded-md hover:bg-muted">S'inscrire</NuxtLink>
          </div>
        </div>
      </div>
    </header>
    
    <main class="flex-grow">
      <slot />
    </main>
    
    <footer class="py-8 bg-muted">
      <div class="container px-4 mx-auto">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 class="mb-4 text-lg font-semibold">QuickServe</h3>
            <p class="mb-4 text-sm text-muted-foreground">
              Services à la demande, rapidité garantie : transport, livraison, nettoyage, et plus encore.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-muted-foreground hover:text-foreground">
                <LucideFacebook class="w-5 h-5" />
              </a>
              <a href="#" class="text-muted-foreground hover:text-foreground">
                <LucideTwitter class="w-5 h-5" />
              </a>
              <a href="#" class="text-muted-foreground hover:text-foreground">
                <LucideInstagram class="w-5 h-5" />
              </a>
              <a href="#" class="text-muted-foreground hover:text-foreground">
                <LucideLinkedin class="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 class="mb-4 text-lg font-semibold">Services</h3>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/services?category=transport" class="text-muted-foreground hover:text-foreground">Transport et Livraison</NuxtLink></li>
              <li><NuxtLink to="/services?category=cleaning" class="text-muted-foreground hover:text-foreground">Nettoyage Véhicule</NuxtLink></li>
              <li><NuxtLink to="/services?category=moving" class="text-muted-foreground hover:text-foreground">Déménagement</NuxtLink></li>
              <li><NuxtLink to="/services?category=repair" class="text-muted-foreground hover:text-foreground">Dépannage Auto</NuxtLink></li>
              <li><NuxtLink to="/services?category=childcare" class="text-muted-foreground hover:text-foreground">Garde d'Enfants</NuxtLink></li>
            </ul>
          </div>
          
          <div>
            <h3 class="mb-4 text-lg font-semibold">Informations</h3>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/about" class="text-muted-foreground hover:text-foreground">À propos</NuxtLink></li>
              <li><NuxtLink to="/careers" class="text-muted-foreground hover:text-foreground">Carrières</NuxtLink></li>
              <li><NuxtLink to="/become-provider" class="text-muted-foreground hover:text-foreground">Devenir prestataire</NuxtLink></li>
              <li><NuxtLink to="/faq" class="text-muted-foreground hover:text-foreground">FAQ</NuxtLink></li>
              <li><NuxtLink to="/blog" class="text-muted-foreground hover:text-foreground">Blog</NuxtLink></li>
            </ul>
          </div>
          
          <div>
            <h3 class="mb-4 text-lg font-semibold">Contact</h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-start">
                <LucideMapPin class="w-5 h-5 mr-2 text-muted-foreground" />
                <span class="text-muted-foreground">123 Rue de Paris, 75001 Paris</span>
              </li>
              <li class="flex items-start">
                <LucidePhone class="w-5 h-5 mr-2 text-muted-foreground" />
                <span class="text-muted-foreground">01 23 45 67 89</span>
              </li>
              <li class="flex items-start">
                <LucideMail class="w-5 h-5 mr-2 text-muted-foreground" />
                <span class="text-muted-foreground">contact@quickserve.fr</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="flex flex-col items-center justify-between pt-8 mt-8 border-t border-border md:flex-row">
          <p class="text-sm text-muted-foreground">© 2024 QuickServe. Tous droits réservés.</p>
          <div class="flex mt-4 space-x-6 md:mt-0">
            <NuxtLink to="/terms" class="text-sm text-muted-foreground hover:text-foreground">Conditions d'utilisation</NuxtLink>
            <NuxtLink to="/privacy" class="text-sm text-muted-foreground hover:text-foreground">Politique de confidentialité</NuxtLink>
            <NuxtLink to="/cookies" class="text-sm text-muted-foreground hover:text-foreground">Politique de cookies</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { 
  LucideTruck,
  LucideUser,
  LucideClipboard,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMenu,
  LucideFacebook,
  LucideTwitter,
  LucideInstagram,
  LucideLinkedin,
  LucideMapPin,
  LucidePhone,
  LucideMail
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const menuOpen = ref(false)
const mobileMenuOpen = ref(false)

// Calcul des initiales de l'utilisateur avec vérification supplémentaire
const userInitials = computed(() => {
  // Vérifiez si l'utilisateur et ses noms existent
  if (!authStore.user || !authStore.user.firstName) return ''
  
  const firstInitial = authStore.user.firstName ? authStore.user.firstName[0] : ''
  const lastInitial = authStore.user.lastName ? authStore.user.lastName[0] : ''
  
  return (firstInitial + lastInitial).toUpperCase()
})

// Fermer le menu déroulant quand on clique n'importe où ailleurs
const handleClickOutside = (event) => {
  if (menuOpen.value && !event.target.closest('.menuButton')) {
    menuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Fonction de déconnexion
const logout = () => {
  authStore.logout()
  menuOpen.value = false
  mobileMenuOpen.value = false
  router.push('/')
}
</script>