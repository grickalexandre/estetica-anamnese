<template>
  <div class="sidebar" :class="{ 'collapsed': collapsed }">
    <!-- Header do Sidebar -->
    <div class="sidebar-header">
      <div class="sidebar-title">
        <h3>{{ getMenuTitle() }}</h3>
        <p>{{ getMenuDescription() }}</p>
      </div>
      <button @click="toggleCollapse" class="collapse-btn" :class="{ 'collapsed': collapsed }">
        <i :class="collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
      </button>
    </div>

    <!-- Menu Dinâmico -->
    <nav class="sidebar-nav">
      <!-- Dashboard -->
      <div v-if="activeMenu === 'dashboard'" class="menu-section">
        <div class="section-title">
          <i class="fas fa-tachometer-alt"></i>
          <span>Visão Geral</span>
        </div>
        <router-link to="/dashboard" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-tachometer-alt"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Dashboard Principal</span>
        </router-link>
      </div>

      <!-- Atendimento -->
      <div v-if="activeMenu === 'atendimento'" class="menu-section">
        <div class="section-title">
          <i class="fas fa-stethoscope"></i>
          <span>Atendimento</span>
        </div>
        <router-link to="/agenda" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Agenda</span>
        </router-link>
        <router-link to="/registrar-atendimento-agendado" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-user-check"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Registrar Atendimento</span>
        </router-link>
      </div>

      <!-- Pacientes -->
      <div v-if="activeMenu === 'pacientes'" class="menu-section">
        <div class="section-title">
          <i class="fas fa-users"></i>
          <span>Gestão de Pacientes</span>
        </div>
        <router-link to="/lista" class="nav-item notification-badge" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-users"></i>
            <span v-if="pendingCount > 0" class="notification-count">{{ pendingCount }}</span>
          </div>
          <span v-if="!collapsed" class="nav-text">Lista de Pacientes</span>
        </router-link>
        <router-link to="/prontuario-eletronico" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-file-medical"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Prontuário Eletrônico</span>
        </router-link>
        <router-link to="/nova" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Nova Anamnese</span>
        </router-link>
      </div>

      <!-- Financeiro -->
      <div v-if="activeMenu === 'financeiro'" class="menu-section">
        <div class="section-title">
          <i class="fas fa-chart-line"></i>
          <span>Gestão Financeira</span>
        </div>
        <router-link to="/financeiro" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-chart-pie"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Visão Geral</span>
        </router-link>
        <router-link to="/financeiro/contas-pagar" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-credit-card"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Contas a Pagar</span>
        </router-link>
        <router-link to="/financeiro/contas-receber" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Contas a Receber</span>
        </router-link>
        <router-link to="/financeiro/fluxo-caixa" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Fluxo de Caixa</span>
        </router-link>
        <router-link to="/financeiro/plano-contas" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-sitemap"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Plano de Contas</span>
        </router-link>
        <router-link to="/financeiro/relatorio-dre" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-file-invoice"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Relatório DRE</span>
        </router-link>
        <router-link to="/financeiro/analise-tendencias" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-chart-area"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Análise de Tendências</span>
        </router-link>
        <router-link to="/financeiro/despesas-recorrentes" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-sync-alt"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Despesas Recorrentes</span>
        </router-link>
        <router-link to="/comissoes" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Comissões</span>
        </router-link>
        <router-link to="/pagamentos" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Pagamentos</span>
        </router-link>
        <router-link to="/precificacao-procedimentos" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-calculator"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Precificação</span>
        </router-link>
        <router-link to="/fluxo-caixa" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Fluxo de Caixa</span>
        </router-link>
      </div>

      <!-- Relatórios -->
      <div v-if="activeMenu === 'relatorios'" class="menu-section">
        <div class="section-title">
          <i class="fas fa-chart-bar"></i>
          <span>Relatórios e Análises</span>
        </div>
        <router-link to="/relatorios" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Relatórios Gerais</span>
        </router-link>
        <router-link to="/relatorio-atendimentos" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-user-md"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Relatório de Atendimentos</span>
        </router-link>
        <router-link to="/avaliacoes" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-star"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Avaliações</span>
        </router-link>
        <router-link to="/auditoria" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Auditoria</span>
        </router-link>
      </div>

      <!-- Gestão -->
      <div v-if="activeMenu === 'gestao'" class="menu-section">
        <div class="section-title">
          <i class="fas fa-users-cog"></i>
          <span>Gestão da Clínica</span>
        </div>
        <router-link to="/equipe-clinica" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-users"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Equipe da Clínica</span>
        </router-link>
        <router-link to="/minha-assinatura" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-credit-card"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Minha Assinatura</span>
        </router-link>
        <router-link to="/planos" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-crown"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Planos</span>
        </router-link>
        <router-link to="/procedimentos" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-spa"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Procedimentos</span>
        </router-link>
      </div>

      <!-- Configurações -->
      <div v-if="activeMenu === 'configuracoes'" class="menu-section">
        <div class="section-title">
          <i class="fas fa-cog"></i>
          <span>Configurações do Sistema</span>
        </div>
        <router-link to="/configuracoes" class="nav-item" :class="{ 'collapsed': collapsed }">
          <div class="nav-icon">
            <i class="fas fa-cog"></i>
          </div>
          <span v-if="!collapsed" class="nav-text">Configurações Gerais</span>
        </router-link>
      </div>
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
const { isAuthenticated, logout } = useAuth()

// Props
const props = defineProps({
  pendingCount: {
    type: Number,
    default: 0
  },
  activeMenu: {
    type: String,
    default: 'dashboard'
  }
})

// Emits
const emit = defineEmits(['logout', 'toggle'])

// Estado do sidebar
const collapsed = ref(false)

// Métodos
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  // Emitir evento para o componente pai
  emit('toggle', collapsed.value)
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

const getMenuTitle = () => {
  const titles = {
    dashboard: 'Dashboard',
    agenda: 'Agenda',
    pacientes: 'Pacientes',
    financeiro: 'Financeiro',
    relatorios: 'Relatórios',
    gestao: 'Gestão',
    configuracoes: 'Configurações'
  }
  return titles[props.activeMenu] || 'Dashboard'
}

const getMenuDescription = () => {
  const descriptions = {
    dashboard: 'Visão geral do sistema',
    agenda: 'Gestão de agendamentos',
    pacientes: 'Cadastro e histórico de pacientes',
    financeiro: 'Controle financeiro completo',
    relatorios: 'Relatórios e análises',
    gestao: 'Gestão da clínica e equipe',
    configuracoes: 'Configurações do sistema'
  }
  return descriptions[props.activeMenu] || 'Visão geral do sistema'
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
  position: relative;
}

.sidebar-title {
  flex: 1;
  min-width: 0;
}

.sidebar-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-title p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #8e8e93;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.collapse-btn.collapsed {
  position: absolute;
  top: 16px;
  right: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.collapse-btn.collapsed:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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

/* Menu Sections */
.menu-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px 8px 20px;
  color: #1d1d1f;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
}

.section-title i {
  font-size: 16px;
  color: #007AFF;
}

.section-title span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Plan Link */

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

/* PWA Safe Area Support */
@supports (padding: max(0px)) {
  .sidebar {
    padding-left: max(0px, env(safe-area-inset-left));
  }
}

/* Touch-friendly sizing for PWA */
@media (display-mode: standalone) {
  .nav-item {
    min-height: 48px;
    padding: 12px 16px;
  }
  
  .nav-item i {
    font-size: 18px;
  }
  
  .collapse-btn {
    min-height: 44px;
    min-width: 44px;
  }
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
