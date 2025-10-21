<template>
  <div class="container">
    <div class="header">
      <h1><i class="fas fa-user-md"></i> Registrar Atendimento - Cliente Agendado</h1>
      <p>Selecione um agendamento para registrar o atendimento</p>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Filtrar por Data:</label>
        <input 
          type="date" 
          v-model="filtroData" 
          @change="filtrarAgendamentos"
          class="form-control"
        >
      </div>
      <div class="filter-group">
        <label>Filtrar por Status:</label>
        <select v-model="filtroStatus" @change="filtrarAgendamentos" class="form-control">
          <option value="">Todos os status</option>
          <option value="agendado">Agendado</option>
          <option value="confirmado">Confirmado</option>
          <option value="realizado">Realizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      <button @click="limparFiltros" class="btn btn-secondary">
        <i class="fas fa-times"></i> Limpar Filtros
      </button>
    </div>

    <!-- Lista de Agendamentos -->
    <div class="agendamentos-section">
      <h3><i class="fas fa-calendar-check"></i> Agendamentos Disponíveis</h3>
      
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando agendamentos...
      </div>

      <div v-else-if="agendamentosFiltrados.length === 0" class="no-data">
        <i class="fas fa-calendar-times"></i>
        <p>Nenhum agendamento encontrado</p>
      </div>

      <div v-else class="agendamentos-grid">
        <div 
          v-for="agendamento in agendamentosFiltrados" 
          :key="agendamento.id"
          class="agendamento-card"
          :class="'status-' + agendamento.status"
          @click="selecionarAgendamento(agendamento)"
        >
          <div class="agendamento-header">
            <div class="cliente-info">
              <h4>{{ agendamento.clienteNome }}</h4>
              <p class="procedimento">{{ agendamento.procedimento }}</p>
            </div>
            <div class="status-badge" :class="'status-' + agendamento.status">
              {{ formatarStatus(agendamento.status) }}
            </div>
          </div>
          
          <div class="agendamento-details">
            <div class="detail-item">
              <i class="fas fa-clock"></i>
              <span>{{ formatarDataHora(agendamento.dataHora) }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-user-md"></i>
              <span>{{ agendamento.profissional }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-clock"></i>
              <span>{{ agendamento.duracao }} min</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-dollar-sign"></i>
              <span>R$ {{ formatarMoeda(agendamento.valorEstimado) }}</span>
            </div>
          </div>

          <div class="agendamento-actions">
            <button 
              @click.stop="registrarAtendimento(agendamento)"
              class="btn btn-primary"
              :disabled="agendamento.status === 'realizado'"
            >
              <i class="fas fa-check"></i> Registrar Atendimento
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="modalConfirmacao" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-check-circle"></i> Confirmar Atendimento</h3>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="confirmacao-info">
            <h4>{{ agendamentoSelecionado?.clienteNome }}</h4>
            <p><strong>Procedimento:</strong> {{ agendamentoSelecionado?.procedimento }}</p>
            <p><strong>Data/Hora:</strong> {{ formatarDataHora(agendamentoSelecionado?.dataHora) }}</p>
            <p><strong>Profissional:</strong> {{ agendamentoSelecionado?.profissional }}</p>
            <p><strong>Valor:</strong> R$ {{ formatarMoeda(agendamentoSelecionado?.valorEstimado) }}</p>
          </div>
          
          <div class="form-group">
            <label>Observações do Atendimento:</label>
            <textarea 
              v-model="observacoesAtendimento" 
              placeholder="Observações sobre o atendimento realizado..."
              class="form-control"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="fecharModal" class="btn btn-secondary">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button @click="confirmarAtendimento" class="btn btn-success" :disabled="processando">
            <i class="fas fa-check" v-if="!processando"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            {{ processando ? 'Registrando...' : 'Confirmar Atendimento' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAgendamento } from '../composables/useAgendamento.js'
import { useClinica } from '../composables/useClinica.js'

const { clinicaId, inicializarClinica } = useClinica()
const { agendamentos, buscarAgendamentos, atualizarAgendamento } = useAgendamento()

// Estados
const carregando = ref(false)
const filtroData = ref('')
const filtroStatus = ref('')
const modalConfirmacao = ref(false)
const agendamentoSelecionado = ref(null)
const observacoesAtendimento = ref('')
const processando = ref(false)

// Computed
const agendamentosFiltrados = computed(() => {
  let filtrados = agendamentos.value

  // Filtrar por data
  if (filtroData.value) {
    const dataFiltro = new Date(filtroData.value)
    filtrados = filtrados.filter(ag => {
      const agData = ag.dataHora?.toDate ? ag.dataHora.toDate() : new Date(ag.dataHora)
      return agData.toDateString() === dataFiltro.toDateString()
    })
  }

  // Filtrar por status
  if (filtroStatus.value) {
    filtrados = filtrados.filter(ag => ag.status === filtroStatus.value)
  }

  // Ordenar por data/hora
  return filtrados.sort((a, b) => {
    const dataA = a.dataHora?.toDate ? a.dataHora.toDate() : new Date(a.dataHora)
    const dataB = b.dataHora?.toDate ? b.dataHora.toDate() : new Date(b.dataHora)
    return dataA - dataB
  })
})

// Métodos
const carregarAgendamentos = async () => {
  try {
    carregando.value = true
    await inicializarClinica()
    
    // Buscar agendamentos dos últimos 30 dias
    const inicio = new Date()
    inicio.setDate(inicio.getDate() - 30)
    const fim = new Date()
    fim.setDate(fim.getDate() + 30)
    
    await buscarAgendamentos(
      inicio.toISOString().split('T')[0], 
      fim.toISOString().split('T')[0]
    )
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error)
  } finally {
    carregando.value = false
  }
}

const filtrarAgendamentos = () => {
  // Os filtros são aplicados automaticamente pelo computed
  console.log('Filtros aplicados:', { data: filtroData.value, status: filtroStatus.value })
}

const limparFiltros = () => {
  filtroData.value = ''
  filtroStatus.value = ''
}

const selecionarAgendamento = (agendamento) => {
  console.log('Agendamento selecionado:', agendamento)
}

const registrarAtendimento = (agendamento) => {
  agendamentoSelecionado.value = agendamento
  observacoesAtendimento.value = ''
  modalConfirmacao.value = true
}

const confirmarAtendimento = async () => {
  try {
    processando.value = true
    
    // Atualizar status do agendamento para "realizado"
    await atualizarAgendamento(agendamentoSelecionado.value.id, {
      status: 'realizado',
      observacoes: observacoesAtendimento.value,
      dataAtendimento: new Date()
    })
    
    // Recarregar agendamentos
    await carregarAgendamentos()
    
    // Fechar modal
    fecharModal()
    
    alert('Atendimento registrado com sucesso!')
  } catch (error) {
    console.error('Erro ao registrar atendimento:', error)
    alert('Erro ao registrar atendimento. Tente novamente.')
  } finally {
    processando.value = false
  }
}

const fecharModal = () => {
  modalConfirmacao.value = false
  agendamentoSelecionado.value = null
  observacoesAtendimento.value = ''
}

// Utilitários
const formatarDataHora = (dataHora) => {
  if (!dataHora) return ''
  const data = dataHora?.toDate ? dataHora.toDate() : new Date(dataHora)
  return data.toLocaleString('pt-BR')
}

const formatarStatus = (status) => {
  const statusMap = {
    'agendado': 'Agendado',
    'confirmado': 'Confirmado',
    'realizado': 'Realizado',
    'cancelado': 'Cancelado'
  }
  return statusMap[status] || status
}

const formatarMoeda = (valor) => {
  return Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Lifecycle
onMounted(() => {
  carregarAgendamentos()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #333;
  margin-bottom: 10px;
}

.filters-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 600;
  color: #555;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.agendamentos-section h3 {
  color: #333;
  margin-bottom: 20px;
}

.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}

.agendamentos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.agendamento-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.agendamento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.agendamento-card.status-realizado {
  opacity: 0.6;
  background: #f8f9fa;
}

.agendamento-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
}

.cliente-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.procedimento {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.status-agendado {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.status-confirmado {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.status-realizado {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.status-cancelado {
  background: #ffebee;
  color: #c62828;
}

.agendamento-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.detail-item i {
  width: 16px;
  color: #007bff;
}

.agendamento-actions {
  text-align: right;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.confirmacao-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.confirmacao-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.confirmacao-info p {
  margin: 5px 0;
  color: #666;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ddd;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .agendamentos-grid {
    grid-template-columns: 1fr;
  }
  
  .agendamento-details {
    grid-template-columns: 1fr;
  }
}
</style>
