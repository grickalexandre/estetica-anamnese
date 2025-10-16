import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useProntuario() {
  const { clinicaId } = useClinica()
  const prontuarios = ref([])
  const carregando = ref(false)

  const buscarProntuario = async (pacienteId) => {
    try {
      carregando.value = true
      const q = query(
        collection(db, 'prontuarios'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('pacienteId', '==', pacienteId)
      )
      const snapshot = await getDocs(q)
      return snapshot.size > 0 ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null
    } catch (err) {
      console.error('Erro ao buscar prontuário:', err)
      return null
    } finally {
      carregando.value = false
    }
  }

  const criarProntuario = async (dados) => {
    try {
      const prontuario = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        atendimentos: [],
        documentos: [],
        totalAtendimentos: 0,
        ativo: true,
        dataCriacao: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'prontuarios'), prontuario)
      return { success: true, id: docRef.id }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const adicionarAtendimento = async (prontuarioId, atendimento) => {
    try {
      const prontuarioRef = doc(db, 'prontuarios', prontuarioId)
      const prontuario = await buscarProntuario(prontuarioId)
      
      const atendimentos = prontuario.atendimentos || []
      atendimentos.push({
        ...atendimento,
        data: serverTimestamp()
      })

      await updateDoc(prontuarioRef, {
        atendimentos,
        totalAtendimentos: atendimentos.length,
        ultimoAtendimento: serverTimestamp()
      })

      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { prontuarios, carregando, buscarProntuario, criarProntuario, adicionarAtendimento }
}

