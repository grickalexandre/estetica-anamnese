<template>
  <div class="hero">
    <div class="container">
      <h1>{{ configuracoes.nomeClinica || 'Sistema de Anamnese' }}</h1>
      <p>Gestão completa de fichas de anamnese para sua clínica de estética</p>
      <div class="action-buttons">
        <router-link to="/dashboard">
          <button class="btn btn-primary">
            <i class="fas fa-chart-pie"></i>
            Dashboard Analítico
          </button>
        </router-link>
        <router-link to="/agenda">
          <button class="btn btn-primary">
            <i class="fas fa-calendar-alt"></i>
            Agenda
          </button>
        </router-link>
        <router-link to="/financeiro">
          <button class="btn btn-primary">
            <i class="fas fa-dollar-sign"></i>
            Financeiro
          </button>
        </router-link>
        <button @click="copiarLinkCliente" class="btn btn-accent">
          <i class="fas fa-copy"></i>
          Copiar Link Cliente
        </button>
      </div>
    </div>
  </div>

  <div class="container">
    <!-- Card de Link para Clientes -->
    <div class="card link-cliente-card">
      <div class="link-cliente-content">
        <div class="link-info">
          <h2><i class="fas fa-link"></i> Link para Clientes Preencherem</h2>
          <p>Copie este link e envie para seus clientes via WhatsApp, Email ou SMS</p>
          <div class="url-display">
            <code>{{ linkClienteUrl }}</code>
          </div>
        </div>
        <button @click="copiarLinkCliente" class="btn btn-success btn-large">
          <i class="fas fa-copy"></i>
          Copiar Link
        </button>
      </div>
      <div v-if="showNotification" class="notification-success">
        <i class="fas fa-check-circle"></i>
        {{ notificationMessage }}
      </div>
    </div>

    <div class="card">
      <h2><i class="fas fa-star"></i> Funcionalidades</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
        <div>
          <h3><i class="fas fa-chart-pie"></i> Dashboard Analítico</h3>
          <p>KPIs e indicadores de performance em tempo real</p>
        </div>
        <div>
          <h3><i class="fas fa-calendar-alt"></i> Agenda Inteligente</h3>
          <p>Calendário completo com controle de horários e conflitos</p>
        </div>
        <div>
          <h3><i class="fas fa-dollar-sign"></i> Gestão Financeira</h3>
          <p>Contas a pagar/receber, DRE, fluxo de caixa e análises</p>
        </div>
        <div>
          <h3><i class="fas fa-clipboard-list"></i> Anamneses</h3>
          <p>Formulários completos com upload de fotos</p>
        </div>
        <div>
          <h3><i class="fas fa-file-invoice-dollar"></i> Relatórios</h3>
          <p>DRE, tendências, exportação PDF e gráficos</p>
        </div>
        <div>
          <h3><i class="fas fa-sitemap"></i> Plano de Contas</h3>
          <p>Estrutura DRE profissional e categorias</p>
        </div>
        <div>
          <h3><i class="fas fa-cloud"></i> Multi-tenancy</h3>
          <p>Sistema SaaS com isolamento total de dados</p>
        </div>
        <div>
          <h3><i class="fas fa-user-edit"></i> Link Público</h3>
          <p>Clientes preenchem anamneses online</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Informações da Clínica -->
  <div v-if="!carregando && (configuracoes.nomeProprietario || configuracoes.endereco || configuracoes.telefone)" class="container">
    <div class="card clinic-info">
      <h2><i class="fas fa-building"></i> Informações da Clínica</h2>
      <div class="clinic-details">
        <div v-if="configuracoes.nomeProprietario" class="clinic-item">
          <i class="fas fa-user-md"></i>
          <div>
            <strong>Proprietário:</strong> {{ configuracoes.nomeProprietario }}
            <span v-if="configuracoes.registroProfissional"> - {{ configuracoes.registroProfissional }}</span>
          </div>
        </div>
        <div v-if="configuracoes.endereco" class="clinic-item">
          <i class="fas fa-map-marker-alt"></i>
          <div>
            <strong>Endereço:</strong> {{ configuracoes.endereco }}
          </div>
        </div>
        <div v-if="configuracoes.telefone" class="clinic-item">
          <i class="fas fa-phone"></i>
          <div>
            <strong>Telefone:</strong> {{ configuracoes.telefone }}
            <span v-if="configuracoes.whatsapp"> | WhatsApp: {{ configuracoes.whatsapp }}</span>
          </div>
        </div>
        <div v-if="configuracoes.email" class="clinic-item">
          <i class="fas fa-envelope"></i>
          <div>
            <strong>Email:</strong> {{ configuracoes.email }}
          </div>
        </div>
        <div v-if="configuracoes.horarioSegSex" class="clinic-item">
          <i class="fas fa-clock"></i>
          <div>
            <strong>Horário:</strong> {{ configuracoes.horarioSegSex }}
            <span v-if="configuracoes.horarioSabado"> | Sábado: {{ configuracoes.horarioSabado }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Notificação de Link Copiado -->
  <div v-if="showNotification" class="notification-overlay">
    <div class="notification-card">
      <i class="fas fa-check-circle"></i>
      <span>{{ notificationMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useConfiguracoes } from '../composables/useConfiguracoes'
import { useClinica } from '../composables/useClinica.js'

const { configuracoes, carregando } = useConfiguracoes()
const { clinicaId } = useClinica()
const showNotification = ref(false)
const notificationMessage = ref('')

const linkClienteUrl = computed(() => {
  const baseUrl = window.location.origin
  return `${baseUrl}/anamnese-cliente`
})

const copiarLinkCliente = async () => {
  try {
    // Gerar o link baseado no clinicaId detectado
    const baseUrl = window.location.origin
    const linkCliente = `${baseUrl}/anamnese-cliente`
    
    // Copiar para a área de transferência
    await navigator.clipboard.writeText(linkCliente)
    
    // Mostrar notificação de sucesso
    notificationMessage.value = 'Link copiado para a área de transferência!'
    showNotification.value = true
    
    setTimeout(() => {
      showNotification.value = false
    }, 3000)
    
    console.log('Link do cliente copiado:', linkCliente)
  } catch (err) {
    console.error('Erro ao copiar link:', err)
    
    // Fallback: mostrar o link em um prompt
    const baseUrl = window.location.origin
    const linkCliente = `${baseUrl}/anamnese-cliente`
    alert(`Link do cliente: ${linkCliente}`)
  }
}
</script>

<style scoped>
.clinic-info {
  margin-top: 20px;
}

.clinic-details {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

.clinic-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(29, 29, 31, 0.05);
  border-radius: 8px;
  border-left: 3px solid #1d1d1f;
}

.clinic-item i {
  color: #1d1d1f;
  font-size: 16px;
  margin-top: 2px;
  min-width: 16px;
}

.clinic-item div {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
}

.clinic-item strong {
  color: #1d1d1f;
  font-weight: 600;
}

@media (max-width: 768px) {
  .clinic-item {
    padding: 10px 12px;
  }
  
  .clinic-item div {
    font-size: 13px;
  }
}

/* Card de Link para Clientes */
.link-cliente-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 24px;
  border: none;
}

.link-cliente-card h2 {
  color: white;
  margin: 0 0 8px 0;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.link-cliente-card p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px 0;
  font-size: 14px;
}

.link-cliente-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.link-info {
  flex: 1;
}

.url-display {
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.url-display code {
  color: white;
  font-size: 13px;
  word-break: break-all;
}

.notification-success {
  background: rgba(52, 199, 89, 0.2);
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideDown 0.3s ease-out;
}

.notification-success i {
  color: #34c759;
  font-size: 18px;
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

@media (max-width: 768px) {
  .link-cliente-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-large {
    width: 100%;
  }
}

/* Notificação de Link Copiado */
.notification-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.notification-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 0.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
}

.notification-card i {
  color: #34c759;
  font-size: 18px;
}

.notification-card span {
  color: #1d1d1f;
  font-weight: 500;
  font-size: 14px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .notification-overlay {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notification-card {
    min-width: auto;
    padding: 14px 16px;
  }
}
</style>


