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
      
      <!-- Área de ações -->
      <div class="header-actions">
        <!-- Notificação de Anamnese -->
        <div v-if="notificationCount > 0" class="notification-bell" @click="irParaAnamneses">
          <i class="fas fa-bell"></i>
          <span class="notification-badge">{{ notificationCount }}</span>
        </div>
        
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  notificationCount: {
    type: Number,
    default: 0
  }
})

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

const irParaAnamneses = () => {
  router.push('/lista')
}

const showClinicInfo = () => {
  // Implementar modal com informações da clínica
  console.log('Mostrar informações da clínica')
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
  color: #4A5568;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
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

/* Estilos de notificações removidos */

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
  color: #4A5568;
  line-height: 1.2;
}

.clinic-status {
  font-size: 10px;
  color: #00A859;
  font-weight: 500;
}

/* Estilos de logout removidos */

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
