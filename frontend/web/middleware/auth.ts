// Middleware d'authentification
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Routes qui ne nécessitent pas d'authentification
  const publicRoutes = ['/', '/auth', '/services', '/about', '/faq']
  
  // Vérifier si la route est publique ou si elle commence par une route publique
  const isPublicRoute = publicRoutes.some(route => 
    to.path === route || to.path.startsWith(`${route}/`)
  )
  
  const authStore = useAuthStore()
  
  // Initialiser le store d'authentification
  if (!authStore.isAuthenticated) {
    await authStore.initialize()
  }
  
  // Si la route n'est pas publique et que l'utilisateur n'est pas authentifié
  if (!isPublicRoute && !authStore.isAuthenticated) {
    return navigateTo({
      path: '/auth',
      query: { redirect: to.fullPath }
    })
  }
  
  // Si la route est /auth et que l'utilisateur est déjà authentifié, rediriger vers le dashboard
  if (to.path === '/auth' && authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})