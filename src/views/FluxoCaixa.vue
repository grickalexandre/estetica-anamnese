<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-chart-line"></i> Fluxo de Caixa</h1>
      <button @click="abrirModalMovimentacao" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Nova Movimentação
      </button>
    </div>

    <!-- Filtros de Período -->
    <div class="card filters-card">
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
        </div>
      </div>

      <div class="saldo-periodo">
        <div class="saldo-item entrada">
          <i class="fas fa-arrow-up"></i>
          <div>
            <span class="saldo-label">Entradas</span>
            <span class="saldo-valor">R$ {{ formatarMoeda(totalEntradas) }}</span>
          </div>
        </div>
        <div class="saldo-item saida">
          <i class="fas fa-arrow-down"></i>
          <div>
            <span class="saldo-label">Saídas</span>
            <span class="saldo-valor">R$ {{ formatarMoeda(totalSaidas) }}</span>
          </div>
        </div>
        <div class="saldo-item saldo" :class="saldoPeriodo >= 0 ? 'positivo' : 'negativo'">
          <i :class="saldoPeriodo >= 0 ? 'fas fa-wallet' : 'fas fa-exclamation-triangle'"></i>
          <div>
            <span class="saldo-label">Saldo do Período</span>
            <span class="saldo-valor">R$ {{ formatarMoeda(saldoPeriodo) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Movimentações -->
    <div class="card">
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando movimentações...
      </div>

      <div v-else-if="movimentacoesAgrupadas.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Nenhuma movimentação encontrada neste período</p>
        <button @click="abrirModalMovimentacao" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Adicionar Primeira Movimentação
        </button>
      </div>

      <div v-else class="movimentacoes-list">
        <div v-for="grupo in movimentacoesAgrupadas" :key="grupo.data" class="data-grupo">
          <div class="data-header">
            <h3>{{ grupo.dataFormatada }}</h3>
            <div class="data-saldo">
              <span class="entrada">+R$ {{ formatarMoeda(grupo.totalEntradas) }}</span>
              <span class="saida">-R$ {{ formatarMoeda(grupo.totalSaidas) }}</span>
              <span 
                class="saldo" 
                :class="grupo.saldo >= 0 ? 'positivo' : 'negativo'"
              >
                = R$ {{ formatarMoeda(grupo.saldo) }}
              </span>
            </div>
          </div>

          <div class="movimentacoes-dia">
            <div 
              v-for="mov in grupo.movimentacoes" 
              :key="mov.id"
              :class="['movimentacao-item', mov.tipo]"
            >
              <div class="mov-icon">
                <i :class="mov.tipo === 'entrada' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              </div>
              <div class="mov-info">
                <strong>{{ mov.descricao }}</strong>
                <span class="mov-categoria">{{ formatarCategoria(mov.categoria) }}</span>
              </div>
              <div class="mov-valor">
                R$ {{ formatarMoeda(mov.valor) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nova Movimentação -->
    <div v-if="modalMovimentacao" class="modal-overlay" @click.self="fecharModalMovimentacao">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-plus-circle"></i> Nova Movimentação</h2>
          <button @click="fecharModalMovimentacao" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="salvarMovimentacao">
          <div class="form-group">
            <label>Tipo *</label>
            <div class="tipo-selector">
              <label class="tipo-option entrada" :class="{ active: formulario.tipo === 'entrada' }">
                <input type="radio" v-model="formulario.tipo" value="entrada" required>
                <i class="fas fa-arrow-up"></i>
                <span>Entrada</span>
              </label>
              <label class="tipo-option saida" :class="{ active: formulario.tipo === 'saida' }">
                <input type="radio" v-model="formulario.tipo" value="saida" required>
                <i class="fas fa-arrow-down"></i>
                <span>Saída</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Descrição *</label>
            <input v-model="formulario.descricao" type="text" required placeholder="Ex: Pagamento de cliente">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="formulario.categoria" required>
                <option value="">Selecione...</option>
                <optgroup v-if="formulario.tipo === 'entrada'" label="Receitas">
                  <option value="consultas">Consultas</option>
                  <option value="procedimentos">Procedimentos</option>
                  <option value="produtos">Produtos</option>
                  <option value="pacotes">Pacotes</option>
                  <option value="outros">Outros</option>
                </optgroup>
                <optgroup v-if="formulario.tipo === 'saida'" label="Despesas">
                  <option value="aluguel">Aluguel</option>
                  <option value="salarios">Salários</option>
                  <option value="fornecedores">Fornecedores</option>
                  <option value="impostos">Impostos</option>
                  <option value="energia">Energia</option>
                  <option value="agua">Água</option>
                  <option value="internet">Internet</option>
                  <option value="marketing">Marketing</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="outros">Outros</option>
                </optgroup>
              </select>
            </div>

            <div class="form-group">
              <label>Valor *</label>
              <input v-model.number="formulario.valor" type="number" step="0.01" required placeholder="0,00">
            </div>
          </div>

          <div class="form-group">
            <label>Data *</label>
            <input v-model="formulario.data" type="date" required>
          </div>

          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="formulario.observacoes" rows="3" placeholder="Informações adicionais..."></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="fecharModalMovimentacao" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="salvando">
              <i class="fas fa-save"></i>
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFinanceiro } from '../composables/useFinanceiro.js'

const {
  movimentacoes,
  carregando,
  buscarMovimentacoes,
  registrarMovimentacao
} = useFinanceiro()

const modalMovimentacao = ref(false)
const salvando = ref(false)
const periodoSelecionado = ref('mes')

const hoje = new Date()
const dataInicio = ref(new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0])
const dataFim = ref(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0])

const periodos = [
  { label: 'Hoje', value: 'hoje' },
  { label: 'Esta Semana', value: 'semana' },
  { label: 'Este Mês', value: 'mes' },
  { label: 'Este Ano', value: 'ano' }
]

const formulario = ref({
  tipo: 'entrada',
  descricao: '',
  categoria: '',
  valor: 0,
  data: new Date().toISOString().split('T')[0],
  observacoes: ''
})

onMounted(async () => {
  await carregarMovimentacoes()
})

const carregarMovimentacoes = async () => {
  await buscarMovimentacoes(dataInicio.value, dataFim.value)
}

const selecionarPeriodo = (periodo) => {
  periodoSelecionado.value = periodo
  const hoje = new Date()

  switch (periodo) {
    case 'hoje':
      dataInicio.value = hoje.toISOString().split('T')[0]
      dataFim.value = hoje.toISOString().split('T')[0]
      break
    case 'semana':
      const primeiroDiaSemana = new Date(hoje)
      primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay())
      const ultimoDiaSemana = new Date(primeiroDiaSemana)
      ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6)
      dataInicio.value = primeiroDiaSemana.toISOString().split('T')[0]
      dataFim.value = ultimoDiaSemana.toISOString().split('T')[0]
      break
    case 'mes':
      dataInicio.value = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      dataFim.value = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
      break
    case 'ano':
      dataInicio.value = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0]
      dataFim.value = new Date(hoje.getFullYear(), 11, 31).toISOString().split('T')[0]
      break
  }

  carregarMovimentacoes()
}

const aplicarPeriodoCustom = () => {
  periodoSelecionado.value = 'custom'
  carregarMovimentacoes()
}

const movimentacoesAgrupadas = computed(() => {
  const grupos = {}

  movimentacoes.value.forEach(mov => {
    const data = mov.data?.toDate ? mov.data.toDate() : new Date(mov.data)
    const dataKey = data.toISOString().split('T')[0]

    if (!grupos[dataKey]) {
      grupos[dataKey] = {
        data: dataKey,
        dataFormatada: formatarDataCompleta(data),
        movimentacoes: [],
        totalEntradas: 0,
        totalSaidas: 0,
        saldo: 0
      }
    }

    grupos[dataKey].movimentacoes.push(mov)
    
    if (mov.tipo === 'entrada') {
      grupos[dataKey].totalEntradas += mov.valor || 0
    } else {
      grupos[dataKey].totalSaidas += mov.valor || 0
    }
  })

  // Calcular saldo de cada dia
  Object.values(grupos).forEach(grupo => {
    grupo.saldo = grupo.totalEntradas - grupo.totalSaidas
  })

  // Ordenar por data (mais recente primeiro)
  return Object.values(grupos).sort((a, b) => b.data.localeCompare(a.data))
})

const totalEntradas = computed(() => {
  return movimentacoes.value
    .filter(m => m.tipo === 'entrada')
    .reduce((sum, m) => sum + (m.valor || 0), 0)
})

const totalSaidas = computed(() => {
  return movimentacoes.value
    .filter(m => m.tipo === 'saida')
    .reduce((sum, m) => sum + (m.valor || 0), 0)
})

const saldoPeriodo = computed(() => {
  return totalEntradas.value - totalSaidas.value
})

const abrirModalMovimentacao = () => {
  modalMovimentacao.value = true
  formulario.value = {
    tipo: 'entrada',
    descricao: '',
    categoria: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
  }
}

const fecharModalMovimentacao = () => {
  modalMovimentacao.value = false
}

const salvarMovimentacao = async () => {
  try {
    salvando.value = true

    await registrarMovimentacao({
      tipo: formulario.value.tipo,
      descricao: formulario.value.descricao,
      categoria: formulario.value.categoria,
      valor: formulario.value.valor,
      data: formulario.value.data,
      observacoes: formulario.value.observacoes
    })

    await carregarMovimentacoes()
    
    fecharModalMovimentacao()
    alert('Movimentação registrada com sucesso!')
  } catch (err) {
    console.error('Erro ao salvar:', err)
    alert('Erro ao salvar movimentação. Tente novamente.')
  } finally {
    salvando.value = false
  }
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(valor || 0))
}

const formatarDataCompleta = (data) => {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(data)
}

const formatarCategoria = (categoria) => {
  const categorias = {
    // Receitas
    consultas: 'Consultas',
    procedimentos: 'Procedimentos',
    produtos: 'Produtos',
    pacotes: 'Pacotes',
    // Despesas
    aluguel: 'Aluguel',
    salarios: 'Salários',
    fornecedores: 'Fornecedores',
    impostos: 'Impostos',
    energia: 'Energia',
    agua: 'Água',
    internet: 'Internet',
    marketing: 'Marketing',
    manutencao: 'Manutenção',
    outros: 'Outros'
  }
  return categorias[categoria] || categoria
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Filtros de Período */
.filters-card {
  margin-bottom: 24px;
}

.periodo-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
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

/* Saldo do Período */
.saldo-periodo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #d2d2d7;
}

.saldo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
}

.saldo-item.entrada {
  background: rgba(102, 126, 234, 0.1);
}

.saldo-item.saida {
  background: rgba(255, 107, 107, 0.1);
}

.saldo-item.saldo.positivo {
  background: rgba(52, 199, 89, 0.1);
}

.saldo-item.saldo.negativo {
  background: rgba(255, 59, 48, 0.1);
}

.saldo-item i {
  font-size: 24px;
}

.saldo-item.entrada i {
  color: #667eea;
}

.saldo-item.saida i {
  color: #ff6b6b;
}

.saldo-item.saldo.positivo i {
  color: #34c759;
}

.saldo-item.saldo.negativo i {
  color: #ff3b30;
}

.saldo-item > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.saldo-label {
  font-size: 13px;
  color: #6e6e73;
  font-weight: 500;
}

.saldo-valor {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
}

/* Lista de Movimentações */
.movimentacoes-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.data-grupo {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e5ea;
}

.data-header {
  background: #f5f5f7;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-header h3 {
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 600;
  text-transform: capitalize;
}

.data-saldo {
  display: flex;
  gap: 16px;
  font-size: 14px;
  font-weight: 600;
}

.data-saldo .entrada {
  color: #667eea;
}

.data-saldo .saida {
  color: #ff6b6b;
}

.data-saldo .saldo.positivo {
  color: #34c759;
}

.data-saldo .saldo.negativo {
  color: #ff3b30;
}

.movimentacoes-dia {
  background: white;
}

.movimentacao-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5ea;
  transition: background 0.2s;
}

.movimentacao-item:last-child {
  border-bottom: none;
}

.movimentacao-item:hover {
  background: #f9f9f9;
}

.mov-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.movimentacao-item.entrada .mov-icon {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.movimentacao-item.saida .mov-icon {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}

.mov-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mov-info strong {
  font-size: 15px;
  color: #1d1d1f;
}

.mov-categoria {
  font-size: 13px;
  color: #6e6e73;
}

.mov-valor {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
}

/* Modal */
.tipo-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tipo-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 2px solid #d2d2d7;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tipo-option input[type="radio"] {
  display: none;
}

.tipo-option i {
  font-size: 32px;
}

.tipo-option span {
  font-weight: 600;
  font-size: 15px;
}

.tipo-option.entrada {
  color: #667eea;
}

.tipo-option.saida {
  color: #ff6b6b;
}

.tipo-option.active {
  border-width: 3px;
}

.tipo-option.entrada.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.tipo-option.saida.active {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e5ea;
}

.modal-header h2 {
  font-size: 20px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f5f5f7;
  color: #1d1d1f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e5ea;
}

.modal-content form {
  padding: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e5ea;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6e6e73;
}

.empty-state i {
  font-size: 64px;
  color: #d2d2d7;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 18px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .periodo-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .custom-period {
    margin-left: 0;
  }

  .data-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .data-saldo {
    flex-direction: column;
    gap: 8px;
  }

  .movimentacao-item {
    flex-wrap: wrap;
  }
}
</style>

