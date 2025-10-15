<template>
  <div class="hero">
    <div class="container">
      <h1>{{ configuracoes.nomeClinica || 'Sistema de Anamnese' }}</h1>
      <p>Gestão completa de fichas de anamnese para sua clínica de estética</p>
      <div class="action-buttons">
        <router-link to="/nova">
          <button class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Nova Anamnese
          </button>
        </router-link>
        <router-link to="/lista">
          <button class="btn btn-secondary">
            <i class="fas fa-users"></i>
            Ver Pacientes
          </button>
        </router-link>
        <button @click="copiarLinkCliente" class="btn btn-accent">
          <i class="fas fa-copy"></i>
          Copiar Link Cliente
        </button>
        <router-link to="/relatorios">
          <button class="btn btn-secondary">
            <i class="fas fa-chart-bar"></i>
            Relatórios
          </button>
        </router-link>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="card">
      <h2><i class="fas fa-star"></i> Funcionalidades</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
        <div>
          <h3><i class="fas fa-clipboard-list"></i> Cadastro Completo</h3>
          <p>Formulário completo de anamnese com todos os campos necessários</p>
        </div>
        <div>
          <h3><i class="fas fa-camera"></i> Fotos do Paciente</h3>
          <p>Upload e armazenamento seguro de fotos dos pacientes</p>
        </div>
        <div>
          <h3><i class="fas fa-search"></i> Busca Rápida</h3>
          <p>Encontre rapidamente as fichas dos seus pacientes</p>
        </div>
        <div>
          <h3><i class="fas fa-cloud"></i> Armazenamento em Nuvem</h3>
          <p>Dados seguros com Firebase Firestore e Storage</p>
        </div>
        <div>
          <h3><i class="fas fa-user-edit"></i> Anamnese do Cliente</h3>
          <p>Link público para clientes preencherem suas anamneses</p>
        </div>
        <div>
          <h3><i class="fas fa-chart-line"></i> Controle de Status</h3>
          <p>Acompanhe quais anamneses estão pendentes de análise</p>
        </div>
        <div>
          <h3><i class="fas fa-chart-bar"></i> Relatórios e Estatísticas</h3>
          <p>Visualize métricas e gráficos detalhados da clínica</p>
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
import { ref } from 'vue'
import { useConfiguracoes } from '../composables/useConfiguracoes'
import { useClinica } from '../composables/useClinica.js'

const { configuracoes, carregando } = useConfiguracoes()
const { clinicaId } = useClinica()
const showNotification = ref(false)
const notificationMessage = ref('')

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


