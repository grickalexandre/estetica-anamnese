<template>
  <nav class="top-navbar">
    <div class="navbar-container">
      <!-- Logo/Brand -->
      <div class="navbar-brand" @click="irParaHome">
        <div class="brand-icon">
          <i class="fas fa-spa"></i>
        </div>
        <div class="brand-text">
          <h3 class="brand-title">{{ configuracoes.nomeClinica || 'Clínica Estética' }}</h3>
          <span v-if="configuracoes.nomeProprietario" class="proprietario">
            <i class="fas fa-user-md"></i>
            {{ configuracoes.nomeProprietario }}
          </span>
        </div>
      </div>

      <!-- Main Navigation Items -->
      <div class="navbar-menu">
        <!-- Dashboard -->
        <router-link 
          to="/dashboard" 
          class="navbar-item" 
          :class="{ 'active': activeMenu === 'dashboard' }"
          @click="setActiveMenu('dashboard')"
        >
          <i class="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </router-link>

        <!-- Atendimento -->
        <div 
          class="navbar-item dropdown" 
          :class="{ 'active': activeMenu === 'atendimento' }"
          @click="setActiveMenu('atendimento')"
        >
          <i class="fas fa-stethoscope"></i>
          <span>Atendimento</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </div>

        <!-- Pacientes -->
        <div 
          class="navbar-item dropdown notification-badge" 
          :class="{ 'active': activeMenu === 'pacientes' }"
          @click="setActiveMenu('pacientes')"
        >
          <i class="fas fa-users"></i>
          <span>Pacientes</span>
          <span v-if="pendingCount > 0" class="notification-count">{{ pendingCount }}</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </div>

        <!-- Financeiro -->
        <div 
          class="navbar-item dropdown" 
          :class="{ 'active': activeMenu === 'financeiro' }"
          @click="setActiveMenu('financeiro')"
        >
          <i class="fas fa-chart-line"></i>
          <span>Financeiro</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </div>

        <!-- Relatórios -->
        <div 
          class="navbar-item dropdown" 
          :class="{ 'active': activeMenu === 'relatorios' }"
          @click="setActiveMenu('relatorios')"
        >
          <i class="fas fa-chart-bar"></i>
          <span>Relatórios</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </div>

        <!-- Configurações -->
        <router-link 
          to="/configuracoes" 
          class="navbar-item" 
          :class="{ 'active': activeMenu === 'configuracoes' }"
          @click="setActiveMenu('configuracoes')"
        >
          <i class="fas fa-cog"></i>
          <span>Configurações</span>
        </router-link>
      </div>

      <!-- User Actions -->
      <div class="navbar-actions">
        <!-- Notificação de Anamnese -->
        <div v-if="isAuthenticated && pendingCount > 0" class="notification-bell" @click="irParaAnamneses">
          <i class="fas fa-bell"></i>
          <span class="notification-badge">{{ pendingCount }}</span>
        </div>
        
        <button v-if="isAuthenticated" @click="handleLogout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span>Sair</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfiguracoes } from '../composables/useConfiguracoes'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { configuracoes } = useConfiguracoes()
const { isAuthenticated, logout } = useAuth()

// Props
const props = defineProps({
  pendingCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['logout', 'menuChange'])

// Estado
const activeMenu = ref('dashboard')

// Computed
const currentRoute = computed(() => route.path)

// Métodos
const setActiveMenu = (menu) => {
  activeMenu.value = menu
  emit('menuChange', menu)
}

const irParaHome = () => {
  router.push('/')
  setActiveMenu('dashboard')
}

const irParaAnamneses = () => {
  router.push('/lista')
  setActiveMenu('pacientes')
}

const handleLogout = async () => {
  try {
    await logout()
    emit('logout')
    router.push('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}

// Detectar menu ativo baseado na rota
const detectActiveMenu = () => {
  const path = route.path
  
  if (path.startsWith('/dashboard')) {
    activeMenu.value = 'dashboard'
  } else if (path.startsWith('/agenda') || path.startsWith('/registrar-atendimento')) {
    activeMenu.value = 'atendimento'
  } else if (path.startsWith('/lista') || path.startsWith('/prontuario-eletronico') || path.startsWith('/editar-paciente')) {
    activeMenu.value = 'pacientes'
  } else if (path.startsWith('/financeiro') || path.startsWith('/comissoes') || path.startsWith('/pagamentos') || path.startsWith('/fluxo-caixa')) {
    activeMenu.value = 'financeiro'
  } else if (path.startsWith('/relatorios') || path.startsWith('/avaliacoes') || path.startsWith('/auditoria')) {
    activeMenu.value = 'relatorios'
  } else if (path.startsWith('/configuracoes')) {
    activeMenu.value = 'configuracoes'
  }
}

// Detectar menu ativo quando a rota muda
import { watch } from 'vue'
watch(() => route.path, detectActiveMenu, { immediate: true })
</script>

<style scoped>
.top-navbar {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 70px;
  max-width: 100%;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 8px;
  min-width: 0;
}

.navbar-brand:hover {
  background: rgba(29, 29, 31, 0.05);
  transform: translateY(-1px);
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1d1d1f 0%, #424245 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.brand-text {
  flex: 1;
  min-width: 0;
}

.brand-text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.proprietario {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8e8e93;
  margin-top: 2px;
}

.proprietario i {
  font-size: 10px;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
  margin: 0 24px;
}

.navbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: #6b7280;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  font-size: 14px;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
}

.navbar-item:hover {
  background: rgba(29, 29, 31, 0.05);
  color: #1d1d1f;
  transform: translateY(-1px);
}

.navbar-item.active {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  border: 1px solid rgba(0, 122, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
}

.navbar-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 2px;
  background: #007AFF;
  border-radius: 1px;
}

.navbar-item i {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.dropdown-arrow {
  font-size: 12px;
  margin-left: 4px;
  transition: transform 0.2s ease;
}

.dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.notification-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  line-height: 1;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 193, 7, 0.1);
  border: 2px solid #ffc107;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ffc107;
  font-size: 18px;
}

.notification-bell:hover {
  background: rgba(255, 193, 7, 0.2);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.notification-bell .notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  line-height: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 1024px) {
  .navbar-menu {
    gap: 4px;
    margin: 0 12px;
  }
  
  .navbar-item {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .navbar-item span {
    display: none;
  }
  
  .navbar-item i {
    font-size: 18px;
  }
}

/* PWA Safe Area Support */
@supports (padding: max(0px)) {
  .top-navbar {
    padding-top: max(0px, env(safe-area-inset-top));
  }
}

/* Touch-friendly sizing for PWA */
@media (display-mode: standalone) {
  .navbar-item {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }
  
  .navbar-item i {
    font-size: 18px;
  }
  
  .logout-btn {
    min-height: 44px;
    padding: 12px 16px;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
    height: 60px;
  }
  
  .brand-text {
    display: none;
  }
  
  .navbar-menu {
    gap: 2px;
    margin: 0 8px;
  }
  
  .navbar-item {
    padding: 8px;
    min-width: 44px;
    justify-content: center;
  }
  
  .navbar-actions .logout-btn span {
    display: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .top-navbar {
    background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .brand-text h3 {
    color: #ffffff;
  }
  
  .proprietario {
    color: #a1a1aa;
  }
  
  .navbar-item {
    color: #a1a1aa;
  }
  
  .navbar-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
  }
}
</style>
