<template>
  <div class="container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-users"></i> Equipe da Clínica</h1>
        <div class="header-actions">
          <button @click="abrirModalConvite" class="btn-primary">
            <i class="fas fa-user-plus"></i> Convidar Usuário
          </button>
          <button @click="voltarHome" class="btn-secondary">
            <i class="fas fa-home"></i> Voltar
          </button>
        </div>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats-grid" v-if="estatisticas">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total de Usuários</span>
          <span class="stat-value">{{ estatisticas.total }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon ativos">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Usuários Ativos</span>
          <span class="stat-value">{{ estatisticas.ativos }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon inativos">
          <i class="fas fa-user-slash"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Usuários Inativos</span>
          <span class="stat-value">{{ estatisticas.inativos }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pendentes">
          <i class="fas fa-user-clock"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Convites Pendentes</span>
          <span class="stat-value">{{ estatisticas.pendentes }}</span>
        </div>
      </div>
    </div>

    <!-- Lista de Usuários -->
    <div class="card">
      <div class="card-header">
        <h2>Membros da Equipe ({{ usuarios.length }})</h2>
        <div class="filtro-status">
          <button 
            :class="['btn-filtro', { active: filtroStatus === 'todos' }]"
            @click="filtroStatus = 'todos'"
          >
            Todos
          </button>
          <button 
            :class="['btn-filtro', { active: filtroStatus === 'ativos' }]"
            @click="filtroStatus = 'ativos'"
          >
            Ativos
          </button>
          <button 
            :class="['btn-filtro', { active: filtroStatus === 'inativos' }]"
            @click="filtroStatus = 'inativos'"
          >
            Inativos
          </button>
        </div>
      </div>

      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>

      <div v-else-if="usuariosFiltrados.length === 0" class="empty-state">
        <i class="fas fa-users"></i>
        <p>Nenhum usuário encontrado</p>
        <button @click="abrirModalConvite" class="btn-primary">
          <i class="fas fa-user-plus"></i> Convidar Primeiro Usuário
        </button>
      </div>

      <div v-else class="usuarios-grid">
        <div 
          v-for="usuario in usuariosFiltrados" 
          :key="usuario.id"
          class="usuario-card"
          :class="{ inativo: !usuario.ativo }"
        >
          <div class="usuario-header">
            <div class="usuario-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="usuario-info">
              <h3>{{ usuario.nome }}</h3>
              <p class="email">{{ usuario.email }}</p>
            </div>
            <span :class="['status-badge', usuario.ativo ? 'ativo' : 'inativo']">
              {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>

          <div class="usuario-detalhes">
            <div class="detalhe">
              <i class="fas fa-shield-alt"></i>
              <span class="role-badge" :class="`role-${usuario.role}`">
                {{ getRoleLabel(usuario.role) }}
              </span>
            </div>

            <div class="detalhe" v-if="usuario.dataAceite">
              <i class="fas fa-calendar-check"></i>
              <span>Entrou em {{ formatarData(usuario.dataAceite) }}</span>
            </div>

            <div class="detalhe" v-else>
              <i class="fas fa-clock"></i>
              <span>Convite pendente</span>
            </div>

            <div class="detalhe" v-if="usuario.convidadoPor">
              <i class="fas fa-user-tag"></i>
              <span>Convidado por {{ usuario.convidadoPorNome }}</span>
            </div>
          </div>

          <div class="usuario-actions">
            <button 
              @click="editarRole(usuario)" 
              class="btn-action"
              title="Alterar permissões"
              :disabled="!podeEditar(usuario)"
            >
              <i class="fas fa-user-cog"></i>
            </button>

            <button 
              v-if="usuario.ativo"
              @click="desativarUsuario(usuario)" 
              class="btn-action danger"
              title="Desativar usuário"
              :disabled="!podeDesativar(usuario)"
            >
              <i class="fas fa-user-slash"></i>
            </button>

            <button 
              v-else
              @click="reativarUsuario(usuario)" 
              class="btn-action success"
              title="Reativar usuário"
            >
              <i class="fas fa-user-check"></i>
            </button>

            <button 
              @click="removerUsuario(usuario)" 
              class="btn-action danger"
              title="Remover permanentemente"
              :disabled="!podeRemover(usuario)"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Convite -->
    <div v-if="modalConvite" class="modal-overlay" @click="fecharModalConvite">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-user-plus"></i> Convidar Novo Usuário</h2>
          <button @click="fecharModalConvite" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="enviarConvite">
            <div class="form-group">
              <label>Nome Completo *</label>
              <input 
                type="text" 
                v-model="formConvite.nome" 
                placeholder="Digite o nome do usuário"
                required
              >
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                v-model="formConvite.email" 
                placeholder="email@exemplo.com"
                required
              >
            </div>

            <div class="form-group">
              <label>Perfil de Acesso *</label>
              <select v-model="formConvite.role" required>
                <option value="">Selecione um perfil</option>
                <option value="admin">Administrador - Acesso total</option>
                <option value="profissional">Profissional - Agenda e atendimentos</option>
                <option value="recepcionista">Recepcionista - Agendamentos e cadastros</option>
                <option value="financeiro">Financeiro - Módulo financeiro</option>
                <option value="visualizador">Visualizador - Apenas leitura</option>
              </select>
              <small class="helper-text">
                {{ getRoleDescricao(formConvite.role) }}
              </small>
            </div>

            <div class="form-actions">
              <button type="button" @click="fecharModalConvite" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" :disabled="enviandoConvite">
                <i class="fas fa-paper-plane"></i>
                {{ enviandoConvite ? 'Enviando...' : 'Enviar Convite' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Editar Role -->
    <div v-if="modalEditarRole" class="modal-overlay" @click="fecharModalRole">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-user-cog"></i> Alterar Permissões</h2>
          <button @click="fecharModalRole" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body" v-if="usuarioEditando">
          <div class="usuario-editando">
            <h3>{{ usuarioEditando.nome }}</h3>
            <p>{{ usuarioEditando.email }}</p>
          </div>

          <form @submit.prevent="salvarRole">
            <div class="form-group">
              <label>Perfil de Acesso</label>
              <select v-model="novoRole" required>
                <option value="admin">Administrador</option>
                <option value="profissional">Profissional</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="financeiro">Financeiro</option>
                <option value="visualizador">Visualizador</option>
              </select>
              <small class="helper-text">
                {{ getRoleDescricao(novoRole) }}
              </small>
            </div>

            <div class="form-actions">
              <button type="button" @click="fecharModalRole" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                <i class="fas fa-save"></i> Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuariosClinica } from '../composables/useUsuariosClinica.js'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { 
  buscarUsuariosDaClinica, 
  convidarUsuario, 
  atualizarRole, 
  desativarUsuario: desativar,
  reativarUsuario: reativar,
  removerUsuario: remover,
  calcularEstatisticas 
} = useUsuariosClinica()

const { currentUser } = useAuth()

// Estado
const usuarios = ref([])
const estatisticas = ref(null)
const carregando = ref(false)
const filtroStatus = ref('todos')

// Modais
const modalConvite = ref(false)
const modalEditarRole = ref(false)
const enviandoConvite = ref(false)

// Forms
const formConvite = ref({
  nome: '',
  email: '',
  role: ''
})

const usuarioEditando = ref(null)
const novoRole = ref('')

// Computed
const usuariosFiltrados = computed(() => {
  if (filtroStatus.value === 'todos') return usuarios.value
  if (filtroStatus.value === 'ativos') return usuarios.value.filter(u => u.ativo)
  if (filtroStatus.value === 'inativos') return usuarios.value.filter(u => !u.ativo)
  return usuarios.value
})

// Métodos
const carregarUsuarios = async () => {
  carregando.value = true
  try {
    const resultado = await buscarUsuariosDaClinica()
    
    if (resultado.success) {
      usuarios.value = resultado.data
      
      // Calcular estatísticas
      const stats = await calcularEstatisticas()
      if (stats.success) {
        estatisticas.value = stats.data
      }
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
    alert('Erro ao carregar equipe')
  } finally {
    carregando.value = false
  }
}

const abrirModalConvite = () => {
  formConvite.value = { nome: '', email: '', role: '' }
  modalConvite.value = true
}

const fecharModalConvite = () => {
  modalConvite.value = false
  formConvite.value = { nome: '', email: '', role: '' }
}

const enviarConvite = async () => {
  if (!formConvite.value.nome || !formConvite.value.email || !formConvite.value.role) {
    alert('Por favor, preencha todos os campos')
    return
  }

  enviandoConvite.value = true
  try {
    const resultado = await convidarUsuario(formConvite.value)
    
    if (resultado.success) {
      alert('Convite enviado com sucesso!')
      fecharModalConvite()
      carregarUsuarios()
    } else {
      alert('Erro ao enviar convite: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao enviar convite:', error)
    alert('Erro ao enviar convite')
  } finally {
    enviandoConvite.value = false
  }
}

const editarRole = (usuario) => {
  usuarioEditando.value = usuario
  novoRole.value = usuario.role
  modalEditarRole.value = true
}

const fecharModalRole = () => {
  modalEditarRole.value = false
  usuarioEditando.value = null
  novoRole.value = ''
}

const salvarRole = async () => {
  if (!usuarioEditando.value || !novoRole.value) return

  try {
    const resultado = await atualizarRole(usuarioEditando.value.id, novoRole.value)
    
    if (resultado.success) {
      alert('Permissões alteradas com sucesso!')
      fecharModalRole()
      carregarUsuarios()
    } else {
      alert('Erro ao alterar permissões: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao alterar permissões:', error)
    alert('Erro ao alterar permissões')
  }
}

const desativarUsuario = async (usuario) => {
  if (!confirm(`Desativar ${usuario.nome}?\n\nO usuário não poderá mais acessar o sistema.`)) {
    return
  }

  try {
    const resultado = await desativar(usuario.id)
    
    if (resultado.success) {
      alert('Usuário desativado com sucesso')
      carregarUsuarios()
    } else {
      alert('Erro ao desativar usuário: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao desativar usuário:', error)
    alert('Erro ao desativar usuário')
  }
}

const reativarUsuario = async (usuario) => {
  if (!confirm(`Reativar ${usuario.nome}?`)) return

  try {
    const resultado = await reativar(usuario.id)
    
    if (resultado.success) {
      alert('Usuário reativado com sucesso')
      carregarUsuarios()
    } else {
      alert('Erro ao reativar usuário: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao reativar usuário:', error)
    alert('Erro ao reativar usuário')
  }
}

const removerUsuario = async (usuario) => {
  if (!confirm(`⚠️ ATENÇÃO: Remover ${usuario.nome} permanentemente?\n\nEsta ação NÃO pode ser desfeita!`)) {
    return
  }

  try {
    const resultado = await remover(usuario.id)
    
    if (resultado.success) {
      alert('Usuário removido com sucesso')
      carregarUsuarios()
    } else {
      alert('Erro ao remover usuário: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao remover usuário:', error)
    alert('Erro ao remover usuário')
  }
}

const voltarHome = () => {
  router.push('/')
}

// Permissões
const podeEditar = (usuario) => {
  // Apenas admins podem editar
  return currentUser.value?.role === 'admin' && usuario.userId !== currentUser.value.uid
}

const podeDesativar = (usuario) => {
  // Não pode desativar a si mesmo
  return currentUser.value?.role === 'admin' && usuario.userId !== currentUser.value.uid
}

const podeRemover = (usuario) => {
  // Apenas admins podem remover, exceto a si mesmo
  return currentUser.value?.role === 'admin' && usuario.userId !== currentUser.value.uid
}

// Helpers
const getRoleLabel = (role) => {
  const labels = {
    'admin': 'Administrador',
    'profissional': 'Profissional',
    'recepcionista': 'Recepcionista',
    'financeiro': 'Financeiro',
    'visualizador': 'Visualizador'
  }
  return labels[role] || role
}

const getRoleDescricao = (role) => {
  const descricoes = {
    'admin': 'Acesso total ao sistema, pode gerenciar equipe e configurações',
    'profissional': 'Acesso à agenda, atendimentos e pacientes',
    'recepcionista': 'Acesso a agendamentos, cadastros e anamneses',
    'financeiro': 'Acesso ao módulo financeiro completo',
    'visualizador': 'Acesso apenas para visualização de relatórios'
  }
  return descricoes[role] || ''
}

const formatarData = (data) => {
  if (!data) return '-'
  const date = data.toDate ? data.toDate() : new Date(data)
  return date.toLocaleDateString('pt-BR')
}

// Lifecycle
onMounted(() => {
  carregarUsuarios()
})
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  font-size: 1.8rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Estatísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.total {
  background: #667eea;
}

.stat-icon.ativos {
  background: #28a745;
}

.stat-icon.inativos {
  background: #dc3545;
}

.stat-icon.pendentes {
  background: #ffc107;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

/* Card */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.card-header h2 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin: 0;
}

.filtro-status {
  display: flex;
  gap: 0.5rem;
}

.btn-filtro {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-filtro.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Grid de Usuários */
.usuarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.usuario-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
  background: white;
}

.usuario-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.usuario-card.inativo {
  opacity: 0.6;
  background: #f8f9fa;
}

.usuario-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.usuario-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.usuario-info {
  flex: 1;
  min-width: 0;
}

.usuario-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.usuario-info .email {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.status-badge.ativo {
  background: #d4edda;
  color: #155724;
}

.status-badge.inativo {
  background: #f8d7da;
  color: #721c24;
}

.usuario-detalhes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detalhe {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.detalhe i {
  width: 20px;
  text-align: center;
  color: #667eea;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.role-admin {
  background: #dc3545;
}

.role-profissional {
  background: #667eea;
}

.role-recepcionista {
  background: #28a745;
}

.role-financeiro {
  background: #ffc107;
  color: #000;
}

.role-visualizador {
  background: #6c757d;
}

.usuario-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-action {
  padding: 0.5rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #667eea;
}

.btn-action:hover:not(:disabled) {
  background: #f0f0f0;
  transform: scale(1.05);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action.danger {
  color: #dc3545;
}

.btn-action.success {
  color: #28a745;
}

/* Botões */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* Loading e Empty State */
.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Modal */
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
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.usuario-editando {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.usuario-editando h3 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.usuario-editando p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.helper-text {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Responsivo */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .usuarios-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filtro-status {
    justify-content: center;
  }
}
</style>

