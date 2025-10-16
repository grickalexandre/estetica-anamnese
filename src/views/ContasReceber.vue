<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-file-invoice-dollar"></i> Contas a Receber</h1>
      <button @click="abrirModalNova" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Nova Receita
      </button>
    </div>

    <!-- Filtros -->
    <div class="card filters-card">
      <div class="filters">
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="filtros.status" @change="aplicarFiltros">
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="recebido">Recebido</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Categoria:</label>
          <select v-model="filtros.categoria" @change="aplicarFiltros">
            <option value="">Todas</option>
            <option value="consultas">Consultas</option>
            <option value="procedimentos">Procedimentos</option>
            <option value="produtos">Produtos</option>
            <option value="pacotes">Pacotes</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Período:</label>
          <input type="date" v-model="filtros.dataInicio" @change="aplicarFiltros">
          <span>até</span>
          <input type="date" v-model="filtros.dataFim" @change="aplicarFiltros">
        </div>
      </div>

      <div class="totais-filtrados">
        <div class="total-item pendente">
          <strong>A Receber:</strong>
          <span>R$ {{ formatarMoeda(totalPendente) }}</span>
        </div>
        <div class="total-item recebido">
          <strong>Recebido:</strong>
          <span>R$ {{ formatarMoeda(totalRecebido) }}</span>
        </div>
      </div>
    </div>

    <!-- Lista de Contas -->
    <div class="card">
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando contas...
      </div>

      <div v-else-if="contasFiltradas.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Nenhuma conta a receber encontrada</p>
        <button @click="abrirModalNova" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Adicionar Primeira Receita
        </button>
      </div>

      <div v-else class="contas-table">
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="conta in contasFiltradas" :key="conta.id" :class="'status-' + conta.status">
              <td>
                <strong>{{ conta.descricao }}</strong>
                <small v-if="conta.cliente">{{ conta.cliente }}</small>
              </td>
              <td>
                <span class="badge" :class="'badge-' + conta.categoria">
                  {{ formatarCategoria(conta.categoria) }}
                </span>
              </td>
              <td>
                <span :class="{'vencido': isVencido(conta.dataVencimento) && conta.status === 'pendente'}">
                  {{ formatarData(conta.dataVencimento) }}
                </span>
              </td>
              <td class="valor">
                R$ {{ formatarMoeda(conta.valor) }}
              </td>
              <td>
                <span class="status-badge" :class="'status-' + conta.status">
                  {{ formatarStatus(conta.status) }}
                </span>
              </td>
              <td class="acoes">
                <button 
                  v-if="conta.status === 'pendente'" 
                  @click="abrirModalBaixa(conta)" 
                  class="btn-icon btn-success"
                  title="Dar baixa"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button 
                  @click="editarConta(conta)" 
                  class="btn-icon btn-edit"
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="excluirConta(conta)" 
                  class="btn-icon btn-delete"
                  title="Excluir"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nova Conta -->
    <div v-if="modalNova" class="modal-overlay" @click.self="fecharModalNova">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-plus-circle"></i> {{ contaEditando ? 'Editar' : 'Nova' }} Receita</h2>
          <button @click="fecharModalNova" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="salvarConta">
          <div class="form-group">
            <label>Descrição *</label>
            <input v-model="formulario.descricao" type="text" required placeholder="Ex: Procedimento facial">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="formulario.categoria" required>
                <option value="">Selecione...</option>
                <option value="consultas">Consultas</option>
                <option value="procedimentos">Procedimentos</option>
                <option value="produtos">Produtos</option>
                <option value="pacotes">Pacotes</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div class="form-group">
              <label>Cliente</label>
              <input v-model="formulario.cliente" type="text" placeholder="Nome do cliente">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor *</label>
              <input v-model.number="formulario.valor" type="number" step="0.01" required placeholder="0,00">
            </div>

            <div class="form-group">
              <label>Data de Vencimento *</label>
              <input v-model="formulario.dataVencimento" type="date" required>
            </div>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="formulario.jaFoiRecebido">
              Esta conta já foi recebida
            </label>
          </div>

          <div v-if="formulario.jaFoiRecebido" class="form-row">
            <div class="form-group">
              <label>Data do Recebimento</label>
              <input v-model="formulario.dataRecebimento" type="date">
            </div>

            <div class="form-group">
              <label>Valor Recebido</label>
              <input v-model.number="formulario.valorRecebido" type="number" step="0.01" placeholder="Se diferente do valor original">
            </div>
          </div>

          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="formulario.observacoes" rows="3" placeholder="Informações adicionais..."></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="fecharModalNova" class="btn btn-secondary">
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

    <!-- Modal Baixa -->
    <div v-if="modalBaixa" class="modal-overlay" @click.self="fecharModalBaixa">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2><i class="fas fa-check-circle"></i> Dar Baixa em Conta</h2>
          <button @click="fecharModalBaixa" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="confirmarBaixa">
          <div class="info-conta">
            <p><strong>{{ contaSelecionada?.descricao }}</strong></p>
            <p class="valor-destaque">R$ {{ formatarMoeda(contaSelecionada?.valor) }}</p>
          </div>

          <div class="form-group">
            <label>Data do Recebimento *</label>
            <input v-model="formularioBaixa.dataRecebimento" type="date" required>
          </div>

          <div class="form-group">
            <label>Valor Recebido</label>
            <input 
              v-model.number="formularioBaixa.valorRecebido" 
              type="number" 
              step="0.01" 
              :placeholder="'Padrão: ' + formatarMoeda(contaSelecionada?.valor)"
            >
            <small>Deixe em branco se o valor recebido foi igual ao valor da conta</small>
          </div>

          <div class="modal-actions">
            <button type="button" @click="fecharModalBaixa" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-success" :disabled="salvando">
              <i class="fas fa-check"></i>
              {{ salvando ? 'Processando...' : 'Confirmar Recebimento' }}
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
  contasReceber,
  carregando,
  buscarContasReceber,
  adicionarContaReceber,
  baixarContaReceber,
  excluirContaReceber
} = useFinanceiro()

const modalNova = ref(false)
const modalBaixa = ref(false)
const salvando = ref(false)
const contaEditando = ref(null)
const contaSelecionada = ref(null)

const filtros = ref({
  status: '',
  categoria: '',
  dataInicio: '',
  dataFim: ''
})

const formulario = ref({
  descricao: '',
  categoria: '',
  cliente: '',
  valor: 0,
  dataVencimento: '',
  observacoes: '',
  jaFoiRecebido: false,
  dataRecebimento: '',
  valorRecebido: null
})

const formularioBaixa = ref({
  dataRecebimento: new Date().toISOString().split('T')[0],
  valorRecebido: null
})

onMounted(async () => {
  await buscarContasReceber()
})

const contasFiltradas = computed(() => {
  let contas = [...contasReceber.value]

  if (filtros.value.status) {
    contas = contas.filter(c => c.status === filtros.value.status)
  }

  if (filtros.value.categoria) {
    contas = contas.filter(c => c.categoria === filtros.value.categoria)
  }

  // Ordenar por data de vencimento
  contas.sort((a, b) => {
    const dataA = a.dataVencimento?.toDate ? a.dataVencimento.toDate() : new Date(a.dataVencimento)
    const dataB = b.dataVencimento?.toDate ? b.dataVencimento.toDate() : new Date(b.dataVencimento)
    return dataA - dataB
  })

  return contas
})

const totalPendente = computed(() => {
  return contasFiltradas.value
    .filter(c => c.status === 'pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0)
})

const totalRecebido = computed(() => {
  return contasFiltradas.value
    .filter(c => c.status === 'recebido')
    .reduce((sum, c) => sum + (c.valorRecebido || c.valor || 0), 0)
})

const abrirModalNova = () => {
  modalNova.value = true
  contaEditando.value = null
  formulario.value = {
    descricao: '',
    categoria: '',
    cliente: '',
    valor: 0,
    dataVencimento: '',
    observacoes: '',
    jaFoiRecebido: false,
    dataRecebimento: '',
    valorRecebido: null
  }
}

const fecharModalNova = () => {
  modalNova.value = false
  contaEditando.value = null
}

const abrirModalBaixa = (conta) => {
  contaSelecionada.value = conta
  modalBaixa.value = true
  formularioBaixa.value = {
    dataRecebimento: new Date().toISOString().split('T')[0],
    valorRecebido: null
  }
}

const fecharModalBaixa = () => {
  modalBaixa.value = false
  contaSelecionada.value = null
}

const salvarConta = async () => {
  try {
    salvando.value = true

    const dados = {
      descricao: formulario.value.descricao,
      categoria: formulario.value.categoria,
      cliente: formulario.value.cliente,
      valor: formulario.value.valor,
      dataVencimento: formulario.value.dataVencimento,
      observacoes: formulario.value.observacoes,
      status: formulario.value.jaFoiRecebido ? 'recebido' : 'pendente',
      dataRecebimento: formulario.value.jaFoiRecebido ? formulario.value.dataRecebimento : null,
      valorRecebido: formulario.value.jaFoiRecebido ? formulario.value.valorRecebido : null
    }

    await adicionarContaReceber(dados)
    await buscarContasReceber()
    
    fecharModalNova()
    alert('Receita adicionada com sucesso!')
  } catch (err) {
    console.error('Erro ao salvar:', err)
    alert('Erro ao salvar receita. Tente novamente.')
  } finally {
    salvando.value = false
  }
}

const confirmarBaixa = async () => {
  try {
    salvando.value = true

    await baixarContaReceber(
      contaSelecionada.value.id,
      formularioBaixa.value.dataRecebimento,
      formularioBaixa.value.valorRecebido
    )

    await buscarContasReceber()
    
    fecharModalBaixa()
    alert('Recebimento confirmado com sucesso!')
  } catch (err) {
    console.error('Erro ao dar baixa:', err)
    alert('Erro ao confirmar recebimento. Tente novamente.')
  } finally {
    salvando.value = false
  }
}

const editarConta = (conta) => {
  // TODO: Implementar edição
  alert('Funcionalidade de edição será implementada em breve!')
}

const excluirConta = async (conta) => {
  if (!confirm(`Deseja realmente excluir a conta "${conta.descricao}"?`)) {
    return
  }

  try {
    await excluirContaReceber(conta.id)
    await buscarContasReceber()
    alert('Conta excluída com sucesso!')
  } catch (err) {
    console.error('Erro ao excluir:', err)
    alert('Erro ao excluir conta. Tente novamente.')
  }
}

const aplicarFiltros = async () => {
  await buscarContasReceber(filtros.value)
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor || 0)
}

const formatarData = (data) => {
  if (!data) return ''
  const date = data.toDate ? data.toDate() : new Date(data)
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

const formatarCategoria = (categoria) => {
  const categorias = {
    consultas: 'Consultas',
    procedimentos: 'Procedimentos',
    produtos: 'Produtos',
    pacotes: 'Pacotes',
    outros: 'Outros'
  }
  return categorias[categoria] || categoria
}

const formatarStatus = (status) => {
  const statusMap = {
    pendente: 'Pendente',
    recebido: 'Recebido',
    vencido: 'Vencido'
  }
  return statusMap[status] || status
}

const isVencido = (dataVencimento) => {
  if (!dataVencimento) return false
  const vencimento = dataVencimento.toDate ? dataVencimento.toDate() : new Date(dataVencimento)
  return vencimento < new Date()
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

/* Filtros */
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
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.filter-group select,
.filter-group input {
  padding: 10px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
}

.filter-group span {
  font-size: 13px;
  color: #6e6e73;
  align-self: center;
}

.totais-filtrados {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #d2d2d7;
}

.total-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.total-item strong {
  color: #6e6e73;
}

.total-item.pendente span {
  color: #667eea;
  font-weight: 700;
}

.total-item.recebido span {
  color: #34c759;
  font-weight: 700;
}

/* Tabela */
.contas-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  text-align: left;
  padding: 12px;
  background: #f5f5f7;
  color: #1d1d1f;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

tbody td {
  padding: 16px 12px;
  border-bottom: 1px solid #e5e5ea;
}

tbody tr:hover {
  background: #f9f9f9;
}

tbody tr.status-recebido {
  opacity: 0.7;
}

tbody td small {
  display: block;
  font-size: 12px;
  color: #6e6e73;
  margin-top: 4px;
}

.valor {
  font-weight: 700;
  color: #1d1d1f;
}

.vencido {
  color: #ff3b30;
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #e5e5ea;
  color: #1d1d1f;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.status-pendente {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.status-badge.status-recebido {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.acoes {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon.btn-success {
  background: #34c759;
  color: white;
}

.btn-icon.btn-edit {
  background: #007aff;
  color: white;
}

.btn-icon.btn-delete {
  background: #ff3b30;
  color: white;
}

.btn-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content.modal-small {
  max-width: 450px;
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

.info-conta {
  background: #f5f5f7;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.info-conta p {
  margin: 4px 0;
}

.valor-destaque {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
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

  .filters {
    grid-template-columns: 1fr;
  }

  .contas-table {
    overflow-x: scroll;
  }

  table {
    min-width: 800px;
  }
}
</style>

