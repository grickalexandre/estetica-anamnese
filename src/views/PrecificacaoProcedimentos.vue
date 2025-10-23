<template>
  <div class="precificacao-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <h1><i class="fas fa-calculator"></i> Precificação de Procedimentos</h1>
          <p>Sistema de cálculo de custos e formação de preços para procedimentos estéticos</p>
        </div>
        <div class="header-actions">
          <div class="procedimento-selector">
            <label><i class="fas fa-list"></i> Selecionar Procedimento:</label>
            <select v-model="procedimentoSelecionado" @change="carregarProcedimentoSelecionado" class="procedimento-select">
              <option value="">Escolha um procedimento...</option>
              <option v-for="proc in procedimentosCadastrados" :key="proc.id" :value="proc.id">
                {{ proc.nome }} - {{ proc.categoria }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros e Controles -->
    <div class="filters-section">
      <div class="filters-header">
        <h3><i class="fas fa-filter"></i> Filtros e Busca</h3>
        <div class="filters-actions">
          <button @click="exportarExcel" class="btn-export">
            <i class="fas fa-file-excel"></i>
            Exportar Excel
          </button>
        </div>
      </div>
      <div class="filters-row">
        <div class="filter-group">
          <label><i class="fas fa-search"></i> Buscar procedimento:</label>
          <input 
            v-model="filtroBusca" 
            type="text" 
            placeholder="Digite o nome do procedimento..."
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <label><i class="fas fa-sort"></i> Ordenar por:</label>
          <select v-model="ordenacao" class="filter-select">
            <option value="nome">Nome</option>
            <option value="categoria">Categoria</option>
            <option value="precoSugerido">Preço Sugerido</option>
            <option value="margemLucro">Margem de Lucro</option>
            <option value="lucroFinal">Lucro Final</option>
            <option value="dataCriacao">Data de Criação</option>
          </select>
        </div>
        <div class="filter-group">
          <label><i class="fas fa-chart-line"></i> Status:</label>
          <select v-model="filtroStatus" class="filter-select">
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Formulário de Precificação -->
    <div v-if="procedimentoSelecionado" class="precificacao-form-section">
      <div class="form-header">
        <h3><i class="fas fa-calculator"></i> Precificar Procedimento</h3>
        <div class="form-actions">
          <button @click="limparSelecao" class="btn-clear">
            <i class="fas fa-times"></i>
            Limpar
          </button>
        </div>
      </div>
      
      <div class="form-content">
        <div class="form-row">
          <div class="form-group">
            <label>Procedimento:</label>
            <input v-model="form.nome" type="text" readonly class="form-input readonly">
          </div>
          <div class="form-group">
            <label>Categoria:</label>
            <input v-model="form.categoria" type="text" readonly class="form-input readonly">
          </div>
        </div>

        <div class="form-section">
          <h4><i class="fas fa-coins"></i> Custos Diretos</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>Produto (R$):</label>
              <input v-model.number="form.produto" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Imposto (R$):</label>
              <input v-model.number="form.imposto" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Comissão (R$):</label>
              <input v-model.number="form.comissao" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Descartáveis (R$):</label>
              <input v-model.number="form.descartaveis" type="number" step="0.01" min="0" class="form-input">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4><i class="fas fa-chart-line"></i> Custos Operacionais</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>CAC (R$):</label>
              <input v-model.number="form.cac" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Taxa Máquina (R$):</label>
              <input v-model.number="form.taxaMaquina" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Op. / Hora Clínica (R$):</label>
              <input v-model.number="form.operacaoHora" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Margem Desejada (%):</label>
              <input v-model.number="form.margemDesejada" type="number" step="0.1" min="0" max="100" class="form-input">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4><i class="fas fa-calculator"></i> Cálculos</h4>
          <div class="calculos-grid">
            <div class="calculo-item">
              <label>Custo Total:</label>
              <span class="calculo-valor">R$ {{ formatarMoeda(custoTotal) }}</span>
            </div>
            <div class="calculo-item">
              <label>Preço Sugerido:</label>
              <span class="calculo-valor">R$ {{ formatarMoeda(precoSugerido) }}</span>
            </div>
            <div class="calculo-item">
              <label>Lucro Final:</label>
              <span class="calculo-valor">R$ {{ formatarMoeda(lucroFinal) }}</span>
            </div>
            <div class="calculo-item">
              <label>Margem Real:</label>
              <span class="calculo-valor">{{ margemReal }}%</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4><i class="fas fa-dollar-sign"></i> Preço Final</h4>
          <div class="form-group">
            <label>Preço Cobrado (R$):</label>
            <input v-model.number="form.precoCobrado" type="number" step="0.01" min="0" class="form-input">
          </div>
        </div>

        <div class="form-actions">
          <button @click="salvarPrecificacao" class="btn-primary">
            <i class="fas fa-save"></i>
            Salvar Precificação
          </button>
          <button @click="limparSelecao" class="btn-secondary">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Histórico de Preços -->
    <div v-if="procedimentoSelecionado && historicoPrecos.length > 0" class="historico-section">
      <div class="historico-header">
        <h3><i class="fas fa-history"></i> Histórico de Preços</h3>
        <div class="historico-actions">
          <button @click="exportarHistorico" class="btn-export-small">
            <i class="fas fa-download"></i>
            Exportar
          </button>
        </div>
      </div>
      
      <div class="historico-content">
        <div class="historico-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Preço Atual</span>
              <span class="stat-value">{{ formatarMoeda(precoAtual) }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-trending-up"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Variação</span>
              <span class="stat-value" :class="variacaoClass">{{ variacaoPreco }}%</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-calendar"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Última Atualização</span>
              <span class="stat-value">{{ ultimaAtualizacao }}</span>
            </div>
          </div>
        </div>

        <div class="historico-table">
          <table class="historico-table-content">
            <thead>
              <tr>
                <th>Data</th>
                <th>Preço</th>
                <th>Margem</th>
                <th>Lucro</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in historicoPrecos" :key="item.id" class="historico-row">
                <td>{{ formatarData(item.dataCriacao) }}</td>
                <td class="currency-cell">{{ formatarMoeda(item.precoCobrado) }}</td>
                <td class="margem-cell">
                  <span class="margem-badge" :class="getMargemClass(item.margemLucro)">
                    {{ item.margemLucro }}%
                  </span>
                </td>
                <td class="currency-cell">{{ formatarMoeda(item.lucroFinal) }}</td>
                <td>
                  <span class="status-badge" :class="item.ativo ? 'ativo' : 'inativo'">
                    {{ item.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button @click="restaurarPrecificacao(item)" class="btn-icon" title="Restaurar">
                    <i class="fas fa-undo"></i>
                  </button>
                  <button @click="duplicarPrecificacao(item)" class="btn-icon" title="Duplicar">
                    <i class="fas fa-copy"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tabela de Procedimentos -->
    <div class="table-container">
      <div class="table-header">
        <h3><i class="fas fa-table"></i> Procedimentos Precificados</h3>
        <div class="table-stats">
          <span class="stat-item">
            <i class="fas fa-list"></i>
            {{ procedimentosFiltrados.length }} procedimentos
          </span>
          <span class="stat-item">
            <i class="fas fa-dollar-sign"></i>
            Média: R$ {{ mediaPrecos }}
          </span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="precificacao-table">
          <thead>
            <tr>
              <th>Procedimento</th>
              <th>Produto</th>
              <th>Imposto</th>
              <th>Comissão</th>
              <th>Descartáveis</th>
              <th>CAC</th>
              <th>Taxa Máquina</th>
              <th>Op. / Hora Clínica</th>
              <th>Preço Sugerido</th>
              <th>Preço Cobrado</th>
              <th>Lucro Final</th>
              <th>Margem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="procedimento in procedimentosFiltrados" :key="procedimento.id" class="table-row">
              <td class="procedimento-cell">
                <div class="procedimento-info">
                  <strong>{{ procedimento.nome }}</strong>
                  <small>{{ procedimento.categoria }}</small>
                </div>
              </td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.produto) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.imposto) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.comissao) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.descartaveis) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.cac) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.taxaMaquina) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.operacaoHora) }}</td>
              <td class="currency-cell preco-sugerido">{{ formatarMoeda(procedimento.precoSugerido) }}</td>
              <td class="currency-cell preco-cobrado">{{ formatarMoeda(procedimento.precoCobrado) }}</td>
              <td class="currency-cell lucro-final">{{ formatarMoeda(procedimento.lucroFinal) }}</td>
              <td class="margem-cell">
                <span class="margem-badge" :class="getMargemClass(procedimento.margemLucro)">
                  {{ procedimento.margemLucro }}%
                </span>
              </td>
              <td class="actions-cell">
                <button @click="editarProcedimento(procedimento)" class="btn-icon" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="duplicarProcedimento(procedimento)" class="btn-icon" title="Duplicar">
                  <i class="fas fa-copy"></i>
                </button>
                <button @click="excluirProcedimento(procedimento)" class="btn-icon btn-danger" title="Excluir">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Adicionar/Editar Procedimento -->
    <div v-if="showModal" class="modal-overlay" @click="fecharModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modoEdicao ? 'Editar' : 'Novo' }} Procedimento</h3>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="salvarProcedimento" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nome do Procedimento *</label>
              <input v-model="form.nome" type="text" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Categoria</label>
              <select v-model="form.categoria" class="form-select">
                <option value="Estética Facial">Estética Facial</option>
                <option value="Estética Corporal">Estética Corporal</option>
                <option value="Depilação">Depilação</option>
                <option value="Massagem">Massagem</option>
                <option value="Tratamentos">Tratamentos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <h4>Custos do Procedimento</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Produto (R$)</label>
                <input v-model.number="form.produto" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Imposto (R$)</label>
                <input v-model.number="form.imposto" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Comissão (R$)</label>
                <input v-model.number="form.comissao" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Descartáveis (R$)</label>
                <input v-model.number="form.descartaveis" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>CAC (R$)</label>
                <input v-model.number="form.cac" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Taxa Máquina (R$)</label>
                <input v-model.number="form.taxaMaquina" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Operação / Hora Clínica (R$)</label>
                <input v-model.number="form.operacaoHora" type="number" step="0.01" class="form-input" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>Precificação</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Preço Cobrado (R$)</label>
                <input v-model.number="form.precoCobrado" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Margem de Lucro Desejada (%)</label>
                <input v-model.number="form.margemDesejada" type="number" step="0.01" class="form-input" />
              </div>
            </div>
          </div>

          <!-- Resumo dos Cálculos -->
          <div class="calculos-resumo">
            <h4>Resumo dos Cálculos</h4>
            <div class="calculos-grid">
              <div class="calculo-item">
                <span class="calculo-label">Custo Total:</span>
                <span class="calculo-valor">{{ formatarMoeda(custoTotal) }}</span>
              </div>
              <div class="calculo-item">
                <span class="calculo-label">Preço Sugerido:</span>
                <span class="calculo-valor preco-sugerido">{{ formatarMoeda(precoSugerido) }}</span>
              </div>
              <div class="calculo-item">
                <span class="calculo-label">Lucro Final:</span>
                <span class="calculo-valor lucro-final">{{ formatarMoeda(lucroFinal) }}</span>
              </div>
              <div class="calculo-item">
                <span class="calculo-label">Margem de Lucro:</span>
                <span class="calculo-valor margem-lucro">{{ margemLucro }}%</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              {{ modoEdicao ? 'Atualizar' : 'Salvar' }} Procedimento
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useClinica } from '../composables/useClinica'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, doc } from 'firebase/firestore'

// Funções de notificação
const showSuccess = (message) => {
  // Implementar notificação de sucesso
  console.log('✅', message)
  alert(message)
}

const showWarning = (message) => {
  // Implementar notificação de aviso
  console.log('⚠️', message)
  alert(message)
}

const showError = (message) => {
  // Implementar notificação de erro
  console.log('❌', message)
  alert(message)
}

const { isAuthenticated } = useAuth()
const { clinicaId } = useClinica()

// Estado
const procedimentos = ref([])
const procedimentosCadastrados = ref([])
const procedimentoSelecionado = ref('')
const historicoPrecos = ref([])
const loading = ref(false)
const showModal = ref(false)
const modoEdicao = ref(false)
const filtroBusca = ref('')
const filtroStatus = ref('')
const ordenacao = ref('nome')

// Formulário
const form = ref({
  id: null,
  nome: '',
  categoria: 'Estética Facial',
  produto: 0,
  imposto: 0,
  comissao: 0,
  descartaveis: 0,
  cac: 0,
  taxaMaquina: 0,
  operacaoHora: 0,
  precoCobrado: 0,
  margemDesejada: 50
})

// Computed
const procedimentosFiltrados = computed(() => {
  let filtrados = procedimentos.value

  // Filtro por busca
  if (filtroBusca.value) {
    filtrados = filtrados.filter(p => 
      p.nome.toLowerCase().includes(filtroBusca.value.toLowerCase()) ||
      p.categoria.toLowerCase().includes(filtroBusca.value.toLowerCase())
    )
  }

  // Filtro por status
  if (filtroStatus.value) {
    filtrados = filtrados.filter(p => p.ativo === (filtroStatus.value === 'ativo'))
  }

  // Ordenação
  filtrados.sort((a, b) => {
    switch (ordenacao.value) {
      case 'nome':
        return a.nome.localeCompare(b.nome)
      case 'categoria':
        return a.categoria.localeCompare(b.categoria)
      case 'precoSugerido':
        return b.precoSugerido - a.precoSugerido
      case 'margemLucro':
        return b.margemLucro - a.margemLucro
      case 'lucroFinal':
        return b.lucroFinal - a.lucroFinal
      case 'dataCriacao':
        return new Date(b.dataCriacao) - new Date(a.dataCriacao)
      default:
        return 0
    }
  })

  return filtrados
})

const mediaPrecos = computed(() => {
  if (procedimentosFiltrados.value.length === 0) return '0,00'
  const total = procedimentosFiltrados.value.reduce((sum, p) => sum + (p.precoSugerido || 0), 0)
  const media = total / procedimentosFiltrados.value.length
  return new Intl.NumberFormat('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(media)
})

// Computed para histórico
const precoAtual = computed(() => {
  if (historicoPrecos.value.length === 0) return 0
  const ativo = historicoPrecos.value.find(h => h.ativo)
  return ativo ? ativo.precoCobrado : historicoPrecos.value[0].precoCobrado
})

const variacaoPreco = computed(() => {
  if (historicoPrecos.value.length < 2) return 0
  const atual = precoAtual.value
  const anterior = historicoPrecos.value[1]?.precoCobrado || 0
  if (anterior === 0) return 0
  return ((atual - anterior) / anterior * 100).toFixed(1)
})

const variacaoClass = computed(() => {
  const variacao = parseFloat(variacaoPreco.value)
  if (variacao > 0) return 'variacao-positiva'
  if (variacao < 0) return 'variacao-negativa'
  return 'variacao-neutra'
})

const ultimaAtualizacao = computed(() => {
  if (historicoPrecos.value.length === 0) return 'N/A'
  const ultimo = historicoPrecos.value[0]
  return formatarData(ultimo.dataCriacao)
})

const custoTotal = computed(() => {
  return form.value.produto + 
         form.value.imposto + 
         form.value.comissao + 
         form.value.descartaveis + 
         form.value.cac + 
         form.value.taxaMaquina + 
         form.value.operacaoHora
})

const precoSugerido = computed(() => {
  if (form.value.margemDesejada > 0) {
    return custoTotal.value * (1 + form.value.margemDesejada / 100)
  }
  return custoTotal.value
})

const lucroFinal = computed(() => {
  return form.value.precoCobrado - custoTotal.value
})

const margemLucro = computed(() => {
  if (form.value.precoCobrado > 0) {
    return ((lucroFinal.value / form.value.precoCobrado) * 100).toFixed(1)
  }
  return 0
})

// Métodos
const carregarProcedimentos = async () => {
  try {
    loading.value = true
    if (!clinicaId.value) return

    const q = query(
      collection(db, 'precificacaoProcedimentos'),
      where('clinicaId', '==', clinicaId.value),
      orderBy('nome')
    )

    const querySnapshot = await getDocs(q)
    procedimentos.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erro ao carregar procedimentos:', error)
  } finally {
    loading.value = false
  }
}

const carregarProcedimentosCadastrados = async () => {
  try {
    if (!clinicaId.value) return

    const q = query(
      collection(db, 'catalogo_procedimentos'),
      where('clinicaId', '==', clinicaId.value)
    )

    const querySnapshot = await getDocs(q)
    const procedimentos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Ordenar localmente por nome
    procedimentosCadastrados.value = procedimentos.sort((a, b) => 
      a.nome.localeCompare(b.nome)
    )
  } catch (error) {
    console.error('Erro ao carregar procedimentos cadastrados:', error)
  }
}

const carregarProcedimentoSelecionado = async () => {
  if (!procedimentoSelecionado.value) {
    form.value = {
      id: null,
      nome: '',
      categoria: 'Estética Facial',
      produto: 0,
      imposto: 0,
      comissao: 0,
      descartaveis: 0,
      cac: 0,
      taxaMaquina: 0,
      operacaoHora: 0,
      precoCobrado: 0,
      margemDesejada: 50
    }
    historicoPrecos.value = []
    return
  }

  try {
    const procedimento = procedimentosCadastrados.value.find(p => p.id === procedimentoSelecionado.value)
    if (procedimento) {
      modoEdicao.value = true
      form.value = {
        id: null, // Novo registro de precificação
        nome: procedimento.nome,
        categoria: procedimento.categoria,
        produto: 0,
        imposto: 0,
        comissao: 0,
        descartaveis: 0,
        cac: 0,
        taxaMaquina: 0,
        operacaoHora: 0,
        precoCobrado: 0,
        margemDesejada: 50,
        procedimentoId: procedimento.id // Referência ao procedimento original
      }
      
      // Carregar histórico de preços
      await carregarHistoricoPrecos(procedimento.id)
    }
  } catch (error) {
    console.error('Erro ao carregar procedimento selecionado:', error)
  }
}

const carregarHistoricoPrecos = async (procedimentoId) => {
  try {
    const q = query(
      collection(db, 'precificacaoProcedimentos'),
      where('procedimentoId', '==', procedimentoId),
      where('clinicaId', '==', clinicaId.value),
      orderBy('dataCriacao', 'desc')
    )

    const querySnapshot = await getDocs(q)
    historicoPrecos.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erro ao carregar histórico de preços:', error)
  }
}

const adicionarProcedimento = () => {
  modoEdicao.value = false
  form.value = {
    id: null,
    nome: '',
    categoria: 'Estética Facial',
    produto: 0,
    imposto: 0,
    comissao: 0,
    descartaveis: 0,
    cac: 0,
    taxaMaquina: 0,
    operacaoHora: 0,
    precoCobrado: 0,
    margemDesejada: 50
  }
  showModal.value = true
}

const editarProcedimento = (procedimento) => {
  modoEdicao.value = true
  form.value = { ...procedimento }
  showModal.value = true
}

const duplicarProcedimento = (procedimento) => {
  modoEdicao.value = false
  form.value = { 
    ...procedimento, 
    id: null, 
    nome: `${procedimento.nome} (Cópia)` 
  }
  showModal.value = true
}

const salvarProcedimento = async () => {
  try {
    loading.value = true
    if (!clinicaId.value) return

    const dadosProcedimento = {
      ...form.value,
      clinicaId: clinicaId.value,
      custoTotal: custoTotal.value,
      precoSugerido: precoSugerido.value,
      lucroFinal: lucroFinal.value,
      margemLucro: parseFloat(margemLucro.value),
      atualizadoEm: new Date()
    }

    if (modoEdicao.value) {
      await updateDoc(doc(db, 'precificacaoProcedimentos', form.value.id), dadosProcedimento)
    } else {
      dadosProcedimento.criadoEm = new Date()
      await addDoc(collection(db, 'precificacaoProcedimentos'), dadosProcedimento)
    }

    await carregarProcedimentos()
    fecharModal()
  } catch (error) {
    console.error('Erro ao salvar procedimento:', error)
  } finally {
    loading.value = false
  }
}

const excluirProcedimento = async (procedimento) => {
  if (confirm(`Tem certeza que deseja excluir o procedimento "${procedimento.nome}"?`)) {
    try {
      await deleteDoc(doc(db, 'precificacaoProcedimentos', procedimento.id))
      await carregarProcedimentos()
    } catch (error) {
      console.error('Erro ao excluir procedimento:', error)
    }
  }
}

const fecharModal = () => {
  showModal.value = false
  modoEdicao.value = false
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0)
}

const getMargemClass = (margem) => {
  if (margem >= 50) return 'margem-alta'
  if (margem >= 30) return 'margem-media'
  return 'margem-baixa'
}

const limparSelecao = () => {
  procedimentoSelecionado.value = ''
  form.value = {
    id: null,
    nome: '',
    categoria: 'Estética Facial',
    produto: 0,
    imposto: 0,
    comissao: 0,
    descartaveis: 0,
    cac: 0,
    taxaMaquina: 0,
    operacaoHora: 0,
    precoCobrado: 0,
    margemDesejada: 50
  }
}

const salvarPrecificacao = async () => {
  try {
    console.log('🔍 Iniciando salvamento da precificação...')
    console.log('📋 Dados do formulário:', form.value)
    console.log('🏥 ClinicaId:', clinicaId.value)
    
    if (!form.value.nome || form.value.nome.trim() === '') {
      showWarning('Por favor, selecione um procedimento')
      return
    }

    if (form.value.precoCobrado <= 0) {
      showWarning('Por favor, informe o preço cobrado')
      return
    }

    const dadosParaSalvar = {
      ...form.value,
      clinicaId: clinicaId.value,
      dataCriacao: new Date(),
      ativo: true
    }

    console.log('💾 Dados para salvar:', dadosParaSalvar)

    if (form.value.id) {
      // Editar existente
      console.log('✏️ Editando precificação existente...')
      await updateDoc(doc(db, 'precificacaoProcedimentos', form.value.id), dadosParaSalvar)
      showSuccess('Precificação atualizada com sucesso!')
    } else {
      // Criar novo
      console.log('➕ Criando nova precificação...')
      const docRef = await addDoc(collection(db, 'precificacaoProcedimentos'), dadosParaSalvar)
      console.log('✅ Precificação salva com ID:', docRef.id)
      showSuccess('Precificação salva com sucesso!')
    }

    console.log('🔄 Recarregando procedimentos...')
    await carregarProcedimentos()
    console.log('🧹 Limpando seleção...')
    limparSelecao()
    console.log('✅ Processo concluído!')
  } catch (error) {
    console.error('❌ Erro ao salvar precificação:', error)
    showError('Erro ao salvar precificação: ' + error.message)
  }
}


const formatarData = (data) => {
  if (!data) return 'N/A'
  const date = data.toDate ? data.toDate() : new Date(data)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const restaurarPrecificacao = (item) => {
  form.value = {
    id: item.id,
    nome: item.nome,
    categoria: item.categoria,
    produto: item.produto,
    imposto: item.imposto,
    comissao: item.comissao,
    descartaveis: item.descartaveis,
    cac: item.cac,
    taxaMaquina: item.taxaMaquina,
    operacaoHora: item.operacaoHora,
    precoCobrado: item.precoCobrado,
    margemDesejada: item.margemDesejada,
    procedimentoId: item.procedimentoId
  }
  showSuccess('Precificação restaurada! Você pode editar e salvar.')
}

const duplicarPrecificacao = (item) => {
  form.value = {
    id: null, // Novo registro
    nome: item.nome,
    categoria: item.categoria,
    produto: item.produto,
    imposto: item.imposto,
    comissao: item.comissao,
    descartaveis: item.descartaveis,
    cac: item.cac,
    taxaMaquina: item.taxaMaquina,
    operacaoHora: item.operacaoHora,
    precoCobrado: item.precoCobrado,
    margemDesejada: item.margemDesejada,
    procedimentoId: item.procedimentoId
  }
  showSuccess('Precificação duplicada! Você pode editar e salvar.')
}

const exportarHistorico = () => {
  // Implementar exportação do histórico
  console.log('Exportar histórico de preços')
  showSuccess('Funcionalidade de exportação será implementada em breve!')
}

const exportarExcel = () => {
  // Implementar exportação para Excel
  console.log('Exportar para Excel')
}

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    carregarProcedimentos()
    carregarProcedimentosCadastrados()
  }
})
</script>

<style scoped>
.precificacao-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-title h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
}

.header-title p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.procedimento-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 300px;
}

.procedimento-selector label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.procedimento-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
  cursor: pointer;
}

.procedimento-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.procedimento-select:hover {
  border-color: #9ca3af;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.filters-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters-actions {
  display: flex;
  gap: 12px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #059669;
  transform: translateY(-1px);
}

.precificacao-form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.form-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-input.readonly {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.calculos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.calculo-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.calculo-item label {
  font-weight: 500;
  color: #6b7280;
  font-size: 14px;
}

.calculo-valor {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
}

/* Estilos para Histórico */
.historico-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.historico-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.historico-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.historico-actions {
  display: flex;
  gap: 12px;
}

.btn-export-small {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export-small:hover {
  background: #059669;
  transform: translateY(-1px);
}

.historico-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: #007AFF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
}

.variacao-positiva {
  color: #10b981;
}

.variacao-negativa {
  color: #ef4444;
}

.variacao-neutra {
  color: #6b7280;
}

.historico-table {
  overflow-x: auto;
}

.historico-table-content {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.historico-table-content th {
  background: #f9fafb;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.historico-table-content td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.historico-row:hover {
  background: #f9fafb;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.ativo {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inativo {
  background: #fee2e2;
  color: #991b1b;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.filters-row {
  display: flex;
  gap: 24px;
  align-items: end;
}

.filter-group {
  flex: 1;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  gap: 24px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-item i {
  color: #007AFF;
}

.table-wrapper {
  overflow-x: auto;
}

.precificacao-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.precificacao-table th {
  background: #f9fafb;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.precificacao-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table-row:hover {
  background: #f9fafb;
}

.procedimento-cell {
  min-width: 200px;
}

.procedimento-info strong {
  display: block;
  color: #1d1d1f;
  font-size: 14px;
}

.procedimento-info small {
  color: #6b7280;
  font-size: 12px;
}

.currency-cell {
  text-align: right;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 13px;
  min-width: 100px;
}

.preco-sugerido {
  background: #dcfce7;
  color: #166534;
  font-weight: 600;
}

.preco-cobrado {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
}

.lucro-final {
  background: #fef3c7;
  color: #92400e;
  font-weight: 600;
}

.margem-cell {
  text-align: center;
}

.margem-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.margem-badge.margem-alta {
  background: #dcfce7;
  color: #166534;
}

.margem-badge.margem-media {
  background: #fef3c7;
  color: #92400e;
}

.margem-badge.margem-baixa {
  background: #fee2e2;
  color: #991b1b;
}

.actions-cell {
  text-align: center;
  white-space: nowrap;
}

.btn-icon {
  background: none;
  border: none;
  padding: 8px;
  margin: 0 2px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.btn-close {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-form {
  padding: 24px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-section {
  margin-bottom: 32px;
}

.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.calculos-resumo {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.calculos-resumo h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.calculos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.calculo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.calculo-label {
  font-weight: 500;
  color: #374151;
}

.calculo-valor {
  font-weight: 600;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.calculo-valor.preco-sugerido {
  color: #166534;
}

.calculo-valor.lucro-final {
  color: #92400e;
}

.calculo-valor.margem-lucro {
  color: #1e40af;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #007AFF;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    margin-top: 16px;
  }
  
  .procedimento-selector {
    min-width: auto;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .calculos-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
