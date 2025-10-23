import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useDespesasRecorrentes() {
  const { clinicaId } = useClinica()
  const despesasRecorrentes = ref([])
  const carregando = ref(false)

  /**
   * Buscar despesas recorrentes
   */
  const buscarDespesasRecorrentes = async (ativo = null) => {
    try {
      carregando.value = true
      let q = query(
        collection(db, 'despesas_recorrentes'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      if (ativo !== null) {
        q = query(q, where('ativo', '==', ativo))
      }

      const snapshot = await getDocs(q)
      despesasRecorrentes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return despesasRecorrentes.value
    } catch (err) {
      console.error('Erro ao buscar despesas recorrentes:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Adicionar despesa recorrente
   */
  const adicionarDespesaRecorrente = async (dados) => {
    try {
      const despesa = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        ativo: true,
        ultimaGeracao: null, // Data da última vez que a conta foi gerada
        proximaGeracao: dados.diaVencimento, // Dia do mês para gerar a conta
        dataCriacao: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'despesas_recorrentes'), despesa)
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Erro ao adicionar despesa recorrente:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Atualizar despesa recorrente
   */
  const atualizarDespesaRecorrente = async (id, dados) => {
    try {
      await updateDoc(doc(db, 'despesas_recorrentes', id), dados)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Desativar despesa recorrente
   */
  const desativarDespesaRecorrente = async (id) => {
    try {
      await updateDoc(doc(db, 'despesas_recorrentes', id), { ativo: false })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Excluir despesa recorrente
   */
  const excluirDespesaRecorrente = async (id) => {
    try {
      await deleteDoc(doc(db, 'despesas_recorrentes', id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Gerar contas do mês para todas as despesas recorrentes ativas
   */
  const gerarContasMes = async (mes, ano) => {
    try {
      carregando.value = true
      const despesasAtivas = await buscarDespesasRecorrentes(true)
      
      const contasGeradas = []
      const hoje = new Date()
      const mesAtual = hoje.getMonth() + 1
      const anoAtual = hoje.getFullYear()

      for (const despesa of despesasAtivas) {
        // Verificar se já gerou a conta deste mês
        const jaGerou = despesa.ultimaGeracao && 
                       new Date(despesa.ultimaGeracao).getMonth() + 1 === mes &&
                       new Date(despesa.ultimaGeracao).getFullYear() === ano

        if (!jaGerou) {
          // Calcular data de vencimento
          const diaVencimento = despesa.diaVencimento || 10
          const dataVencimento = new Date(ano, mes - 1, diaVencimento)
          
          // Criar conta a pagar diretamente
          const conta = {
            descricao: `${despesa.descricao} - ${mes}/${ano}`,
            valor: despesa.valor,
            dataVencimento: dataVencimento.toISOString().split('T')[0],
            categoria: despesa.categoria || 'despesas-fixas',
            formaPagamento: despesa.formaPagamento || 'transferencia',
            fornecedorId: despesa.fornecedorId || null,
            fornecedorNome: despesa.fornecedorNome || 'Fixo',
            despesaRecorrenteId: despesa.id,
            observacoes: `Despesa recorrente gerada automaticamente`,
            status: 'pendente',
            clinicaId: clinicaId.value || 'demo',
            tipo: 'despesa',
            dataCriacao: serverTimestamp()
          }

          // Adicionar conta a pagar diretamente
          const docRef = await addDoc(collection(db, 'contas_pagar'), {
            ...conta,
            dataVencimento: Timestamp.fromDate(new Date(conta.dataVencimento))
          })
          
          if (docRef.id) {
            // Atualizar data da última geração
            await updateDoc(doc(db, 'despesas_recorrentes', despesa.id), {
              ultimaGeracao: new Date().toISOString()
            })
            contasGeradas.push({
              despesa: despesa.descricao,
              valor: despesa.valor,
              vencimento: dataVencimento.toISOString().split('T')[0]
            })
          }
        }
      }

      return { success: true, contasGeradas, total: contasGeradas.length }
    } catch (err) {
      console.error('Erro ao gerar contas do mês:', err)
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Gerar contas automaticamente (executar mensalmente)
   */
  const gerarContasAutomaticamente = async () => {
    const hoje = new Date()
    const mes = hoje.getMonth() + 1
    const ano = hoje.getFullYear()
    return await gerarContasMes(mes, ano)
  }

  return {
    despesasRecorrentes,
    carregando,
    buscarDespesasRecorrentes,
    adicionarDespesaRecorrente,
    atualizarDespesaRecorrente,
    desativarDespesaRecorrente,
    excluirDespesaRecorrente,
    gerarContasMes,
    gerarContasAutomaticamente
  }
}

