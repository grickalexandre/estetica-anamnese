<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-user-md"></i> Registrar Atendimento</h1>
    </div>

    <div class="card">
      <form @submit.prevent="salvar">
        <h2><i class="fas fa-user"></i> Cliente/Paciente</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Selecionar Cliente *</label>
            <select v-model="form.clienteId" @change="selecionarCliente" required>
              <option value="">Escolha o cliente...</option>
              <option v-for="cli in clientes" :key="cli.id" :value="cli.id">
                {{ cli.nome }} - {{ cli.telefone }}
              </option>
            </select>
            <small v-if="clienteSelecionado" class="info-selecionado">
              📋 Anamneses: {{ clienteSelecionado.totalAnamneses || 0 }} | 
              💰 Total Gasto: R$ {{ formatarMoeda(clienteSelecionado.totalGasto || 0) }}
            </small>
          </div>
          <div class="form-group">
            <label>Profissional *</label>
            <input v-model="form.profissional" required placeholder="Nome do profissional">
          </div>
        </div>

        <h2><i class="fas fa-spa"></i> Procedimento</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Procedimento *</label>
            <select v-model="form.procedimentoId" @change="selecionarProcedimento" required>
              <option value="">Escolha o procedimento...</option>
              <option v-for="proc in procedimentos" :key="proc.id" :value="proc.id">
                {{ proc.nome }} - R$ {{ formatarMoeda(proc.preco) }} ({{ proc.duracao }}min)
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Data do Atendimento *</label>
            <input v-model="form.data" type="date" required>
          </div>
          <div class="form-group">
            <label>Valor Cobrado *</label>
            <input v-model.number="form.valorCobrado" type="number" step="0.01" required placeholder="0,00">
          </div>
        </div>

        <div v-if="procedimentoSelecionado && procedimentoSelecionado.produtosUtilizados" class="produtos-section">
          <h3><i class="fas fa-flask"></i> Produtos que serão utilizados (Baixa Automática no Estoque)</h3>
          <div class="produtos-list">
            <div v-for="(item, index) in form.produtosUtilizados" :key="index" class="produto-item-consumo">
              <div class="produto-nome">
                <i class="fas fa-box"></i>
                <strong>{{ item.produtoNome }}</strong>
              </div>
              <div class="produto-quantidade">
                <input v-model.number="item.quantidade" type="number" step="0.01" min="0" class="input-quantidade">
                <span>{{ item.unidade }}</span>
              </div>
              <div class="produto-estoque">
                <small>Estoque: {{ obterEstoqueProduto(item.produtoId) }} {{ item.unidade }}</small>
              </div>
            </div>
          </div>
          <div class="alerta-estoque" v-if="verificarEstoque()">
            <i class="fas fa-exclamation-triangle"></i>
            Será dado baixa automática no estoque dos produtos utilizados
          </div>
        </div>

        <div class="form-group">
          <label>Observações do Atendimento</label>
          <textarea v-model="form.observacoes" rows="4" placeholder="Anotações sobre o atendimento, reações, próximos passos..."></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="$router.push('/agenda')" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i> Voltar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="salvando">
            <i class="fas fa-save"></i> {{ salvando ? 'Salvando...' : 'Registrar Atendimento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProcedimentos } from '../composables/useProcedimentos.js'
import { usePacientes } from '../composables/usePacientes.js'
import { useProdutos } from '../composables/useProdutos.js'

const router = useRouter()
const { procedimentos, registrarAtendimento } = useProcedimentos()
const { clientes, buscarClientes } = usePacientes()
const { produtos, buscarProdutos } = useProdutos()

const salvando = ref(false)
const clienteSelecionado = ref(null)
const procedimentoSelecionado = ref(null)

const form = ref({
  clienteId: '',
  clienteNome: '',
  profissional: '',
  procedimentoId: '',
  procedimentoNome: '',
  data: new Date().toISOString().split('T')[0],
  valorCobrado: 0,
  observacoes: '',
  produtosUtilizados: []
})

onMounted(async () => {
  await Promise.all([
    buscarClientes(true),
    buscarProdutos(true)
  ])
  const { buscarCatalogo } = useProcedimentos()
  await buscarCatalogo()
})

const selecionarCliente = () => {
  const cli = clientes.value.find(c => c.id === form.value.clienteId)
  if (cli) {
    clienteSelecionado.value = cli
    form.value.clienteNome = cli.nome
  }
}

const selecionarProcedimento = () => {
  const proc = procedimentos.value.find(p => p.id === form.value.procedimentoId)
  if (proc) {
    procedimentoSelecionado.value = proc
    form.value.procedimentoNome = proc.nome
    form.value.valorCobrado = proc.preco
    form.value.produtosUtilizados = proc.produtosUtilizados ? JSON.parse(JSON.stringify(proc.produtosUtilizados)) : []
  }
}

const obterEstoqueProduto = (produtoId) => {
  const prod = produtos.value.find(p => p.id === produtoId)
  return prod ? prod.estoqueAtual : 0
}

const verificarEstoque = () => {
  return form.value.produtosUtilizados.some(item => {
    const estoque = obterEstoqueProduto(item.produtoId)
    return item.quantidade > estoque
  })
}

const salvar = async () => {
  try {
    if (verificarEstoque()) {
      if (!confirm('ATENÇÃO: Alguns produtos têm quantidade maior que o estoque disponível. Deseja continuar mesmo assim?')) {
        return
      }
    }

    salvando.value = true
    const resultado = await registrarAtendimento(form.value)
    
    if (resultado.success) {
      alert('Atendimento registrado com sucesso! Estoque atualizado automaticamente.')
      router.push('/agenda')
    } else {
      alert('Erro ao registrar atendimento: ' + resultado.error)
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
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; }
.info-selecionado { display: block; margin-top: 8px; padding: 8px 12px; background: rgba(52, 199, 89, 0.1); border-radius: 6px; color: #34c759; font-size: 12px; }
.produtos-section { background: #f5f5f7; padding: 20px; border-radius: 12px; margin: 20px 0; }
.produtos-section h3 { font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.produtos-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.produto-item-consumo { display: grid; grid-template-columns: 1fr 150px 100px; gap: 12px; padding: 12px; background: white; border-radius: 8px; align-items: center; }
.produto-nome { display: flex; align-items: center; gap: 8px; }
.produto-nome i { color: #667eea; }
.produto-quantidade { display: flex; align-items: center; gap: 8px; }
.input-quantidade { padding: 8px; border: 1px solid #d2d2d7; border-radius: 6px; text-align: center; width: 80px; }
.produto-estoque { font-size: 12px; color: #6e6e73; }
.alerta-estoque { padding: 12px; background: rgba(255, 159, 10, 0.1); border-left: 4px solid #ff9f0a; color: #ff9f0a; border-radius: 6px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-height: 90vh; overflow-y: auto; }
.modal-large { max-width: 800px; }
.modal-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #e5e5ea; }
.modal-header h2 { font-size: 20px; display: flex; align-items: center; gap: 10px; }
.btn-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f7; cursor: pointer; }
.modal-content form { padding: 24px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }
.loading, .empty-state { text-align: center; padding: 60px; color: #6e6e73; }
.empty-state i { font-size: 64px; color: #d2d2d7; margin-bottom: 16px; }
</style>

