<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-truck-loading"></i> Entrada de Produtos</h1>
    </div>

    <div class="card">
      <form @submit.prevent="salvar">
        <h2><i class="fas fa-truck"></i> Dados do Fornecimento</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label>Fornecedor *</label>
            <select v-model="form.fornecedorId" @change="selecionarFornecedor" required>
              <option value="">Escolha o fornecedor...</option>
              <option v-for="forn in fornecedores" :key="forn.id" :value="forn.id">
                {{ forn.nome }} - {{ forn.cnpj || forn.cpf }}
              </option>
            </select>
            <small v-if="fornecedorSelecionado" class="info-selecionado">
              📞 {{ fornecedorSelecionado.telefone }} | 📧 {{ fornecedorSelecionado.email }}
            </small>
          </div>

          <div class="form-group">
            <label>Data da Compra *</label>
            <input v-model="form.data" type="date" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Número da Nota Fiscal</label>
            <input v-model="form.numeroNota" placeholder="Ex: 12345">
          </div>

          <div class="form-group">
            <label>Forma de Pagamento</label>
            <select v-model="form.formaPagamento">
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="cartao">Cartão</option>
              <option value="boleto">Boleto</option>
              <option value="transferencia">Transferência</option>
            </select>
          </div>
        </div>

        <h2><i class="fas fa-box"></i> Produtos</h2>
        
        <div class="produtos-section">
          <div v-for="(item, index) in form.produtos" :key="index" class="produto-row">
            <div class="form-group">
              <label>Produto *</label>
              <select v-model="item.produtoId" @change="selecionarProduto(index)" required>
                <option value="">Escolha o produto...</option>
                <option v-for="prod in produtosDisponiveis" :key="prod.id" :value="prod.id">
                  {{ prod.nome }} - Estoque: {{ prod.estoqueAtual }} {{ prod.unidade }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Quantidade *</label>
              <input v-model.number="item.quantidade" type="number" step="0.01" min="0.01" required @input="calcularTotal(index)">
            </div>

            <div class="form-group">
              <label>Valor Unitário (R$) *</label>
              <input v-model.number="item.valorUnitario" type="number" step="0.01" min="0" required @input="calcularTotal(index)">
            </div>

            <div class="form-group">
              <label>Subtotal (R$)</label>
              <input :value="formatarMoeda(item.subtotal || 0)" disabled class="input-disabled">
            </div>

            <div class="form-group-actions">
              <button type="button" @click="removerProduto(index)" class="btn-icon btn-remove" title="Remover">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <button type="button" @click="adicionarProduto" class="btn btn-secondary">
            <i class="fas fa-plus"></i> Adicionar Produto
          </button>
        </div>

        <h2><i class="fas fa-dollar-sign"></i> Pagamento</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label>Valor Total (R$)</label>
            <input :value="formatarMoeda(form.valorTotal)" disabled class="input-disabled valor-total">
          </div>

          <div class="form-group">
            <label>Número de Parcelas *</label>
            <select v-model.number="form.numeroParcelas" required @change="calcularParcelas">
              <option :value="1">À vista</option>
              <option v-for="n in 12" :key="n+1" :value="n+1">{{ n+1 }}x de R$ {{ formatarMoeda(form.valorTotal / (n+1)) }}</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Status do Pagamento *</label>
            <select v-model="form.pago" required>
              <option value="false">A Pagar</option>
              <option value="true">Pago</option>
            </select>
          </div>

          <div class="form-group" v-if="form.pago === 'false' && form.numeroParcelas === 1">
            <label>Data de Vencimento</label>
            <input v-model="form.dataVencimento" type="date">
            <small class="form-help">Deixe em branco para vencimento imediato</small>
          </div>
          
          <div class="form-group" v-if="form.numeroParcelas > 1">
            <label>Vencimento da 1ª Parcela *</label>
            <input v-model="form.dataVencimento" type="date" required>
            <small class="form-help">As demais serão mensais</small>
          </div>
        </div>
        
        <div v-if="form.numeroParcelas > 1" class="info-parcelas">
          <h4><i class="fas fa-info-circle"></i> Parcelamento</h4>
          <div class="parcelas-preview">
            <div v-for="n in Math.min(form.numeroParcelas, 3)" :key="n" class="parcela-item">
              <span class="parcela-numero">{{ n }}/{{ form.numeroParcelas }}</span>
              <span class="parcela-valor">R$ {{ formatarMoeda(form.valorTotal / form.numeroParcelas) }}</span>
              <span class="parcela-venc">{{ calcularDataParcela(n) }}</span>
            </div>
            <div v-if="form.numeroParcelas > 3" class="parcela-item mais">
              <span>...</span>
              <span>+{{ form.numeroParcelas - 3 }} parcelas</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Observações</label>
          <textarea v-model="form.observacoes" rows="3" placeholder="Informações adicionais sobre a compra..."></textarea>
        </div>

        <div class="resumo-compra" v-if="form.produtos.length > 0">
          <h3><i class="fas fa-clipboard-list"></i> Resumo da Compra</h3>
          <div class="resumo-grid">
            <div class="resumo-item">
              <span class="resumo-label">Total de Produtos:</span>
              <span class="resumo-valor">{{ form.produtos.length }}</span>
            </div>
            <div class="resumo-item">
              <span class="resumo-label">Quantidade Total:</span>
              <span class="resumo-valor">{{ calcularQuantidadeTotal() }} itens</span>
            </div>
            <div class="resumo-item">
              <span class="resumo-label">Valor Total:</span>
              <span class="resumo-valor destaque">R$ {{ formatarMoeda(form.valorTotal) }}</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$router.push('/produtos')" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i> Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="salvando || form.produtos.length === 0">
            <i v-if="!salvando" class="fas fa-save"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ salvando ? 'Salvando...' : 'Registrar Entrada' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCompras } from '../composables/useCompras.js'
import { useFornecedores } from '../composables/useFornecedores.js'
import { useProdutos } from '../composables/useProdutos.js'

const router = useRouter()
const { registrarCompra } = useCompras()
const { fornecedores, buscarFornecedores } = useFornecedores()
const { produtos, buscarProdutos } = useProdutos()

const salvando = ref(false)
const fornecedorSelecionado = ref(null)

const form = ref({
  fornecedorId: '',
  fornecedorNome: '',
  data: new Date().toISOString().split('T')[0],
  numeroNota: '',
  formaPagamento: 'dinheiro',
  valorTotal: 0,
  numeroParcelas: 1,
  pago: 'false',
  dataVencimento: '',
  observacoes: '',
  produtos: []
})

const produtosDisponiveis = computed(() => {
  const selecionados = form.value.produtos.map(p => p.produtoId).filter(id => id)
  return produtos.value.filter(p => !selecionados.includes(p.id) || p.id === '')
})

onMounted(async () => {
  await Promise.all([
    buscarFornecedores(true),
    buscarProdutos(true)
  ])
  adicionarProduto()
})

const selecionarFornecedor = () => {
  const forn = fornecedores.value.find(f => f.id === form.value.fornecedorId)
  if (forn) {
    fornecedorSelecionado.value = forn
    form.value.fornecedorNome = forn.nome
  }
}

const selecionarProduto = (index) => {
  const prod = produtos.value.find(p => p.id === form.value.produtos[index].produtoId)
  if (prod) {
    form.value.produtos[index].produtoNome = prod.nome
    form.value.produtos[index].unidade = prod.unidade
  }
}

const adicionarProduto = () => {
  form.value.produtos.push({
    produtoId: '',
    produtoNome: '',
    quantidade: 1,
    unidade: '',
    valorUnitario: 0,
    subtotal: 0
  })
}

const removerProduto = (index) => {
  form.value.produtos.splice(index, 1)
  calcularValorTotal()
}

const calcularTotal = (index) => {
  const item = form.value.produtos[index]
  item.subtotal = (item.quantidade || 0) * (item.valorUnitario || 0)
  calcularValorTotal()
}

const calcularValorTotal = () => {
  form.value.valorTotal = form.value.produtos.reduce((total, item) => {
    return total + (item.subtotal || 0)
  }, 0)
}

const calcularQuantidadeTotal = () => {
  return form.value.produtos.reduce((total, item) => {
    return total + (item.quantidade || 0)
  }, 0)
}

const salvar = async () => {
  try {
    if (form.value.produtos.length === 0) {
      alert('Adicione pelo menos um produto!')
      return
    }

    if (!form.value.fornecedorId) {
      alert('Selecione um fornecedor!')
      return
    }

    salvando.value = true
    const resultado = await registrarCompra(form.value)

    if (resultado.success) {
      alert('Entrada registrada com sucesso! Estoque atualizado e conta a pagar criada.')
      router.push('/produtos')
    } else {
      alert('Erro ao registrar entrada: ' + resultado.error)
    }
  } catch (err) {
    alert('Erro ao salvar')
  } finally {
    salvando.value = false
  }
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor || 0)
}

const calcularParcelas = () => {
  if (form.value.numeroParcelas > 1 && !form.value.dataVencimento) {
    form.value.dataVencimento = new Date().toISOString().split('T')[0]
  }
}

const calcularDataParcela = (numeroParcela) => {
  if (!form.value.dataVencimento) return '-'
  const data = new Date(form.value.dataVencimento)
  data.setMonth(data.getMonth() + (numeroParcela - 1))
  return data.toLocaleDateString('pt-BR')
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; }

.info-selecionado { display: block; margin-top: 8px; padding: 8px 12px; background: rgba(52, 199, 89, 0.1); border-radius: 6px; color: #34c759; font-size: 12px; }

.produtos-section { background: #f5f5f7; padding: 20px; border-radius: 12px; margin: 20px 0; }

.produto-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; margin-bottom: 12px; align-items: end; }

.form-group-actions { display: flex; align-items: flex-end; padding-bottom: 8px; }

.btn-icon { width: 40px; height: 40px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-icon.btn-remove { background: #ff3b30; color: white; }
.btn-icon.btn-remove:hover { background: #d32f2f; }

.input-disabled { background: #f5f5f7; cursor: not-allowed; }
.valor-total { font-weight: 700; font-size: 16px; }

.resumo-compra { background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e5ea; }
.resumo-compra h3 { font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: #1d1d1f; }
.resumo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.resumo-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: white; border-radius: 8px; border: 1px solid #e5e5ea; }
.resumo-label { font-size: 14px; color: #6e6e73; font-weight: 500; }
.resumo-valor { font-size: 16px; font-weight: 600; color: #1d1d1f; }
.resumo-valor.destaque { color: #34c759; font-size: 20px; }

.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }

.form-help { font-size: 12px; color: #8e8e93; margin-top: 4px; display: block; }
.info-parcelas { background: rgba(102, 126, 234, 0.05); padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid rgba(102, 126, 234, 0.2); }
.info-parcelas h4 { margin: 0 0 12px 0; font-size: 14px; color: #1d1d1f; display: flex; align-items: center; gap: 6px; }
.parcelas-preview { display: flex; flex-direction: column; gap: 8px; }
.parcela-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid #e5e5ea; }
.parcela-item.mais { justify-content: center; gap: 8px; color: #6e6e73; font-size: 13px; }
.parcela-numero { font-weight: 600; color: #667eea; font-size: 13px; }
.parcela-valor { font-weight: 700; color: #1d1d1f; font-size: 15px; }
.parcela-venc { font-size: 13px; color: #6e6e73; }

@media (max-width: 768px) {
  .produto-row { grid-template-columns: 1fr; }
  .form-group-actions { justify-content: center; margin-top: 12px; }
}
</style>

