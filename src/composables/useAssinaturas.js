import { ref, computed } from 'vue'
import { db } from '../firebase.js'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs,
  getDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useAssinaturas() {
  const { clinicaId } = useClinica()
  const assinaturaAtual = ref(null)
  const historico = ref([])
  const carregando = ref(false)
  const erro = ref('')

  /**
   * Buscar assinatura ativa da clínica
   */
  const obterAssinaturaAtiva = async () => {
    try {
      carregando.value = true
      erro.value = ''

      const q = query(
        collection(db, 'assinaturas'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('status', '==', 'ativa'),
        orderBy('dataCriacao', 'desc')
      )

      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const assinatura = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        }

        // Buscar dados do plano
        if (assinatura.planoId) {
          const planoRef = doc(db, 'planos', assinatura.planoId)
          const planoDoc = await getDoc(planoRef)
          
          if (planoDoc.exists()) {
            assinatura.plano = planoDoc.data()
          }
        }

        assinaturaAtual.value = assinatura
        return assinatura
      }

      return null
    } catch (err) {
      console.error('Erro ao buscar assinatura ativa:', err)
      erro.value = 'Erro ao carregar assinatura'
      return null
    } finally {
      carregando.value = false
    }
  }

  /**
   * Criar nova assinatura
   */
  const criarAssinatura = async (dados) => {
    try {
      console.log('Criando assinatura:', dados)

      // Buscar dados do plano
      const planoRef = doc(db, 'planos', dados.planoId)
      const planoDoc = await getDoc(planoRef)
      
      if (!planoDoc.exists()) {
        return { success: false, error: 'Plano não encontrado' }
      }

      const planoData = planoDoc.data()
      const ehTrial = dados.trial === true

      // Calcular datas
      const dataInicio = new Date()
      const dataExpiracao = new Date()
      
      if (ehTrial) {
        dataExpiracao.setDate(dataExpiracao.getDate() + 14) // 14 dias de trial
      } else if (dados.periodo === 'anual') {
        dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1)
      } else {
        dataExpiracao.setMonth(dataExpiracao.getMonth() + 1)
      }

      const proximaCobranca = ehTrial 
        ? dataExpiracao 
        : new Date(dataInicio.setMonth(dataInicio.getMonth() + 1))

      const assinatura = {
        clinicaId: clinicaId.value || 'demo',
        planoId: dados.planoId,
        planoNome: planoData.nome,
        status: ehTrial ? 'trial' : 'ativa',
        dataInicio: Timestamp.fromDate(new Date()),
        dataExpiracao: Timestamp.fromDate(dataExpiracao),
        periodo: dados.periodo || 'mensal',
        formaPagamento: dados.formaPagamento || '',
        valorMensal: dados.periodo === 'anual' ? planoData.valorAnual / 12 : planoData.valorMensal,
        valorTotal: dados.periodo === 'anual' ? planoData.valorAnual : planoData.valorMensal,
        proximaCobranca: Timestamp.fromDate(proximaCobranca),
        diasRestantesGratis: ehTrial ? 14 : 0,
        pagamentoAutomatico: dados.pagamentoAutomatico || false,
        limites: {
          usuarios: planoData.limiteUsuarios,
          pacientes: planoData.limitePacientes,
          agendamentos: planoData.limiteAgendamentos,
          armazenamento: planoData.limiteArmazenamento
        },
        recursos: planoData.recursos,
        dataCriacao: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'assinaturas'), assinatura)
      
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao criar assinatura:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Atualizar assinatura (mudança de plano)
   */
  const atualizarAssinatura = async (assinaturaId, novoPlanoId) => {
    try {
      // Buscar novo plano
      const planoRef = doc(db, 'planos', novoPlanoId)
      const planoDoc = await getDoc(planoRef)
      
      if (!planoDoc.exists()) {
        return { success: false, error: 'Plano não encontrado' }
      }

      const planoData = planoDoc.data()
      
      const assinaturaRef = doc(db, 'assinaturas', assinaturaId)
      
      await updateDoc(assinaturaRef, {
        planoId: novoPlanoId,
        planoNome: planoData.nome,
        valorMensal: planoData.valorMensal,
        limites: {
          usuarios: planoData.limiteUsuarios,
          pacientes: planoData.limitePacientes,
          agendamentos: planoData.limiteAgendamentos,
          armazenamento: planoData.limiteArmazenamento
        },
        recursos: planoData.recursos,
        dataMudancaPlano: serverTimestamp(),
        dataAtualizacao: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Cancelar assinatura
   */
  const cancelarAssinatura = async (assinaturaId, motivo = '') => {
    try {
      const assinaturaRef = doc(db, 'assinaturas', assinaturaId)
      
      await updateDoc(assinaturaRef, {
        status: 'cancelada',
        motivoCancelamento: motivo,
        dataCancelamento: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Reativar assinatura
   */
  const reativarAssinatura = async (assinaturaId) => {
    try {
      const assinaturaRef = doc(db, 'assinaturas', assinaturaId)
      
      // Calcular nova data de expiração
      const novaExpiracao = new Date()
      novaExpiracao.setMonth(novaExpiracao.getMonth() + 1)

      await updateDoc(assinaturaRef, {
        status: 'ativa',
        dataExpiracao: Timestamp.fromDate(novaExpiracao),
        dataReativacao: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao reativar assinatura:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Verificar se está dentro dos limites do plano
   */
  const verificarLimites = async (tipo, valorAtual) => {
    if (!assinaturaAtual.value) {
      await obterAssinaturaAtiva()
    }

    if (!assinaturaAtual.value || !assinaturaAtual.value.limites) {
      return { dentroLimite: true, limite: -1 } // Sem assinatura = sem limites (modo demo)
    }

    const limites = assinaturaAtual.value.limites
    let limite

    switch (tipo) {
      case 'usuarios':
        limite = limites.usuarios
        break
      case 'pacientes':
        limite = limites.pacientes
        break
      case 'agendamentos':
        limite = limites.agendamentos
        break
      case 'armazenamento':
        limite = limites.armazenamento
        break
      default:
        return { dentroLimite: true, limite: -1 }
    }

    // -1 significa ilimitado
    if (limite === -1) {
      return { dentroLimite: true, limite: -1, percentualUso: 0 }
    }

    const dentroLimite = valorAtual < limite
    const percentualUso = Math.round((valorAtual / limite) * 100)

    return {
      dentroLimite,
      limite,
      valorAtual,
      percentualUso,
      faltam: limite - valorAtual
    }
  }

  /**
   * Bloquear recursos se assinatura inativa
   */
  const verificarBloqueio = () => {
    if (!assinaturaAtual.value) {
      return { bloqueado: false, motivo: '' }
    }

    const status = assinaturaAtual.value.status

    if (status === 'cancelada') {
      return {
        bloqueado: true,
        motivo: 'Assinatura cancelada. Reative para continuar usando.'
      }
    }

    if (status === 'suspensa' || status === 'inadimplente') {
      return {
        bloqueado: true,
        motivo: 'Assinatura suspensa por falta de pagamento. Regularize para continuar.'
      }
    }

    // Verificar expiração
    const dataExpiracao = assinaturaAtual.value.dataExpiracao?.toDate 
      ? assinaturaAtual.value.dataExpiracao.toDate()
      : new Date(assinaturaAtual.value.dataExpiracao)

    if (new Date() > dataExpiracao) {
      return {
        bloqueado: true,
        motivo: 'Assinatura expirada. Renove para continuar usando.'
      }
    }

    return { bloqueado: false, motivo: '' }
  }

  /**
   * Dias restantes da assinatura
   */
  const diasRestantes = computed(() => {
    if (!assinaturaAtual.value || !assinaturaAtual.value.dataExpiracao) {
      return null
    }

    const dataExpiracao = assinaturaAtual.value.dataExpiracao?.toDate 
      ? assinaturaAtual.value.dataExpiracao.toDate()
      : new Date(assinaturaAtual.value.dataExpiracao)

    const hoje = new Date()
    const diff = dataExpiracao - hoje
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))

    return dias
  })

  /**
   * Status visual da assinatura
   */
  const statusVisual = computed(() => {
    if (!assinaturaAtual.value) {
      return { cor: 'grey', texto: 'Sem assinatura', icone: 'fas fa-question-circle' }
    }

    const status = assinaturaAtual.value.status

    const statusMap = {
      ativa: { cor: 'green', texto: 'Ativa', icone: 'fas fa-check-circle' },
      trial: { cor: 'blue', texto: `Trial (${diasRestantes.value} dias)`, icone: 'fas fa-hourglass-half' },
      cancelada: { cor: 'red', texto: 'Cancelada', icone: 'fas fa-times-circle' },
      suspensa: { cor: 'orange', texto: 'Suspensa', icone: 'fas fa-pause-circle' },
      inadimplente: { cor: 'red', texto: 'Inadimplente', icone: 'fas fa-exclamation-triangle' }
    }

    return statusMap[status] || { cor: 'grey', texto: status, icone: 'fas fa-circle' }
  })

  return {
    // Estado
    assinaturaAtual,
    historico,
    carregando,
    erro,
    diasRestantes,
    statusVisual,

    // Métodos
    obterAssinaturaAtiva,
    criarAssinatura,
    atualizarAssinatura,
    cancelarAssinatura,
    reativarAssinatura,
    verificarLimites,
    verificarBloqueio
  }
}

