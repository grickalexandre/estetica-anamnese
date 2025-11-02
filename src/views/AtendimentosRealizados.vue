<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-clipboard-check"></i> Atendimentos Realizados</h1>
        <VoltarHome />
      </div>
    </div>

    <!-- Filtros -->
    <div class="card filters-card">
      <div class="filters">
        <div class="filter-group">
          <label>Período:</label>
          <select v-model="filtros.periodo" @change="aplicarFiltros">
            <option value="hoje">Hoje</option>
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mês</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="ano">Último Ano</option>
            <option value="customizado">Personalizado</option>
          </select>
        </div>

        <div v-if="filtros.periodo === 'customizado'" class="filter-group">
          <label>Data Início:</label>
          <input type="date" v-model="filtros.dataInicio" @change="aplicarFiltros">
        </div>

        <div v-if="filtros.periodo === 'customizado'" class="filter-group">
          <label>Data Fim:</label>
          <input type="date" v-model="filtros.dataFim" @change="aplicarFiltros">
        </div>

        <div class="filter-group">
          <label>Buscar:</label>
          <input 
            type="text" 
            v-model="filtros.busca" 
            @input="aplicarFiltros"
            placeholder="Cliente, profissional ou procedimento..."
          >
        </div>
      </div>

      <div class="resumo-periodo">
        <div class="resumo-item">
          <span class="resumo-label">Total de Atendimentos:</span>
          <span class="resumo-valor">{{ atendimentosFiltrados.length }}</span>
        </div>
        <div class="resumo-item">
          <span class="resumo-label">Receita Total:</span>
          <span class="resumo-valor receita">R$ {{ formatarMoeda(calcularReceitaTotal()) }}</span>
        </div>
      </div>
    </div>

    <!-- Lista de Atendimentos -->
    <div class="card">
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando atendimentos...
      </div>

      <div v-else-if="atendimentosFiltrados.length === 0" class="no-data">
        <i class="fas fa-clipboard"></i>
        <p>Nenhum atendimento realizado no período selecionado</p>
      </div>

      <div v-else class="atendimentos-lista">
        <div 
          v-for="atendimento in atendimentosPaginados" 
          :key="atendimento.id"
          class="atendimento-card"
          @click="verDetalhes(atendimento)"
        >
          <div class="atendimento-header">
            <div class="atendimento-data">
              <i class="fas fa-calendar"></i>
              {{ formatarData(atendimento.data) }}
            </div>
            <div class="atendimento-status" :class="'status-' + atendimento.pagamentoStatus">
              {{ formatarStatusPagamento(atendimento.pagamentoStatus) }}
            </div>
          </div>

          <div class="atendimento-body">
            <div class="atendimento-cliente">
              <i class="fas fa-user"></i>
              <strong>{{ atendimento.clienteNome }}</strong>
            </div>

            <div class="atendimento-info">
              <div class="info-item">
                <i class="fas fa-spa"></i>
                <span>{{ atendimento.procedimentoNome }}</span>
              </div>
              <div class="info-item" v-if="atendimento.profissionalNome">
                <i class="fas fa-user-md"></i>
                <span>{{ atendimento.profissionalNome }}</span>
              </div>
            </div>

            <div class="atendimento-footer">
              <div class="atendimento-valor">
                <span class="label">Valor:</span>
                <span class="valor">R$ {{ formatarMoeda(atendimento.valorCobrado) }}</span>
              </div>
              <div class="atendimento-pagamento">
                <i class="fas fa-credit-card"></i>
                {{ formatarFormaPagamento(atendimento.formaPagamento) }}
                <span v-if="atendimento.numeroParcelas > 1">
                  ({{ atendimento.numeroParcelas }}x)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginação -->
      <Paginacao
        v-if="!carregando && atendimentosFiltrados.length > 0"
        :pagina-atual="paginaAtual"
        :total-paginas="totalPaginas"
        :tem-pagina-anterior="temPaginaAnterior"
        :tem-proxima-pagina="temProximaPagina"
        @ir-para-pagina="irParaPagina"
        @proxima-pagina="proximaPagina"
        @pagina-anterior="paginaAnterior"
        @primeira-pagina="primeiraPagina"
        @ultima-pagina="ultimaPagina"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProcedimentos } from '../composables/useProcedimentos.js'
import { useClinica } from '../composables/useClinica.js'
import { usePaginacao } from '../composables/usePaginacao.js'
import VoltarHome from '../components/VoltarHome.vue'
import Paginacao from '../components/Paginacao.vue'

const router = useRouter()
const { clinicaId, inicializarClinica } = useClinica()
const { atendimentos, carregando, buscarAtendimentos } = useProcedimentos()

const filtros = ref({
  periodo: 'mes',
  dataInicio: '',
  dataFim: '',
  busca: ''
})

const {
  paginaAtual,
  totalPaginas,
  temPaginaAnterior,
  temProximaPagina,
  itensVisiveis,
  irParaPagina,
  proximaPagina,
  paginaAnterior,
  primeiraPagina,
  ultimaPagina,
  atualizarTotalItens
} = usePaginacao(20)

onMounted(async () => {
  await inicializarClinica()
  await carregarAtendimentos()
})

const atendimentosFiltrados = computed(() => {
  let lista = [...atendimentos.value]

  // Filtrar por busca
  if (filtros.value.busca) {
    const termo = filtros.value.busca.toLowerCase()
    lista = lista.filter(a =>
      (a.clienteNome || '').toLowerCase().includes(termo) ||
      (a.profissionalNome || '').toLowerCase().includes(termo) ||
      (a.procedimentoNome || '').toLowerCase().includes(termo)
    )
  }

  // Ordenar por data (mais recente primeiro)
  lista.sort((a, b) => {
    const dataA = a.data?.toDate ? a.data.toDate() : new Date(a.data)
    const dataB = b.data?.toDate ? b.data.toDate() : new Date(b.data)
    return dataB - dataA
  })

  atualizarTotalItens(lista.length)
  return lista
})

const atendimentosPaginados = computed(() => {
  const { inicio, fim } = itensVisiveis.value
  return atendimentosFiltrados.value.slice(inicio, fim)
})

const carregarAtendimentos = async () => {
  const { dataInicio, dataFim } = calcularPeriodo()
  await buscarAtendimentos(dataInicio, dataFim)
}

const calcularPeriodo = () => {
  const hoje = new Date()
  let dataInicio = new Date()
  let dataFim = new Date()

  switch (filtros.value.periodo) {
    case 'hoje':
      dataInicio = new Date(hoje.setHours(0, 0, 0, 0))
      dataFim = new Date(hoje.setHours(23, 59, 59, 999))
      break
    case 'semana':
      dataInicio.setDate(dataInicio.getDate() - 7)
      break
    case 'mes':
      dataInicio.setMonth(dataInicio.getMonth() - 1)
      break
    case 'trimestre':
      dataInicio.setMonth(dataInicio.getMonth() - 3)
      break
    case 'ano':
      dataInicio.setFullYear(dataInicio.getFullYear() - 1)
      break
    case 'customizado':
      if (filtros.value.dataInicio) {
        dataInicio = new Date(filtros.value.dataInicio)
      }
      if (filtros.value.dataFim) {
        dataFim = new Date(filtros.value.dataFim)
      }
      break
  }

  return {
    dataInicio: dataInicio.toISOString().split('T')[0],
    dataFim: dataFim.toISOString().split('T')[0]
  }
}

const aplicarFiltros = async () => {
  await carregarAtendimentos()
}

const calcularReceitaTotal = () => {
  return atendimentosFiltrados.value.reduce((total, a) => {
    return total + (a.valorCobrado || 0)
  }, 0)
}

const verDetalhes = (atendimento) => {
  // Navegar para detalhes ou abrir modal
  console.log('Ver detalhes:', atendimento)
}

const formatarData = (data) => {
  if (!data) return ''
  const d = data?.toDate ? data.toDate() : new Date(data)
  return d.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatarMoeda = (valor) => {
  return Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatarStatusPagamento = (status) => {
  const map = {
    'pago': 'Pago',
    'pendente': 'Pendente',
    'parcial': 'Parcelado'
  }
  return map[status] || status
}

const formatarFormaPagamento = (forma) => {
  const map = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'debito': 'Débito',
    'credito': 'Crédito',
    'boleto': 'Boleto',
    'promissoria': 'Promissória'
  }
  return map[forma] || forma
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

.filters-card {
  margin-bottom: 24px;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  font-size: 14px;
  color: #1d1d1f;
}

.filter-group select,
.filter-group input {
  padding: 10px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
}

.resumo-periodo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #007AFF;
}

.resumo-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resumo-label {
  font-size: 12px;
  color: #6e6e73;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.resumo-valor {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
}

.resumo-valor.receita {
  color: #34c759;
}

.loading,
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #6e6e73;
}

.no-data i {
  font-size: 64px;
  color: #d2d2d7;
  margin-bottom: 16px;
}

.atendimentos-lista {
  display: grid;
  gap: 16px;
}

.atendimento-card {
  padding: 20px;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
}

.atendimento-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #007AFF;
}

.atendimento-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f7;
}

.atendimento-data {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6e6e73;
  font-size: 14px;
  font-weight: 500;
}

.atendimento-data i {
  color: #007AFF;
}

.atendimento-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.atendimento-status.status-pago {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.atendimento-status.status-pendente {
  background: rgba(255, 159, 10, 0.1);
  color: #ff9f0a;
}

.atendimento-status.status-parcial {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.atendimento-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.atendimento-cliente {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #1d1d1f;
}

.atendimento-cliente i {
  color: #007AFF;
}

.atendimento-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6e6e73;
}

.info-item i {
  width: 16px;
  color: #00A859;
}

.atendimento-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f7;
}

.atendimento-valor {
  display: flex;
  align-items: center;
  gap: 8px;
}

.atendimento-valor .label {
  font-size: 12px;
  color: #6e6e73;
  font-weight: 600;
}

.atendimento-valor .valor {
  font-size: 20px;
  font-weight: 700;
  color: #34c759;
}

.atendimento-pagamento {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6e6e73;
  padding: 6px 12px;
  background: #f5f5f7;
  border-radius: 8px;
}

.atendimento-pagamento i {
  color: #007AFF;
}

@media (max-width: 768px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .resumo-periodo {
    grid-template-columns: 1fr;
  }

  .atendimento-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

