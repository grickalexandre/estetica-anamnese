import { ref } from 'vue'
import { db } from '../firebase.js'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function usePagamentos() {
  const { clinicaId } = useClinica()
  const pagamentos = ref([])
  const carregando = ref(false)
  const erro = ref('')

  /**
   * Buscar pagamentos
   */
  const buscarPagamentos = async (filtros = {}) => {
    try {
      carregando.value = true
      erro.value = ''

      let q = query(
        collection(db, 'pagamentos'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        orderBy('dataPagamento', 'desc')
      )

      // Filtros opcionais
      if (filtros.tipo) {
        q = query(q, where('tipo', '==', filtros.tipo))
      }

      if (filtros.formaPagamento) {
        q = query(q, where('formaPagamento', '==', filtros.formaPagamento))
      }

      if (filtros.usuarioId) {
        q = query(q, where('usuarioId', '==', filtros.usuarioId))
      }

      const snapshot = await getDocs(q)
      pagamentos.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataPagamento: doc.data().dataPagamento?.toDate ? doc.data().dataPagamento.toDate() : new Date(doc.data().dataPagamento)
      }))

      return pagamentos.value
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err)
      erro.value = 'Erro ao carregar pagamentos'
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Registrar pagamento (para conta a pagar)
   */
  const registrarPagamento = async (dados) => {
    try {
      console.log('Registrando pagamento:', dados)

      const pagamento = {
        contaId: dados.contaId,
        tipo: 'pagamento',
        valor: parseFloat(dados.valor),
        formaPagamento: dados.formaPagamento,
        dataPagamento: dados.dataPagamento ? Timestamp.fromDate(new Date(dados.dataPagamento)) : serverTimestamp(),
        usuarioId: dados.usuarioId || 'sistema',
        observacoes: dados.observacoes || '',
        clinicaId: clinicaId.value || 'demo',
        dataCriacao: serverTimestamp()
      }

      // Criar pagamento
      const pagamentoRef = await addDoc(collection(db, 'pagamentos'), pagamento)
      console.log('Pagamento registrado:', pagamentoRef.id)

      // Atualizar conta a pagar
      const contaRef = doc(db, 'contas_pagar', dados.contaId)
      await updateDoc(contaRef, {
        status: 'pago',
        dataPagamento: pagamento.dataPagamento,
        formaPagamento: dados.formaPagamento,
        pagamentoId: pagamentoRef.id,
        dataAtualizacao: serverTimestamp()
      })

      return { success: true, id: pagamentoRef.id }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Registrar recebimento (para conta a receber)
   */
  const registrarRecebimento = async (dados) => {
    try {
      console.log('Registrando recebimento:', dados)

      const pagamento = {
        contaId: dados.contaId,
        tipo: 'recebimento',
        valor: parseFloat(dados.valor),
        formaPagamento: dados.formaPagamento,
        dataPagamento: dados.dataPagamento ? Timestamp.fromDate(new Date(dados.dataPagamento)) : serverTimestamp(),
        usuarioId: dados.usuarioId || 'sistema',
        observacoes: dados.observacoes || '',
        clinicaId: clinicaId.value || 'demo',
        dataCriacao: serverTimestamp()
      }

      // Criar pagamento
      const pagamentoRef = await addDoc(collection(db, 'pagamentos'), pagamento)
      console.log('Recebimento registrado:', pagamentoRef.id)

      // Atualizar conta a receber
      const contaRef = doc(db, 'contas_receber', dados.contaId)
      await updateDoc(contaRef, {
        status: 'pago',
        dataPagamento: pagamento.dataPagamento,
        formaPagamento: dados.formaPagamento,
        pagamentoId: pagamentoRef.id,
        dataAtualizacao: serverTimestamp()
      })

      return { success: true, id: pagamentoRef.id }
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Registrar pagamento de comissão
   */
  const pagarComissao = async (dados) => {
    try {
      console.log('Pagando comissão:', dados)

      const pagamento = {
        contaId: dados.comissaoId,
        tipo: 'pagamento_comissao',
        valor: parseFloat(dados.valor),
        formaPagamento: dados.formaPagamento,
        dataPagamento: dados.dataPagamento ? Timestamp.fromDate(new Date(dados.dataPagamento)) : serverTimestamp(),
        usuarioId: dados.usuarioId || 'sistema',
        observacoes: dados.observacoes || '',
        clinicaId: clinicaId.value || 'demo',
        dataCriacao: serverTimestamp()
      }

      // Criar pagamento
      const pagamentoRef = await addDoc(collection(db, 'pagamentos'), pagamento)
      console.log('Pagamento de comissão registrado:', pagamentoRef.id)

      // Atualizar comissão
      const comissaoRef = doc(db, 'comissoes', dados.comissaoId)
      await updateDoc(comissaoRef, {
        status: 'pago',
        dataPagamento: pagamento.dataPagamento,
        formaPagamento: dados.formaPagamento,
        pagamentoId: pagamentoRef.id,
        dataAtualizacao: serverTimestamp()
      })

      return { success: true, id: pagamentoRef.id }
    } catch (error) {
      console.error('Erro ao pagar comissão:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Buscar pagamentos de uma conta específica
   */
  const buscarPagamentosConta = async (contaId) => {
    try {
      const q = query(
        collection(db, 'pagamentos'),
        where('contaId', '==', contaId),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        orderBy('dataPagamento', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataPagamento: doc.data().dataPagamento?.toDate ? doc.data().dataPagamento.toDate() : new Date(doc.data().dataPagamento)
      }))
    } catch (err) {
      console.error('Erro ao buscar pagamentos da conta:', err)
      return []
    }
  }

  /**
   * Estatísticas de pagamentos
   */
  const calcularEstatisticas = (periodo = 'mes') => {
    const agora = new Date()
    let dataInicio

    if (periodo === 'mes') {
      dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
    } else if (periodo === 'ano') {
      dataInicio = new Date(agora.getFullYear(), 0, 1)
    } else {
      dataInicio = new Date(0) // Tudo
    }

    const pagamentosFiltrados = pagamentos.value.filter(p => 
      new Date(p.dataPagamento) >= dataInicio
    )

    const totalPagamentos = pagamentosFiltrados
      .filter(p => p.tipo === 'pagamento' || p.tipo === 'pagamento_comissao')
      .reduce((sum, p) => sum + p.valor, 0)

    const totalRecebimentos = pagamentosFiltrados
      .filter(p => p.tipo === 'recebimento')
      .reduce((sum, p) => sum + p.valor, 0)

    // Por forma de pagamento
    const porFormaPagamento = {}
    pagamentosFiltrados.forEach(p => {
      if (!porFormaPagamento[p.formaPagamento]) {
        porFormaPagamento[p.formaPagamento] = { count: 0, valor: 0 }
      }
      porFormaPagamento[p.formaPagamento].count++
      porFormaPagamento[p.formaPagamento].valor += p.valor
    })

    return {
      totalPagamentos,
      totalRecebimentos,
      saldoLiquido: totalRecebimentos - totalPagamentos,
      quantidadeTransacoes: pagamentosFiltrados.length,
      porFormaPagamento
    }
  }

  return {
    // Estado
    pagamentos,
    carregando,
    erro,

    // Métodos
    buscarPagamentos,
    registrarPagamento,
    registrarRecebimento,
    pagarComissao,
    buscarPagamentosConta,
    calcularEstatisticas
  }
}

