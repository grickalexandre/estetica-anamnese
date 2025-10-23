import { ref, computed } from 'vue'
import { useAuth } from './useAuth'
import { useClinica } from './useClinica'
import { db } from '../firebase.js'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc,
  onSnapshot 
} from 'firebase/firestore'

export function useFluxoCaixa() {
  const { isAuthenticated } = useAuth()
  const { clinicaId } = useClinica()
  
  // Estado
  const movimentacoes = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Computed
  const totalEntradas = computed(() => {
    return movimentacoes.value
      .filter(m => m.tipo === 'entrada' && m.ativo)
      .reduce((sum, m) => sum + m.valor, 0)
  })
  
  const totalSaidas = computed(() => {
    return movimentacoes.value
      .filter(m => m.tipo === 'saida' && m.ativo)
      .reduce((sum, m) => sum + m.valor, 0)
  })
  
  const saldoAtual = computed(() => {
    return totalEntradas.value - totalSaidas.value
  })
  
  const movimentacoesPorCategoria = computed(() => {
    const categorias = {}
    movimentacoes.value.forEach(mov => {
      if (!categorias[mov.categoria]) {
        categorias[mov.categoria] = {
          entrada: 0,
          saida: 0,
          total: 0
        }
      }
      categorias[mov.categoria][mov.tipo] += mov.valor
      categorias[mov.categoria].total += mov.tipo === 'entrada' ? mov.valor : -mov.valor
    })
    return categorias
  })
  
  const movimentacoesPorMes = computed(() => {
    const meses = {}
    movimentacoes.value.forEach(mov => {
      const mes = new Date(mov.data).toISOString().slice(0, 7) // YYYY-MM
      if (!meses[mes]) {
        meses[mes] = {
          entrada: 0,
          saida: 0,
          saldo: 0
        }
      }
      meses[mes][mov.tipo] += mov.valor
      meses[mes].saldo = meses[mes].entrada - meses[mes].saida
    })
    return meses
  })
  
  // Métodos
  const carregarMovimentacoes = async () => {
    try {
      loading.value = true
      error.value = null
      
      if (!clinicaId.value) return
      
      const q = query(
        collection(db, 'fluxoCaixa'),
        where('clinicaId', '==', clinicaId.value),
        where('ativo', '==', true),
        orderBy('data', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const movimentacoesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Calcular saldo acumulado
      let saldoAcumulado = 0
      movimentacoes.value = movimentacoesData.map(mov => {
        saldoAcumulado += mov.tipo === 'entrada' ? mov.valor : -mov.valor
        return {
          ...mov,
          saldoAcumulado
        }
      }).reverse() // Ordenar por data crescente para cálculo correto
      
    } catch (err) {
      error.value = err.message
      console.error('Erro ao carregar movimentações:', err)
    } finally {
      loading.value = false
    }
  }
  
  const adicionarMovimentacao = async (dados) => {
    try {
      loading.value = true
      error.value = null
      
      const dadosParaSalvar = {
        ...dados,
        clinicaId: clinicaId.value,
        dataCriacao: new Date(),
        ativo: true
      }
      
      const docRef = await addDoc(collection(db, 'fluxoCaixa'), dadosParaSalvar)
      
      // Recarregar dados
      await carregarMovimentacoes()
      
      return docRef.id
    } catch (err) {
      error.value = err.message
      console.error('Erro ao adicionar movimentação:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const atualizarMovimentacao = async (id, dados) => {
    try {
      loading.value = true
      error.value = null
      
      await updateDoc(doc(db, 'fluxoCaixa', id), dados)
      
      // Recarregar dados
      await carregarMovimentacoes()
      
    } catch (err) {
      error.value = err.message
      console.error('Erro ao atualizar movimentação:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const excluirMovimentacao = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      await updateDoc(doc(db, 'fluxoCaixa', id), { ativo: false })
      
      // Recarregar dados
      await carregarMovimentacoes()
      
    } catch (err) {
      error.value = err.message
      console.error('Erro ao excluir movimentação:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const filtrarMovimentacoes = (filtros) => {
    let filtradas = movimentacoes.value
    
    // Filtro por período
    if (filtros.periodo) {
      const agora = new Date()
      const inicio = new Date()
      
      switch (filtros.periodo) {
        case 'hoje':
          inicio.setHours(0, 0, 0, 0)
          break
        case 'semana':
          inicio.setDate(agora.getDate() - 7)
          break
        case 'mes':
          inicio.setMonth(agora.getMonth() - 1)
          break
        case 'trimestre':
          inicio.setMonth(agora.getMonth() - 3)
          break
        case 'ano':
          inicio.setFullYear(agora.getFullYear() - 1)
          break
      }
      
      filtradas = filtradas.filter(m => {
        const dataMov = new Date(m.data)
        return dataMov >= inicio
      })
    }
    
    // Filtro por tipo
    if (filtros.tipo) {
      filtradas = filtradas.filter(m => m.tipo === filtros.tipo)
    }
    
    // Filtro por categoria
    if (filtros.categoria) {
      filtradas = filtradas.filter(m => m.categoria === filtros.categoria)
    }
    
    // Filtro por busca
    if (filtros.busca) {
      filtradas = filtradas.filter(m => 
        m.descricao.toLowerCase().includes(filtros.busca.toLowerCase())
      )
    }
    
    return filtradas.sort((a, b) => new Date(b.data) - new Date(a.data))
  }
  
  const obterRelatorio = (periodo = 'mes') => {
    const filtradas = filtrarMovimentacoes({ periodo })
    
    const entrada = filtradas
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.valor, 0)
    
    const saida = filtradas
      .filter(m => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.valor, 0)
    
    return {
      entrada,
      saida,
      saldo: entrada - saida,
      total: filtradas.length,
      porCategoria: movimentacoesPorCategoria.value,
      porMes: movimentacoesPorMes.value
    }
  }
  
  const calcularProjecao = (dias = 30) => {
    const hoje = new Date()
    const ultimos30Dias = movimentacoes.value.filter(m => {
      const dataMov = new Date(m.data)
      const diasDiff = (hoje - dataMov) / (1000 * 60 * 60 * 24)
      return diasDiff <= 30
    })
    
    const mediaDiaria = saldoAtual.value / 30
    return saldoAtual.value + (mediaDiaria * dias)
  }
  
  // Listener em tempo real
  const iniciarListener = () => {
    if (!clinicaId.value) return
    
    const q = query(
      collection(db, 'fluxoCaixa'),
      where('clinicaId', '==', clinicaId.value),
      where('ativo', '==', true),
      orderBy('data', 'desc')
    )
    
    return onSnapshot(q, (snapshot) => {
      const movimentacoesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Calcular saldo acumulado
      let saldoAcumulado = 0
      movimentacoes.value = movimentacoesData.map(mov => {
        saldoAcumulado += mov.tipo === 'entrada' ? mov.valor : -mov.valor
        return {
          ...mov,
          saldoAcumulado
        }
      }).reverse()
    })
  }
  
  return {
    // Estado
    movimentacoes,
    loading,
    error,
    
    // Computed
    totalEntradas,
    totalSaidas,
    saldoAtual,
    movimentacoesPorCategoria,
    movimentacoesPorMes,
    
    // Métodos
    carregarMovimentacoes,
    adicionarMovimentacao,
    atualizarMovimentacao,
    excluirMovimentacao,
    filtrarMovimentacoes,
    obterRelatorio,
    calcularProjecao,
    iniciarListener
  }
}
