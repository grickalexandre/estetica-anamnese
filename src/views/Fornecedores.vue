<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-truck"></i> Fornecedores</h1>
        <div class="header-actions">
          <VoltarHome />
          <button @click="abrirModal" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Novo Fornecedor
          </button>
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
      <div v-else-if="fornecedoresFiltrados.length === 0" class="empty-state">
        <i class="fas fa-truck"></i>
        <p>Nenhum fornecedor cadastrado</p>
        <button @click="abrirModal" class="btn btn-primary">Cadastrar Primeiro Fornecedor</button>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CNPJ/CPF</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Categoria</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="forn in fornecedoresPaginados" :key="forn.id">
            <td><strong>{{ forn.nome }}</strong></td>
            <td>{{ forn.cnpjCpf || '-' }}</td>
            <td>{{ forn.telefone }}</td>
            <td>{{ forn.email || '-' }}</td>
            <td><span class="badge">{{ forn.categoria }}</span></td>
            <td><span :class="['status-badge', forn.ativo ? 'ativo' : 'inativo']">{{ forn.ativo ? 'Ativo' : 'Inativo' }}</span></td>
            <td class="acoes">
              <button @click="editar(forn)" class="btn-icon btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
              <button v-if="forn.ativo" @click="desativar(forn.id)" class="btn-icon btn-disable" title="Desativar"><i class="fas fa-ban"></i></button>
              <button @click="excluir(forn.id)" class="btn-icon btn-delete" title="Excluir"><i class="fas fa-trash"></i></button>
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

    <div v-if="modal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-truck"></i> {{ fornecedorEditando ? 'Editar' : 'Novo' }} Fornecedor</h2>
          <button @click="fecharModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Nome/Razão Social *</label>
            <input v-model="form.nome" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>CNPJ/CPF</label>
              <input v-model="form.cnpjCpf" placeholder="00.000.000/0000-00">
            </div>
            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="form.categoria" required>
                <option value="produtos">Produtos</option>
                <option value="equipamentos">Equipamentos</option>
                <option value="servicos">Serviços</option>
                <option value="outros">Outros</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Telefone *</label>
              <input v-model="form.telefone" type="tel" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email">
            </div>
          </div>
          <div class="form-group">
            <label>Endereço</label>
            <input v-model="form.endereco">
          </div>
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="form.observacoes" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useFornecedores } from '../composables/useFornecedores.js'
import { usePaginacao } from '../composables/usePaginacao.js'
import { useFiltros } from '../composables/useFiltros.js'
import VoltarHome from '../components/VoltarHome.vue'
import Filtros from '../components/Filtros.vue'
import Paginacao from '../components/Paginacao.vue'

const { fornecedores, carregando, buscarFornecedores, adicionarFornecedor, atualizarFornecedor, desativarFornecedor, excluirFornecedor } = useFornecedores()

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
  categorias: ['produtos', 'equipamentos', 'servicos', 'outros'],
  data: true,
  ordenacao: [
    { value: 'nome', label: 'Nome' },
    { value: 'categoria', label: 'Categoria' },
    { value: 'dataCriacao', label: 'Data de Criação' }
  ]
}

const modal = ref(false)
const fornecedorEditando = ref(null)
const form = ref({ nome: '', cnpjCpf: '', categoria: 'produtos', telefone: '', email: '', endereco: '', observacoes: '' })

// Computed para fornecedores filtrados e paginados
const fornecedoresFiltrados = computed(() => {
  return aplicarFiltrosComposable(fornecedores.value, ['nome', 'cnpjCpf', 'telefone', 'email'])
})

const fornecedoresPaginados = computed(() => {
  const { inicio, fim } = itensVisiveis.value
  return fornecedoresFiltrados.value.slice(inicio, fim)
})

// Função para aplicar filtros
const aplicarFiltros = (novosFiltros) => {
  atualizarTotalItens(fornecedoresFiltrados.value.length)
}

onMounted(async () => {
  await buscarFornecedores()
  atualizarTotalItens(fornecedoresFiltrados.value.length)
})

const abrirModal = () => {
  modal.value = true
  fornecedorEditando.value = null
  form.value = { nome: '', cnpjCpf: '', categoria: 'produtos', telefone: '', email: '', endereco: '', observacoes: '' }
}

const editar = (forn) => {
  modal.value = true
  fornecedorEditando.value = forn
  form.value = { ...forn }
}

const salvar = async () => {
  const resultado = fornecedorEditando.value
    ? await atualizarFornecedor(fornecedorEditando.value.id, form.value)
    : await adicionarFornecedor(form.value)
  
  if (resultado.success) {
    await buscarFornecedores()
    fecharModal()
    alert('Fornecedor salvo com sucesso!')
  }
}

const desativar = async (id) => {
  if (confirm('Deseja desativar este fornecedor?')) {
    await desativarFornecedor(id)
    await buscarFornecedores()
  }
}

const excluir = async (id) => {
  if (confirm('Deseja excluir este fornecedor? Esta ação não pode ser desfeita.')) {
    await excluirFornecedor(id)
    await buscarFornecedores()
  }
}

const fecharModal = () => { modal.value = false }
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.header-content { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.header-content h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead th { text-align: left; padding: 12px; background: #f5f5f7; font-weight: 600; font-size: 13px; text-transform: uppercase; }
.data-table tbody td { padding: 14px 12px; border-bottom: 1px solid #e5e5ea; }
.badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #e5e5ea; }
.status-badge { padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
.status-badge.ativo { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.status-badge.inativo { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }
.acoes { display: flex; gap: 8px; }
.btn-icon { width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-icon.btn-edit { background: #007aff; color: white; }
.btn-icon.btn-disable { background: #ff9500; color: white; }
.btn-icon.btn-delete { background: #ff3b30; color: white; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #e5e5ea; }
.modal-header h2 { font-size: 20px; display: flex; align-items: center; gap: 10px; }
.btn-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f7; cursor: pointer; }
.modal-content form { padding: 24px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }
.loading, .empty-state { text-align: center; padding: 60px; color: #6e6e73; }
.empty-state i { font-size: 64px; color: #d2d2d7; margin-bottom: 16px; }
</style>

