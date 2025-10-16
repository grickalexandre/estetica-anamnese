import { ref, computed } from 'vue'
import { db } from '../firebase.js'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function usePlanoContas() {
  const { clinicaId } = useClinica()
  const categorias = ref([])
  const carregando = ref(false)
  const erro = ref('')

  // Plano de Contas Padrão
  const planoContasPadrao = [
    // RECEITAS
    {
      codigo: '3.0',
      nome: 'RECEITAS',
      tipo: 'receita',
      nivel: 1,
      ativa: true,
      editavel: false
    },
    {
      codigo: '3.1',
      nome: 'Receitas de Serviços',
      tipo: 'receita',
      nivel: 2,
      pai: '3.0',
      ativa: true,
      editavel: false
    },
    {
      codigo: '3.1.1',
      nome: 'Consultas',
      tipo: 'receita',
      nivel: 3,
      pai: '3.1',
      ativa: true,
      editavel: true,
      descricao: 'Receitas de consultas e avaliações'
    },
    {
      codigo: '3.1.2',
      nome: 'Procedimentos Estéticos',
      tipo: 'receita',
      nivel: 3,
      pai: '3.1',
      ativa: true,
      editavel: true,
      descricao: 'Receitas de procedimentos realizados'
    },
    {
      codigo: '3.1.3',
      nome: 'Tratamentos',
      tipo: 'receita',
      nivel: 3,
      pai: '3.1',
      ativa: true,
      editavel: true,
      descricao: 'Receitas de tratamentos contínuos'
    },
    {
      codigo: '3.2',
      nome: 'Receitas de Produtos',
      tipo: 'receita',
      nivel: 2,
      pai: '3.0',
      ativa: true,
      editavel: false
    },
    {
      codigo: '3.2.1',
      nome: 'Venda de Produtos',
      tipo: 'receita',
      nivel: 3,
      pai: '3.2',
      ativa: true,
      editavel: true,
      descricao: 'Receitas de venda de produtos cosméticos'
    },
    {
      codigo: '3.3',
      nome: 'Pacotes e Planos',
      tipo: 'receita',
      nivel: 2,
      pai: '3.0',
      ativa: true,
      editavel: false
    },
    {
      codigo: '3.3.1',
      nome: 'Pacotes de Procedimentos',
      tipo: 'receita',
      nivel: 3,
      pai: '3.3',
      ativa: true,
      editavel: true,
      descricao: 'Receitas de pacotes vendidos'
    },
    {
      codigo: '3.3.2',
      nome: 'Planos de Assinatura',
      tipo: 'receita',
      nivel: 3,
      pai: '3.3',
      ativa: true,
      editavel: true,
      descricao: 'Receitas de planos mensais/anuais'
    },
    {
      codigo: '3.9',
      nome: 'Outras Receitas',
      tipo: 'receita',
      nivel: 2,
      pai: '3.0',
      ativa: true,
      editavel: true,
      descricao: 'Outras receitas operacionais'
    },
    
    // DESPESAS
    {
      codigo: '4.0',
      nome: 'DESPESAS',
      tipo: 'despesa',
      nivel: 1,
      ativa: true,
      editavel: false
    },
    {
      codigo: '4.1',
      nome: 'Despesas com Pessoal',
      tipo: 'despesa',
      nivel: 2,
      pai: '4.0',
      ativa: true,
      editavel: false
    },
    {
      codigo: '4.1.1',
      nome: 'Salários',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.1',
      ativa: true,
      editavel: true,
      descricao: 'Salários de funcionários'
    },
    {
      codigo: '4.1.2',
      nome: 'Encargos Sociais',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.1',
      ativa: true,
      editavel: true,
      descricao: 'INSS, FGTS, e outros encargos'
    },
    {
      codigo: '4.1.3',
      nome: 'Benefícios',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.1',
      ativa: true,
      editavel: true,
      descricao: 'Vale transporte, alimentação, etc.'
    },
    {
      codigo: '4.2',
      nome: 'Despesas Operacionais',
      tipo: 'despesa',
      nivel: 2,
      pai: '4.0',
      ativa: true,
      editavel: false
    },
    {
      codigo: '4.2.1',
      nome: 'Aluguel',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.2',
      ativa: true,
      editavel: true,
      descricao: 'Aluguel do espaço da clínica'
    },
    {
      codigo: '4.2.2',
      nome: 'Energia Elétrica',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.2',
      ativa: true,
      editavel: true,
      descricao: 'Conta de energia elétrica'
    },
    {
      codigo: '4.2.3',
      nome: 'Água',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.2',
      ativa: true,
      editavel: true,
      descricao: 'Conta de água'
    },
    {
      codigo: '4.2.4',
      nome: 'Internet e Telefone',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.2',
      ativa: true,
      editavel: true,
      descricao: 'Serviços de internet e telefonia'
    },
    {
      codigo: '4.2.5',
      nome: 'Material de Consumo',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.2',
      ativa: true,
      editavel: true,
      descricao: 'Materiais utilizados nos procedimentos'
    },
    {
      codigo: '4.2.6',
      nome: 'Limpeza e Higiene',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.2',
      ativa: true,
      editavel: true,
      descricao: 'Produtos de limpeza e higiene'
    },
    {
      codigo: '4.3',
      nome: 'Despesas com Marketing',
      tipo: 'despesa',
      nivel: 2,
      pai: '4.0',
      ativa: true,
      editavel: false
    },
    {
      codigo: '4.3.1',
      nome: 'Publicidade Online',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.3',
      ativa: true,
      editavel: true,
      descricao: 'Facebook Ads, Google Ads, Instagram'
    },
    {
      codigo: '4.3.2',
      nome: 'Publicidade Offline',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.3',
      ativa: true,
      editavel: true,
      descricao: 'Panfletos, banners, outdoor'
    },
    {
      codigo: '4.3.3',
      nome: 'Material Promocional',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.3',
      ativa: true,
      editavel: true,
      descricao: 'Brindes, cartões de visita'
    },
    {
      codigo: '4.4',
      nome: 'Despesas Administrativas',
      tipo: 'despesa',
      nivel: 2,
      pai: '4.0',
      ativa: true,
      editavel: false
    },
    {
      codigo: '4.4.1',
      nome: 'Material de Escritório',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.4',
      ativa: true,
      editavel: true,
      descricao: 'Papelaria, impressos'
    },
    {
      codigo: '4.4.2',
      nome: 'Serviços Contábeis',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.4',
      ativa: true,
      editavel: true,
      descricao: 'Honorários do contador'
    },
    {
      codigo: '4.4.3',
      nome: 'Softwares e Sistemas',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.4',
      ativa: true,
      editavel: true,
      descricao: 'Assinaturas de softwares'
    },
    {
      codigo: '4.5',
      nome: 'Despesas Tributárias',
      tipo: 'despesa',
      nivel: 2,
      pai: '4.0',
      ativa: true,
      editavel: false
    },
    {
      codigo: '4.5.1',
      nome: 'Impostos Federais',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.5',
      ativa: true,
      editavel: true,
      descricao: 'IRPJ, PIS, COFINS'
    },
    {
      codigo: '4.5.2',
      nome: 'Impostos Municipais',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.5',
      ativa: true,
      editavel: true,
      descricao: 'ISS, IPTU'
    },
    {
      codigo: '4.6',
      nome: 'Despesas Financeiras',
      tipo: 'despesa',
      nivel: 2,
      pai: '4.0',
      ativa: true,
      editavel: false
    },
    {
      codigo: '4.6.1',
      nome: 'Tarifas Bancárias',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.6',
      ativa: true,
      editavel: true,
      descricao: 'Tarifas de conta corrente, TEDs'
    },
    {
      codigo: '4.6.2',
      nome: 'Juros e Multas',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.6',
      ativa: true,
      editavel: true,
      descricao: 'Juros de atraso, multas'
    },
    {
      codigo: '4.7',
      nome: 'Manutenção e Reparos',
      tipo: 'despesa',
      nivel: 2,
      pai: '4.0',
      ativa: true,
      editavel: false
    },
    {
      codigo: '4.7.1',
      nome: 'Manutenção de Equipamentos',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.7',
      ativa: true,
      editavel: true,
      descricao: 'Manutenção de aparelhos estéticos'
    },
    {
      codigo: '4.7.2',
      nome: 'Manutenção Predial',
      tipo: 'despesa',
      nivel: 3,
      pai: '4.7',
      ativa: true,
      editavel: true,
      descricao: 'Reparos no espaço físico'
    },
    {
      codigo: '4.9',
      nome: 'Outras Despesas',
      tipo: 'despesa',
      nivel: 2,
      pai: '4.0',
      ativa: true,
      editavel: true,
      descricao: 'Outras despesas operacionais'
    }
  ]

  /**
   * Inicializar plano de contas padrão para a clínica
   */
  const inicializarPlanoContas = async () => {
    try {
      carregando.value = true
      erro.value = ''

      // Verificar se já existe plano de contas
      const q = query(
        collection(db, 'plano_contas'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )
      const snapshot = await getDocs(q)

      if (snapshot.size > 0) {
        console.log('Plano de contas já existe')
        return { success: true, message: 'Plano de contas já existe' }
      }

      // Criar plano de contas padrão
      for (const categoria of planoContasPadrao) {
        await addDoc(collection(db, 'plano_contas'), {
          ...categoria,
          clinicaId: clinicaId.value || 'demo',
          dataCriacao: serverTimestamp()
        })
      }

      return { success: true, message: 'Plano de contas criado com sucesso' }
    } catch (err) {
      console.error('Erro ao inicializar plano de contas:', err)
      erro.value = 'Erro ao inicializar plano de contas'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Buscar todas as categorias do plano de contas
   */
  const buscarCategorias = async (tipo = null) => {
    try {
      carregando.value = true
      erro.value = ''

      let q = query(
        collection(db, 'plano_contas'),
        where('clinicaId', '==', clinicaId.value || 'demo')
      )

      if (tipo) {
        q = query(q, where('tipo', '==', tipo))
      }

      const snapshot = await getDocs(q)
      categorias.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Ordenar por código
      categorias.value.sort((a, b) => a.codigo.localeCompare(b.codigo))

      return categorias.value
    } catch (err) {
      console.error('Erro ao buscar categorias:', err)
      erro.value = 'Erro ao carregar categorias'
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Adicionar nova categoria
   */
  const adicionarCategoria = async (dados) => {
    try {
      carregando.value = true
      erro.value = ''

      const categoria = {
        ...dados,
        clinicaId: clinicaId.value || 'demo',
        ativa: true,
        editavel: true,
        dataCriacao: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'plano_contas'), categoria)
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err)
      erro.value = 'Erro ao adicionar categoria'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Atualizar categoria
   */
  const atualizarCategoria = async (categoriaId, dados) => {
    try {
      carregando.value = true
      erro.value = ''

      const categoriaRef = doc(db, 'plano_contas', categoriaId)
      await updateDoc(categoriaRef, dados)

      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err)
      erro.value = 'Erro ao atualizar categoria'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Desativar categoria (não excluir para manter histórico)
   */
  const desativarCategoria = async (categoriaId) => {
    try {
      carregando.value = true
      erro.value = ''

      const categoriaRef = doc(db, 'plano_contas', categoriaId)
      await updateDoc(categoriaRef, { ativa: false })

      return { success: true }
    } catch (err) {
      console.error('Erro ao desativar categoria:', err)
      erro.value = 'Erro ao desativar categoria'
      return { success: false, error: err.message }
    } finally {
      carregando.value = false
    }
  }

  /**
   * Categorias ativas (para seleção em formulários)
   */
  const categoriasAtivas = computed(() => {
    return categorias.value.filter(c => c.ativa)
  })

  /**
   * Categorias de receita ativas
   */
  const categoriasReceita = computed(() => {
    return categoriasAtivas.value.filter(c => c.tipo === 'receita' && c.nivel === 3)
  })

  /**
   * Categorias de despesa ativas
   */
  const categoriasDespesa = computed(() => {
    return categoriasAtivas.value.filter(c => c.tipo === 'despesa' && c.nivel === 3)
  })

  /**
   * Obter nome completo da categoria (com hierarquia)
   */
  const getNomeCompleto = (categoria) => {
    if (!categoria.pai) return categoria.nome

    const pai = categorias.value.find(c => c.codigo === categoria.pai)
    if (!pai) return categoria.nome

    return `${getNomeCompleto(pai)} > ${categoria.nome}`
  }

  return {
    // Estado
    categorias,
    categoriasAtivas,
    categoriasReceita,
    categoriasDespesa,
    carregando,
    erro,

    // Métodos
    inicializarPlanoContas,
    buscarCategorias,
    adicionarCategoria,
    atualizarCategoria,
    desativarCategoria,
    getNomeCompleto,
    
    // Dados
    planoContasPadrao
  }
}

