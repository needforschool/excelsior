// Plugin d'initialisation de l'authentification
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Initialisation du store d'authentification
  await authStore.initialize()
})