<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-file-medical"></i> Prontuário Eletrônico</h1>
        <div class="header-actions">
          <VoltarHome />
          <button @click="abrirModalPaciente" class="btn btn-primary">
            <i class="fas fa-user-plus"></i>
            Selecionar Paciente
          </button>
        </div>
      </div>
    </div>

    <!-- Seleção de Paciente -->
    <div v-if="!pacienteSelecionado" class="card">
      <div class="patient-selection">
        <h2><i class="fas fa-search"></i> Selecionar Paciente</h2>
        <p>Escolha um paciente para acessar seu prontuário eletrônico</p>
        
        <div class="search-section">
          <div class="search-input">
            <i class="fas fa-search"></i>
            <input 
              v-model="buscaPaciente" 
              type="text" 
              placeholder="Buscar por nome, CPF ou telefone..."
              @input="buscarPacientes"
            >
          </div>
        </div>

        <!-- Lista de Pacientes -->
        <div v-if="pacientesEncontrados.length > 0" class="patients-list">
          <div 
            v-for="paciente in pacientesEncontrados" 
            :key="paciente.id"
            class="patient-card"
            @click="selecionarPaciente(paciente)"
          >
            <div class="patient-avatar">
              <img v-if="paciente.fotoURL" :src="paciente.fotoURL" :alt="paciente.nome">
              <i v-else class="fas fa-user"></i>
            </div>
            <div class="patient-info">
              <h3>{{ paciente.nome }}</h3>
              <p v-if="paciente.telefone"><i class="fas fa-phone"></i> {{ paciente.telefone }}</p>
              <p v-if="paciente.email"><i class="fas fa-envelope"></i> {{ paciente.email }}</p>
              <p v-if="paciente.dataNascimento">
                <i class="fas fa-birthday-cake"></i> 
                {{ formatarData(paciente.dataNascimento) }} 
                ({{ calcularIdade(paciente.dataNascimento) }} anos)
              </p>
            </div>
            <div class="patient-actions">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>

        <div v-else-if="buscaPaciente && !carregando" class="no-results">
          <i class="fas fa-search"></i>
          <h3>Nenhum paciente encontrado</h3>
          <p>Não encontramos pacientes com o termo "{{ buscaPaciente }}"</p>
          <div class="search-tips">
            <p><strong>Dicas para busca:</strong></p>
            <ul>
              <li>Digite o nome completo ou parcial</li>
              <li>Use CPF (com ou sem pontos)</li>
              <li>Digite o telefone</li>
              <li>Use o email</li>
            </ul>
          </div>
          <div class="debug-actions">
            <button @click="criarDadosTeste" class="btn btn-secondary">
              <i class="fas fa-plus"></i>
              Criar Dados de Teste
            </button>
            <button @click="verificarDados" class="btn btn-outline">
              <i class="fas fa-bug"></i>
              Verificar Dados
            </button>
            <button @click="debugAtendimentos" class="btn btn-outline">
              <i class="fas fa-calendar-check"></i>
              Debug Atendimentos
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Prontuário do Paciente -->
    <div v-else class="prontuario-container">
      <!-- Cabeçalho do Paciente -->
      <div class="patient-header">
        <div class="patient-main-info">
          <div class="patient-avatar-large">
            <img v-if="pacienteSelecionado.fotoURL" :src="pacienteSelecionado.fotoURL" :alt="pacienteSelecionado.nome">
            <i v-else class="fas fa-user"></i>
          </div>
          <div class="patient-details">
            <h2>{{ pacienteSelecionado.nome }}</h2>
            <div class="patient-meta">
              <span v-if="pacienteSelecionado.dataNascimento" class="age">
                <i class="fas fa-birthday-cake"></i>
                {{ calcularIdade(pacienteSelecionado.dataNascimento) }} anos
              </span>
              <span v-if="pacienteSelecionado.telefone" class="phone">
                <i class="fas fa-phone"></i>
                {{ pacienteSelecionado.telefone }}
              </span>
              <span v-if="pacienteSelecionado.email" class="email">
                <i class="fas fa-envelope"></i>
                {{ pacienteSelecionado.email }}
              </span>
            </div>
          </div>
        </div>
        <div class="patient-actions-header">
          <button @click="pacienteSelecionado = null" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i>
            Trocar Paciente
          </button>
          <button @click="abrirModalNovaEvolucao" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Nova Evolução
          </button>
        </div>
      </div>

      <!-- Tabs do Prontuário -->
      <div class="prontuario-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="tabAtiva = tab.id"
          :class="['tab-button', { 'active': tabAtiva === tab.id }]"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
          <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Conteúdo das Tabs -->
      <div class="tab-content">
        <!-- Resumo -->
        <div v-if="tabAtiva === 'resumo'" class="tab-panel">
          <div class="summary-cards">
            <div class="summary-card">
              <div class="card-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="card-content">
                <h3>{{ totalAtendimentos }}</h3>
                <p>Atendimentos Realizados</p>
              </div>
            </div>
            <div class="summary-card">
              <div class="card-icon">
                <i class="fas fa-file-medical"></i>
              </div>
              <div class="card-content">
                <h3>{{ totalEvolucoes }}</h3>
                <p>Evoluções Clínicas</p>
              </div>
            </div>
            <div class="summary-card">
              <div class="card-icon">
                <i class="fas fa-vial"></i>
              </div>
              <div class="card-content">
                <h3>{{ totalExames }}</h3>
                <p>Exames Realizados</p>
              </div>
            </div>
            <div class="summary-card">
              <div class="card-icon">
                <i class="fas fa-prescription-bottle"></i>
              </div>
              <div class="card-content">
                <h3>{{ totalPrescricoes }}</h3>
                <p>Prescrições</p>
              </div>
            </div>
          </div>

          <!-- Últimas Atividades -->
          <div class="recent-activities">
            <h3><i class="fas fa-history"></i> Últimas Atividades</h3>
            <div class="activity-list">
              <div v-for="atividade in ultimasAtividades" :key="atividade.id" class="activity-item">
                <div class="activity-icon">
                  <i :class="atividade.icon"></i>
                </div>
                <div class="activity-content">
                  <h4>{{ atividade.titulo }}</h4>
                  <p>{{ atividade.descricao }}</p>
                  <span class="activity-date">{{ formatarData(atividade.data) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Atendimentos -->
        <div v-if="tabAtiva === 'atendimentos'" class="tab-panel">
          <div class="section-header">
            <h3><i class="fas fa-calendar-check"></i> Atendimentos Realizados</h3>
          </div>

          <div v-if="atendimentos.length === 0" class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <h3>Nenhum atendimento registrado</h3>
            <p>Este paciente ainda não possui atendimentos registrados</p>
          </div>

          <div v-else class="atendimentos-list">
            <div v-for="atendimento in atendimentos" :key="atendimento.id" class="atendimento-card">
              <div class="atendimento-header">
                <div class="atendimento-info">
                  <h4>{{ atendimento.procedimento || 'Procedimento não informado' }}</h4>
                  <p class="atendimento-data">
                    <i class="fas fa-calendar"></i>
                    {{ formatarData(atendimento.dataHora) }} às {{ formatarHora(atendimento.dataHora) }}
                  </p>
                  <p v-if="atendimento.profissional">
                    <i class="fas fa-user-md"></i>
                    Profissional: {{ atendimento.profissional }}
                  </p>
                  <p v-if="atendimento.valor">
                    <i class="fas fa-dollar-sign"></i>
                    Valor: R$ {{ formatarMoeda(atendimento.valor) }}
                  </p>
                </div>
                <div class="atendimento-status">
                  <span :class="getStatusClass(atendimento.status)">
                    {{ getStatusText(atendimento.status) }}
                  </span>
                </div>
              </div>
              <div v-if="atendimento.observacoes" class="atendimento-observacoes">
                <p><strong>Observações:</strong> {{ atendimento.observacoes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Evoluções Clínicas -->
        <div v-if="tabAtiva === 'evolucoes'" class="tab-panel">
          <div class="section-header">
            <h3><i class="fas fa-stethoscope"></i> Evoluções Clínicas</h3>
            <button @click="abrirModalNovaEvolucao" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Nova Evolução
            </button>
          </div>

          <div v-if="evolucoes.length === 0" class="empty-state">
            <i class="fas fa-stethoscope"></i>
            <h3>Nenhuma evolução registrada</h3>
            <p>Comece registrando a primeira evolução clínica do paciente</p>
            <button @click="abrirModalNovaEvolucao" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Primeira Evolução
            </button>
          </div>

          <div v-else class="evolucoes-list">
            <div v-for="evolucao in evolucoes" :key="evolucao.id" class="evolucao-card">
              <div class="evolucao-header">
                <div class="evolucao-info">
                  <h4>{{ evolucao.titulo }}</h4>
                  <p class="evolucao-data">{{ formatarData(evolucao.data) }} - {{ evolucao.profissional }}</p>
                </div>
                <div class="evolucao-actions">
                  <button @click="editarEvolucao(evolucao)" class="btn-icon" title="Editar evolução">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="excluirEvolucao(evolucao)" class="btn-icon danger" title="Excluir evolução">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="evolucao-content">
                <p><strong>Queixa Principal:</strong> {{ evolucao.queixaPrincipal }}</p>
                <p><strong>Exame Físico:</strong> {{ evolucao.exameFisico }}</p>
                <p><strong>Diagnóstico:</strong> {{ evolucao.diagnostico }}</p>
                <p><strong>Conduta:</strong> {{ evolucao.conduta }}</p>
                <p v-if="evolucao.observacoes"><strong>Observações:</strong> {{ evolucao.observacoes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Exames -->
        <div v-if="tabAtiva === 'exames'" class="tab-panel">
          <div class="section-header">
            <h3><i class="fas fa-vial"></i> Exames e Resultados</h3>
            <button @click="abrirModalNovoExame" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Novo Exame
            </button>
          </div>

          <div v-if="exames.length === 0" class="empty-state">
            <i class="fas fa-vial"></i>
            <h3>Nenhum exame registrado</h3>
            <p>Registre exames e resultados do paciente</p>
            <button @click="abrirModalNovoExame" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Primeiro Exame
            </button>
          </div>

          <div v-else class="exames-list">
            <div v-for="exame in exames" :key="exame.id" class="exame-card">
              <div class="exame-header">
                <div class="exame-info">
                  <h4>{{ exame.nome }}</h4>
                  <p class="exame-data">{{ formatarData(exame.dataRealizacao) }}</p>
                </div>
                <div class="exame-status" :class="exame.status">
                  {{ exame.status }}
                </div>
              </div>
              <div class="exame-content">
                <p><strong>Laboratório:</strong> {{ exame.laboratorio }}</p>
                <p v-if="exame.resultado"><strong>Resultado:</strong> {{ exame.resultado }}</p>
                <p v-if="exame.observacoes"><strong>Observações:</strong> {{ exame.observacoes }}</p>
                <div v-if="exame.anexos && exame.anexos.length > 0" class="exame-anexos">
                  <strong>Anexos:</strong>
                  <div class="anexos-list">
                    <a v-for="anexo in exame.anexos" :key="anexo.id" :href="anexo.url" target="_blank" class="anexo-link">
                      <i class="fas fa-file"></i>
                      {{ anexo.nome }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Prescrições -->
        <div v-if="tabAtiva === 'prescricoes'" class="tab-panel">
          <div class="section-header">
            <h3><i class="fas fa-prescription-bottle"></i> Prescrições</h3>
            <button @click="abrirModalNovaPrescricao" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Nova Prescrição
            </button>
          </div>

          <div v-if="prescricoes.length === 0" class="empty-state">
            <i class="fas fa-prescription-bottle"></i>
            <h3>Nenhuma prescrição registrada</h3>
            <p>Registre prescrições e orientações para o paciente</p>
            <button @click="abrirModalNovaPrescricao" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Primeira Prescrição
            </button>
          </div>

          <div v-else class="prescricoes-list">
            <div v-for="prescricao in prescricoes" :key="prescricao.id" class="prescricao-card">
              <div class="prescricao-header">
                <div class="prescricao-info">
                  <h4>{{ prescricao.titulo }}</h4>
                  <p class="prescricao-data">{{ formatarData(prescricao.data) }} - {{ prescricao.profissional }}</p>
                </div>
                <div class="prescricao-actions">
                  <button @click="imprimirPrescricao(prescricao)" class="btn-icon">
                    <i class="fas fa-print"></i>
                  </button>
                  <button @click="editarPrescricao(prescricao)" class="btn-icon">
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
              </div>
              <div class="prescricao-content">
                <div class="medicamentos">
                  <h5>Medicamentos:</h5>
                  <ul>
                    <li v-for="medicamento in prescricao.medicamentos" :key="medicamento.id">
                      <strong>{{ medicamento.nome }}</strong> - {{ medicamento.dosagem }} - {{ medicamento.posologia }}
                    </li>
                  </ul>
                </div>
                <div v-if="prescricao.orientacoes" class="orientacoes">
                  <h5>Orientações:</h5>
                  <p>{{ prescricao.orientacoes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Anamnese -->
        <div v-if="tabAtiva === 'anamnese'" class="tab-panel">
          <div class="section-header">
            <h3><i class="fas fa-clipboard-list"></i> Anamnese</h3>
          </div>

          <div v-if="anamneses.length === 0" class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <h3>Nenhuma anamnese registrada</h3>
            <p>O paciente ainda não preencheu nenhuma anamnese</p>
          </div>

          <div v-else class="anamneses-list">
            <div v-for="anamnese in anamneses" :key="anamnese.id" class="anamnese-card">
              <div class="anamnese-header">
                <div class="anamnese-info">
                  <h4>Anamnese - {{ formatarData(anamnese.dataCriacao) }}</h4>
                  <p class="anamnese-origem">
                    <i class="fas fa-user"></i>
                    {{ anamnese.origem === 'cliente' ? 'Preenchida pelo cliente' : 'Preenchida pela profissional' }}
                  </p>
                </div>
                <div class="anamnese-status" :class="anamnese.status">
                  {{ anamnese.status }}
                </div>
              </div>
              <div class="anamnese-content">
                <div class="anamnese-section">
                  <h5>Dados Pessoais</h5>
                  <p><strong>Nome:</strong> {{ anamnese.nome }}</p>
                  <p><strong>Data de Nascimento:</strong> {{ formatarData(anamnese.dataNascimento) }}</p>
                  <p><strong>Telefone:</strong> {{ anamnese.telefone }}</p>
                  <p v-if="anamnese.email"><strong>Email:</strong> {{ anamnese.email }}</p>
                </div>
                
                <div class="anamnese-section">
                  <h5>Histórico Médico</h5>
                  <p v-if="anamnese.doencas"><strong>Doenças:</strong> {{ anamnese.doencas }}</p>
                  <p v-if="anamnese.medicamentos"><strong>Medicamentos:</strong> {{ anamnese.medicamentos }}</p>
                  <p v-if="anamnese.alergias"><strong>Alergias:</strong> {{ anamnese.alergias }}</p>
                </div>

                <div class="anamnese-section">
                  <h5>Objetivos do Tratamento</h5>
                  <p v-if="anamnese.objetivos">{{ anamnese.objetivos }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modais -->
    <ModalEvolucao 
      v-if="modalEvolucao" 
      :paciente="pacienteSelecionado"
      :evolucao="evolucaoEditando"
      :profissional-sugerido="buscarUltimoProfissional()"
      @fechar="fecharModalEvolucao"
      @salvar="salvarEvolucao"
    />
    
    <!-- Debug info -->
    <div v-if="modalEvolucao" style="position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px; z-index: 9999;">
      Modal aberto: {{ modalEvolucao }}<br>
      Evolução editando: {{ evolucaoEditando ? 'Sim' : 'Não' }}
    </div>

    <ModalExame 
      v-if="modalExame" 
      :paciente="pacienteSelecionado"
      :exame="exameEditando"
      @fechar="fecharModalExame"
      @salvar="salvarExame"
    />

    <ModalPrescricao 
      v-if="modalPrescricao" 
      :paciente="pacienteSelecionado"
      :prescricao="prescricaoEditando"
      @fechar="fecharModalPrescricao"
      @salvar="salvarPrescricao"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { db } from '../firebase.js'
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useClinica } from '../composables/useClinica.js'
import { useNotifications } from '../composables/useNotifications.js'
import VoltarHome from '../components/VoltarHome.vue'
import ModalEvolucao from '../components/ModalEvolucao.vue'
import ModalExame from '../components/ModalExame.vue'
import ModalPrescricao from '../components/ModalPrescricao.vue'

const { clinicaId } = useClinica()
const { showSuccess, showError } = useNotifications()

// Estado principal
const pacienteSelecionado = ref(null)
const buscaPaciente = ref('')
const pacientesEncontrados = ref([])
const carregando = ref(false)

// Tabs
const tabAtiva = ref('resumo')
const tabs = ref([
  { id: 'resumo', label: 'Resumo', icon: 'fas fa-chart-pie' },
  { id: 'atendimentos', label: 'Atendimentos', icon: 'fas fa-calendar-check' },
  { id: 'evolucoes', label: 'Evoluções', icon: 'fas fa-stethoscope' },
  { id: 'exames', label: 'Exames', icon: 'fas fa-vial' },
  { id: 'prescricoes', label: 'Prescrições', icon: 'fas fa-prescription-bottle' },
  { id: 'anamnese', label: 'Anamnese', icon: 'fas fa-clipboard-list' }
])

// Dados do prontuário
const evolucoes = ref([])
const exames = ref([])
const prescricoes = ref([])
const anamneses = ref([])
const atendimentos = ref([])

// Modais
const modalEvolucao = ref(false)
const modalExame = ref(false)
const modalPrescricao = ref(false)
const evolucaoEditando = ref(null)
const exameEditando = ref(null)
const prescricaoEditando = ref(null)

// Computed
const totalAtendimentos = computed(() => {
  console.log('📊 Calculando total de atendimentos...')
  console.log('👤 Paciente atual:', pacienteSelecionado.value?.nome)
  console.log('📋 Atendimentos disponíveis:', atendimentos.value.length)
  console.log('📋 Lista de atendimentos:', atendimentos.value)
  
  // Filtrar apenas atendimentos realizados
  const realizados = atendimentos.value.filter(atendimento => {
    const isRealizado = atendimento.status?.toLowerCase() === 'realizado'
    console.log(`🔍 Atendimento: ${atendimento.procedimento} - Status: ${atendimento.status} - Realizado: ${isRealizado}`)
    console.log(`🔍 Cliente: ${atendimento.cliente} - Paciente: ${atendimento.paciente}`)
    return isRealizado
  })
  
  console.log('✅ Atendimentos realizados encontrados:', realizados.length)
  console.log('✅ Para o paciente:', pacienteSelecionado.value?.nome)
  return realizados.length
})
const totalEvolucoes = computed(() => evolucoes.value.length)
const totalExames = computed(() => exames.value.length)
const totalPrescricoes = computed(() => prescricoes.value.length)

const ultimasAtividades = computed(() => {
  const atividades = []
  
  // Adicionar evoluções
  evolucoes.value.forEach(evolucao => {
    atividades.push({
      id: `evolucao-${evolucao.id}`,
      titulo: evolucao.titulo,
      descricao: evolucao.queixaPrincipal,
      data: evolucao.data,
      icon: 'fas fa-stethoscope'
    })
  })
  
  // Adicionar exames
  exames.value.forEach(exame => {
    atividades.push({
      id: `exame-${exame.id}`,
      titulo: exame.nome,
      descricao: `Resultado: ${exame.status}`,
      data: exame.dataRealizacao,
      icon: 'fas fa-vial'
    })
  })
  
  // Adicionar prescrições
  prescricoes.value.forEach(prescricao => {
    atividades.push({
      id: `prescricao-${prescricao.id}`,
      titulo: prescricao.titulo,
      descricao: `${prescricao.medicamentos.length} medicamento(s)`,
      data: prescricao.data,
      icon: 'fas fa-prescription-bottle'
    })
  })
  
  // Ordenar por data e pegar os últimos 10
  return atividades
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 10)
})

// Métodos
const buscarPacientes = async () => {
  if (!buscaPaciente.value.trim()) {
    pacientesEncontrados.value = []
    return
  }
  
  try {
    carregando.value = true
    console.log('🔍 Buscando pacientes com termo:', buscaPaciente.value)
    console.log('🏥 ClinicaId:', clinicaId.value)
    
    // Primeiro, vamos testar se existem dados em diferentes coleções
    console.log('📊 Testando coleções disponíveis...')
    
    // Teste 1: Buscar na coleção anamneses
    try {
      const qAnamneses = query(
        collection(db, 'anamneses'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )
      const snapshotAnamneses = await getDocs(qAnamneses)
      console.log('📋 Anamneses encontradas:', snapshotAnamneses.docs.length)
      
      if (snapshotAnamneses.docs.length > 0) {
        console.log('📋 Primeira anamnese:', snapshotAnamneses.docs[0].data())
      }
    } catch (err) {
      console.log('❌ Erro ao buscar anamneses:', err)
    }
    
    // Teste 2: Buscar na coleção pacientes (caso exista)
    try {
      const qPacientes = query(
        collection(db, 'pacientes'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )
      const snapshotPacientes = await getDocs(qPacientes)
      console.log('👥 Pacientes encontrados:', snapshotPacientes.docs.length)
      
      if (snapshotPacientes.docs.length > 0) {
        console.log('👥 Primeiro paciente:', snapshotPacientes.docs[0].data())
      }
    } catch (err) {
      console.log('❌ Erro ao buscar pacientes:', err)
    }
    
    // Teste 3: Buscar sem filtro de clinicaId
    try {
      const qSemFiltro = query(collection(db, 'anamneses'))
      const snapshotSemFiltro = await getDocs(qSemFiltro)
      console.log('🌐 Total de anamneses (sem filtro):', snapshotSemFiltro.docs.length)
      
      if (snapshotSemFiltro.docs.length > 0) {
        console.log('🌐 Primeira anamnese (sem filtro):', snapshotSemFiltro.docs[0].data())
      }
    } catch (err) {
      console.log('❌ Erro ao buscar sem filtro:', err)
    }
    
    // Agora vamos fazer a busca real
    const q = query(
      collection(db, 'anamneses'),
      where('clinicaId', '==', clinicaId.value || 'demo')
    )
    const snapshot = await getDocs(q)
    
    console.log('📊 Documentos encontrados na busca principal:', snapshot.docs.length)
    
    const todosPacientes = snapshot.docs.map(doc => {
      const data = doc.data()
      console.log('👤 Processando paciente:', data.nome, data)
      return {
        id: doc.id,
        nome: data.nome || 'Nome não informado',
        cpf: data.cpf || '',
        telefone: data.telefone || '',
        email: data.email || '',
        dataNascimento: data.dataNascimento || '',
        endereco: data.endereco || '',
        ...data
      }
    })
    
    console.log('👥 Pacientes mapeados:', todosPacientes.length)
    console.log('👥 Lista completa de pacientes:', todosPacientes)
    
    const termo = buscaPaciente.value.toLowerCase()
    console.log('🔍 Termo de busca:', termo)
    
    pacientesEncontrados.value = todosPacientes.filter(paciente => {
      const matchNome = paciente.nome.toLowerCase().includes(termo)
      const matchCpf = paciente.cpf && paciente.cpf.includes(termo)
      const matchTelefone = paciente.telefone && paciente.telefone.includes(termo)
      const matchEmail = paciente.email && paciente.email.toLowerCase().includes(termo)
      
      console.log(`🔍 ${paciente.nome}: nome=${matchNome}, cpf=${matchCpf}, telefone=${matchTelefone}, email=${matchEmail}`)
      
      return matchNome || matchCpf || matchTelefone || matchEmail
    })
    
    console.log('✅ Pacientes filtrados:', pacientesEncontrados.value.length)
    console.log('✅ Resultado final:', pacientesEncontrados.value)
    
  } catch (error) {
    console.error('❌ Erro ao buscar pacientes:', error)
    showError('Erro ao buscar pacientes: ' + error.message)
  } finally {
    carregando.value = false
  }
}

const selecionarPaciente = async (paciente) => {
  pacienteSelecionado.value = paciente
  await carregarProntuario()
}

// Funções de debug
const verificarDados = async () => {
  try {
    console.log('🔍 Verificando dados disponíveis...')
    
    // Verificar anamneses
    const qAnamneses = query(collection(db, 'anamneses'))
    const snapshotAnamneses = await getDocs(qAnamneses)
    console.log('📋 Total de anamneses:', snapshotAnamneses.docs.length)
    
    if (snapshotAnamneses.docs.length > 0) {
      console.log('📋 Primeira anamnese:', snapshotAnamneses.docs[0].data())
    }
    
    // Verificar pacientes
    const qPacientes = query(collection(db, 'pacientes'))
    const snapshotPacientes = await getDocs(qPacientes)
    console.log('👥 Total de pacientes:', snapshotPacientes.docs.length)
    
    if (snapshotPacientes.docs.length > 0) {
      console.log('👥 Primeiro paciente:', snapshotPacientes.docs[0].data())
    }
    
    showSuccess(`Encontrados: ${snapshotAnamneses.docs.length} anamneses, ${snapshotPacientes.docs.length} pacientes`)
  } catch (error) {
    console.error('Erro ao verificar dados:', error)
    showError('Erro ao verificar dados: ' + error.message)
  }
}

const criarDadosTeste = async () => {
  try {
    console.log('🧪 Criando dados de teste...')
    
    const dadosTeste = [
      {
        nome: 'João Silva',
        cpf: '123.456.789-00',
        telefone: '(11) 99999-9999',
        email: 'joao@email.com',
        dataNascimento: '1990-01-01',
        endereco: 'Rua das Flores, 123',
        clinicaId: clinicaId.value || 'demo',
        dataCriacao: serverTimestamp()
      },
      {
        nome: 'Maria Santos',
        cpf: '987.654.321-00',
        telefone: '(11) 88888-8888',
        email: 'maria@email.com',
        dataNascimento: '1985-05-15',
        endereco: 'Av. Principal, 456',
        clinicaId: clinicaId.value || 'demo',
        dataCriacao: serverTimestamp()
      },
      {
        nome: 'Pedro Oliveira',
        cpf: '456.789.123-00',
        telefone: '(11) 77777-7777',
        email: 'pedro@email.com',
        dataNascimento: '1992-12-10',
        endereco: 'Rua da Paz, 789',
        clinicaId: clinicaId.value || 'demo',
        dataCriacao: serverTimestamp()
      }
    ]
    
    for (const paciente of dadosTeste) {
      await addDoc(collection(db, 'anamneses'), paciente)
      console.log('✅ Paciente criado:', paciente.nome)
    }
    
    showSuccess('Dados de teste criados com sucesso!')
    
    // Recarregar a busca
    await buscarPacientes()
  } catch (error) {
    console.error('Erro ao criar dados de teste:', error)
    showError('Erro ao criar dados de teste: ' + error.message)
  }
}

const debugAtendimentos = async () => {
  try {
    console.log('🔍 DEBUG ATENDIMENTOS - Iniciando análise completa...')
    
    const colecoesParaTestar = [
      'agendamentos',
      'agenda', 
      'atendimentos',
      'consultas',
      'procedimentos',
      'appointments',
      'schedules'
    ]
    
    let relatorio = {
      colecoesEncontradas: [],
      totalDocumentos: 0,
      exemplos: []
    }
    
    for (const nomeColecao of colecoesParaTestar) {
      try {
        console.log(`🔍 Testando coleção: ${nomeColecao}`)
        const q = query(collection(db, nomeColecao))
        const snapshot = await getDocs(q)
        
        if (snapshot.docs.length > 0) {
          console.log(`✅ ${nomeColecao}: ${snapshot.docs.length} documentos`)
          relatorio.colecoesEncontradas.push({
            nome: nomeColecao,
            quantidade: snapshot.docs.length
          })
          relatorio.totalDocumentos += snapshot.docs.length
          
          // Pegar exemplo do primeiro documento
          const exemplo = snapshot.docs[0].data()
          relatorio.exemplos.push({
            colecao: nomeColecao,
            dados: exemplo
          })
          
          console.log(`📋 Exemplo de ${nomeColecao}:`, exemplo)
        } else {
          console.log(`❌ ${nomeColecao}: 0 documentos`)
        }
      } catch (err) {
        console.log(`❌ Erro ao acessar ${nomeColecao}:`, err.message)
      }
    }
    
    console.log('📊 RELATÓRIO COMPLETO:', relatorio)
    
    let mensagem = `Encontradas ${relatorio.colecoesEncontradas.length} coleções com dados:\n`
    relatorio.colecoesEncontradas.forEach(c => {
      mensagem += `• ${c.nome}: ${c.quantidade} documentos\n`
    })
    
    if (relatorio.exemplos.length > 0) {
      mensagem += `\nExemplos de campos encontrados:\n`
      relatorio.exemplos.forEach(e => {
        const campos = Object.keys(e.dados)
        mensagem += `• ${e.colecao}: ${campos.join(', ')}\n`
      })
    }
    
    showSuccess(mensagem)
    
  } catch (error) {
    console.error('❌ Erro no debug de atendimentos:', error)
    showError('Erro no debug: ' + error.message)
  }
}

const carregarProntuario = async () => {
  if (!pacienteSelecionado.value) return
  
  try {
    await Promise.all([
      carregarEvolucoes(),
      carregarExames(),
      carregarPrescricoes(),
      carregarAnamneses(),
      carregarAtendimentos()
    ])
  } catch (error) {
    console.error('Erro ao carregar prontuário:', error)
    showError('Erro ao carregar prontuário')
  }
}

const carregarEvolucoes = async () => {
  try {
    console.log('🔄 Carregando evoluções clínicas...')
    console.log('👤 Paciente ID:', pacienteSelecionado.value.id)
    console.log('👤 Paciente Nome:', pacienteSelecionado.value.nome)
    
    // Primeiro, tentar buscar por pacienteId
    let q = query(
      collection(db, 'evolucoes_clinicas'),
      where('pacienteId', '==', pacienteSelecionado.value.id)
    )
    
    let snapshot
    try {
      snapshot = await getDocs(q)
      console.log('📊 Evoluções encontradas por pacienteId:', snapshot.docs.length)
    } catch (error) {
      console.log('❌ Erro ao buscar por pacienteId, tentando sem filtro:', error.message)
      
      // Se falhar, buscar todas e filtrar localmente
      q = query(collection(db, 'evolucoes_clinicas'))
      snapshot = await getDocs(q)
      console.log('📊 Total de evoluções encontradas:', snapshot.docs.length)
      
      // Filtrar localmente por pacienteId
      const evolucoesDoPaciente = snapshot.docs.filter(doc => {
        const data = doc.data()
        return data.pacienteId === pacienteSelecionado.value.id || 
               data.pacienteNome === pacienteSelecionado.value.nome
      })
      
      console.log('📊 Evoluções do paciente (filtro local):', evolucoesDoPaciente.length)
      
      evolucoes.value = evolucoesDoPaciente.map(doc => {
        const data = doc.data()
        console.log('📋 Evolução:', data)
        return {
          id: doc.id,
          ...data
        }
      })
      
      console.log('✅ Evoluções carregadas:', evolucoes.value.length)
      return
    }
    
    evolucoes.value = snapshot.docs.map(doc => {
      const data = doc.data()
      console.log('📋 Evolução:', data)
      return {
        id: doc.id,
        ...data
      }
    })
    
    console.log('✅ Evoluções carregadas:', evolucoes.value.length)
  } catch (error) {
    console.error('❌ Erro ao carregar evoluções:', error)
    showError('Erro ao carregar evoluções: ' + error.message)
  }
}

const carregarExames = async () => {
  const q = query(
    collection(db, 'exames'),
    where('pacienteId', '==', pacienteSelecionado.value.id),
    orderBy('dataRealizacao', 'desc')
  )
  const snapshot = await getDocs(q)
  exames.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

const carregarPrescricoes = async () => {
  const q = query(
    collection(db, 'prescricoes'),
    where('pacienteId', '==', pacienteSelecionado.value.id),
    orderBy('data', 'desc')
  )
  const snapshot = await getDocs(q)
  prescricoes.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

const carregarAnamneses = async () => {
  const q = query(
    collection(db, 'anamneses'),
    where('clienteId', '==', pacienteSelecionado.value.id),
    orderBy('dataCriacao', 'desc')
  )
  const snapshot = await getDocs(q)
  anamneses.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

const carregarAtendimentos = async () => {
  try {
    console.log('🏥 Carregando atendimentos para paciente:', pacienteSelecionado.value.nome)
    console.log('🏥 ClinicaId:', clinicaId.value)
    
    // Primeiro, vamos testar diferentes coleções possíveis
    const colecoesParaTestar = [
      'agendamentos',
      'agenda', 
      'atendimentos',
      'consultas',
      'procedimentos'
    ]
    
    let dadosEncontrados = []
    let colecaoUsada = ''
    
    for (const nomeColecao of colecoesParaTestar) {
      try {
        console.log(`🔍 Testando coleção: ${nomeColecao}`)
        const q = query(
          collection(db, nomeColecao),
          where('clinicaId', '==', clinicaId.value || 'demo')
        )
        const snapshot = await getDocs(q)
        console.log(`📊 ${nomeColecao}: ${snapshot.docs.length} documentos`)
        
        if (snapshot.docs.length > 0) {
          console.log(`✅ Encontrou dados em: ${nomeColecao}`)
          console.log(`📋 Primeiro documento:`, snapshot.docs[0].data())
          dadosEncontrados = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          colecaoUsada = nomeColecao
          break
        }
      } catch (err) {
        console.log(`❌ Erro ao acessar ${nomeColecao}:`, err.message)
      }
    }
    
    if (dadosEncontrados.length === 0) {
      console.log('❌ Nenhuma coleção com dados encontrada')
      // Tentar buscar sem filtro de clinicaId
      try {
        console.log('🔍 Tentando buscar sem filtro de clinicaId...')
        const q = query(collection(db, 'agendamentos'))
        const snapshot = await getDocs(q)
        console.log(`📊 Agendamentos (sem filtro): ${snapshot.docs.length} documentos`)
        
        if (snapshot.docs.length > 0) {
          console.log('📋 Primeiro agendamento (sem filtro):', snapshot.docs[0].data())
          dadosEncontrados = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          colecaoUsada = 'agendamentos'
        }
      } catch (err) {
        console.log('❌ Erro ao buscar sem filtro:', err.message)
      }
    }
    
    console.log(`📊 Usando coleção: ${colecaoUsada}`)
    console.log(`📊 Total de documentos: ${dadosEncontrados.length}`)
    
    // Filtrar por nome do paciente E status realizado
    const atendimentosDoPaciente = dadosEncontrados.filter(agendamento => {
      const nomePaciente = agendamento.cliente?.toLowerCase() || 
                          agendamento.nomeCliente?.toLowerCase() || 
                          agendamento.paciente?.toLowerCase() || ''
      const nomeSelecionado = pacienteSelecionado.value.nome.toLowerCase()
      const statusRealizado = agendamento.status?.toLowerCase() === 'realizado'
      
      console.log(`🔍 COMPARAÇÃO PARA JULIANA:`)
      console.log(`🔍 Nome do paciente no agendamento: "${nomePaciente}"`)
      console.log(`🔍 Nome selecionado: "${nomeSelecionado}"`)
      console.log(`🔍 Status: "${agendamento.status}" -> Realizado: ${statusRealizado}`)
      console.log(`🔍 Dados completos do agendamento:`, {
        cliente: agendamento.cliente,
        nomeCliente: agendamento.nomeCliente,
        paciente: agendamento.paciente,
        procedimento: agendamento.procedimento,
        status: agendamento.status
      })
      
      const nomeMatch = nomePaciente.includes(nomeSelecionado) || 
                       nomeSelecionado.includes(nomePaciente) ||
                       nomePaciente === nomeSelecionado
      
      console.log(`🔍 Nome match: ${nomeMatch}`)
      console.log(`🔍 Status match: ${statusRealizado}`)
      console.log(`🔍 Resultado final: ${nomeMatch && statusRealizado}`)
      
      return nomeMatch && statusRealizado
    })
    
    console.log('👤 Atendimentos do paciente:', atendimentosDoPaciente.length)
    console.log('📋 Lista de atendimentos:', atendimentosDoPaciente)
    
    atendimentos.value = atendimentosDoPaciente
    
    if (atendimentosDoPaciente.length === 0 && dadosEncontrados.length > 0) {
      console.log('⚠️ Encontrou dados mas nenhum match com o paciente')
      console.log('📋 Todos os nomes encontrados:', dadosEncontrados.map(d => ({
        cliente: d.cliente,
        nomeCliente: d.nomeCliente,
        paciente: d.paciente
      })))
    }
    
  } catch (error) {
    console.error('❌ Erro ao carregar atendimentos:', error)
    showError('Erro ao carregar atendimentos: ' + error.message)
  }
}

// Modais
const abrirModalNovaEvolucao = () => {
  console.log('🔓 Abrindo modal de nova evolução...')
  console.log('👤 Paciente selecionado:', pacienteSelecionado.value)
  
  // Buscar o último profissional que atendeu este paciente
  const ultimoProfissional = buscarUltimoProfissional()
  console.log('👨‍⚕️ Último profissional encontrado:', ultimoProfissional)
  
  evolucaoEditando.value = null
  modalEvolucao.value = true
  console.log('✅ Modal aberto:', modalEvolucao.value)
}

// Função para buscar o último profissional que atendeu o paciente
const buscarUltimoProfissional = () => {
  if (!atendimentos.value || atendimentos.value.length === 0) {
    console.log('❌ Nenhum atendimento encontrado para buscar profissional')
    return ''
  }
  
  // Buscar o atendimento mais recente com profissional
  const atendimentoComProfissional = atendimentos.value
    .filter(atendimento => atendimento.profissional && atendimento.profissional.trim() !== '')
    .sort((a, b) => {
      // Ordenar por data mais recente
      const dataA = new Date(a.dataHora || a.data || 0)
      const dataB = new Date(b.dataHora || b.data || 0)
      return dataB - dataA
    })
  
  if (atendimentoComProfissional.length > 0) {
    const profissional = atendimentoComProfissional[0].profissional
    console.log('✅ Profissional encontrado:', profissional)
    return profissional
  }
  
  console.log('❌ Nenhum profissional encontrado nos atendimentos')
  return ''
}

const abrirModalNovoExame = () => {
  exameEditando.value = null
  modalExame.value = true
}

const abrirModalNovaPrescricao = () => {
  prescricaoEditando.value = null
  modalPrescricao.value = true
}

const fecharModalEvolucao = () => {
  modalEvolucao.value = false
  evolucaoEditando.value = null
}

const fecharModalExame = () => {
  modalExame.value = false
  exameEditando.value = null
}

const fecharModalPrescricao = () => {
  modalPrescricao.value = false
  prescricaoEditando.value = null
}

// Ações
const editarEvolucao = (evolucao) => {
  console.log('✏️ Editando evolução clínica...')
  console.log('📋 Evolução selecionada:', evolucao)
  console.log('👤 Paciente:', pacienteSelecionado.value)
  
  evolucaoEditando.value = evolucao
  modalEvolucao.value = true
  
  console.log('✅ Modal de edição aberto:', modalEvolucao.value)
  console.log('✅ Evolução sendo editada:', evolucaoEditando.value)
}

const excluirEvolucao = async (evolucao) => {
  if (confirm('Tem certeza que deseja excluir esta evolução?')) {
    try {
      await deleteDoc(doc(db, 'evolucoes_clinicas', evolucao.id))
      await carregarEvolucoes()
      showSuccess('Evolução excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir evolução:', error)
      showError('Erro ao excluir evolução')
    }
  }
}

const editarPrescricao = (prescricao) => {
  prescricaoEditando.value = prescricao
  modalPrescricao.value = true
}

const imprimirPrescricao = (prescricao) => {
  // Implementar impressão
  window.print()
}

// Salvar dados
const salvarEvolucao = async (dadosEvolucao) => {
  try {
    console.log('💾 Salvando evolução clínica...')
    console.log('📋 Dados recebidos:', dadosEvolucao)
    console.log('👤 Paciente selecionado:', pacienteSelecionado.value)
    console.log('🏥 ClinicaId:', clinicaId.value)
    
    const dados = {
      ...dadosEvolucao,
      pacienteId: pacienteSelecionado.value.id,
      pacienteNome: pacienteSelecionado.value.nome,
      clinicaId: clinicaId.value || 'demo',
      data: serverTimestamp()
    }
    
    console.log('📊 Dados completos para salvar:', dados)
    
    if (evolucaoEditando.value) {
      console.log('✏️ Editando evolução existente:', evolucaoEditando.value.id)
      await updateDoc(doc(db, 'evolucoes_clinicas', evolucaoEditando.value.id), dados)
    } else {
      console.log('➕ Criando nova evolução')
      const docRef = await addDoc(collection(db, 'evolucoes_clinicas'), dados)
      console.log('✅ Evolução criada com ID:', docRef.id)
    }
    
    console.log('🔄 Recarregando evoluções...')
    await carregarEvolucoes()
    
    console.log('❌ Fechando modal...')
    fecharModalEvolucao()
    
    console.log('✅ Mostrando sucesso...')
    showSuccess('Evolução salva com sucesso')
    
  } catch (error) {
    console.error('❌ Erro ao salvar evolução:', error)
    console.error('❌ Stack trace:', error.stack)
    showError('Erro ao salvar evolução: ' + error.message)
  }
}

const salvarExame = async (dadosExame) => {
  try {
    const dados = {
      ...dadosExame,
      pacienteId: pacienteSelecionado.value.id,
      pacienteNome: pacienteSelecionado.value.nome,
      clinicaId: clinicaId.value || 'demo',
      dataRealizacao: serverTimestamp()
    }
    
    if (exameEditando.value) {
      await updateDoc(doc(db, 'exames', exameEditando.value.id), dados)
    } else {
      await addDoc(collection(db, 'exames'), dados)
    }
    
    await carregarExames()
    fecharModalExame()
    showSuccess('Exame salvo com sucesso')
  } catch (error) {
    console.error('Erro ao salvar exame:', error)
    showError('Erro ao salvar exame')
  }
}

const salvarPrescricao = async (dadosPrescricao) => {
  try {
    const dados = {
      ...dadosPrescricao,
      pacienteId: pacienteSelecionado.value.id,
      pacienteNome: pacienteSelecionado.value.nome,
      clinicaId: clinicaId.value || 'demo',
      data: serverTimestamp()
    }
    
    if (prescricaoEditando.value) {
      await updateDoc(doc(db, 'prescricoes', prescricaoEditando.value.id), dados)
    } else {
      await addDoc(collection(db, 'prescricoes'), dados)
    }
    
    await carregarPrescricoes()
    fecharModalPrescricao()
    showSuccess('Prescrição salva com sucesso')
  } catch (error) {
    console.error('Erro ao salvar prescrição:', error)
    showError('Erro ao salvar prescrição')
  }
}

// Utilitários
const formatarData = (data) => {
  if (!data) return ''
  const d = data.toDate ? data.toDate() : new Date(data)
  return d.toLocaleDateString('pt-BR')
}

const calcularIdade = (dataNascimento) => {
  if (!dataNascimento) return ''
  const hoje = new Date()
  const nascimento = dataNascimento.toDate ? dataNascimento.toDate() : new Date(dataNascimento)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mes = hoje.getMonth() - nascimento.getMonth()
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  return idade
}

// Funções auxiliares para atendimentos
const formatarHora = (dataHora) => {
  if (!dataHora) return ''
  const data = new Date(dataHora)
  return data.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatarMoeda = (valor) => {
  if (!valor) return '0,00'
  return parseFloat(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const getStatusClass = (status) => {
  const statusMap = {
    'realizado': 'status-realizado',
    'agendado': 'status-agendado',
    'cancelado': 'status-cancelado',
    'pendente': 'status-pendente'
  }
  return statusMap[status?.toLowerCase()] || 'status-pendente'
}

const getStatusText = (status) => {
  const statusMap = {
    'realizado': 'Realizado',
    'agendado': 'Agendado',
    'cancelado': 'Cancelado',
    'pendente': 'Pendente'
  }
  return statusMap[status?.toLowerCase()] || 'Pendente'
}

// Busca em tempo real com debounce
let timeoutId = null
watch(buscaPaciente, (novoValor) => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  
  timeoutId = setTimeout(() => {
    buscarPacientes()
  }, 300) // Aguarda 300ms após parar de digitar
})

onMounted(() => {
  // Inicialização se necessário
})
</script>

<style scoped>
/* Layout principal */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

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

/* Seleção de Paciente */
.patient-selection {
  text-align: center;
  padding: 40px 20px;
}

.patient-selection h2 {
  color: #1d1d1f;
  margin-bottom: 8px;
}

.patient-selection p {
  color: #6b7280;
  margin-bottom: 32px;
}

.search-section {
  margin-bottom: 32px;
}

.search-input {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-input i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-input input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.search-input input:focus {
  outline: none;
  border-color: #3b82f6;
}

.patients-list {
  display: grid;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.patient-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.patient-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.patient-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.patient-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.patient-avatar i {
  font-size: 24px;
  color: #6b7280;
}

.patient-info {
  flex: 1;
  text-align: left;
}

.patient-info h3 {
  margin: 0 0 8px 0;
  color: #1d1d1f;
  font-size: 18px;
}

.patient-info p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.patient-actions i {
  color: #6b7280;
  font-size: 18px;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.no-results i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d1d5db;
}

.search-tips {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.search-tips p {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.search-tips ul {
  margin: 0;
  padding-left: 1.5rem;
}

.search-tips li {
  margin-bottom: 0.25rem;
  color: #555;
}

.debug-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.debug-actions .btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.debug-actions .btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
}

.debug-actions .btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.debug-actions .btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

/* Estilos para atendimentos */
.atendimentos-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.atendimento-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.atendimento-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.atendimento-info h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.atendimento-info p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.atendimento-info i {
  width: 16px;
  color: #9ca3af;
}

.atendimento-status span {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-realizado {
  background: #d1fae5;
  color: #065f46;
}

.status-agendado {
  background: #dbeafe;
  color: #1e40af;
}

.status-cancelado {
  background: #fee2e2;
  color: #991b1b;
}

.status-pendente {
  background: #fef3c7;
  color: #92400e;
}

.atendimento-observacoes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.atendimento-observacoes p {
  margin: 0;
  color: #4b5563;
  font-size: 0.9rem;
}

/* Cabeçalho do Paciente */
.patient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.patient-main-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.patient-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.patient-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.patient-avatar-large i {
  font-size: 32px;
  color: #6b7280;
}

.patient-details h2 {
  margin: 0 0 8px 0;
  color: #1d1d1f;
  font-size: 24px;
}

.patient-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.patient-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 14px;
}

.patient-actions-header {
  display: flex;
  gap: 12px;
}

/* Tabs */
.prontuario-tabs {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  color: #6b7280;
}

.tab-button:hover {
  background: #f3f4f6;
  color: #1d1d1f;
}

.tab-button.active {
  background: #3b82f6;
  color: white;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Conteúdo das Tabs */
.tab-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Resumo */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.card-content h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #1d1d1f;
}

.card-content p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.recent-activities h3 {
  margin: 0 0 20px 0;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.activity-content h4 {
  margin: 0 0 4px 0;
  color: #1d1d1f;
  font-size: 16px;
}

.activity-content p {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 14px;
}

.activity-date {
  color: #9ca3af;
  font-size: 12px;
}

/* Seções */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #d1d5db;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #1d1d1f;
}

.empty-state p {
  margin: 0 0 24px 0;
}

/* Cards de conteúdo */
.evolucao-card,
.exame-card,
.prescricao-card,
.anamnese-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.evolucao-header,
.exame-header,
.prescricao-header,
.anamnese-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.evolucao-info h4,
.exame-info h4,
.prescricao-info h4,
.anamnese-info h4 {
  margin: 0 0 4px 0;
  color: #1d1d1f;
}

.evolucao-data,
.exame-data,
.prescricao-data,
.anamnese-data {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.evolucao-actions,
.prescricao-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
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

.btn-icon:hover {
  background: #e5e7eb;
  color: #1d1d1f;
}

.btn-icon.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.exame-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.exame-status.pendente {
  background: #fef3c7;
  color: #d97706;
}

.exame-status.concluido {
  background: #d1fae5;
  color: #059669;
}

.anamnese-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.anamnese-status.pendente {
  background: #fef3c7;
  color: #d97706;
}

.anamnese-status.analisada {
  background: #d1fae5;
  color: #059669;
}

.anamnese-origem {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 14px;
}

.evolucao-content,
.exame-content,
.prescricao-content,
.anamnese-content {
  color: #374151;
  line-height: 1.6;
}

.evolucao-content p,
.exame-content p,
.prescricao-content p,
.anamnese-content p {
  margin: 8px 0;
}

.anamnese-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.anamnese-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.anamnese-section h5 {
  margin: 0 0 8px 0;
  color: #1d1d1f;
  font-size: 16px;
}

.medicamentos ul {
  margin: 8px 0;
  padding-left: 20px;
}

.medicamentos li {
  margin: 4px 0;
}

.orientacoes {
  margin-top: 16px;
}

.exame-anexos {
  margin-top: 16px;
}

.anexos-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.anexo-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 12px;
  transition: background 0.2s;
}

.anexo-link:hover {
  background: #2563eb;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .patient-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .patient-main-info {
    flex-direction: column;
    text-align: center;
  }
  
  .patient-meta {
    justify-content: center;
  }
  
  .prontuario-tabs {
    flex-direction: column;
  }
  
  .tab-button {
    justify-content: flex-start;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>
