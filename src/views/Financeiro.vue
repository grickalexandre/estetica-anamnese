<template>
  <div class="container financeiro-container">
    <div class="page-header">
      <h1><i class="fas fa-dollar-sign"></i> Gestão Financeira</h1>
      <p>Controle completo das finanças da sua clínica</p>
    </div>

    <!-- Cards de Resumo -->
    <div class="financial-summary">
      <div class="summary-card receitas">
        <div class="summary-icon">
          <i class="fas fa-arrow-up"></i>
        </div>
        <div class="summary-content">
          <h3>A Receber</h3>
          <p class="summary-value">R$ {{ formatarMoeda(totais.totalReceber) }}</p>
          <span class="summary-label">Pendente</span>
        </div>
      </div>

      <div class="summary-card recebido">
        <div class="summary-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="summary-content">
          <h3>Recebido</h3>
          <p class="summary-value">R$ {{ formatarMoeda(totais.totalRecebido) }}</p>
          <span class="summary-label">Neste período</span>
        </div>
      </div>

      <div class="summary-card despesas">
        <div class="summary-icon">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="summary-content">
          <h3>A Pagar</h3>
          <p class="summary-value">R$ {{ formatarMoeda(totais.totalPagar) }}</p>
          <span class="summary-label">Pendente</span>
        </div>
      </div>

      <div class="summary-card pago">
        <div class="summary-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="summary-content">
          <h3>Pago</h3>
          <p class="summary-value">R$ {{ formatarMoeda(totais.totalPago) }}</p>
          <span class="summary-label">Neste período</span>
        </div>
      </div>

      <div class="summary-card saldo" :class="totais.saldo >= 0 ? 'positivo' : 'negativo'">
        <div class="summary-icon">
          <i :class="totais.saldo >= 0 ? 'fas fa-wallet' : 'fas fa-exclamation-triangle'"></i>
        </div>
        <div class="summary-content">
          <h3>Saldo</h3>
          <p class="summary-value">R$ {{ formatarMoeda(totais.saldo) }}</p>
          <span class="summary-label">{{ totais.saldo >= 0 ? 'Positivo' : 'Negativo' }}</span>
        </div>
      </div>
    </div>

    <!-- Menu de Ações -->
    <div class="action-menu">
      <router-link to="/financeiro/contas-receber" class="action-btn receitas">
        <i class="fas fa-plus-circle"></i>
        <span>Nova Receita</span>
      </router-link>
      <router-link to="/financeiro/contas-pagar" class="action-btn despesas">
        <i class="fas fa-minus-circle"></i>
        <span>Nova Despesa</span>
      </router-link>
      <router-link to="/financeiro/fluxo-caixa" class="action-btn fluxo">
        <i class="fas fa-exchange-alt"></i>
        <span>Fluxo de Caixa</span>
      </router-link>
      <router-link to="/financeiro/relatorio-dre" class="action-btn relatorio">
        <i class="fas fa-file-invoice-dollar"></i>
        <span>Relatório DRE</span>
      </router-link>
    </div>

    <!-- Contas Vencendo (Próximos 7 dias) -->
    <div class="card">
      <h2><i class="fas fa-calendar-exclamation"></i> Vencimentos Próximos</h2>
      
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>

      <div v-else>
        <!-- Contas a Receber Vencendo -->
        <div v-if="contasRecendoVencer.length > 0" class="vencimentos-section">
          <h3 class="section-subtitle"><i class="fas fa-arrow-up"></i> Contas a Receber</h3>
          <div class="vencimentos-list">
            <div 
              v-for="conta in contasRecendoVencer" 
              :key="'receber-' + conta.id" 
              class="vencimento-item receber"
            >
              <div class="vencimento-info">
                <strong>{{ conta.descricao }}</strong>
                <span class="vencimento-data">
                  <i class="fas fa-calendar"></i>
                  {{ formatarData(conta.dataVencimento) }}
                </span>
              </div>
              <div class="vencimento-valor">
                R$ {{ formatarMoeda(conta.valor) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Contas a Pagar Vencendo -->
        <div v-if="contasPagarVencendo.length > 0" class="vencimentos-section">
          <h3 class="section-subtitle"><i class="fas fa-arrow-down"></i> Contas a Pagar</h3>
          <div class="vencimentos-list">
            <div 
              v-for="conta in contasPagarVencendo" 
              :key="'pagar-' + conta.id" 
              class="vencimento-item pagar"
            >
              <div class="vencimento-info">
                <strong>{{ conta.descricao }}</strong>
                <span class="vencimento-data">
                  <i class="fas fa-calendar"></i>
                  {{ formatarData(conta.dataVencimento) }}
                </span>
              </div>
              <div class="vencimento-valor">
                R$ {{ formatarMoeda(conta.valor) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="contasRecendoVencer.length === 0 && contasPagarVencendo.length === 0" class="empty-state">
          <i class="fas fa-check-circle"></i>
          <p>Nenhuma conta vencendo nos próximos 7 dias</p>
        </div>
      </div>
    </div>

    <!-- Atalhos Rápidos -->
    <div class="quick-links">
      <router-link to="/financeiro/contas-receber" class="quick-link-card">
        <i class="fas fa-file-invoice-dollar"></i>
        <h3>Contas a Receber</h3>
        <p>Gerencie suas receitas</p>
      </router-link>

      <router-link to="/financeiro/contas-pagar" class="quick-link-card">
        <i class="fas fa-file-invoice"></i>
        <h3>Contas a Pagar</h3>
        <p>Gerencie suas despesas</p>
      </router-link>

      <router-link to="/financeiro/fluxo-caixa" class="quick-link-card">
        <i class="fas fa-chart-line"></i>
        <h3>Fluxo de Caixa</h3>
        <p>Movimentações diárias</p>
      </router-link>

      <router-link to="/financeiro/plano-contas" class="quick-link-card">
        <i class="fas fa-sitemap"></i>
        <h3>Plano de Contas</h3>
        <p>Categorias e estrutura</p>
      </router-link>

      <router-link to="/financeiro/relatorio-dre" class="quick-link-card">
        <i class="fas fa-file-invoice-dollar"></i>
        <h3>Relatório DRE</h3>
        <p>Demonstração de resultados</p>
      </router-link>

      <router-link to="/financeiro/analise-tendencias" class="quick-link-card">
        <i class="fas fa-chart-line"></i>
        <h3>Análise de Tendências</h3>
        <p>Evolução e comparativos</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useFinanceiro } from '../composables/useFinanceiro.js'

const { 
  contasPagar, 
  contasReceber, 
  totais, 
  carregando,
  buscarContasPagar,
  buscarContasReceber
} = useFinanceiro()

onMounted(async () => {
  // Buscar todas as contas pendentes
  await Promise.all([
    buscarContasPagar({ status: 'pendente' }),
    buscarContasReceber({ status: 'pendente' })
  ])
})

// Filtrar contas vencendo nos próximos 7 dias
const hoje = new Date()
const seteDias = new Date()
seteDias.setDate(hoje.getDate() + 7)

const contasPagarVencendo = computed(() => {
  return contasPagar.value
    .filter(conta => {
      if (!conta.dataVencimento) return false
      const vencimento = conta.dataVencimento.toDate ? conta.dataVencimento.toDate() : new Date(conta.dataVencimento)
      return vencimento >= hoje && vencimento <= seteDias
    })
    .sort((a, b) => {
      const dataA = a.dataVencimento.toDate ? a.dataVencimento.toDate() : new Date(a.dataVencimento)
      const dataB = b.dataVencimento.toDate ? b.dataVencimento.toDate() : new Date(b.dataVencimento)
      return dataA - dataB
    })
})

const contasRecendoVencer = computed(() => {
  return contasReceber.value
    .filter(conta => {
      if (!conta.dataVencimento) return false
      const vencimento = conta.dataVencimento.toDate ? conta.dataVencimento.toDate() : new Date(conta.dataVencimento)
      return vencimento >= hoje && vencimento <= seteDias
    })
    .sort((a, b) => {
      const dataA = a.dataVencimento.toDate ? a.dataVencimento.toDate() : new Date(a.dataVencimento)
      const dataB = b.dataVencimento.toDate ? b.dataVencimento.toDate() : new Date(b.dataVencimento)
      return dataA - dataB
    })
})

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(valor || 0))
}

const formatarData = (data) => {
  if (!data) return ''
  const date = data.toDate ? data.toDate() : new Date(data)
  return new Intl.DateTimeFormat('pt-BR').format(date)
}
</script>

<style scoped>
.financeiro-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #1d1d1f;
  font-size: 28px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header p {
  color: #6e6e73;
  font-size: 16px;
}

/* Cards de Resumo */
.financial-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.summary-card.receitas .summary-icon {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  color: white;
}

.summary-card.recebido .summary-icon {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  color: white;
}

.summary-card.despesas .summary-icon {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
  color: white;
}

.summary-card.pago .summary-icon {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
  color: white;
}

.summary-card.saldo.positivo .summary-icon {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  color: white;
}

.summary-card.saldo.negativo .summary-icon {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
  color: white;
}

.summary-content {
  flex: 1;
}

.summary-content h3 {
  font-size: 14px;
  color: #6e6e73;
  margin-bottom: 4px;
  font-weight: 500;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 12px;
  color: #86868b;
}

/* Menu de Ações */
.action-menu {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  color: white;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn.receitas {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
}

.action-btn.despesas {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
}

.action-btn.fluxo {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
}

.action-btn.relatorio {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
}

/* Vencimentos */
.vencimentos-section {
  margin-bottom: 24px;
}

.section-subtitle {
  font-size: 16px;
  color: #1d1d1f;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.vencimentos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vencimento-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.vencimento-item.receber {
  background: rgba(102, 126, 234, 0.05);
  border-left-color: #667eea;
}

.vencimento-item.pagar {
  background: rgba(255, 107, 107, 0.05);
  border-left-color: #ff6b6b;
}

.vencimento-info strong {
  display: block;
  color: #1d1d1f;
  font-size: 15px;
  margin-bottom: 4px;
}

.vencimento-data {
  font-size: 13px;
  color: #6e6e73;
  display: flex;
  align-items: center;
  gap: 6px;
}

.vencimento-valor {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6e6e73;
}

.empty-state i {
  font-size: 48px;
  color: #34c759;
  margin-bottom: 16px;
}

/* Atalhos Rápidos */
.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.quick-link-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  text-decoration: none;
  color: #1d1d1f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.quick-link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.quick-link-card i {
  font-size: 36px;
  color: #1d1d1f;
  margin-bottom: 12px;
}

.quick-link-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #1d1d1f;
}

.quick-link-card p {
  font-size: 14px;
  color: #6e6e73;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6e6e73;
  font-size: 16px;
}

.loading i {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .financial-summary {
    grid-template-columns: 1fr;
  }

  .action-menu {
    grid-template-columns: 1fr;
  }

  .quick-links {
    grid-template-columns: 1fr;
  }

  .vencimento-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

