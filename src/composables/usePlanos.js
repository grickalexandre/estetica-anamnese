import { ref } from 'vue'
import { db } from '../firebase.js'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'

export function usePlanos() {
  const planos = ref([])
  const carregando = ref(false)
  const erro = ref('')

  /**
   * Buscar planos disponíveis
   */
  const buscarPlanos = async () => {
    try {
      carregando.value = true
      erro.value = ''

      const q = query(
        collection(db, 'planos'),
        where('ativo', '==', true),
        orderBy('ordem', 'asc')
      )

      const snapshot = await getDocs(q)
      planos.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return planos.value
    } catch (err) {
      console.error('Erro ao buscar planos:', err)
      erro.value = 'Erro ao carregar planos'
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Criar plano (apenas admin do sistema)
   */
  const criarPlano = async (dados) => {
    try {
      const plano = {
        nome: dados.nome,
        descricao: dados.descricao || '',
        limiteUsuarios: parseInt(dados.limiteUsuarios) || 1,
        limitePacientes: parseInt(dados.limitePacientes) || 100,
        limiteAgendamentos: parseInt(dados.limiteAgendamentos) || 1000,
        limiteArmazenamento: parseInt(dados.limiteArmazenamento) || 1, // GB
        valorMensal: parseFloat(dados.valorMensal) || 0,
        valorAnual: parseFloat(dados.valorAnual) || 0,
        recursos: dados.recursos || [],
        ativo: true,
        ordem: parseInt(dados.ordem) || 0,
        dataCriacao: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'planos'), plano)
      
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao criar plano:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Atualizar plano
   */
  const atualizarPlano = async (planoId, dados) => {
    try {
      const planoRef = doc(db, 'planos', planoId)
      
      await updateDoc(planoRef, {
        ...dados,
        dataAtualizacao: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar plano:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Criar planos padrão do sistema
   */
  const criarPlanospadrao = async () => {
    try {
      const planospadrao = [
        {
          nome: 'Básico',
          descricao: 'Ideal para clínicas pequenas começando',
          limiteUsuarios: 1,
          limitePacientes: 100,
          limiteAgendamentos: 500,
          limiteArmazenamento: 1,
          valorMensal: 49.90,
          valorAnual: 499.00,
          recursos: ['agenda', 'clientes', 'anamneses', 'financeiro_basico'],
          ordem: 1
        },
        {
          nome: 'Profissional',
          descricao: 'Para clínicas em crescimento',
          limiteUsuarios: 3,
          limitePacientes: 500,
          limiteAgendamentos: 2000,
          limiteArmazenamento: 5,
          valorMensal: 99.90,
          valorAnual: 999.00,
          recursos: ['agenda', 'clientes', 'anamneses', 'financeiro_completo', 'comissoes', 'relatorios', 'multi_usuario'],
          ordem: 2
        },
        {
          nome: 'Premium',
          descricao: 'Solução completa para clínicas estabelecidas',
          limiteUsuarios: 10,
          limitePacientes: 2000,
          limiteAgendamentos: 10000,
          limiteArmazenamento: 20,
          valorMensal: 199.90,
          valorAnual: 1999.00,
          recursos: ['agenda', 'clientes', 'anamneses', 'financeiro_completo', 'comissoes', 'relatorios_avancados', 'multi_usuario', 'auditoria', 'avaliacoes', 'whatsapp_integration', 'api_access'],
          ordem: 3
        },
        {
          nome: 'Enterprise',
          descricao: 'Para redes de clínicas e franquias',
          limiteUsuarios: -1, // Ilimitado
          limitePacientes: -1,
          limiteAgendamentos: -1,
          limiteArmazenamento: 100,
          valorMensal: 399.90,
          valorAnual: 3999.00,
          recursos: ['todos', 'suporte_prioritario', 'customizacao', 'treinamento', 'multi_clinica'],
          ordem: 4
        }
      ]

      const criados = []
      for (const plano of planospadrao) {
        const resultado = await criarPlano(plano)
        if (resultado.success) {
          criados.push(resultado.id)
        }
      }

      return { success: true, total: criados.length, ids: criados }
    } catch (error) {
      console.error('Erro ao criar planos padrão:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Comparar planos (helper para view de escolha)
   */
  const compararPlanos = () => {
    return planos.value.map(p => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      valorMensal: p.valorMensal,
      valorAnual: p.valorAnual,
      economiaAnual: (p.valorMensal * 12) - p.valorAnual,
      percentualDesconto: Math.round((1 - (p.valorAnual / (p.valorMensal * 12))) * 100),
      recursos: p.recursos,
      limites: {
        usuarios: p.limiteUsuarios === -1 ? 'Ilimitado' : p.limiteUsuarios,
        pacientes: p.limitePacientes === -1 ? 'Ilimitado' : p.limitePacientes,
        agendamentos: p.limiteAgendamentos === -1 ? 'Ilimitado' : p.limiteAgendamentos,
        armazenamento: `${p.limiteArmazenamento} GB`
      }
    }))
  }

  return {
    // Estado
    planos,
    carregando,
    erro,

    // Métodos
    buscarPlanos,
    criarPlano,
    atualizarPlano,
    criarPlanospadrao,
    compararPlanos
  }
}

