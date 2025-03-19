<template>
  <div class="p-6 transition-shadow rounded-lg shadow-sm bg-card hover:shadow-md">
    <h4 class="mb-2 font-semibold">{{ title }}</h4>
    <p class="text-sm text-card-foreground">{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})
</script>