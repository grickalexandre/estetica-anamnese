import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useProdutos() {
  const { clinicaId } = useClinica()
  const produtos = ref([])
  const carregando = ref(false)

  const buscarProdutos = async (ativo = null) => {
    try {
      carregando.value = true
      let q = query(
        collection(db, 'produtos'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )
      if (ativo !== null) {
        q = query(q, where('ativo', '==', ativo))
      }
      const snapshot = await getDocs(q)
      produtos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return produtos.value
    } catch (err) {
      console.error('Erro ao buscar produtos:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  const adicionarProduto = async (dados) => {
    try {
      const produto = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        ativo: true,
        estoqueAtual: dados.estoqueInicial || 0,
        estoqueMinimo: dados.estoqueMinimo || 0,
        estoqueMaximo: dados.estoqueMaximo || 0,
        totalVendido: 0,
        dataValidade: dados.dataValidade || null,
        statusValidade: calcularStatusValidade(dados.dataValidade),
        dataCriacao: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'produtos'), produto)
      return { success: true, id: docRef.id }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const atualizarProduto = async (id, dados) => {
    try {
      await updateDoc(doc(db, 'produtos', id), dados)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const atualizarEstoque = async (id, quantidade, tipo) => {
    try {
      const produto = produtos.value.find(p => p.id === id)
      if (!produto) return { success: false, error: 'Produto não encontrado' }

      const novoEstoque = tipo === 'entrada' 
        ? produto.estoqueAtual + quantidade 
        : produto.estoqueAtual - quantidade

      if (novoEstoque < 0) {
        return { success: false, error: 'Estoque insuficiente' }
      }

      await updateDoc(doc(db, 'produtos', id), { estoqueAtual: novoEstoque })
      return { success: true, estoqueAtual: novoEstoque }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const desativarProduto = async (id) => {
    try {
      await updateDoc(doc(db, 'produtos', id), { ativo: false })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Função para calcular status de validade
  const calcularStatusValidade = (dataValidade) => {
    if (!dataValidade) return 'sem-vencimento'
    
    const hoje = new Date()
    const validade = new Date(dataValidade)
    const diffTime = validade - hoje
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'vencido'
    if (diffDays <= 30) return 'proximo-vencimento'
    if (diffDays <= 90) return 'vencimento-medio'
    return 'valido'
  }

  // Função para atualizar status de validade de todos os produtos
  const atualizarStatusValidade = async () => {
    try {
      const produtosParaAtualizar = produtos.value.filter(produto => {
        const novoStatus = calcularStatusValidade(produto.dataValidade)
        return produto.statusValidade !== novoStatus
      })

      for (const produto of produtosParaAtualizar) {
        const novoStatus = calcularStatusValidade(produto.dataValidade)
        await updateDoc(doc(db, 'produtos', produto.id), { 
          statusValidade: novoStatus 
        })
      }

      return { success: true, atualizados: produtosParaAtualizar.length }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Função para buscar produtos por status de validade
  const buscarProdutosPorValidade = async (status) => {
    try {
      carregando.value = true
      let q = query(
        collection(db, 'produtos'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('ativo', '==', true)
      )
      
      const snapshot = await getDocs(q)
      let produtosFiltrados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      if (status && status !== 'todos') {
        produtosFiltrados = produtosFiltrados.filter(produto => {
          const statusAtual = calcularStatusValidade(produto.dataValidade)
          return statusAtual === status
        })
      }
      
      return produtosFiltrados
    } catch (err) {
      console.error('Erro ao buscar produtos por validade:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  // Função para obter estatísticas de validade
  const obterEstatisticasValidade = () => {
    const stats = {
      total: produtos.value.length,
      vencidos: 0,
      proximoVencimento: 0,
      vencimentoMedio: 0,
      validos: 0,
      semVencimento: 0
    }

    produtos.value.forEach(produto => {
      const status = calcularStatusValidade(produto.dataValidade)
      stats[status === 'proximo-vencimento' ? 'proximoVencimento' : 
            status === 'vencimento-medio' ? 'vencimentoMedio' : 
            status === 'sem-vencimento' ? 'semVencimento' : status]++
    })

    return stats
  }

  return { 
    produtos, 
    carregando, 
    buscarProdutos, 
    adicionarProduto, 
    atualizarProduto, 
    atualizarEstoque, 
    desativarProduto,
    calcularStatusValidade,
    atualizarStatusValidade,
    buscarProdutosPorValidade,
    obterEstatisticasValidade
  }
}

