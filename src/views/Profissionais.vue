<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-user-md"></i> Profissionais</h1>
        <div class="header-actions">
          <VoltarHome />
          <button @click="abrirModal" class="btn btn-primary">
            <i class="fas fa-plus"></i> Novo Profissional
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

      <!-- Filtro adicional para mostrar inativos -->
      <div class="filtro-ativos">
        <label>
          <input type="checkbox" v-model="mostrarInativos" @change="toggleMostrarInativos">
          Mostrar profissionais inativos
        </label>
      </div>

      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>
      
      <div v-else-if="profissionaisFiltrados.length === 0" class="empty-state">
        <i class="fas fa-user-md"></i>
        <p>Nenhum profissional cadastrado</p>
        <button @click="abrirModal" class="btn btn-primary">Cadastrar Primeiro Profissional</button>
      </div>
      
      <div v-else class="profissionais-grid">
        <div v-for="prof in profissionaisPaginados" :key="prof.id" class="profissional-card">
          <div class="profissional-header">
            <div class="profissional-avatar">
              <i class="fas fa-user-md"></i>
            </div>
            <div class="profissional-info">
              <h3>{{ prof.nome }}</h3>
              <span class="badge">{{ prof.especialidade }}</span>
            </div>
          </div>
          
          <div class="profissional-stats">
            <div class="stat-item">
              <i class="fas fa-calendar-check"></i>
              <div>
                <span class="stat-valor">{{ prof.totalAtendimentos || 0 }}</span>
                <span class="stat-label">Atendimentos</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-percentage"></i>
              <div>
                <span class="stat-valor">{{ prof.percentualComissao || 0 }}%</span>
                <span class="stat-label">Comissão</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-dollar-sign"></i>
              <div>
                <span class="stat-valor">R$ {{ formatarMoeda(prof.totalComissoes || 0) }}</span>
                <span class="stat-label">Total Comissões</span>
              </div>
            </div>
          </div>
          
          <div class="profissional-contato">
            <div class="contato-item" v-if="prof.telefone">
              <i class="fas fa-phone"></i>
              <span>{{ prof.telefone }}</span>
            </div>
            <div class="contato-item" v-if="prof.email">
              <i class="fas fa-envelope"></i>
              <span>{{ prof.email }}</span>
            </div>
            <div class="contato-item" v-if="prof.registroProfissional">
              <i class="fas fa-id-card"></i>
              <span>{{ prof.registroProfissional }}</span>
            </div>
          </div>
          
          <div class="profissional-acoes">
            <button @click="verComissoes(prof)" class="btn btn-secondary btn-small">
              <i class="fas fa-money-bill-wave"></i> Comissões
            </button>
            <button @click="editar(prof)" class="btn-icon btn-edit" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button v-if="prof.ativo" @click="desativar(prof.id)" class="btn-icon btn-disable" title="Desativar">
              <i class="fas fa-ban"></i>
            </button>
            <button v-else @click="reativar(prof.id)" class="btn-icon btn-success" title="Reativar">
              <i class="fas fa-check-circle"></i>
            </button>
            <button @click="excluir(prof.id)" class="btn-icon btn-delete" title="Excluir Permanentemente">
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

    <!-- Modal Profissional -->
    <div v-if="modal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-user-md"></i> {{ profissionalEditando ? 'Editar' : 'Novo' }} Profissional</h2>
          <button @click="fecharModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        
        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Nome Completo *</label>
            <input v-model="form.nome" required placeholder="Ex: Dr. João Silva">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Especialidade *</label>
              <select v-model="form.especialidade" required>
                <option value="esteticista">Esteticista</option>
                <option value="dermatologista">Dermatologista</option>
                <option value="fisioterapeuta">Fisioterapeuta</option>
                <option value="biomedicina">Biomedicina</option>
                <option value="enfermagem">Enfermagem</option>
                <option value="cosmetologo">Cosmetólogo</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Registro Profissional</label>
              <input v-model="form.registroProfissional" placeholder="Ex: CREFITO 123456">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Telefone</label>
              <input v-model="form.telefone" type="tel" placeholder="(14) 99999-9999">
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="profissional@email.com">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Percentual de Comissão (%)</label>
              <input v-model.number="form.percentualComissao" type="number" step="0.1" min="0" max="100" placeholder="0">
              <small class="form-help">Comissão sobre o valor do atendimento</small>
            </div>
            
            <div class="form-group">
              <label>Tipo de Comissão</label>
              <select v-model="form.tipoComissao">
                <option value="porcentagem">Porcentagem (%)</option>
                <option value="valor-fixo">Valor Fixo</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="form.observacoes" rows="3" placeholder="Informações adicionais..."></textarea>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfissionais } from '../composables/useProfissionais.js'
import { usePaginacao } from '../composables/usePaginacao.js'
import { useFiltros } from '../composables/useFiltros.js'
import VoltarHome from '../components/VoltarHome.vue'
import Filtros from '../components/Filtros.vue'
import Paginacao from '../components/Paginacao.vue'
import { db } from '../firebase.js'
import { doc, deleteDoc } from 'firebase/firestore'

const router = useRouter()
const { 
  profissionais, 
  carregando, 
  buscarProfissionais, 
  adicionarProfissional, 
  atualizarProfissional,
  desativarProfissional
} = useProfissionais()

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
} = usePaginacao(9) // 9 itens para ficar 3x3 no grid

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
  categorias: ['esteticista', 'dermatologista', 'fisioterapeuta', 'massoterapeuta', 'outros'],
  data: true,
  ordenacao: [
    { value: 'nome', label: 'Nome' },
    { value: 'especialidade', label: 'Especialidade' },
    { value: 'totalAtendimentos', label: 'Total de Atendimentos' },
    { value: 'dataCriacao', label: 'Data de Criação' }
  ]
}

const modal = ref(false)
const profissionalEditando = ref(null)
const mostrarInativos = ref(false)

// Computed para profissionais filtrados e paginados
const profissionaisFiltrados = computed(() => {
  return aplicarFiltrosComposable(profissionais.value, ['nome', 'especialidade', 'telefone', 'email'])
})

const profissionaisPaginados = computed(() => {
  const { inicio, fim } = itensVisiveis.value
  return profissionaisFiltrados.value.slice(inicio, fim)
})

// Função para aplicar filtros
const aplicarFiltros = (novosFiltros) => {
  atualizarTotalItens(profissionaisFiltrados.value.length)
}

const form = ref({
  nome: '',
  especialidade: 'esteticista',
  registroProfissional: '',
  telefone: '',
  email: '',
  percentualComissao: 0,
  tipoComissao: 'porcentagem',
  observacoes: ''
})

const toggleMostrarInativos = async () => {
  // Buscar todos ou apenas ativos
  await buscarProfissionais(!mostrarInativos.value)
  atualizarTotalItens(profissionaisFiltrados.value.length)
  primeiraPagina()
}

onMounted(async () => {
  await buscarProfissionais(true) // Inicialmente apenas ativos
  atualizarTotalItens(profissionaisFiltrados.value.length)
})

const abrirModal = () => {
  modal.value = true
  profissionalEditando.value = null
  form.value = {
    nome: '',
    especialidade: 'esteticista',
    registroProfissional: '',
    telefone: '',
    email: '',
    percentualComissao: 0,
    tipoComissao: 'porcentagem',
    observacoes: ''
  }
}

const editar = (prof) => {
  modal.value = true
  profissionalEditando.value = prof
  form.value = { ...prof }
}

const salvar = async () => {
  try {
    // Validações
    if (!form.value.nome || form.value.nome.trim() === '') {
      alert('Por favor, preencha o nome do profissional')
      return
    }
    
    if (!form.value.telefone || form.value.telefone.trim() === '') {
      alert('Por favor, preencha o telefone do profissional')
      return
    }
    
    // Validar percentual de comissão
    const percentual = parseFloat(form.value.percentualComissao)
    if (isNaN(percentual) || percentual < 0 || percentual > 100) {
      alert('Percentual de comissão deve estar entre 0 e 100')
      return
    }
    
    // Preparar dados para salvar
    const dadosParaSalvar = {
      nome: form.value.nome.trim(),
      especialidade: form.value.especialidade,
      registroProfissional: form.value.registroProfissional?.trim() || '',
      telefone: form.value.telefone.trim(),
      email: form.value.email?.trim() || '',
      percentualComissao: percentual,
      tipoComissao: form.value.tipoComissao || 'porcentagem',
      observacoes: form.value.observacoes?.trim() || ''
    }
    
    console.log('Salvando profissional:', dadosParaSalvar)
    
    const resultado = profissionalEditando.value
      ? await atualizarProfissional(profissionalEditando.value.id, dadosParaSalvar)
      : await adicionarProfissional(dadosParaSalvar)
    
    console.log('Resultado:', resultado)
    
    if (resultado.success) {
      await buscarProfissionais(true)
      atualizarTotalItens(profissionaisFiltrados.value.length)
      fecharModal()
      alert('Profissional salvo com sucesso!')
    } else {
      console.error('Erro ao salvar:', resultado.error)
      alert('Erro ao salvar profissional: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro inesperado ao salvar profissional:', error)
    alert('Erro inesperado ao salvar profissional: ' + error.message)
  }
}

const desativar = async (id) => {
  if (confirm('Desativar este profissional? Ele não aparecerá mais nas listagens ativas, mas os dados serão mantidos.')) {
    try {
      const resultado = await desativarProfissional(id)
      if (resultado.success) {
        await buscarProfissionais(true)
        atualizarTotalItens(profissionaisFiltrados.value.length)
        alert('Profissional desativado com sucesso!')
      } else {
        alert('Erro ao desativar: ' + resultado.error)
      }
    } catch (error) {
      console.error('Erro ao desativar profissional:', error)
      alert('Erro ao desativar profissional: ' + error.message)
    }
  }
}

const reativar = async (id) => {
  if (confirm('Reativar este profissional?')) {
    try {
      const resultado = await atualizarProfissional(id, { ativo: true })
      if (resultado.success) {
        await buscarProfissionais(true)
        atualizarTotalItens(profissionaisFiltrados.value.length)
        alert('Profissional reativado com sucesso!')
      } else {
        alert('Erro ao reativar: ' + resultado.error)
      }
    } catch (error) {
      console.error('Erro ao reativar profissional:', error)
      alert('Erro ao reativar profissional: ' + error.message)
    }
  }
}

const excluir = async (id) => {
  const confirmacao = confirm(
    '⚠️ ATENÇÃO: Excluir permanentemente este profissional?\n\n' +
    'Esta ação NÃO pode ser desfeita!\n' +
    'Todos os dados, comissões e históricos serão perdidos.\n\n' +
    'Recomendamos usar "Desativar" ao invés de excluir.\n\n' +
    'Deseja realmente EXCLUIR?'
  )
  
  if (confirmacao) {
    const confirmaExclusao = confirm('Tem certeza absoluta? Digite OK para confirmar.')
    if (confirmaExclusao) {
      try {
        // Usar a função de exclusão do composable (precisamos adicionar)
        const docRef = doc(db, 'profissionais', id)
        await deleteDoc(docRef)
        
        await buscarProfissionais(true)
        atualizarTotalItens(profissionaisFiltrados.value.length)
        alert('Profissional excluído permanentemente!')
      } catch (error) {
        console.error('Erro ao excluir profissional:', error)
        alert('Erro ao excluir profissional: ' + error.message)
      }
    }
  }
}

const verComissoes = (prof) => {
  router.push(`/comissoes?profissionalId=${prof.id}`)
}

const fecharModal = () => {
  modal.value = false
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor || 0)
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.header-content { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.header-content h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 12px; }

.filtro-ativos {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.filtro-ativos label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.filtro-ativos input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.profissionais-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.profissional-card { background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 16px; padding: 24px; border: 1px solid #e5e5ea; transition: all 0.3s ease; position: relative; }
.profissional-card:hover { box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); transform: translateY(-4px); }
.profissional-card:not(:has(.profissional-header)) { opacity: 0.6; background: linear-gradient(135deg, #f5f5f7 0%, #e5e5ea 100%); }
.profissional-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 16px 16px 0 0;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.profissional-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e5ea; }
.profissional-avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
.profissional-info h3 { margin: 0 0 6px 0; font-size: 18px; color: #1d1d1f; }

.badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; background: #e5e5ea; color: #1d1d1f; display: inline-block; }

.profissional-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-item { display: flex; align-items: center; gap: 10px; padding: 12px; background: white; border-radius: 10px; border: 1px solid #e5e5ea; }
.stat-item i { font-size: 20px; color: #667eea; }
.stat-valor { display: block; font-size: 16px; font-weight: 700; color: #1d1d1f; }
.stat-label { display: block; font-size: 11px; color: #6e6e73; }

.profissional-contato { margin-bottom: 16px; }
.contato-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px; color: #6e6e73; }
.contato-item i { width: 16px; color: #667eea; }

.profissional-acoes { display: flex; gap: 8px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid #e5e5ea; }
.btn-small { padding: 8px 12px; font-size: 13px; }
.btn-icon { width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-icon.btn-edit { background: #007aff; color: white; }
.btn-icon.btn-disable { background: #ff9500; color: white; }
.btn-icon.btn-success { background: #34c759; color: white; }
.btn-icon.btn-success:hover { background: #28a745; }
.btn-icon.btn-delete { background: #ff3b30; color: white; }
.btn-icon.btn-delete:hover { background: #e02e24; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #e5e5ea; }
.modal-header h2 { font-size: 20px; display: flex; align-items: center; gap: 10px; margin: 0; }
.btn-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f7; cursor: pointer; }
.modal-content form { padding: 24px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }

.form-help { font-size: 12px; color: #8e8e93; margin-top: 4px; display: block; }
.loading, .empty-state { text-align: center; padding: 60px; color: #6e6e73; }
.empty-state i { font-size: 64px; color: #d2d2d7; margin-bottom: 16px; }

@media (max-width: 768px) {
  .profissionais-grid { grid-template-columns: 1fr; }
  .profissional-stats { grid-template-columns: 1fr; }
}
</style>

