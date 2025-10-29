<template>
  <div class="pwa-layout">
    <!-- Header minimalista -->
    <PWAHeader :notification-count="pendingCount" />
    
    <!-- Conteúdo principal -->
    <main class="main-content">
      <slot />
    </main>
    
    <!-- Navegação inferior -->
    <PWANavigation />
  </div>
</template>

<script setup>
import { inject } from 'vue'
import PWAHeader from './PWAHeader.vue'
import PWANavigation from './PWANavigation.vue'

// Receber pendingCount do App.vue via provide/inject
const pendingCount = inject('pendingCount', 0)
</script>

<style scoped>
.pwa-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.main-content {
  flex: 1;
  padding-bottom: 80px; /* Espaço para navegação inferior */
}

/* Responsividade */
@media (max-width: 768px) {
  .main-content {
    padding-bottom: 70px;
  }
}
</style>
