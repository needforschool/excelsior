<template>
  <div class="container py-6 mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold">Suivi de commande #{{ $route.params.id }}</h1>
      <Button variant="outline" size="sm" as="NuxtLink" to="/orders">Retour</Button>
    </div>
    
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Map de suivi (placeholder) -->
      <div class="lg:col-span-2 bg-muted rounded-lg p-4 h-[500px] flex items-center justify-center">
        <div class="text-center">
          <p class="mb-2 text-muted-foreground">Carte de suivi en temps réel</p>
          <p class="text-sm text-muted-foreground">
            Intégration avec Azure Maps pour le suivi du prestataire
          </p>
        </div>
      </div>
      
      <!-- Informations de commande -->
      <div class="p-6 rounded-lg shadow-sm bg-card">
        <h2 class="mb-4 text-xl font-bold">Détails de la commande</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Statut</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="w-3 h-3 bg-green-500 rounded-full"></span>
              <p class="font-medium">En cours</p>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Service</h3>
            <p class="mt-1">Transport et Livraison</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Prestataire</h3>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                <span>JD</span>
              </div>
              <div>
                <p class="font-medium">Jean Dupont</p>
                <p class="text-sm text-muted-foreground">⭐ 4.8 (120 avis)</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Adresse de livraison</h3>
            <p class="mt-1">123 Rue de Paris, 75001 Paris</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Heure estimée d'arrivée</h3>
            <p class="mt-1 font-medium">14:30 (dans 15 minutes)</p>
          </div>
        </div>
        
        <div class="mt-6 space-y-3">
          <Button class="w-full">Contacter le prestataire</Button>
          <Button variant="outline" class="w-full">Annuler la commande</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'
</script>