import { ref, computed } from 'vue'
import { db } from '../firebase.js'
import { 
  collection, 
  getDocs, 
  query, 
  where,
  Timestamp
} from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useRelatoriosFinanceiros() {
  const { clinicaId } = useClinica()
  const carregando = ref(false)
  const erro = ref('')
  const contasPagar = ref([])
  const contasReceber = ref([])
  const categorias = ref([])

  /**
   * Buscar dados para DRE
   */
  const gerarDRE = async (dataInicio, dataFim) => {
    try {
      carregando.value = true
      erro.value = ''

      // Buscar contas recebidas no período
      const qReceitas = query(
        collection(db, 'contas_receber'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('status', '==', 'recebido'),
        where('dataRecebimento', '>=', Timestamp.fromDate(new Date(dataInicio))),
        where('dataRecebimento', '<=', Timestamp.fromDate(new Date(dataFim)))
      )
      
      const snapshotReceitas = await getDocs(qReceitas)
      const receitas = snapshotReceitas.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Buscar contas pagas no período
      const qDespesas = query(
        collection(db, 'contas_pagar'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('status', '==', 'pago'),
        where('dataPagamento', '>=', Timestamp.fromDate(new Date(dataInicio))),
        where('dataPagamento', '<=', Timestamp.fromDate(new Date(dataFim)))
      )
      
      const snapshotDespesas = await getDocs(qDespesas)
      const despesas = snapshotDespesas.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Buscar categorias
      const qCategorias = query(
        collection(db, 'plano_contas'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )
      const snapshotCategorias = await getDocs(qCategorias)
      const cats = snapshotCategorias.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Agrupar receitas por categoria
      const receitasPorCategoria = {}
      receitas.forEach(receita => {
        const cat = receita.categoria || 'outros'
        if (!receitasPorCategoria[cat]) {
          receitasPorCategoria[cat] = {
            total: 0,
            quantidade: 0,
            itens: []
          }
        }
        const valor = receita.valorRecebido || receita.valor || 0
        receitasPorCategoria[cat].total += valor
        receitasPorCategoria[cat].quantidade += 1
        receitasPorCategoria[cat].itens.push(receita)
      })

      // Agrupar despesas por categoria
      const despesasPorCategoria = {}
      despesas.forEach(despesa => {
        const cat = despesa.categoria || 'outros'
        if (!despesasPorCategoria[cat]) {
          despesasPorCategoria[cat] = {
            total: 0,
            quantidade: 0,
            itens: []
          }
        }
        const valor = despesa.valorPago || despesa.valor || 0
        despesasPorCategoria[cat].total += valor
        despesasPorCategoria[cat].quantidade += 1
        despesasPorCategoria[cat].itens.push(despesa)
      })

      // Calcular totais
      const receitaTotal = receitas.reduce((sum, r) => sum + (r.valorRecebido || r.valor || 0), 0)
      const despesaTotal = despesas.reduce((sum, d) => sum + (d.valorPago || d.valor || 0), 0)
      const lucroLiquido = receitaTotal - despesaTotal
      const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0

      return {
        success: true,
        periodo: { dataInicio, dataFim },
        receitas: {
          total: receitaTotal,
          porCategoria: receitasPorCategoria,
          quantidade: receitas.length
        },
        despesas: {
          total: despesaTotal,
          porCategoria: despesasPorCategoria,
          quantidade: despesas.length
        },
        resultado: {
          lucroLiquido,
          margemLucro
        },
        categorias: cats
      }
    } catch (err) {
      console.error('Erro ao gerar DRE:', err)
      erro.value = 'Erro ao gerar relatório DRE'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Análise por categoria
   */
  const analisarPorCategoria = async (dataInicio, dataFim, tipo = null) => {
    try {
      carregando.value = true
      erro.value = ''

      const analise = {
        receitas: {},
        despesas: {}
      }

      // Buscar receitas
      if (!tipo || tipo === 'receita') {
        const qReceitas = query(
          collection(db, 'contas_receber'),
          where('clinicaId', '==', clinicaId.value || 'demo'),
          where('status', '==', 'recebido'),
          where('dataRecebimento', '>=', Timestamp.fromDate(new Date(dataInicio))),
          where('dataRecebimento', '<=', Timestamp.fromDate(new Date(dataFim)))
        )
        
        const snapshotReceitas = await getDocs(qReceitas)
        snapshotReceitas.docs.forEach(doc => {
          const data = doc.data()
          const cat = data.categoria || 'outros'
          
          if (!analise.receitas[cat]) {
            analise.receitas[cat] = {
              total: 0,
              quantidade: 0,
              media: 0,
              percentual: 0
            }
          }
          
          const valor = data.valorRecebido || data.valor || 0
          analise.receitas[cat].total += valor
          analise.receitas[cat].quantidade += 1
        })
      }

      // Buscar despesas
      if (!tipo || tipo === 'despesa') {
        const qDespesas = query(
          collection(db, 'contas_pagar'),
          where('clinicaId', '==', clinicaId.value || 'demo'),
          where('status', '==', 'pago'),
          where('dataPagamento', '>=', Timestamp.fromDate(new Date(dataInicio))),
          where('dataPagamento', '<=', Timestamp.fromDate(new Date(dataFim)))
        )
        
        const snapshotDespesas = await getDocs(qDespesas)
        snapshotDespesas.docs.forEach(doc => {
          const data = doc.data()
          const cat = data.categoria || 'outros'
          
          if (!analise.despesas[cat]) {
            analise.despesas[cat] = {
              total: 0,
              quantidade: 0,
              media: 0,
              percentual: 0
            }
          }
          
          const valor = data.valorPago || data.valor || 0
          analise.despesas[cat].total += valor
          analise.despesas[cat].quantidade += 1
        })
      }

      // Calcular médias e percentuais
      const totalReceitas = Object.values(analise.receitas).reduce((sum, cat) => sum + cat.total, 0)
      const totalDespesas = Object.values(analise.despesas).reduce((sum, cat) => sum + cat.total, 0)

      Object.keys(analise.receitas).forEach(cat => {
        analise.receitas[cat].media = analise.receitas[cat].total / analise.receitas[cat].quantidade
        analise.receitas[cat].percentual = totalReceitas > 0 ? (analise.receitas[cat].total / totalReceitas) * 100 : 0
      })

      Object.keys(analise.despesas).forEach(cat => {
        analise.despesas[cat].media = analise.despesas[cat].total / analise.despesas[cat].quantidade
        analise.despesas[cat].percentual = totalDespesas > 0 ? (analise.despesas[cat].total / totalDespesas) * 100 : 0
      })

      return {
        success: true,
        periodo: { dataInicio, dataFim },
        analise,
        totais: {
          receitas: totalReceitas,
          despesas: totalDespesas
        }
      }
    } catch (err) {
      console.error('Erro ao analisar por categoria:', err)
      erro.value = 'Erro ao analisar categorias'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Comparativo mensal
   */
  const compararMeses = async (meses = 6) => {
    try {
      carregando.value = true
      erro.value = ''

      const hoje = new Date()
      const comparativo = []

      for (let i = meses - 1; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
        const mesNome = mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        const dataInicio = new Date(mes.getFullYear(), mes.getMonth(), 1)
        const dataFim = new Date(mes.getFullYear(), mes.getMonth() + 1, 0, 23, 59, 59)

        // Buscar receitas do mês
        const qReceitas = query(
          collection(db, 'contas_receber'),
          where('clinicaId', '==', clinicaId.value || 'demo'),
          where('status', '==', 'recebido'),
          where('dataRecebimento', '>=', Timestamp.fromDate(dataInicio)),
          where('dataRecebimento', '<=', Timestamp.fromDate(dataFim))
        )
        
        const snapshotReceitas = await getDocs(qReceitas)
        const receitasMes = snapshotReceitas.docs.reduce((sum, doc) => {
          const data = doc.data()
          return sum + (data.valorRecebido || data.valor || 0)
        }, 0)

        // Buscar despesas do mês
        const qDespesas = query(
          collection(db, 'contas_pagar'),
          where('clinicaId', '==', clinicaId.value || 'demo'),
          where('status', '==', 'pago'),
          where('dataPagamento', '>=', Timestamp.fromDate(dataInicio)),
          where('dataPagamento', '<=', Timestamp.fromDate(dataFim))
        )
        
        const snapshotDespesas = await getDocs(qDespesas)
        const despesasMes = snapshotDespesas.docs.reduce((sum, doc) => {
          const data = doc.data()
          return sum + (data.valorPago || data.valor || 0)
        }, 0)

        comparativo.push({
          mes: mesNome,
          mesNumero: mes.getMonth() + 1,
          ano: mes.getFullYear(),
          receitas: receitasMes,
          despesas: despesasMes,
          lucro: receitasMes - despesasMes,
          margem: receitasMes > 0 ? ((receitasMes - despesasMes) / receitasMes) * 100 : 0
        })
      }

      // Calcular médias
      const totalMeses = comparativo.length
      const mediaReceitas = comparativo.reduce((sum, m) => sum + m.receitas, 0) / totalMeses
      const mediaDespesas = comparativo.reduce((sum, m) => sum + m.despesas, 0) / totalMeses
      const mediaLucro = comparativo.reduce((sum, m) => sum + m.lucro, 0) / totalMeses

      return {
        success: true,
        comparativo,
        medias: {
          receitas: mediaReceitas,
          despesas: mediaDespesas,
          lucro: mediaLucro
        }
      }
    } catch (err) {
      console.error('Erro ao comparar meses:', err)
      erro.value = 'Erro ao gerar comparativo'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Buscar orçamentos
   */
  const buscarOrcamentos = async () => {
    try {
      carregando.value = true
      erro.value = ''

      const q = query(
        collection(db, 'orcamentos'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )
      
      const snapshot = await getDocs(q)
      const orcamentos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true, orcamentos }
    } catch (err) {
      console.error('Erro ao buscar orçamentos:', err)
      erro.value = 'Erro ao carregar orçamentos'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  return {
    // Estado
    carregando,
    erro,
    contasPagar,
    contasReceber,
    categorias,

    // Métodos
    gerarDRE,
    analisarPorCategoria,
    compararMeses,
    buscarOrcamentos
  }
}

