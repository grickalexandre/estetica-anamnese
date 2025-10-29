<template>
  <div id="app" :class="{ 'no-menu-layout': isClientPage || isAuthPage }">
    <!-- Página inicial com layout próprio -->
    <router-view v-if="isHomePage"></router-view>
    
    <!-- Páginas de autenticação sem layout -->
    <router-view v-else-if="isAuthPage"></router-view>
    
    <!-- Layout PWA para páginas administrativas -->
    <PWALayout v-else-if="!isClientPage">
      <router-view></router-view>
    </PWALayout>
    
    <!-- Layout simples para página do cliente -->
    <main v-else class="client-content">
      <router-view></router-view>
    </main>
    
    <!-- Toast Global -->
    <Toast 
      :show="toastState.show"
      :message="toastState.message"
      :title="toastState.title"
      :type="toastState.type"
      :duration="toastState.duration"
      @close="closeToast"
    />

    <!-- Confirm Modal Global -->
    <ConfirmModal
      :show="confirmState.show"
      :title="confirmState.title"
      :message="confirmState.message"
      :type="confirmState.type"
      :confirm-text="confirmState.confirmText"
      :cancel-text="confirmState.cancelText"
      :confirm-icon="confirmState.confirmIcon"
      :loading="confirmState.loading"
      @confirm="handleConfirmOk"
      @cancel="handleConfirmCancel"
      @close="handleConfirmCancel"
    />

    <!-- Prompt Modal Global -->
    <PromptModal
      :show="promptState.show"
      :title="promptState.title"
      :message="promptState.message"
      :label="promptState.label"
      :placeholder="promptState.placeholder"
      :default-value="promptState.defaultValue"
      :input-type="promptState.inputType"
      :required="promptState.required"
      :confirm-text="promptState.confirmText"
      :cancel-text="promptState.cancelText"
      :loading="promptState.loading"
      @confirm="handlePromptOk"
      @cancel="handlePromptCancel"
      @close="handlePromptCancel"
    />

    <!-- PWA Install Banner -->
    <PWAInstall v-if="!isClientPage" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from './firebase.js'
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { useConfiguracoes } from './composables/useConfiguracoes'
import { useClinica } from './composables/useClinica.js'
import { useAuth } from './composables/useAuth.js'
import { useNotifications } from './composables/useNotifications.js'
import PWALayout from './components/PWALayout.vue'
import Toast from './components/Toast.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import PromptModal from './components/PromptModal.vue'
import PWAInstall from './components/PWAInstall.vue'

const route = useRoute()
const router = useRouter()
const pendingCount = ref(0)

// Fornecer pendingCount para componentes filhos
provide('pendingCount', pendingCount)

const { clinicaId, inicializarClinica } = useClinica()
const { isAuthenticated, isFree, isPaid, logout, initAuth } = useAuth()
const {
  toastState,
  confirmState,
  promptState,
  closeToast,
  handleConfirmOk,
  handleConfirmCancel,
  handlePromptOk,
  handlePromptCancel
} = useNotifications()

const isClientPage = computed(() => {
  return route.path === '/anamnese-cliente'
})

const isHomePage = computed(() => {
  return route.path === '/'
})

const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/cadastro'
})


const updatePendingCount = async () => {
  try {
    if (!clinicaId.value) return
    
    const q = query(
      collection(db, 'anamneses'),
      where('clinicaId', '==', clinicaId.value),
      where('status', '==', 'pendente'),
      where('origem', '==', 'cliente')
    )
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      pendingCount.value = querySnapshot.size
      
      // Mostrar notificação quando uma nova anamnese do cliente for adicionada
      if (querySnapshot.size > 0 && !isClientPage.value) {
        const newAnamneses = querySnapshot.docChanges().filter(change => change.type === 'added')
        if (newAnamneses.length > 0) {
          const newAnamnese = newAnamneses[0].doc.data()
          showNotification(
            'info',
            'Nova Anamnese Recebida',
            `${newAnamnese.nome} preencheu uma nova anamnese`
          )
        }
      }
    })
    
    return unsubscribe
  } catch (error) {
    console.error('Erro ao atualizar contador:', error)
  }
}

const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}

onMounted(async () => {
  console.log('App.vue: Inicializando...')
  
  // Inicializar autenticação
  initAuth()
  
  // Inicializar contexto da clínica
  console.log('App.vue: Inicializando clínica...')
  await inicializarClinica()
  console.log('App.vue: Clínica inicializada, clinicaId:', clinicaId.value)
  
  // Atualizar contador de pendentes apenas para área administrativa
  if (!isClientPage.value) {
    console.log('App.vue: Atualizando contador de pendentes...')
    updatePendingCount()
  }
})

// Atualizar contador quando sair da página do cliente
watch(isClientPage, (newValue) => {
  if (!newValue) {
    updatePendingCount()
  }
})
</script>

<style scoped>
/* Layout para página do cliente */
.client-content {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Notificações */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 10000;
  max-width: 400px;
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification.success {
  border-left: 4px solid #10b981;
}

.notification.warning {
  border-left: 4px solid #f59e0b;
}

.notification.error {
  border-left: 4px solid #ef4444;
}

.notification.info {
  border-left: 4px solid #00A859;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Layout sem menu (página do cliente) */
.no-menu-layout .main-content {
  margin-left: 0;
  padding-top: 0;
}

/* PWA Safe Area Support */
@supports (padding: max(0px)) {
  .main-content {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
    padding-bottom: max(0px, env(safe-area-inset-bottom));
  }
}

/* PWA Standalone Mode */
@media (display-mode: standalone) {
  .main-content {
    /* Ajustar para modo standalone */
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height */
  }
  
  .main-content.with-navbar {
    padding-top: max(70px, env(safe-area-inset-top) + 70px);
  }
  
  /* Melhorar touch targets */
  button, .btn, .nav-item, .mobile-nav-item {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Melhorar scroll em iOS */
  .main-content {
    -webkit-overflow-scrolling: touch;
  }
}
</style>


