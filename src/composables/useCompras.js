import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useCompras() {
  const { clinicaId } = useClinica()
  const compras = ref([])
  const carregando = ref(false)

  /**
   * Registrar entrada de produtos (compra)
   */
  const registrarCompra = async (dados) => {
    try {
      carregando.value = true

      // 1. Registrar a compra
      const compra = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        data: Timestamp.fromDate(new Date(dados.data)),
        dataCriacao: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'compras'), compra)

      // 2. Dar entrada nos produtos no estoque
      if (dados.produtos && dados.produtos.length > 0) {
        const { atualizarEstoque } = await import('./useProdutos.js')
        const { entrada } = await import('./useEstoque.js')

        let custoTotal = 0

        for (const item of dados.produtos) {
          // Dar entrada no estoque
          const resultado = await atualizarEstoque(item.produtoId, item.quantidade, 'entrada')

          if (resultado.success) {
            const custoItem = item.valorUnitario * item.quantidade
            custoTotal += custoItem

            // Registrar movimentação de entrada
            await entrada(
              item.produtoId,
              item.produtoNome,
              item.quantidade,
              `Compra de fornecedor: ${dados.fornecedorNome} - NF: ${dados.numeroNota || 'S/N'}`,
              custoItem
            )
          }
        }

        // 3. Criar conta a pagar automaticamente
        if (dados.valorTotal > 0) {
          const { adicionarContaPagar } = await import('./useFinanceiro.js')

          const contaPagar = {
            descricao: `Compra de produtos - ${dados.fornecedorNome} - NF: ${dados.numeroNota || 'S/N'}`,
            valor: dados.valorTotal,
            dataVencimento: dados.dataVencimento || new Date().toISOString().split('T')[0],
            categoria: 'compra-produtos',
            fornecedorId: dados.fornecedorId,
            fornecedorNome: dados.fornecedorNome,
            compraId: docRef.id,
            status: dados.pago ? 'pago' : 'pendente',
            observacoes: dados.observacoes || ''
          }

          await adicionarContaPagar(contaPagar)
        }
      }

      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Erro ao registrar compra:', err)
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Buscar compras realizadas
   */
  const buscarCompras = async (dataInicio, dataFim, fornecedorId = null) => {
    try {
      carregando.value = true
      let q = query(
        collection(db, 'compras'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      if (dataInicio && dataFim) {
        q = query(
          q,
          where('data', '>=', Timestamp.fromDate(new Date(dataInicio))),
          where('data', '<=', Timestamp.fromDate(new Date(dataFim)))
        )
      }

      if (fornecedorId) {
        q = query(q, where('fornecedorId', '==', fornecedorId))
      }

      const snapshot = await getDocs(q)
      compras.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return compras.value
    } catch (err) {
      console.error('Erro ao buscar compras:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Obter estatísticas de compras
   */
  const obterEstatisticasCompras = async (dataInicio, dataFim) => {
    try {
      const compras = await buscarCompras(dataInicio, dataFim)

      const stats = {
        totalCompras: compras.length,
        valorTotal: 0,
        fornecedores: new Set(),
        produtosComprados: 0
      }

      compras.forEach(compra => {
        stats.valorTotal += compra.valorTotal || 0
        if (compra.fornecedorId) {
          stats.fornecedores.add(compra.fornecedorId)
        }
        if (compra.produtos) {
          stats.produtosComprados += compra.produtos.length
        }
      })

      stats.fornecedoresUnicos = stats.fornecedores.size
      delete stats.fornecedores

      return stats
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err)
      return null
    }
  }

  return {
    compras,
    carregando,
    registrarCompra,
    buscarCompras,
    obterEstatisticasCompras
  }
}

