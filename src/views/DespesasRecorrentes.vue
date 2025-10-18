<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-sync-alt"></i> Despesas Recorrentes</h1>
      <button @click="abrirModal" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nova Despesa
      </button>
    </div>

    <!-- Ação Rápida -->
    <div class="card acao-rapida">
      <div class="acao-content">
        <div>
          <h3><i class="fas fa-calendar-check"></i> Gerar Contas do Mês</h3>
          <p>Gera automaticamente todas as despesas recorrentes do mês atual</p>
        </div>
        <button @click="gerarContas" class="btn btn-success" :disabled="gerando">
          <i v-if="!gerando" class="fas fa-bolt"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          {{ gerando ? 'Gerando...' : 'Gerar Agora' }}
        </button>
      </div>
      <div v-if="ultimaGeracao" class="info-geracao">
        <i class="fas fa-info-circle"></i>
        Última geração: {{ ultimaGeracao }}
      </div>
    </div>

    <!-- Lista de Despesas -->
    <div class="card">
      <h2><i class="fas fa-list"></i> Despesas Cadastradas</h2>
      
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>
      
      <div v-else-if="despesasRecorrentes.length === 0" class="empty-state">
        <i class="fas fa-sync-alt"></i>
        <p>Nenhuma despesa recorrente cadastrada</p>
        <button @click="abrirModal" class="btn btn-primary">Cadastrar Primeira Despesa</button>
      </div>
      
      <div v-else class="despesas-grid">
        <div v-for="despesa in despesasRecorrentes" :key="despesa.id" 
             :class="['despesa-card', {'inativa': !despesa.ativo}]">
          <div class="despesa-header">
            <div class="despesa-info">
              <h3>{{ despesa.descricao }}</h3>
              <span class="badge">{{ despesa.categoria }}</span>
            </div>
            <div class="despesa-valor">
              <span class="valor">R$ {{ formatarMoeda(despesa.valor) }}</span>
              <span class="recorrencia">{{ getTextoRecorrencia(despesa.periodicidade) }}</span>
            </div>
          </div>
          
          <div class="despesa-detalhes">
            <div class="detalhe-item">
              <i class="fas fa-calendar"></i>
              <span>Vencimento: dia {{ despesa.diaVencimento }}</span>
            </div>
            <div class="detalhe-item">
              <i class="fas fa-credit-card"></i>
              <span>{{ despesa.formaPagamento }}</span>
            </div>
            <div v-if="despesa.fornecedorNome" class="detalhe-item">
              <i class="fas fa-truck"></i>
              <span>{{ despesa.fornecedorNome }}</span>
            </div>
            <div v-if="despesa.ultimaGeracao" class="detalhe-item">
              <i class="fas fa-check-circle"></i>
              <span>Última geração: {{ formatarData(despesa.ultimaGeracao) }}</span>
            </div>
          </div>
          
          <div class="despesa-acoes">
            <button @click="editar(despesa)" class="btn-icon btn-edit" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="desativar(despesa.id)" class="btn-icon btn-disable" title="Desativar">
              <i class="fas fa-ban"></i>
            </button>
            <button @click="excluir(despesa.id)" class="btn-icon btn-delete" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-sync-alt"></i> {{ despesaEditando ? 'Editar' : 'Nova' }} Despesa Recorrente</h2>
          <button @click="fecharModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        
        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Descrição *</label>
            <input v-model="form.descricao" required placeholder="Ex: Aluguel, Água, Luz, Internet">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="form.categoria" required>
                <option value="despesas-fixas">Despesas Fixas</option>
                <option value="aluguel">Aluguel</option>
                <option value="contas">Contas (Água, Luz, etc)</option>
                <option value="servicos">Serviços</option>
                <option value="impostos">Impostos</option>
                <option value="folha-pagamento">Folha de Pagamento</option>
                <option value="manutencao">Manutenção</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Valor Mensal (R$) *</label>
              <input v-model.number="form.valor" type="number" step="0.01" min="0" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Dia do Vencimento *</label>
              <select v-model.number="form.diaVencimento" required>
                <option v-for="dia in 31" :key="dia" :value="dia">Dia {{ dia }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Forma de Pagamento *</label>
              <select v-model="form.formaPagamento" required>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="debito-automatico">Débito Automático</option>
                <option value="transferencia">Transferência</option>
                <option value="boleto">Boleto</option>
                <option value="cartao">Cartão</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Periodicidade *</label>
              <select v-model="form.periodicidade" required>
                <option value="mensal">Mensal</option>
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Fornecedor (Opcional)</label>
              <select v-model="form.fornecedorId" @change="selecionarFornecedor">
                <option value="">Selecione...</option>
                <option v-for="forn in fornecedores" :key="forn.id" :value="forn.id">
                  {{ forn.nome }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="form.observacoes" rows="3" placeholder="Informações adicionais..."></textarea>
          </div>
          
          <div class="alerta-info">
            <i class="fas fa-info-circle"></i>
            <div>
              <strong>Como funciona:</strong>
              <p>Todo dia {{ form.diaVencimento || 'X' }} do mês, uma conta a pagar de R$ {{ formatarMoeda(form.valor) }} será gerada automaticamente no financeiro.</p>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDespesasRecorrentes } from '../composables/useDespesasRecorrentes.js'
import { useFornecedores } from '../composables/useFornecedores.js'

const { 
  despesasRecorrentes, 
  carregando, 
  buscarDespesasRecorrentes, 
  adicionarDespesaRecorrente, 
  atualizarDespesaRecorrente,
  desativarDespesaRecorrente,
  excluirDespesaRecorrente,
  gerarContasAutomaticamente
} = useDespesasRecorrentes()

const { fornecedores, buscarFornecedores } = useFornecedores()

const modal = ref(false)
const despesaEditando = ref(null)
const gerando = ref(false)
const ultimaGeracao = ref('')

const form = ref({
  descricao: '',
  categoria: 'despesas-fixas',
  valor: 0,
  diaVencimento: 10,
  formaPagamento: 'transferencia',
  periodicidade: 'mensal',
  fornecedorId: '',
  fornecedorNome: '',
  observacoes: ''
})

onMounted(async () => {
  await Promise.all([
    buscarDespesasRecorrentes(true),
    buscarFornecedores(true)
  ])
})

const abrirModal = () => {
  modal.value = true
  despesaEditando.value = null
  form.value = {
    descricao: '',
    categoria: 'despesas-fixas',
    valor: 0,
    diaVencimento: 10,
    formaPagamento: 'transferencia',
    periodicidade: 'mensal',
    fornecedorId: '',
    fornecedorNome: '',
    observacoes: ''
  }
}

const editar = (despesa) => {
  modal.value = true
  despesaEditando.value = despesa
  form.value = { ...despesa }
}

const salvar = async () => {
  const resultado = despesaEditando.value
    ? await atualizarDespesaRecorrente(despesaEditando.value.id, form.value)
    : await adicionarDespesaRecorrente(form.value)
  
  if (resultado.success) {
    await buscarDespesasRecorrentes(true)
    fecharModal()
    alert('Despesa recorrente salva!')
  } else {
    alert('Erro: ' + resultado.error)
  }
}

const desativar = async (id) => {
  if (confirm('Desativar esta despesa recorrente? Ela não gerará mais contas automaticamente.')) {
    const resultado = await desativarDespesaRecorrente(id)
    if (resultado.success) {
      await buscarDespesasRecorrentes(true)
      alert('Despesa desativada!')
    }
  }
}

const excluir = async (id) => {
  if (confirm('ATENÇÃO: Excluir esta despesa recorrente? Esta ação não pode ser desfeita.\n\nAs contas já geradas NÃO serão excluídas.')) {
    const resultado = await excluirDespesaRecorrente(id)
    if (resultado.success) {
      await buscarDespesasRecorrentes(true)
      alert('Despesa excluída!')
    }
  }
}

const gerarContas = async () => {
  if (confirm('Gerar contas do mês atual para todas as despesas recorrentes ativas?')) {
    gerando.value = true
    const resultado = await gerarContasAutomaticamente()
    gerando.value = false
    
    if (resultado.success) {
      if (resultado.total > 0) {
        alert(`${resultado.total} conta(s) gerada(s) com sucesso!\n\nVerifique em "Contas a Pagar".`)
        ultimaGeracao.value = new Date().toLocaleString('pt-BR')
        await buscarDespesasRecorrentes(true)
      } else {
        alert('Nenhuma conta nova foi gerada. Todas as despesas do mês já foram geradas anteriormente.')
      }
    } else {
      alert('Erro ao gerar contas: ' + resultado.error)
    }
  }
}

const selecionarFornecedor = () => {
  const forn = fornecedores.value.find(f => f.id === form.value.fornecedorId)
  if (forn) {
    form.value.fornecedorNome = forn.nome
  }
}

const fecharModal = () => {
  modal.value = false
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor || 0)
}

const formatarData = (data) => {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR')
}

const getTextoRecorrencia = (periodicidade) => {
  const textos = {
    mensal: 'Todo mês',
    bimestral: 'A cada 2 meses',
    trimestral: 'A cada 3 meses',
    semestral: 'A cada 6 meses',
    anual: 'Todo ano'
  }
  return textos[periodicidade] || periodicidade
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; }

.acao-rapida { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-bottom: 24px; }
.acao-content { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.acao-content h3 { margin: 0 0 4px 0; font-size: 18px; display: flex; align-items: center; gap: 8px; }
.acao-content p { margin: 0; font-size: 14px; opacity: 0.9; }
.info-geracao { font-size: 12px; opacity: 0.8; display: flex; align-items: center; gap: 6px; }

.despesas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px; }
.despesa-card { background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #e5e5ea; transition: all 0.3s ease; }
.despesa-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
.despesa-card.inativa { opacity: 0.6; background: #f5f5f7; }

.despesa-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e5ea; }
.despesa-info h3 { margin: 0 0 8px 0; font-size: 16px; color: #1d1d1f; }
.despesa-valor { text-align: right; }
.despesa-valor .valor { display: block; font-size: 24px; font-weight: 700; color: #1d1d1f; margin-bottom: 4px; }
.despesa-valor .recorrencia { font-size: 12px; color: #6e6e73; }

.badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; background: #e5e5ea; color: #1d1d1f; }

.despesa-detalhes { margin-bottom: 16px; }
.detalhe-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; color: #6e6e73; }
.detalhe-item i { width: 16px; color: #667eea; }

.despesa-acoes { display: flex; gap: 8px; justify-content: flex-end; }
.btn-icon { width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
.btn-icon.btn-edit { background: #007aff; color: white; }
.btn-icon.btn-edit:hover { background: #0051d5; }
.btn-icon.btn-disable { background: #ff9500; color: white; }
.btn-icon.btn-disable:hover { background: #c77700; }
.btn-icon.btn-delete { background: #ff3b30; color: white; }
.btn-icon.btn-delete:hover { background: #d32f2f; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #e5e5ea; }
.modal-header h2 { font-size: 20px; display: flex; align-items: center; gap: 10px; margin: 0; }
.btn-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f7; cursor: pointer; }
.modal-content form { padding: 24px; }

.alerta-info { background: rgba(102, 126, 234, 0.1); padding: 16px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #667eea; }
.alerta-info i { color: #667eea; margin-right: 8px; }
.alerta-info strong { display: block; margin-bottom: 4px; color: #1d1d1f; }
.alerta-info p { margin: 0; font-size: 13px; color: #6e6e73; }

.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }

.loading, .empty-state { text-align: center; padding: 60px; color: #6e6e73; }
.empty-state i { font-size: 64px; color: #d2d2d7; margin-bottom: 16px; }

@media (max-width: 768px) {
  .despesas-grid { grid-template-columns: 1fr; }
  .acao-content { flex-direction: column; gap: 16px; align-items: flex-start; }
}
</style>

