import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useComissoes() {
  const { clinicaId } = useClinica()
  const comissoes = ref([])
  const carregando = ref(false)

  /**
   * Buscar comissões
   */
  const buscarComissoes = async (filtros = {}) => {
    try {
      carregando.value = true
      let q = query(
        collection(db, 'comissoes'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      if (filtros.profissionalId) {
        q = query(q, where('profissionalId', '==', filtros.profissionalId))
      }

      if (filtros.status) {
        q = query(q, where('pago', '==', filtros.status === 'pago'))
      }

      if (filtros.dataInicio && filtros.dataFim) {
        q = query(
          q,
          where('data', '>=', Timestamp.fromDate(new Date(filtros.dataInicio))),
          where('data', '<=', Timestamp.fromDate(new Date(filtros.dataFim)))
        )
      }

      const snapshot = await getDocs(q)
      comissoes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return comissoes.value
    } catch (err) {
      console.error('Erro ao buscar comissões:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Calcular e criar comissão de atendimento
   */
  const gerarComissao = async (dados) => {
    try {
      const comissao = {
        clinicaId: clinicaId.value || 'demo',
        profissionalId: dados.profissionalId,
        profissionalNome: dados.profissionalNome,
        atendimentoId: dados.atendimentoId,
        pacienteId: dados.pacienteId,
        pacienteNome: dados.pacienteNome,
        procedimentoNome: dados.procedimentoNome,
        valorAtendimento: dados.valorAtendimento,
        percentualComissao: dados.percentualComissao || 0,
        valorComissao: (dados.valorAtendimento * (dados.percentualComissao / 100)),
        data: Timestamp.fromDate(new Date(dados.data)),
        pago: false,
        dataPagamento: null,
        observacoes: dados.observacoes || '',
        dataCriacao: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'comissoes'), comissao)

      // Atualizar total de comissões do profissional
      const { incrementarComissao } = await import('./useProfissionais.js')
      await incrementarComissao(dados.profissionalId, comissao.valorComissao)

      return { success: true, id: docRef.id, valorComissao: comissao.valorComissao }
    } catch (err) {
      console.error('Erro ao gerar comissão:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Pagar comissão
   */
  const pagarComissao = async (comissaoId, dataPagamento) => {
    try {
      await updateDoc(doc(db, 'comissoes', comissaoId), {
        pago: true,
        dataPagamento: Timestamp.fromDate(new Date(dataPagamento))
      })

      // Registrar no financeiro como despesa
      const comissao = comissoes.value.find(c => c.id === comissaoId)
      if (comissao) {
        const { adicionarContaPagar } = await import('./useFinanceiro.js')
        await adicionarContaPagar({
          descricao: `Comissão - ${comissao.profissionalNome} - ${comissao.procedimentoNome}`,
          valor: comissao.valorComissao,
          dataVencimento: dataPagamento,
          categoria: 'comissoes',
          fornecedorId: comissao.profissionalId,
          fornecedorNome: comissao.profissionalNome,
          comissaoId: comissaoId,
          status: 'pago',
          formaPagamento: 'pix',
          observacoes: `Comissão de ${comissao.percentualComissao}% sobre R$ ${comissao.valorAtendimento}`
        })
      }

      return { success: true }
    } catch (err) {
      console.error('Erro ao pagar comissão:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Obter estatísticas de comissões
   */
  const obterEstatisticasComissoes = async (profissionalId, dataInicio, dataFim) => {
    try {
      const filtros = { profissionalId, dataInicio, dataFim }
      const comissoes = await buscarComissoes(filtros)

      const stats = {
        total: comissoes.length,
        totalValor: 0,
        pagas: 0,
        pendentes: 0,
        valorPago: 0,
        valorPendente: 0
      }

      comissoes.forEach(comissao => {
        stats.totalValor += comissao.valorComissao || 0
        if (comissao.pago) {
          stats.pagas++
          stats.valorPago += comissao.valorComissao || 0
        } else {
          stats.pendentes++
          stats.valorPendente += comissao.valorComissao || 0
        }
      })

      return stats
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err)
      return null
    }
  }

  return {
    comissoes,
    carregando,
    buscarComissoes,
    gerarComissao,
    pagarComissao,
    obterEstatisticasComissoes
  }
}

