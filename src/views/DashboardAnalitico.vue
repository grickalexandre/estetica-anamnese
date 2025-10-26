<template>
  <div class="container dashboard-container">
    <div class="page-header">
      <h1><i class="fas fa-chart-pie"></i> Dashboard Analítico</h1>
      <select v-model="periodoSelecionado" @change="atualizarDados" class="periodo-select">
        <option value="mes">Este Mês</option>
        <option value="trimestre">Este Trimestre</option>
        <option value="ano">Este Ano</option>
      </select>
    </div>

    <div v-if="carregando" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando dados...</div>

    <div v-else-if="kpis" class="dashboard-content">
      <!-- KPIs Financeiros -->
      <div class="section-title"><i class="fas fa-dollar-sign"></i> Indicadores Financeiros</div>
      <div class="kpis-grid">
        <div class="kpi-card receita">
          <div class="kpi-icon"><i class="fas fa-arrow-up"></i></div>
          <div class="kpi-content">
            <h3>Faturamento</h3>
            <p class="kpi-value">R$ {{ formatarMoeda(kpis.financeiros.receitaTotal) }}</p>
            <span class="kpi-label">Total de receitas</span>
          </div>
        </div>
        <div class="kpi-card despesa">
          <div class="kpi-icon"><i class="fas fa-arrow-down"></i></div>
          <div class="kpi-content">
            <h3>Despesas</h3>
            <p class="kpi-value">R$ {{ formatarMoeda(kpis.financeiros.despesaTotal) }}</p>
            <span class="kpi-label">Total de custos</span>
          </div>
        </div>
        <div class="kpi-card lucro" :class="kpis.financeiros.lucro >= 0 ? 'positivo' : 'negativo'">
          <div class="kpi-icon"><i class="fas fa-wallet"></i></div>
          <div class="kpi-content">
            <h3>{{ kpis.financeiros.lucro >= 0 ? 'Lucro' : 'Prejuízo' }}</h3>
            <p class="kpi-value">R$ {{ formatarMoeda(kpis.financeiros.lucro) }}</p>
            <span class="kpi-label">Margem: {{ kpis.financeiros.margemLucro.toFixed(1) }}%</span>
          </div>
        </div>
        <div class="kpi-card ticket">
          <div class="kpi-icon"><i class="fas fa-receipt"></i></div>
          <div class="kpi-content">
            <h3>Ticket Médio</h3>
            <p class="kpi-value">R$ {{ formatarMoeda(kpis.financeiros.ticketMedio) }}</p>
            <span class="kpi-label">Por atendimento</span>
          </div>
        </div>
      </div>

      <!-- KPIs Operacionais -->
      <div class="section-title"><i class="fas fa-calendar-check"></i> Indicadores Operacionais</div>
      <div class="kpis-grid">
        <div class="kpi-card atendimentos">
          <div class="kpi-icon"><i class="fas fa-user-clock"></i></div>
          <div class="kpi-content">
            <h3>Atendimentos</h3>
            <p class="kpi-value">{{ kpis.operacionais.totalAgendamentos }}</p>
            <span class="kpi-label">Total no período</span>
          </div>
        </div>
        <div class="kpi-card realizados">
          <div class="kpi-icon"><i class="fas fa-check-double"></i></div>
          <div class="kpi-content">
            <h3>Realizados</h3>
            <p class="kpi-value">{{ kpis.operacionais.agendamentosRealizados }}</p>
            <span class="kpi-label">Atendimentos concluídos</span>
          </div>
        </div>
        <div class="kpi-card comparecimento">
          <div class="kpi-icon"><i class="fas fa-user-check"></i></div>
          <div class="kpi-content">
            <h3>Taxa Comparecimento</h3>
            <p class="kpi-value">{{ kpis.operacionais.taxaComparecimento.toFixed(1) }}%</p>
            <span class="kpi-label">Presença confirmada</span>
          </div>
        </div>
        <div class="kpi-card cancelamento">
          <div class="kpi-icon"><i class="fas fa-ban"></i></div>
          <div class="kpi-content">
            <h3>Taxa Cancelamento</h3>
            <p class="kpi-value">{{ kpis.operacionais.taxaCancelamento.toFixed(1) }}%</p>
            <span class="kpi-label">Agendamentos cancelados</span>
          </div>
        </div>
      </div>

      <!-- KPIs de Clientes -->
      <div class="section-title"><i class="fas fa-users"></i> Indicadores de Clientes</div>
      <div class="kpis-grid">
        <div class="kpi-card novos">
          <div class="kpi-icon"><i class="fas fa-user-plus"></i></div>
          <div class="kpi-content">
            <h3>Novos Clientes</h3>
            <p class="kpi-value">{{ kpis.clientes.novosClientes }}</p>
            <span class="kpi-label">Primeiras anamneses</span>
          </div>
        </div>
        <div class="kpi-card unicos">
          <div class="kpi-icon"><i class="fas fa-users"></i></div>
          <div class="kpi-content">
            <h3>Clientes Únicos</h3>
            <p class="kpi-value">{{ kpis.clientes.clientesUnicos }}</p>
            <span class="kpi-label">Diferentes pacientes</span>
          </div>
        </div>
        <div class="kpi-card anamneses">
          <div class="kpi-icon"><i class="fas fa-clipboard-list"></i></div>
          <div class="kpi-content">
            <h3>Anamneses</h3>
            <p class="kpi-value">{{ kpis.clientes.totalAnamneses }}</p>
            <span class="kpi-label">Total no período</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useKPIs } from '../composables/useKPIs.js'

const { carregando, calcularKPIs } = useKPIs()
const kpis = ref(null)
const periodoSelecionado = ref('mes')

onMounted(async () => {
  await atualizarDados()
})

const atualizarDados = async () => {
  const hoje = new Date()
  let inicio, fim

  if (periodoSelecionado.value === 'mes') {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59)
  } else if (periodoSelecionado.value === 'trimestre') {
    const mesInicio = Math.floor(hoje.getMonth() / 3) * 3
    inicio = new Date(hoje.getFullYear(), mesInicio, 1)
    fim = new Date(hoje.getFullYear(), mesInicio + 3, 0, 23, 59, 59)
  } else {
    inicio = new Date(hoje.getFullYear(), 0, 1)
    fim = new Date(hoje.getFullYear(), 11, 31, 23, 59, 59)
  }

  kpis.value = await calcularKPIs(inicio.toISOString(), fim.toISOString())
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(valor || 0))
}
</script>

<style scoped>
.dashboard-container { max-width: 1400px; margin: 0 auto; padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.page-header h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; }
.periodo-select { padding: 10px 16px; border: 1px solid #d2d2d7; border-radius: 8px; font-size: 14px; }
.section-title { font-size: 18px; color: #1d1d1f; margin: 30px 0 16px; display: flex; align-items: center; gap: 10px; font-weight: 700; }
.kpis-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
.kpi-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.kpi-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; }
.kpi-card.receita .kpi-icon { background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%); }
.kpi-card.despesa .kpi-icon { background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%); }
.kpi-card.lucro.positivo .kpi-icon { background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%); }
.kpi-card.lucro.negativo .kpi-icon { background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%); }
.kpi-card.ticket .kpi-icon { background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%); }
.kpi-card.atendimentos .kpi-icon { background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%); }
.kpi-card.realizados .kpi-icon { background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%); }
.kpi-card.comparecimento .kpi-icon { background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%); }
.kpi-card.cancelamento .kpi-icon { background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%); }
.kpi-card.novos .kpi-icon { background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%); }
.kpi-card.unicos .kpi-icon { background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%); }
.kpi-card.anamneses .kpi-icon { background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%); }
.kpi-content h3 { font-size: 14px; color: #6e6e73; margin-bottom: 4px; }
.kpi-value { font-size: 24px; font-weight: 700; color: #1d1d1f; margin-bottom: 4px; }
.kpi-label { font-size: 12px; color: #86868b; }
.loading { text-align: center; padding: 60px; color: #6e6e73; }
</style>

