<template>
  <div class="fluxo-caixa-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <h1><i class="fas fa-chart-line"></i> Fluxo de Caixa</h1>
          <p>Controle de entradas e saídas financeiras da clínica</p>
        </div>
        <div class="header-actions">
          <button @click="adicionarMovimentacao" class="btn-primary">
            <i class="fas fa-plus"></i>
            Nova Movimentação
          </button>
          <button @click="exportarRelatorio" class="btn-export">
            <i class="fas fa-file-excel"></i>
            Exportar
          </button>
        </div>
      </div>
    </div>

    <!-- Resumo Financeiro -->
    <div class="resumo-financeiro">
      <div class="resumo-cards">
        <div class="resumo-card entrada">
          <div class="card-icon">
            <i class="fas fa-arrow-up"></i>
          </div>
          <div class="card-content">
            <h3>Entradas</h3>
            <span class="card-value">{{ formatarMoeda(totalEntradas) }}</span>
            <p class="card-periodo">Este mês</p>
          </div>
        </div>
        
        <div class="resumo-card saida">
          <div class="card-icon">
            <i class="fas fa-arrow-down"></i>
          </div>
          <div class="card-content">
            <h3>Saídas</h3>
            <span class="card-value">{{ formatarMoeda(totalSaidas) }}</span>
            <p class="card-periodo">Este mês</p>
          </div>
        </div>
        
        <div class="resumo-card saldo" :class="saldoAtual >= 0 ? 'positivo' : 'negativo'">
          <div class="card-icon">
            <i class="fas fa-balance-scale"></i>
          </div>
          <div class="card-content">
            <h3>Saldo Atual</h3>
            <span class="card-value">{{ formatarMoeda(saldoAtual) }}</span>
            <p class="card-periodo">Disponível</p>
          </div>
        </div>
        
        <div class="resumo-card projecao">
          <div class="card-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="card-content">
            <h3>Projeção</h3>
            <span class="card-value">{{ formatarMoeda(projecaoMes) }}</span>
            <p class="card-periodo">Fim do mês</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters-header">
        <h3><i class="fas fa-filter"></i> Filtros</h3>
      </div>
      <div class="filters-row">
        <div class="filter-group">
          <label>Período:</label>
          <select v-model="filtroPeriodo" @change="aplicarFiltros" class="filter-select">
            <option value="hoje">Hoje</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
            <option value="trimestre">Este Trimestre</option>
            <option value="ano">Este Ano</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Tipo:</label>
          <select v-model="filtroTipo" @change="aplicarFiltros" class="filter-select">
            <option value="">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Categoria:</label>
          <select v-model="filtroCategoria" @change="aplicarFiltros" class="filter-select">
            <option value="">Todas</option>
            <option value="procedimentos">Procedimentos</option>
            <option value="produtos">Produtos</option>
            <option value="despesas">Despesas</option>
            <option value="investimentos">Investimentos</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Buscar:</label>
          <input v-model="filtroBusca" @input="aplicarFiltros" type="text" placeholder="Descrição..." class="filter-input">
        </div>
      </div>
    </div>

    <!-- Gráfico de Fluxo -->
    <div class="grafico-section">
      <div class="grafico-header">
        <h3><i class="fas fa-chart-area"></i> Evolução do Fluxo de Caixa</h3>
        <div class="grafico-actions">
          <button @click="alternarVisualizacao" class="btn-toggle">
            <i :class="visualizacaoGrafico === 'linha' ? 'fas fa-chart-bar' : 'fas fa-chart-line'"></i>
            {{ visualizacaoGrafico === 'linha' ? 'Barras' : 'Linha' }}
          </button>
        </div>
      </div>
      <div class="grafico-content">
        <canvas ref="graficoCanvas" width="800" height="300"></canvas>
      </div>
    </div>

    <!-- Tabela de Movimentações -->
    <div class="table-container">
      <div class="table-header">
        <h3><i class="fas fa-list"></i> Movimentações</h3>
        <div class="table-stats">
          <span class="stat-item">
            <i class="fas fa-list"></i>
            {{ movimentacoesFiltradas.length }} movimentações
          </span>
        </div>
      </div>
      
      <div class="table-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Saldo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movimentacao in movimentacoesFiltradas" :key="movimentacao.id" class="table-row">
              <td>{{ formatarData(movimentacao.data) }}</td>
              <td>{{ movimentacao.descricao }}</td>
              <td>
                <span class="categoria-badge" :class="movimentacao.categoria">
                  {{ getCategoriaLabel(movimentacao.categoria) }}
                </span>
              </td>
              <td>
                <span class="tipo-badge" :class="movimentacao.tipo">
                  <i :class="movimentacao.tipo === 'entrada' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída' }}
                </span>
              </td>
              <td class="currency-cell" :class="movimentacao.tipo">
                {{ movimentacao.tipo === 'entrada' ? '+' : '-' }}{{ formatarMoeda(movimentacao.valor) }}
              </td>
              <td class="currency-cell">{{ formatarMoeda(movimentacao.saldoAcumulado) }}</td>
              <td class="actions-cell">
                <button @click="editarMovimentacao(movimentacao)" class="btn-icon" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="excluirMovimentacao(movimentacao)" class="btn-icon btn-danger" title="Excluir">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Movimentação -->
    <div v-if="showModal" class="modal-overlay" @click="fecharModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modoEdicao ? 'Editar' : 'Nova' }} Movimentação</h3>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="salvarMovimentacao" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Data *</label>
              <input v-model="form.data" type="date" required class="form-input">
            </div>
            <div class="form-group">
              <label>Tipo *</label>
              <select v-model="form.tipo" required class="form-select">
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor (R$) *</label>
              <input v-model.number="form.valor" type="number" step="0.01" min="0" required class="form-input">
            </div>
            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="form.categoria" required class="form-select">
                <option value="procedimentos">Procedimentos</option>
                <option value="produtos">Produtos</option>
                <option value="despesas">Despesas</option>
                <option value="investimentos">Investimentos</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Descrição *</label>
            <textarea v-model="form.descricao" required class="form-textarea" rows="3" placeholder="Descreva a movimentação..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="fecharModal" class="btn-secondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              <i class="fas fa-save"></i>
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useClinica } from '../composables/useClinica'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, doc } from 'firebase/firestore'

const { isAuthenticated } = useAuth()
const { clinicaId } = useClinica()

// Estado
const movimentacoes = ref([])
const loading = ref(false)
const showModal = ref(false)
const modoEdicao = ref(false)
const filtroPeriodo = ref('mes')
const filtroTipo = ref('')
const filtroCategoria = ref('')
const filtroBusca = ref('')
const visualizacaoGrafico = ref('linha')
const graficoCanvas = ref(null)

// Formulário
const form = ref({
  id: null,
  data: new Date().toISOString().split('T')[0],
  tipo: 'entrada',
  valor: 0,
  categoria: 'procedimentos',
  descricao: ''
})

// Computed
const movimentacoesFiltradas = computed(() => {
  let filtradas = movimentacoes.value

  // Filtro por período
  if (filtroPeriodo.value !== 'personalizado') {
    const agora = new Date()
    const inicio = new Date()
    
    switch (filtroPeriodo.value) {
      case 'hoje':
        inicio.setHours(0, 0, 0, 0)
        break
      case 'semana':
        inicio.setDate(agora.getDate() - 7)
        break
      case 'mes':
        inicio.setMonth(agora.getMonth() - 1)
        break
      case 'trimestre':
        inicio.setMonth(agora.getMonth() - 3)
        break
      case 'ano':
        inicio.setFullYear(agora.getFullYear() - 1)
        break
    }
    
    filtradas = filtradas.filter(m => {
      const dataMov = new Date(m.data)
      return dataMov >= inicio
    })
  }

  // Filtro por tipo
  if (filtroTipo.value) {
    filtradas = filtradas.filter(m => m.tipo === filtroTipo.value)
  }

  // Filtro por categoria
  if (filtroCategoria.value) {
    filtradas = filtradas.filter(m => m.categoria === filtroCategoria.value)
  }

  // Filtro por busca
  if (filtroBusca.value) {
    filtradas = filtradas.filter(m => 
      m.descricao.toLowerCase().includes(filtroBusca.value.toLowerCase())
    )
  }

  return filtradas.sort((a, b) => new Date(b.data) - new Date(a.data))
})

const totalEntradas = computed(() => {
  return movimentacoesFiltradas.value
    .filter(m => m.tipo === 'entrada')
    .reduce((sum, m) => sum + m.valor, 0)
})

const totalSaidas = computed(() => {
  return movimentacoesFiltradas.value
    .filter(m => m.tipo === 'saida')
    .reduce((sum, m) => sum + m.valor, 0)
})

const saldoAtual = computed(() => {
  return totalEntradas.value - totalSaidas.value
})

const projecaoMes = computed(() => {
  const hoje = new Date()
  const diasRestantes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate() - hoje.getDate()
  const mediaDiaria = saldoAtual.value / (hoje.getDate())
  return saldoAtual.value + (mediaDiaria * diasRestantes)
})

// Métodos
const carregarMovimentacoes = async () => {
  try {
    loading.value = true
    if (!clinicaId.value) return

    const q = query(
      collection(db, 'fluxoCaixa'),
      where('clinicaId', '==', clinicaId.value),
      orderBy('data', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const movimentacoesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Calcular saldo acumulado
    let saldoAcumulado = 0
    movimentacoes.value = movimentacoesData.map(mov => {
      saldoAcumulado += mov.tipo === 'entrada' ? mov.valor : -mov.valor
      return {
        ...mov,
        saldoAcumulado
      }
    }).reverse() // Ordenar por data crescente para cálculo correto
    
    await nextTick()
    renderizarGrafico()
  } catch (error) {
    console.error('Erro ao carregar movimentações:', error)
  } finally {
    loading.value = false
  }
}

const adicionarMovimentacao = () => {
  modoEdicao.value = false
  form.value = {
    id: null,
    data: new Date().toISOString().split('T')[0],
    tipo: 'entrada',
    valor: 0,
    categoria: 'procedimentos',
    descricao: ''
  }
  showModal.value = true
}

const editarMovimentacao = (movimentacao) => {
  modoEdicao.value = true
  form.value = {
    id: movimentacao.id,
    data: movimentacao.data,
    tipo: movimentacao.tipo,
    valor: movimentacao.valor,
    categoria: movimentacao.categoria,
    descricao: movimentacao.descricao
  }
  showModal.value = true
}

const salvarMovimentacao = async () => {
  try {
    loading.value = true
    
    const dadosParaSalvar = {
      ...form.value,
      clinicaId: clinicaId.value,
      dataCriacao: new Date(),
      ativo: true
    }

    if (form.value.id) {
      await updateDoc(doc(db, 'fluxoCaixa', form.value.id), dadosParaSalvar)
      showSuccess('Movimentação atualizada com sucesso!')
    } else {
      await addDoc(collection(db, 'fluxoCaixa'), dadosParaSalvar)
      showSuccess('Movimentação salva com sucesso!')
    }

    await carregarMovimentacoes()
    fecharModal()
  } catch (error) {
    console.error('Erro ao salvar movimentação:', error)
    showError('Erro ao salvar movimentação: ' + error.message)
  } finally {
    loading.value = false
  }
}

const excluirMovimentacao = async (movimentacao) => {
  if (confirm(`Tem certeza que deseja excluir esta movimentação?`)) {
    try {
      await deleteDoc(doc(db, 'fluxoCaixa', movimentacao.id))
      showSuccess('Movimentação excluída com sucesso!')
      await carregarMovimentacoes()
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error)
      showError('Erro ao excluir movimentação: ' + error.message)
    }
  }
}

const fecharModal = () => {
  showModal.value = false
  modoEdicao.value = false
}

const aplicarFiltros = () => {
  // Os filtros são aplicados automaticamente via computed
}

const alternarVisualizacao = () => {
  visualizacaoGrafico.value = visualizacaoGrafico.value === 'linha' ? 'barra' : 'linha'
  renderizarGrafico()
}

const renderizarGrafico = () => {
  if (!graficoCanvas.value) return
  
  const canvas = graficoCanvas.value
  const ctx = canvas.getContext('2d')
  
  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Dados para o gráfico (últimos 30 dias)
  const dados = movimentacoesFiltradas.value.slice(-30)
  if (dados.length === 0) return
  
  // Configurações do gráfico
  const padding = 40
  const width = canvas.width - (padding * 2)
  const height = canvas.height - (padding * 2)
  
  // Encontrar valores mínimos e máximos
  const valores = dados.map(d => d.saldoAcumulado)
  const minValor = Math.min(...valores)
  const maxValor = Math.max(...valores)
  const range = maxValor - minValor
  
  // Desenhar eixos
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  
  // Eixo Y
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height + padding)
  ctx.stroke()
  
  // Eixo X
  ctx.beginPath()
  ctx.moveTo(padding, height + padding)
  ctx.lineTo(width + padding, height + padding)
  ctx.stroke()
  
  // Desenhar linha do saldo
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  dados.forEach((dado, index) => {
    const x = padding + (index / (dados.length - 1)) * width
    const y = padding + height - ((dado.saldoAcumulado - minValor) / range) * height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // Desenhar pontos
  ctx.fillStyle = '#3b82f6'
  dados.forEach((dado, index) => {
    const x = padding + (index / (dados.length - 1)) * width
    const y = padding + height - ((dado.saldoAcumulado - minValor) / range) * height
    
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()
  })
}

const exportarRelatorio = () => {
  showSuccess('Funcionalidade de exportação será implementada em breve!')
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

const formatarData = (data) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
}

const getCategoriaLabel = (categoria) => {
  const labels = {
    procedimentos: 'Procedimentos',
    produtos: 'Produtos',
    despesas: 'Despesas',
    investimentos: 'Investimentos'
  }
  return labels[categoria] || categoria
}

const showSuccess = (message) => {
  console.log('✅', message)
  alert(message)
}

const showError = (message) => {
  console.log('❌', message)
  alert(message)
}

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    carregarMovimentacoes()
  }
})
</script>

<style scoped>
.fluxo-caixa-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #059669;
  transform: translateY(-1px);
}

.resumo-financeiro {
  margin-bottom: 24px;
}

.resumo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.resumo-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
}

.resumo-card.entrada {
  border-left: 4px solid #10b981;
}

.resumo-card.saida {
  border-left: 4px solid #ef4444;
}

.resumo-card.saldo.positivo {
  border-left: 4px solid #10b981;
}

.resumo-card.saldo.negativo {
  border-left: 4px solid #ef4444;
}

.resumo-card.projecao {
  border-left: 4px solid #3b82f6;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.entrada .card-icon {
  background: #10b981;
}

.saida .card-icon {
  background: #ef4444;
}

.saldo .card-icon {
  background: #6b7280;
}

.projecao .card-icon {
  background: #3b82f6;
}

.card-content h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  display: block;
  margin-bottom: 4px;
}

.card-periodo {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.filters-header h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.grafico-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.grafico-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.grafico-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle:hover {
  background: #e5e7eb;
}

.grafico-content {
  width: 100%;
  height: 300px;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.table-content {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f9fafb;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.table-row:hover {
  background: #f9fafb;
}

.categoria-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.categoria-badge.procedimentos {
  background: #dbeafe;
  color: #1e40af;
}

.categoria-badge.produtos {
  background: #dcfce7;
  color: #166534;
}

.categoria-badge.despesas {
  background: #fee2e2;
  color: #991b1b;
}

.categoria-badge.investimentos {
  background: #fef3c7;
  color: #92400e;
}

.tipo-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tipo-badge.entrada {
  background: #dcfce7;
  color: #166534;
}

.tipo-badge.saida {
  background: #fee2e2;
  color: #991b1b;
}

.currency-cell {
  font-weight: 600;
  text-align: right;
}

.currency-cell.entrada {
  color: #10b981;
}

.currency-cell.saida {
  color: #ef4444;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f3f4f6;
  color: #6b7280;
}

.btn-icon:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
}

.modal-form {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .resumo-cards {
    grid-template-columns: 1fr;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>