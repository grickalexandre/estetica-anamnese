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
            <select v-model="form.profissionalId" @change="selecionarProfissional" required>
              <option value="">Escolha o profissional...</option>
              <option v-for="prof in profissionais" :key="prof.id" :value="prof.id">
                {{ prof.nome }} - {{ prof.especialidade }} (Comissão: {{ prof.percentualComissao || 0 }}%)
              </option>
            </select>
            <small v-if="profissionalSelecionado && profissionalSelecionado.percentualComissao > 0" class="info-comissao">
              💰 Comissão: {{ profissionalSelecionado.percentualComissao }}% = 
              R$ {{ formatarMoeda((form.valorCobrado * profissionalSelecionado.percentualComissao) / 100) }}
            </small>
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

        <h2><i class="fas fa-dollar-sign"></i> Gestão Financeira e Pagamento</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label>Forma de Pagamento *</label>
            <select v-model="form.formaPagamento" required>
              <option value="dinheiro">💵 Dinheiro</option>
              <option value="pix">📱 PIX</option>
              <option value="debito">💳 Cartão Débito</option>
              <option value="credito">💳 Cartão Crédito</option>
              <option value="boleto">📄 Boleto</option>
              <option value="promissoria">📝 Promissória</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Número de Parcelas *</label>
            <select v-model.number="form.numeroParcelas" required @change="calcularParcelas">
              <option :value="1">À vista</option>
              <option v-for="n in 12" :key="n+1" :value="n+1">{{ n+1 }}x de R$ {{ formatarMoeda(form.valorCobrado / (n+1)) }}</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Status do Pagamento *</label>
            <select v-model="form.pago" required>
              <option value="false">Pendente</option>
              <option value="true">Pago</option>
            </select>
          </div>
          <div class="form-group" v-if="form.pago === 'false' && form.numeroParcelas === 1">
            <label>Data de Vencimento</label>
            <input v-model="form.dataVencimento" type="date">
            <small class="form-help">Deixe em branco para vencimento imediato</small>
          </div>
          <div class="form-group" v-if="form.numeroParcelas > 1">
            <label>Vencimento da 1ª Parcela</label>
            <input v-model="form.dataVencimento" type="date" required>
            <small class="form-help">As demais serão mensais</small>
          </div>
        </div>
        
        <div v-if="form.numeroParcelas > 1" class="info-parcelas">
          <h4><i class="fas fa-info-circle"></i> Parcelamento</h4>
          <div class="parcelas-preview">
            <div v-for="n in Math.min(form.numeroParcelas, 3)" :key="n" class="parcela-item">
              <span class="parcela-numero">{{ n }}/{{ form.numeroParcelas }}</span>
              <span class="parcela-valor">R$ {{ formatarMoeda(form.valorCobrado / form.numeroParcelas) }}</span>
              <span class="parcela-venc">{{ calcularDataParcela(n) }}</span>
            </div>
            <div v-if="form.numeroParcelas > 3" class="parcela-item mais">
              <span>...</span>
              <span>+{{ form.numeroParcelas - 3 }} parcelas</span>
            </div>
          </div>
        </div>

        <div class="resumo-financeiro" v-if="form.produtosUtilizados.length > 0">
          <h3><i class="fas fa-calculator"></i> Resumo Financeiro</h3>
          <div class="resumo-grid">
            <div class="resumo-item">
              <span class="resumo-label">Receita:</span>
              <span class="resumo-valor receita">R$ {{ formatarMoeda(form.valorCobrado) }}</span>
            </div>
            <div class="resumo-item">
              <span class="resumo-label">Custo dos Produtos:</span>
              <span class="resumo-valor custo">R$ {{ formatarMoeda(calcularCustoProdutos()) }}</span>
            </div>
            <div class="resumo-item">
              <span class="resumo-label">Margem de Lucro:</span>
              <span class="resumo-valor margem" :class="{'positiva': calcularMargemLucro() > 0, 'negativa': calcularMargemLucro() < 0}">
                R$ {{ formatarMoeda(calcularMargemLucro()) }} ({{ calcularPercentualLucro() }}%)
              </span>
            </div>
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
import { useProfissionais } from '../composables/useProfissionais.js'

const router = useRouter()
const { procedimentos, registrarAtendimento } = useProcedimentos()
const { clientes, buscarClientes } = usePacientes()
const { produtos, buscarProdutos } = useProdutos()
const { profissionais, buscarProfissionais } = useProfissionais()

const salvando = ref(false)
const clienteSelecionado = ref(null)
const procedimentoSelecionado = ref(null)
const profissionalSelecionado = ref(null)

const form = ref({
  clienteId: '',
  clienteNome: '',
  profissionalId: '',
  profissionalNome: '',
  procedimentoId: '',
  procedimentoNome: '',
  data: new Date().toISOString().split('T')[0],
  valorCobrado: 0,
  formaPagamento: 'dinheiro',
  numeroParcelas: 1,
  pago: 'false',
  dataVencimento: '',
  observacoes: '',
  produtosUtilizados: []
})

onMounted(async () => {
  await Promise.all([
    buscarClientes(true),
    buscarProdutos(true),
    buscarProfissionais(true)
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

const selecionarProfissional = () => {
  const prof = profissionais.value.find(p => p.id === form.value.profissionalId)
  if (prof) {
    profissionalSelecionado.value = prof
    form.value.profissionalNome = prof.nome
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

const calcularCustoProdutos = () => {
  let custoTotal = 0
  form.value.produtosUtilizados.forEach(item => {
    const produto = produtos.value.find(p => p.id === item.produtoId)
    if (produto) {
      custoTotal += (produto.precoCusto || 0) * item.quantidade
    }
  })
  return custoTotal
}

const calcularMargemLucro = () => {
  const receita = form.value.valorCobrado || 0
  const custos = calcularCustoProdutos()
  return receita - custos
}

const calcularPercentualLucro = () => {
  const receita = form.value.valorCobrado || 0
  if (receita === 0) return 0
  const margem = calcularMargemLucro()
  return ((margem / receita) * 100).toFixed(1)
}

const calcularParcelas = () => {
  // Atualizar quando mudar o número de parcelas
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
.info-comissao { display: block; margin-top: 8px; padding: 8px 12px; background: rgba(102, 126, 234, 0.1); border-radius: 6px; color: #667eea; font-size: 12px; font-weight: 600; }
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
.resumo-financeiro { background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e5ea; }
.resumo-financeiro h3 { font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: #1d1d1f; }
.resumo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.resumo-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: white; border-radius: 8px; border: 1px solid #e5e5ea; }
.resumo-label { font-size: 14px; color: #6e6e73; font-weight: 500; }
.resumo-valor { font-size: 16px; font-weight: 600; }
.resumo-valor.receita { color: #34c759; }
.resumo-valor.custo { color: #ff3b30; }
.resumo-valor.margem.positiva { color: #34c759; }
.resumo-valor.margem.negativa { color: #ff3b30; }
.info-parcelas { background: rgba(102, 126, 234, 0.05); padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid rgba(102, 126, 234, 0.2); }
.info-parcelas h4 { margin: 0 0 12px 0; font-size: 14px; color: #1d1d1f; display: flex; align-items: center; gap: 6px; }
.parcelas-preview { display: flex; flex-direction: column; gap: 8px; }
.parcela-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid #e5e5ea; }
.parcela-item.mais { justify-content: center; gap: 8px; color: #6e6e73; font-size: 13px; }
.parcela-numero { font-weight: 600; color: #667eea; font-size: 13px; }
.parcela-valor { font-weight: 700; color: #1d1d1f; font-size: 15px; }
.parcela-venc { font-size: 13px; color: #6e6e73; }
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

