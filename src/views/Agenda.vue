<template>
  <div class="container agenda-container">
    <div class="page-header">
      <h1><i class="fas fa-calendar-alt"></i> Agenda</h1>
      <div class="header-actions">
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
                  @click="mostrarMenuAgendamento(agend, $event)"
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
                  @click="mostrarMenuAgendamento(agend, $event)"
                  :class="['agendamento-mini', 'status-' + agend.status]"
                >
                  <div class="agendamento-content">
                    <div class="agendamento-avatar">
                      <img 
                        v-if="agend.pacienteFoto" 
                        :src="agend.pacienteFoto" 
                        :alt="agend.pacienteNome"
                        class="avatar-image"
                        @error="handleImageError"
                        @load="handleImageLoad"
                      >
                      <i v-else class="fas fa-user avatar-icon"></i>
                    </div>
                    <div class="agendamento-info">
                      <div class="agendamento-header">
                        <div class="status-icon" :class="'status-' + agend.status">
                          <i :class="getStatusIcon(agend.status)"></i>
                        </div>
                        <div class="paciente-nome">{{ agend.pacienteNome }}</div>
                      </div>
                      <div class="procedimento">{{ agend.procedimento }}</div>
                    </div>
                  </div>
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
                  @click="mostrarMenuAgendamento(agend, $event)"
                  :class="['agend-badge', 'status-' + agend.status]"
                >
                  <div class="agendamento-content-mes">
                    <div class="agendamento-avatar-mes">
                      <img 
                        v-if="agend.pacienteFoto" 
                        :src="agend.pacienteFoto" 
                        :alt="agend.pacienteNome"
                        class="avatar-image-mes"
                        @error="handleImageError"
                        @load="handleImageLoad"
                      >
                      <i v-else class="fas fa-user avatar-icon-mes"></i>
                    </div>
                    <div class="agendamento-info-mes">
                      <div class="agendamento-header-mes">
                        <div class="status-icon-mes" :class="'status-' + agend.status">
                          <i :class="getStatusIcon(agend.status)"></i>
                        </div>
                        <div class="hora">{{ formatarHora(agend.dataHora) }}</div>
                      </div>
                      <div class="paciente-nome">{{ agend.pacienteNome }}</div>
                      <div class="procedimento">{{ agend.procedimento }}</div>
                    </div>
                  </div>
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
          <div class="form-group autocomplete">
            <label>Paciente *</label>
            <input
              v-model="formulario.pacienteNome"
              type="text"
              required
              placeholder="Digite nome ou CPF"
              @focus="showSugPaciente = true"
              @input="showSugPaciente = true"
              @blur="onBlurPaciente"
            >
            <div v-if="showSugPaciente && pacientesSugeridos.length" class="autocomplete-list">
              <div v-for="pac in pacientesSugeridos" :key="pac.id" class="autocomplete-item" @mousedown.prevent="selecionarPacienteInline(pac)">
                <div class="avatar"><i class="fas fa-user"></i></div>
                <div class="info">
                  <div class="titulo">{{ pac.nome }}</div>
                  <div class="sub">{{ pac.cpf || 'sem CPF' }} • {{ pac.telefone || '' }}</div>
                </div>
              </div>
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
          
          <!-- Foto do Paciente -->
          <div class="form-group">
            <label><i class="fas fa-camera"></i> Foto do Paciente</label>
            <div class="photo-upload">
              <div v-if="!fotoPreview && !formulario.pacienteFoto" class="photo-placeholder" @click="triggerFileInput">
                <i class="fas fa-user"></i>
                <p>Clique para adicionar foto</p>
              </div>
              <div v-else class="photo-preview" @click="triggerFileInput">
                <img :src="fotoPreview || formulario.pacienteFoto" :alt="formulario.pacienteNome" class="preview-image">
                <div class="photo-overlay">
                  <i class="fas fa-camera"></i>
                  <span>Alterar foto</span>
                </div>
              </div>
              <input 
                ref="fileInput" 
                type="file" 
                accept="image/*" 
                @change="handleFileSelect" 
                style="display: none"
              >
              <button v-if="fotoPreview || formulario.pacienteFoto" type="button" @click="removerFoto" class="btn-remove-photo">
                <i class="fas fa-times"></i> Remover foto
              </button>
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
            <div class="form-group autocomplete">
              <label>Profissional *</label>
              <input
                v-model="formulario.profissional"
                type="text"
                required
                placeholder="Digite nome ou especialidade"
                @focus="showSugProf = true"
                @input="showSugProf = true"
                @blur="onBlurProfissional"
              >
              <div v-if="showSugProf && profissionaisSugeridos.length" class="autocomplete-list">
                <div v-for="prof in profissionaisSugeridos" :key="prof.id" class="autocomplete-item" @mousedown.prevent="selecionarProfissionalInline(prof)">
                  <div class="avatar"><i class="fas fa-user-md"></i></div>
                  <div class="info">
                    <div class="titulo">{{ prof.nome }}</div>
                    <div class="sub">{{ prof.especialidade || '' }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Duração (min)</label>
              <input v-model.number="formulario.duracao" type="number" placeholder="60">
            </div>
          </div>
          <div class="form-group autocomplete">
            <label>Procedimento *</label>
            <input
              v-model="formulario.procedimento"
              type="text"
              required
              placeholder="Digite nome ou categoria"
              @focus="showSugProc = true"
              @input="showSugProc = true"
              @blur="onBlurProcedimento"
            >
            <div v-if="showSugProc && procedimentosSugeridos.length" class="autocomplete-list">
              <div v-for="proc in procedimentosSugeridos" :key="proc.id" class="autocomplete-item" @mousedown.prevent="selecionarProcedimentoInline(proc)">
                <div class="avatar"><i class="fas fa-spa"></i></div>
                <div class="info">
                  <div class="titulo">{{ proc.nome }}</div>
                  <div class="sub">{{ proc.categoria || '' }} • R$ {{ new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(proc.valor || 0) }}</div>
                </div>
              </div>
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

    <!-- Menu de Contexto do Agendamento -->
    <div v-if="menuAgendamento.visivel" class="menu-contexto" :style="{ left: menuAgendamento.x + 'px', top: menuAgendamento.y + 'px' }">
      <div class="menu-item" @click="registrarAtendimento(menuAgendamento.agendamento)">
        <i class="fas fa-stethoscope"></i>
        Registrar Atendimento
      </div>
      <div class="menu-item" @click="editarAgendamento(menuAgendamento.agendamento)">
        <i class="fas fa-edit"></i>
        Editar Agendamento
      </div>
      <div class="menu-item" @click="marcarComoRealizado(menuAgendamento.agendamento)">
        <i class="fas fa-check-circle"></i>
        Marcar como Realizado
      </div>
      <div class="menu-item danger" @click="cancelarAgendamento(menuAgendamento.agendamento)">
        <i class="fas fa-times-circle"></i>
        Cancelar Agendamento
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
import { useNotifications } from '../composables/useNotifications.js'

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
const { showSuccess, showError, showConfirm, showPrompt } = useNotifications()
const { clientes, buscarClientes } = usePacientes()
const { profissionais, buscarProfissionais } = useProfissionais()
const { procedimentos, buscarCatalogo } = useProcedimentos()

const visualizacao = ref('dia')
const dataAtual = ref(new Date().toISOString().split('T')[0]) // Sempre data atual
const modalAgendamento = ref(false)
const salvando = ref(false)
const agendamentoEditando = ref(null)

// Variáveis para foto do paciente
const fotoPreview = ref(null)
const fileInput = ref(null)

const formulario = ref({
  // Paciente
  clienteId: '',
  pacienteNome: '',
  pacienteTelefone: '',
  pacienteEmail: '',
  pacienteFoto: '',
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
  
  // Sempre carregar com a data atual
  dataAtual.value = new Date().toISOString().split('T')[0]
  console.log('Data atual definida:', dataAtual.value)
  
  try {
    // 1. Inicializar clínica primeiro
    console.log('--- Inicializando clínica ---')
    await inicializarClinica()
    console.log('clinicaId após inicialização:', clinicaId.value)
    
    // 2. Buscar pacientes, profissionais e agendamentos
    await Promise.all([
      buscarClientes(),
      buscarProfissionais(true),
      buscarCatalogo()
    ])
    
    console.log('👥 Clientes carregados:', clientes.value.length)
    console.log('📸 Clientes com foto:', clientes.value.filter(c => c.fotoURL).length)
    console.log('📋 Primeiros 3 clientes:', clientes.value.slice(0, 3).map(c => ({
      nome: c.nome,
      temFoto: !!c.fotoURL,
      fotoURL: c.fotoURL
    })))
    console.log('--- Buscando agendamentos ---')
    const inicio = new Date(dataAtual.value)
    inicio.setDate(inicio.getDate() - 30)
    const fim = new Date(dataAtual.value)
    fim.setDate(fim.getDate() + 365) // Buscar 1 ano para frente
    
    console.log('📅 Data atual da agenda:', dataAtual.value)
    console.log('📅 Período de busca:', inicio.toISOString().split('T')[0], 'até', fim.toISOString().split('T')[0])
    await buscarAgendamentos(inicio.toISOString().split('T')[0], fim.toISOString().split('T')[0])
    console.log('Agendamentos retornados:', agendamentos.value.length)
    
    // Log detalhado dos agendamentos
    if (agendamentos.value.length > 0) {
      console.log('📋 Lista de agendamentos carregados:')
      agendamentos.value.forEach((ag, index) => {
        const dataHora = ag.dataHora?.toDate ? ag.dataHora.toDate() : new Date(ag.dataHora)
        console.log(`${index + 1}. ${ag.clienteNome} - ${dataHora.toLocaleString('pt-BR')} - ${ag.clinicaId}`)
      })
    } else {
      console.log('⚠️ Nenhum agendamento encontrado!')
    }
    
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
  const filtrados = agendamentos.value.filter(a => {
    const agendData = a.dataHora?.toDate ? a.dataHora.toDate() : new Date(a.dataHora)
    const agendHora = agendData.toTimeString().slice(0, 5)
    const dia = agendData.toISOString().split('T')[0]
    const match = dia === data && agendHora === hora
    
    if (match) {
      console.log('🎯 Agendamento encontrado:', {
        cliente: a.clienteNome,
        data: dia,
        hora: agendHora,
        dataAtual: data,
        horaAtual: hora
      })
    }
    
    return match
  })
  
  if (filtrados.length > 0) {
    console.log(`📅 ${filtrados.length} agendamentos para ${data} às ${hora}`)
  }
  
  return filtrados
}

const agendamentosPorDia = (data) => {
  return agendamentos.value.filter(a => {
    const agendData = a.dataHora?.toDate ? a.dataHora.toDate() : new Date(a.dataHora)
    const dia = agendData.toISOString().split('T')[0]
    return dia === data
  }).sort((a, b) => {
    const dataA = a.dataHora?.toDate ? a.dataHora.toDate() : new Date(a.dataHora)
    const dataB = b.dataHora?.toDate ? b.dataHora.toDate() : new Date(b.dataHora)
    return dataA - dataB
  })
}

const agendamentosPorDiaHora = (data, hora) => {
  const filtrados = agendamentos.value.filter(a => {
    const agendData = a.dataHora?.toDate ? a.dataHora.toDate() : new Date(a.dataHora)
    const agendHora = agendData.toTimeString().slice(0, 5)
    const dia = agendData.toISOString().split('T')[0]
    return dia === data && agendHora === hora
  })
  
  if (filtrados.length > 0) {
    console.log(`📅 ${filtrados.length} agendamentos para ${data} às ${hora}`)
    filtrados.forEach(agend => {
      console.log('🔍 Agendamento:', {
        paciente: agend.pacienteNome,
        foto: agend.pacienteFoto,
        temFoto: !!agend.pacienteFoto,
        urlFoto: agend.pacienteFoto,
        status: agend.status,
        todosOsCampos: Object.keys(agend)
      })
    })
  }
  
  return filtrados
}

const abrirModalNovo = () => {
  modalAgendamento.value = true
  agendamentoEditando.value = null
  formulario.value = {
    clienteId: '',
    pacienteNome: '',
    pacienteTelefone: '',
    pacienteEmail: '',
    pacienteFoto: '',
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
    pacienteFoto: agend.pacienteFoto || '',
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
    
    console.log('💾 Dados do formulário antes de salvar:', {
      pacienteNome: formulario.value.pacienteNome,
      pacienteFoto: formulario.value.pacienteFoto,
      temFoto: !!formulario.value.pacienteFoto,
      temPreview: !!fotoPreview.value
    })
    
    // Upload da nova foto se houver
    let fotoURL = formulario.value.pacienteFoto
    if (fotoPreview.value) {
      console.log('📤 Fazendo upload da nova foto na agenda...')
      const file = fileInput.value?.files?.[0]
      if (file) {
        try {
          console.log('📁 Arquivo para upload:', {
            nome: file.name,
            tamanho: file.size,
            tipo: file.type
          })
          
          // Importar uploadToCloudinary dinamicamente
          const { uploadToCloudinary } = await import('../utils/cloudinary.js')
          const { compressProfileImage } = await import('../utils/imageCompressor.js')
          
          // Comprimir imagem antes do upload (igual NovaAnamnese)
          const compressed = await compressProfileImage(file)
          console.log('📦 Imagem comprimida, fazendo upload...')
          
          // Usar mesmo preset que funciona na NovaAnamnese
          fotoURL = await uploadToCloudinary(compressed, { 
            preset: 'pacientes',
            folder: 'estetica/clientes'
          })
          console.log('✅ Foto enviada com sucesso:', fotoURL)
        } catch (uploadError) {
          console.error('❌ Erro no upload:', uploadError)
          console.error('❌ Detalhes do erro:', {
            name: uploadError.name,
            message: uploadError.message,
            stack: uploadError.stack
          })
          mostrarToast(`Erro ao fazer upload da foto: ${uploadError.message}`, 'error')
          return
        }
      } else {
        console.warn('⚠️ Preview existe mas não há arquivo selecionado')
      }
    } else {
      console.log('ℹ️ Nenhuma nova foto para upload, mantendo URL atual:', fotoURL)
    }
    
    const dados = {
      // Paciente
      clienteId: formulario.value.clienteId,
      clienteNome: formulario.value.pacienteNome,
      pacienteNome: formulario.value.pacienteNome, // retrocompatibilidade
      pacienteTelefone: formulario.value.pacienteTelefone,
      pacienteEmail: formulario.value.pacienteEmail,
      pacienteFoto: fotoURL,
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
    
    console.log('💾 Dados que serão salvos:', {
      pacienteFoto: dados.pacienteFoto,
      pacienteNome: dados.pacienteNome,
      temFoto: !!dados.pacienteFoto
    })
    
    if (agendamentoEditando.value) {
      await atualizarAgendamento(agendamentoEditando.value.id, dados)
    } else {
      await criarAgendamento(dados)
    }
    
    // Recarregar agendamentos com período amplo
    const inicio = new Date(dataAtual.value)
    inicio.setDate(inicio.getDate() - 30)
    const fim = new Date(dataAtual.value)
    fim.setDate(fim.getDate() + 365)
    await buscarAgendamentos(inicio.toISOString().split('T')[0], fim.toISOString().split('T')[0])
    fecharModal()
    showSuccess('Agendamento salvo com sucesso!')
  } catch (err) {
    showError('Erro ao salvar agendamento')
  } finally {
    salvando.value = false
  }
}

const cancelarAgendamentoAtual = async () => {
  try {
    const confirmado = await showConfirm(
      'Deseja realmente cancelar este agendamento?',
      {
        title: 'Cancelar Agendamento',
        type: 'danger',
        confirmText: 'Sim, Cancelar',
        cancelText: 'Não',
        confirmIcon: 'fas fa-ban'
      }
    )
    
    if (!confirmado) return
    
    const motivo = await showPrompt(
      'Informe o motivo do cancelamento para registro',
      {
        title: 'Motivo do Cancelamento',
        label: 'Motivo (opcional)',
        placeholder: 'Ex: Cliente não compareceu, reagendado, etc.',
        inputType: 'textarea',
        required: false
      }
    )
    
    await cancelarAgendamento(agendamentoEditando.value.id, motivo || 'Não informado')
    await buscarAgendamentos(dataAtual.value, dataAtual.value)
    fecharModal()
    showSuccess('Agendamento cancelado com sucesso!')
  } catch (err) {
    // Usuário cancelou a ação
    console.log('Cancelamento abortado pelo usuário')
  }
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
const showSugPaciente = ref(false)
const pacientesSugeridos = computed(() => pacientesFiltrados.value.slice(0, 8))
const onBlurPaciente = () => setTimeout(() => { showSugPaciente.value = false }, 150)
const abrirModalPesquisaPaciente = () => {
  termoPaciente.value = ''
  modalPesquisaPaciente.value = true
}
const fecharModalPesquisaPaciente = () => {
  modalPesquisaPaciente.value = false
}
const aplicarSelecaoPaciente = (pac) => {
  console.log('🎯 Selecionando paciente:', {
    id: pac.id,
    nome: pac.nome,
    fotoURL: pac.fotoURL,
    temFoto: !!pac.fotoURL,
    todosOsCampos: Object.keys(pac)
  })
  
  formulario.value.clienteId = pac.id
  formulario.value.pacienteNome = pac.nome
  formulario.value.pacienteTelefone = pac.telefone || ''
  formulario.value.pacienteEmail = pac.email || ''
  formulario.value.pacienteFoto = pac.fotoURL || ''
  
  console.log('📝 Formulário atualizado:', {
    pacienteFoto: formulario.value.pacienteFoto,
    pacienteNome: formulario.value.pacienteNome,
    temFoto: !!formulario.value.pacienteFoto
  })
  
  fecharModalPesquisaPaciente()
}
// Inline
const selecionarPacienteInline = (pac) => {
  aplicarSelecaoPaciente(pac)
  showSugPaciente.value = false
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
const showSugProf = ref(false)
const profissionaisSugeridos = computed(() => profissionaisFiltrados.value.slice(0, 8))
const onBlurProfissional = () => setTimeout(() => { showSugProf.value = false }, 150)
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
const selecionarProfissionalInline = (prof) => {
  aplicarSelecaoProfissional(prof)
  showSugProf.value = false
}

// ===== Pesquisa de Procedimento =====
const modalPesquisaProcedimento = ref(false)
const termoProc = ref('')

// Menu de contexto do agendamento
const menuAgendamento = ref({
  visivel: false,
  agendamento: null,
  x: 0,
  y: 0
})
const procedimentosFiltradosModal = computed(() => {
  const t = termoProc.value.toLowerCase().trim()
  if (!t) return procedimentos.value
  return procedimentos.value.filter(p => {
    const nomeOk = (p.nome || '').toLowerCase().includes(t)
    const catOk = (p.categoria || '').toLowerCase().includes(t)
    const idOk = (p.id || '').toLowerCase().includes(t)
    return nomeOk || catOk || idOk
  })
})
const showSugProc = ref(false)
const procedimentosSugeridos = computed(() => procedimentosFiltradosModal.value.slice(0, 8))
const onBlurProcedimento = () => setTimeout(() => { showSugProc.value = false }, 150)
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
const selecionarProcedimentoInline = (proc) => {
  aplicarSelecaoProced(proc)
  showSugProc.value = false
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

// Função para lidar com erro de carregamento de imagem
const handleImageError = (event) => {
  console.log('❌ Erro ao carregar imagem do paciente:', {
    src: event.target.src,
    alt: event.target.alt,
    naturalWidth: event.target.naturalWidth,
    naturalHeight: event.target.naturalHeight,
    complete: event.target.complete
  })
  
  // Esconder a imagem
  event.target.style.display = 'none'
  
  // Mostrar o ícone de fallback
  const avatar = event.target.parentElement
  const icon = avatar.querySelector('.avatar-icon, .avatar-icon-mes')
  if (icon) {
    icon.style.display = 'flex'
    console.log('✅ Ícone de fallback ativado')
  } else {
    console.log('❌ Ícone de fallback não encontrado')
  }
}

// Função para verificar se a imagem carregou com sucesso
const handleImageLoad = (event) => {
  console.log('✅ Imagem carregada com sucesso:', {
    src: event.target.src,
    naturalWidth: event.target.naturalWidth,
    naturalHeight: event.target.naturalHeight
  })
}

// Função para obter ícone do status
const getStatusIcon = (status) => {
  const icons = {
    'confirmado': 'fas fa-check-circle',
    'realizado': 'fas fa-check-double',
    'cancelado': 'fas fa-times-circle',
    'pendente': 'fas fa-clock',
    'agendado': 'fas fa-calendar-check'
  }
  return icons[status] || 'fas fa-question-circle'
}

// Funções para manipular foto do paciente
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  console.log('📁 Arquivo selecionado na agenda:', {
    nome: file?.name,
    tamanho: file?.size,
    tipo: file?.type,
    existe: !!file
  })
  
  if (file) {
    // Validar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!tiposPermitidos.includes(file.type)) {
      console.error('❌ Tipo de arquivo inválido:', file.type)
      mostrarToast('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, WebP).', 'error')
      return
    }
    
    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ Arquivo muito grande:', file.size)
      mostrarToast('A imagem deve ter no máximo 5MB.', 'error')
      return
    }
    
    // Validar se o arquivo não está vazio
    if (file.size === 0) {
      console.error('❌ Arquivo vazio')
      mostrarToast('O arquivo selecionado está vazio.', 'error')
      return
    }
    
    console.log('✅ Arquivo válido, criando preview...')
    
    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      fotoPreview.value = e.target.result
      console.log('✅ Preview criado com sucesso na agenda')
    }
    reader.onerror = (error) => {
      console.error('❌ Erro ao ler arquivo:', error)
      mostrarToast('Erro ao processar a imagem.', 'error')
    }
    reader.readAsDataURL(file)
  }
}

const removerFoto = () => {
  formulario.value.pacienteFoto = ''
  fotoPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  console.log('🗑️ Foto removida do formulário')
}

// ===== Menu de Contexto do Agendamento =====
const mostrarMenuAgendamento = (agendamento, event) => {
  event.preventDefault()
  event.stopPropagation()
  
  menuAgendamento.value = {
    visivel: true,
    agendamento: agendamento,
    x: event.clientX,
    y: event.clientY
  }
  
  // Fechar menu ao clicar fora
  setTimeout(() => {
    document.addEventListener('click', fecharMenuAgendamento)
  }, 100)
}

const fecharMenuAgendamento = () => {
  menuAgendamento.value.visivel = false
  document.removeEventListener('click', fecharMenuAgendamento)
}

const registrarAtendimento = (agendamento) => {
  fecharMenuAgendamento()
  // Redirecionar para o prontuário do paciente
  router.push(`/prontuario/${agendamento.clienteId}`)
}

const marcarComoRealizado = async (agendamento) => {
  fecharMenuAgendamento()
  try {
    await updateAgendamento(agendamento.id, { status: 'realizado' })
    await carregarAgendamentos()
    showToast('Agendamento marcado como realizado!', 'success')
  } catch (error) {
    console.error('Erro ao marcar como realizado:', error)
    showToast('Erro ao marcar como realizado', 'error')
  }
}

const cancelarAgendamento = async (agendamento) => {
  fecharMenuAgendamento()
  try {
    const confirmado = await showConfirm(
      'Deseja realmente cancelar este agendamento?',
      {
        title: 'Cancelar Agendamento',
        type: 'warning'
      }
    )
    
    if (confirmado) {
      await updateAgendamento(agendamento.id, { status: 'cancelado' })
      await carregarAgendamentos()
      showToast('Agendamento cancelado!', 'success')
    }
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error)
    showToast('Erro ao cancelar agendamento', 'error')
  }
}

// Função para mostrar toast (usando o sistema global)
const mostrarToast = (message, type = 'error') => {
  if (type === 'error') {
    showError(message)
  } else if (type === 'success') {
    showSuccess(message)
  } else {
    showError(message)
  }
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
.agendamento-mini { 
  padding: 6px 8px; 
  border-radius: 8px; 
  font-size: 11px; 
  cursor: pointer; 
  margin-bottom: 2px; 
  transition: all 0.2s ease;
}
.agendamento-mini:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.mes-view { padding: 20px; }
.mes-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #e5e5ea; }
.dia-cell { background: white; min-height: 100px; padding: 8px; }
.dia-cell.hoje { background: rgba(102, 126, 234, 0.05); }
.dia-cell.outro-mes { opacity: 0.5; }
.dia-numero { font-weight: 700; margin-bottom: 4px; }
.agend-badge { 
  padding: 6px 8px; 
  border-radius: 8px; 
  font-size: 11px; 
  margin-bottom: 2px; 
  cursor: pointer; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap;
  transition: all 0.2s ease;
}
.agend-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
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
.autocomplete { position: relative; }
.autocomplete-list { position: absolute; left: 0; right: 0; top: calc(100% + 6px); background: #fff; border: 1px solid #e5e5eb; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); max-height: 280px; overflow: auto; z-index: 20; }
.autocomplete-item { display: grid; grid-template-columns: 40px 1fr; gap: 10px; padding: 10px 12px; cursor: pointer; align-items: center; }
.autocomplete-item:hover { background: #f8fafc; }
.autocomplete-item .avatar { width: 40px; height: 40px; border-radius: 10px; background: #eef2ff; display: flex; align-items: center; justify-content: center; color: #6366f1; }
.autocomplete-item .info .titulo { font-weight: 600; color: #111827; }
.autocomplete-item .info .sub { font-size: 12px; color: #6b7280; }
.btn-small { padding: 6px 12px; font-size: 13px; }
.lista-resultados { display: grid; gap: 8px; margin-top: 12px; }
.resultado-item { display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid #e5e5eb; border-radius: 10px; cursor: pointer; background: #fafafa; }
.resultado-item:hover { background: #f3f4f6; }
.resultado-item .avatar { width: 40px; height: 40px; border-radius: 10px; background: #eef2ff; display: flex; align-items: center; justify-content: center; color: #6366f1; }
.resultado-item .info .titulo { font-weight: 600; color: #111827; }
.resultado-item .info .sub { font-size: 12px; color: #6b7280; }
.resultado-item .acao { font-weight: 600; color: #2563eb; }

/* Avatar e conteúdo dos agendamentos */
.agendamento-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agendamento-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 50%;
}

.avatar-icon {
  font-size: 12px;
  color: inherit;
}

.agendamento-info {
  flex: 1;
  min-width: 0;
}

.agendamento-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.status-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
}

.status-icon.status-confirmado {
  background: #e3f2fd;
  color: #1976d2;
}

.status-icon.status-realizado {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-icon.status-cancelado {
  background: #ffebee;
  color: #d32f2f;
}

.status-icon.status-pendente {
  background: #fff3e0;
  color: #f57c00;
}

.paciente-nome {
  font-weight: 600;
  font-size: 11px;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
}

.procedimento {
  font-size: 10px;
  opacity: 0.8;
  line-height: 1.2;
}

/* Layout para visualização mensal */
.agendamento-content-mes {
  display: flex;
  align-items: center;
  gap: 6px;
}

.agendamento-avatar-mes {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
}

.avatar-image-mes {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 50%;
}

.avatar-icon-mes {
  font-size: 10px;
  color: inherit;
}

.agendamento-info-mes {
  flex: 1;
  min-width: 0;
}

.agendamento-header-mes {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 1px;
}

.status-icon-mes {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  flex-shrink: 0;
}

.status-icon-mes.status-confirmado {
  background: #e3f2fd;
  color: #1976d2;
}

.status-icon-mes.status-realizado {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-icon-mes.status-cancelado {
  background: #ffebee;
  color: #d32f2f;
}

.status-icon-mes.status-pendente {
  background: #fff3e0;
  color: #f57c00;
}

.agendamento-info-mes .hora {
  font-size: 9px;
  font-weight: 600;
  flex: 1;
}

.agendamento-info-mes .paciente-nome {
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 1px;
}

.agendamento-info-mes .procedimento {
  font-size: 9px;
  opacity: 0.8;
  line-height: 1.2;
}

@media (max-width: 768px) {
  /* Mobile: avatares menores */
  .agendamento-avatar {
    width: 20px;
    height: 20px;
  }
  
  .agendamento-avatar-mes {
    width: 16px;
    height: 16px;
  }
  
  .avatar-icon {
    font-size: 10px;
  }
  
  .avatar-icon-mes {
    font-size: 8px;
  }
}

/* Estilos para upload de foto na agenda */
.photo-upload {
  position: relative;
  display: inline-block;
}

.photo-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed #d2d2d7;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.photo-placeholder:hover {
  border-color: #667eea;
  background: #f0f4ff;
  transform: translateY(-2px);
}

.photo-placeholder i {
  font-size: 32px;
  color: #8e8e93;
  margin-bottom: 8px;
}

.photo-placeholder p {
  font-size: 12px;
  color: #6e6e73;
  margin: 0;
  text-align: center;
}

.photo-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.photo-preview:hover .photo-overlay {
  opacity: 1;
}

.photo-overlay i {
  font-size: 24px;
  margin-bottom: 4px;
}

.photo-overlay span {
  font-size: 12px;
  font-weight: 600;
}

.btn-remove-photo {
  margin-top: 8px;
  padding: 6px 12px;
  background: #ff3b30;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-remove-photo:hover {
  background: #d70015;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .photo-placeholder,
  .photo-preview {
    width: 100px;
    height: 100px;
  }
  
  .photo-placeholder i {
    font-size: 24px;
  }
  
  .photo-overlay i {
    font-size: 20px;
  }
}

/* Menu de Contexto do Agendamento */
.menu-contexto {
  position: fixed;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f3f4;
  font-size: 14px;
  color: #2d3748;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #f8f9fa;
}

.menu-item.danger {
  color: #e53e3e;
}

.menu-item.danger:hover {
  background-color: #fed7d7;
}

.menu-item i {
  width: 16px;
  text-align: center;
  font-size: 14px;
}
</style>

