<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-user-md"></i> Registrar Atendimento</h1>
        <VoltarHome />
      </div>
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
            <div style="margin-top: 8px;">
              <button type="button" class="btn btn-secondary btn-small" @click="abrirModalPesquisaCliente">
                <i class="fas fa-search"></i> Pesquisar Paciente
              </button>
            </div>
            <div v-if="clienteSelecionado" class="cliente-info">
              <small class="info-selecionado">
                📋 Anamneses: {{ clienteSelecionado.totalAnamneses || 0 }} | 
                💰 Total Gasto: R$ {{ formatarMoeda(clienteSelecionado.totalGasto || 0) }}
              </small>
              <button type="button" @click="verFichaCliente" class="btn-link">
                <i class="fas fa-file-medical"></i> Ver Ficha Completa
              </button>
            </div>
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

        <h2><i class="fas fa-spa"></i> Procedimentos</h2>
        
        <div class="procedimentos-section">
          <div v-for="(item, index) in form.procedimentos" :key="index" class="procedimento-row">
            <div class="form-group">
              <label>Procedimento *</label>
              <select v-model="item.procedimentoId" @change="selecionarProcedimentoMultiplo(index)" required>
                <option value="">Escolha o procedimento...</option>
                <option v-for="proc in procedimentosDisponiveis" :key="proc.id" :value="proc.id">
                  {{ proc.nome }} - R$ {{ formatarMoeda(proc.valor) }} ({{ proc.duracao }}min)
                </option>
              </select>
              <div style="margin-top: 8px;">
                <button type="button" class="btn btn-secondary btn-small" @click="abrirModalPesquisaProcedimento(index)">
                  <i class="fas fa-search"></i> Pesquisar Procedimento
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Valor (R$) *</label>
              <input v-model.number="item.valor" type="number" step="0.01" min="0" required @input="calcularValorTotal">
            </div>

            <div class="form-group-actions">
              <button v-if="form.procedimentos.length > 1" type="button" @click="removerProcedimento(index)" class="btn-icon btn-remove" title="Remover">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <button type="button" @click="adicionarProcedimento" class="btn btn-secondary btn-small">
            <i class="fas fa-plus"></i> Adicionar Procedimento
          </button>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Data do Atendimento *</label>
            <input v-model="form.data" type="date" required>
          </div>
          <div class="form-group">
            <label>Valor Total Cobrado *</label>
            <input v-model.number="form.valorCobrado" type="number" step="0.01" required placeholder="0,00" class="input-valor-total">
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

    <!-- Modal: Pesquisa de Paciente -->
    <div v-if="modalPesquisaCliente" class="modal-overlay" @click.self="fecharModalPesquisaCliente">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2><i class="fas fa-users"></i> Pesquisar Paciente</h2>
          <button type="button" class="btn-close" @click="fecharModalPesquisaCliente"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent>
          <div class="form-group">
            <label>Buscar por nome, telefone ou CPF</label>
            <input type="text" v-model="termoPesquisaCliente" placeholder="Digite para filtrar...">
          </div>
          <div v-if="clientesFiltrados.length === 0" class="empty-state">
            <i class="fas fa-user-slash"></i>
            <p>Nenhum paciente encontrado</p>
          </div>
          <div v-else class="lista-resultados">
            <div v-for="cli in clientesFiltrados" :key="cli.id" class="resultado-item" @click="aplicarSelecaoCliente(cli)">
              <div class="avatar"><i class="fas fa-user"></i></div>
              <div class="info">
                <div class="titulo">{{ cli.nome }}</div>
                <div class="sub">{{ cli.telefone }} • {{ cli.cpf || 'sem CPF' }}</div>
              </div>
              <div class="acao">Selecionar</div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="fecharModalPesquisaCliente">Fechar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Pesquisa de Procedimento -->
    <div v-if="modalPesquisaProcedimento" class="modal-overlay" @click.self="fecharModalPesquisaProcedimento">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2><i class="fas fa-spa"></i> Pesquisar Procedimento</h2>
          <button type="button" class="btn-close" @click="fecharModalPesquisaProcedimento"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent>
          <div class="form-group">
            <label>Buscar por nome ou categoria</label>
            <input type="text" v-model="termoPesquisaProcedimento" placeholder="Digite para filtrar...">
          </div>
          <div v-if="procedimentosFiltradosPesquisa.length === 0" class="empty-state">
            <i class="fas fa-search"></i>
            <p>Nenhum procedimento encontrado</p>
          </div>
          <div v-else class="lista-resultados">
            <div v-for="proc in procedimentosFiltradosPesquisa" :key="proc.id" class="resultado-item" @click="aplicarSelecaoProcedimento(proc)">
              <div class="avatar"><i class="fas fa-spa"></i></div>
              <div class="info">
                <div class="titulo">{{ proc.nome }}</div>
                <div class="sub">{{ proc.categoria || 'categoria' }} • R$ {{ formatarMoeda(proc.valor) }} • {{ proc.duracao }}min</div>
              </div>
              <div class="acao">Selecionar</div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="fecharModalPesquisaProcedimento">Fechar</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProcedimentos } from '../composables/useProcedimentos.js'
import { usePacientes } from '../composables/usePacientes.js'
import { useProdutos } from '../composables/useProdutos.js'
import { useProfissionais } from '../composables/useProfissionais.js'
import { useClinica } from '../composables/useClinica.js'
import { useNotifications } from '../composables/useNotifications.js'
import VoltarHome from '../components/VoltarHome.vue'

const router = useRouter()
const { clinicaId, inicializarClinica } = useClinica()
const { procedimentos, registrarAtendimento } = useProcedimentos()
const { clientes, buscarClientes } = usePacientes()
const { showSuccess, showError, showWarning, showConfirm } = useNotifications()
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
  procedimentos: [], // Múltiplos procedimentos
  data: new Date().toISOString().split('T')[0],
  valorCobrado: 0,
  formaPagamento: 'dinheiro',
  numeroParcelas: 1,
  pago: 'false',
  dataVencimento: '',
  observacoes: '',
  produtosUtilizados: []
})

const procedimentosDisponiveis = computed(() => {
  const selecionados = form.value.procedimentos.map(p => p.procedimentoId).filter(id => id)
  return procedimentos.value.filter(p => !selecionados.includes(p.id))
})

onMounted(async () => {
  console.log('=== CARREGANDO DADOS PARA ATENDIMENTO ===')
  
  try {
    // 1. Inicializar clínica primeiro
    console.log('--- Inicializando clínica ---')
    await inicializarClinica()
    console.log('clinicaId após inicialização:', clinicaId.value)
    console.log('clinicaId type:', typeof clinicaId.value)
    console.log('clinicaId truthy:', !!clinicaId.value)
    
    // 2. Buscar dados
    console.log('--- Iniciando busca de dados ---')
    await Promise.all([
      buscarClientes(), // Buscar TODOS os clientes (ativos e inativos)
      buscarProdutos(true),
      buscarProfissionais(true)
    ])
    
    console.log('--- Dados carregados ---')
    console.log('Clientes carregados:', clientes.value.length)
    console.log('Clientes ativos:', clientes.value.filter(c => c.ativo !== false).length)
    console.log('Clientes inativos:', clientes.value.filter(c => c.ativo === false).length)
    console.log('Lista de clientes:', clientes.value.map(c => ({ id: c.id, nome: c.nome, clinicaId: c.clinicaId })))
    
    const { buscarCatalogo } = useProcedimentos()
    await buscarCatalogo()
    console.log('Procedimentos carregados:', procedimentos.value.length)
    console.log('Procedimentos disponíveis:', procedimentosDisponiveis.value.length)
    console.log('Lista de procedimentos:', procedimentos.value.map(p => ({ id: p.id, nome: p.nome, clinicaId: p.clinicaId })))
    
    adicionarProcedimento() // Inicia com um procedimento
    console.log('=== CARREGAMENTO CONCLUÍDO ===')
  } catch (error) {
    console.error('❌ ERRO NO CARREGAMENTO:', error)
    console.error('Tipo do erro:', error.name)
    console.error('Mensagem:', error.message)
    console.error('Stack:', error.stack)
  }
})

const selecionarCliente = () => {
  const cli = clientes.value.find(c => c.id === form.value.clienteId)
  if (cli) {
    clienteSelecionado.value = cli
    form.value.clienteNome = cli.nome
  }
}

// ===== Modais de Pesquisa =====
const modalPesquisaCliente = ref(false)
const termoPesquisaCliente = ref('')
const clientesFiltrados = computed(() => {
  const termo = termoPesquisaCliente.value.toLowerCase().trim()
  if (!termo) return clientes.value
  return clientes.value.filter(c =>
    (c.nome || '').toLowerCase().includes(termo) ||
    (c.telefone || '').toLowerCase().includes(termo) ||
    (c.cpf || '').toLowerCase().includes(termo)
  )
})
const abrirModalPesquisaCliente = () => {
  termoPesquisaCliente.value = ''
  modalPesquisaCliente.value = true
}
const fecharModalPesquisaCliente = () => {
  modalPesquisaCliente.value = false
}
const aplicarSelecaoCliente = (cli) => {
  form.value.clienteId = cli.id
  selecionarCliente()
  fecharModalPesquisaCliente()
}

const modalPesquisaProcedimento = ref(false)
const termoPesquisaProcedimento = ref('')
const indiceProcedimentoAtivo = ref(null)
const procedimentosFiltradosPesquisa = computed(() => {
  const termo = termoPesquisaProcedimento.value.toLowerCase().trim()
  if (!termo) return procedimentos.value
  return procedimentos.value.filter(p =>
    (p.nome || '').toLowerCase().includes(termo) ||
    (p.categoria || '').toLowerCase().includes(termo)
  )
})
const abrirModalPesquisaProcedimento = (index) => {
  indiceProcedimentoAtivo.value = index
  termoPesquisaProcedimento.value = ''
  modalPesquisaProcedimento.value = true
}
const fecharModalPesquisaProcedimento = () => {
  modalPesquisaProcedimento.value = false
  indiceProcedimentoAtivo.value = null
}
const aplicarSelecaoProcedimento = (proc) => {
  if (indiceProcedimentoAtivo.value === null) return
  const index = indiceProcedimentoAtivo.value
  form.value.procedimentos[index].procedimentoId = proc.id
  form.value.procedimentos[index].procedimentoNome = proc.nome
  form.value.procedimentos[index].valor = proc.valor
  form.value.procedimentos[index].duracao = proc.duracao
  form.value.procedimentos[index].produtosDoProc = proc.produtosUtilizados ? JSON.parse(JSON.stringify(proc.produtosUtilizados)) : []
  recalcularProdutosUtilizados()
  calcularValorTotal()
  fecharModalPesquisaProcedimento()
}
const verFichaCliente = () => {
  // Abrir lista de anamneses filtrada pelo CPF do cliente
  if (clienteSelecionado.value) {
    router.push('/lista')
  }
}

const selecionarProfissional = () => {
  const prof = profissionais.value.find(p => p.id === form.value.profissionalId)
  if (prof) {
    profissionalSelecionado.value = prof
    form.value.profissionalNome = prof.nome
  }
}

const adicionarProcedimento = () => {
  form.value.procedimentos.push({
    procedimentoId: '',
    procedimentoNome: '',
    valor: 0,
    duracao: 0,
    produtosDoProc: []
  })
}

const removerProcedimento = (index) => {
  form.value.procedimentos.splice(index, 1)
  recalcularProdutosUtilizados()
  calcularValorTotal()
}

const selecionarProcedimentoMultiplo = (index) => {
  const proc = procedimentos.value.find(p => p.id === form.value.procedimentos[index].procedimentoId)
  if (proc) {
    console.log('Procedimento selecionado:', proc)
    form.value.procedimentos[index].procedimentoNome = proc.nome
    form.value.procedimentos[index].valor = proc.valor // Corrigido: usar 'valor' ao invés de 'preco'
    form.value.procedimentos[index].duracao = proc.duracao
    form.value.procedimentos[index].produtosDoProc = proc.produtosUtilizados ? JSON.parse(JSON.stringify(proc.produtosUtilizados)) : []
    
    recalcularProdutosUtilizados()
    calcularValorTotal()
  }
}

const recalcularProdutosUtilizados = () => {
  // Consolidar produtos de todos os procedimentos
  const produtosMap = new Map()
  
  form.value.procedimentos.forEach(proc => {
    if (proc.produtosDoProc && proc.produtosDoProc.length > 0) {
      proc.produtosDoProc.forEach(produto => {
        if (produtosMap.has(produto.produtoId)) {
          // Se já existe, soma a quantidade
          const existente = produtosMap.get(produto.produtoId)
          existente.quantidade += produto.quantidade
        } else {
          // Se não existe, adiciona
          produtosMap.set(produto.produtoId, { ...produto })
        }
      })
    }
  })
  
  form.value.produtosUtilizados = Array.from(produtosMap.values())
}

const calcularValorTotal = () => {
  form.value.valorCobrado = form.value.procedimentos.reduce((total, proc) => {
    return total + (proc.valor || 0)
  }, 0)
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
    if (form.value.procedimentos.length === 0) {
      showWarning('Adicione pelo menos um procedimento!', 'Procedimento Obrigatório')
      return
    }

    if (verificarEstoque()) {
      const confirmado = await showConfirm(
        'Alguns produtos têm quantidade maior que o estoque disponível.\n\nDeseja continuar mesmo assim?',
        {
          title: 'ATENÇÃO: Estoque Insuficiente',
          type: 'warning',
          confirmText: 'Sim, Continuar',
          cancelText: 'Não, Revisar',
          confirmIcon: 'fas fa-exclamation-triangle'
        }
      )
      
      if (!confirmado) {
        return
      }
    }

    salvando.value = true
    
    // Preparar dados com lista de procedimentos
    const dadosAtendimento = {
      ...form.value,
      procedimentoNome: form.value.procedimentos.map(p => p.procedimentoNome).join(' + ')
    }
    
    const resultado = await registrarAtendimento(dadosAtendimento)
    
    if (resultado.success) {
      showSuccess('Atendimento registrado com sucesso! Estoque atualizado automaticamente.', 'Sucesso!')
      router.push('/agenda')
    } else {
      showError('Erro ao registrar atendimento: ' + resultado.error)
    }
  } catch (err) {
    showError('Erro ao salvar atendimento. Tente novamente.')
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
.header-content { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.header-content h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; margin: 0; }
.cliente-info { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.info-selecionado { display: block; padding: 8px 12px; background: rgba(52, 199, 89, 0.1); border-radius: 6px; color: #34c759; font-size: 12px; }
.btn-link { background: none; border: none; color: #007aff; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 4px 0; font-weight: 600; }
.btn-link:hover { text-decoration: underline; }
.info-comissao { display: block; margin-top: 8px; padding: 8px 12px; background: rgba(102, 126, 234, 0.1); border-radius: 6px; color: #667eea; font-size: 12px; font-weight: 600; }
.procedimentos-section { background: #f5f5f7; padding: 20px; border-radius: 12px; margin: 20px 0; }
.procedimento-row { display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; margin-bottom: 12px; align-items: end; }
.input-valor-total { font-weight: 700; font-size: 16px; background: rgba(52, 199, 89, 0.05); }
.btn-small { padding: 8px 16px; font-size: 14px; }
.produtos-section { background: #f5f5f7; padding: 20px; border-radius: 12px; margin: 20px 0; }
.produtos-section h3 { font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.lista-resultados { display: grid; gap: 8px; }
.resultado-item { display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px; cursor: pointer; background: #fafafa; }
.resultado-item:hover { background: #f3f4f6; }
.resultado-item .avatar { width: 40px; height: 40px; border-radius: 10px; background: #eef2ff; display: flex; align-items: center; justify-content: center; color: #6366f1; }
.resultado-item .info .titulo { font-weight: 600; color: #111827; }
.resultado-item .info .sub { font-size: 12px; color: #6b7280; }
.resultado-item .acao { font-weight: 600; color: #2563eb; }
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

