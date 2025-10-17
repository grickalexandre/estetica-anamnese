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

  return { produtos, carregando, buscarProdutos, adicionarProduto, atualizarProduto, atualizarEstoque, desativarProduto }
}

