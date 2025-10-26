<template>
  <div class="container">
    <div class="page-header">
      <div>
        <h1><i class="fas fa-file-invoice-dollar"></i> DRE - Demonstração do Resultado do Exercício</h1>
        <p>Análise detalhada de receitas, despesas e resultados</p>
      </div>
      <div class="header-actions">
        <button @click="exportarPDF" class="btn btn-secondary">
          <i class="fas fa-file-pdf"></i>
          Exportar PDF
        </button>
        <button @click="imprimirDRE" class="btn btn-secondary">
          <i class="fas fa-print"></i>
          Imprimir
        </button>
      </div>
    </div>

    <!-- Seletor de Período -->
    <div class="card">
      <div class="periodo-selector">
        <button 
          v-for="periodo in periodos" 
          :key="periodo.value"
          @click="selecionarPeriodo(periodo.value)"
          :class="['periodo-btn', { active: periodoSelecionado === periodo.value }]"
        >
          {{ periodo.label }}
        </button>
        <div class="custom-period">
          <input type="date" v-model="dataInicio" @change="aplicarPeriodoCustom">
          <span>até</span>
          <input type="date" v-model="dataFim" @change="aplicarPeriodoCustom">
          <button @click="gerarRelatorio" class="btn btn-primary">
            <i class="fas fa-sync"></i>
            Atualizar
          </button>
        </div>
      </div>
    </div>

    <!-- DRE -->
    <div v-if="carregando" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Gerando relatório...
    </div>

    <div v-else-if="dre" class="dre-report">
      <!-- Cabeçalho do Relatório -->
      <div class="card report-header">
        <h2>Período: {{ formatarPeriodo(dre.periodo.dataInicio, dre.periodo.dataFim) }}</h2>
        <p class="report-date">Gerado em: {{ new Date().toLocaleString('pt-BR') }}</p>
      </div>

      <!-- Resumo Executivo -->
      <div class="card summary-cards">
        <div class="summary-card receitas">
          <div class="summary-icon">
            <i class="fas fa-arrow-up"></i>
          </div>
          <div class="summary-content">
            <h3>Receita Total</h3>
            <p class="summary-value">R$ {{ formatarMoeda(dre.receitas.total) }}</p>
            <span class="summary-detail">{{ dre.receitas.quantidade }} lançamento(s)</span>
          </div>
        </div>

        <div class="summary-card despesas">
          <div class="summary-icon">
            <i class="fas fa-arrow-down"></i>
          </div>
          <div class="summary-content">
            <h3>Despesa Total</h3>
            <p class="summary-value">R$ {{ formatarMoeda(dre.despesas.total) }}</p>
            <span class="summary-detail">{{ dre.despesas.quantidade }} lançamento(s)</span>
          </div>
        </div>

        <div class="summary-card lucro" :class="dre.resultado.lucroLiquido >= 0 ? 'positivo' : 'negativo'">
          <div class="summary-icon">
            <i :class="dre.resultado.lucroLiquido >= 0 ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
          </div>
          <div class="summary-content">
            <h3>{{ dre.resultado.lucroLiquido >= 0 ? 'Lucro' : 'Prejuízo' }}</h3>
            <p class="summary-value">R$ {{ formatarMoeda(dre.resultado.lucroLiquido) }}</p>
            <span class="summary-detail">Margem: {{ dre.resultado.margemLucro.toFixed(2) }}%</span>
          </div>
        </div>
      </div>

      <!-- Tabela DRE Detalhada -->
      <div class="card">
        <h2 class="section-title"><i class="fas fa-table"></i> Demonstração Detalhada</h2>
        
        <table class="dre-table">
          <tbody>
            <!-- RECEITAS -->
            <tr class="header-row">
              <td colspan="2"><strong>RECEITAS OPERACIONAIS</strong></td>
              <td class="valor"><strong>R$ {{ formatarMoeda(dre.receitas.total) }}</strong></td>
            </tr>
            
            <tr 
              v-for="(dados, categoria) in dre.receitas.porCategoria" 
              :key="'receita-' + categoria"
              class="detail-row"
            >
              <td class="categoria-indent">{{ getNomeCategoria(categoria, 'receita') }}</td>
              <td class="quantidade">{{ dados.quantidade }} item(ns)</td>
              <td class="valor">R$ {{ formatarMoeda(dados.total) }}</td>
            </tr>

            <!-- DESPESAS -->
            <tr class="header-row spacer">
              <td colspan="2"><strong>(-) DESPESAS OPERACIONAIS</strong></td>
              <td class="valor"><strong>R$ {{ formatarMoeda(dre.despesas.total) }}</strong></td>
            </tr>

            <tr 
              v-for="(dados, categoria) in dre.despesas.porCategoria" 
              :key="'despesa-' + categoria"
              class="detail-row despesa"
            >
              <td class="categoria-indent">{{ getNomeCategoria(categoria, 'despesa') }}</td>
              <td class="quantidade">{{ dados.quantidade }} item(ns)</td>
              <td class="valor">R$ {{ formatarMoeda(dados.total) }}</td>
            </tr>

            <!-- RESULTADO -->
            <tr class="total-row">
              <td colspan="2"><strong>= RESULTADO OPERACIONAL ({{ dre.resultado.lucroLiquido >= 0 ? 'LUCRO' : 'PREJUÍZO' }})</strong></td>
              <td class="valor" :class="dre.resultado.lucroLiquido >= 0 ? 'positivo' : 'negativo'">
                <strong>R$ {{ formatarMoeda(dre.resultado.lucroLiquido) }}</strong>
              </td>
            </tr>

            <tr class="margin-row">
              <td colspan="2">MARGEM DE LUCRO</td>
              <td class="valor">{{ dre.resultado.margemLucro.toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Gráficos -->
      <div class="charts-grid">
        <!-- Gráfico de Receitas por Categoria -->
        <div class="card">
          <h3><i class="fas fa-chart-pie"></i> Receitas por Categoria</h3>
          <div class="chart-container">
            <canvas ref="chartReceitas"></canvas>
          </div>
        </div>

        <!-- Gráfico de Despesas por Categoria -->
        <div class="card">
          <h3><i class="fas fa-chart-pie"></i> Despesas por Categoria</h3>
          <div class="chart-container">
            <canvas ref="chartDespesas"></canvas>
          </div>
        </div>
      </div>

      <!-- Análise de Performance -->
      <div class="card">
        <h2 class="section-title"><i class="fas fa-chart-line"></i> Análise de Performance</h2>
        
        <div class="performance-grid">
          <div class="performance-item">
            <div class="performance-label">Ticket Médio de Receita</div>
            <div class="performance-value">
              R$ {{ formatarMoeda(dre.receitas.total / (dre.receitas.quantidade || 1)) }}
            </div>
          </div>

          <div class="performance-item">
            <div class="performance-label">Ticket Médio de Despesa</div>
            <div class="performance-value">
              R$ {{ formatarMoeda(dre.despesas.total / (dre.despesas.quantidade || 1)) }}
            </div>
          </div>

          <div class="performance-item">
            <div class="performance-label">Custo Operacional %</div>
            <div class="performance-value">
              {{ dre.receitas.total > 0 ? ((dre.despesas.total / dre.receitas.total) * 100).toFixed(2) : 0 }}%
            </div>
          </div>

          <div class="performance-item">
            <div class="performance-label">Retorno sobre Receita (ROI)</div>
            <div class="performance-value" :class="dre.resultado.margemLucro >= 0 ? 'positivo' : 'negativo'">
              {{ dre.resultado.margemLucro.toFixed(2) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRelatoriosFinanceiros } from '../composables/useRelatoriosFinanceiros.js'
import { Chart, registerables } from 'chart.js'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

Chart.register(...registerables)

const { gerarDRE, carregando } = useRelatoriosFinanceiros()

const periodoSelecionado = ref('mes')
const hoje = new Date()
const dataInicio = ref(new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0])
const dataFim = ref(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0])

const periodos = [
  { label: 'Este Mês', value: 'mes' },
  { label: 'Último Mês', value: 'mes-anterior' },
  { label: 'Este Trimestre', value: 'trimestre' },
  { label: 'Este Ano', value: 'ano' }
]

const dre = ref(null)
const chartReceitas = ref(null)
const chartDespesas = ref(null)

const mapaCategorias = {
  consultas: 'Consultas',
  procedimentos: 'Procedimentos Estéticos',
  produtos: 'Venda de Produtos',
  pacotes: 'Pacotes de Procedimentos',
  outros: 'Outros',
  aluguel: 'Aluguel',
  salarios: 'Salários',
  fornecedores: 'Fornecedores',
  impostos: 'Impostos',
  energia: 'Energia Elétrica',
  agua: 'Água',
  internet: 'Internet e Telefone',
  marketing: 'Marketing',
  manutencao: 'Manutenção'
}

onMounted(async () => {
  await gerarRelatorio()
})

const selecionarPeriodo = (periodo) => {
  periodoSelecionado.value = periodo
  const hoje = new Date()

  switch (periodo) {
    case 'mes':
      dataInicio.value = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      dataFim.value = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
      break
    case 'mes-anterior':
      dataInicio.value = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1).toISOString().split('T')[0]
      dataFim.value = new Date(hoje.getFullYear(), hoje.getMonth(), 0).toISOString().split('T')[0]
      break
    case 'trimestre':
      const mesInicio = Math.floor(hoje.getMonth() / 3) * 3
      dataInicio.value = new Date(hoje.getFullYear(), mesInicio, 1).toISOString().split('T')[0]
      dataFim.value = new Date(hoje.getFullYear(), mesInicio + 3, 0).toISOString().split('T')[0]
      break
    case 'ano':
      dataInicio.value = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0]
      dataFim.value = new Date(hoje.getFullYear(), 11, 31).toISOString().split('T')[0]
      break
  }

  gerarRelatorio()
}

const aplicarPeriodoCustom = () => {
  periodoSelecionado.value = 'custom'
  gerarRelatorio()
}

const gerarRelatorio = async () => {
  const resultado = await gerarDRE(dataInicio.value, dataFim.value)
  if (resultado.success) {
    dre.value = resultado
    await nextTick()
    renderizarGraficos()
  }
}

let chartReceitasInstance = null
let chartDespesasInstance = null

const renderizarGraficos = () => {
  if (!dre.value) return

  // Destruir gráficos anteriores
  if (chartReceitasInstance) chartReceitasInstance.destroy()
  if (chartDespesasInstance) chartDespesasInstance.destroy()

  // Gráfico de Receitas
  if (chartReceitas.value) {
    const ctxReceitas = chartReceitas.value.getContext('2d')
    const datasReceitas = Object.entries(dre.value.receitas.porCategoria)
    
    chartReceitasInstance = new Chart(ctxReceitas, {
      type: 'doughnut',
      data: {
        labels: datasReceitas.map(([cat]) => getNomeCategoria(cat, 'receita')),
        datasets: [{
          data: datasReceitas.map(([, dados]) => dados.total),
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#f093fb',
            '#4facfe',
            '#43e97b',
            '#fa709a'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ''
                const value = context.parsed || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: R$ ${formatarMoeda(value)} (${percentage}%)`
              }
            }
          }
        }
      }
    })
  }

  // Gráfico de Despesas
  if (chartDespesas.value) {
    const ctxDespesas = chartDespesas.value.getContext('2d')
    const datasDespesas = Object.entries(dre.value.despesas.porCategoria)
    
    chartDespesasInstance = new Chart(ctxDespesas, {
      type: 'doughnut',
      data: {
        labels: datasDespesas.map(([cat]) => getNomeCategoria(cat, 'despesa')),
        datasets: [{
          data: datasDespesas.map(([, dados]) => dados.total),
          backgroundColor: [
            '#ff6b6b',
            '#ee5a6f',
            '#ff9a9e',
            '#fad0c4',
            '#ffecd2',
            '#fcb69f'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ''
                const value = context.parsed || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: R$ ${formatarMoeda(value)} (${percentage}%)`
              }
            }
          }
        }
      }
    })
  }
}

const exportarPDF = () => {
  if (!dre.value) return

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  
  // Cabeçalho
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text('DRE - Demonstração do Resultado do Exercício', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Período: ${formatarPeriodo(dre.value.periodo.dataInicio, dre.value.periodo.dataFim)}`, pageWidth / 2, 28, { align: 'center' })
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 34, { align: 'center' })
  
  // Resumo
  let y = 45
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('RESUMO EXECUTIVO', 14, y)
  
  y += 10
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Receita Total: R$ ${formatarMoeda(dre.value.receitas.total)}`, 14, y)
  y += 6
  doc.text(`Despesa Total: R$ ${formatarMoeda(dre.value.despesas.total)}`, 14, y)
  y += 6
  doc.setFont(undefined, 'bold')
  const resultadoTexto = dre.value.resultado.lucroLiquido >= 0 ? 'LUCRO' : 'PREJUÍZO'
  doc.text(`${resultadoTexto}: R$ ${formatarMoeda(dre.value.resultado.lucroLiquido)}`, 14, y)
  y += 6
  doc.setFont(undefined, 'normal')
  doc.text(`Margem de Lucro: ${dre.value.resultado.margemLucro.toFixed(2)}%`, 14, y)
  
  // Tabela de Receitas
  y += 15
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('RECEITAS OPERACIONAIS', 14, y)
  
  const receitasData = Object.entries(dre.value.receitas.porCategoria).map(([cat, dados]) => [
    getNomeCategoria(cat, 'receita'),
    dados.quantidade,
    `R$ ${formatarMoeda(dados.total)}`
  ])
  
  doc.autoTable({
    startY: y + 5,
    head: [['Categoria', 'Qtd', 'Valor']],
    body: receitasData,
    foot: [['TOTAL', dre.value.receitas.quantidade, `R$ ${formatarMoeda(dre.value.receitas.total)}`]],
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] },
    footStyles: { fillColor: [200, 200, 200], fontStyle: 'bold' }
  })
  
  // Tabela de Despesas
  y = doc.lastAutoTable.finalY + 15
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('DESPESAS OPERACIONAIS', 14, y)
  
  const despesasData = Object.entries(dre.value.despesas.porCategoria).map(([cat, dados]) => [
    getNomeCategoria(cat, 'despesa'),
    dados.quantidade,
    `R$ ${formatarMoeda(dados.total)}`
  ])
  
  doc.autoTable({
    startY: y + 5,
    head: [['Categoria', 'Qtd', 'Valor']],
    body: despesasData,
    foot: [['TOTAL', dre.value.despesas.quantidade, `R$ ${formatarMoeda(dre.value.despesas.total)}`]],
    theme: 'grid',
    headStyles: { fillColor: [255, 107, 107] },
    footStyles: { fillColor: [200, 200, 200], fontStyle: 'bold' }
  })
  
  // Salvar PDF
  doc.save(`DRE_${dre.value.periodo.dataInicio}_${dre.value.periodo.dataFim}.pdf`)
}

const getNomeCategoria = (codigo, tipo) => {
  return mapaCategorias[codigo] || codigo
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(valor || 0))
}

const formatarPeriodo = (inicio, fim) => {
  const dataIni = new Date(inicio)
  const dataFim = new Date(fim)
  return `${dataIni.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`
}

const imprimirDRE = () => {
  window.print()
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.page-header p {
  color: #6e6e73;
  font-size: 15px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Seletor de Período */
.periodo-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.periodo-btn {
  padding: 10px 20px;
  border: 1px solid #d2d2d7;
  border-radius: 20px;
  background: white;
  color: #1d1d1f;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.periodo-btn:hover {
  background: #f5f5f7;
}

.periodo-btn.active {
  background: #1d1d1f;
  color: white;
  border-color: #1d1d1f;
}

.custom-period {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.custom-period input {
  padding: 8px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
}

.custom-period span {
  color: #6e6e73;
  font-size: 13px;
}

/* Cabeçalho do Relatório */
.report-header {
  text-align: center;
  padding: 24px;
}

.report-header h2 {
  font-size: 22px;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.report-date {
  color: #6e6e73;
  font-size: 13px;
}

/* Cards de Resumo */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 24px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
}

.summary-card.receitas {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.summary-card.despesas {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 111, 0.1) 100%);
}

.summary-card.lucro.positivo {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(67, 160, 71, 0.1) 100%);
}

.summary-card.lucro.negativo {
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(229, 57, 53, 0.1) 100%);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.summary-card.receitas .summary-icon {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  color: white;
}

.summary-card.despesas .summary-icon {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
  color: white;
}

.summary-card.lucro.positivo .summary-icon {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  color: white;
}

.summary-card.lucro.negativo .summary-icon {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
  color: white;
}

.summary-content h3 {
  font-size: 14px;
  color: #6e6e73;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.summary-detail {
  font-size: 12px;
  color: #86868b;
}

/* Tabela DRE */
.section-title {
  font-size: 18px;
  color: #1d1d1f;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dre-table {
  width: 100%;
  border-collapse: collapse;
}

.dre-table tr {
  border-bottom: 1px solid #e5e5ea;
}

.dre-table td {
  padding: 12px;
}

.header-row {
  background: #f5f5f7;
  font-weight: 700;
}

.header-row.spacer {
  margin-top: 20px;
}

.detail-row {
  transition: background 0.2s;
}

.detail-row:hover {
  background: #f9f9f9;
}

.categoria-indent {
  padding-left: 32px;
}

.quantidade {
  color: #6e6e73;
  font-size: 13px;
  text-align: center;
}

.valor {
  text-align: right;
  font-weight: 600;
}

.total-row {
  background: #1d1d1f;
  color: white;
  font-size: 16px;
}

.total-row .valor {
  font-size: 18px;
}

.total-row .valor.positivo {
  color: #34c759;
}

.total-row .valor.negativo {
  color: #ff3b30;
}

.margin-row {
  background: #f5f5f7;
  font-weight: 600;
}

/* Gráficos */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Performance */
.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.performance-item {
  padding: 16px;
  border-radius: 8px;
  background: #f5f5f7;
  text-align: center;
}

.performance-label {
  font-size: 13px;
  color: #6e6e73;
  margin-bottom: 8px;
}

.performance-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
}

.performance-value.positivo {
  color: #34c759;
}

.performance-value.negativo {
  color: #ff3b30;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6e6e73;
}

/* Print Styles */
@media print {
  .page-header button,
  .periodo-selector {
    display: none;
  }

  .card {
    page-break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ddd;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .periodo-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .custom-period {
    margin-left: 0;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .performance-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

