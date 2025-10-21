import { ref, computed } from 'vue'
import { db } from '../firebase.js'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useAgendamento() {
  const { clinicaId } = useClinica()
  const agendamentos = ref([])
  const carregando = ref(false)
  const erro = ref('')

  /**
   * Buscar agendamentos
   */
  const buscarAgendamentos = async (dataInicio, dataFim) => {
    try {
      carregando.value = true
      erro.value = ''
      console.log('=== BUSCANDO AGENDAMENTOS ===')
      console.log('clinicaId:', clinicaId.value)
      console.log('dataInicio:', dataInicio)
      console.log('dataFim:', dataFim)

      let q = query(
        collection(db, 'agendamentos'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      // TEMPORÁRIO: Buscar todos os agendamentos sem filtro de data e sem orderBy para evitar erro de índice
      console.log('Buscando todos os agendamentos (sem filtro de data e sem orderBy - temporário)')
      // q = query(q, orderBy('dataHora', 'asc')) // Removido para evitar erro de índice
      
      // TODO: Implementar filtro de data após criar índice no Firebase
      // if (dataInicio && dataFim) {
      //   console.log('Aplicando filtro de data')
      //   const ini = new Date(dataInicio)
      //   ini.setHours(0, 0, 0, 0)
      //   const fim = new Date(dataFim)
      //   fim.setHours(23, 59, 59, 999)
      //   q = query(q,
      //     where('dataHora', '>=', Timestamp.fromDate(ini)),
      //     where('dataHora', '<=', Timestamp.fromDate(fim)),
      //     orderBy('dataHora', 'asc'))
      // }

      console.log('Executando query...')
      const snapshot = await getDocs(q)
      agendamentos.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log('Total de agendamentos encontrados:', agendamentos.value.length)
      console.log('Lista de agendamentos:', agendamentos.value.map(a => ({ 
        id: a.id, 
        cliente: a.clienteNome, 
        procedimento: a.procedimento,
        dataHora: a.dataHora, 
        clinicaId: a.clinicaId 
      })))

      return agendamentos.value
    } catch (err) {
      console.error('❌ ERRO AO BUSCAR AGENDAMENTOS:', err)
      console.error('Tipo do erro:', err.name)
      console.error('Mensagem:', err.message)
      console.error('Stack:', err.stack)
      erro.value = 'Erro ao carregar agendamentos'
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Criar agendamento
   */
  const criarAgendamento = async (dados) => {
    try {
      carregando.value = true
      erro.value = ''

      // Verificar conflito de horário (usa profissionalId se disponível)
      const conflito = await verificarConflito(dados.dataHora, dados.profissionalId || dados.profissional)
      if (conflito) {
        erro.value = 'Já existe um agendamento neste horário para este profissional'
        return { success: false, error: erro.value }
      }

      const agendamento = {
        ...dados,
        // Normalização dos campos de associação (armazenar chaves e rótulos)
        clienteId: dados.clienteId || dados.pacienteId || null,
        clienteNome: dados.clienteNome || dados.pacienteNome || '',
        profissionalId: dados.profissionalId || null,
        profissional: dados.profissional || '',
        procedimentoId: dados.procedimentoId || null,
        procedimento: dados.procedimento || '',
        clinicaId: clinicaId.value || 'demo',
        dataHora: Timestamp.fromDate(new Date(dados.dataHora)),
        status: dados.status || 'confirmado',
        dataCriacao: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'agendamentos'), agendamento)
      
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Erro ao criar agendamento:', err)
      erro.value = 'Erro ao criar agendamento'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Atualizar agendamento
   */
  const atualizarAgendamento = async (agendamentoId, dados) => {
    try {
      carregando.value = true
      erro.value = ''

      const agendamentoRef = doc(db, 'agendamentos', agendamentoId)
      
      const dadosAtualizacao = { ...dados }
      if (dados.dataHora) {
        dadosAtualizacao.dataHora = Timestamp.fromDate(new Date(dados.dataHora))
      }

      await updateDoc(agendamentoRef, dadosAtualizacao)

      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err)
      erro.value = 'Erro ao atualizar agendamento'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Cancelar agendamento
   */
  const cancelarAgendamento = async (agendamentoId, motivo = '') => {
    try {
      carregando.value = true
      erro.value = ''

      const agendamentoRef = doc(db, 'agendamentos', agendamentoId)
      await updateDoc(agendamentoRef, {
        status: 'cancelado',
        motivoCancelamento: motivo,
        dataCancelamento: serverTimestamp()
      })

      return { success: true }
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err)
      erro.value = 'Erro ao cancelar agendamento'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Confirmar presença
   */
  const confirmarPresenca = async (agendamentoId) => {
    try {
      carregando.value = true
      erro.value = ''

      const agendamentoRef = doc(db, 'agendamentos', agendamentoId)
      await updateDoc(agendamentoRef, {
        status: 'realizado',
        dataRealizacao: serverTimestamp()
      })

      return { success: true }
    } catch (err) {
      console.error('Erro ao confirmar presença:', err)
      erro.value = 'Erro ao confirmar presença'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Excluir agendamento
   */
  const excluirAgendamento = async (agendamentoId) => {
    try {
      carregando.value = true
      erro.value = ''

      await deleteDoc(doc(db, 'agendamentos', agendamentoId))
      return { success: true }
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err)
      erro.value = 'Erro ao excluir agendamento'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Verificar conflito de horário
   */
  const verificarConflito = async (dataHora, profissionalOuId) => {
    try {
      const dataConsulta = new Date(dataHora)
      const inicio = new Date(dataConsulta.getTime() - 30 * 60000) // 30 min antes
      const fim = new Date(dataConsulta.getTime() + 30 * 60000) // 30 min depois

      // Priorizar verificação por ID se fornecido
      const filtrosBase = [
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('status', 'in', ['confirmado', 'aguardando']),
        where('dataHora', '>=', Timestamp.fromDate(inicio)),
        where('dataHora', '<=', Timestamp.fromDate(fim))
      ]

      let q
      if (profissionalOuId && typeof profissionalOuId === 'string' && profissionalOuId.length > 0) {
        // Tentar por ID
        q = query(collection(db, 'agendamentos'), where('profissionalId', '==', profissionalOuId), ...filtrosBase)
      } else {
        // Fallback por nome (retrocompatibilidade)
        q = query(collection(db, 'agendamentos'), where('profissional', '==', profissionalOuId || ''), ...filtrosBase)
      }

      const snapshot = await getDocs(q)
      return snapshot.size > 0
    } catch (err) {
      console.error('Erro ao verificar conflito:', err)
      return false
    }
  }

  /**
   * Buscar horários disponíveis
   */
  const buscarHorariosDisponiveis = async (data, profissional, duracao = 60) => {
    try {
      const horarios = []
      const dataConsulta = new Date(data)
      
      // Horário comercial: 8h às 18h
      const horaInicio = 8
      const horaFim = 18
      const intervalo = duracao / 60 // intervalo em horas

      for (let hora = horaInicio; hora < horaFim; hora += intervalo) {
        const horario = new Date(dataConsulta)
        horario.setHours(Math.floor(hora), (hora % 1) * 60, 0, 0)

        const conflito = await verificarConflito(horario, profissional)
        
        horarios.push({
          horario: horario.toTimeString().slice(0, 5),
          disponivel: !conflito,
          dataHora: horario.toISOString()
        })
      }

      return horarios
    } catch (err) {
      console.error('Erro ao buscar horários:', err)
      return []
    }
  }

  /**
   * Estatísticas de agendamentos
   */
  const estatisticas = computed(() => {
    const total = agendamentos.value.length
    const confirmados = agendamentos.value.filter(a => a.status === 'confirmado').length
    const realizados = agendamentos.value.filter(a => a.status === 'realizado').length
    const cancelados = agendamentos.value.filter(a => a.status === 'cancelado').length
    const aguardando = agendamentos.value.filter(a => a.status === 'aguardando').length

    return {
      total,
      confirmados,
      realizados,
      cancelados,
      aguardando,
      taxaComparecimento: total > 0 ? (realizados / total) * 100 : 0,
      taxaCancelamento: total > 0 ? (cancelados / total) * 100 : 0
    }
  })

  return {
    // Estado
    agendamentos,
    carregando,
    erro,
    estatisticas,

    // Métodos
    buscarAgendamentos,
    criarAgendamento,
    atualizarAgendamento,
    cancelarAgendamento,
    confirmarPresenca,
    excluirAgendamento,
    verificarConflito,
    buscarHorariosDisponiveis
  }
}

