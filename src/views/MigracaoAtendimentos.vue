<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-database"></i> Migração de Atendimentos</h1>
        <VoltarHome />
      </div>
    </div>

    <div class="card info-card">
      <h2><i class="fas fa-info-circle"></i> Sobre esta Migração</h2>
      <p>
        Este processo irá migrar todos os agendamentos marcados como <strong>"Realizados"</strong> 
        para a coleção de <strong>"Atendimentos"</strong>, garantindo que apareçam corretamente 
        na página de "Atendimentos Realizados" e no sistema financeiro.
      </p>
      
      <div class="warning-box">
        <i class="fas fa-exclamation-triangle"></i>
        <div>
          <strong>Importante:</strong>
          <ul>
            <li>Este processo pode ser executado múltiplas vezes com segurança</li>
            <li>Agendamentos que já possuem atendimentos não serão duplicados</li>
            <li>Atendimentos migrados serão marcados com flag "migrado: true"</li>
            <li>O processo pode levar alguns minutos dependendo da quantidade de dados</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card action-card">
      <h2><i class="fas fa-play-circle"></i> Executar Migração</h2>
      
      <div v-if="!executando && !resultado" class="action-section">
        <p>Clique no botão abaixo para iniciar a migração:</p>
        <button @click="executarMigracao" class="btn btn-primary btn-large">
          <i class="fas fa-sync-alt"></i>
          Iniciar Migração de Dados
        </button>
      </div>

      <div v-if="executando" class="loading-section">
        <div class="spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <h3>Migrando Dados...</h3>
        <p>Por favor, aguarde. Não feche esta página.</p>
      </div>

      <div v-if="resultado && !executando" class="result-section">
        <div class="result-header" :class="resultado.success ? 'success' : 'error'">
          <i :class="resultado.success ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          <h3>{{ resultado.success ? 'Migração Concluída!' : 'Erro na Migração' }}</h3>
        </div>

        <div class="result-stats">
          <div class="stat-item">
            <div class="stat-label">Total de Agendamentos Realizados</div>
            <div class="stat-value">{{ resultado.total }}</div>
          </div>
          <div class="stat-item success">
            <div class="stat-label">Migrados com Sucesso</div>
            <div class="stat-value">{{ resultado.migrados }}</div>
          </div>
          <div class="stat-item info">
            <div class="stat-label">Já Existentes (Não Duplicados)</div>
            <div class="stat-value">{{ resultado.jaExistentes }}</div>
          </div>
          <div class="stat-item error" v-if="resultado.erros > 0">
            <div class="stat-label">Erros</div>
            <div class="stat-value">{{ resultado.erros }}</div>
          </div>
        </div>

        <div v-if="resultado.erros > 0 && resultado.errosDetalhados" class="errors-section">
          <h4><i class="fas fa-exclamation-circle"></i> Detalhes dos Erros</h4>
          <div class="error-list">
            <div v-for="(erro, index) in resultado.errosDetalhados" :key="index" class="error-item">
              <div class="error-info">
                <strong>{{ erro.cliente }}</strong>
                <small>ID: {{ erro.agendamentoId }}</small>
              </div>
              <div class="error-message">{{ erro.erro }}</div>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <button @click="verAtendimentos" class="btn btn-primary">
            <i class="fas fa-clipboard-check"></i>
            Ver Atendimentos Realizados
          </button>
          <button @click="resetarMigracao" class="btn btn-secondary">
            <i class="fas fa-redo"></i>
            Executar Novamente
          </button>
        </div>
      </div>
    </div>

    <div class="card help-card">
      <h2><i class="fas fa-question-circle"></i> Perguntas Frequentes</h2>
      
      <div class="faq-item">
        <h4>O que acontece se eu executar a migração mais de uma vez?</h4>
        <p>O sistema detecta automaticamente quais agendamentos já foram migrados e não os duplica.</p>
      </div>

      <div class="faq-item">
        <h4>Os dados financeiros são criados automaticamente?</h4>
        <p>Sim! Para cada atendimento migrado, o sistema cria automaticamente as contas a receber no financeiro.</p>
      </div>

      <div class="faq-item">
        <h4>Posso desfazer a migração?</h4>
        <p>Os registros migrados são marcados com a flag "migrado: true" para fácil identificação, mas recomendamos não desfazer pois podem haver lançamentos financeiros associados.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClinica } from '../composables/useClinica.js'
import { executarMigracao } from '../utils/migrarAgendamentosRealizados.js'
import VoltarHome from '../components/VoltarHome.vue'

const router = useRouter()
const { clinicaId } = useClinica()

const executando = ref(false)
const resultado = ref(null)

const executarMigracao = async () => {
  try {
    executando.value = true
    resultado.value = null
    
    console.log('Iniciando migração...')
    const res = await executarMigracao()
    
    resultado.value = res
    
    if (res.success) {
      console.log('✅ Migração concluída com sucesso!')
    } else {
      console.error('❌ Migração falhou:', res.error)
    }
    
  } catch (error) {
    console.error('Erro ao executar migração:', error)
    resultado.value = {
      success: false,
      error: error.message,
      total: 0,
      migrados: 0,
      jaExistentes: 0,
      erros: 1
    }
  } finally {
    executando.value = false
  }
}

const resetarMigracao = () => {
  resultado.value = null
}

const verAtendimentos = () => {
  router.push('/atendimentos-realizados')
}
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-content h1 {
  font-size: 28px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.info-card {
  margin-bottom: 24px;
}

.info-card h2 {
  font-size: 20px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.info-card p {
  color: #6e6e73;
  line-height: 1.6;
  margin-bottom: 16px;
}

.warning-box {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 159, 10, 0.1);
  border-left: 4px solid #ff9f0a;
  border-radius: 8px;
  margin-top: 16px;
}

.warning-box i {
  color: #ff9f0a;
  font-size: 24px;
  margin-top: 4px;
}

.warning-box ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.warning-box li {
  margin-bottom: 6px;
  color: #6e6e73;
}

.action-card {
  margin-bottom: 24px;
}

.action-card h2 {
  font-size: 20px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.action-section {
  text-align: center;
  padding: 40px 20px;
}

.action-section p {
  color: #6e6e73;
  margin-bottom: 24px;
  font-size: 16px;
}

.btn-large {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
}

.loading-section {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  font-size: 48px;
  color: #007AFF;
  margin-bottom: 16px;
}

.loading-section h3 {
  font-size: 20px;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.loading-section p {
  color: #6e6e73;
}

.result-section {
  padding: 24px 0;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.result-header.success {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.result-header.error {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.result-header i {
  font-size: 32px;
}

.result-header h3 {
  font-size: 24px;
  margin: 0;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e5e5ea;
  background: white;
}

.stat-item.success {
  border-color: #34c759;
  background: rgba(52, 199, 89, 0.05);
}

.stat-item.info {
  border-color: #007AFF;
  background: rgba(0, 122, 255, 0.05);
}

.stat-item.error {
  border-color: #ff3b30;
  background: rgba(255, 59, 48, 0.05);
}

.stat-label {
  font-size: 12px;
  color: #6e6e73;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
}

.stat-item.success .stat-value {
  color: #34c759;
}

.stat-item.info .stat-value {
  color: #007AFF;
}

.stat-item.error .stat-value {
  color: #ff3b30;
}

.errors-section {
  background: rgba(255, 59, 48, 0.05);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.errors-section h4 {
  font-size: 16px;
  color: #ff3b30;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-item {
  padding: 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #ff3b30;
}

.error-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.error-info strong {
  color: #1d1d1f;
  font-size: 14px;
}

.error-info small {
  color: #6e6e73;
  font-size: 12px;
}

.error-message {
  color: #ff3b30;
  font-size: 13px;
  font-family: monospace;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.help-card h2 {
  font-size: 20px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.faq-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e5ea;
}

.faq-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.faq-item h4 {
  font-size: 16px;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.faq-item p {
  color: #6e6e73;
  line-height: 1.6;
  margin: 0;
}
</style>

