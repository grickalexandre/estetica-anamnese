import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useKPIs() {
  const { clinicaId } = useClinica()
  const carregando = ref(false)

  const calcularKPIs = async (dataInicio, dataFim) => {
    try {
      carregando.value = true
      
      // Buscar dados
      const [receitas, despesas, agendamentos, anamneses] = await Promise.all([
        buscarReceitas(dataInicio, dataFim),
        buscarDespesas(dataInicio, dataFim),
        buscarAgendamentos(dataInicio, dataFim),
        buscarAnamneses(dataInicio, dataFim)
      ])

      // Calcular KPIs Financeiros
      const receitaTotal = receitas.reduce((sum, r) => sum + (r.valorRecebido || r.valor || 0), 0)
      const despesaTotal = despesas.reduce((sum, d) => sum + (d.valorPago || d.valor || 0), 0)
      const lucro = receitaTotal - despesaTotal
      const margemLucro = receitaTotal > 0 ? (lucro / receitaTotal) * 100 : 0
      const ticketMedio = receitas.length > 0 ? receitaTotal / receitas.length : 0

      // Calcular KPIs Operacionais
      const agendamentosRealizados = agendamentos.filter(a => a.status === 'realizado').length
      const agendamentosCancelados = agendamentos.filter(a => a.status === 'cancelado').length
      const taxaComparecimento = agendamentos.length > 0 ? (agendamentosRealizados / agendamentos.length) * 100 : 0
      const taxaCancelamento = agendamentos.length > 0 ? (agendamentosCancelados / agendamentos.length) * 100 : 0

      // Calcular KPIs de Clientes
      const novosClientes = anamneses.length
      const clientesUnicos = new Set(anamneses.map(a => a.nome)).size

      return {
        financeiros: { receitaTotal, despesaTotal, lucro, margemLucro, ticketMedio },
        operacionais: { totalAgendamentos: agendamentos.length, agendamentosRealizados, taxaComparecimento, taxaCancelamento },
        clientes: { novosClientes, clientesUnicos, totalAnamneses: anamneses.length }
      }
    } catch (err) {
      console.error('Erro ao calcular KPIs:', err)
      return null
    } finally {
      carregando.value = false
    }
  }

  const buscarReceitas = async (inicio, fim) => {
    const q = query(
      collection(db, 'contas_receber'),
      where('clinicaId', '==', clinicaId.value || 'demo'),
      where('status', '==', 'recebido'),
      where('dataRecebimento', '>=', Timestamp.fromDate(new Date(inicio))),
      where('dataRecebimento', '<=', Timestamp.fromDate(new Date(fim)))
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data())
  }

  const buscarDespesas = async (inicio, fim) => {
    const q = query(
      collection(db, 'contas_pagar'),
      where('clinicaId', '==', clinicaId.value || 'demo'),
      where('status', '==', 'pago'),
      where('dataPagamento', '>=', Timestamp.fromDate(new Date(inicio))),
      where('dataPagamento', '<=', Timestamp.fromDate(new Date(fim)))
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data())
  }

  const buscarAgendamentos = async (inicio, fim) => {
    const q = query(
      collection(db, 'agendamentos'),
      where('clinicaId', '==', clinicaId.value || 'demo'),
      where('dataHora', '>=', Timestamp.fromDate(new Date(inicio))),
      where('dataHora', '<=', Timestamp.fromDate(new Date(fim)))
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data())
  }

  const buscarAnamneses = async (inicio, fim) => {
    const q = query(
      collection(db, 'anamneses'),
      where('clinicaId', '==', clinicaId.value || 'demo'),
      where('dataCriacao', '>=', Timestamp.fromDate(new Date(inicio))),
      where('dataCriacao', '<=', Timestamp.fromDate(new Date(fim)))
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data())
  }

  return { carregando, calcularKPIs }
}

