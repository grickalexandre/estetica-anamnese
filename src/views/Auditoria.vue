<template>
  <div class="container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-shield-alt"></i> Log de Auditoria</h1>
        <div class="header-actions">
          <button @click="exportarLogs" class="btn-secondary">
            <i class="fas fa-download"></i> Exportar
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
          <i class="fas fa-clipboard-list"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total de Ações</span>
          <span class="stat-value">{{ estatisticas.total }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon create">
          <i class="fas fa-plus-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Criações</span>
          <span class="stat-value">{{ estatisticas.criados }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon update">
          <i class="fas fa-edit"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Atualizações</span>
          <span class="stat-value">{{ estatisticas.atualizados }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon delete">
          <i class="fas fa-trash-alt"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Exclusões</span>
          <span class="stat-value">{{ estatisticas.excluidos }}</span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card">
      <div class="filtros">
        <div class="filtro-grupo">
          <label>Entidade</label>
          <select v-model="filtros.entidade" @change="aplicarFiltros">
            <option value="">Todas</option>
            <option value="clientes">Clientes</option>
            <option value="profissionais">Profissionais</option>
            <option value="anamneses">Anamneses</option>
            <option value="agendamentos">Agendamentos</option>
            <option value="atendimentos">Atendimentos</option>
            <option value="produtos">Produtos</option>
            <option value="fornecedores">Fornecedores</option>
            <option value="contas_receber">Contas a Receber</option>
            <option value="contas_pagar">Contas a Pagar</option>
            <option value="comissoes">Comissões</option>
          </select>
        </div>

        <div class="filtro-grupo">
          <label>Ação</label>
          <select v-model="filtros.acao" @change="aplicarFiltros">
            <option value="">Todas</option>
            <option value="create">Criação</option>
            <option value="update">Atualização</option>
            <option value="delete">Exclusão</option>
          </select>
        </div>

        <div class="filtro-grupo">
          <label>Usuário</label>
          <select v-model="filtros.usuarioId" @change="aplicarFiltros">
            <option value="">Todos</option>
            <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
              {{ usuario.nome }}
            </option>
          </select>
        </div>

        <div class="filtro-grupo">
          <label>Data Inicial</label>
          <input type="date" v-model="filtros.dataInicial" @change="aplicarFiltros">
        </div>

        <div class="filtro-grupo">
          <label>Data Final</label>
          <input type="date" v-model="filtros.dataFinal" @change="aplicarFiltros">
        </div>

        <div class="filtro-grupo">
          <button @click="limparFiltros" class="btn-secondary">
            <i class="fas fa-eraser"></i> Limpar
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de Logs -->
    <div class="card">
      <div class="card-header">
        <h2>Registros de Auditoria ({{ logsFiltrados.length }})</h2>
        <span class="info-text">
          <i class="fas fa-info-circle"></i>
          Os logs são mantidos por 90 dias
        </span>
      </div>

      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>

      <div v-else-if="logsFiltrados.length === 0" class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <p>Nenhum registro encontrado</p>
      </div>

      <div v-else class="logs-timeline">
        <div 
          v-for="log in logsPaginados" 
          :key="log.id"
          class="log-item"
          :class="`action-${log.acao}`"
        >
          <div class="log-icon">
            <i :class="getAcaoIcon(log.acao)"></i>
          </div>

          <div class="log-content">
            <div class="log-header">
              <div class="log-title">
                <span :class="['badge', `badge-${log.acao}`]">
                  {{ getAcaoLabel(log.acao) }}
                </span>
                <span class="entidade">{{ getEntidadeLabel(log.entidade) }}</span>
              </div>
              <span class="log-date">{{ formatarDataHora(log.data) }}</span>
            </div>

            <div class="log-details">
              <div class="detail-item">
                <i class="fas fa-user"></i>
                <span>{{ log.usuarioNome }}</span>
              </div>
              
              <div class="detail-item" v-if="log.ip">
                <i class="fas fa-network-wired"></i>
                <span>{{ log.ip }}</span>
              </div>
            </div>

            <div class="log-actions">
              <button 
                @click="verDetalhes(log)" 
                class="btn-ver-detalhes"
              >
                <i class="fas fa-eye"></i>
                Ver Mudanças
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginação -->
      <Paginacao
        v-if="logsFiltrados.length > 0"
        :itens-por-pagina="itensPorPagina"
        :total-itens="logsFiltrados.length"
        @pagina-alterada="mudarPagina"
      />
    </div>

    <!-- Modal Detalhes -->
    <div v-if="modalDetalhes" class="modal-overlay" @click="fecharModal">
      <div class="modal large" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-exchange-alt"></i> Detalhes da Alteração</h2>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body" v-if="logSelecionado">
          <div class="log-info">
            <div class="info-item">
              <label>Ação:</label>
              <span :class="['badge', `badge-${logSelecionado.acao}`]">
                {{ getAcaoLabel(logSelecionado.acao) }}
              </span>
            </div>

            <div class="info-item">
              <label>Entidade:</label>
              <span>{{ getEntidadeLabel(logSelecionado.entidade) }}</span>
            </div>

            <div class="info-item">
              <label>Usuário:</label>
              <span>{{ logSelecionado.usuarioNome }}</span>
            </div>

            <div class="info-item">
              <label>Data/Hora:</label>
              <span>{{ formatarDataHoraCompleta(logSelecionado.data) }}</span>
            </div>
          </div>

          <!-- Comparação de Dados -->
          <div class="comparacao" v-if="logSelecionado.acao === 'update'">
            <div class="comparacao-coluna">
              <h3><i class="fas fa-history"></i> Dados Anteriores</h3>
              <div class="dados-json">
                <pre>{{ formatarJSON(logSelecionado.dadosAntigos) }}</pre>
              </div>
            </div>

            <div class="comparacao-coluna">
              <h3><i class="fas fa-check-circle"></i> Dados Novos</h3>
              <div class="dados-json">
                <pre>{{ formatarJSON(logSelecionado.dadosNovos) }}</pre>
              </div>
            </div>
          </div>

          <!-- Dados de Criação -->
          <div class="dados-unico" v-else-if="logSelecionado.acao === 'create'">
            <h3><i class="fas fa-plus-circle"></i> Dados Criados</h3>
            <div class="dados-json">
              <pre>{{ formatarJSON(logSelecionado.dadosNovos) }}</pre>
            </div>
          </div>

          <!-- Dados de Exclusão -->
          <div class="dados-unico" v-else-if="logSelecionado.acao === 'delete'">
            <h3><i class="fas fa-trash-alt"></i> Dados Excluídos</h3>
            <div class="dados-json">
              <pre>{{ formatarJSON(logSelecionado.dadosAntigos) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuditoria } from '../composables/useAuditoria.js'
import Paginacao from '../components/Paginacao.vue'

const router = useRouter()
const { buscarLogs, calcularEstatisticas } = useAuditoria()

// Estado
const logs = ref([])
const usuarios = ref([])
const estatisticas = ref(null)
const carregando = ref(false)
const modalDetalhes = ref(false)
const logSelecionado = ref(null)

// Filtros
const filtros = ref({
  entidade: '',
  acao: '',
  usuarioId: '',
  dataInicial: '',
  dataFinal: ''
})

// Paginação
const paginaAtual = ref(1)
const itensPorPagina = ref(20)

// Computed
const logsFiltrados = computed(() => {
  return logs.value
})

const logsPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina.value
  const fim = inicio + itensPorPagina.value
  return logsFiltrados.value.slice(inicio, fim)
})

// Métodos
const carregarLogs = async () => {
  carregando.value = true
  try {
    console.log('Carregando logs com filtros:', filtros.value)
    
    const resultado = await buscarLogs(filtros.value)
    
    if (resultado.success) {
      logs.value = resultado.data
      console.log(`${logs.value.length} logs carregados`)
      
      // Extrair lista de usuários únicos
      const usuariosUnicos = new Map()
      logs.value.forEach(log => {
        if (log.usuarioId && !usuariosUnicos.has(log.usuarioId)) {
          usuariosUnicos.set(log.usuarioId, {
            id: log.usuarioId,
            nome: log.usuarioNome
          })
        }
      })
      usuarios.value = Array.from(usuariosUnicos.values())
      
      // Calcular estatísticas
      const stats = await calcularEstatisticas(filtros.value)
      if (stats.success) {
        estatisticas.value = stats.data
      }
    } else {
      console.error('Erro ao buscar logs:', resultado.error)
      alert('Erro ao carregar logs: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao carregar logs:', error)
    alert('Erro ao carregar logs')
  } finally {
    carregando.value = false
  }
}

const aplicarFiltros = () => {
  console.log('Aplicando filtros:', filtros.value)
  paginaAtual.value = 1
  carregarLogs()
}

const limparFiltros = () => {
  filtros.value = {
    entidade: '',
    acao: '',
    usuarioId: '',
    dataInicial: '',
    dataFinal: ''
  }
  carregarLogs()
}

const mudarPagina = (novaPagina) => {
  paginaAtual.value = novaPagina
}

const verDetalhes = (log) => {
  logSelecionado.value = log
  modalDetalhes.value = true
}

const fecharModal = () => {
  modalDetalhes.value = false
  logSelecionado.value = null
}

const exportarLogs = () => {
  alert('Funcionalidade de exportação em desenvolvimento')
}

const voltarHome = () => {
  router.push('/')
}

// Helpers
const getAcaoLabel = (acao) => {
  const labels = {
    'create': 'Criação',
    'update': 'Atualização',
    'delete': 'Exclusão'
  }
  return labels[acao] || acao
}

const getAcaoIcon = (acao) => {
  const icons = {
    'create': 'fas fa-plus-circle',
    'update': 'fas fa-edit',
    'delete': 'fas fa-trash-alt'
  }
  return icons[acao] || 'fas fa-circle'
}

const getEntidadeLabel = (entidade) => {
  const labels = {
    'clientes': 'Clientes',
    'profissionais': 'Profissionais',
    'anamneses': 'Anamneses',
    'agendamentos': 'Agendamentos',
    'atendimentos': 'Atendimentos',
    'produtos': 'Produtos',
    'fornecedores': 'Fornecedores',
    'contas_receber': 'Contas a Receber',
    'contas_pagar': 'Contas a Pagar',
    'comissoes': 'Comissões'
  }
  return labels[entidade] || entidade
}

const formatarDataHora = (data) => {
  if (!data) return '-'
  const date = data.toDate ? data.toDate() : new Date(data)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatarDataHoraCompleta = (data) => {
  if (!data) return '-'
  const date = data.toDate ? data.toDate() : new Date(data)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatarJSON = (obj) => {
  if (!obj) return 'Sem dados'
  try {
    return JSON.stringify(obj, null, 2)
  } catch (error) {
    return 'Erro ao formatar dados'
  }
}

// Lifecycle
onMounted(() => {
  carregarLogs()
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

.stat-icon.create {
  background: #28a745;
}

.stat-icon.update {
  background: #ffc107;
}

.stat-icon.delete {
  background: #dc3545;
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

/* Filtros */
.filtros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filtro-grupo label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.filtro-grupo select,
.filtro-grupo input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

/* Card */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
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

.info-text {
  font-size: 0.875rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Timeline de Logs */
.logs-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-left: 3px solid;
  background: white;
  border-radius: 8px;
  transition: all 0.2s;
}

.log-item:hover {
  background: #f8f9fa;
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.log-item.action-create {
  border-left-color: #28a745;
}

.log-item.action-update {
  border-left-color: #ffc107;
}

.log-item.action-delete {
  border-left-color: #dc3545;
}

.log-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  color: white;
}

.action-create .log-icon {
  background: #28a745;
}

.action-update .log-icon {
  background: #ffc107;
}

.action-delete .log-icon {
  background: #dc3545;
}

.log-content {
  flex: 1;
  min-width: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.log-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.badge-create {
  background: #28a745;
}

.badge-update {
  background: #ffc107;
  color: #000;
}

.badge-delete {
  background: #dc3545;
}

.entidade {
  font-weight: 600;
  color: #2c3e50;
}

.log-date {
  font-size: 0.875rem;
  color: #666;
}

.log-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.detail-item i {
  color: #667eea;
}

.btn-ver-detalhes {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-ver-detalhes:hover {
  background: #5568d3;
}

/* Botões */
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
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal.large {
  max-width: 1200px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
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

.log-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.info-item span {
  color: #2c3e50;
}

/* Comparação de Dados */
.comparacao {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.comparacao-coluna h3,
.dados-unico h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.dados-json {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.dados-json pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #2c3e50;
  white-space: pre-wrap;
  word-wrap: break-word;
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

  .filtros {
    grid-template-columns: 1fr;
  }

  .log-info {
    grid-template-columns: 1fr;
  }

  .comparacao {
    grid-template-columns: 1fr;
  }

  .log-item {
    flex-direction: column;
  }
}
</style>

