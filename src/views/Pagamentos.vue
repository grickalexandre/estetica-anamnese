<template>
  <div class="container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-exchange-alt"></i> Histórico de Pagamentos</h1>
        <div class="header-actions">
          <button @click="exportarPDF" class="btn-secondary">
            <i class="fas fa-file-pdf"></i> Exportar PDF
          </button>
          <button @click="voltarHome" class="btn-secondary">
            <i class="fas fa-home"></i> Voltar
          </button>
        </div>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats-grid" v-if="estatisticas">
      <div class="stat-card receita">
        <div class="stat-icon">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Recebido</span>
          <span class="stat-value">{{ formatarMoeda(estatisticas.totalRecebido) }}</span>
        </div>
      </div>

      <div class="stat-card despesa">
        <div class="stat-icon">
          <i class="fas fa-arrow-up"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Pago</span>
          <span class="stat-value">{{ formatarMoeda(estatisticas.totalPago) }}</span>
        </div>
      </div>

      <div class="stat-card comissao">
        <div class="stat-icon">
          <i class="fas fa-hand-holding-usd"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Comissões Pagas</span>
          <span class="stat-value">{{ formatarMoeda(estatisticas.totalComissoes) }}</span>
        </div>
      </div>

      <div class="stat-card saldo">
        <div class="stat-icon">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Saldo Líquido</span>
          <span class="stat-value">{{ formatarMoeda(estatisticas.saldoLiquido) }}</span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card">
      <div class="filtros">
        <div class="filtro-grupo">
          <label>Tipo de Transação</label>
          <select v-model="filtros.tipo" @change="aplicarFiltros">
            <option value="">Todos</option>
            <option value="recebimento">Recebimentos</option>
            <option value="pagamento">Pagamentos</option>
            <option value="pagamento_comissao">Pagamento de Comissão</option>
          </select>
        </div>

        <div class="filtro-grupo">
          <label>Forma de Pagamento</label>
          <select v-model="filtros.formaPagamento" @change="aplicarFiltros">
            <option value="">Todas</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">PIX</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="cartao_debito">Cartão de Débito</option>
            <option value="transferencia">Transferência</option>
            <option value="boleto">Boleto</option>
          </select>
        </div>

        <div class="filtro-grupo">
          <label>Data Inicial</label>
          <input type="date" v-model="filtros.dataInicial" @change="aplicarFiltros">
        </div>

        <div class="filtro-grupo">
          <label>Data Final</label>
          <input type="date" v-model="filtros.dataFinal" @change="aplicarFiltros">
        </div>

        <div class="filtro-grupo">
          <button @click="limparFiltros" class="btn-secondary">
            <i class="fas fa-eraser"></i> Limpar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de Pagamentos -->
    <div class="card">
      <div class="card-header">
        <h2>Transações ({{ pagamentosFiltrados.length }})</h2>
      </div>

      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>

      <div v-else-if="pagamentosFiltrados.length === 0" class="empty-state">
        <i class="fas fa-receipt"></i>
        <p>Nenhum pagamento encontrado</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Forma</th>
              <th>Valor</th>
              <th>Usuário</th>
              <th>Observações</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pagamento in pagamentosPaginados" :key="pagamento.id">
              <td>{{ formatarData(pagamento.dataPagamento) }}</td>
              <td>
                <span :class="['badge', getBadgeClass(pagamento.tipo)]">
                  {{ getTipoLabel(pagamento.tipo) }}
                </span>
              </td>
              <td>{{ getFormaPagamentoLabel(pagamento.formaPagamento) }}</td>
              <td :class="['valor', getValorClass(pagamento.tipo)]">
                {{ formatarMoeda(pagamento.valor) }}
              </td>
              <td>{{ pagamento.usuarioNome || 'Sistema' }}</td>
              <td class="observacoes">{{ pagamento.observacoes || '-' }}</td>
              <td>
                <button 
                  @click="verDetalhes(pagamento)" 
                  class="btn-icon" 
                  title="Ver detalhes"
                >
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <Paginacao
        v-if="pagamentosFiltrados.length > 0"
        :itens-por-pagina="itensPorPagina"
        :total-itens="pagamentosFiltrados.length"
        @pagina-alterada="mudarPagina"
      />
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="modalDetalhes" class="modal-overlay" @click="fecharModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-receipt"></i> Detalhes do Pagamento</h2>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body" v-if="pagamentoSelecionado">
          <div class="detalhes-grid">
            <div class="detalhe-item">
              <label>Tipo de Transação:</label>
              <span :class="['badge', getBadgeClass(pagamentoSelecionado.tipo)]">
                {{ getTipoLabel(pagamentoSelecionado.tipo) }}
              </span>
            </div>

            <div class="detalhe-item">
              <label>Valor:</label>
              <span :class="['valor-destaque', getValorClass(pagamentoSelecionado.tipo)]">
                {{ formatarMoeda(pagamentoSelecionado.valor) }}
              </span>
            </div>

            <div class="detalhe-item">
              <label>Forma de Pagamento:</label>
              <span>{{ getFormaPagamentoLabel(pagamentoSelecionado.formaPagamento) }}</span>
            </div>

            <div class="detalhe-item">
              <label>Data do Pagamento:</label>
              <span>{{ formatarDataCompleta(pagamentoSelecionado.dataPagamento) }}</span>
            </div>

            <div class="detalhe-item">
              <label>Usuário Responsável:</label>
              <span>{{ pagamentoSelecionado.usuarioNome || 'Sistema' }}</span>
            </div>

            <div class="detalhe-item full-width">
              <label>Observações:</label>
              <span>{{ pagamentoSelecionado.observacoes || 'Sem observações' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePagamentos } from '../composables/usePagamentos.js'
import Paginacao from '../components/Paginacao.vue'

const router = useRouter()
const { buscarPagamentos, calcularEstatisticas } = usePagamentos()

// Estado
const pagamentos = ref([])
const estatisticas = ref(null)
const carregando = ref(false)
const modalDetalhes = ref(false)
const pagamentoSelecionado = ref(null)

// Filtros
const filtros = ref({
  tipo: '',
  formaPagamento: '',
  dataInicial: '',
  dataFinal: ''
})

// Paginação
const paginaAtual = ref(1)
const itensPorPagina = ref(20)

// Computed
const pagamentosFiltrados = computed(() => {
  return pagamentos.value
})

const pagamentosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina.value
  const fim = inicio + itensPorPagina.value
  return pagamentosFiltrados.value.slice(inicio, fim)
})

// Métodos
const carregarPagamentos = async () => {
  carregando.value = true
  try {
    console.log('Carregando pagamentos com filtros:', filtros.value)
    
    const resultado = await buscarPagamentos(filtros.value)
    
    if (resultado.success) {
      pagamentos.value = resultado.data
      console.log(`${pagamentos.value.length} pagamentos carregados`)
      
      // Calcular estatísticas
      const stats = await calcularEstatisticas(filtros.value)
      if (stats.success) {
        estatisticas.value = stats.data
      }
    } else {
      console.error('Erro ao buscar pagamentos:', resultado.error)
      alert('Erro ao carregar pagamentos: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error)
    alert('Erro ao carregar pagamentos')
  } finally {
    carregando.value = false
  }
}

const aplicarFiltros = () => {
  console.log('Aplicando filtros:', filtros.value)
  paginaAtual.value = 1
  carregarPagamentos()
}

const limparFiltros = () => {
  filtros.value = {
    tipo: '',
    formaPagamento: '',
    dataInicial: '',
    dataFinal: ''
  }
  carregarPagamentos()
}

const mudarPagina = (novaPagina) => {
  paginaAtual.value = novaPagina
}

const verDetalhes = (pagamento) => {
  pagamentoSelecionado.value = pagamento
  modalDetalhes.value = true
}

const fecharModal = () => {
  modalDetalhes.value = false
  pagamentoSelecionado.value = null
}

const exportarPDF = () => {
  alert('Funcionalidade de exportação em desenvolvimento')
}

const voltarHome = () => {
  router.push('/')
}

// Helpers
const getTipoLabel = (tipo) => {
  const labels = {
    'recebimento': 'Recebimento',
    'pagamento': 'Pagamento',
    'pagamento_comissao': 'Pag. Comissão'
  }
  return labels[tipo] || tipo
}

const getBadgeClass = (tipo) => {
  const classes = {
    'recebimento': 'badge-success',
    'pagamento': 'badge-danger',
    'pagamento_comissao': 'badge-warning'
  }
  return classes[tipo] || 'badge-secondary'
}

const getValorClass = (tipo) => {
  return tipo === 'recebimento' ? 'positivo' : 'negativo'
}

const getFormaPagamentoLabel = (forma) => {
  const labels = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'cartao_credito': 'Cartão de Crédito',
    'cartao_debito': 'Cartão de Débito',
    'transferencia': 'Transferência',
    'boleto': 'Boleto'
  }
  return labels[forma] || forma
}

const formatarMoeda = (valor) => {
  if (!valor) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

const formatarData = (data) => {
  if (!data) return '-'
  const date = data.toDate ? data.toDate() : new Date(data)
  return date.toLocaleDateString('pt-BR')
}

const formatarDataCompleta = (data) => {
  if (!data) return '-'
  const date = data.toDate ? data.toDate() : new Date(data)
  return date.toLocaleString('pt-BR')
}

// Lifecycle
onMounted(() => {
  carregarPagamentos()
})
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  font-size: 1.8rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Estatísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid;
}

.stat-card.receita {
  border-left-color: #28a745;
}

.stat-card.despesa {
  border-left-color: #dc3545;
}

.stat-card.comissao {
  border-left-color: #ffc107;
}

.stat-card.saldo {
  border-left-color: #667eea;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.receita .stat-icon {
  background: #28a745;
}

.despesa .stat-icon {
  background: #dc3545;
}

.comissao .stat-icon {
  background: #ffc107;
}

.saldo .stat-icon {
  background: #667eea;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

/* Filtros */
.filtros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filtro-grupo label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.filtro-grupo select,
.filtro-grupo input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

/* Card */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-header h2 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin: 0;
}

/* Tabela */
.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #f8f9fa;
}

.table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.table tbody tr:hover {
  background: #f8f9fa;
}

.observacoes {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Badges */
.badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-danger {
  background: #f8d7da;
  color: #721c24;
}

.badge-warning {
  background: #fff3cd;
  color: #856404;
}

/* Valores */
.valor {
  font-weight: 600;
  font-size: 1.05rem;
}

.valor.positivo {
  color: #28a745;
}

.valor.negativo {
  color: #dc3545;
}

/* Botões */
.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-icon {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f0f0f0;
}

/* Loading e Empty State */
.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.detalhes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.detalhe-item {
  display: flex;
  flex-direction: column;
}

.detalhe-item.full-width {
  grid-column: 1 / -1;
}

.detalhe-item label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.detalhe-item span {
  color: #2c3e50;
  font-size: 1rem;
}

.valor-destaque {
  font-size: 1.5rem !important;
  font-weight: bold !important;
}

/* Responsivo */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filtros {
    grid-template-columns: 1fr;
  }

  .detalhes-grid {
    grid-template-columns: 1fr;
  }

  .table {
    font-size: 0.875rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }
}
</style>

