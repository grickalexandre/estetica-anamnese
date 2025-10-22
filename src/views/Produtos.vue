<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-box"></i> Produtos</h1>
        <div class="header-actions">
          <VoltarHome />
          <button @click="abrirModal" class="btn btn-primary"><i class="fas fa-plus"></i> Novo Produto</button>
        </div>
      </div>
    </div>

    <!-- Alertas de Validade -->
    <div v-if="alertasValidade.length > 0" class="alertas-container">
      <div class="alertas-header">
        <h3><i class="fas fa-exclamation-triangle"></i> Alertas de Validade</h3>
      </div>
      <div class="alertas-grid">
        <div v-for="alerta in alertasValidade" :key="alerta.tipo" :class="['alerta-card', alerta.tipo]">
          <div class="alerta-icon">
            <i :class="alerta.icone"></i>
          </div>
          <div class="alerta-content">
            <h4>{{ alerta.titulo }}</h4>
            <p>{{ alerta.descricao }}</p>
            <span class="alerta-count">{{ alerta.quantidade }} produto(s)</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <!-- Filtros -->
      <Filtros 
        :opcoes="opcoesFiltros"
        @filtros-alterados="aplicarFiltros"
      />

      <div v-if="carregando" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
      <div v-else-if="produtosFiltrados.length === 0" class="empty-state">
        <i class="fas fa-box"></i>
        <p>Nenhum produto encontrado</p>
        <button @click="abrirModal" class="btn btn-primary">Cadastrar Primeiro Produto</button>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Estoque</th>
            <th>Mín/Máx</th>
            <th>Validade</th>
            <th>Preço Venda</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in produtosPaginados" :key="prod.id" :class="{'estoque-baixo': prod.estoqueAtual <= prod.estoqueMinimo, 'vencido': getStatusValidade(prod.dataValidade) === 'vencido'}">
            <td><strong>{{ prod.nome }}</strong></td>
            <td><span class="badge">{{ prod.categoria }}</span></td>
            <td class="estoque">
              <span :class="{'alerta': prod.estoqueAtual <= prod.estoqueMinimo}">
                {{ prod.estoqueAtual }} {{ prod.unidade }}
              </span>
            </td>
            <td class="min-max">{{ prod.estoqueMinimo }} / {{ prod.estoqueMaximo }}</td>
            <td class="validade">
              <span v-if="prod.dataValidade" :class="['validade-badge', getStatusValidade(prod.dataValidade)]">
                <i :class="getIconeValidade(prod.dataValidade)"></i>
                {{ formatarData(prod.dataValidade) }}
              </span>
              <span v-else class="validade-badge sem-vencimento">
                <i class="fas fa-infinity"></i>
                Sem vencimento
              </span>
            </td>
            <td class="preco">R$ {{ formatarMoeda(prod.precoVenda) }}</td>
            <td><span :class="['status-badge', prod.ativo ? 'ativo' : 'inativo']">{{ prod.ativo ? 'Ativo' : 'Inativo' }}</span></td>
            <td class="acoes">
              <button @click="movimentarEstoque(prod)" class="btn-icon btn-stock" title="Movimentar"><i class="fas fa-exchange-alt"></i></button>
              <button @click="editar(prod)" class="btn-icon btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
              <button @click="desativar(prod.id)" class="btn-icon btn-disable" title="Desativar"><i class="fas fa-ban"></i></button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação -->
      <Paginacao
        :pagina-atual="paginaAtual"
        :total-paginas="totalPaginas"
        :total-itens="totalItens"
        :itens-por-pagina="itensPorPagina"
        :tem-pagina-anterior="temPaginaAnterior"
        :tem-proxima-pagina="temProximaPagina"
        :paginas-visiveis="paginasVisiveis"
        @ir-para-pagina="irParaPagina"
        @proxima-pagina="proximaPagina"
        @pagina-anterior="paginaAnterior"
        @primeira-pagina="primeiraPagina"
        @ultima-pagina="ultimaPagina"
        @alterar-itens-por-pagina="alterarItensPorPagina"
      />
    </div>

    <!-- Modal Produto -->
    <div v-if="modal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-box"></i> {{ produtoEditando ? 'Editar' : 'Novo' }} Produto</h2>
          <button @click="fecharModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Nome do Produto *</label>
            <input v-model="form.nome" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="form.categoria" required>
                <option value="cosmeticos">Cosméticos</option>
                <option value="equipamentos">Equipamentos</option>
                <option value="insumos">Insumos</option>
                <option value="descartaveis">Descartáveis</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div class="form-group">
              <label>Unidade *</label>
              <select v-model="form.unidade" required>
                <option value="un">Unidade</option>
                <option value="kg">Quilograma</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="g">Grama</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Estoque Inicial</label>
              <input v-model.number="form.estoqueInicial" type="number" min="0">
            </div>
            <div class="form-group">
              <label>Estoque Mínimo</label>
              <input v-model.number="form.estoqueMinimo" type="number" min="0">
            </div>
            <div class="form-group">
              <label>Estoque Máximo</label>
              <input v-model.number="form.estoqueMaximo" type="number" min="0">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Preço Custo</label>
              <input v-model.number="form.precoCusto" type="number" step="0.01" min="0">
            </div>
            <div class="form-group">
              <label>Preço Venda</label>
              <input v-model.number="form.precoVenda" type="number" step="0.01" min="0">
            </div>
          </div>
          <div class="form-group">
            <label>Data de Validade</label>
            <input v-model="form.dataValidade" type="date">
            <small class="form-help">Deixe em branco se o produto não tem validade</small>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="form.descricao" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Salvar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Movimentação -->
    <div v-if="modalEstoque" class="modal-overlay" @click.self="modalEstoque = false">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2><i class="fas fa-exchange-alt"></i> Movimentar Estoque</h2>
          <button @click="modalEstoque = false" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="salvarMovimentacao">
          <div class="info-produto">
            <strong>{{ produtoSelecionado?.nome }}</strong>
            <p>Estoque atual: <span class="destaque">{{ produtoSelecionado?.estoqueAtual }} {{ produtoSelecionado?.unidade }}</span></p>
          </div>
          <div class="form-group">
            <label>Tipo *</label>
            <div class="tipo-selector">
              <label :class="['tipo-option', {active: formEstoque.tipo === 'entrada'}]">
                <input type="radio" v-model="formEstoque.tipo" value="entrada" required>
                <i class="fas fa-arrow-up"></i> Entrada
              </label>
              <label :class="['tipo-option', {active: formEstoque.tipo === 'saida'}]">
                <input type="radio" v-model="formEstoque.tipo" value="saida" required>
                <i class="fas fa-arrow-down"></i> Saída
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Quantidade *</label>
            <input v-model.number="formEstoque.quantidade" type="number" min="1" required>
          </div>
          <div class="form-group">
            <label>Motivo *</label>
            <input v-model="formEstoque.motivo" required placeholder="Ex: Compra, Venda, Perda">
          </div>
          <div class="modal-actions">
            <button type="button" @click="modalEstoque = false" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProdutos } from '../composables/useProdutos.js'
import { useEstoque } from '../composables/useEstoque.js'
import { usePaginacao } from '../composables/usePaginacao.js'
import { useFiltros } from '../composables/useFiltros.js'
import { useNotifications } from '../composables/useNotifications.js'
import VoltarHome from '../components/VoltarHome.vue'
import Filtros from '../components/Filtros.vue'
import Paginacao from '../components/Paginacao.vue'

const { produtos, carregando, buscarProdutos, adicionarProduto, atualizarProduto, atualizarEstoque, desativarProduto, calcularStatusValidade, obterEstatisticasValidade } = useProdutos()
const { entrada, saida } = useEstoque()
const { showSuccess, showError, showWarning, showConfirm } = useNotifications()

// Paginação
const {
  paginaAtual,
  totalItens,
  itensPorPagina,
  totalPaginas,
  temPaginaAnterior,
  temProximaPagina,
  itensVisiveis,
  paginasVisiveis,
  irParaPagina,
  proximaPagina,
  paginaAnterior,
  primeiraPagina,
  ultimaPagina,
  atualizarTotalItens,
  alterarItensPorPagina
} = usePaginacao(10)

// Filtros
const {
  filtros,
  aplicarFiltros: aplicarFiltrosComposable
} = useFiltros()

// Opções para os filtros
const opcoesFiltros = {
  status: [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' }
  ],
  categorias: ['cosmeticos', 'equipamentos', 'insumos', 'descartaveis', 'outros'],
  data: true,
  ordenacao: [
    { value: 'nome', label: 'Nome' },
    { value: 'categoria', label: 'Categoria' },
    { value: 'estoqueAtual', label: 'Estoque' },
    { value: 'precoVenda', label: 'Preço' },
    { value: 'dataCriacao', label: 'Data de Criação' }
  ]
}

const modal = ref(false)
const modalEstoque = ref(false)
const produtoEditando = ref(null)
const produtoSelecionado = ref(null)
const form = ref({ nome: '', categoria: 'cosmeticos', unidade: 'un', estoqueInicial: 0, estoqueMinimo: 5, estoqueMaximo: 100, precoCusto: 0, precoVenda: 0, dataValidade: '', descricao: '' })
const formEstoque = ref({ tipo: 'entrada', quantidade: 1, motivo: '' })
const alertasValidade = ref([])

// Computed para produtos filtrados e paginados
const produtosFiltrados = computed(() => {
  return aplicarFiltrosComposable(produtos.value, ['nome', 'categoria', 'descricao'])
})

const produtosPaginados = computed(() => {
  const { inicio, fim } = itensVisiveis.value
  return produtosFiltrados.value.slice(inicio, fim)
})

// Função para aplicar filtros
const aplicarFiltros = (novosFiltros) => {
  atualizarTotalItens(produtosFiltrados.value.length)
}

onMounted(async () => {
  await buscarProdutos()
  calcularAlertasValidade()
  // Inicializar paginação com o total de itens
  atualizarTotalItens(produtosFiltrados.value.length)
})

const abrirModal = () => {
  modal.value = true
  produtoEditando.value = null
  form.value = { nome: '', categoria: 'cosmeticos', unidade: 'un', estoqueInicial: 0, estoqueMinimo: 5, estoqueMaximo: 100, precoCusto: 0, precoVenda: 0, dataValidade: '', descricao: '' }
}

const editar = (prod) => {
  modal.value = true
  produtoEditando.value = prod
  form.value = { ...prod }
}

const salvar = async () => {
  try {
    console.log('Salvando produto:', form.value)
    
    // Validações
    if (!form.value.nome || form.value.nome.trim() === '') {
      showWarning('Por favor, preencha o nome do produto', 'Campo Obrigatório')
      return
    }
    
    if (form.value.estoqueInicial < 0 || form.value.estoqueMinimo < 0 || form.value.estoqueMaximo < 0) {
      showWarning('Os valores de estoque não podem ser negativos', 'Valores Inválidos')
      return
    }
    
    if (form.value.precoCusto < 0 || form.value.precoVenda < 0) {
      showWarning('Os preços não podem ser negativos', 'Valores Inválidos')
      return
    }
    
    const resultado = produtoEditando.value
      ? await atualizarProduto(produtoEditando.value.id, form.value)
      : await adicionarProduto(form.value)
    
    console.log('Resultado:', resultado)
    
    if (resultado.success) {
      await buscarProdutos()
      atualizarTotalItens(produtosFiltrados.value.length)
      calcularAlertasValidade()
      fecharModal()
      showSuccess('Produto salvo com sucesso!')
    } else {
      showError('Erro ao salvar produto: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao salvar produto:', error)
    showError('Erro ao salvar produto: ' + error.message)
  }
}

const movimentarEstoque = (prod) => {
  produtoSelecionado.value = prod
  modalEstoque.value = true
  formEstoque.value = { tipo: 'entrada', quantidade: 1, motivo: '' }
}

const salvarMovimentacao = async () => {
  const resultado = await atualizarEstoque(produtoSelecionado.value.id, formEstoque.value.quantidade, formEstoque.value.tipo)
  
  if (resultado.success) {
    if (formEstoque.value.tipo === 'entrada') {
      await entrada(produtoSelecionado.value.id, produtoSelecionado.value.nome, formEstoque.value.quantidade, formEstoque.value.motivo)
    } else {
      await saida(produtoSelecionado.value.id, produtoSelecionado.value.nome, formEstoque.value.quantidade, formEstoque.value.motivo)
    }
    await buscarProdutos()
    modalEstoque.value = false
    showSuccess('Estoque atualizado!')
  } else {
    showError('Erro: ' + resultado.error)
  }
}

const desativar = async (id) => {
  try {
    const confirmado = await showConfirm(
      'Ele não aparecerá mais nas listagens ativas, mas os dados serão mantidos.',
      {
        title: 'Desativar Produto?',
        type: 'warning',
        confirmText: 'Sim, Desativar',
        cancelText: 'Cancelar',
        confirmIcon: 'fas fa-eye-slash'
      }
    )
    
    if (!confirmado) return
    
    const resultado = await desativarProduto(id)
    if (resultado.success) {
      await buscarProdutos()
      atualizarTotalItens(produtosFiltrados.value.length)
      calcularAlertasValidade()
      showSuccess('Produto desativado com sucesso!')
    } else {
      showError('Erro ao desativar: ' + resultado.error)
    }
  } catch (error) {
    if (error) {
      console.error('Erro ao desativar produto:', error)
      showError('Erro ao desativar produto: ' + error.message)
    }
  }
}

const fecharModal = () => { modal.value = false }

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor || 0)
}

const formatarData = (data) => {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR')
}

const getStatusValidade = (dataValidade) => {
  return calcularStatusValidade(dataValidade)
}

const getIconeValidade = (dataValidade) => {
  const status = getStatusValidade(dataValidade)
  switch (status) {
    case 'vencido': return 'fas fa-exclamation-triangle'
    case 'proximo-vencimento': return 'fas fa-clock'
    case 'vencimento-medio': return 'fas fa-calendar-alt'
    case 'valido': return 'fas fa-check-circle'
    default: return 'fas fa-infinity'
  }
}

const calcularAlertasValidade = () => {
  const stats = obterEstatisticasValidade()
  const alertas = []

  if (stats.vencidos > 0) {
    alertas.push({
      tipo: 'vencido',
      titulo: 'Produtos Vencidos',
      descricao: 'Produtos que já passaram da data de validade',
      quantidade: stats.vencidos,
      icone: 'fas fa-exclamation-triangle'
    })
  }

  if (stats.proximoVencimento > 0) {
    alertas.push({
      tipo: 'proximo-vencimento',
      titulo: 'Próximo do Vencimento',
      descricao: 'Produtos que vencem em até 30 dias',
      quantidade: stats.proximoVencimento,
      icone: 'fas fa-clock'
    })
  }

  if (stats.vencimentoMedio > 0) {
    alertas.push({
      tipo: 'vencimento-medio',
      titulo: 'Vencimento em 90 dias',
      descricao: 'Produtos que vencem em até 90 dias',
      quantidade: stats.vencimentoMedio,
      icone: 'fas fa-calendar-alt'
    })
  }

  alertasValidade.value = alertas
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.header-content { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.header-content h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead th { text-align: left; padding: 12px; background: #f5f5f7; font-weight: 600; font-size: 13px; }
.data-table tbody td { padding: 14px 12px; border-bottom: 1px solid #e5e5ea; }
.data-table tbody tr.estoque-baixo { background: rgba(255, 59, 48, 0.05); }
.data-table tbody tr.vencido { background: rgba(255, 59, 48, 0.1); }
.estoque .alerta { color: #ff3b30; font-weight: 700; }
.min-max, .preco { font-size: 13px; color: #6e6e73; }
.badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; background: #e5e5ea; }
.status-badge { padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
.status-badge.ativo { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.status-badge.inativo { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }
.validade-badge { display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.validade-badge.vencido { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }
.validade-badge.proximo-vencimento { background: rgba(255, 149, 0, 0.1); color: #ff9500; }
.validade-badge.vencimento-medio { background: rgba(255, 204, 0, 0.1); color: #ffcc00; }
.validade-badge.valido { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.validade-badge.sem-vencimento { background: rgba(142, 142, 147, 0.1); color: #8e8e93; }
.acoes { display: flex; gap: 8px; }
.btn-icon { width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; }
.btn-icon.btn-stock { background: #667eea; color: white; }
.btn-icon.btn-edit { background: #007aff; color: white; }
.btn-icon.btn-disable { background: #ff9500; color: white; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-content.modal-small { max-width: 450px; }
.modal-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #e5e5ea; }
.modal-header h2 { font-size: 20px; display: flex; align-items: center; gap: 10px; }
.btn-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f7; cursor: pointer; }
.modal-content form { padding: 24px; }
.info-produto { background: #f5f5f7; padding: 16px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
.info-produto .destaque { font-size: 20px; font-weight: 700; color: #1d1d1f; }
.tipo-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.tipo-option { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; border: 2px solid #d2d2d7; border-radius: 12px; cursor: pointer; }
.tipo-option input { display: none; }
.tipo-option.active { border-color: #667eea; background: rgba(102, 126, 234, 0.05); }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }
.loading, .empty-state { text-align: center; padding: 60px; color: #6e6e73; }
.empty-state i { font-size: 64px; color: #d2d2d7; margin-bottom: 16px; }
.form-help { font-size: 12px; color: #8e8e93; margin-top: 4px; display: block; }
.alertas-container { margin-bottom: 24px; }
.alertas-header { margin-bottom: 16px; }
.alertas-header h3 { font-size: 18px; color: #1d1d1f; display: flex; align-items: center; gap: 8px; }
.alertas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.alerta-card { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 12px; border-left: 4px solid; }
.alerta-card.vencido { background: rgba(255, 59, 48, 0.05); border-left-color: #ff3b30; }
.alerta-card.proximo-vencimento { background: rgba(255, 149, 0, 0.05); border-left-color: #ff9500; }
.alerta-card.vencimento-medio { background: rgba(255, 204, 0, 0.05); border-left-color: #ffcc00; }
.alerta-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.alerta-card.vencido .alerta-icon { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }
.alerta-card.proximo-vencimento .alerta-icon { background: rgba(255, 149, 0, 0.1); color: #ff9500; }
.alerta-card.vencimento-medio .alerta-icon { background: rgba(255, 204, 0, 0.1); color: #ffcc00; }
.alerta-content { flex: 1; }
.alerta-content h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1d1d1f; }
.alerta-content p { margin: 0 0 8px 0; font-size: 12px; color: #6e6e73; }
.alerta-count { font-size: 12px; font-weight: 600; color: #1d1d1f; }
</style>

