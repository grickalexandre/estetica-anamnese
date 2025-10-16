import { ref, computed } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useOrcamento() {
  const { clinicaId } = useClinica()
  const orcamentos = ref([])
  const carregando = ref(false)

  const buscarOrcamento = async (ano, mes) => {
    try {
      carregando.value = true
      const q = query(
        collection(db, 'orcamentos'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('ano', '==', ano),
        where('mes', '==', mes)
      )
      const snapshot = await getDocs(q)
      return snapshot.size > 0 ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null
    } catch (err) {
      console.error('Erro ao buscar orçamento:', err)
      return null
    } finally {
      carregando.value = false
    }
  }

  const salvarOrcamento = async (dados) => {
    try {
      carregando.value = true
      const orcamento = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        dataCriacao: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'orcamentos'), orcamento)
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Erro ao salvar orçamento:', err)
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  const atualizarOrcamento = async (id, dados) => {
    try {
      await updateDoc(doc(db, 'orcamentos', id), dados)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { orcamentos, carregando, buscarOrcamento, salvarOrcamento, atualizarOrcamento }
}

