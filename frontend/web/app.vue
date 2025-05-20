<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <Toaster />
    </ClientOnly>
  </div>
</template>

<script setup>
import { Toaster } from '@/components/ui/toast'
</script>