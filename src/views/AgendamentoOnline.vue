<template>
  <div class="agendamento-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <h1><i class="fas fa-calendar-alt"></i> Agendamento Online</h1>
          <p>Sistema de agendamento e gestão de consultas</p>
        </div>
        <div class="header-actions">
          <button @click="novoAgendamento" class="btn-primary">
            <i class="fas fa-plus"></i>
            Novo Agendamento
          </button>
          <button @click="exportarAgenda" class="btn-export">
            <i class="fas fa-file-excel"></i>
            Exportar
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros e Visualização -->
    <div class="filters-section">
      <div class="filters-header">
        <h3><i class="fas fa-filter"></i> Filtros e Visualização</h3>
        <div class="view-actions">
          <button @click="alternarVisualizacao" class="btn-toggle" :class="{ 'active': visualizacao === 'calendario' }">
            <i class="fas fa-calendar"></i>
            Calendário
          </button>
          <button @click="alternarVisualizacao" class="btn-toggle" :class="{ 'active': visualizacao === 'lista' }">
            <i class="fas fa-list"></i>
            Lista
          </button>
        </div>
      </div>
      <div class="filters-row">
        <div class="filter-group">
          <label>Período:</label>
          <select v-model="filtroPeriodo" @change="aplicarFiltros" class="filter-select">
            <option value="hoje">Hoje</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
            <option value="proximos">Próximos 7 dias</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="filtroStatus" @change="aplicarFiltros" class="filter-select">
            <option value="">Todos</option>
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Profissional:</label>
          <select v-model="filtroProfissional" @change="aplicarFiltros" class="filter-select">
            <option value="">Todos</option>
            <option v-for="prof in profissionais" :key="prof.id" :value="prof.id">
              {{ prof.nome }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Buscar:</label>
          <input v-model="filtroBusca" @input="aplicarFiltros" type="text" placeholder="Paciente ou procedimento..." class="filter-input">
        </div>
      </div>
    </div>

    <!-- Resumo de Agendamentos -->
    <div class="resumo-agendamentos">
      <div class="resumo-cards">
        <div class="resumo-card total">
          <div class="card-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="card-content">
            <h3>Total Hoje</h3>
            <span class="card-value">{{ agendamentosHoje.length }}</span>
            <p class="card-periodo">Agendamentos</p>
          </div>
        </div>
        
        <div class="resumo-card confirmados">
          <div class="card-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="card-content">
            <h3>Confirmados</h3>
            <span class="card-value">{{ agendamentosConfirmados.length }}</span>
            <p class="card-periodo">Hoje</p>
          </div>
        </div>
        
        <div class="resumo-card pendentes">
          <div class="card-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="card-content">
            <h3>Pendentes</h3>
            <span class="card-value">{{ agendamentosPendentes.length }}</span>
            <p class="card-periodo">Confirmação</p>
          </div>
        </div>
        
        <div class="resumo-card cancelados">
          <div class="card-icon">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="card-content">
            <h3>Cancelados</h3>
            <span class="card-value">{{ agendamentosCancelados.length }}</span>
            <p class="card-periodo">Hoje</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualização Calendário -->
    <div v-if="visualizacao === 'calendario'" class="calendario-section">
      <div class="calendario-header">
        <h3><i class="fas fa-calendar"></i> Calendário de Agendamentos</h3>
        <div class="calendario-navigation">
          <button @click="mesAnterior" class="btn-nav">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="mes-atual">{{ mesAtual }}</span>
          <button @click="proximoMes" class="btn-nav">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <div class="calendario-grid">
        <div class="calendario-dias-semana">
          <div v-for="dia in diasSemana" :key="dia" class="dia-semana">{{ dia }}</div>
        </div>
        <div class="calendario-dias">
          <div 
            v-for="dia in diasDoMes" 
            :key="dia.data" 
            class="dia-calendario"
            :class="{ 
              'outro-mes': !dia.pertenceAoMes,
              'hoje': dia.hoje,
              'selecionado': dia.selecionado
            }"
            @click="selecionarDia(dia)"
          >
            <span class="numero-dia">{{ dia.numero }}</span>
            <div class="agendamentos-dia">
              <div 
                v-for="agendamento in dia.agendamentos" 
                :key="agendamento.id"
                class="agendamento-mini"
                :class="agendamento.status"
                :title="`${agendamento.horario} - ${agendamento.paciente}`"
              >
                {{ agendamento.horario }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualização Lista -->
    <div v-if="visualizacao === 'lista'" class="lista-section">
      <div class="lista-header">
        <h3><i class="fas fa-list"></i> Lista de Agendamentos</h3>
        <div class="lista-actions">
          <button @click="atualizarLista" class="btn-refresh">
            <i class="fas fa-sync"></i>
            Atualizar
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Paciente</th>
              <th>Procedimento</th>
              <th>Profissional</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="agendamento in agendamentosFiltrados" :key="agendamento.id" class="table-row">
              <td>
                <div class="data-hora">
                  <span class="data">{{ formatarData(agendamento.data) }}</span>
                  <span class="hora">{{ agendamento.horario }}</span>
                </div>
              </td>
              <td>
                <div class="paciente-info">
                  <span class="nome">{{ agendamento.paciente }}</span>
                  <span class="telefone">{{ agendamento.telefone }}</span>
                </div>
              </td>
              <td>{{ agendamento.procedimento }}</td>
              <td>{{ agendamento.profissional }}</td>
              <td>
                <span class="status-badge" :class="agendamento.status">
                  {{ getStatusLabel(agendamento.status) }}
                </span>
              </td>
              <td class="currency-cell">{{ formatarMoeda(agendamento.valor) }}</td>
              <td class="actions-cell">
                <button @click="editarAgendamento(agendamento)" class="btn-icon" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmarAgendamento(agendamento)" class="btn-icon btn-success" title="Confirmar">
                  <i class="fas fa-check"></i>
                </button>
                <button @click="cancelarAgendamento(agendamento)" class="btn-icon btn-danger" title="Cancelar">
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Agendamento -->
    <div v-if="showModal" class="modal-overlay" @click="fecharModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modoEdicao ? 'Editar' : 'Novo' }} Agendamento</h3>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="salvarAgendamento" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Data *</label>
              <input v-model="form.data" type="date" required class="form-input">
            </div>
            <div class="form-group">
              <label>Horário *</label>
              <input v-model="form.horario" type="time" required class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Paciente *</label>
              <input v-model="form.paciente" type="text" required class="form-input" placeholder="Nome do paciente">
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input v-model="form.telefone" type="tel" class="form-input" placeholder="(11) 99999-9999">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Procedimento *</label>
              <select v-model="form.procedimento" required class="form-select">
                <option value="">Selecione o procedimento</option>
                <option v-for="proc in procedimentos" :key="proc.id" :value="proc.nome">
                  {{ proc.nome }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Profissional *</label>
              <select v-model="form.profissional" required class="form-select">
                <option value="">Selecione o profissional</option>
                <option v-for="prof in profissionais" :key="prof.id" :value="prof.nome">
                  {{ prof.nome }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor (R$)</label>
              <input v-model.number="form.valor" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status" class="form-select">
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="form.observacoes" class="form-textarea" rows="3" placeholder="Observações adicionais..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="fecharModal" class="btn-secondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              <i class="fas fa-save"></i>
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useClinica } from '../composables/useClinica'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, doc } from 'firebase/firestore'

const { isAuthenticated } = useAuth()
const { clinicaId } = useClinica()

// Estado
const agendamentos = ref([])
const profissionais = ref([])
const procedimentos = ref([])
const loading = ref(false)
const showModal = ref(false)
const modoEdicao = ref(false)
const visualizacao = ref('calendario')
const filtroPeriodo = ref('hoje')
const filtroStatus = ref('')
const filtroProfissional = ref('')
const filtroBusca = ref('')
const mesAtual = ref('')
const diaSelecionado = ref(null)

// Formulário
const form = ref({
  id: null,
  data: new Date().toISOString().split('T')[0],
  horario: '09:00',
  paciente: '',
  telefone: '',
  procedimento: '',
  profissional: '',
  valor: 0,
  status: 'agendado',
  observacoes: ''
})

// Computed
const agendamentosFiltrados = computed(() => {
  let filtrados = agendamentos.value

  // Filtro por período
  const agora = new Date()
  const inicio = new Date()
  
  switch (filtroPeriodo.value) {
    case 'hoje':
      inicio.setHours(0, 0, 0, 0)
      const fimHoje = new Date(inicio)
      fimHoje.setHours(23, 59, 59, 999)
      filtrados = filtrados.filter(a => {
        const dataAgendamento = new Date(a.data)
        return dataAgendamento >= inicio && dataAgendamento <= fimHoje
      })
      break
    case 'semana':
      inicio.setDate(agora.getDate() - 7)
      break
    case 'mes':
      inicio.setMonth(agora.getMonth() - 1)
      break
    case 'proximos':
      inicio.setDate(agora.getDate() + 1)
      const fimProximos = new Date(inicio)
      fimProximos.setDate(fimProximos.getDate() + 7)
      filtrados = filtrados.filter(a => {
        const dataAgendamento = new Date(a.data)
        return dataAgendamento >= inicio && dataAgendamento <= fimProximos
      })
      break
  }

  // Filtro por status
  if (filtroStatus.value) {
    filtrados = filtrados.filter(a => a.status === filtroStatus.value)
  }

  // Filtro por profissional
  if (filtroProfissional.value) {
    filtrados = filtrados.filter(a => a.profissionalId === filtroProfissional.value)
  }

  // Filtro por busca
  if (filtroBusca.value) {
    filtrados = filtrados.filter(a => 
      a.paciente.toLowerCase().includes(filtroBusca.value.toLowerCase()) ||
      a.procedimento.toLowerCase().includes(filtroBusca.value.toLowerCase())
    )
  }

  return filtrados.sort((a, b) => new Date(a.data + ' ' + a.horario) - new Date(b.data + ' ' + b.horario))
})

const agendamentosHoje = computed(() => {
  const hoje = new Date().toISOString().split('T')[0]
  return agendamentos.value.filter(a => a.data === hoje)
})

const agendamentosConfirmados = computed(() => {
  return agendamentosHoje.value.filter(a => a.status === 'confirmado')
})

const agendamentosPendentes = computed(() => {
  return agendamentosHoje.value.filter(a => a.status === 'agendado')
})

const agendamentosCancelados = computed(() => {
  return agendamentosHoje.value.filter(a => a.status === 'cancelado')
})

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const diasDoMes = computed(() => {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()
  
  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0)
  const diasNoMes = ultimoDia.getDate()
  
  const dias = []
  
  // Dias do mês anterior
  const primeiroDiaSemana = primeiroDia.getDay()
  for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
    const data = new Date(ano, mes, -i)
    dias.push({
      numero: data.getDate(),
      data: data.toISOString().split('T')[0],
      pertenceAoMes: false,
      hoje: false,
      selecionado: false,
      agendamentos: []
    })
  }
  
  // Dias do mês atual
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const data = new Date(ano, mes, dia)
    const dataStr = data.toISOString().split('T')[0]
    const agendamentosDia = agendamentos.value.filter(a => a.data === dataStr)
    
    dias.push({
      numero: dia,
      data: dataStr,
      pertenceAoMes: true,
      hoje: dataStr === hoje.toISOString().split('T')[0],
      selecionado: diaSelecionado.value === dataStr,
      agendamentos: agendamentosDia
    })
  }
  
  // Dias do próximo mês para completar a grade
  const diasRestantes = 42 - dias.length
  for (let dia = 1; dia <= diasRestantes; dia++) {
    const data = new Date(ano, mes + 1, dia)
    dias.push({
      numero: dia,
      data: data.toISOString().split('T')[0],
      pertenceAoMes: false,
      hoje: false,
      selecionado: false,
      agendamentos: []
    })
  }
  
  return dias
})

// Métodos
const carregarAgendamentos = async () => {
  try {
    loading.value = true
    if (!clinicaId.value) return

    const q = query(
      collection(db, 'agendamentos'),
      where('clinicaId', '==', clinicaId.value),
      orderBy('data', 'desc')
    )

    const querySnapshot = await getDocs(q)
    agendamentos.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    atualizarMesAtual()
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error)
  } finally {
    loading.value = false
  }
}

const carregarProfissionais = async () => {
  try {
    if (!clinicaId.value) return

    const q = query(
      collection(db, 'profissionais'),
      where('clinicaId', '==', clinicaId.value),
      where('ativo', '==', true)
    )

    const querySnapshot = await getDocs(q)
    profissionais.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error)
  }
}

const carregarProcedimentos = async () => {
  try {
    if (!clinicaId.value) return

    const q = query(
      collection(db, 'catalogo_procedimentos'),
      where('clinicaId', '==', clinicaId.value)
    )

    const querySnapshot = await getDocs(q)
    procedimentos.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erro ao carregar procedimentos:', error)
  }
}

const novoAgendamento = () => {
  modoEdicao.value = false
  form.value = {
    id: null,
    data: new Date().toISOString().split('T')[0],
    horario: '09:00',
    paciente: '',
    telefone: '',
    procedimento: '',
    profissional: '',
    valor: 0,
    status: 'agendado',
    observacoes: ''
  }
  showModal.value = true
}

const editarAgendamento = (agendamento) => {
  modoEdicao.value = true
  form.value = {
    id: agendamento.id,
    data: agendamento.data,
    horario: agendamento.horario,
    paciente: agendamento.paciente,
    telefone: agendamento.telefone,
    procedimento: agendamento.procedimento,
    profissional: agendamento.profissional,
    valor: agendamento.valor,
    status: agendamento.status,
    observacoes: agendamento.observacoes || ''
  }
  showModal.value = true
}

const salvarAgendamento = async () => {
  try {
    loading.value = true
    
    const dadosParaSalvar = {
      ...form.value,
      clinicaId: clinicaId.value,
      dataCriacao: new Date(),
      ativo: true
    }

    if (form.value.id) {
      await updateDoc(doc(db, 'agendamentos', form.value.id), dadosParaSalvar)
      showSuccess('Agendamento atualizado com sucesso!')
    } else {
      await addDoc(collection(db, 'agendamentos'), dadosParaSalvar)
      showSuccess('Agendamento salvo com sucesso!')
    }

    await carregarAgendamentos()
    fecharModal()
  } catch (error) {
    console.error('Erro ao salvar agendamento:', error)
    showError('Erro ao salvar agendamento: ' + error.message)
  } finally {
    loading.value = false
  }
}

const confirmarAgendamento = async (agendamento) => {
  try {
    await updateDoc(doc(db, 'agendamentos', agendamento.id), { status: 'confirmado' })
    showSuccess('Agendamento confirmado!')
    await carregarAgendamentos()
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error)
    showError('Erro ao confirmar agendamento')
  }
}

const cancelarAgendamento = async (agendamento) => {
  if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
    try {
      await updateDoc(doc(db, 'agendamentos', agendamento.id), { status: 'cancelado' })
      showSuccess('Agendamento cancelado!')
      await carregarAgendamentos()
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      showError('Erro ao cancelar agendamento')
    }
  }
}

const fecharModal = () => {
  showModal.value = false
  modoEdicao.value = false
}

const alternarVisualizacao = (tipo) => {
  visualizacao.value = tipo
}

const aplicarFiltros = () => {
  // Os filtros são aplicados automaticamente via computed
}

const selecionarDia = (dia) => {
  diaSelecionado.value = dia.data
  // Aqui você pode implementar lógica adicional para mostrar detalhes do dia
}

const mesAnterior = () => {
  // Implementar navegação de mês
}

const proximoMes = () => {
  // Implementar navegação de mês
}

const atualizarMesAtual = () => {
  const hoje = new Date()
  mesAtual.value = hoje.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  })
}

const atualizarLista = () => {
  carregarAgendamentos()
}

const exportarAgenda = () => {
  showSuccess('Funcionalidade de exportação será implementada em breve!')
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

const formatarData = (data) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
}

const getStatusLabel = (status) => {
  const labels = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    realizado: 'Realizado',
    cancelado: 'Cancelado'
  }
  return labels[status] || status
}

const showSuccess = (message) => {
  console.log('✅', message)
  alert(message)
}

const showError = (message) => {
  console.log('❌', message)
  alert(message)
}

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    carregarAgendamentos()
    carregarProfissionais()
    carregarProcedimentos()
  }
})
</script>

<style scoped>
.agendamento-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #059669;
  transform: translateY(-1px);
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filters-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-actions {
  display: flex;
  gap: 8px;
}

.btn-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle:hover {
  background: #e5e7eb;
}

.btn-toggle.active {
  background: #3b82f6;
  color: white;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.resumo-agendamentos {
  margin-bottom: 24px;
}

.resumo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.resumo-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
}

.resumo-card.total {
  border-left: 4px solid #3b82f6;
}

.resumo-card.confirmados {
  border-left: 4px solid #10b981;
}

.resumo-card.pendentes {
  border-left: 4px solid #f59e0b;
}

.resumo-card.cancelados {
  border-left: 4px solid #ef4444;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.total .card-icon {
  background: #3b82f6;
}

.confirmados .card-icon {
  background: #10b981;
}

.pendentes .card-icon {
  background: #f59e0b;
}

.cancelados .card-icon {
  background: #ef4444;
}

.card-content h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  display: block;
  margin-bottom: 4px;
}

.card-periodo {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.calendario-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.calendario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendario-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.calendario-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-nav {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-nav:hover {
  background: #e5e7eb;
}

.mes-atual {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  text-transform: capitalize;
}

.calendario-grid {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.calendario-dias-semana {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f9fafb;
}

.dia-semana {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-right: 1px solid #e5e7eb;
}

.dia-semana:last-child {
  border-right: none;
}

.calendario-dias {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.dia-calendario {
  min-height: 100px;
  padding: 8px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.dia-calendario:hover {
  background: #f9fafb;
}

.dia-calendario.outro-mes {
  background: #f9fafb;
  color: #9ca3af;
}

.dia-calendario.hoje {
  background: #dbeafe;
  color: #1e40af;
}

.dia-calendario.selecionado {
  background: #3b82f6;
  color: white;
}

.numero-dia {
  font-weight: 600;
  font-size: 14px;
}

.agendamentos-dia {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agendamento-mini {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 3px;
  background: #e5e7eb;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agendamento-mini.agendado {
  background: #fef3c7;
  color: #92400e;
}

.agendamento-mini.confirmado {
  background: #dcfce7;
  color: #166534;
}

.agendamento-mini.realizado {
  background: #dbeafe;
  color: #1e40af;
}

.agendamento-mini.cancelado {
  background: #fee2e2;
  color: #991b1b;
}

.lista-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.lista-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.lista-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #e5e7eb;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f9fafb;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.table-row:hover {
  background: #f9fafb;
}

.data-hora {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.data {
  font-weight: 600;
  color: #1d1d1f;
}

.hora {
  font-size: 12px;
  color: #6b7280;
}

.paciente-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nome {
  font-weight: 600;
  color: #1d1d1f;
}

.telefone {
  font-size: 12px;
  color: #6b7280;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.agendado {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.confirmado {
  background: #dcfce7;
  color: #166534;
}

.status-badge.realizado {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.cancelado {
  background: #fee2e2;
  color: #991b1b;
}

.currency-cell {
  font-weight: 600;
  text-align: right;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f3f4f6;
  color: #6b7280;
}

.btn-icon:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn-icon.btn-success:hover {
  background: #dcfce7;
  color: #166534;
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
}

.modal-form {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .resumo-cards {
    grid-template-columns: 1fr;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .calendario-dias {
    font-size: 12px;
  }
  
  .dia-calendario {
    min-height: 80px;
  }
}
</style>
