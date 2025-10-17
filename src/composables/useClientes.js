import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useClientes() {
  const { clinicaId } = useClinica()
  const clientes = ref([])
  const carregando = ref(false)

  const buscarClientes = async (ativo = null) => {
    try {
      carregando.value = true
      let q = query(
        collection(db, 'clientes'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )
      if (ativo !== null) {
        q = query(q, where('ativo', '==', ativo))
      }
      const snapshot = await getDocs(q)
      clientes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return clientes.value
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  const adicionarCliente = async (dados) => {
    try {
      const cliente = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        ativo: true,
        totalAtendimentos: 0,
        totalGasto: 0,
        totalAnamneses: 0,
        ultimoAtendimento: null,
        ultimaAnamnese: null,
        dataCriacao: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'clientes'), cliente)
      return { success: true, id: docRef.id }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const atualizarCliente = async (id, dados) => {
    try {
      await updateDoc(doc(db, 'clientes', id), dados)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const buscarOuCriarCliente = async (nome, telefone) => {
    try {
      const q = query(
        collection(db, 'clientes'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('telefone', '==', telefone)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.size > 0) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      }
      
      const resultado = await adicionarCliente({ nome, telefone })
      if (resultado.success) {
        return { id: resultado.id, nome, telefone }
      }
      return null
    } catch (err) {
      return null
    }
  }

  const incrementarAnamnese = async (clienteId) => {
    try {
      const cliente = clientes.value.find(c => c.id === clienteId)
      if (!cliente) return { success: false }

      await updateDoc(doc(db, 'clientes', clienteId), {
        totalAnamneses: (cliente.totalAnamneses || 0) + 1,
        ultimaAnamnese: serverTimestamp()
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const incrementarAtendimento = async (clienteId, valor = 0) => {
    try {
      const cliente = clientes.value.find(c => c.id === clienteId)
      if (!cliente) return { success: false }

      await updateDoc(doc(db, 'clientes', clienteId), {
        totalAtendimentos: (cliente.totalAtendimentos || 0) + 1,
        totalGasto: (cliente.totalGasto || 0) + valor,
        ultimoAtendimento: serverTimestamp()
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { 
    clientes, 
    carregando, 
    buscarClientes, 
    adicionarCliente, 
    atualizarCliente, 
    buscarOuCriarCliente,
    incrementarAnamnese,
    incrementarAtendimento 
  }
}

