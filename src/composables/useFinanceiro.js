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

export function useFinanceiro() {
  const { clinicaId } = useClinica()
  const contasPagar = ref([])
  const contasReceber = ref([])
  const movimentacoes = ref([])
  const carregando = ref(false)
  const erro = ref('')

  /**
   * Buscar todas as contas a pagar
   */
  const buscarContasPagar = async (filtros = {}) => {
    try {
      carregando.value = true
      erro.value = ''

      let q = query(
        collection(db, 'contas_pagar'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      // Aplicar filtros
      if (filtros.status) {
        q = query(q, where('status', '==', filtros.status))
      }

      if (filtros.dataInicio && filtros.dataFim) {
        q = query(
          q,
          where('dataVencimento', '>=', Timestamp.fromDate(new Date(filtros.dataInicio))),
          where('dataVencimento', '<=', Timestamp.fromDate(new Date(filtros.dataFim)))
        )
      }

      const snapshot = await getDocs(q)
      contasPagar.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return contasPagar.value
    } catch (err) {
      console.error('Erro ao buscar contas a pagar:', err)
      erro.value = 'Erro ao carregar contas a pagar'
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Buscar todas as contas a receber
   */
  const buscarContasReceber = async (filtros = {}) => {
    try {
      carregando.value = true
      erro.value = ''

      let q = query(
        collection(db, 'contas_receber'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      // Aplicar filtros
      if (filtros.status) {
        q = query(q, where('status', '==', filtros.status))
      }

      if (filtros.dataInicio && filtros.dataFim) {
        q = query(
          q,
          where('dataVencimento', '>=', Timestamp.fromDate(new Date(filtros.dataInicio))),
          where('dataVencimento', '<=', Timestamp.fromDate(new Date(filtros.dataFim)))
        )
      }

      const snapshot = await getDocs(q)
      contasReceber.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return contasReceber.value
    } catch (err) {
      console.error('Erro ao buscar contas a receber:', err)
      erro.value = 'Erro ao carregar contas a receber'
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Adicionar conta a pagar
   */
  const adicionarContaPagar = async (dados) => {
    try {
      carregando.value = true
      erro.value = ''

      const conta = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        tipo: 'despesa',
        status: dados.status || 'pendente',
        dataCriacao: serverTimestamp(),
        dataVencimento: Timestamp.fromDate(new Date(dados.dataVencimento))
      }

      if (dados.dataPagamento) {
        conta.dataPagamento = Timestamp.fromDate(new Date(dados.dataPagamento))
      }

      const docRef = await addDoc(collection(db, 'contas_pagar'), conta)
      
      // Se a conta foi paga, registrar movimentação
      if (dados.status === 'pago' && dados.dataPagamento) {
        await registrarMovimentacao({
          tipo: 'saida',
          valor: dados.valor,
          descricao: dados.descricao,
          categoria: dados.categoria,
          data: dados.dataPagamento,
          contaId: docRef.id,
          tipoConta: 'pagar'
        })
      }

      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Erro ao adicionar conta a pagar:', err)
      erro.value = 'Erro ao adicionar conta a pagar'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Adicionar conta a receber
   */
  const adicionarContaReceber = async (dados) => {
    try {
      carregando.value = true
      erro.value = ''

      const conta = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        tipo: 'receita',
        status: dados.status || 'pendente',
        dataCriacao: serverTimestamp(),
        dataVencimento: Timestamp.fromDate(new Date(dados.dataVencimento))
      }

      if (dados.dataRecebimento) {
        conta.dataRecebimento = Timestamp.fromDate(new Date(dados.dataRecebimento))
      }

      const docRef = await addDoc(collection(db, 'contas_receber'), conta)
      
      // Se a conta foi recebida, registrar movimentação
      if (dados.status === 'recebido' && dados.dataRecebimento) {
        await registrarMovimentacao({
          tipo: 'entrada',
          valor: dados.valor,
          descricao: dados.descricao,
          categoria: dados.categoria,
          data: dados.dataRecebimento,
          contaId: docRef.id,
          tipoConta: 'receber'
        })
      }

      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Erro ao adicionar conta a receber:', err)
      erro.value = 'Erro ao adicionar conta a receber'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Baixar conta a pagar (marcar como paga)
   */
  const baixarContaPagar = async (contaId, dataPagamento, valorPago) => {
    try {
      carregando.value = true
      erro.value = ''

      const contaRef = doc(db, 'contas_pagar', contaId)
      
      await updateDoc(contaRef, {
        status: 'pago',
        dataPagamento: Timestamp.fromDate(new Date(dataPagamento)),
        valorPago: valorPago || null
      })

      // Buscar dados da conta para registrar movimentação
      const contaAtualizada = contasPagar.value.find(c => c.id === contaId)
      if (contaAtualizada) {
        await registrarMovimentacao({
          tipo: 'saida',
          valor: valorPago || contaAtualizada.valor,
          descricao: contaAtualizada.descricao,
          categoria: contaAtualizada.categoria,
          data: dataPagamento,
          contaId: contaId,
          tipoConta: 'pagar'
        })
      }

      return { success: true }
    } catch (err) {
      console.error('Erro ao baixar conta a pagar:', err)
      erro.value = 'Erro ao baixar conta a pagar'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Baixar conta a receber (marcar como recebida)
   */
  const baixarContaReceber = async (contaId, dataRecebimento, valorRecebido) => {
    try {
      carregando.value = true
      erro.value = ''

      const contaRef = doc(db, 'contas_receber', contaId)
      
      await updateDoc(contaRef, {
        status: 'recebido',
        dataRecebimento: Timestamp.fromDate(new Date(dataRecebimento)),
        valorRecebido: valorRecebido || null
      })

      // Buscar dados da conta para registrar movimentação
      const contaAtualizada = contasReceber.value.find(c => c.id === contaId)
      if (contaAtualizada) {
        await registrarMovimentacao({
          tipo: 'entrada',
          valor: valorRecebido || contaAtualizada.valor,
          descricao: contaAtualizada.descricao,
          categoria: contaAtualizada.categoria,
          data: dataRecebimento,
          contaId: contaId,
          tipoConta: 'receber'
        })
      }

      return { success: true }
    } catch (err) {
      console.error('Erro ao baixar conta a receber:', err)
      erro.value = 'Erro ao baixar conta a receber'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Registrar movimentação no fluxo de caixa
   */
  const registrarMovimentacao = async (dados) => {
    try {
      const movimentacao = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        data: Timestamp.fromDate(new Date(dados.data)),
        dataCriacao: serverTimestamp()
      }

      await addDoc(collection(db, 'movimentacoes'), movimentacao)
      return { success: true }
    } catch (err) {
      console.error('Erro ao registrar movimentação:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Buscar movimentações do fluxo de caixa
   */
  const buscarMovimentacoes = async (dataInicio, dataFim) => {
    try {
      carregando.value = true
      erro.value = ''

      const q = query(
        collection(db, 'movimentacoes'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('data', '>=', Timestamp.fromDate(new Date(dataInicio))),
        where('data', '<=', Timestamp.fromDate(new Date(dataFim))),
        orderBy('data', 'desc')
      )

      const snapshot = await getDocs(q)
      movimentacoes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return movimentacoes.value
    } catch (err) {
      console.error('Erro ao buscar movimentações:', err)
      erro.value = 'Erro ao carregar movimentações'
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Excluir conta a pagar
   */
  const excluirContaPagar = async (contaId) => {
    try {
      carregando.value = true
      erro.value = ''

      await deleteDoc(doc(db, 'contas_pagar', contaId))
      return { success: true }
    } catch (err) {
      console.error('Erro ao excluir conta a pagar:', err)
      erro.value = 'Erro ao excluir conta a pagar'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Excluir conta a receber
   */
  const excluirContaReceber = async (contaId) => {
    try {
      carregando.value = true
      erro.value = ''

      await deleteDoc(doc(db, 'contas_receber', contaId))
      return { success: true }
    } catch (err) {
      console.error('Erro ao excluir conta a receber:', err)
      erro.value = 'Erro ao excluir conta a receber'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Calcular totais
   */
  const totais = computed(() => {
    const totalPagar = contasPagar.value
      .filter(c => c.status === 'pendente')
      .reduce((sum, c) => sum + (c.valor || 0), 0)

    const totalPago = contasPagar.value
      .filter(c => c.status === 'pago')
      .reduce((sum, c) => sum + (c.valorPago || c.valor || 0), 0)

    const totalReceber = contasReceber.value
      .filter(c => c.status === 'pendente')
      .reduce((sum, c) => sum + (c.valor || 0), 0)

    const totalRecebido = contasReceber.value
      .filter(c => c.status === 'recebido')
      .reduce((sum, c) => sum + (c.valorRecebido || c.valor || 0), 0)

    const saldo = totalRecebido - totalPago

    return {
      totalPagar,
      totalPago,
      totalReceber,
      totalRecebido,
      saldo
    }
  })

  /**
   * Adicionar conta a pagar com parcelas
   */
  const adicionarContaPagarParcelada = async (dados) => {
    try {
      carregando.value = true
      erro.value = ''

      const { numeroParcelas, valorTotal, dataVencimentoInicial, ...dadosBase } = dados
      const valorParcela = valorTotal / numeroParcelas
      const parcelas = []

      for (let i = 0; i < numeroParcelas; i++) {
        const dataVencimento = new Date(dataVencimentoInicial)
        dataVencimento.setMonth(dataVencimento.getMonth() + i)

        const parcela = {
          ...dadosBase,
          valor: valorParcela,
          dataVencimento: dataVencimento.toISOString().split('T')[0],
          numeroParcela: i + 1,
          totalParcelas: numeroParcelas,
          valorTotal: valorTotal,
          parcelaId: `${Date.now()}-${i}` // ID único para identificar parcelas do mesmo lançamento
        }

        const resultado = await adicionarContaPagar(parcela)
        if (resultado.success) {
          parcelas.push(resultado.id)
        }
      }

      return { success: true, parcelas, total: parcelas.length }
    } catch (err) {
      console.error('Erro ao criar parcelas a pagar:', err)
      erro.value = 'Erro ao criar parcelas'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Adicionar conta a receber com parcelas
   */
  const adicionarContaReceberParcelada = async (dados) => {
    try {
      carregando.value = true
      erro.value = ''

      const { numeroParcelas, valorTotal, dataVencimentoInicial, ...dadosBase } = dados
      const valorParcela = valorTotal / numeroParcelas
      const parcelas = []

      for (let i = 0; i < numeroParcelas; i++) {
        const dataVencimento = new Date(dataVencimentoInicial)
        dataVencimento.setMonth(dataVencimento.getMonth() + i)

        const parcela = {
          ...dadosBase,
          valor: valorParcela,
          dataVencimento: dataVencimento.toISOString().split('T')[0],
          numeroParcela: i + 1,
          totalParcelas: numeroParcelas,
          valorTotal: valorTotal,
          parcelaId: `${Date.now()}-${i}` // ID único para identificar parcelas do mesmo lançamento
        }

        const resultado = await adicionarContaReceber(parcela)
        if (resultado.success) {
          parcelas.push(resultado.id)
        }
      }

      return { success: true, parcelas, total: parcelas.length }
    } catch (err) {
      console.error('Erro ao criar parcelas a receber:', err)
      erro.value = 'Erro ao criar parcelas'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  return {
    // Estado
    contasPagar,
    contasReceber,
    movimentacoes,
    carregando,
    erro,
    totais,

    // Métodos
    buscarContasPagar,
    buscarContasReceber,
    buscarMovimentacoes,
    adicionarContaPagar,
    adicionarContaReceber,
    adicionarContaPagarParcelada,
    adicionarContaReceberParcelada,
    baixarContaPagar,
    baixarContaReceber,
    excluirContaPagar,
    excluirContaReceber,
    registrarMovimentacao
  }
}

