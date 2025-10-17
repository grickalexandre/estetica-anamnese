<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-spa"></i> Catálogo de Procedimentos</h1>
      <button @click="abrirModal" class="btn btn-primary"><i class="fas fa-plus"></i> Novo Procedimento</button>
    </div>

    <div class="card">
      <div v-if="carregando" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
      <div v-else-if="procedimentos.length === 0" class="empty-state">
        <i class="fas fa-spa"></i>
        <p>Nenhum procedimento cadastrado</p>
        <button @click="abrirModal" class="btn btn-primary">Cadastrar Primeiro Procedimento</button>
      </div>
      <div v-else class="procedimentos-grid">
        <div v-for="proc in procedimentos" :key="proc.id" class="proc-card">
          <div class="proc-header">
            <h3>{{ proc.nome }}</h3>
            <span class="badge">{{ proc.categoria }}</span>
          </div>
          <div class="proc-info">
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <span>{{ proc.duracao }} min</span>
            </div>
            <div class="info-item">
              <i class="fas fa-dollar-sign"></i>
              <span>R$ {{ formatarMoeda(proc.preco) }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-check-circle"></i>
              <span>{{ proc.totalRealizados || 0 }} realizados</span>
            </div>
          </div>
          <div v-if="proc.produtosUtilizados && proc.produtosUtilizados.length > 0" class="proc-produtos">
            <strong><i class="fas fa-flask"></i> Produtos:</strong>
            <div v-for="item in proc.produtosUtilizados" :key="item.produtoId" class="produto-item">
              {{ item.produtoNome }} - {{ item.quantidade }} {{ item.unidade }}
            </div>
          </div>
          <p v-if="proc.descricao" class="proc-descricao">{{ proc.descricao }}</p>
          <div class="proc-actions">
            <button @click="editar(proc)" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i> Editar</button>
            <button @click="desativar(proc.id)" class="btn btn-danger btn-sm"><i class="fas fa-ban"></i> Desativar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2><i class="fas fa-spa"></i> {{ procedimentoEditando ? 'Editar' : 'Novo' }} Procedimento</h2>
          <button @click="fecharModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Nome do Procedimento *</label>
            <input v-model="form.nome" required placeholder="Ex: Limpeza de Pele Profunda">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="form.categoria" required>
                <option value="facial">Facial</option>
                <option value="corporal">Corporal</option>
                <option value="estetica">Estética</option>
                <option value="depilacao">Depilação</option>
                <option value="massagem">Massagem</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div class="form-group">
              <label>Duração (minutos) *</label>
              <input v-model.number="form.duracao" type="number" required min="15" step="15" placeholder="60">
            </div>
            <div class="form-group">
              <label>Preço (R$) *</label>
              <input v-model.number="form.preco" type="number" required step="0.01" min="0" placeholder="0,00">
            </div>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="form.descricao" rows="3" placeholder="Descrição do procedimento..."></textarea>
          </div>
          
          <h3 class="section-subtitle"><i class="fas fa-flask"></i> Produtos Utilizados</h3>
          <div class="produtos-utilizados">
            <div v-for="(item, index) in form.produtosUtilizados" :key="index" class="produto-row">
              <select v-model="item.produtoId" @change="selecionarProduto(index)" class="produto-select">
                <option value="">Selecione o produto...</option>
                <option v-for="prod in produtos" :key="prod.id" :value="prod.id">
                  {{ prod.nome }} ({{ prod.estoqueAtual }} {{ prod.unidade }})
                </option>
              </select>
              <input v-model.number="item.quantidade" type="number" step="0.01" min="0" placeholder="Qtd" class="quantidade-input">
              <span class="unidade-display">{{ item.unidade || 'un' }}</span>
              <button type="button" @click="removerProduto(index)" class="btn-remove"><i class="fas fa-times"></i></button>
            </div>
            <button type="button" @click="adicionarProduto" class="btn btn-secondary btn-sm">
              <i class="fas fa-plus"></i> Adicionar Produto
            </button>
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
import { ref, onMounted } from 'vue'
import { useProcedimentos } from '../composables/useProcedimentos.js'
import { useProdutos } from '../composables/useProdutos.js'

const { procedimentos, carregando, buscarCatalogo, adicionarAoCatalogo } = useProcedimentos()
const { produtos, buscarProdutos } = useProdutos()

const modal = ref(false)
const procedimentoEditando = ref(null)
const form = ref({
  nome: '',
  categoria: 'facial',
  duracao: 60,
  preco: 0,
  descricao: '',
  produtosUtilizados: []
})

onMounted(async () => {
  await Promise.all([
    buscarCatalogo(),
    buscarProdutos(true)
  ])
})

const abrirModal = () => {
  modal.value = true
  procedimentoEditando.value = null
  form.value = {
    nome: '',
    categoria: 'facial',
    duracao: 60,
    preco: 0,
    descricao: '',
    produtosUtilizados: []
  }
}

const editar = (proc) => {
  modal.value = true
  procedimentoEditando.value = proc
  form.value = { ...proc }
}

const salvar = async () => {
  const resultado = await adicionarAoCatalogo(form.value)
  if (resultado.success) {
    await buscarCatalogo()
    fecharModal()
    alert('Procedimento salvo!')
  }
}

const desativar = async (id) => {
  if (confirm('Deseja desativar este procedimento?')) {
    await updateDoc(doc(db, 'catalogo_procedimentos', id), { ativo: false })
    await buscarCatalogo()
  }
}

const adicionarProduto = () => {
  form.value.produtosUtilizados.push({
    produtoId: '',
    produtoNome: '',
    quantidade: 0,
    unidade: 'ml'
  })
}

const removerProduto = (index) => {
  form.value.produtosUtilizados.splice(index, 1)
}

const selecionarProduto = (index) => {
  const produtoId = form.value.produtosUtilizados[index].produtoId
  const produto = produtos.value.find(p => p.id === produtoId)
  if (produto) {
    form.value.produtosUtilizados[index].produtoNome = produto.nome
    form.value.produtosUtilizados[index].unidade = produto.unidade
  }
}

const fecharModal = () => { modal.value = false }

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor || 0)
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
.page-header h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; }
.procedimentos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.proc-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e5ea; transition: all 0.2s; }
.proc-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
.proc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.proc-header h3 { font-size: 18px; color: #1d1d1f; margin: 0; }
.badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; background: #e5e5ea; }
.proc-info { display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
.info-item { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #6e6e73; }
.info-item i { color: #667eea; }
.proc-produtos { margin: 12px 0; padding: 12px; background: #f5f5f7; border-radius: 8px; }
.proc-produtos strong { display: block; margin-bottom: 8px; font-size: 13px; color: #1d1d1f; }
.produto-item { font-size: 12px; color: #6e6e73; padding: 4px 0; }
.proc-descricao { font-size: 13px; color: #6e6e73; margin: 12px 0; }
.proc-actions { display: flex; gap: 8px; }
.btn-sm { padding: 8px 12px; font-size: 13px; }
.section-subtitle { font-size: 16px; margin: 20px 0 12px; display: flex; align-items: center; gap: 8px; }
.produtos-utilizados { background: #f5f5f7; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
.produto-row { display: grid; grid-template-columns: 1fr 120px 60px 40px; gap: 8px; margin-bottom: 8px; align-items: center; }
.produto-select { padding: 8px; border: 1px solid #d2d2d7; border-radius: 6px; font-size: 13px; }
.quantidade-input { padding: 8px; border: 1px solid #d2d2d7; border-radius: 6px; text-align: center; }
.unidade-display { font-size: 12px; color: #6e6e73; font-weight: 600; text-align: center; }
.btn-remove { width: 32px; height: 32px; border-radius: 6px; border: none; background: #ff3b30; color: white; cursor: pointer; }
.modal-large { max-width: 800px; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #e5e5ea; }
.modal-header h2 { font-size: 20px; display: flex; align-items: center; gap: 10px; }
.btn-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f7; cursor: pointer; }
.modal-content form { padding: 24px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }
.loading, .empty-state { text-align: center; padding: 60px; color: #6e6e73; }
.empty-state i { font-size: 64px; color: #d2d2d7; margin-bottom: 16px; }
</style>

