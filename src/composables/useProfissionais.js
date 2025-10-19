import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useProfissionais() {
  const { clinicaId } = useClinica()
  const profissionais = ref([])
  const carregando = ref(false)

  /**
   * Buscar profissionais
   */
  const buscarProfissionais = async (ativo = true) => {
    try {
      carregando.value = true
      const q = query(
        collection(db, 'profissionais'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('ativo', '==', ativo)
      )
      const snapshot = await getDocs(q)
      profissionais.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return profissionais.value
    } catch (err) {
      console.error('Erro ao buscar profissionais:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Adicionar profissional
   */
  const adicionarProfissional = async (dados) => {
    try {
      const profissional = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        ativo: true,
        totalAtendimentos: 0,
        totalComissoes: 0,
        dataCriacao: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'profissionais'), profissional)
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Erro ao adicionar profissional:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Atualizar profissional
   */
  const atualizarProfissional = async (id, dados) => {
    try {
      const docRef = doc(db, 'profissionais', id)
      await updateDoc(docRef, {
        ...dados,
        dataAtualizacao: serverTimestamp()
      })
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar profissional:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Desativar profissional
   */
  const desativarProfissional = async (id) => {
    try {
      const docRef = doc(db, 'profissionais', id)
      await updateDoc(docRef, {
        ativo: false,
        dataDesativacao: serverTimestamp()
      })
      return { success: true }
    } catch (err) {
      console.error('Erro ao desativar profissional:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Incrementar atendimento do profissional
   */
  const incrementarAtendimento = async (profissionalId) => {
    try {
      const docRef = doc(db, 'profissionais', profissionalId)
      await updateDoc(docRef, {
        totalAtendimentos: profissionais.value.find(p => p.id === profissionalId)?.totalAtendimentos + 1 || 1
      })
      return { success: true }
    } catch (err) {
      console.error('Erro ao incrementar atendimento:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Atualizar total de comissões
   */
  const atualizarTotalComissoes = async (profissionalId, valorComissao) => {
    try {
      const profissional = profissionais.value.find(p => p.id === profissionalId)
      if (!profissional) return { success: false, error: 'Profissional não encontrado' }

      const docRef = doc(db, 'profissionais', profissionalId)
      await updateDoc(docRef, {
        totalComissoes: (profissional.totalComissoes || 0) + valorComissao
      })
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar total de comissões:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Obter estatísticas dos profissionais
   */
  const obterEstatisticasProfissionais = () => {
    const stats = {
      totalProfissionais: profissionais.value.length,
      profissionaisAtivos: profissionais.value.filter(p => p.ativo).length,
      totalAtendimentos: profissionais.value.reduce((sum, p) => sum + (p.totalAtendimentos || 0), 0),
      totalComissoes: profissionais.value.reduce((sum, p) => sum + (p.totalComissoes || 0), 0),
      mediaAtendimentos: 0,
      mediaComissoes: 0
    }

    if (stats.totalProfissionais > 0) {
      stats.mediaAtendimentos = stats.totalAtendimentos / stats.totalProfissionais
      stats.mediaComissoes = stats.totalComissoes / stats.totalProfissionais
    }

    return stats
  }

  return {
    profissionais,
    carregando,
    buscarProfissionais,
    adicionarProfissional,
    atualizarProfissional,
    desativarProfissional,
    incrementarAtendimento,
    atualizarTotalComissoes,
    obterEstatisticasProfissionais
  }
}
