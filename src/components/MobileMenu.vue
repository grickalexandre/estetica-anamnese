<template>
  <div class="mobile-menu">
    <!-- Header Mobile -->
    <header class="mobile-header">
      <div class="mobile-header-content">
        <div class="mobile-brand">
          <div class="brand-icon">
            <i class="fas fa-spa"></i>
          </div>
          <div class="brand-text">
            <h3>{{ configuracoes.nomeClinica || 'Clínica Estética' }}</h3>
            <span v-if="configuracoes.nomeProprietario" class="proprietario">
              <i class="fas fa-user-md"></i>
              {{ configuracoes.nomeProprietario }}
            </span>
          </div>
        </div>
        <button @click="toggleMenu" class="menu-toggle">
          <i :class="menuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
        </button>
      </div>
    </header>

    <!-- Overlay -->
    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu"></div>

    <!-- Sidebar Mobile -->
    <div class="mobile-sidebar" :class="{ 'open': menuOpen }">
      <div class="mobile-sidebar-content">
        <!-- Menu Items -->
        <nav class="mobile-nav">
          <router-link to="/dashboard" class="mobile-nav-item" @click="closeMenu">
            <i class="fas fa-chart-pie"></i>
            <span>Dashboard</span>
          </router-link>

          <router-link to="/agenda" class="mobile-nav-item" @click="closeMenu">
            <i class="fas fa-calendar-alt"></i>
            <span>Agenda</span>
          </router-link>

          <router-link to="/lista" class="mobile-nav-item notification-badge" @click="closeMenu">
            <i class="fas fa-users"></i>
            <span>Pacientes</span>
            <span v-if="pendingCount > 0" class="notification-count">{{ pendingCount }}</span>
          </router-link>

          <!-- Cadastros -->
          <div class="mobile-nav-group">
            <div class="mobile-nav-group-header" @click="toggleCadastros">
              <i class="fas fa-database"></i>
              <span>Cadastros</span>
              <i class="fas fa-chevron-down" :class="{ 'rotated': showCadastros }"></i>
            </div>
            <div v-if="showCadastros" class="mobile-nav-group-content">
              <router-link to="/fornecedores" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-truck"></i>
                <span>Fornecedores</span>
              </router-link>
              <router-link to="/produtos" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-box"></i>
                <span>Produtos</span>
              </router-link>
              <router-link to="/procedimentos" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-spa"></i>
                <span>Procedimentos</span>
              </router-link>
            </div>
          </div>

          <!-- Financeiro -->
          <div class="mobile-nav-group">
            <div class="mobile-nav-group-header" @click="toggleFinanceiro">
              <i class="fas fa-dollar-sign"></i>
              <span>Financeiro</span>
              <i class="fas fa-chevron-down" :class="{ 'rotated': showFinanceiro }"></i>
            </div>
            <div v-if="showFinanceiro" class="mobile-nav-group-content">
              <router-link to="/financeiro" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-chart-line"></i>
                <span>Visão Geral</span>
              </router-link>
              <router-link to="/financeiro/contas-pagar" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-credit-card"></i>
                <span>Contas a Pagar</span>
              </router-link>
              <router-link to="/financeiro/contas-receber" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-money-bill-wave"></i>
                <span>Contas a Receber</span>
              </router-link>
              <router-link to="/financeiro/fluxo-caixa" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-exchange-alt"></i>
                <span>Fluxo de Caixa</span>
              </router-link>
              <router-link to="/financeiro/plano-contas" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-sitemap"></i>
                <span>Plano de Contas</span>
              </router-link>
              <router-link to="/financeiro/relatorio-dre" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-file-invoice"></i>
                <span>Relatório DRE</span>
              </router-link>
              <router-link to="/financeiro/analise-tendencias" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-chart-area"></i>
                <span>Análise de Tendências</span>
              </router-link>
            </div>
          </div>

          <div class="mobile-nav-group">
            <div class="mobile-nav-group-header" @click="toggleRelatorios">
              <i class="fas fa-chart-bar"></i>
              <span>Relatórios</span>
              <i class="fas fa-chevron-down" :class="{ 'rotated': showRelatorios }"></i>
            </div>
            <div v-if="showRelatorios" class="mobile-nav-group-content">
              <router-link to="/relatorios" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-file-alt"></i>
                <span>Relatórios Gerais</span>
              </router-link>
              <router-link to="/relatorio-atendimentos" class="mobile-nav-subitem" @click="closeMenu">
                <i class="fas fa-user-md"></i>
                <span>Atendimentos</span>
              </router-link>
            </div>
          </div>

          <router-link to="/configuracoes" class="mobile-nav-item" @click="closeMenu">
            <i class="fas fa-cog"></i>
            <span>Configurações</span>
          </router-link>

          <router-link v-if="isAuthenticated" to="/planos" class="mobile-nav-item plan-link" @click="closeMenu">
            <i class="fas fa-crown"></i>
            <span>Planos</span>
            <span v-if="isFree" class="badge-free">FREE</span>
          </router-link>

          <button v-if="isAuthenticated" @click="handleLogout" class="mobile-nav-item logout-btn">
            <i class="fas fa-sign-out-alt"></i>
            <span>Sair</span>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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

// Estado
const menuOpen = ref(false)
const showCadastros = ref(false)
const showFinanceiro = ref(false)
const showRelatorios = ref(false)

// Métodos
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const toggleCadastros = () => {
  showCadastros.value = !showCadastros.value
}

const toggleFinanceiro = () => {
  showFinanceiro.value = !showFinanceiro.value
}

const toggleRelatorios = () => {
  showRelatorios.value = !showRelatorios.value
}

const handleLogout = async () => {
  try {
    await logout()
    emit('logout')
    closeMenu()
    router.push('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}
</script>

<style scoped>
.mobile-menu {
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu {
    display: block;
  }

  .mobile-header {
    background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding: 12px 16px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1001;
    backdrop-filter: blur(10px);
  }

  .mobile-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 100%;
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .brand-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #1d1d1f 0%, #424245 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    flex-shrink: 0;
  }

  .brand-text {
    flex: 1;
    min-width: 0;
  }

  .brand-text h3 {
    margin: 0;
    font-size: 14px;
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
    gap: 4px;
    font-size: 11px;
    color: #8e8e93;
    margin-top: 1px;
  }

  .proprietario i {
    font-size: 9px;
  }

  .menu-toggle {
    background: none;
    border: none;
    color: #1d1d1f;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
    font-size: 18px;
  }

  .menu-toggle:hover {
    background: rgba(29, 29, 31, 0.1);
  }

  .menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.3s ease;
  }

  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  }

  .mobile-sidebar.open {
    transform: translateX(0);
  }

  .mobile-sidebar-content {
    padding-top: 80px;
    height: 100%;
    overflow-y: auto;
  }

  .mobile-nav {
    padding: 16px 0;
  }

  .mobile-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    color: #6b7280;
    text-decoration: none;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 15px;
    position: relative;
  }

  .mobile-nav-item:hover {
    background: rgba(29, 29, 31, 0.05);
    color: #1d1d1f;
  }

  .mobile-nav-item.router-link-active {
    background: linear-gradient(135deg, #1d1d1f 0%, #424245 100%);
    color: white;
  }

  .mobile-nav-item.router-link-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #1d1d1f;
  }

  .mobile-nav-item i {
    width: 20px;
    font-size: 16px;
    text-align: center;
  }

  .notification-count {
    background: #ef4444;
    color: white;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 600;
    margin-left: auto;
    min-width: 18px;
    text-align: center;
  }

  .mobile-nav-group {
    margin-bottom: 4px;
  }

  .mobile-nav-group-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 15px;
  }

  .mobile-nav-group-header:hover {
    background: rgba(29, 29, 31, 0.05);
    color: #1d1d1f;
  }

  .mobile-nav-group-header i:last-child {
    margin-left: auto;
    transition: transform 0.2s ease;
    font-size: 12px;
  }

  .mobile-nav-group-header i:last-child.rotated {
    transform: rotate(180deg);
  }

  .mobile-nav-group-content {
    background: rgba(29, 29, 31, 0.02);
    border-left: 2px solid rgba(29, 29, 31, 0.1);
    margin-left: 20px;
    margin-right: 8px;
    border-radius: 0 8px 8px 0;
    overflow: hidden;
    animation: slideDown 0.2s ease;
  }

  .mobile-nav-subitem {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px 12px 24px;
    color: #6b7280;
    text-decoration: none;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
  }

  .mobile-nav-subitem:hover {
    background: rgba(29, 29, 31, 0.05);
    color: #1d1d1f;
  }

  .mobile-nav-subitem.router-link-active {
    background: rgba(29, 29, 31, 0.1);
    color: #1d1d1f;
    font-weight: 600;
  }

  .mobile-nav-subitem i {
    width: 16px;
    font-size: 13px;
    color: #8e8e93;
  }

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

  .logout-btn {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    width: 100%;
    text-align: left;
  }

  .logout-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Scrollbar */
  .mobile-sidebar-content::-webkit-scrollbar {
    width: 4px;
  }

  .mobile-sidebar-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .mobile-sidebar-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  .mobile-sidebar-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
