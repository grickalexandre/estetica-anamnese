<template>
  <div class="sidebar" :class="{ 'collapsed': collapsed }">
    <!-- Header do Sidebar -->
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <i class="fas fa-spa"></i>
        </div>
        <div v-if="!collapsed" class="brand-text">
          <h3>{{ configuracoes.nomeClinica || 'Clínica Estética' }}</h3>
          <span v-if="configuracoes.nomeProprietario" class="proprietario">
            <i class="fas fa-user-md"></i>
            {{ configuracoes.nomeProprietario }}
          </span>
        </div>
      </div>
      <button @click="toggleCollapse" class="collapse-btn">
        <i :class="collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
      </button>
    </div>

    <!-- Menu Principal -->
    <nav class="sidebar-nav">
      <!-- Dashboard -->
      <router-link to="/dashboard" class="nav-item" :class="{ 'collapsed': collapsed }">
        <div class="nav-icon">
          <i class="fas fa-chart-pie"></i>
        </div>
        <span v-if="!collapsed" class="nav-text">Dashboard</span>
      </router-link>

      <!-- Agenda -->
      <router-link to="/agenda" class="nav-item" :class="{ 'collapsed': collapsed }">
        <div class="nav-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <span v-if="!collapsed" class="nav-text">Agenda</span>
      </router-link>

      <!-- Pacientes -->
      <router-link to="/lista" class="nav-item notification-badge" :class="{ 'collapsed': collapsed }">
        <div class="nav-icon">
          <i class="fas fa-users"></i>
          <span v-if="pendingCount > 0" class="notification-count">{{ pendingCount }}</span>
        </div>
        <span v-if="!collapsed" class="nav-text">Pacientes</span>
      </router-link>

      <!-- Cadastros -->
      <div class="nav-group" :class="{ 'collapsed': collapsed }">
        <div class="nav-group-header" @click="toggleCadastros">
          <div class="nav-icon">
            <i class="fas fa-database"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Cadastros</span>
          <i v-if="!collapsed" class="fas fa-chevron-down group-arrow" :class="{ 'rotated': showCadastros }"></i>
        </div>
        <div v-if="!collapsed && showCadastros" class="nav-group-content">
          <router-link to="/clientes" class="nav-subitem">
            <i class="fas fa-user-friends"></i>
            <span>Clientes</span>
          </router-link>
          <router-link to="/fornecedores" class="nav-subitem">
            <i class="fas fa-truck"></i>
            <span>Fornecedores</span>
          </router-link>
          <router-link to="/produtos" class="nav-subitem">
            <i class="fas fa-box"></i>
            <span>Produtos</span>
          </router-link>
          <router-link to="/procedimentos" class="nav-subitem">
            <i class="fas fa-spa"></i>
            <span>Procedimentos</span>
          </router-link>
        </div>
      </div>

      <!-- Financeiro -->
      <div class="nav-group" :class="{ 'collapsed': collapsed }">
        <div class="nav-group-header" @click="toggleFinanceiro">
          <div class="nav-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Financeiro</span>
          <i v-if="!collapsed" class="fas fa-chevron-down group-arrow" :class="{ 'rotated': showFinanceiro }"></i>
        </div>
        <div v-if="!collapsed && showFinanceiro" class="nav-group-content">
          <router-link to="/financeiro" class="nav-subitem">
            <i class="fas fa-chart-line"></i>
            <span>Visão Geral</span>
          </router-link>
          <router-link to="/financeiro/contas-pagar" class="nav-subitem">
            <i class="fas fa-credit-card"></i>
            <span>Contas a Pagar</span>
          </router-link>
          <router-link to="/financeiro/contas-receber" class="nav-subitem">
            <i class="fas fa-money-bill-wave"></i>
            <span>Contas a Receber</span>
          </router-link>
          <router-link to="/financeiro/fluxo-caixa" class="nav-subitem">
            <i class="fas fa-exchange-alt"></i>
            <span>Fluxo de Caixa</span>
          </router-link>
          <router-link to="/financeiro/plano-contas" class="nav-subitem">
            <i class="fas fa-sitemap"></i>
            <span>Plano de Contas</span>
          </router-link>
          <router-link to="/financeiro/relatorio-dre" class="nav-subitem">
            <i class="fas fa-file-invoice"></i>
            <span>Relatório DRE</span>
          </router-link>
          <router-link to="/financeiro/analise-tendencias" class="nav-subitem">
            <i class="fas fa-chart-area"></i>
            <span>Análise de Tendências</span>
          </router-link>
        </div>
      </div>

      <!-- Relatórios -->
      <router-link to="/relatorios" class="nav-item" :class="{ 'collapsed': collapsed }">
        <div class="nav-icon">
          <i class="fas fa-chart-bar"></i>
        </div>
        <span v-if="!collapsed" class="nav-text">Relatórios</span>
      </router-link>

      <!-- Configurações -->
      <router-link to="/configuracoes" class="nav-item" :class="{ 'collapsed': collapsed }">
        <div class="nav-icon">
          <i class="fas fa-cog"></i>
        </div>
        <span v-if="!collapsed" class="nav-text">Configurações</span>
      </router-link>

      <!-- Planos -->
      <router-link v-if="isAuthenticated" to="/planos" class="nav-item plan-link" :class="{ 'collapsed': collapsed }">
        <div class="nav-icon">
          <i class="fas fa-crown"></i>
        </div>
        <span v-if="!collapsed" class="nav-text">Planos</span>
        <span v-if="!collapsed && isFree" class="badge-free">FREE</span>
      </router-link>
    </nav>

    <!-- Footer do Sidebar -->
    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-btn" :class="{ 'collapsed': collapsed }" v-if="isAuthenticated">
        <div class="nav-icon">
          <i class="fas fa-sign-out-alt"></i>
        </div>
        <span v-if="!collapsed" class="nav-text">Sair</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfiguracoes } from '../composables/useConfiguracoes'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { configuracoes } = useConfiguracoes()
const { isAuthenticated, isFree, logout } = useAuth()

// Props
const props = defineProps({
  pendingCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['logout'])

// Estado do sidebar
const collapsed = ref(false)
const showCadastros = ref(false)
const showFinanceiro = ref(false)

// Métodos
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  // Fechar grupos quando colapsar
  if (collapsed.value) {
    showCadastros.value = false
    showFinanceiro.value = false
  }
}

const toggleCadastros = () => {
  if (!collapsed.value) {
    showCadastros.value = !showCadastros.value
  }
}

const toggleFinanceiro = () => {
  if (!collapsed.value) {
    showFinanceiro.value = !showFinanceiro.value
  }
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
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05);
}

.sidebar.collapsed {
  width: 70px;
}

/* Header */
.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
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

.collapse-btn {
  background: none;
  border: none;
  color: #8e8e93;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.collapse-btn:hover {
  background: rgba(29, 29, 31, 0.1);
  color: #1d1d1f;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  font-weight: 500;
  font-size: 14px;
}

.nav-item.collapsed {
  justify-content: center;
  padding: 12px 16px;
}

.nav-item:hover {
  background: rgba(29, 29, 31, 0.05);
  color: #1d1d1f;
}

.nav-item.router-link-active {
  background: linear-gradient(135deg, #1d1d1f 0%, #424245 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(29, 29, 31, 0.2);
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #1d1d1f;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Notification Badge */
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

/* Navigation Groups */
.nav-group {
  margin-bottom: 4px;
}

.nav-group.collapsed .nav-group-header {
  justify-content: center;
  padding: 12px 16px;
}

.nav-group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
}

.nav-group-header:hover {
  background: rgba(29, 29, 31, 0.05);
  color: #1d1d1f;
}

.group-arrow {
  margin-left: auto;
  transition: transform 0.2s ease;
  font-size: 12px;
}

.group-arrow.rotated {
  transform: rotate(180deg);
}

.nav-group-content {
  background: rgba(29, 29, 31, 0.02);
  border-left: 2px solid rgba(29, 29, 31, 0.1);
  margin-left: 20px;
  margin-right: 8px;
  border-radius: 0 8px 8px 0;
  overflow: hidden;
}

.nav-subitem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 10px 24px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
}

.nav-subitem:hover {
  background: rgba(29, 29, 31, 0.05);
  color: #1d1d1f;
}

.nav-subitem.router-link-active {
  background: rgba(29, 29, 31, 0.1);
  color: #1d1d1f;
  font-weight: 600;
}

.nav-subitem i {
  width: 16px;
  font-size: 12px;
  color: #8e8e93;
}

/* Plan Link */
.plan-link {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  margin: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(146, 64, 14, 0.2);
}

.plan-link:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  color: #78350f;
}

.plan-link.router-link-active {
  background: linear-gradient(135deg, #92400e 0%, #78350f 100%);
  color: white;
}

.badge-free {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-left: auto;
}

/* Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
  width: 100%;
  border-radius: 8px;
}

.logout-btn.collapsed {
  justify-content: center;
  padding: 12px 16px;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* Scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .sidebar.collapsed {
    width: 280px;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-group-content {
  animation: slideIn 0.2s ease;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .sidebar {
    background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
    border-right-color: rgba(255, 255, 255, 0.1);
  }
  
  .sidebar-header,
  .sidebar-footer {
    background: rgba(26, 26, 26, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .brand-text h3 {
    color: #ffffff;
  }
  
  .proprietario {
    color: #a1a1aa;
  }
  
  .nav-item {
    color: #a1a1aa;
  }
  
  .nav-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
  }
  
  .nav-group-header {
    color: #a1a1aa;
  }
  
  .nav-group-header:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
  }
  
  .nav-subitem {
    color: #a1a1aa;
  }
  
  .nav-subitem:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
  }
  
  .nav-group-content {
    background: rgba(255, 255, 255, 0.02);
    border-left-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
