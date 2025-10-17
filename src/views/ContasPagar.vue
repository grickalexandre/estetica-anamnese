<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-file-invoice"></i> Contas a Pagar</h1>
      <button @click="abrirModalNova" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Nova Despesa
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
            <option value="pago">Pago</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Categoria:</label>
          <select v-model="filtros.categoria" @change="aplicarFiltros">
            <option value="">Todas</option>
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
          <strong>Pendente:</strong>
          <span>R$ {{ formatarMoeda(totalPendente) }}</span>
        </div>
        <div class="total-item pago">
          <strong>Pago:</strong>
          <span>R$ {{ formatarMoeda(totalPago) }}</span>
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
        <p>Nenhuma conta a pagar encontrada</p>
        <button @click="abrirModalNova" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Adicionar Primeira Despesa
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
                <small v-if="conta.fornecedor">{{ conta.fornecedor }}</small>
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
          <h2><i class="fas fa-plus-circle"></i> {{ contaEditando ? 'Editar' : 'Nova' }} Despesa</h2>
          <button @click="fecharModalNova" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="salvarConta">
          <div class="form-group">
            <label>Descrição *</label>
            <input v-model="formulario.descricao" type="text" required placeholder="Ex: Aluguel do mês">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="formulario.categoria" required>
                <option value="">Selecione...</option>
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
              </select>
            </div>

            <div class="form-group">
              <label>Fornecedor</label>
              <div class="input-group">
                <select v-model="formulario.fornecedorId" @change="selecionarFornecedor" class="select-vinculo">
                  <option value="">📝 Digitar manualmente</option>
                  <option value="novo">➕ Cadastrar novo fornecedor</option>
                  <optgroup label="Fornecedores Cadastrados">
                    <option v-for="forn in fornecedores" :key="forn.id" :value="forn.id">
                      {{ forn.nome }} - {{ forn.categoria }}
                    </option>
                  </optgroup>
                </select>
              </div>
              <input 
                v-if="!formulario.fornecedorId || formulario.fornecedorId === ''" 
                v-model="formulario.fornecedor" 
                type="text" 
                placeholder="Digite o nome do fornecedor"
                class="input-manual"
              >
              <small v-if="fornecedorSelecionado" class="fornecedor-info">
                <i class="fas fa-info-circle"></i>
                {{ fornecedorSelecionado.telefone }} | {{ fornecedorSelecionado.email || 'Sem email' }}
              </small>
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
              <input type="checkbox" v-model="formulario.jaFoiPago">
              Esta conta já foi paga
            </label>
          </div>

          <div v-if="formulario.jaFoiPago" class="form-row">
            <div class="form-group">
              <label>Data do Pagamento</label>
              <input v-model="formulario.dataPagamento" type="date">
            </div>

            <div class="form-group">
              <label>Valor Pago</label>
              <input v-model.number="formulario.valorPago" type="number" step="0.01" placeholder="Se diferente do valor original">
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
            <label>Data do Pagamento *</label>
            <input v-model="formularioBaixa.dataPagamento" type="date" required>
          </div>

          <div class="form-group">
            <label>Valor Pago</label>
            <input 
              v-model.number="formularioBaixa.valorPago" 
              type="number" 
              step="0.01" 
              :placeholder="'Padrão: ' + formatarMoeda(contaSelecionada?.valor)"
            >
            <small>Deixe em branco se o valor pago foi igual ao valor da conta</small>
          </div>

          <div class="modal-actions">
            <button type="button" @click="fecharModalBaixa" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-success" :disabled="salvando">
              <i class="fas fa-check"></i>
              {{ salvando ? 'Processando...' : 'Confirmar Baixa' }}
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
import { useFornecedores } from '../composables/useFornecedores.js'

const {
  contasPagar,
  carregando,
  buscarContasPagar,
  adicionarContaPagar,
  baixarContaPagar,
  excluirContaPagar
} = useFinanceiro()

const { fornecedores, buscarFornecedores } = useFornecedores()

const modalNova = ref(false)
const modalBaixa = ref(false)
const salvando = ref(false)
const contaEditando = ref(null)
const contaSelecionada = ref(null)
const fornecedorSelecionado = ref(null)

const filtros = ref({
  status: '',
  categoria: '',
  dataInicio: '',
  dataFim: ''
})

const formulario = ref({
  descricao: '',
  categoria: '',
  fornecedor: '',
  fornecedorId: '',
  valor: 0,
  dataVencimento: '',
  observacoes: '',
  jaFoiPago: false,
  dataPagamento: '',
  valorPago: null
})

const formularioBaixa = ref({
  dataPagamento: new Date().toISOString().split('T')[0],
  valorPago: null
})

onMounted(async () => {
  await Promise.all([
    buscarContasPagar(),
    buscarFornecedores()
  ])
})

const contasFiltradas = computed(() => {
  let contas = [...contasPagar.value]

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

const totalPago = computed(() => {
  return contasFiltradas.value
    .filter(c => c.status === 'pago')
    .reduce((sum, c) => sum + (c.valorPago || c.valor || 0), 0)
})

const selecionarFornecedor = () => {
  if (formulario.value.fornecedorId === 'novo') {
    // Abrir cadastro de fornecedor em nova aba
    window.open('/fornecedores', '_blank')
    formulario.value.fornecedorId = ''
    return
  }
  
  const forn = fornecedores.value.find(f => f.id === formulario.value.fornecedorId)
  if (forn) {
    fornecedorSelecionado.value = forn
    formulario.value.fornecedor = forn.nome
  } else {
    fornecedorSelecionado.value = null
  }
}

const abrirModalNova = () => {
  modalNova.value = true
  contaEditando.value = null
  fornecedorSelecionado.value = null
  formulario.value = {
    descricao: '',
    categoria: '',
    fornecedor: '',
    fornecedorId: '',
    valor: 0,
    dataVencimento: '',
    observacoes: '',
    jaFoiPago: false,
    dataPagamento: '',
    valorPago: null
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
    dataPagamento: new Date().toISOString().split('T')[0],
    valorPago: null
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
      fornecedor: formulario.value.fornecedor,
      valor: formulario.value.valor,
      dataVencimento: formulario.value.dataVencimento,
      observacoes: formulario.value.observacoes,
      status: formulario.value.jaFoiPago ? 'pago' : 'pendente',
      dataPagamento: formulario.value.jaFoiPago ? formulario.value.dataPagamento : null,
      valorPago: formulario.value.jaFoiPago ? formulario.value.valorPago : null
    }

    await adicionarContaPagar(dados)
    await buscarContasPagar()
    
    fecharModalNova()
    alert('Despesa adicionada com sucesso!')
  } catch (err) {
    console.error('Erro ao salvar:', err)
    alert('Erro ao salvar despesa. Tente novamente.')
  } finally {
    salvando.value = false
  }
}

const confirmarBaixa = async () => {
  try {
    salvando.value = true

    await baixarContaPagar(
      contaSelecionada.value.id,
      formularioBaixa.value.dataPagamento,
      formularioBaixa.value.valorPago
    )

    await buscarContasPagar()
    
    fecharModalBaixa()
    alert('Baixa realizada com sucesso!')
  } catch (err) {
    console.error('Erro ao dar baixa:', err)
    alert('Erro ao dar baixa. Tente novamente.')
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
    await excluirContaPagar(conta.id)
    await buscarContasPagar()
    alert('Conta excluída com sucesso!')
  } catch (err) {
    console.error('Erro ao excluir:', err)
    alert('Erro ao excluir conta. Tente novamente.')
  }
}

const aplicarFiltros = async () => {
  await buscarContasPagar(filtros.value)
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

const formatarStatus = (status) => {
  const statusMap = {
    pendente: 'Pendente',
    pago: 'Pago',
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
  color: #ff6b6b;
  font-weight: 700;
}

.total-item.pago span {
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

tbody tr.status-pago {
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
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}

.status-badge.status-pago {
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

.input-group {
  margin-bottom: 8px;
}

.select-vinculo {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.input-manual {
  margin-top: 8px;
}

.fornecedor-info {
  display: block;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
  color: #667eea;
  font-size: 12px;
}

.fornecedor-info i {
  margin-right: 6px;
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

