<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-chart-line"></i> Relatório de Atendimentos</h1>
    </div>

    <!-- Filtros -->
    <div class="card">
      <h2><i class="fas fa-filter"></i> Filtros</h2>
      <div class="form-row">
        <div class="form-group">
          <label>Data Início</label>
          <input v-model="filtros.dataInicio" type="date">
        </div>
        <div class="form-group">
          <label>Data Fim</label>
          <input v-model="filtros.dataFim" type="date">
        </div>
        <div class="form-group">
          <label>Cliente</label>
          <select v-model="filtros.clienteId">
            <option value="">Todos os clientes</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nome }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <button @click="aplicarFiltros" class="btn btn-primary">
            <i class="fas fa-search"></i> Aplicar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Estatísticas -->
    <div v-if="estatisticas" class="card">
      <h2><i class="fas fa-chart-bar"></i> Estatísticas</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="stat-content">
            <h3>{{ estatisticas.totalAtendimentos }}</h3>
            <p>Total de Atendimentos</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon receita">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <h3>R$ {{ formatarMoeda(estatisticas.totalReceita) }}</h3>
            <p>Receita Total</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon custo">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-content">
            <h3>R$ {{ formatarMoeda(estatisticas.totalCustos) }}</h3>
            <p>Custos de Produtos</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" :class="{'positivo': estatisticas.margemLucro > 0, 'negativo': estatisticas.margemLucro < 0}">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <h3>{{ estatisticas.margemLucro.toFixed(1) }}%</h3>
            <p>Margem de Lucro</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>{{ estatisticas.clientesUnicos }}</h3>
            <p>Clientes Únicos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Atendimentos -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-list"></i> Atendimentos</h2>
        <button @click="exportarRelatorio" class="btn btn-secondary">
          <i class="fas fa-download"></i> Exportar
        </button>
      </div>
      
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>
      
      <div v-else-if="atendimentos.length === 0" class="empty-state">
        <i class="fas fa-user-md"></i>
        <p>Nenhum atendimento encontrado</p>
      </div>
      
      <div v-else class="atendimentos-list">
        <div v-for="atendimento in atendimentos" :key="atendimento.id" class="atendimento-item">
          <div class="atendimento-header">
            <div class="atendimento-info">
              <h3>{{ atendimento.procedimentoNome }}</h3>
              <p><i class="fas fa-user"></i> {{ atendimento.clienteNome }}</p>
              <p><i class="fas fa-calendar"></i> {{ formatarData(atendimento.data) }}</p>
            </div>
            <div class="atendimento-valor">
              <span class="valor">R$ {{ formatarMoeda(atendimento.valorCobrado) }}</span>
              <span class="status" :class="atendimento.pago ? 'pago' : 'pendente'">
                {{ atendimento.pago ? 'Pago' : 'Pendente' }}
              </span>
            </div>
          </div>
          
          <div v-if="atendimento.produtosUtilizados && atendimento.produtosUtilizados.length > 0" class="produtos-utilizados">
            <h4><i class="fas fa-flask"></i> Produtos Utilizados:</h4>
            <div class="produtos-grid">
              <div v-for="produto in atendimento.produtosUtilizados" :key="produto.produtoId" class="produto-item">
                <span class="produto-nome">{{ produto.produtoNome }}</span>
                <span class="produto-quantidade">{{ produto.quantidade }} {{ produto.unidade }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="atendimento.observacoes" class="observacoes">
            <h4><i class="fas fa-sticky-note"></i> Observações:</h4>
            <p>{{ atendimento.observacoes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProcedimentos } from '../composables/useProcedimentos.js'
import { usePacientes } from '../composables/usePacientes.js'

const { atendimentos, carregando, buscarAtendimentos, obterEstatisticasAtendimentos } = useProcedimentos()
const { clientes, buscarClientes } = usePacientes()

const filtros = ref({
  dataInicio: '',
  dataFim: '',
  clienteId: ''
})

const estatisticas = ref(null)

onMounted(async () => {
  await buscarClientes(true)
  await carregarDados()
})

const carregarDados = async () => {
  await buscarAtendimentos(filtros.value.dataInicio, filtros.value.dataFim, filtros.value.clienteId)
  estatisticas.value = await obterEstatisticasAtendimentos(filtros.value.dataInicio, filtros.value.dataFim)
}

const aplicarFiltros = async () => {
  await carregarDados()
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor || 0)
}

const formatarData = (data) => {
  if (!data) return ''
  return new Date(data.toDate ? data.toDate() : data).toLocaleDateString('pt-BR')
}

const exportarRelatorio = () => {
  // Implementar exportação para PDF ou Excel
  alert('Funcionalidade de exportação será implementada em breve!')
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-header h2 { margin: 0; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
.stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 1px solid #e5e5ea; }
.stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; background: #667eea; }
.stat-icon.receita { background: #34c759; }
.stat-icon.custo { background: #ff3b30; }
.stat-icon.positivo { background: #34c759; }
.stat-icon.negativo { background: #ff3b30; }
.stat-content h3 { margin: 0 0 4px 0; font-size: 24px; font-weight: 700; color: #1d1d1f; }
.stat-content p { margin: 0; font-size: 14px; color: #6e6e73; }

.atendimentos-list { display: flex; flex-direction: column; gap: 16px; }
.atendimento-item { background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #e5e5ea; }
.atendimento-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.atendimento-info h3 { margin: 0 0 8px 0; font-size: 18px; color: #1d1d1f; }
.atendimento-info p { margin: 0 0 4px 0; font-size: 14px; color: #6e6e73; display: flex; align-items: center; gap: 6px; }
.atendimento-valor { text-align: right; }
.atendimento-valor .valor { display: block; font-size: 20px; font-weight: 700; color: #1d1d1f; margin-bottom: 4px; }
.atendimento-valor .status { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.atendimento-valor .status.pago { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.atendimento-valor .status.pendente { background: rgba(255, 149, 0, 0.1); color: #ff9500; }

.produtos-utilizados { margin-bottom: 16px; }
.produtos-utilizados h4 { margin: 0 0 12px 0; font-size: 14px; color: #1d1d1f; display: flex; align-items: center; gap: 6px; }
.produtos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; }
.produto-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: white; border-radius: 6px; border: 1px solid #e5e5ea; }
.produto-nome { font-size: 13px; color: #1d1d1f; }
.produto-quantidade { font-size: 12px; color: #6e6e73; font-weight: 600; }

.observacoes { margin-top: 16px; }
.observacoes h4 { margin: 0 0 8px 0; font-size: 14px; color: #1d1d1f; display: flex; align-items: center; gap: 6px; }
.observacoes p { margin: 0; font-size: 14px; color: #6e6e73; line-height: 1.5; }

.loading, .empty-state { text-align: center; padding: 60px; color: #6e6e73; }
.empty-state i { font-size: 64px; color: #d2d2d7; margin-bottom: 16px; }
</style>
