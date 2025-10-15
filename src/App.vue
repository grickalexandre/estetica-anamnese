<template>
  <div id="app" :class="{ 'no-menu-layout': isClientPage }">
    <header v-if="!isClientPage" class="header">
      <div class="header-content">
        <div class="header-left">
          <h2>{{ configuracoes.nomeClinica || '🌸 Clínica de Estética' }}</h2>
          <div v-if="!carregando && configuracoes.nomeProprietario" class="header-info">
            <span class="proprietario-name">
              <i class="fas fa-user-md"></i>
              {{ configuracoes.nomeProprietario }}
            </span>
            <span v-if="configuracoes.telefone" class="header-contact">
              <i class="fas fa-phone"></i>
              {{ configuracoes.telefone }}
            </span>
            <button @click="toggleClinicInfo" class="clinic-info-btn" :class="{ active: showClinicInfo }">
              <i class="fas fa-info-circle"></i>
            </button>
          </div>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link">
            <i class="fas fa-home nav-icon"></i>
            <span class="nav-text">Início</span>
          </router-link>
          <router-link to="/nova" class="nav-link">
            <i class="fas fa-plus nav-icon"></i>
            <span class="nav-text">Nova Anamnese</span>
          </router-link>
          <router-link to="/lista" class="nav-link notification-badge">
            <i class="fas fa-users nav-icon"></i>
            <span class="nav-text">Pacientes</span>
            <span v-if="pendingCount > 0" class="notification-count">{{ pendingCount }}</span>
          </router-link>
          <router-link to="/relatorios" class="nav-link">
            <i class="fas fa-chart-bar nav-icon"></i>
            <span class="nav-text">Relatórios</span>
          </router-link>
          <router-link to="/configuracoes" class="nav-link">
            <i class="fas fa-cog nav-icon"></i>
            <span class="nav-text">Configurações</span>
          </router-link>
        </nav>
      </div>
      
      <!-- Dropdown com informações completas da clínica -->
      <div v-if="showClinicInfo && !carregando" class="clinic-info-dropdown">
        <div class="clinic-info-content">
          <div class="clinic-info-header">
            <h3><i class="fas fa-building"></i> {{ configuracoes.nomeClinica }}</h3>
            <button @click="toggleClinicInfo" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="clinic-info-grid">
            <div v-if="configuracoes.nomeProprietario" class="info-item">
              <i class="fas fa-user-md"></i>
              <div>
                <strong>Proprietário:</strong>
                <span>{{ configuracoes.nomeProprietario }}</span>
                <span v-if="configuracoes.registroProfissional"> - {{ configuracoes.registroProfissional }}</span>
              </div>
            </div>
            
            <div v-if="configuracoes.endereco" class="info-item">
              <i class="fas fa-map-marker-alt"></i>
              <div>
                <strong>Endereço:</strong>
                <span>{{ configuracoes.endereco }}</span>
              </div>
            </div>
            
            <div v-if="configuracoes.telefone" class="info-item">
              <i class="fas fa-phone"></i>
              <div>
                <strong>Telefone:</strong>
                <span>{{ configuracoes.telefone }}</span>
                <span v-if="configuracoes.whatsapp"> | WhatsApp: {{ configuracoes.whatsapp }}</span>
              </div>
            </div>
            
            <div v-if="configuracoes.email" class="info-item">
              <i class="fas fa-envelope"></i>
              <div>
                <strong>Email:</strong>
                <span>{{ configuracoes.email }}</span>
              </div>
            </div>
            
            <div v-if="configuracoes.website" class="info-item">
              <i class="fas fa-globe"></i>
              <div>
                <strong>Website:</strong>
                <a :href="configuracoes.website" target="_blank">{{ configuracoes.website }}</a>
              </div>
            </div>
            
            <div v-if="configuracoes.horarioSegSex" class="info-item">
              <i class="fas fa-clock"></i>
              <div>
                <strong>Horário:</strong>
                <span>{{ configuracoes.horarioSegSex }}</span>
                <span v-if="configuracoes.horarioSabado"> | Sábado: {{ configuracoes.horarioSabado }}</span>
              </div>
            </div>
            
            <div v-if="configuracoes.especialidades" class="info-item full-width">
              <i class="fas fa-star"></i>
              <div>
                <strong>Especialidades:</strong>
                <span>{{ configuracoes.especialidades }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <router-view></router-view>
    
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
import { useRoute } from 'vue-router'
import { db } from './firebase.js'
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { useConfiguracoes } from './composables/useConfiguracoes'
import { useClinica } from './composables/useClinica.js'

const route = useRoute()
const pendingCount = ref(0)
const notification = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

const { configuracoes, carregando } = useConfiguracoes()
const { clinicaId, inicializarClinica } = useClinica()
const showClinicInfo = ref(false)

const isClientPage = computed(() => {
  return route.path === '/anamnese-cliente'
})

const toggleClinicInfo = () => {
  showClinicInfo.value = !showClinicInfo.value
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

onMounted(async () => {
  // Inicializar contexto da clínica
  await inicializarClinica()
  
  // Atualizar contador de pendentes apenas para área administrativa
  if (!isClientPage.value) {
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
.notification-count {
  background: #1d1d1f;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #8e8e93;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-size: 16px;
  letter-spacing: -0.022em;
}

.nav-icon {
  font-size: 18px;
  min-width: 20px;
  text-align: center;
  color: inherit;
}

.nav-text {
  flex: 1;
}

.nav-link:hover {
  background: rgba(29, 29, 31, 0.1);
  color: #1d1d1f;
  transform: scale(1.05);
}

.nav-link.router-link-active {
  background: #1d1d1f;
  color: white;
  box-shadow: 0 2px 8px rgba(29, 29, 31, 0.2);
}

/* Mobile navigation improvements */
@media (max-width: 768px) {
  .nav-link {
    flex-direction: column;
    gap: 4px;
    padding: 12px 8px;
    text-align: center;
    min-height: 60px;
    justify-content: center;
  }
  
  .nav-icon {
    font-size: 20px;
  }
  
  .nav-text {
    font-size: 12px;
    font-weight: 600;
  }
  
  .notification-count {
    position: absolute;
    top: 8px;
    right: 8px;
    margin: 0;
    font-size: 10px;
    padding: 1px 4px;
    min-width: 16px;
    text-align: center;
  }
}

/* Touch optimizations */
@media (hover: none) and (pointer: coarse) {
  .nav-link:hover {
    transform: none;
  }
  
  .nav-link:active {
    transform: scale(0.95);
  }
}

/* Estilos para informações da clínica no header */
.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.header-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.proprietario-name,
.header-contact {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8e8e93;
  font-weight: 500;
}

.proprietario-name i,
.header-contact i {
  font-size: 11px;
  color: #1d1d1f;
}

.clinic-info-btn {
  background: none;
  border: none;
  color: #8e8e93;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 12px;
}

.clinic-info-btn:hover,
.clinic-info-btn.active {
  color: #1d1d1f;
  background: rgba(29, 29, 31, 0.1);
}

.clinic-info-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideDown 0.3s ease;
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

.clinic-info-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.clinic-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.clinic-info-header h3 {
  margin: 0;
  color: #1d1d1f;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  color: #8e8e93;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.close-btn:hover {
  color: #1d1d1f;
  background: rgba(29, 29, 31, 0.1);
}

.clinic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(29, 29, 31, 0.05);
  border-radius: 8px;
  border-left: 3px solid #1d1d1f;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item i {
  color: #1d1d1f;
  font-size: 14px;
  margin-top: 2px;
  min-width: 14px;
}

.info-item div {
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
}

.info-item strong {
  color: #1d1d1f;
  font-weight: 600;
  display: block;
  margin-bottom: 2px;
}

.info-item span {
  color: #6b7280;
}

.info-item a {
  color: #1d1d1f;
  text-decoration: none;
  font-weight: 500;
}

.info-item a:hover {
  text-decoration: underline;
}

/* Mobile styles for header info */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-left {
    width: 100%;
  }
  
  .header-info {
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .proprietario-name,
  .header-contact {
    font-size: 11px;
  }
  
  .nav {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .proprietario-name,
  .header-contact {
    font-size: 10px;
  }
  
  .clinic-info-content {
    padding: 16px;
  }
  
  .clinic-info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .info-item {
    padding: 10px 12px;
  }
  
  .info-item div {
    font-size: 12px;
  }
}
</style>


