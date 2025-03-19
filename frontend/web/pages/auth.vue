<template>
  <div class="flex items-center justify-center min-h-screen p-4 bg-background">
    <div class="w-full max-w-md">
      <div class="p-8 rounded-lg shadow-sm bg-card">
        <h2 class="mb-6 text-2xl font-bold text-center">{{ isRegistering ? 'Inscription' : 'Connexion' }}</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="isRegistering" class="space-y-2">
            <Label for="name">Nom complet</Label>
            <Input 
              id="name" 
              v-model="form.name" 
              placeholder="Votre nom"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              v-model="form.email" 
              placeholder="exemple@email.com"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="password">Mot de passe</Label>
            <Input 
              id="password" 
              type="password" 
              v-model="form.password" 
              placeholder="••••••••"
            />
          </div>
          
          <div v-if="isRegistering" class="space-y-2">
            <Label for="role">Type de compte</Label>
            <select 
              id="role" 
              v-model="form.role" 
              class="w-full p-2 border rounded-md bg-background"
            >
              <option value="client">Client</option>
              <option value="prestataire">Prestataire</option>
            </select>
          </div>
          
          <Button type="submit" class="w-full">
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
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const route = useRoute()
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
})

const toggleAuthMode = () => {
  isRegistering.value = !isRegistering.value
}

const handleSubmit = async () => {
  // Logique d'authentification ici
  console.log('Form submitted:', form.value)
}
</script>