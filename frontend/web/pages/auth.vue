<template>
  <div class="flex items-center justify-center min-h-screen p-4 bg-background">
    <div class="w-full max-w-md">
      <div class="p-8 rounded-lg shadow-sm bg-card">
        <h2 class="mb-6 text-2xl font-bold text-center">{{ isRegistering ? 'Inscription' : 'Connexion' }}</h2>
        
        <!-- Message d'erreur -->
        <div v-if="authStore.error" class="p-3 mb-4 text-white rounded bg-destructive">
          {{ authStore.error }}
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="isRegistering" class="space-y-2">
            <Label for="name">Nom complet</Label>
            <Input 
              id="name" 
              v-model="form.name" 
              placeholder="Votre nom"
              required
              :disabled="authStore.loading"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              v-model="form.email" 
              placeholder="exemple@email.com"
              required
              :disabled="authStore.loading"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="password">Mot de passe</Label>
            <Input 
              id="password" 
              type="password" 
              v-model="form.password" 
              placeholder="••••••••"
              required
              :disabled="authStore.loading"
            />
          </div>
          
          <div v-if="isRegistering" class="space-y-2">
            <Label for="role">Type de compte</Label>
            <select 
              id="role" 
              v-model="form.role" 
              class="w-full p-2 border rounded-md bg-background"
              required
              :disabled="authStore.loading"
            >
              <option value="client">Client</option>
              <option value="prestataire">Prestataire</option>
            </select>
          </div>
          
          <Button type="submit" class="w-full" :disabled="authStore.loading">
            <LucideLoader v-if="authStore.loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ isRegistering ? 'S\'inscrire' : 'Se connecter' }}
          </Button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-muted-foreground">
            {{ isRegistering ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}
            <a @click="toggleAuthMode" class="cursor-pointer text-primary hover:underline">
              {{ isRegistering ? 'Se connecter' : 'S\'inscrire' }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LucideLoader } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isRegistering = ref(false)

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'client'
})

// Vérifier si l'utilisateur est redirigé vers la page d'inscription
onMounted(() => {
  isRegistering.value = route.query.register === 'true'
  
  // Récupérer l'URL de redirection s'il y en a une
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
  if (redirect) {
    redirectUrl.value = redirect
  }
})

const redirectUrl = ref('/dashboard')

const toggleAuthMode = () => {
  isRegistering.value = !isRegistering.value
  // Réinitialiser le formulaire lors du changement de mode
  form.value.name = ''
  form.value.email = ''
  form.value.password = ''
  form.value.role = 'client'
}

const handleSubmit = async () => {
  let success = false
  
  if (isRegistering.value) {
    // Inscription
    success = await authStore.register(
      form.value.name,
      form.value.email,
      form.value.password,
      form.value.role
    )
  } else {
    // Connexion
    success = await authStore.login(form.value.email, form.value.password)
  }
  
  if (success) {
    // Rediriger vers le dashboard ou l'URL de redirection
    router.push(redirectUrl.value)
  }
}
</script>