<template>
  <div class="pwa-layout">
    <!-- Header minimalista -->
    <PWAHeader />
    
    <!-- Conteúdo principal -->
    <main class="main-content">
      <slot />
    </main>
    
    <!-- Navegação inferior -->
    <PWANavigation />
  </div>
</template>

<script setup>
import PWAHeader from './PWAHeader.vue'
import PWANavigation from './PWANavigation.vue'
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
