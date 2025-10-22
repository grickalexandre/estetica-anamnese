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
  serverTimestamp
} from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useAvaliacoes() {
  const { clinicaId } = useClinica()
  const avaliacoes = ref([])
  const carregando = ref(false)
  const erro = ref('')

  /**
   * Criar avaliação (cliente avalia atendimento)
   */
  const criarAvaliacao = async (dados) => {
    try {
      console.log('Criando avaliação:', dados)

      // Buscar dados do atendimento para preencher referências
      let clienteNome = dados.clienteNome || ''
      let procedimentoNome = ''
      
      if (dados.atendimentoId) {
        try {
          const atendimentoRef = doc(db, 'atendimentos', dados.atendimentoId)
          const atendimentoDoc = await getDoc(atendimentoRef)
          
          if (atendimentoDoc.exists()) {
            const atendimentoData = atendimentoDoc.data()
            clienteNome = atendimentoData.clienteNome || clienteNome
            procedimentoNome = atendimentoData.procedimentoNome || ''
          }
        } catch (err) {
          console.warn('Erro ao buscar dados do atendimento:', err)
        }
      }

      const avaliacao = {
        clienteId: dados.clienteId,
        clienteNome,
        atendimentoId: dados.atendimentoId,
        procedimentoNome,
        nota: parseInt(dados.nota),                    // 1-5 estrelas
        comentario: dados.comentario || '',
        aspectos: {
          atendimento: parseInt(dados.aspectoAtendimento || dados.nota),
          ambiente: parseInt(dados.aspectoAmbiente || dados.nota),
          resultado: parseInt(dados.aspectoResultado || dados.nota)
        },
        recomendaria: dados.recomendaria !== undefined ? dados.recomendaria : true,
        data: serverTimestamp(),
        clinicaId: clinicaId.value || dados.clinicaId || 'demo',
        respondido: false,
        respostaClinica: '',
        dataResposta: null,
        usuarioResposta: ''
      }

      const docRef = await addDoc(collection(db, 'avaliacoes'), avaliacao)
      
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao criar avaliação:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Buscar avaliações
   */
  const buscarAvaliacoes = async (filtros = {}) => {
    try {
      carregando.value = true
      erro.value = ''

      let q = query(
        collection(db, 'avaliacoes'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        orderBy('data', 'desc')
      )

      // Filtros opcionais
      if (filtros.clienteId) {
        q = query(q, where('clienteId', '==', filtros.clienteId))
      }

      if (filtros.atendimentoId) {
        q = query(q, where('atendimentoId', '==', filtros.atendimentoId))
      }

      if (filtros.respondido !== undefined) {
        q = query(q, where('respondido', '==', filtros.respondido))
      }

      if (filtros.notaMinima) {
        q = query(q, where('nota', '>=', filtros.notaMinima))
      }

      const snapshot = await getDocs(q)
      avaliacoes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate ? doc.data().data.toDate() : new Date(doc.data().data),
        dataResposta: doc.data().dataResposta?.toDate ? doc.data().dataResposta.toDate() : null
      }))

      return avaliacoes.value
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err)
      erro.value = 'Erro ao carregar avaliações'
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Responder avaliação (clínica responde ao cliente)
   */
  const responderAvaliacao = async (avaliacaoId, resposta, usuarioId, usuarioNome) => {
    try {
      const avaliacaoRef = doc(db, 'avaliacoes', avaliacaoId)
      
      await updateDoc(avaliacaoRef, {
        respondido: true,
        respostaClinica: resposta,
        dataResposta: serverTimestamp(),
        usuarioResposta: usuarioNome || usuarioId
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao responder avaliação:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Gerar link único para avaliação
   */
  const gerarLinkAvaliacao = (atendimentoId, clienteId) => {
    // Gerar token único baseado em timestamp e IDs
    const token = btoa(`${atendimentoId}:${clienteId}:${Date.now()}`).substring(0, 32)
    return `/avaliacao-cliente?token=${token}&atendimento=${atendimentoId}&cliente=${clienteId}`
  }

  /**
   * Verificar se avaliação já existe para um atendimento
   */
  const verificarAvaliacaoExistente = async (atendimentoId) => {
    try {
      const q = query(
        collection(db, 'avaliacoes'),
        where('atendimentoId', '==', atendimentoId),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      const snapshot = await getDocs(q)
      return !snapshot.empty
    } catch (err) {
      console.error('Erro ao verificar avaliação existente:', err)
      return false
    }
  }

  /**
   * Calcular NPS (Net Promoter Score)
   */
  const calcularNPS = () => {
    if (avaliacoes.value.length === 0) {
      return {
        nps: 0,
        promotores: 0,
        neutros: 0,
        detratores: 0,
        total: 0
      }
    }

    // NPS baseado em notas 1-5
    // Promotores: 5 estrelas
    // Neutros: 3-4 estrelas
    // Detratores: 1-2 estrelas
    const promotores = avaliacoes.value.filter(a => a.nota === 5).length
    const neutros = avaliacoes.value.filter(a => a.nota >= 3 && a.nota <= 4).length
    const detratores = avaliacoes.value.filter(a => a.nota <= 2).length
    const total = avaliacoes.value.length

    // Fórmula NPS: (% Promotores - % Detratores)
    const nps = Math.round(((promotores - detratores) / total) * 100)

    return {
      nps,
      promotores,
      neutros,
      detratores,
      total,
      percentualPromotores: Math.round((promotores / total) * 100),
      percentualNeutros: Math.round((neutros / total) * 100),
      percentualDetratores: Math.round((detratores / total) * 100)
    }
  }

  /**
   * Calcular média de notas
   */
  const calcularMediaNotas = () => {
    if (avaliacoes.value.length === 0) return 0

    const somaNotas = avaliacoes.value.reduce((sum, a) => sum + a.nota, 0)
    return (somaNotas / avaliacoes.value.length).toFixed(2)
  }

  /**
   * Calcular média por aspecto
   */
  const calcularMediaAspectos = () => {
    if (avaliacoes.value.length === 0) {
      return { atendimento: 0, ambiente: 0, resultado: 0 }
    }

    const somaAspectos = avaliacoes.value.reduce((acc, a) => {
      return {
        atendimento: acc.atendimento + (a.aspectos?.atendimento || a.nota),
        ambiente: acc.ambiente + (a.aspectos?.ambiente || a.nota),
        resultado: acc.resultado + (a.aspectos?.resultado || a.nota)
      }
    }, { atendimento: 0, ambiente: 0, resultado: 0 })

    const total = avaliacoes.value.length

    return {
      atendimento: (somaAspectos.atendimento / total).toFixed(2),
      ambiente: (somaAspectos.ambiente / total).toFixed(2),
      resultado: (somaAspectos.resultado / total).toFixed(2)
    }
  }

  /**
   * Estatísticas completas
   */
  const calcularEstatisticas = () => {
    const nps = calcularNPS()
    const mediaGeral = calcularMediaNotas()
    const mediaAspectos = calcularMediaAspectos()
    
    const totalAvaliacoes = avaliacoes.value.length
    const avaliacoesRespondidas = avaliacoes.value.filter(a => a.respondido).length
    const avaliacoesPendentes = totalAvaliacoes - avaliacoesRespondidas
    const percentualResposta = totalAvaliacoes > 0 
      ? Math.round((avaliacoesRespondidas / totalAvaliacoes) * 100) 
      : 0

    const recomendariam = avaliacoes.value.filter(a => a.recomendaria).length
    const percentualRecomendacao = totalAvaliacoes > 0
      ? Math.round((recomendariam / totalAvaliacoes) * 100)
      : 0

    return {
      ...nps,
      mediaGeral,
      mediaAspectos,
      totalAvaliacoes,
      avaliacoesRespondidas,
      avaliacoesPendentes,
      percentualResposta,
      recomendariam,
      percentualRecomendacao
    }
  }

  /**
   * Computed: Avaliações não respondidas
   */
  const avaliacoesPendentes = computed(() => {
    return avaliacoes.value.filter(a => !a.respondido)
  })

  return {
    // Estado
    avaliacoes,
    avaliacoesPendentes,
    carregando,
    erro,

    // Métodos
    criarAvaliacao,
    buscarAvaliacoes,
    responderAvaliacao,
    gerarLinkAvaliacao,
    verificarAvaliacaoExistente,
    calcularNPS,
    calcularMediaNotas,
    calcularMediaAspectos,
    calcularEstatisticas
  }
}

