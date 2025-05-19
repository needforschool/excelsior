// Utilitaire pour gérer les appels d'API dans les composables
import { useApi } from '~/lib/api'
import { User } from '~/services/user'

export const useUserApi = () => {
  const api = useApi()
  const { getCurrentUser, getUserById } = useUserService()
  
  /**
   * Hook pour récupérer l'utilisateur courant
   */
  const useFetchCurrentUser = () => {
    const currentUser = ref<User | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchUser = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await getCurrentUser()
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          currentUser.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchUser()
    })
    
    return { currentUser, loading, error, refresh: fetchUser }
  }
  
  /**
   * Hook pour récupérer un utilisateur par ID
   */
  const useFetchUser = (userId: number) => {
    const user = ref<User | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchUser = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await getUserById(userId)
        if (response.error) {
          error.value = response.error
        } else if (response.data) {
          user.value = response.data
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchUser()
    })
    
    return { user, loading, error, refresh: fetchUser }
  }
  
  return {
    useFetchCurrentUser,
    useFetchUser
  }
}