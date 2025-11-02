<template>
  <div class="container">
    <div class="header">
      <h1><i class="fas fa-user-md"></i> Registrar Atendimento - Cliente Agendado</h1>
      <p>Selecione um agendamento para registrar o atendimento</p>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filter-group">
        <label><i class="fas fa-calendar-alt"></i> Filtrar por Data:</label>
        <input 
          type="date" 
          v-model="filtroData" 
          @change="filtrarAgendamentos"
          class="form-control"
        >
      </div>
      <div class="filter-group">
        <label><i class="fas fa-filter"></i> Filtrar por Status:</label>
        <select v-model="filtroStatus" @change="filtrarAgendamentos" class="form-control">
          <option value="">Todos os status</option>
          <option value="agendado">📅 Agendado</option>
          <option value="confirmado">✅ Confirmado</option>
          <option value="realizado">✅ Realizado</option>
          <option value="cancelado">❌ Cancelado</option>
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

      <div v-else class="agendamentos-lista">
        <div class="lista-header">
          <div class="col-cliente">Cliente</div>
          <div class="col-procedimento">Procedimento</div>
          <div class="col-data">Data/Hora</div>
          <div class="col-profissional">Profissional</div>
          <div class="col-valor">Valor</div>
          <div class="col-status">Status</div>
          <div class="col-acoes">Ações</div>
        </div>
        
        <div 
          v-for="agendamento in agendamentosFiltrados" 
          :key="agendamento.id"
          class="agendamento-linha"
          :class="'status-' + agendamento.status"
        >
          <div class="col-cliente">
            <div class="cliente-nome">{{ agendamento.clienteNome }}</div>
            <div class="cliente-detalhes">
              <i class="fas fa-clock"></i> {{ agendamento.duracao }} min
            </div>
          </div>
          
          <div class="col-procedimento">
            {{ agendamento.procedimento }}
          </div>
          
          <div class="col-data">
            {{ formatarDataHora(agendamento.dataHora) }}
          </div>
          
          <div class="col-profissional">
            {{ agendamento.profissional }}
          </div>
          
          <div class="col-valor">
            R$ {{ formatarMoeda(agendamento.valorEstimado) }}
          </div>
          
          <div class="col-status">
            <span class="status-badge" :class="'status-' + agendamento.status">
              {{ formatarStatus(agendamento.status) }}
            </span>
          </div>
          
          <div class="col-acoes">
            <button 
              @click="registrarAtendimento(agendamento)"
              class="btn btn-primary btn-sm"
              :disabled="agendamento.status === 'realizado'"
            >
              <i class="fas fa-check"></i> Registrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Registro de Atendimento -->
    <div v-if="modalConfirmacao" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3><i class="fas fa-user-md"></i> Registrar Atendimento</h3>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Informações do Agendamento -->
          <div class="agendamento-info">
            <h4><i class="fas fa-calendar-check"></i> Dados do Agendamento</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Cliente:</label>
                <span>{{ agendamentoSelecionado?.clienteNome }}</span>
              </div>
              <div class="info-item">
                <label>Procedimento:</label>
                <span>{{ agendamentoSelecionado?.procedimento }}</span>
              </div>
              <div class="info-item">
                <label>Data/Hora:</label>
                <span>{{ formatarDataHora(agendamentoSelecionado?.dataHora) }}</span>
              </div>
              <div class="info-item">
                <label>Profissional:</label>
                <span>{{ agendamentoSelecionado?.profissional }}</span>
              </div>
              <div class="info-item">
                <label>Duração:</label>
                <span>{{ agendamentoSelecionado?.duracao }} minutos</span>
              </div>
              <div class="info-item">
                <label>Valor Estimado:</label>
                <span>R$ {{ formatarMoeda(agendamentoSelecionado?.valorEstimado) }}</span>
              </div>
            </div>
          </div>

          <!-- Formulário de Atendimento -->
          <div class="atendimento-form">
            <h4><i class="fas fa-edit"></i> Dados do Atendimento</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label>Valor Cobrado *</label>
                <input 
                  type="number" 
                  v-model="formAtendimento.valorCobrado" 
                  step="0.01"
                  min="0"
                  required
                  class="form-control"
                  placeholder="0,00"
                >
              </div>
              <div class="form-group">
                <label><i class="fas fa-credit-card"></i> Forma de Pagamento *</label>
                <select v-model="formAtendimento.formaPagamento" required class="form-control">
                  <option value="">Selecione...</option>
                  <option value="dinheiro">💵 Dinheiro</option>
                  <option value="cartao_debito">💳 Cartão Débito</option>
                  <option value="cartao_credito">💳 Cartão Crédito</option>
                  <option value="pix">📱 PIX</option>
                  <option value="transferencia">🏦 Transferência</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label><i class="fas fa-check-circle"></i> Status do Atendimento *</label>
                <select v-model="formAtendimento.status" required class="form-control">
                  <option value="realizado">✅ Realizado</option>
                  <option value="nao_compareceu">❌ Não Compareceu</option>
                  <option value="cancelado">🚫 Cancelado</option>
                </select>
              </div>
              <div class="form-group">
                <label><i class="fas fa-calendar"></i> Data do Atendimento</label>
                <input 
                  type="datetime-local" 
                  v-model="formAtendimento.dataAtendimento" 
                  class="form-control"
                >
              </div>
            </div>

            <div class="form-group">
              <label><i class="fas fa-comment"></i> Observações do Atendimento</label>
              <textarea 
                v-model="formAtendimento.observacoes" 
                placeholder="Observações sobre o atendimento realizado..."
                class="form-control"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="fecharModal" class="btn btn-secondary">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button @click="confirmarAtendimento" class="btn btn-success" :disabled="processando">
            <i class="fas fa-check" v-if="!processando"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            {{ processando ? 'Registrando...' : 'Registrar Atendimento' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAgendamento } from '../composables/useAgendamento.js'
import { useClinica } from '../composables/useClinica.js'

const router = useRouter()
const route = useRoute()
const { clinicaId, inicializarClinica } = useClinica()
const { agendamentos, buscarAgendamentos, atualizarAgendamento } = useAgendamento()

// Estados
const carregando = ref(false)
const filtroData = ref('')
const filtroStatus = ref('')
const modalConfirmacao = ref(false)
const agendamentoSelecionado = ref(null)
const processando = ref(false)

// Formulário de atendimento
const formAtendimento = ref({
  valorCobrado: 0,
  formaPagamento: '',
  status: 'realizado',
  dataAtendimento: '',
  observacoes: ''
})

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
  
  // Preencher formulário com dados do agendamento
  formAtendimento.value = {
    valorCobrado: agendamento.valorEstimado || 0,
    formaPagamento: '',
    status: 'realizado',
    dataAtendimento: new Date().toISOString().slice(0, 16),
    observacoes: ''
  }
  
  modalConfirmacao.value = true
}

const confirmarAtendimento = async () => {
  try {
    processando.value = true
    
    // Validar formulário
    if (!formAtendimento.value.formaPagamento) {
      alert('Por favor, selecione a forma de pagamento.')
      return
    }
    
    const agend = agendamentoSelecionado.value
    
    // 1. CRIAR REGISTRO DE ATENDIMENTO na coleção 'atendimentos'
    const { registrarAtendimento: criarAtendimento } = await import('../composables/useProcedimentos.js')
    
    const dadosAtendimento = {
      // Dados do cliente
      clienteId: agend.clienteId,
      clienteNome: agend.clienteNome || agend.pacienteNome,
      
      // Dados do profissional
      profissionalId: agend.profissionalId,
      profissionalNome: agend.profissional,
      
      // Dados do procedimento
      procedimentoId: agend.procedimentoId,
      procedimentoNome: agend.procedimento,
      procedimentos: agend.procedimentoId ? [{
        procedimentoId: agend.procedimentoId,
        procedimentoNome: agend.procedimento,
        valor: formAtendimento.value.valorCobrado,
        duracao: agend.duracao || 60
      }] : [],
      
      // Dados financeiros
      data: formAtendimento.value.dataAtendimento ? new Date(formAtendimento.value.dataAtendimento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      valorCobrado: formAtendimento.value.valorCobrado,
      formaPagamento: formAtendimento.value.formaPagamento,
      numeroParcelas: 1,
      pago: true, // Marcado como pago ao registrar
      dataVencimento: new Date().toISOString().split('T')[0],
      observacoes: formAtendimento.value.observacoes || '',
      
      // Referência ao agendamento
      agendamentoId: agend.id,
      
      // Produtos utilizados (vazio por enquanto)
      produtosUtilizados: []
    }
    
    console.log('Registrando atendimento:', dadosAtendimento)
    const resultado = await criarAtendimento(dadosAtendimento)
    
    if (!resultado.success) {
      throw new Error(resultado.error || 'Erro ao criar atendimento')
    }
    
    console.log('Atendimento criado com sucesso! ID:', resultado.id)
    
    // 2. ATUALIZAR STATUS DO AGENDAMENTO
    await atualizarAgendamento(agend.id, {
      status: 'realizado',
      valorCobrado: formAtendimento.value.valorCobrado,
      formaPagamento: formAtendimento.value.formaPagamento,
      dataAtendimento: formAtendimento.value.dataAtendimento ? new Date(formAtendimento.value.dataAtendimento) : new Date(),
      observacoes: formAtendimento.value.observacoes,
      atendimentoId: resultado.id // Referência ao atendimento criado
    })
    
    // 3. Recarregar agendamentos
    await carregarAgendamentos()
    
    // 4. Fechar modal
    fecharModal()
    
    alert('Atendimento registrado com sucesso! Financeiro atualizado automaticamente.')
  } catch (error) {
    console.error('Erro ao registrar atendimento:', error)
    alert('Erro ao registrar atendimento: ' + (error.message || 'Tente novamente.'))
  } finally {
    processando.value = false
  }
}

const fecharModal = () => {
  modalConfirmacao.value = false
  agendamentoSelecionado.value = null
  formAtendimento.value = {
    valorCobrado: 0,
    formaPagamento: '',
    status: 'realizado',
    dataAtendimento: '',
    observacoes: ''
  }
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
onMounted(async () => {
  await carregarAgendamentos()
  
  // Verificar se há um ID de agendamento na query para pré-selecionar
  const agendamentoId = route.query.id
  if (agendamentoId) {
    const agendamento = agendamentos.value.find(a => a.id === agendamentoId)
    if (agendamento) {
      // Pré-selecionar o agendamento e abrir o modal de confirmação
      agendamentoSelecionado.value = agendamento
      
      // Preencher formulário com dados do agendamento
      formAtendimento.value = {
        valorCobrado: agendamento.valorEstimado || 0,
        formaPagamento: '',
        status: 'realizado',
        dataAtendimento: new Date().toISOString().slice(0, 16),
        observacoes: ''
      }
      
      // Abrir modal automaticamente
      modalConfirmacao.value = true
    }
  }
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

.agendamentos-lista {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.lista-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px 20px;
  background: #f8f9fa;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #ddd;
}

.agendamento-linha {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
  align-items: center;
}

.agendamento-linha:hover {
  background: #f8f9fa;
}

.agendamento-linha.status-realizado {
  opacity: 0.6;
  background: #f8f9fa;
}

.col-cliente .cliente-nome {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.col-cliente .cliente-detalhes {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.col-procedimento {
  font-weight: 500;
  color: #555;
}

.col-data {
  font-size: 14px;
  color: #666;
}

.col-profissional {
  font-size: 14px;
  color: #666;
}

.col-valor {
  font-weight: 600;
  color: #28a745;
}

.col-status {
  display: flex;
  justify-content: center;
}

.col-acoes {
  display: flex;
  justify-content: center;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
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

.modal-large {
  max-width: 800px;
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

.agendamento-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.agendamento-info h4 {
  margin: 0 0 15px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.info-item span {
  color: #333;
  font-size: 14px;
}

.atendimento-form {
  margin-top: 20px;
}

.atendimento-form h4 {
  margin: 0 0 15px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
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
  
  .lista-header,
  .agendamento-linha {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .lista-header {
    display: none;
  }
  
  .agendamento-linha {
    display: flex;
    flex-direction: column;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 10px;
  }
  
  .col-cliente,
  .col-procedimento,
  .col-data,
  .col-profissional,
  .col-valor,
  .col-status,
  .col-acoes {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .col-cliente::before { content: "Cliente: "; font-weight: 600; }
  .col-procedimento::before { content: "Procedimento: "; font-weight: 600; }
  .col-data::before { content: "Data/Hora: "; font-weight: 600; }
  .col-profissional::before { content: "Profissional: "; font-weight: 600; }
  .col-valor::before { content: "Valor: "; font-weight: 600; }
  .col-status::before { content: "Status: "; font-weight: 600; }
  .col-acoes::before { content: "Ações: "; font-weight: 600; }
  
  .col-acoes {
    border-bottom: none;
    justify-content: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
