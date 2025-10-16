<template>
  <div class="container">
    <div class="page-header">
      <div>
        <h1><i class="fas fa-chart-line"></i> Análise de Tendências</h1>
        <p>Comparativo mensal e evolução financeira</p>
      </div>
      <div class="header-actions">
        <select v-model="mesesSelecionados" @change="gerarAnalise" class="periodo-select">
          <option value="3">Últimos 3 meses</option>
          <option value="6">Últimos 6 meses</option>
          <option value="12">Últimos 12 meses</option>
        </select>
        <button @click="exportarPDF" class="btn btn-secondary">
          <i class="fas fa-file-pdf"></i>
          Exportar PDF
        </button>
      </div>
    </div>

    <div v-if="carregando" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Gerando análise...
    </div>

    <div v-else-if="analise" class="tendencias-content">
      <!-- Cards de Médias -->
      <div class="card">
        <h2 class="section-title"><i class="fas fa-calculator"></i> Médias do Período</h2>
        <div class="medias-grid">
          <div class="media-card receitas">
            <div class="media-icon">
              <i class="fas fa-arrow-up"></i>
            </div>
            <div class="media-content">
              <h3>Média de Receitas</h3>
              <p class="media-value">R$ {{ formatarMoeda(analise.medias.receitas) }}</p>
              <span class="media-detail">por mês</span>
            </div>
          </div>

          <div class="media-card despesas">
            <div class="media-icon">
              <i class="fas fa-arrow-down"></i>
            </div>
            <div class="media-content">
              <h3>Média de Despesas</h3>
              <p class="media-value">R$ {{ formatarMoeda(analise.medias.despesas) }}</p>
              <span class="media-detail">por mês</span>
            </div>
          </div>

          <div class="media-card lucro" :class="analise.medias.lucro >= 0 ? 'positivo' : 'negativo'">
            <div class="media-icon">
              <i :class="analise.medias.lucro >= 0 ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
            </div>
            <div class="media-content">
              <h3>Média de {{ analise.medias.lucro >= 0 ? 'Lucro' : 'Prejuízo' }}</h3>
              <p class="media-value">R$ {{ formatarMoeda(analise.medias.lucro) }}</p>
              <span class="media-detail">por mês</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de Linha - Evolução -->
      <div class="card">
        <h2 class="section-title"><i class="fas fa-chart-area"></i> Evolução Mensal</h2>
        <div class="chart-container">
          <canvas ref="chartEvolucao"></canvas>
        </div>
      </div>

      <!-- Gráfico de Barras - Comparativo -->
      <div class="card">
        <h2 class="section-title"><i class="fas fa-chart-bar"></i> Comparativo Receitas vs Despesas</h2>
        <div class="chart-container">
          <canvas ref="chartComparativo"></canvas>
        </div>
      </div>

      <!-- Tabela Detalhada -->
      <div class="card">
        <h2 class="section-title"><i class="fas fa-table"></i> Dados Mensais Detalhados</h2>
        <div class="table-responsive">
          <table class="tendencias-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Receitas</th>
                <th>Despesas</th>
                <th>Resultado</th>
                <th>Margem %</th>
                <th>Crescimento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(mes, index) in analise.comparativo" :key="mes.mes">
                <td><strong>{{ mes.mes }}</strong></td>
                <td class="valor receita">R$ {{ formatarMoeda(mes.receitas) }}</td>
                <td class="valor despesa">R$ {{ formatarMoeda(mes.despesas) }}</td>
                <td class="valor" :class="mes.lucro >= 0 ? 'positivo' : 'negativo'">
                  R$ {{ formatarMoeda(mes.lucro) }}
                </td>
                <td>{{ mes.margem.toFixed(2) }}%</td>
                <td>
                  <span v-if="index > 0" :class="calcularCrescimento(analise.comparativo[index - 1], mes) >= 0 ? 'crescimento positivo' : 'crescimento negativo'">
                    <i :class="calcularCrescimento(analise.comparativo[index - 1], mes) >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                    {{ Math.abs(calcularCrescimento(analise.comparativo[index - 1], mes)).toFixed(1) }}%
                  </span>
                  <span v-else class="crescimento neutro">-</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td><strong>TOTAL</strong></td>
                <td class="valor"><strong>R$ {{ formatarMoeda(totalReceitas) }}</strong></td>
                <td class="valor"><strong>R$ {{ formatarMoeda(totalDespesas) }}</strong></td>
                <td class="valor" :class="totalLucro >= 0 ? 'positivo' : 'negativo'">
                  <strong>R$ {{ formatarMoeda(totalLucro) }}</strong>
                </td>
                <td><strong>{{ margemMedia.toFixed(2) }}%</strong></td>
                <td>-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Insights e Análises -->
      <div class="card">
        <h2 class="section-title"><i class="fas fa-lightbulb"></i> Insights e Recomendações</h2>
        <div class="insights-grid">
          <div class="insight-item" :class="melhorMes ? 'positivo' : ''">
            <i class="fas fa-trophy"></i>
            <div>
              <strong>Melhor Mês</strong>
              <p>{{ melhorMes?.mes || 'N/A' }}</p>
              <span v-if="melhorMes">Lucro: R$ {{ formatarMoeda(melhorMes.lucro) }}</span>
            </div>
          </div>

          <div class="insight-item" :class="piorMes ? 'negativo' : ''">
            <i class="fas fa-exclamation-circle"></i>
            <div>
              <strong>Mês Mais Desafiador</strong>
              <p>{{ piorMes?.mes || 'N/A' }}</p>
              <span v-if="piorMes">Resultado: R$ {{ formatarMoeda(piorMes.lucro) }}</span>
            </div>
          </div>

          <div class="insight-item">
            <i class="fas fa-chart-line"></i>
            <div>
              <strong>Tendência</strong>
              <p>{{ tendencia }}</p>
              <span>{{ descricaoTendencia }}</span>
            </div>
          </div>

          <div class="insight-item">
            <i class="fas fa-percentage"></i>
            <div>
              <strong>Volatilidade</strong>
              <p>{{ volatilidade }}</p>
              <span>Variação entre meses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRelatoriosFinanceiros } from '../composables/useRelatoriosFinanceiros.js'
import { Chart } from 'chart.js'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const { compararMeses, carregando } = useRelatoriosFinanceiros()

const mesesSelecionados = ref(6)
const analise = ref(null)
const chartEvolucao = ref(null)
const chartComparativo = ref(null)

let chartEvolucaoInstance = null
let chartComparativoInstance = null

onMounted(async () => {
  await gerarAnalise()
})

const gerarAnalise = async () => {
  const resultado = await compararMeses(mesesSelecionados.value)
  if (resultado.success) {
    analise.value = resultado
    await nextTick()
    renderizarGraficos()
  }
}

const renderizarGraficos = () => {
  if (!analise.value) return

  // Destruir gráficos anteriores
  if (chartEvolucaoInstance) chartEvolucaoInstance.destroy()
  if (chartComparativoInstance) chartComparativoInstance.destroy()

  const meses = analise.value.comparativo.map(m => m.mes)
  const receitas = analise.value.comparativo.map(m => m.receitas)
  const despesas = analise.value.comparativo.map(m => m.despesas)
  const lucros = analise.value.comparativo.map(m => m.lucro)

  // Gráfico de Evolução (Linha)
  if (chartEvolucao.value) {
    const ctx = chartEvolucao.value.getContext('2d')
    
    chartEvolucaoInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Receitas',
            data: receitas,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Despesas',
            data: despesas,
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Lucro',
            data: lucros,
            borderColor: '#34c759',
            backgroundColor: 'rgba(52, 199, 89, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              font: { size: 13, weight: '600' }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: R$ ${formatarMoeda(context.parsed.y)}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `R$ ${formatarMoeda(value)}`
            }
          }
        }
      }
    })
  }

  // Gráfico Comparativo (Barras)
  if (chartComparativo.value) {
    const ctx = chartComparativo.value.getContext('2d')
    
    chartComparativoInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Receitas',
            data: receitas,
            backgroundColor: '#667eea',
            borderWidth: 0
          },
          {
            label: 'Despesas',
            data: despesas,
            backgroundColor: '#ff6b6b',
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              font: { size: 13, weight: '600' }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: R$ ${formatarMoeda(context.parsed.y)}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `R$ ${formatarMoeda(value)}`
            }
          }
        }
      }
    })
  }
}

const exportarPDF = () => {
  if (!analise.value) return

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text('Análise de Tendências Financeiras', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Últimos ${mesesSelecionados.value} meses`, pageWidth / 2, 28, { align: 'center' })
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 34, { align: 'center' })
  
  // Médias
  let y = 45
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('MÉDIAS DO PERÍODO', 14, y)
  
  y += 10
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Receita Média: R$ ${formatarMoeda(analise.value.medias.receitas)}`, 14, y)
  y += 6
  doc.text(`Despesa Média: R$ ${formatarMoeda(analise.value.medias.despesas)}`, 14, y)
  y += 6
  doc.text(`Lucro Médio: R$ ${formatarMoeda(analise.value.medias.lucro)}`, 14, y)
  
  // Tabela
  y += 15
  const tableData = analise.value.comparativo.map((mes, index) => {
    const crescimento = index > 0 
      ? calcularCrescimento(analise.value.comparativo[index - 1], mes)
      : 0
    
    return [
      mes.mes,
      `R$ ${formatarMoeda(mes.receitas)}`,
      `R$ ${formatarMoeda(mes.despesas)}`,
      `R$ ${formatarMoeda(mes.lucro)}`,
      `${mes.margem.toFixed(2)}%`,
      index > 0 ? `${crescimento >= 0 ? '+' : ''}${crescimento.toFixed(1)}%` : '-'
    ]
  })
  
  doc.autoTable({
    startY: y,
    head: [['Mês', 'Receitas', 'Despesas', 'Resultado', 'Margem', 'Crescimento']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] }
  })
  
  doc.save(`Analise_Tendencias_${mesesSelecionados.value}meses.pdf`)
}

const totalReceitas = computed(() => {
  return analise.value?.comparativo.reduce((sum, m) => sum + m.receitas, 0) || 0
})

const totalDespesas = computed(() => {
  return analise.value?.comparativo.reduce((sum, m) => sum + m.despesas, 0) || 0
})

const totalLucro = computed(() => {
  return totalReceitas.value - totalDespesas.value
})

const margemMedia = computed(() => {
  return totalReceitas.value > 0 ? (totalLucro.value / totalReceitas.value) * 100 : 0
})

const melhorMes = computed(() => {
  if (!analise.value) return null
  return analise.value.comparativo.reduce((melhor, mes) => 
    mes.lucro > melhor.lucro ? mes : melhor
  , analise.value.comparativo[0])
})

const piorMes = computed(() => {
  if (!analise.value) return null
  return analise.value.comparativo.reduce((pior, mes) => 
    mes.lucro < pior.lucro ? mes : pior
  , analise.value.comparativo[0])
})

const tendencia = computed(() => {
  if (!analise.value || analise.value.comparativo.length < 2) return 'Neutro'
  
  const primeiro = analise.value.comparativo[0]
  const ultimo = analise.value.comparativo[analise.value.comparativo.length - 1]
  
  const variacao = ((ultimo.lucro - primeiro.lucro) / Math.abs(primeiro.lucro)) * 100
  
  if (variacao > 10) return 'Crescimento'
  if (variacao < -10) return 'Queda'
  return 'Estável'
})

const descricaoTendencia = computed(() => {
  const tend = tendencia.value
  if (tend === 'Crescimento') return 'Resultados melhorando'
  if (tend === 'Queda') return 'Atenção necessária'
  return 'Mantendo estabilidade'
})

const volatilidade = computed(() => {
  if (!analise.value || analise.value.comparativo.length < 2) return 'Baixa'
  
  const lucros = analise.value.comparativo.map(m => m.lucro)
  const media = lucros.reduce((a, b) => a + b, 0) / lucros.length
  const variancia = lucros.reduce((sum, lucro) => sum + Math.pow(lucro - media, 2), 0) / lucros.length
  const desvioPadrao = Math.sqrt(variancia)
  const coefVariacao = (desvioPadrao / Math.abs(media)) * 100
  
  if (coefVariacao > 30) return 'Alta'
  if (coefVariacao > 15) return 'Moderada'
  return 'Baixa'
})

const calcularCrescimento = (mesAnterior, mesAtual) => {
  if (!mesAnterior || mesAnterior.lucro === 0) return 0
  return ((mesAtual.lucro - mesAnterior.lucro) / Math.abs(mesAnterior.lucro)) * 100
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(valor || 0))
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
  align-items: center;
}

.periodo-select {
  padding: 10px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: white;
  cursor: pointer;
}

/* Médias */
.section-title {
  font-size: 18px;
  color: #1d1d1f;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.medias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.media-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
}

.media-card.receitas {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.media-card.despesas {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 111, 0.1) 100%);
}

.media-card.lucro.positivo {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(67, 160, 71, 0.1) 100%);
}

.media-card.lucro.negativo {
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(229, 57, 53, 0.1) 100%);
}

.media-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.media-card.receitas .media-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.media-card.despesas .media-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.media-card.lucro.positivo .media-icon {
  background: linear-gradient(135deg, #34c759 0%, #43a047 100%);
  color: white;
}

.media-card.lucro.negativo .media-icon {
  background: linear-gradient(135deg, #ff3b30 0%, #e53935 100%);
  color: white;
}

.media-content h3 {
  font-size: 14px;
  color: #6e6e73;
  margin-bottom: 4px;
}

.media-value {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.media-detail {
  font-size: 12px;
  color: #86868b;
}

/* Gráficos */
.chart-container {
  height: 350px;
  padding: 20px;
}

/* Tabela */
.table-responsive {
  overflow-x: auto;
}

.tendencias-table {
  width: 100%;
  border-collapse: collapse;
}

.tendencias-table thead th {
  text-align: left;
  padding: 12px;
  background: #f5f5f7;
  color: #1d1d1f;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
}

.tendencias-table tbody td {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e5ea;
}

.tendencias-table tfoot td {
  padding: 14px 12px;
  background: #f5f5f7;
  font-weight: 700;
  border-top: 2px solid #1d1d1f;
}

.valor {
  font-weight: 600;
  text-align: right;
}

.valor.receita {
  color: #667eea;
}

.valor.despesa {
  color: #ff6b6b;
}

.valor.positivo {
  color: #34c759;
}

.valor.negativo {
  color: #ff3b30;
}

.crescimento {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.crescimento.positivo {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.crescimento.negativo {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.crescimento.neutro {
  color: #6e6e73;
}

/* Insights */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.insight-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background: #f5f5f7;
}

.insight-item.positivo {
  background: rgba(52, 199, 89, 0.1);
  border-left: 4px solid #34c759;
}

.insight-item.negativo {
  background: rgba(255, 59, 48, 0.1);
  border-left: 4px solid #ff3b30;
}

.insight-item i {
  font-size: 28px;
  color: #1d1d1f;
}

.insight-item strong {
  display: block;
  font-size: 13px;
  color: #6e6e73;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.insight-item p {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.insight-item span {
  font-size: 13px;
  color: #6e6e73;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6e6e73;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .medias-grid,
  .insights-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
  }
}
</style>

