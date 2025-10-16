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

      let q = query(
        collection(db, 'agendamentos'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      if (dataInicio && dataFim) {
        q = query(
          q,
          where('dataHora', '>=', Timestamp.fromDate(new Date(dataInicio))),
          where('dataHora', '<=', Timestamp.fromDate(new Date(dataFim))),
          orderBy('dataHora', 'asc')
        )
      } else {
        q = query(q, orderBy('dataHora', 'asc'))
      }

      const snapshot = await getDocs(q)
      agendamentos.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return agendamentos.value
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err)
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

      // Verificar conflito de horário
      const conflito = await verificarConflito(dados.dataHora, dados.profissional)
      if (conflito) {
        erro.value = 'Já existe um agendamento neste horário para este profissional'
        return { success: false, error: erro.value }
      }

      const agendamento = {
        ...dados,
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
  const verificarConflito = async (dataHora, profissional) => {
    try {
      const dataConsulta = new Date(dataHora)
      const inicio = new Date(dataConsulta.getTime() - 30 * 60000) // 30 min antes
      const fim = new Date(dataConsulta.getTime() + 30 * 60000) // 30 min depois

      const q = query(
        collection(db, 'agendamentos'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('profissional', '==', profissional),
        where('status', 'in', ['confirmado', 'aguardando']),
        where('dataHora', '>=', Timestamp.fromDate(inicio)),
        where('dataHora', '<=', Timestamp.fromDate(fim))
      )

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

