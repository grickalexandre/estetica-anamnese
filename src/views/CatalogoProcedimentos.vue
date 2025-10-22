<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-th-list"></i> Catálogo de Procedimentos</h1>
        <div class="header-actions">
          <VoltarHome />
          <button @click="abrirModal" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Novo Procedimento
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

      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>
      
      <div v-else-if="procedimentosFiltrados.length === 0" class="empty-state">
        <i class="fas fa-th-list"></i>
        <p>Nenhum procedimento cadastrado</p>
        <button @click="abrirModal" class="btn btn-primary">Cadastrar Primeiro Procedimento</button>
      </div>
      
      <div v-else class="procedimentos-grid">
        <div v-for="proc in procedimentosPaginados" :key="proc.id" class="procedimento-card">
          <div class="procedimento-header">
            <div class="procedimento-icon">
              <i :class="getCategoriaIcon(proc.categoria)"></i>
            </div>
            <div class="procedimento-info">
              <h3>{{ proc.nome }}</h3>
              <span class="badge">{{ proc.categoria }}</span>
            </div>
          </div>
          
          <div class="procedimento-detalhes">
            <div class="detalhe-item">
              <i class="fas fa-dollar-sign"></i>
              <div>
                <span class="detalhe-label">Valor</span>
                <span class="detalhe-valor">R$ {{ formatarMoeda(proc.valor) }}</span>
              </div>
            </div>
            <div class="detalhe-item">
              <i class="fas fa-clock"></i>
              <div>
                <span class="detalhe-label">Duração</span>
                <span class="detalhe-valor">{{ proc.duracao }} min</span>
              </div>
            </div>
            <div class="detalhe-item">
              <i class="fas fa-check-circle"></i>
              <div>
                <span class="detalhe-label">Realizados</span>
                <span class="detalhe-valor">{{ proc.totalRealizados || 0 }}</span>
              </div>
            </div>
          </div>
          
          <div class="procedimento-descricao" v-if="proc.descricao">
            <p>{{ proc.descricao }}</p>
          </div>
          
          <div class="procedimento-acoes">
            <button @click="editar(proc)" class="btn-icon btn-edit" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button v-if="proc.ativo" @click="desativar(proc.id)" class="btn-icon btn-disable" title="Desativar">
              <i class="fas fa-ban"></i>
            </button>
            <button v-else @click="reativar(proc.id)" class="btn-icon btn-success" title="Reativar">
              <i class="fas fa-check-circle"></i>
            </button>
            <button @click="excluir(proc.id)" class="btn-icon btn-delete" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

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

    <!-- Modal Procedimento -->
    <div v-if="modal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-th-list"></i> {{ procedimentoEditando ? 'Editar' : 'Novo' }} Procedimento</h2>
          <button @click="fecharModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="salvar">
          <div class="modal-body">
            <div class="form-group">
              <label>Nome do Procedimento *</label>
              <input v-model="form.nome" type="text" required placeholder="Ex: Limpeza de Pele">
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Categoria *</label>
                <select v-model="form.categoria" required>
                  <option value="facial">Facial</option>
                  <option value="corporal">Corporal</option>
                  <option value="depilacao">Depilação</option>
                  <option value="massagem">Massagem</option>
                  <option value="estetica-avancada">Estética Avançada</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div class="form-group">
                <label>Valor (R$) *</label>
                <input v-model.number="form.valor" type="number" step="0.01" min="0" required placeholder="0,00">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Duração (minutos) *</label>
                <input v-model.number="form.duracao" type="number" min="0" required placeholder="60">
              </div>
              <div class="form-group">
                <label>Sessões Recomendadas</label>
                <input v-model.number="form.sessoesRecomendadas" type="number" min="1" placeholder="1">
              </div>
            </div>
            
            <div class="form-group">
              <label>Descrição</label>
              <textarea v-model="form.descricao" rows="3" placeholder="Descreva o procedimento..."></textarea>
            </div>
            
            <div class="form-group">
              <label>Observações/Contraindicações</label>
              <textarea v-model="form.observacoes" rows="2" placeholder="Cuidados especiais, contraindicações..."></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="fecharModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="salvando">
              <i v-if="!salvando" class="fas fa-save"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { useClinica } from '../composables/useClinica.js'
import { usePaginacao } from '../composables/usePaginacao.js'
import { useFiltros } from '../composables/useFiltros.js'
import { useNotifications } from '../composables/useNotifications.js'
import VoltarHome from '../components/VoltarHome.vue'
import Filtros from '../components/Filtros.vue'
import Paginacao from '../components/Paginacao.vue'

const { clinicaId } = useClinica()
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
} = usePaginacao(9) // 9 itens para grid 3x3

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
  categorias: ['facial', 'corporal', 'depilacao', 'massagem', 'estetica-avancada', 'outros'],
  data: true,
  ordenacao: [
    { value: 'nome', label: 'Nome' },
    { value: 'categoria', label: 'Categoria' },
    { value: 'valor', label: 'Valor' },
    { value: 'totalRealizados', label: 'Mais Realizados' },
    { value: 'dataCriacao', label: 'Data de Criação' }
  ]
}

const procedimentos = ref([])
const carregando = ref(false)
const salvando = ref(false)
const modal = ref(false)
const procedimentoEditando = ref(null)
const mostrarInativos = ref(false)

const form = ref({
  nome: '',
  categoria: 'facial',
  valor: 0,
  duracao: 60,
  sessoesRecomendadas: 1,
  descricao: '',
  observacoes: ''
})

// Computed para procedimentos filtrados e paginados
const procedimentosFiltrados = computed(() => {
  let resultado = aplicarFiltrosComposable(procedimentos.value, ['nome', 'categoria', 'descricao'])
  
  // Filtrar por status ativo/inativo
  if (!mostrarInativos.value) {
    resultado = resultado.filter(p => p.ativo !== false)
  }
  
  return resultado
})

const procedimentosPaginados = computed(() => {
  const { inicio, fim } = itensVisiveis.value
  return procedimentosFiltrados.value.slice(inicio, fim)
})

// Função para aplicar filtros
const aplicarFiltros = (novosFiltros) => {
  atualizarTotalItens(procedimentosFiltrados.value.length)
}

const toggleMostrarInativos = async () => {
  await buscarProcedimentos()
  atualizarTotalItens(procedimentosFiltrados.value.length)
  primeiraPagina()
}

// Funções CRUD
const buscarProcedimentos = async () => {
  try {
    carregando.value = true
    console.log('Buscando procedimentos para clinicaId:', clinicaId.value)
    
    const q = query(
      collection(db, 'catalogo_procedimentos'),
      where('clinicaId', '==', clinicaId.value || 'demo')
    )
    const snapshot = await getDocs(q)
    procedimentos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    console.log('Procedimentos carregados:', procedimentos.value.length)
    return procedimentos.value
  } catch (err) {
    console.error('Erro ao buscar procedimentos:', err)
    showError('Erro ao carregar procedimentos: ' + err.message)
    return []
  } finally {
    carregando.value = false
  }
}

const abrirModal = () => {
  console.log('Abrindo modal para novo procedimento')
  modal.value = true
  procedimentoEditando.value = null
  form.value = {
    nome: '',
    categoria: 'facial',
    valor: 0,
    duracao: 60,
    sessoesRecomendadas: 1,
    descricao: '',
    observacoes: ''
  }
}

const fecharModal = () => {
  console.log('Fechando modal, limpando estado')
  modal.value = false
  procedimentoEditando.value = null
  // Limpar formulário também
  form.value = {
    nome: '',
    categoria: 'facial',
    valor: 0,
    duracao: 60,
    sessoesRecomendadas: 1,
    descricao: '',
    observacoes: ''
  }
}

const editar = (proc) => {
  console.log('Editando procedimento:', proc)
  procedimentoEditando.value = proc
  form.value = { ...proc }
  modal.value = true
}

const salvar = async () => {
  try {
    salvando.value = true
    console.log('=== INÍCIO DO SALVAMENTO ===')
    console.log('Salvando procedimento:', form.value)
    console.log('procedimentoEditando:', procedimentoEditando.value)
    console.log('clinicaId:', clinicaId.value)
    
    // Validações
    if (!form.value.nome || form.value.nome.trim() === '') {
      showWarning('Por favor, preencha o nome do procedimento')
      return
    }
    
    if (form.value.valor < 0) {
      showWarning('O valor não pode ser negativo')
      return
    }
    
    if (form.value.duracao <= 0) {
      showWarning('A duração deve ser maior que zero')
      return
    }
    
    const dadosParaSalvar = {
      nome: form.value.nome.trim(),
      categoria: form.value.categoria,
      valor: parseFloat(form.value.valor),
      duracao: parseInt(form.value.duracao),
      sessoesRecomendadas: parseInt(form.value.sessoesRecomendadas) || 1,
      descricao: form.value.descricao?.trim() || '',
      observacoes: form.value.observacoes?.trim() || '',
      clinicaId: clinicaId.value || 'demo',
      ativo: true
    }
    
    console.log('Dados preparados para salvar:', dadosParaSalvar)
    
    if (procedimentoEditando.value && procedimentoEditando.value.id) {
      // Atualizar procedimento existente
      console.log('--- Atualizando procedimento existente ---')
      console.log('ID do procedimento:', procedimentoEditando.value.id)
      
      const docRef = doc(db, 'catalogo_procedimentos', procedimentoEditando.value.id)
      await updateDoc(docRef, {
        ...dadosParaSalvar,
        dataAtualizacao: serverTimestamp()
      })
      console.log('✅ Procedimento atualizado com sucesso')
    } else {
      // Criar novo procedimento
      console.log('--- Criando novo procedimento ---')
      dadosParaSalvar.totalRealizados = 0
      dadosParaSalvar.dataCriacao = serverTimestamp()
      
      const docRef = await addDoc(collection(db, 'catalogo_procedimentos'), dadosParaSalvar)
      console.log('✅ Procedimento criado com ID:', docRef.id)
    }
    
    console.log('--- Recarregando lista ---')
    await buscarProcedimentos()
    atualizarTotalItens(procedimentosFiltrados.value.length)
    fecharModal()
    console.log('=== SALVAMENTO CONCLUÍDO ===')
    showSuccess('Procedimento salvo com sucesso!')
    
  } catch (error) {
    console.error('❌ ERRO AO SALVAR PROCEDIMENTO:', error)
    console.error('Tipo do erro:', error.name)
    console.error('Mensagem:', error.message)
    console.error('Stack:', error.stack)
    showError('Erro ao salvar procedimento: ' + error.message)
  } finally {
    salvando.value = false
  }
}

const desativar = async (id) => {
  try {
    const confirmado = await showConfirm(
      'Ele não aparecerá mais nas opções de atendimento, mas os dados serão mantidos.',
      {
        title: 'Desativar Procedimento?',
        type: 'warning',
        confirmText: 'Sim, Desativar',
        cancelText: 'Cancelar',
        confirmIcon: 'fas fa-eye-slash'
      }
    )
    
    if (!confirmado) return
    
    const docRef = doc(db, 'catalogo_procedimentos', id)
    await updateDoc(docRef, {
      ativo: false,
      dataDesativacao: serverTimestamp()
    })
    
    await buscarProcedimentos()
    atualizarTotalItens(procedimentosFiltrados.value.length)
    showSuccess('Procedimento desativado com sucesso!')
  } catch (error) {
    if (error) {
      console.error('Erro ao desativar procedimento:', error)
      showError('Erro ao desativar procedimento: ' + error.message)
    }
  }
}

const reativar = async (id) => {
  if (confirm('Reativar este procedimento?')) {
    try {
      const docRef = doc(db, 'catalogo_procedimentos', id)
      await updateDoc(docRef, {
        ativo: true
      })
      
      await buscarProcedimentos()
      atualizarTotalItens(procedimentosFiltrados.value.length)
      alert('Procedimento reativado com sucesso!')
    } catch (error) {
      console.error('Erro ao reativar procedimento:', error)
      alert('Erro ao reativar procedimento: ' + error.message)
    }
  }
}

const excluir = async (id) => {
  console.log('=== INÍCIO DA EXCLUSÃO ===')
  console.log('ID do procedimento a ser excluído:', id)
  
  const confirmacao = confirm(
    '⚠️ ATENÇÃO: Excluir permanentemente este procedimento?\n\n' +
    'Esta ação NÃO pode ser desfeita!\n' +
    'Todos os históricos de atendimento com este procedimento serão afetados.\n\n' +
    'Deseja realmente EXCLUIR?'
  )
  
  if (confirmacao) {
    try {
      console.log('--- Excluindo procedimento ---')
      const docRef = doc(db, 'catalogo_procedimentos', id)
      await deleteDoc(docRef)
      console.log('✅ Procedimento excluído com sucesso')
      
      console.log('--- Recarregando lista ---')
      await buscarProcedimentos()
      atualizarTotalItens(procedimentosFiltrados.value.length)
      console.log('=== EXCLUSÃO CONCLUÍDA ===')
      alert('Procedimento excluído permanentemente!')
    } catch (error) {
      console.error('❌ ERRO AO EXCLUIR PROCEDIMENTO:', error)
      console.error('Tipo do erro:', error.name)
      console.error('Mensagem:', error.message)
      console.error('Stack:', error.stack)
      alert('Erro ao excluir procedimento: ' + error.message)
    }
  } else {
    console.log('Exclusão cancelada pelo usuário')
  }
}

const getCategoriaIcon = (categoria) => {
  const icons = {
    'facial': 'fas fa-smile',
    'corporal': 'fas fa-user',
    'depilacao': 'fas fa-spa',
    'massagem': 'fas fa-hands',
    'estetica-avancada': 'fas fa-star',
    'outros': 'fas fa-ellipsis-h'
  }
  return icons[categoria] || 'fas fa-th-list'
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor || 0)
}

onMounted(async () => {
  await buscarProcedimentos()
  atualizarTotalItens(procedimentosFiltrados.value.length)
})
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-content h1 {
  font-size: 28px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.procedimentos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.procedimento-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e5ea;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.procedimento-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #007aff 0%, #5856d6 100%);
}

.procedimento-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.procedimento-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5ea;
}

.procedimento-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
}

.procedimento-info h3 {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: #e5e5ea;
  color: #1d1d1f;
  text-transform: uppercase;
}

.procedimento-detalhes {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.detalhe-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detalhe-item i {
  color: #007aff;
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.detalhe-item > div {
  display: flex;
  flex-direction: column;
}

.detalhe-label {
  font-size: 11px;
  color: #8e8e93;
  text-transform: uppercase;
  font-weight: 600;
}

.detalhe-valor {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.procedimento-descricao {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 122, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid #007aff;
}

.procedimento-descricao p {
  margin: 0;
  font-size: 13px;
  color: #1d1d1f;
  line-height: 1.5;
}

.procedimento-acoes {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e5ea;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon.btn-edit {
  background: #007aff;
  color: white;
}

.btn-icon.btn-edit:hover {
  background: #0051d5;
}

.btn-icon.btn-disable {
  background: #ff9500;
  color: white;
}

.btn-icon.btn-disable:hover {
  background: #cc7700;
}

.btn-icon.btn-success {
  background: #34c759;
  color: white;
}

.btn-icon.btn-success:hover {
  background: #28a745;
}

.btn-icon.btn-delete {
  background: #ff3b30;
  color: white;
}

.btn-icon.btn-delete:hover {
  background: #e02e24;
}

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
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #8e8e93;
  cursor: pointer;
  padding: 4px;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e5ea;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #1d1d1f;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8e8e93;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  color: #d2d2d7;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #8e8e93;
}

.loading i {
  font-size: 32px;
  margin-bottom: 12px;
}
</style>
