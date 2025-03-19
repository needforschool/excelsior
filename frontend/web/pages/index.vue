<template>
  <div>
    <!-- Section héro avec image de fond -->
    <section class="relative overflow-hidden bg-gradient-to-r from-primary/80 to-primary">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[url('/images/pattern-bg.svg')] bg-repeat bg-center"></div>
      </div>
      <div class="container relative px-4 py-20 mx-auto md:py-28 lg:py-32">
        <div class="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h1 class="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Services à la demande, rapidité garantie
            </h1>
            <p class="mb-8 text-lg text-white/90">
              Transport, livraison, nettoyage, assistance... Tous vos besoins quotidiens à portée de clic avec suivi en temps réel.
            </p>
            <div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <NuxtLink to="/services">
                <Button size="lg" class="bg-white text-primary hover:bg-white/90">
                  Découvrir nos services
                </Button>
              </NuxtLink>
              <NuxtLink to="/how-it-works">
                <Button size="lg" >
                  Comment ça marche
                </Button>
              </NuxtLink>
            </div>
          </div>
          <div class="flex justify-center">
            <div class="relative w-full max-w-md">
              <div class="absolute -inset-1 rounded-xl bg-white/20 blur-xl"></div>
              <div class="relative overflow-hidden bg-white rounded-xl">
                <div class="items-center justify-center hidden p-12 bg-muted">
                  <div class="flex flex-col items-center text-center">
                    <LucideSmartphone class="w-16 h-16 mb-4 text-primary" />
                    <p class="text-lg font-semibold">Aperçu de l'application</p>
                    <p class="text-sm text-muted-foreground">Votre service à portée de main</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section des caractéristiques principales -->
    <section class="py-16 bg-background md:py-24">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">Pourquoi choisir QuickServe ?</h2>
          <p class="text-lg text-muted-foreground">Notre plateforme simplifie votre quotidien avec des services de qualité, rapides et personnalisés</p>
        </div>
        
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <!-- Rapidité -->
          <div class="p-6 transition-all rounded-lg bg-card hover:shadow-md">
            <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
              <LucideClock class="w-6 h-6 text-primary" />
            </div>
            <h3 class="mb-2 text-xl font-semibold">Rapidité</h3>
            <p class="text-muted-foreground">Services disponibles en moins d'une heure, pour répondre à vos besoins urgents.</p>
          </div>
          
          <!-- Suivi en temps réel -->
          <div class="p-6 transition-all rounded-lg bg-card hover:shadow-md">
            <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
              <LucideMapPin class="w-6 h-6 text-primary" />
            </div>
            <h3 class="mb-2 text-xl font-semibold">Suivi en temps réel</h3>
            <p class="text-muted-foreground">Suivez vos prestataires en direct sur la carte et recevez des notifications à chaque étape.</p>
          </div>
          
          <!-- Sécurité -->
          <div class="p-6 transition-all rounded-lg bg-card hover:shadow-md">
            <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
              <LucideShield class="w-6 h-6 text-primary" />
            </div>
            <h3 class="mb-2 text-xl font-semibold">Sécurité garantie</h3>
            <p class="text-muted-foreground">Prestataires vérifiés et système de paiement sécurisé pour une tranquillité d'esprit.</p>
          </div>
          
          <!-- Paiement facile -->
          <div class="p-6 transition-all rounded-lg bg-card hover:shadow-md">
            <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
              <LucideCreditCard class="w-6 h-6 text-primary" />
            </div>
            <h3 class="mb-2 text-xl font-semibold">Paiement facile</h3>
            <p class="text-muted-foreground">Paiement automatique après service, sans tracas et avec facture immédiate.</p>
          </div>
          
          <!-- Évaluations -->
          <div class="p-6 transition-all rounded-lg bg-card hover:shadow-md">
            <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
              <LucideStar class="w-6 h-6 text-primary" />
            </div>
            <h3 class="mb-2 text-xl font-semibold">Évaluations transparentes</h3>
            <p class="text-muted-foreground">Choisissez vos prestataires selon leurs évaluations et commentaires vérifiés.</p>
          </div>
          
          <!-- Support client -->
          <div class="p-6 transition-all rounded-lg bg-card hover:shadow-md">
            <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
              <LucideHeadphones class="w-6 h-6 text-primary" />
            </div>
            <h3 class="mb-2 text-xl font-semibold">Support réactif</h3>
            <p class="text-muted-foreground">Notre équipe de support est disponible 7j/7 pour répondre à toutes vos questions.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section des services -->
    <section class="py-16 bg-muted/30 md:py-24">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">Nos services</h2>
          <p class="text-lg text-muted-foreground">Découvrez notre gamme de services pour simplifier votre quotidien</p>
        </div>
        
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Transport -->
          <div class="overflow-hidden transition-all rounded-lg shadow-sm bg-card hover:shadow-md">
            <div class="relative aspect-video bg-muted">
              <div class="absolute inset-0 flex items-center justify-center">
                <LucideTruck class="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
            <div class="p-5">
              <h3 class="mb-2 text-lg font-semibold">Transport et Livraison</h3>
              <p class="mb-4 text-sm text-muted-foreground">Livraison express de vos colis en 1h ou moins. Service disponible 7j/7.</p>
              <Button as="NuxtLink" to="/services?category=transport" variant="outline" class="w-full">
                <LucideArrowRight class="w-4 h-4 mr-2" />
                Découvrir
              </Button>
            </div>
          </div>
          
          <!-- Nettoyage -->
          <div class="overflow-hidden transition-all rounded-lg shadow-sm bg-card hover:shadow-md">
            <div class="relative aspect-video bg-muted">
              <div class="absolute inset-0 flex items-center justify-center">
                <LucideCar class="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
            <div class="p-5">
              <h3 class="mb-2 text-lg font-semibold">Nettoyage Véhicule</h3>
              <p class="mb-4 text-sm text-muted-foreground">Service complet de nettoyage de votre véhicule, à domicile ou au travail.</p>
              <Button as="NuxtLink" to="/services?category=cleaning" variant="outline" class="w-full">
                <LucideArrowRight class="w-4 h-4 mr-2" />
                Découvrir
              </Button>
            </div>
          </div>
          
          <!-- Déménagement -->
          <div class="overflow-hidden transition-all rounded-lg shadow-sm bg-card hover:shadow-md">
            <div class="relative aspect-video bg-muted">
              <div class="absolute inset-0 flex items-center justify-center">
                <LucideBox class="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
            <div class="p-5">
              <h3 class="mb-2 text-lg font-semibold">Déménagement</h3>
              <p class="mb-4 text-sm text-muted-foreground">Service de déménagement pour petits volumes, rapide et sans tracas.</p>
              <Button as="NuxtLink" to="/services?category=moving" variant="outline" class="w-full">
                <LucideArrowRight class="w-4 h-4 mr-2" />
                Découvrir
              </Button>
            </div>
          </div>
        </div>
        
        <div class="mt-12 text-center">
          <Button as="NuxtLink" to="/services" size="lg">
            Voir tous nos services
          </Button>
        </div>
      </div>
    </section>

    <!-- Section témoignages -->
    <section class="py-16 bg-background md:py-24">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">Ce que disent nos clients</h2>
          <p class="text-lg text-muted-foreground">Découvrez les expériences de nos utilisateurs avec QuickServe</p>
        </div>
        
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Témoignage 1 -->
          <div class="p-6 rounded-lg bg-card">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <span class="text-sm font-semibold">JD</span>
              </div>
              <div>
                <h4 class="font-semibold">Jean Dupont</h4>
                <div class="flex">
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </div>
            <p class="text-muted-foreground">"Service impeccable ! Mon colis a été livré en moins de 30 minutes. Le livreur était très professionnel et j'ai pu suivre son parcours en temps réel. Je recommande vivement !"</p>
          </div>
          
          <!-- Témoignage 2 -->
          <div class="p-6 rounded-lg bg-card">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <span class="text-sm font-semibold">ML</span>
              </div>
              <div>
                <h4 class="font-semibold">Marie Lambert</h4>
                <div class="flex">
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" fill="none" />
                </div>
              </div>
            </div>
            <p class="text-muted-foreground">"J'ai utilisé le service de nettoyage de voiture et je suis très satisfaite. Ma voiture n'a jamais été aussi propre ! Le processus de réservation était simple et le paiement automatique très pratique."</p>
          </div>
          
          <!-- Témoignage 3 -->
          <div class="p-6 rounded-lg bg-card">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <span class="text-sm font-semibold">PM</span>
              </div>
              <div>
                <h4 class="font-semibold">Philippe Martin</h4>
                <div class="flex">
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                  <LucideStar class="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </div>
            <p class="text-muted-foreground">"Le service de déménagement était parfait pour mon petit appartement. Rapide, efficace et pas cher. L'équipe était ponctuelle et professionnelle. Je n'hésiterai pas à faire appel à QuickServe à nouveau."</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section FAQ -->
    <section class="py-16 bg-muted/30 md:py-24">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">Questions fréquentes</h2>
          <p class="text-lg text-muted-foreground">Trouvez des réponses aux questions les plus posées</p>
        </div>
        
        <div class="max-w-3xl mx-auto space-y-4">
          <div class="p-6 rounded-lg bg-card">
            <h3 class="mb-2 text-lg font-semibold">Comment fonctionne QuickServe ?</h3>
            <p class="text-muted-foreground">QuickServe vous met en relation avec des prestataires qualifiés pour différents services. Il vous suffit de sélectionner le service souhaité, d'indiquer votre adresse et vos disponibilités, puis de valider votre commande. Vous pouvez ensuite suivre votre prestataire en temps réel.</p>
          </div>
          
          <div class="p-6 rounded-lg bg-card">
            <h3 class="mb-2 text-lg font-semibold">Quels sont les délais de livraison ?</h3>
            <p class="text-muted-foreground">Pour la livraison express, nous garantissons une livraison en moins d'une heure. Pour les autres services, les délais dépendent du type de prestation et sont indiqués lors de la réservation.</p>
          </div>
          
          <div class="p-6 rounded-lg bg-card">
            <h3 class="mb-2 text-lg font-semibold">Comment sont sélectionnés les prestataires ?</h3>
            <p class="text-muted-foreground">Tous nos prestataires font l'objet d'une vérification d'identité et d'antécédents. Ils sont également notés après chaque prestation, ce qui nous permet de maintenir un niveau de qualité élevé.</p>
          </div>
          
          <div class="p-6 rounded-lg bg-card">
            <h3 class="mb-2 text-lg font-semibold">Quels sont les modes de paiement acceptés ?</h3>
            <p class="text-muted-foreground">Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), PayPal, et Apple Pay/Google Pay sur mobile. Le paiement est automatiquement débité après la prestation.</p>
          </div>
        </div>
        
        <div class="mt-12 text-center">
          <Button as="NuxtLink" to="/faq" variant="outline" size="lg">
            Voir toutes les FAQ
          </Button>
        </div>
      </div>
    </section>

    <!-- Section CTA -->
    <section class="py-16 bg-primary text-primary-foreground md:py-24">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">Prêt à simplifier votre quotidien ?</h2>
          <p class="mb-8 text-lg text-primary-foreground/90">Rejoignez des milliers d'utilisateurs satisfaits et commencez à utiliser QuickServe dès aujourd'hui.</p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <NuxtLink to="/services">
              <Button size="lg" class="bg-white text-primary hover:bg-white/90">
                Commander maintenant
              </Button>
            </NuxtLink>
            <NuxtLink to="/become-provider">
              <Button size="lg" class="bg-transparent border border-white hover:bg-white/10">
                Devenir prestataire
              </Button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'
</script>