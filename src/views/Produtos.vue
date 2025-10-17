<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-box"></i> Produtos</h1>
      <button @click="abrirModal" class="btn btn-primary"><i class="fas fa-plus"></i> Novo Produto</button>
    </div>

    <div class="card">
      <div v-if="carregando" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
      <div v-else-if="produtos.length === 0" class="empty-state">
        <i class="fas fa-box"></i>
        <p>Nenhum produto cadastrado</p>
        <button @click="abrirModal" class="btn btn-primary">Cadastrar Primeiro Produto</button>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Estoque</th>
            <th>Mín/Máx</th>
            <th>Preço Venda</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in produtos" :key="prod.id" :class="{'estoque-baixo': prod.estoqueAtual <= prod.estoqueMinimo}">
            <td><strong>{{ prod.nome }}</strong></td>
            <td><span class="badge">{{ prod.categoria }}</span></td>
            <td class="estoque">
              <span :class="{'alerta': prod.estoqueAtual <= prod.estoqueMinimo}">
                {{ prod.estoqueAtual }} {{ prod.unidade }}
              </span>
            </td>
            <td class="min-max">{{ prod.estoqueMinimo }} / {{ prod.estoqueMaximo }}</td>
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
import { ref, onMounted } from 'vue'
import { useProdutos } from '../composables/useProdutos.js'
import { useEstoque } from '../composables/useEstoque.js'

const { produtos, carregando, buscarProdutos, adicionarProduto, atualizarProduto, atualizarEstoque, desativarProduto } = useProdutos()
const { entrada, saida } = useEstoque()

const modal = ref(false)
const modalEstoque = ref(false)
const produtoEditando = ref(null)
const produtoSelecionado = ref(null)
const form = ref({ nome: '', categoria: 'cosmeticos', unidade: 'un', estoqueInicial: 0, estoqueMinimo: 5, estoqueMaximo: 100, precoCusto: 0, precoVenda: 0, descricao: '' })
const formEstoque = ref({ tipo: 'entrada', quantidade: 1, motivo: '' })

onMounted(() => buscarProdutos())

const abrirModal = () => {
  modal.value = true
  produtoEditando.value = null
  form.value = { nome: '', categoria: 'cosmeticos', unidade: 'un', estoqueInicial: 0, estoqueMinimo: 5, estoqueMaximo: 100, precoCusto: 0, precoVenda: 0, descricao: '' }
}

const editar = (prod) => {
  modal.value = true
  produtoEditando.value = prod
  form.value = { ...prod }
}

const salvar = async () => {
  const resultado = produtoEditando.value
    ? await atualizarProduto(produtoEditando.value.id, form.value)
    : await adicionarProduto(form.value)
  
  if (resultado.success) {
    await buscarProdutos()
    fecharModal()
    alert('Produto salvo!')
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
    alert('Estoque atualizado!')
  } else {
    alert('Erro: ' + resultado.error)
  }
}

const desativar = async (id) => {
  if (confirm('Deseja desativar este produto?')) {
    await desativarProduto(id)
    await buscarProdutos()
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
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead th { text-align: left; padding: 12px; background: #f5f5f7; font-weight: 600; font-size: 13px; }
.data-table tbody td { padding: 14px 12px; border-bottom: 1px solid #e5e5ea; }
.data-table tbody tr.estoque-baixo { background: rgba(255, 59, 48, 0.05); }
.estoque .alerta { color: #ff3b30; font-weight: 700; }
.min-max, .preco { font-size: 13px; color: #6e6e73; }
.badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; background: #e5e5ea; }
.status-badge { padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
.status-badge.ativo { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.status-badge.inativo { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }
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
</style>

