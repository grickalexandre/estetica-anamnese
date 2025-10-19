<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-money-bill-wave"></i> Comissões</h1>
        <div class="header-actions">
          <VoltarHome />
        </div>
      </div>
    </div>

    <!-- Filtros Personalizados para Comissões -->
    <div class="card">
      <div class="filtros-comissoes">
        <div class="form-row">
          <div class="form-group">
            <label>Profissional</label>
            <select v-model="filtrosProfissional" @change="aplicarFiltrosCustom">
              <option value="">Todos</option>
              <option v-for="prof in profissionais" :key="prof.id" :value="prof.id">
                {{ prof.nome }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="filtrosStatus" @change="aplicarFiltrosCustom">
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
          </div>
          <div class="form-group">
            <label>Data Início</label>
            <input v-model="filtrosDataInicio" type="date" @change="aplicarFiltrosCustom">
          </div>
          <div class="form-group">
            <label>Data Fim</label>
            <input v-model="filtrosDataFim" type="date" @change="aplicarFiltrosCustom">
          </div>
        </div>
      </div>
    </div>

    <!-- Estatísticas -->
    <div v-if="estatisticas" class="card">
      <h2><i class="fas fa-chart-bar"></i> Resumo</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-list"></i>
          </div>
          <div class="stat-content">
            <h3>{{ estatisticas.total }}</h3>
            <p>Total de Comissões</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <h3>R$ {{ formatarMoeda(estatisticas.totalValor) }}</h3>
            <p>Valor Total</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pago">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>R$ {{ formatarMoeda(estatisticas.valorPago) }}</h3>
            <p>Pago ({{ estatisticas.pagas }})</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pendente">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>R$ {{ formatarMoeda(estatisticas.valorPendente) }}</h3>
            <p>Pendente ({{ estatisticas.pendentes }})</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Comissões -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-list"></i> Comissões</h2>
        <button @click="pagarEmLote" class="btn btn-success" v-if="comissoesPendentes.length > 0">
          <i class="fas fa-money-bill-wave"></i> Pagar Selecionadas
        </button>
      </div>
      
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>
      
      <div v-else-if="comissoesFiltradas.length === 0" class="empty-state">
        <i class="fas fa-money-bill-wave"></i>
        <p>Nenhuma comissão encontrada</p>
      </div>
      
      <table v-else class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" @change="selecionarTodas" v-model="todasSelecionadas"></th>
            <th>Data</th>
            <th>Profissional</th>
            <th>Paciente</th>
            <th>Procedimento</th>
            <th>Valor Atend.</th>
            <th>%</th>
            <th>Comissão</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comissao in comissoesPaginadas" :key="comissao.id" :class="{'paga': comissao.pago}">
            <td><input type="checkbox" v-model="comissao.selecionada" v-if="!comissao.pago"></td>
            <td>{{ formatarData(comissao.data) }}</td>
            <td><strong>{{ comissao.profissionalNome }}</strong></td>
            <td>{{ comissao.pacienteNome }}</td>
            <td>{{ comissao.procedimentoNome }}</td>
            <td>R$ {{ formatarMoeda(comissao.valorAtendimento) }}</td>
            <td>{{ comissao.percentualComissao }}%</td>
            <td class="valor-comissao">R$ {{ formatarMoeda(comissao.valorComissao) }}</td>
            <td>
              <span :class="['status-badge', comissao.pago ? 'pago' : 'pendente']">
                {{ comissao.pago ? 'Pago' : 'Pendente' }}
              </span>
            </td>
            <td class="acoes">
              <button v-if="!comissao.pago" @click="pagar(comissao.id)" class="btn-icon btn-pagar" title="Pagar">
                <i class="fas fa-check"></i>
              </button>
              <span v-else class="data-pagamento">{{ formatarData(comissao.dataPagamento) }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação -->
      <Paginacao
        :pagina-atual="paginaAtual"
        :total-paginas="totalPaginas"
        :total-itens="totalItens"
        :itens-por-pagina="itensPorPagina"
        :tem-pagina-anterior="temPaginaAnterior"
        :tem-proxima-pagina="temProximaPagina"
        :paginas-visiveis="paginasVisiveis"
        @ir-para-pagina="irParaPagina"
        @proxima-pagina="proximaPagina"
        @pagina-anterior="paginaAnterior"
        @primeira-pagina="primeiraPagina"
        @ultima-pagina="ultimaPagina"
        @alterar-itens-por-pagina="alterarItensPorPagina"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useComissoes } from '../composables/useComissoes.js'
import { useProfissionais } from '../composables/useProfissionais.js'
import { usePaginacao } from '../composables/usePaginacao.js'
import VoltarHome from '../components/VoltarHome.vue'
import Paginacao from '../components/Paginacao.vue'

const route = useRoute()
const { comissoes, carregando, buscarComissoes, pagarComissao, obterEstatisticasComissoes } = useComissoes()
const { profissionais, buscarProfissionais } = useProfissionais()

// Paginação
const {
  paginaAtual,
  totalItens,
  itensPorPagina,
  totalPaginas,
  temPaginaAnterior,
  temProximaPagina,
  itensVisiveis,
  paginasVisiveis,
  irParaPagina,
  proximaPagina,
  paginaAnterior,
  primeiraPagina,
  ultimaPagina,
  atualizarTotalItens,
  alterarItensPorPagina
} = usePaginacao(10)

// Filtros customizados
const filtrosProfissional = ref(route.query.profissionalId || '')
const filtrosStatus = ref('')
const filtrosDataInicio = ref('')
const filtrosDataFim = ref('')

const filtros = ref({
  profissionalId: route.query.profissionalId || '',
  status: '',
  dataInicio: '',
  dataFim: ''
})

const estatisticas = ref(null)
const todasSelecionadas = ref(false)

// Computed para comissões filtradas e paginadas
const comissoesFiltradas = computed(() => {
  let resultado = [...comissoes.value]
  
  // Aplicar filtros customizados
  if (filtrosProfissional.value) {
    resultado = resultado.filter(c => c.profissionalId === filtrosProfissional.value)
  }
  if (filtrosStatus.value) {
    if (filtrosStatus.value === 'pago') {
      resultado = resultado.filter(c => c.pago === true)
    } else if (filtrosStatus.value === 'pendente') {
      resultado = resultado.filter(c => c.pago === false)
    }
  }
  if (filtrosDataInicio.value) {
    resultado = resultado.filter(c => {
      const dataComissao = new Date(c.data)
      const dataInicio = new Date(filtrosDataInicio.value)
      return dataComissao >= dataInicio
    })
  }
  if (filtrosDataFim.value) {
    resultado = resultado.filter(c => {
      const dataComissao = new Date(c.data)
      const dataFim = new Date(filtrosDataFim.value)
      return dataComissao <= dataFim
    })
  }
  
  return resultado
})

const comissoesPaginadas = computed(() => {
  const { inicio, fim } = itensVisiveis.value
  return comissoesFiltradas.value.slice(inicio, fim)
})

const comissoesPendentes = computed(() => {
  return comissoes.value.filter(c => !c.pago && c.selecionada)
})

const aplicarFiltrosCustom = () => {
  atualizarTotalItens(comissoesFiltradas.value.length)
  primeiraPagina()
}

onMounted(async () => {
  await buscarProfissionais(true)
  await carregarDados()
  atualizarTotalItens(comissoesFiltradas.value.length)
})

const carregarDados = async () => {
  await buscarComissoes(filtros.value)
  if (filtros.value.profissionalId) {
    estatisticas.value = await obterEstatisticasComissoes(
      filtros.value.profissionalId,
      filtros.value.dataInicio,
      filtros.value.dataFim
    )
  }
}

const aplicarFiltros = async () => {
  await carregarDados()
}

const selecionarTodas = () => {
  comissoes.value.forEach(c => {
    if (!c.pago) {
      c.selecionada = todasSelecionadas.value
    }
  })
}

const pagar = async (comissaoId) => {
  const dataPagamento = prompt('Data do pagamento (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
  if (dataPagamento) {
    const resultado = await pagarComissao(comissaoId, dataPagamento)
    if (resultado.success) {
      alert('Comissão paga! Conta a pagar criada no financeiro.')
      await carregarDados()
    } else {
      alert('Erro: ' + resultado.error)
    }
  }
}

const pagarEmLote = async () => {
  const selecionadas = comissoesPendentes.value
  if (selecionadas.length === 0) {
    alert('Selecione pelo menos uma comissão!')
    return
  }

  const dataPagamento = prompt(
    `Pagar ${selecionadas.length} comissão(ões)?\n\nData do pagamento (YYYY-MM-DD):`,
    new Date().toISOString().split('T')[0]
  )

  if (dataPagamento) {
    let sucesso = 0
    for (const comissao of selecionadas) {
      const resultado = await pagarComissao(comissao.id, dataPagamento)
      if (resultado.success) sucesso++
    }
    alert(`${sucesso} comissão(ões) paga(s) com sucesso!`)
    await carregarDados()
  }
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor || 0)
}

const formatarData = (data) => {
  if (!data) return ''
  return new Date(data.toDate ? data.toDate() : data).toLocaleDateString('pt-BR')
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.header-content { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.header-content h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.filtros-comissoes { padding: 16px 0; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-header h2 { margin: 0; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 1px solid #e5e5ea; }
.stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; background: #667eea; }
.stat-icon.total { background: #007aff; }
.stat-icon.pago { background: #34c759; }
.stat-icon.pendente { background: #ff9500; }
.stat-content h3 { margin: 0 0 4px 0; font-size: 24px; font-weight: 700; color: #1d1d1f; }
.stat-content p { margin: 0; font-size: 14px; color: #6e6e73; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table thead th { text-align: left; padding: 12px; background: #f5f5f7; font-weight: 600; font-size: 13px; }
.data-table tbody td { padding: 14px 12px; border-bottom: 1px solid #e5e5ea; }
.data-table tbody tr.paga { background: rgba(52, 199, 89, 0.05); opacity: 0.7; }
.valor-comissao { font-weight: 700; color: #34c759; font-size: 15px; }

.status-badge { padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
.status-badge.pago { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.status-badge.pendente { background: rgba(255, 149, 0, 0.1); color: #ff9500; }

.acoes { display: flex; gap: 8px; }
.btn-icon { width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; }
.btn-icon.btn-pagar { background: #34c759; color: white; }
.data-pagamento { font-size: 12px; color: #6e6e73; }

.loading, .empty-state { text-align: center; padding: 60px; color: #6e6e73; }
.empty-state i { font-size: 64px; color: #d2d2d7; margin-bottom: 16px; }
</style>

