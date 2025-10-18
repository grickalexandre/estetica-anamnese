import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore'
import { useClinica } from './useClinica.js'
import { useProdutos } from './useProdutos.js'
import { useEstoque } from './useEstoque.js'

export function useProcedimentos() {
  const { clinicaId } = useClinica()
  const procedimentos = ref([])
  const atendimentos = ref([])
  const carregando = ref(false)

  /**
   * Buscar catálogo de procedimentos
   */
  const buscarCatalogo = async () => {
    try {
      carregando.value = true
      const q = query(
        collection(db, 'catalogo_procedimentos'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('ativo', '==', true)
      )
      const snapshot = await getDocs(q)
      procedimentos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return procedimentos.value
    } catch (err) {
      console.error('Erro ao buscar catálogo:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Adicionar procedimento ao catálogo
   */
  const adicionarAoCatalogo = async (dados) => {
    try {
      const procedimento = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        ativo: true,
        totalRealizados: 0,
        dataCriacao: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'catalogo_procedimentos'), procedimento)
      return { success: true, id: docRef.id }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Registrar atendimento (procedimento realizado)
   */
  const registrarAtendimento = async (dados) => {
    try {
      carregando.value = true
      
      // 1. Registrar o atendimento
      const atendimento = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        data: Timestamp.fromDate(new Date(dados.data)),
        dataCriacao: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'atendimentos'), atendimento)

      // 2. Dar baixa nos produtos utilizados e calcular custos
      let custoTotalProdutos = 0
      if (dados.produtosUtilizados && dados.produtosUtilizados.length > 0) {
        const { atualizarEstoque, produtos } = useProdutos()
        const { saida } = useEstoque()

        for (const item of dados.produtosUtilizados) {
          // Dar baixa no estoque
          const resultado = await atualizarEstoque(item.produtoId, item.quantidade, 'saida')
          
          if (resultado.success) {
            // Calcular custo do produto
            const produto = produtos.value.find(p => p.id === item.produtoId)
            const custoProduto = (produto?.precoCusto || 0) * item.quantidade
            custoTotalProdutos += custoProduto

            // Registrar movimentação
            await saida(
              item.produtoId,
              item.produtoNome,
              item.quantidade,
              `Utilizado em: ${dados.procedimentoNome} - Cliente: ${dados.clienteNome}`,
              custoProduto
            )
          }
        }
      }

      // 3. Atualizar contador do procedimento no catálogo
      if (dados.procedimentoId) {
        const procRef = doc(db, 'catalogo_procedimentos', dados.procedimentoId)
        const proc = procedimentos.value.find(p => p.id === dados.procedimentoId)
        if (proc) {
          await updateDoc(procRef, {
            totalRealizados: (proc.totalRealizados || 0) + 1
          })
        }
      }

      // 4. Atualizar cliente
      if (dados.clienteId) {
        const { incrementarAtendimento } = await import('./usePacientes.js')
        await incrementarAtendimento(dados.clienteId, dados.valorCobrado || 0)
      }

      // 5. Gestão financeira - Conta a Receber
      if (dados.valorCobrado && dados.valorCobrado > 0) {
        const { adicionarContaReceber } = await import('./useFinanceiro.js')
        
        const contaReceber = {
          descricao: `Atendimento: ${dados.procedimentoNome} - ${dados.clienteNome}`,
          valor: dados.valorCobrado,
          dataVencimento: dados.dataVencimento || new Date().toISOString().split('T')[0],
          categoria: 'atendimentos',
          clienteId: dados.clienteId,
          clienteNome: dados.clienteNome,
          atendimentoId: docRef.id,
          status: dados.pago ? 'pago' : 'pendente',
          observacoes: dados.observacoes || ''
        }

        await adicionarContaReceber(contaReceber)
      }

      // 6. Gestão financeira - Conta a Pagar (custos dos produtos)
      if (custoTotalProdutos > 0) {
        const { adicionarContaPagar } = await import('./useFinanceiro.js')
        
        const contaPagar = {
          descricao: `Custos de produtos - Atendimento: ${dados.procedimentoNome} - ${dados.clienteNome}`,
          valor: custoTotalProdutos,
          dataVencimento: new Date().toISOString().split('T')[0], // Custo imediato
          categoria: 'custos-produtos',
          fornecedorId: null,
          fornecedorNome: 'Custo Interno',
          atendimentoId: docRef.id,
          status: 'pago', // Custo já "pago" quando o produto foi comprado
          observacoes: `Custo dos produtos utilizados no atendimento`
        }

        await adicionarContaPagar(contaPagar)
      }

      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Erro ao registrar atendimento:', err)
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Buscar atendimentos realizados
   */
  const buscarAtendimentos = async (dataInicio, dataFim, clienteId = null) => {
    try {
      carregando.value = true
      let q = query(
        collection(db, 'atendimentos'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      if (dataInicio && dataFim) {
        q = query(
          q,
          where('data', '>=', Timestamp.fromDate(new Date(dataInicio))),
          where('data', '<=', Timestamp.fromDate(new Date(dataFim)))
        )
      }

      if (clienteId) {
        q = query(q, where('clienteId', '==', clienteId))
      }

      const snapshot = await getDocs(q)
      atendimentos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return atendimentos.value
    } catch (err) {
      console.error('Erro ao buscar atendimentos:', err)
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Calcular estatísticas de atendimentos
   */
  const obterEstatisticasAtendimentos = async (dataInicio, dataFim) => {
    try {
      const atendimentos = await buscarAtendimentos(dataInicio, dataFim)
      
      const stats = {
        totalAtendimentos: atendimentos.length,
        totalReceita: 0,
        totalCustos: 0,
        margemLucro: 0,
        procedimentosRealizados: {},
        clientesAtendidos: new Set()
      }

      atendimentos.forEach(atendimento => {
        // Receita
        stats.totalReceita += atendimento.valorCobrado || 0
        
        // Custos (se disponível)
        if (atendimento.custoProdutos) {
          stats.totalCustos += atendimento.custoProdutos
        }
        
        // Procedimentos
        const procNome = atendimento.procedimentoNome || 'Não informado'
        stats.procedimentosRealizados[procNome] = (stats.procedimentosRealizados[procNome] || 0) + 1
        
        // Clientes únicos
        if (atendimento.clienteId) {
          stats.clientesAtendidos.add(atendimento.clienteId)
        }
      })

      // Calcular margem de lucro
      if (stats.totalReceita > 0) {
        stats.margemLucro = ((stats.totalReceita - stats.totalCustos) / stats.totalReceita) * 100
      }

      stats.clientesUnicos = stats.clientesAtendidos.size
      delete stats.clientesAtendidos

      return stats
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err)
      return null
    }
  }

  /**
   * Buscar atendimentos por cliente
   */
  const buscarAtendimentosPorCliente = async (clienteId) => {
    try {
      const atendimentos = await buscarAtendimentos(null, null, clienteId)
      return atendimentos.sort((a, b) => new Date(b.data.toDate()) - new Date(a.data.toDate()))
    } catch (err) {
      console.error('Erro ao buscar atendimentos do cliente:', err)
      return []
    }
  }

  return {
    procedimentos,
    atendimentos,
    carregando,
    buscarCatalogo,
    adicionarAoCatalogo,
    registrarAtendimento,
    buscarAtendimentos,
    obterEstatisticasAtendimentos,
    buscarAtendimentosPorCliente
  }
}

