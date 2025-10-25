<template>
  <PWALayout>
    <div class="pwa-home">
      <!-- Cartão virtual -->
    <div class="header-section">
      <div class="virtual-card">
        <div class="card-header">
          <div class="clinic-logo">
            <i class="fas fa-heartbeat"></i>
            <span>Clínica Estética</span>
          </div>
        </div>
        <div class="card-content">
          <div class="card-number">{{ userInfo?.nome || 'Usuário' }}</div>
          <div class="card-holder">{{ userInfo?.email || 'cliente@email.com' }}</div>
        </div>
        <div class="card-actions">
          <button class="card-btn primary">
            <i class="fas fa-calendar-alt"></i>
            AGENDA
          </button>
          <button class="card-btn secondary">
            <i class="fas fa-user-plus"></i>
            NOVO PACIENTE
          </button>
        </div>
      </div>
    </div>

    <!-- Favoritos -->
    <div class="favorites-section">
      <h2 class="section-title">Favoritos</h2>
      <div class="favorites-grid">
        <div class="favorite-item" @click="navigateTo('/agenda')">
          <div class="favorite-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <span>Agenda</span>
        </div>
        <div class="favorite-item" @click="navigateTo('/lista')">
          <div class="favorite-icon">
            <i class="fas fa-users"></i>
          </div>
          <span>Pacientes</span>
        </div>
        <div class="favorite-item" @click="navigateTo('/financeiro')">
          <div class="favorite-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <span>Financeiro</span>
        </div>
        <div class="favorite-item" @click="navigateTo('/relatorios')">
          <div class="favorite-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <span>Relatórios</span>
        </div>
      </div>
    </div>

    <!-- Acompanhamento -->
    <div class="tracking-section">
      <div class="tracking-card">
        <div class="tracking-header">
          <i class="fas fa-clock"></i>
          <h3>Próximos Atendimentos</h3>
        </div>
        <div class="tracking-content">
          <p>Acompanhe seus próximos compromissos</p>
          <div class="tracking-status" v-if="proximosAtendimentos.length === 0">
            <i class="fas fa-calendar-check"></i>
            <span>Nenhum atendimento agendado para hoje</span>
          </div>
          <div v-else class="tracking-list">
            <div v-for="atendimento in proximosAtendimentos" :key="atendimento.id" class="tracking-item">
              <div class="tracking-time">{{ formatarHora(atendimento.hora) }}</div>
              <div class="tracking-info">
                <div class="tracking-patient">{{ atendimento.paciente }}</div>
                <div class="tracking-service">{{ atendimento.procedimento }}</div>
              </div>
              <div class="tracking-status-badge" :class="atendimento.status">
                {{ atendimento.status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mais Serviços -->
    <div class="services-section">
      <h2 class="section-title">Mais Serviços</h2>
      <div class="services-grid">
        <div class="service-item" @click="navigateTo('/agenda')">
          <div class="service-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <span>Agendamentos</span>
        </div>
        <div class="service-item" @click="navigateTo('/lista')">
          <div class="service-icon">
            <i class="fas fa-user-friends"></i>
          </div>
          <span>Pacientes</span>
        </div>
        <div class="service-item" @click="navigateTo('/financeiro')">
          <div class="service-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <span>Financeiro</span>
        </div>
        <div class="service-item" @click="navigateTo('/relatorios')">
          <div class="service-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <span>Relatórios</span>
        </div>
        <div class="service-item" @click="navigateTo('/configuracoes')">
          <div class="service-icon">
            <i class="fas fa-cog"></i>
          </div>
          <span>Configurações</span>
        </div>
        <div class="service-item highlight" @click="navigateTo('/dashboard')">
          <div class="service-icon">
            <i class="fas fa-plus"></i>
          </div>
          <span>Acessar tudo</span>
        </div>
      </div>
    </div>

    </div>
  </PWALayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase.js'

const router = useRouter()
const userInfo = ref(null)
const proximosAtendimentos = ref([])

onMounted(async () => {
  // Carregar informações do usuário
  if (auth.currentUser) {
    userInfo.value = {
      nome: auth.currentUser.displayName || 'Usuário',
      email: auth.currentUser.email
    }
  }
  
  // Carregar próximos atendimentos (simulado)
  proximosAtendimentos.value = []
})

const navigateTo = (path) => {
  router.push(path)
}

const formatarHora = (hora) => {
  return hora || '09:00'
}
</script>

<style scoped>
.pwa-home {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Header com cartão virtual */
.header-section {
  padding: 20px;
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  margin-bottom: 20px;
}

.virtual-card {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  border-radius: 20px;
  padding: 24px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 168, 89, 0.3);
  position: relative;
  overflow: hidden;
}

.virtual-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.clinic-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
}

.card-content {
  margin-bottom: 24px;
}

.card-number {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-holder {
  font-size: 14px;
  opacity: 0.9;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.card-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.card-btn.primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Seções */
.favorites-section,
.services-section {
  padding: 0 20px 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 16px;
}

/* Favoritos */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.favorite-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.favorite-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  margin-bottom: 8px;
}

.favorite-item span {
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
  text-align: center;
}

/* Acompanhamento */
.tracking-section {
  padding: 0 20px 20px;
}

.tracking-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tracking-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.tracking-header i {
  color: #00A859;
  font-size: 18px;
}

.tracking-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.tracking-content p {
  color: #718096;
  font-size: 14px;
  margin-bottom: 16px;
}

.tracking-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
  color: #718096;
  font-size: 14px;
}

.tracking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tracking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 12px;
}

.tracking-time {
  font-weight: bold;
  color: #00A859;
  font-size: 14px;
  min-width: 50px;
}

.tracking-info {
  flex: 1;
}

.tracking-patient {
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
}

.tracking-service {
  color: #718096;
  font-size: 12px;
}

.tracking-status-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.tracking-status-badge.confirmado {
  background: #c6f6d5;
  color: #22543d;
}

.tracking-status-badge.pendente {
  background: #fef5e7;
  color: #744210;
}

/* Mais Serviços */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.service-item.highlight span {
  color: #FF6B35;
  font-weight: bold;
}

.service-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: 12px;
}

.service-item span {
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
  text-align: center;
}


/* Responsividade */
@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .favorite-item,
  .service-item {
    padding: 12px 6px;
  }
  
  .favorite-icon,
  .service-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .service-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
}
</style>
