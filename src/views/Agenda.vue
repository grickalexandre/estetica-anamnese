<template>
  <div class="container agenda-container">
    <div class="page-header">
      <h1><i class="fas fa-calendar-alt"></i> Agenda</h1>
      <div class="header-actions">
        <router-link to="/registrar-atendimento" class="btn btn-success">
          <i class="fas fa-user-md"></i>
          Registrar Atendimento
        </router-link>
        <button @click="abrirModalNovo" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Novo Agendamento
        </button>
      </div>
    </div>

    <!-- Modal Pesquisa Paciente -->
    <div v-if="modalPesquisaPaciente" class="modal-overlay" @click.self="fecharModalPesquisaPaciente">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-users"></i> Pesquisar Paciente</h2>
          <button @click="fecharModalPesquisaPaciente" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent>
          <div class="form-group">
            <label>Buscar</label>
            <input v-model="termoPaciente" type="text" placeholder="Nome, telefone ou CPF">
          </div>
          <div class="lista-resultados">
            <div v-for="pac in pacientesFiltrados" :key="pac.id" class="resultado-item" @click="aplicarSelecaoPaciente(pac)">
              <div class="avatar"><i class="fas fa-user"></i></div>
              <div class="info">
                <div class="titulo">{{ pac.nome }}</div>
                <div class="sub">{{ pac.telefone }} • {{ pac.cpf || 'sem CPF' }}</div>
              </div>
              <div class="acao">Selecionar</div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="fecharModalPesquisaPaciente">Fechar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Pesquisa Profissional -->
    <div v-if="modalPesquisaProfissional" class="modal-overlay" @click.self="fecharModalPesquisaProfissional">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-user-md"></i> Pesquisar Profissional</h2>
          <button @click="fecharModalPesquisaProfissional" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent>
          <div class="form-group">
            <label>Buscar</label>
            <input v-model="termoProfissional" type="text" placeholder="Nome ou especialidade">
          </div>
          <div class="lista-resultados">
            <div v-for="prof in profissionaisFiltrados" :key="prof.id" class="resultado-item" @click="aplicarSelecaoProfissional(prof)">
              <div class="avatar"><i class="fas fa-user-md"></i></div>
              <div class="info">
                <div class="titulo">{{ prof.nome }}</div>
                <div class="sub">{{ prof.especialidade || 'Profissional' }}</div>
              </div>
              <div class="acao">Selecionar</div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="fecharModalPesquisaProfissional">Fechar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Pesquisa Procedimento -->
    <div v-if="modalPesquisaProcedimento" class="modal-overlay" @click.self="fecharModalPesquisaProcedimento">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-spa"></i> Pesquisar Procedimento</h2>
          <button @click="fecharModalPesquisaProcedimento" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent>
          <div class="form-group">
            <label>Buscar</label>
            <input v-model="termoProc" type="text" placeholder="Nome ou categoria">
          </div>
          <div class="lista-resultados">
            <div v-for="proc in procedimentosFiltradosModal" :key="proc.id" class="resultado-item" @click="aplicarSelecaoProced(proc)">
              <div class="avatar"><i class="fas fa-spa"></i></div>
              <div class="info">
                <div class="titulo">{{ proc.nome }}</div>
                <div class="sub">{{ proc.categoria || 'Procedimento' }} • R$ {{ new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(proc.valor || 0) }}</div>
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

    <!-- Filtros e Visualização -->
    <div class="card toolbar">
      <div class="view-selector">
        <button @click="visualizacao = 'dia'" :class="['view-btn', { active: visualizacao === 'dia' }]">Dia</button>
        <button @click="visualizacao = 'semana'" :class="['view-btn', { active: visualizacao === 'semana' }]">Semana</button>
        <button @click="visualizacao = 'mes'" :class="['view-btn', { active: visualizacao === 'mes' }]">Mês</button>
      </div>
      <div class="date-navigator">
        <button @click="navegarData(-1)" class="btn-nav"><i class="fas fa-chevron-left"></i></button>
        <input type="date" v-model="dataAtual" class="date-input">
        <button @click="navegarData(1)" class="btn-nav"><i class="fas fa-chevron-right"></i></button>
        <button @click="irHoje" class="btn btn-secondary">Hoje</button>
      </div>
    </div>

    <!-- Calendário -->
    <div class="card calendario-card">
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando agenda...
      </div>
      <div v-else class="calendario-grid" :class="'view-' + visualizacao">
        <!-- Visualização será renderizada aqui -->
        <div v-if="visualizacao === 'dia'" class="dia-view">
          <div class="horarios-coluna">
            <div v-for="hora in horariosTrabalho" :key="hora" class="hora-slot">
              <div class="hora-label">{{ hora }}</div>
              <div class="slot-content">
                <div 
                  v-for="agend in agendamentosPorHora(hora)" 
                  :key="agend.id"
                  @click="editarAgendamento(agend)"
                  :class="['agendamento-item', 'status-' + agend.status]"
                >
                  <div class="agend-hora">{{ formatarHora(agend.dataHora) }}</div>
                  <div class="agend-nome"><strong>{{ agend.pacienteNome }}</strong></div>
                  <div class="agend-procedimento">{{ agend.procedimento }}</div>
                  <div class="agend-profissional">{{ agend.profissional }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="visualizacao === 'semana'" class="semana-view">
          <div class="semana-grid">
            <div class="horario-header"></div>
            <div v-for="dia in diasSemana" :key="dia.data" class="dia-header">
              <div class="dia-nome">{{ dia.nome }}</div>
              <div class="dia-data">{{ dia.dataFormatada }}</div>
            </div>
            <template v-for="hora in horariosTrabalho" :key="'h-' + hora">
              <div class="horario-label">{{ hora }}</div>
              <div v-for="dia in diasSemana" :key="dia.data + '-' + hora" class="hora-cell">
                <div 
                  v-for="agend in agendamentosPorDiaHora(dia.data, hora)" 
                  :key="agend.id"
                  @click="editarAgendamento(agend)"
                  :class="['agendamento-mini', 'status-' + agend.status]"
                >
                  {{ agend.pacienteNome }}
                </div>
              </div>
            </template>
          </div>
        </div>
        
        <div v-else class="mes-view">
          <div class="mes-grid">
            <div v-for="dia in diasMes" :key="dia.data" :class="['dia-cell', { 'hoje': dia.isHoje, 'outro-mes': !dia.mesAtual }]">
              <div class="dia-numero">{{ dia.numero }}</div>
              <div class="dia-agendamentos">
                <div 
                  v-for="agend in agendamentosPorDia(dia.data)" 
                  :key="agend.id"
                  @click="editarAgendamento(agend)"
                  :class="['agend-badge', 'status-' + agend.status]"
                >
                  {{ formatarHora(agend.dataHora) }} - {{ agend.pacienteNome }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card confirmados">
        <i class="fas fa-check-circle"></i>
        <div>
          <span class="stat-label">Confirmados</span>
          <span class="stat-value">{{ estatisticas.confirmados }}</span>
        </div>
      </div>
      <div class="stat-card realizados">
        <i class="fas fa-check-double"></i>
        <div>
          <span class="stat-label">Realizados</span>
          <span class="stat-value">{{ estatisticas.realizados }}</span>
        </div>
      </div>
      <div class="stat-card cancelados">
        <i class="fas fa-times-circle"></i>
        <div>
          <span class="stat-label">Cancelados</span>
          <span class="stat-value">{{ estatisticas.cancelados }}</span>
        </div>
      </div>
      <div class="stat-card taxa">
        <i class="fas fa-percentage"></i>
        <div>
          <span class="stat-label">Taxa Comparecimento</span>
          <span class="stat-value">{{ estatisticas.taxaComparecimento.toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <!-- Modal Novo/Editar -->
    <div v-if="modalAgendamento" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-calendar-plus"></i> {{ agendamentoEditando ? 'Editar' : 'Novo' }} Agendamento</h2>
          <button @click="fecharModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="salvarAgendamento">
          <div class="form-group">
            <label>Paciente *</label>
            <input v-model="formulario.pacienteNome" type="text" required placeholder="Nome do paciente">
            <div style="margin-top: 8px;">
              <button type="button" class="btn btn-secondary btn-small" @click="abrirModalPesquisaPaciente">
                <i class="fas fa-search"></i> Pesquisar Paciente
              </button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Telefone *</label>
              <input v-model="formulario.pacienteTelefone" type="tel" required placeholder="(00) 00000-0000">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="formulario.pacienteEmail" type="email" placeholder="email@exemplo.com">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Data *</label>
              <input v-model="formulario.data" type="date" required>
            </div>
            <div class="form-group">
              <label>Horário *</label>
              <input v-model="formulario.hora" type="time" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Profissional *</label>
              <input v-model="formulario.profissional" type="text" required placeholder="Nome do profissional">
              <div style="margin-top: 8px;">
                <button type="button" class="btn btn-secondary btn-small" @click="abrirModalPesquisaProfissional">
                  <i class="fas fa-search"></i> Pesquisar Profissional
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Duração (min)</label>
              <input v-model.number="formulario.duracao" type="number" placeholder="60">
            </div>
          </div>
          <div class="form-group">
            <label>Procedimento *</label>
            <input v-model="formulario.procedimento" type="text" required placeholder="Ex: Limpeza de Pele">
            <div style="margin-top: 8px;">
              <button type="button" class="btn btn-secondary btn-small" @click="abrirModalPesquisaProcedimento">
                <i class="fas fa-search"></i> Pesquisar Procedimento
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Valor Estimado</label>
            <input v-model.number="formulario.valorEstimado" type="number" step="0.01" placeholder="0,00">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="formulario.status">
              <option value="aguardando">Aguardando Confirmação</option>
              <option value="confirmado">Confirmado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="formulario.observacoes" rows="3" placeholder="Informações adicionais..."></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
            <button v-if="agendamentoEditando" type="button" @click="cancelarAgendamentoAtual" class="btn btn-danger">
              <i class="fas fa-ban"></i> Cancelar Agendamento
            </button>
            <button type="submit" class="btn btn-primary" :disabled="salvando">
              <i class="fas fa-save"></i> {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAgendamento } from '../composables/useAgendamento.js'
import { useClinica } from '../composables/useClinica.js'
import { useProfissionais } from '../composables/useProfissionais.js'
import { useProcedimentos } from '../composables/useProcedimentos.js'
import { usePacientes } from '../composables/usePacientes.js'

const { clinicaId, inicializarClinica } = useClinica()
const { 
  agendamentos, 
  carregando, 
  estatisticas,
  buscarAgendamentos, 
  criarAgendamento, 
  atualizarAgendamento,
  cancelarAgendamento 
} = useAgendamento()
const { clientes, buscarClientes } = usePacientes()
const { profissionais, buscarProfissionais } = useProfissionais()
const { procedimentos } = useProcedimentos()

const visualizacao = ref('semana')
const dataAtual = ref(new Date().toISOString().split('T')[0])
const modalAgendamento = ref(false)
const salvando = ref(false)
const agendamentoEditando = ref(null)

const formulario = ref({
  // Paciente
  clienteId: '',
  pacienteNome: '',
  pacienteTelefone: '',
  pacienteEmail: '',
  // Data/Hora
  data: new Date().toISOString().split('T')[0],
  hora: '09:00',
  // Profissional
  profissionalId: '',
  profissional: '', // label para exibição (retrocompatibilidade)
  // Procedimento
  procedimentoId: '',
  procedimento: '', // label
  duracao: 60,
  valorEstimado: 0,
  status: 'confirmado',
  observacoes: ''
})

const horariosTrabalho = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

onMounted(async () => {
  console.log('=== CARREGANDO AGENDA ===')
  
  try {
    // 1. Inicializar clínica primeiro
    console.log('--- Inicializando clínica ---')
    await inicializarClinica()
    console.log('clinicaId após inicialização:', clinicaId.value)
    
    // 2. Buscar pacientes e agendamentos
    await buscarClientes()
    console.log('--- Buscando agendamentos ---')
    const inicio = new Date(dataAtual.value)
    inicio.setDate(inicio.getDate() - 30)
    const fim = new Date(dataAtual.value)
    fim.setDate(fim.getDate() + 30)
    
    console.log('Período de busca:', inicio.toISOString().split('T')[0], 'até', fim.toISOString().split('T')[0])
    await buscarAgendamentos(inicio.toISOString().split('T')[0], fim.toISOString().split('T')[0])
    console.log('=== CARREGAMENTO DA AGENDA CONCLUÍDO ===')
  } catch (error) {
    console.error('❌ ERRO NO CARREGAMENTO DA AGENDA:', error)
    console.error('Tipo do erro:', error.name)
    console.error('Mensagem:', error.message)
    console.error('Stack:', error.stack)
  }
})

const diasSemana = computed(() => {
  const data = new Date(dataAtual.value)
  const diaSemana = data.getDay()
  const dias = []
  
  for (let i = 0; i < 7; i++) {
    const dia = new Date(data)
    dia.setDate(data.getDate() - diaSemana + i)
    dias.push({
      data: dia.toISOString().split('T')[0],
      nome: dia.toLocaleDateString('pt-BR', { weekday: 'short' }),
      dataFormatada: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    })
  }
  
  return dias
})

const diasMes = computed(() => {
  const data = new Date(dataAtual.value)
  const ano = data.getFullYear()
  const mes = data.getMonth()
  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0)
  const diasAnteriores = primeiroDia.getDay()
  const dias = []
  
  for (let i = diasAnteriores; i > 0; i--) {
    const dia = new Date(ano, mes, -i + 1)
    dias.push({
      data: dia.toISOString().split('T')[0],
      numero: dia.getDate(),
      mesAtual: false,
      isHoje: false
    })
  }
  
  for (let i = 1; i <= ultimoDia.getDate(); i++) {
    const dia = new Date(ano, mes, i)
    const hoje = new Date()
    dias.push({
      data: dia.toISOString().split('T')[0],
      numero: i,
      mesAtual: true,
      isHoje: dia.toDateString() === hoje.toDateString()
    })
  }
  
  return dias
})

const agendamentosPorHora = (hora) => {
  const data = dataAtual.value
  return agendamentos.value.filter(a => {
    const agendData = a.dataHora?.toDate ? a.dataHora.toDate() : new Date(a.dataHora)
    const agendHora = agendData.toTimeString().slice(0, 5)
    return agendData.toISOString().split('T')[0] === data && agendHora === hora
  })
}

const agendamentosPorDia = (data) => {
  return agendamentos.value.filter(a => {
    const agendData = a.dataHora?.toDate ? a.dataHora.toDate() : new Date(a.dataHora)
    return agendData.toISOString().split('T')[0] === data
  }).sort((a, b) => {
    const dataA = a.dataHora?.toDate ? a.dataHora.toDate() : new Date(a.dataHora)
    const dataB = b.dataHora?.toDate ? b.dataHora.toDate() : new Date(b.dataHora)
    return dataA - dataB
  })
}

const agendamentosPorDiaHora = (data, hora) => {
  return agendamentos.value.filter(a => {
    const agendData = a.dataHora?.toDate ? a.dataHora.toDate() : new Date(a.dataHora)
    const agendHora = agendData.toTimeString().slice(0, 5)
    return agendData.toISOString().split('T')[0] === data && agendHora === hora
  })
}

const abrirModalNovo = () => {
  modalAgendamento.value = true
  agendamentoEditando.value = null
  formulario.value = {
    clienteId: '',
    pacienteNome: '',
    pacienteTelefone: '',
    pacienteEmail: '',
    data: dataAtual.value,
    hora: '09:00',
    profissionalId: '',
    profissional: '',
    procedimentoId: '',
    procedimento: '',
    duracao: 60,
    valorEstimado: 0,
    status: 'confirmado',
    observacoes: ''
  }
}

const editarAgendamento = (agend) => {
  modalAgendamento.value = true
  agendamentoEditando.value = agend
  const data = agend.dataHora?.toDate ? agend.dataHora.toDate() : new Date(agend.dataHora)
  formulario.value = {
    clienteId: agend.clienteId || '',
    pacienteNome: agend.pacienteNome,
    pacienteTelefone: agend.pacienteTelefone,
    pacienteEmail: agend.pacienteEmail || '',
    data: data.toISOString().split('T')[0],
    hora: data.toTimeString().slice(0, 5),
    profissionalId: agend.profissionalId || '',
    profissional: agend.profissional,
    procedimentoId: agend.procedimentoId || '',
    procedimento: agend.procedimento,
    duracao: agend.duracao || 60,
    valorEstimado: agend.valorEstimado || 0,
    status: agend.status,
    observacoes: agend.observacoes || ''
  }
}

const salvarAgendamento = async () => {
  try {
    salvando.value = true
    const dataHora = `${formulario.value.data}T${formulario.value.hora}:00`
    
    const dados = {
      // Paciente
      clienteId: formulario.value.clienteId,
      clienteNome: formulario.value.pacienteNome,
      pacienteNome: formulario.value.pacienteNome, // retrocompatibilidade
      pacienteTelefone: formulario.value.pacienteTelefone,
      pacienteEmail: formulario.value.pacienteEmail,
      // Data/Hora
      dataHora,
      // Profissional
      profissionalId: formulario.value.profissionalId,
      profissional: formulario.value.profissional,
      // Procedimento
      procedimentoId: formulario.value.procedimentoId,
      procedimento: formulario.value.procedimento,
      duracao: formulario.value.duracao,
      valorEstimado: formulario.value.valorEstimado,
      status: formulario.value.status,
      observacoes: formulario.value.observacoes
    }
    
    if (agendamentoEditando.value) {
      await atualizarAgendamento(agendamentoEditando.value.id, dados)
    } else {
      await criarAgendamento(dados)
    }
    
    await buscarAgendamentos(dataAtual.value, dataAtual.value)
    fecharModal()
    alert('Agendamento salvo com sucesso!')
  } catch (err) {
    alert('Erro ao salvar agendamento')
  } finally {
    salvando.value = false
  }
}

const cancelarAgendamentoAtual = async () => {
  if (!confirm('Deseja cancelar este agendamento?')) return
  
  const motivo = prompt('Motivo do cancelamento (opcional):')
  await cancelarAgendamento(agendamentoEditando.value.id, motivo)
  await buscarAgendamentos(dataAtual.value, dataAtual.value)
  fecharModal()
}

const fecharModal = () => {
  modalAgendamento.value = false
}

// ===== Pesquisa de Paciente (modal leve usando lista carregada) =====
const modalPesquisaPaciente = ref(false)
const termoPaciente = ref('')
const pacientesFiltrados = computed(() => {
  const t = termoPaciente.value.toLowerCase().trim()
  if (!t) return clientes.value
  return clientes.value.filter(c =>
    (c.nome || '').toLowerCase().includes(t) ||
    (c.telefone || '').toLowerCase().includes(t) ||
    (c.cpf || '').toLowerCase().includes(t)
  )
})
const abrirModalPesquisaPaciente = () => {
  termoPaciente.value = ''
  modalPesquisaPaciente.value = true
}
const fecharModalPesquisaPaciente = () => {
  modalPesquisaPaciente.value = false
}
const aplicarSelecaoPaciente = (pac) => {
  formulario.value.clienteId = pac.id
  formulario.value.pacienteNome = pac.nome
  formulario.value.pacienteTelefone = pac.telefone || ''
  formulario.value.pacienteEmail = pac.email || ''
  fecharModalPesquisaPaciente()
}

// ===== Pesquisa de Profissional =====
const modalPesquisaProfissional = ref(false)
const termoProfissional = ref('')
const profissionaisFiltrados = computed(() => {
  const t = termoProfissional.value.toLowerCase().trim()
  if (!t) return profissionais.value
  return profissionais.value.filter(p =>
    (p.nome || '').toLowerCase().includes(t) ||
    (p.especialidade || '').toLowerCase().includes(t)
  )
})
const abrirModalPesquisaProfissional = () => {
  termoProfissional.value = ''
  modalPesquisaProfissional.value = true
}
const fecharModalPesquisaProfissional = () => {
  modalPesquisaProfissional.value = false
}
const aplicarSelecaoProfissional = (prof) => {
  formulario.value.profissionalId = prof.id
  formulario.value.profissional = prof.nome
  fecharModalPesquisaProfissional()
}

// ===== Pesquisa de Procedimento =====
const modalPesquisaProcedimento = ref(false)
const termoProc = ref('')
const procedimentosFiltradosModal = computed(() => {
  const t = termoProc.value.toLowerCase().trim()
  if (!t) return procedimentos.value
  return procedimentos.value.filter(p =>
    (p.nome || '').toLowerCase().includes(t) ||
    (p.categoria || '').toLowerCase().includes(t)
  )
})
const abrirModalPesquisaProcedimento = () => {
  termoProc.value = ''
  modalPesquisaProcedimento.value = true
}
const fecharModalPesquisaProcedimento = () => {
  modalPesquisaProcedimento.value = false
}
const aplicarSelecaoProced = (proc) => {
  formulario.value.procedimentoId = proc.id
  formulario.value.procedimento = proc.nome
  formulario.value.duracao = proc.duracao || formulario.value.duracao
  formulario.value.valorEstimado = proc.valor || formulario.value.valorEstimado
  fecharModalPesquisaProcedimento()
}

const navegarData = (direcao) => {
  const data = new Date(dataAtual.value)
  if (visualizacao.value === 'dia') {
    data.setDate(data.getDate() + direcao)
  } else if (visualizacao.value === 'semana') {
    data.setDate(data.getDate() + (direcao * 7))
  } else {
    data.setMonth(data.getMonth() + direcao)
  }
  dataAtual.value = data.toISOString().split('T')[0]
}

const irHoje = () => {
  dataAtual.value = new Date().toISOString().split('T')[0]
}

const formatarHora = (dataHora) => {
  const data = dataHora?.toDate ? dataHora.toDate() : new Date(dataHora)
  return data.toTimeString().slice(0, 5)
}
</script>

<style scoped>
.agenda-container { max-width: 1600px; margin: 0 auto; padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; }
.header-actions { display: flex; gap: 12px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px; }
.view-selector { display: flex; gap: 8px; }
.view-btn { padding: 8px 16px; border: 1px solid #d2d2d7; background: white; border-radius: 8px; cursor: pointer; }
.view-btn.active { background: #1d1d1f; color: white; }
.date-navigator { display: flex; gap: 12px; align-items: center; }
.btn-nav { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #d2d2d7; background: white; cursor: pointer; }
.date-input { padding: 8px 12px; border: 1px solid #d2d2d7; border-radius: 8px; }
.calendario-card { min-height: 600px; }
.dia-view { padding: 20px; }
.horarios-coluna { display: flex; flex-direction: column; gap: 1px; }
.hora-slot { display: grid; grid-template-columns: 80px 1fr; min-height: 60px; border-bottom: 1px solid #e5e5ea; }
.hora-label { padding: 8px; color: #6e6e73; font-weight: 600; }
.slot-content { padding: 8px; display: flex; flex-direction: column; gap: 8px; }
.agendamento-item { padding: 12px; border-radius: 8px; cursor: pointer; border-left: 4px solid; }
.agendamento-item.status-confirmado { background: rgba(102, 126, 234, 0.1); border-left-color: #667eea; }
.agendamento-item.status-realizado { background: rgba(52, 199, 89, 0.1); border-left-color: #34c759; }
.agendamento-item.status-cancelado { background: rgba(255, 59, 48, 0.1); border-left-color: #ff3b30; }
.agendamento-item.status-aguardando { background: rgba(255, 159, 10, 0.1); border-left-color: #ff9f0a; }
.agend-hora { font-size: 12px; color: #6e6e73; }
.agend-nome { font-size: 15px; margin: 4px 0; }
.agend-procedimento { font-size: 13px; color: #6e6e73; }
.agend-profissional { font-size: 12px; color: #86868b; }
.semana-view { padding: 20px; overflow-x: auto; }
.semana-grid { display: grid; grid-template-columns: 60px repeat(7, 1fr); gap: 1px; background: #e5e5ea; }
.dia-header { background: #f5f5f7; padding: 12px; text-align: center; }
.dia-nome { font-weight: 700; text-transform: uppercase; }
.dia-data { font-size: 13px; color: #6e6e73; }
.horario-label { background: #f5f5f7; padding: 8px; text-align: center; font-size: 12px; color: #6e6e73; }
.hora-cell { background: white; padding: 4px; min-height: 60px; }
.agendamento-mini { padding: 4px 6px; border-radius: 4px; font-size: 11px; cursor: pointer; margin-bottom: 2px; }
.mes-view { padding: 20px; }
.mes-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #e5e5ea; }
.dia-cell { background: white; min-height: 100px; padding: 8px; }
.dia-cell.hoje { background: rgba(102, 126, 234, 0.05); }
.dia-cell.outro-mes { opacity: 0.5; }
.dia-numero { font-weight: 700; margin-bottom: 4px; }
.agend-badge { padding: 4px; border-radius: 4px; font-size: 11px; margin-bottom: 2px; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
.stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 12px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.stat-card i { font-size: 32px; }
.stat-card.confirmados i { color: #667eea; }
.stat-card.realizados i { color: #34c759; }
.stat-card.cancelados i { color: #ff3b30; }
.stat-card.taxa i { color: #ff9f0a; }
.stat-label { display: block; font-size: 13px; color: #6e6e73; margin-bottom: 4px; }
.stat-value { display: block; font-size: 24px; font-weight: 700; color: #1d1d1f; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid #e5e5ea; }
.modal-header h2 { font-size: 20px; display: flex; align-items: center; gap: 10px; }
.btn-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f7; cursor: pointer; }
.modal-content form { padding: 24px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }
.loading { text-align: center; padding: 60px; color: #6e6e73; }
.btn-small { padding: 6px 12px; font-size: 13px; }
.lista-resultados { display: grid; gap: 8px; margin-top: 12px; }
.resultado-item { display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid #e5e5eb; border-radius: 10px; cursor: pointer; background: #fafafa; }
.resultado-item:hover { background: #f3f4f6; }
.resultado-item .avatar { width: 40px; height: 40px; border-radius: 10px; background: #eef2ff; display: flex; align-items: center; justify-content: center; color: #6366f1; }
.resultado-item .info .titulo { font-weight: 600; color: #111827; }
.resultado-item .info .sub { font-size: 12px; color: #6b7280; }
.resultado-item .acao { font-weight: 600; color: #2563eb; }
</style>

