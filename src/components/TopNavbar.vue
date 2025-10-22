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
        <router-link 
          to="/dashboard" 
          class="navbar-item" 
          :class="{ 'active': activeMenu === 'dashboard' }"
          @click="setActiveMenu('dashboard')"
        >
          <i class="fas fa-chart-pie"></i>
          <span>Dashboard</span>
        </router-link>

        <router-link 
          to="/agenda" 
          class="navbar-item" 
          :class="{ 'active': activeMenu === 'agenda' }"
          @click="setActiveMenu('agenda')"
        >
          <i class="fas fa-calendar-alt"></i>
          <span>Agenda</span>
        </router-link>

        <router-link 
          to="/lista" 
          class="navbar-item notification-badge" 
          :class="{ 'active': activeMenu === 'pacientes' }"
          @click="setActiveMenu('pacientes')"
        >
          <i class="fas fa-users"></i>
          <span>Pacientes</span>
          <span v-if="pendingCount > 0" class="notification-count">{{ pendingCount }}</span>
        </router-link>

        <div 
          class="navbar-item dropdown" 
          :class="{ 'active': activeMenu === 'financeiro' }"
          @click="setActiveMenu('financeiro')"
        >
          <i class="fas fa-dollar-sign"></i>
          <span>Financeiro</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </div>

        <div 
          class="navbar-item dropdown" 
          :class="{ 'active': activeMenu === 'relatorios' }"
          @click="setActiveMenu('relatorios')"
        >
          <i class="fas fa-chart-bar"></i>
          <span>Relatórios</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </div>

        <div 
          class="navbar-item dropdown" 
          :class="{ 'active': activeMenu === 'gestao' }"
          @click="setActiveMenu('gestao')"
        >
          <i class="fas fa-users-cog"></i>
          <span>Gestão</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </div>

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
  } else if (path.startsWith('/agenda')) {
    activeMenu.value = 'agenda'
  } else if (path.startsWith('/lista')) {
    activeMenu.value = 'pacientes'
  } else if (path.startsWith('/financeiro') || path.startsWith('/comissoes') || path.startsWith('/pagamentos')) {
    activeMenu.value = 'financeiro'
  } else if (path.startsWith('/relatorios') || path.startsWith('/avaliacoes') || path.startsWith('/auditoria')) {
    activeMenu.value = 'relatorios'
  } else if (path.startsWith('/equipe-clinica') || path.startsWith('/minha-assinatura') || path.startsWith('/planos')) {
    activeMenu.value = 'gestao'
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
  background: linear-gradient(135deg, #1d1d1f 0%, #424245 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(29, 29, 31, 0.2);
}

.navbar-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #1d1d1f;
  border-radius: 2px;
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
