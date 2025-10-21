<template>
  <div class="hero">
    <div class="container">
      <h1>{{ configuracoes.nomeClinica || 'Sistema de Anamnese' }}</h1>
      <p>Gestão completa de fichas de anamnese para sua clínica de estética</p>
      <div class="action-buttons">
        <button @click="navegarPara('/dashboard')" class="btn btn-primary">
          <i class="fas fa-chart-pie"></i>
          Dashboard Analítico
        </button>
        <button @click="navegarPara('/agenda')" class="btn btn-primary">
          <i class="fas fa-calendar-alt"></i>
          Agenda
        </button>
        <button @click="navegarPara('/financeiro')" class="btn btn-primary">
          <i class="fas fa-dollar-sign"></i>
          Financeiro
        </button>
      </div>
    </div>
  </div>

  <div class="container">
    <!-- Conteúdo principal da home -->
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConfiguracoes } from '../composables/useConfiguracoes'
import { useClinica } from '../composables/useClinica.js'

const router = useRouter()
const { configuracoes, carregando } = useConfiguracoes()
const { clinicaId } = useClinica()

const navegarPara = (rota) => {
  console.log('Navegando para:', rota)
  router.push(rota)
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

</style>


