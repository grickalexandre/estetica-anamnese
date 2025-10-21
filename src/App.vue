<template>
  <div id="app" :class="{ 'no-menu-layout': isClientPage }">
    <!-- Sidebar Desktop -->
    <Sidebar 
      v-if="!isClientPage" 
      :pending-count="pendingCount"
      @logout="handleLogout"
      @toggle="handleSidebarToggle"
      class="desktop-sidebar"
    />
    
    <!-- Mobile Menu -->
    <MobileMenu 
      v-if="!isClientPage" 
      :pending-count="pendingCount"
      @logout="handleLogout"
      class="mobile-menu"
    />
    
    <!-- Main Content -->
    <main class="main-content" :class="{ 
      'with-sidebar': !isClientPage && !sidebarCollapsed,
      'with-sidebar-collapsed': !isClientPage && sidebarCollapsed
    }">
      <router-view></router-view>
    </main>
    
    <!-- Notificações -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      <div style="display: flex; align-items: center; gap: 12px;">
        <i v-if="notification.type === 'success'" class="fas fa-check-circle"></i>
        <i v-else-if="notification.type === 'warning'" class="fas fa-exclamation-triangle"></i>
        <i v-else-if="notification.type === 'error'" class="fas fa-times-circle"></i>
        <i v-else class="fas fa-info-circle"></i>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">{{ notification.title }}</div>
          <div style="font-size: 14px; color: #8e8e93;">{{ notification.message }}</div>
        </div>
        <button @click="hideNotification" style="margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: #8e8e93;">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from './firebase.js'
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { useConfiguracoes } from './composables/useConfiguracoes'
import { useClinica } from './composables/useClinica.js'
import { useAuth } from './composables/useAuth.js'
import Sidebar from './components/Sidebar.vue'
import MobileMenu from './components/MobileMenu.vue'

const route = useRoute()
const router = useRouter()
const pendingCount = ref(0)
const sidebarCollapsed = ref(false)
const notification = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

const { clinicaId, inicializarClinica } = useClinica()
const { isAuthenticated, isFree, isPaid, logout, initAuth } = useAuth()

const isClientPage = computed(() => {
  return route.path === '/anamnese-cliente'
})

const handleSidebarToggle = (collapsed) => {
  sidebarCollapsed.value = collapsed
}


const showNotification = (type, title, message) => {
  notification.value = {
    show: true,
    type,
    title,
    message
  }
  
  setTimeout(() => {
    hideNotification()
  }, 5000)
}

const hideNotification = () => {
  notification.value.show = false
}

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
/* Layout principal */
.main-content {
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.with-sidebar {
  margin-left: 280px;
}

.main-content.with-sidebar-collapsed {
  margin-left: 70px;
}

/* Sidebar Desktop */
.desktop-sidebar {
  display: block;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .desktop-sidebar {
    display: none;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .main-content.with-sidebar {
    margin-left: 0;
    padding-top: 80px;
  }
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
  border-left: 4px solid #3b82f6;
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
</style>


