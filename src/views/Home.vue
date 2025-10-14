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
        <a href="/anamnese-cliente" target="_blank">
          <button class="btn btn-accent">
            <i class="fas fa-user-plus"></i>
            Link para Clientes
          </button>
        </a>
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
</template>

<script setup>
import { useConfiguracoes } from '../composables/useConfiguracoes'

const { configuracoes, carregando } = useConfiguracoes()
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
</style>


