import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useFornecedores() {
  const { clinicaId } = useClinica()
  const fornecedores = ref([])
  const carregando = ref(false)

  const buscarFornecedores = async (ativo = null) => {
    try {
      carregando.value = true
      let q = query(
        collection(db, 'fornecedores'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )
      if (ativo !== null) {
        q = query(q, where('ativo', '==', ativo))
      }
      const snapshot = await getDocs(q)
      fornecedores.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return fornecedores.value
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  const adicionarFornecedor = async (dados) => {
    try {
      const fornecedor = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        ativo: true,
        totalCompras: 0,
        ultimaCompra: null,
        dataCriacao: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'fornecedores'), fornecedor)
      return { success: true, id: docRef.id }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const atualizarFornecedor = async (id, dados) => {
    try {
      await updateDoc(doc(db, 'fornecedores', id), dados)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const desativarFornecedor = async (id) => {
    try {
      await updateDoc(doc(db, 'fornecedores', id), { ativo: false })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const excluirFornecedor = async (id) => {
    try {
      await deleteDoc(doc(db, 'fornecedores', id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { fornecedores, carregando, buscarFornecedores, adicionarFornecedor, atualizarFornecedor, desativarFornecedor, excluirFornecedor }
}

