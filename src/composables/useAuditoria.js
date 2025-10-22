import { ref } from 'vue'
import { db } from '../firebase.js'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useAuditoria() {
  const { clinicaId } = useClinica()
  const logs = ref([])
  const carregando = ref(false)
  const erro = ref('')

  /**
   * Registrar ação no log de auditoria
   */
  const registrarAcao = async (dados) => {
    try {
      // Obter userId do usuário autenticado (se disponível)
      const userId = dados.usuarioId || 'sistema'
      const usuarioNome = dados.usuarioNome || 'Sistema'

      const logAuditoria = {
        entidade: dados.entidade,           // 'clientes', 'atendimentos', 'produtos', etc
        documentoId: dados.documentoId,     // ID do documento modificado
        acao: dados.acao,                   // 'create', 'update', 'delete'
        usuarioId,
        usuarioNome,
        dadosAntigos: dados.dadosAntigos || null,   // Snapshot antes (null para create)
        dadosNovos: dados.dadosNovos || null,       // Snapshot depois (null para delete)
        ip: dados.ip || null,               // IP do usuário (se disponível)
        userAgent: dados.userAgent || null, // Navegador/dispositivo
        data: serverTimestamp(),
        clinicaId: clinicaId.value || 'demo'
      }

      await addDoc(collection(db, 'auditoria'), logAuditoria)
      console.log('✅ Ação auditada:', dados.entidade, dados.acao, dados.documentoId)
      
      return { success: true }
    } catch (error) {
      console.error('❌ Erro ao registrar auditoria:', error)
      // Não bloqueia operação principal se auditoria falhar
      return { success: false, error: error.message }
    }
  }

  /**
   * Buscar logs de auditoria
   */
  const buscarLogs = async (filtros = {}) => {
    try {
      carregando.value = true
      erro.value = ''

      let q = query(
        collection(db, 'auditoria'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        orderBy('data', 'desc')
      )

      // Filtros opcionais
      if (filtros.entidade) {
        q = query(q, where('entidade', '==', filtros.entidade))
      }

      if (filtros.usuarioId) {
        q = query(q, where('usuarioId', '==', filtros.usuarioId))
      }

      if (filtros.acao) {
        q = query(q, where('acao', '==', filtros.acao))
      }

      // Limitar resultados para performance
      const limite = filtros.limite || 100
      q = query(q, limit(limite))

      const snapshot = await getDocs(q)
      logs.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate ? doc.data().data.toDate() : new Date(doc.data().data)
      }))

      return logs.value
    } catch (err) {
      console.error('Erro ao buscar logs:', err)
      erro.value = 'Erro ao carregar logs de auditoria'
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Buscar histórico de um documento específico
   */
  const buscarHistoricoDocumento = async (entidade, documentoId) => {
    try {
      const q = query(
        collection(db, 'auditoria'),
        where('entidade', '==', entidade),
        where('documentoId', '==', documentoId),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        orderBy('data', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate ? doc.data().data.toDate() : new Date(doc.data().data)
      }))
    } catch (err) {
      console.error('Erro ao buscar histórico do documento:', err)
      return []
    }
  }

  /**
   * Buscar ações de um usuário específico
   */
  const buscarAcoesUsuario = async (usuarioId, limiteResultados = 50) => {
    try {
      const q = query(
        collection(db, 'auditoria'),
        where('usuarioId', '==', usuarioId),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        orderBy('data', 'desc'),
        limit(limiteResultados)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate ? doc.data().data.toDate() : new Date(doc.data().data)
      }))
    } catch (err) {
      console.error('Erro ao buscar ações do usuário:', err)
      return []
    }
  }

  /**
   * Estatísticas de auditoria
   */
  const calcularEstatisticas = (periodo = 'mes') => {
    const agora = new Date()
    let dataInicio

    if (periodo === 'dia') {
      dataInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    } else if (periodo === 'mes') {
      dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
    } else if (periodo === 'ano') {
      dataInicio = new Date(agora.getFullYear(), 0, 1)
    } else {
      dataInicio = new Date(0)
    }

    const logsFiltrados = logs.value.filter(l => new Date(l.data) >= dataInicio)

    // Por ação
    const porAcao = {
      create: logsFiltrados.filter(l => l.acao === 'create').length,
      update: logsFiltrados.filter(l => l.acao === 'update').length,
      delete: logsFiltrados.filter(l => l.acao === 'delete').length
    }

    // Por entidade
    const porEntidade = {}
    logsFiltrados.forEach(l => {
      if (!porEntidade[l.entidade]) {
        porEntidade[l.entidade] = 0
      }
      porEntidade[l.entidade]++
    })

    // Por usuário
    const porUsuario = {}
    logsFiltrados.forEach(l => {
      if (!porUsuario[l.usuarioNome]) {
        porUsuario[l.usuarioNome] = 0
      }
      porUsuario[l.usuarioNome]++
    })

    return {
      total: logsFiltrados.length,
      porAcao,
      porEntidade,
      porUsuario,
      periodo
    }
  }

  /**
   * Limpar logs antigos (manter apenas últimos 90 dias)
   */
  const limparLogsAntigos = async () => {
    try {
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - 90)

      const q = query(
        collection(db, 'auditoria'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('data', '<', Timestamp.fromDate(dataLimite))
      )

      const snapshot = await getDocs(q)
      
      let deletados = 0
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, 'auditoria', docSnap.id))
        deletados++
      }

      return { success: true, total: deletados }
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    // Estado
    logs,
    carregando,
    erro,

    // Métodos
    registrarAcao,
    buscarLogs,
    buscarHistoricoDocumento,
    buscarAcoesUsuario,
    calcularEstatisticas,
    limparLogsAntigos
  }
}

