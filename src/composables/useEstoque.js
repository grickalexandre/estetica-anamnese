import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useEstoque() {
  const { clinicaId } = useClinica()
  const movimentacoes = ref([])
  const carregando = ref(false)

  const registrarMovimentacao = async (dados) => {
    try {
      const movimentacao = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        data: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'movimentacoes_estoque'), movimentacao)
      return { success: true, id: docRef.id }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const buscarMovimentacoes = async (produtoId = null, dataInicio = null, dataFim = null) => {
    try {
      carregando.value = true
      let q = query(
        collection(db, 'movimentacoes_estoque'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      if (produtoId) {
        q = query(q, where('produtoId', '==', produtoId))
      }

      if (dataInicio && dataFim) {
        q = query(
          q,
          where('data', '>=', Timestamp.fromDate(new Date(dataInicio))),
          where('data', '<=', Timestamp.fromDate(new Date(dataFim)))
        )
      }

      q = query(q, orderBy('data', 'desc'))
      
      const snapshot = await getDocs(q)
      movimentacoes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return movimentacoes.value
    } catch (err) {
      console.error('Erro ao buscar movimentações:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  const entrada = async (produtoId, produtoNome, quantidade, motivo, valorUnitario = 0) => {
    return await registrarMovimentacao({
      produtoId,
      produtoNome,
      tipo: 'entrada',
      quantidade,
      motivo,
      valorUnitario,
      valorTotal: quantidade * valorUnitario
    })
  }

  const saida = async (produtoId, produtoNome, quantidade, motivo, valorUnitario = 0) => {
    return await registrarMovimentacao({
      produtoId,
      produtoNome,
      tipo: 'saida',
      quantidade,
      motivo,
      valorUnitario,
      valorTotal: quantidade * valorUnitario
    })
  }

  return { movimentacoes, carregando, registrarMovimentacao, buscarMovimentacoes, entrada, saida }
}

