// Interface pour le composant utilisateur
<template>
  <div class="inline-flex items-center">
    <div 
      v-if="user"
      class="flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full"
      :class="[
        size === 'small' ? 'w-6 h-6 text-xs' : (size === 'large' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm'),
        withBorder ? 'border border-border' : '',
        avatar ? 'bg-transparent' : 'bg-primary/10'
      ]"
    >
      <img 
        v-if="avatar" 
        :src="avatar" 
        :alt="user.name" 
        class="object-cover w-full h-full rounded-full" 
      />
      <span v-else>{{ userInitials }}</span>
    </div>
    
    <div v-if="showName && user" :class="size === 'small' ? 'ml-1.5' : 'ml-2'">
      <p 
        class="font-medium"
        :class="size === 'small' ? 'text-xs' : (size === 'large' ? 'text-base' : 'text-sm')"
      >
        {{ user.name }}
      </p>
      <p 
        v-if="showEmail" 
        class="text-muted-foreground"
        :class="size === 'small' ? 'text-xs' : (size === 'large' ? 'text-sm' : 'text-xs')"
      >
        {{ user.email }}
      </p>
      <p 
        v-if="showRole" 
        class="text-muted-foreground"
        :class="size === 'small' ? 'text-xs' : (size === 'large' ? 'text-sm' : 'text-xs')"
      >
        {{ formatRole(user.role) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '~/services/user'

const props = defineProps({
  user: {
    type: Object as () => User,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  showName: {
    type: Boolean,
    default: true
  },
  showEmail: {
    type: Boolean,
    default: false
  },
  showRole: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value: string) => ['small', 'medium', 'large'].includes(value)
  },
  withBorder: {
    type: Boolean,
    default: false
  }
})

// Calcul des initiales de l'utilisateur
const userInitials = computed(() => {
  if (!props.user) return ''
  
  const firstInitial = props.user.name ? props.user.name.split(' ')[0][0] : ''
  const lastNamePart = props.user.name.split(' ')[1]
  const lastInitial = lastNamePart ? lastNamePart[0] : ''
  
  return (firstInitial + lastInitial).toUpperCase()
})

// Formatter le rôle pour l'affichage
const formatRole = (role: string) => {
  if (role === 'client') return 'Client'
  if (role === 'prestataire') return 'Prestataire'
  return role
}
</script>