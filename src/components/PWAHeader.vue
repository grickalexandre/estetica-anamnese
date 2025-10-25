<template>
  <div class="pwa-header">
    <div class="header-content">
      <!-- Botão voltar (apenas quando não estiver na home) -->
      <button 
        v-if="showBackButton" 
        @click="goBack" 
        class="back-button"
      >
        <i class="fas fa-arrow-left"></i>
      </button>
      
      <!-- Título da página -->
      <div class="page-title">
        <h1>{{ pageTitle }}</h1>
      </div>
      
      <!-- Área de notificações e ações -->
      <div class="header-actions">
        <!-- Notificações -->
        <button class="notification-btn" @click="toggleNotifications">
          <i class="fas fa-bell"></i>
          <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
        </button>
        
        <!-- Dados da clínica -->
        <div class="clinic-info" @click="showClinicInfo">
          <div class="clinic-avatar">
            <i class="fas fa-heartbeat"></i>
          </div>
          <div class="clinic-details">
            <span class="clinic-name">{{ clinicName }}</span>
            <span class="clinic-status">Online</span>
          </div>
        </div>
        
        <!-- Botão sair -->
        <button class="logout-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from '../firebase.js'

const router = useRouter()
const route = useRoute()

const notificationCount = ref(3)
const clinicName = ref('Clínica Estética')

// Títulos das páginas
const pageTitles = {
  '/': 'Início',
  '/agenda': 'Agenda',
  '/lista': 'Pacientes',
  '/financeiro': 'Financeiro',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações'
}

const pageTitle = computed(() => {
  return pageTitles[route.path] || 'Sistema'
})

const showBackButton = computed(() => {
  return route.path !== '/'
})

const goBack = () => {
  router.go(-1)
}

const toggleNotifications = () => {
  // Implementar lógica de notificações
  console.log('Abrir notificações')
}

const showClinicInfo = () => {
  // Implementar modal com informações da clínica
  console.log('Mostrar informações da clínica')
}

const logout = async () => {
  try {
    await auth.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}
</script>

<style scoped>
.pwa-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  background: none;
  border: none;
  color: #00A859;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #E8F5E8;
  transform: translateX(-2px);
}

.page-title h1 {
  font-size: 18px;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  color: #718096;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.notification-btn:hover {
  color: #00A859;
  background: #E8F5E8;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #FF6B35;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.clinic-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.clinic-info:hover {
  background: #E8F5E8;
}

.clinic-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.clinic-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.clinic-name {
  font-size: 12px;
  font-weight: 500;
  color: #2d3748;
  line-height: 1.2;
}

.clinic-status {
  font-size: 10px;
  color: #00A859;
  font-weight: 500;
}

.logout-btn {
  background: none;
  border: none;
  color: #e53e3e;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #fed7d7;
  transform: scale(1.1);
}

/* Responsividade */
@media (max-width: 768px) {
  .pwa-header {
    padding: 8px 16px;
  }
  
  .header-content {
    gap: 12px;
  }
  
  .page-title h1 {
    font-size: 16px;
  }
  
  .clinic-details {
    display: none;
  }
  
  .clinic-info {
    padding: 4px;
  }
}

@media (max-width: 480px) {
  .header-actions {
    gap: 8px;
  }
  
  .clinic-info {
    gap: 4px;
  }
  
  .clinic-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>
