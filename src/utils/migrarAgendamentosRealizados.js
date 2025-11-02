import { db } from '../firebase.js'
import { collection, getDocs, addDoc, updateDoc, doc, query, where, serverTimestamp, Timestamp } from 'firebase/firestore'

/**
 * Script de migração: Converter agendamentos "realizados" em atendimentos
 * 
 * Este script busca todos os agendamentos com status "realizado" que ainda não
 * possuem um atendimento correspondente e cria os registros na coleção 'atendimentos'
 */

export async function migrarAgendamentosRealizados(clinicaId) {
  try {
    console.log('🔄 INICIANDO MIGRAÇÃO DE AGENDAMENTOS REALIZADOS')
    console.log('Clínica ID:', clinicaId)
    
    // 1. Buscar agendamentos com status "realizado"
    const q = query(
      collection(db, 'agendamentos'),
      where('clinicaId', '==', clinicaId),
      where('status', '==', 'realizado')
    )
    
    const snapshot = await getDocs(q)
    console.log(`📋 Total de agendamentos "realizados" encontrados: ${snapshot.size}`)
    
    if (snapshot.size === 0) {
      console.log('✅ Nenhum agendamento para migrar')
      return {
        success: true,
        total: 0,
        migrados: 0,
        jaExistentes: 0,
        erros: 0
      }
    }
    
    const agendamentosRealizados = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // 2. Verificar quais já possuem atendimento criado
    const atendimentosQuery = query(
      collection(db, 'atendimentos'),
      where('clinicaId', '==', clinicaId)
    )
    const atendimentosSnapshot = await getDocs(atendimentosQuery)
    const agendamentosComAtendimento = new Set(
      atendimentosSnapshot.docs
        .map(doc => doc.data().agendamentoId)
        .filter(id => id)
    )
    
    console.log(`✅ Atendimentos já existentes: ${agendamentosComAtendimento.size}`)
    
    // 3. Filtrar apenas agendamentos que ainda não têm atendimento
    const agendamentosParaMigrar = agendamentosRealizados.filter(ag => !agendamentosComAtendimento.has(ag.id))
    
    console.log(`🔄 Agendamentos para migrar: ${agendamentosParaMigrar.length}`)
    
    if (agendamentosParaMigrar.length === 0) {
      console.log('✅ Todos os agendamentos já possuem atendimentos correspondentes')
      return {
        success: true,
        total: agendamentosRealizados.length,
        migrados: 0,
        jaExistentes: agendamentosRealizados.length,
        erros: 0
      }
    }
    
    // 4. Migrar cada agendamento
    let migrados = 0
    let erros = 0
    const errosDetalhados = []
    
    for (const agend of agendamentosParaMigrar) {
      try {
        console.log(`Migrando agendamento ${agend.id} - ${agend.clienteNome || agend.pacienteNome}`)
        
        // Preparar dados do atendimento
        const dataAtendimento = agend.dataAtendimento 
          ? (agend.dataAtendimento.toDate ? agend.dataAtendimento.toDate() : new Date(agend.dataAtendimento))
          : (agend.dataHora?.toDate ? agend.dataHora.toDate() : new Date(agend.dataHora || new Date()))
        
        const dadosAtendimento = {
          // Dados do cliente
          clienteId: agend.clienteId || null,
          clienteNome: agend.clienteNome || agend.pacienteNome || 'Cliente não informado',
          
          // Dados do profissional
          profissionalId: agend.profissionalId || null,
          profissionalNome: agend.profissional || 'Profissional não informado',
          
          // Dados do procedimento
          procedimentoId: agend.procedimentoId || null,
          procedimentoNome: agend.procedimento || 'Procedimento não informado',
          procedimentos: [{
            procedimentoId: agend.procedimentoId || null,
            procedimentoNome: agend.procedimento || 'Procedimento não informado',
            valor: agend.valorCobrado || agend.valorEstimado || 0,
            duracao: agend.duracao || 60
          }],
          
          // Dados financeiros
          data: Timestamp.fromDate(dataAtendimento),
          valorCobrado: agend.valorCobrado || agend.valorEstimado || 0,
          formaPagamento: agend.formaPagamento || 'dinheiro',
          numeroParcelas: agend.numeroParcelas || 1,
          pago: agend.pago !== undefined ? agend.pago : true,
          dataVencimento: agend.dataVencimento || dataAtendimento.toISOString().split('T')[0],
          observacoes: agend.observacoes || 'Migrado de agendamento realizado',
          
          // Status de pagamento
          pagamentoStatus: agend.pago ? 'pago' : 'pendente',
          
          // Referência ao agendamento
          agendamentoId: agend.id,
          
          // Produtos utilizados (vazio na migração)
          produtosUtilizados: [],
          
          // Metadados
          clinicaId: clinicaId,
          dataCriacao: serverTimestamp(),
          migrado: true, // Flag para identificar registros migrados
          dataOriginal: agend.dataHora || null
        }
        
        // Criar atendimento
        const docRef = await addDoc(collection(db, 'atendimentos'), dadosAtendimento)
        console.log(`✅ Atendimento criado: ${docRef.id}`)
        
        // Atualizar agendamento com referência ao atendimento
        await updateDoc(doc(db, 'agendamentos', agend.id), {
          atendimentoId: docRef.id,
          migradoParaAtendimento: true,
          dataMigracao: serverTimestamp()
        })
        
        migrados++
        
      } catch (error) {
        console.error(`❌ Erro ao migrar agendamento ${agend.id}:`, error)
        erros++
        errosDetalhados.push({
          agendamentoId: agend.id,
          cliente: agend.clienteNome || agend.pacienteNome,
          erro: error.message
        })
      }
    }
    
    // 5. Resumo da migração
    const resultado = {
      success: true,
      total: agendamentosRealizados.length,
      migrados,
      jaExistentes: agendamentosRealizados.length - agendamentosParaMigrar.length,
      erros,
      errosDetalhados
    }
    
    console.log('🎉 MIGRAÇÃO CONCLUÍDA')
    console.log(`Total de agendamentos realizados: ${resultado.total}`)
    console.log(`Migrados com sucesso: ${resultado.migrados}`)
    console.log(`Já existentes: ${resultado.jaExistentes}`)
    console.log(`Erros: ${resultado.erros}`)
    
    if (resultado.erros > 0) {
      console.log('❌ Detalhes dos erros:', resultado.errosDetalhados)
    }
    
    return resultado
    
  } catch (error) {
    console.error('❌ ERRO FATAL na migração:', error)
    return {
      success: false,
      error: error.message,
      total: 0,
      migrados: 0,
      jaExistentes: 0,
      erros: 0
    }
  }
}

/**
 * Executar migração para a clínica atual
 */
export async function executarMigracao() {
  try {
    // Obter clinicaId do localStorage (mesma lógica do useClinica)
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const clinicaId = userData.clinicaId
    
    if (!clinicaId) {
      throw new Error('Clínica não identificada. Faça login primeiro.')
    }
    
    console.log('🚀 Executando migração para clínica:', clinicaId)
    const resultado = await migrarAgendamentosRealizados(clinicaId)
    
    return resultado
    
  } catch (error) {
    console.error('Erro ao executar migração:', error)
    throw error
  }
}

