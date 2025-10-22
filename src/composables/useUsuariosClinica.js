import { ref } from 'vue'
import { db } from '../firebase.js'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  getDocs, 
  getDoc,
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { useClinica } from './useClinica.js'

export function useUsuariosClinica() {
  const { clinicaId } = useClinica()
  const usuarios = ref([])
  const convites = ref([])
  const carregando = ref(false)
  const erro = ref('')

  /**
   * Roles disponíveis no sistema
   */
  const rolesDisponiveis = [
    { value: 'admin', label: 'Administrador', descricao: 'Acesso total ao sistema' },
    { value: 'profissional', label: 'Profissional', descricao: 'Acesso a atendimentos e agenda' },
    { value: 'recepcionista', label: 'Recepcionista', descricao: 'Acesso a agendamentos e cadastros' },
    { value: 'financeiro', label: 'Financeiro', descricao: 'Acesso ao módulo financeiro' },
    { value: 'visualizador', label: 'Visualizador', descricao: 'Apenas visualização, sem edição' }
  ]

  /**
   * Permissões por role
   */
  const permissoesPorRole = {
    admin: ['*'], // Todas as permissões
    profissional: ['agenda', 'atendimentos', 'clientes', 'anamneses', 'procedimentos', 'produtos'],
    recepcionista: ['agenda', 'clientes', 'anamneses'],
    financeiro: ['financeiro', 'relatorios'],
    visualizador: ['visualizar']
  }

  /**
   * Buscar todos os usuários da clínica
   */
  const buscarUsuariosDaClinica = async () => {
    try {
      carregando.value = true
      erro.value = ''

      const q = query(
        collection(db, 'usuarios_clinica'),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        orderBy('dataCriacao', 'desc')
      )

      const snapshot = await getDocs(q)
      const usuariosTemp = []

      for (const docSnap of snapshot.docs) {
        const vinculo = { id: docSnap.id, ...docSnap.data() }
        
        // Buscar dados do usuário
        try {
          const userRef = doc(db, 'users', vinculo.userId)
          const userDoc = await getDoc(userRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            usuariosTemp.push({
              ...vinculo,
              nome: userData.nome || 'Sem nome',
              email: userData.email || 'Sem email',
              fotoURL: userData.fotoURL || null
            })
          } else {
            usuariosTemp.push(vinculo)
          }
        } catch (userErr) {
          console.warn('Erro ao buscar dados do usuário:', userErr)
          usuariosTemp.push(vinculo)
        }
      }

      usuarios.value = usuariosTemp
      return usuarios.value
    } catch (err) {
      console.error('Erro ao buscar usuários da clínica:', err)
      erro.value = 'Erro ao carregar usuários'
      return []
    } finally {
      carregando.value = false
    }
  }

  /**
   * Convidar novo usuário para a clínica
   */
  const convidarUsuario = async (dados) => {
    try {
      console.log('Convidando usuário:', dados)

      // Verificar se usuário já existe no sistema
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', dados.email)
      )
      
      const usersSnapshot = await getDocs(usersQuery)
      let userId = null

      if (usersSnapshot.empty) {
        // Usuário não existe - criar convite pendente
        const convite = {
          email: dados.email,
          nome: dados.nome || '',
          clinicaId: clinicaId.value || 'demo',
          role: dados.role || 'profissional',
          permissoes: permissoesPorRole[dados.role] || [],
          status: 'pendente',
          convidadoPor: dados.convidadoPor || 'admin',
          dataConvite: serverTimestamp(),
          tokenConvite: Math.random().toString(36).substring(2, 15), // Token único
          expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
        }

        const conviteRef = await addDoc(collection(db, 'convites_pendentes'), convite)
        
        // TODO: Enviar email de convite com link de cadastro
        console.log('Convite criado:', conviteRef.id)
        console.log('Link de convite:', `/cadastro?token=${convite.tokenConvite}`)

        return { 
          success: true, 
          id: conviteRef.id,
          tipo: 'convite',
          linkConvite: `/cadastro?token=${convite.tokenConvite}`
        }
      } else {
        // Usuário já existe - vincular diretamente
        userId = usersSnapshot.docs[0].id

        // Verificar se já está vinculado
        const vinculoQuery = query(
          collection(db, 'usuarios_clinica'),
          where('userId', '==', userId),
          where('clinicaId', '==', clinicaId.value || 'demo')
        )

        const vinculoSnapshot = await getDocs(vinculoQuery)
        
        if (!vinculoSnapshot.empty) {
          return { success: false, error: 'Usuário já vinculado a esta clínica' }
        }

        // Criar vínculo
        const vinculo = {
          userId,
          clinicaId: clinicaId.value || 'demo',
          role: dados.role || 'profissional',
          permissoes: permissoesPorRole[dados.role] || [],
          ativo: true,
          convidadoPor: dados.convidadoPor || 'admin',
          dataConvite: serverTimestamp(),
          dataAceite: serverTimestamp(),
          dataCriacao: serverTimestamp()
        }

        const vinculoRef = await addDoc(collection(db, 'usuarios_clinica'), vinculo)
        
        return { 
          success: true, 
          id: vinculoRef.id,
          tipo: 'vinculo_direto'
        }
      }
    } catch (error) {
      console.error('Erro ao convidar usuário:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Aceitar convite (usado durante cadastro)
   */
  const aceitarConvite = async (tokenConvite, userId) => {
    try {
      // Buscar convite pelo token
      const q = query(
        collection(db, 'convites_pendentes'),
        where('tokenConvite', '==', tokenConvite),
        where('status', '==', 'pendente')
      )

      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return { success: false, error: 'Convite inválido ou expirado' }
      }

      const conviteDoc = snapshot.docs[0]
      const conviteData = conviteDoc.data()

      // Verificar expiração
      if (new Date() > new Date(conviteData.expiraEm)) {
        return { success: false, error: 'Convite expirado' }
      }

      // Criar vínculo
      const vinculo = {
        userId,
        clinicaId: conviteData.clinicaId,
        role: conviteData.role,
        permissoes: conviteData.permissoes,
        ativo: true,
        convidadoPor: conviteData.convidadoPor,
        dataConvite: conviteData.dataConvite,
        dataAceite: serverTimestamp(),
        dataCriacao: serverTimestamp()
      }

      const vinculoRef = await addDoc(collection(db, 'usuarios_clinica'), vinculo)

      // Atualizar convite para aceito
      await updateDoc(doc(db, 'convites_pendentes', conviteDoc.id), {
        status: 'aceito',
        dataAceite: serverTimestamp(),
        vinculoId: vinculoRef.id
      })

      return { success: true, clinicaId: conviteData.clinicaId }
    } catch (error) {
      console.error('Erro ao aceitar convite:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Atualizar role/permissões de um usuário
   */
  const atualizarRole = async (vinculoId, novoRole) => {
    try {
      const vinculoRef = doc(db, 'usuarios_clinica', vinculoId)
      
      await updateDoc(vinculoRef, {
        role: novoRole,
        permissoes: permissoesPorRole[novoRole] || [],
        dataAtualizacao: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Desativar usuário (remover acesso)
   */
  const desativarUsuario = async (vinculoId) => {
    try {
      const vinculoRef = doc(db, 'usuarios_clinica', vinculoId)
      
      await updateDoc(vinculoRef, {
        ativo: false,
        dataDesativacao: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao desativar usuário:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Reativar usuário
   */
  const reativarUsuario = async (vinculoId) => {
    try {
      const vinculoRef = doc(db, 'usuarios_clinica', vinculoId)
      
      await updateDoc(vinculoRef, {
        ativo: true,
        dataReativacao: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao reativar usuário:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Remover usuário permanentemente
   */
  const removerUsuario = async (vinculoId) => {
    try {
      const vinculoRef = doc(db, 'usuarios_clinica', vinculoId)
      await deleteDoc(vinculoRef)
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao remover usuário:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Verificar se usuário tem permissão
   */
  const verificarPermissao = (vinculo, permissaoNecessaria) => {
    if (!vinculo || !vinculo.ativo) return false
    
    // Admin tem todas as permissões
    if (vinculo.role === 'admin' || vinculo.permissoes.includes('*')) {
      return true
    }

    // Verificar permissão específica
    return vinculo.permissoes.includes(permissaoNecessaria)
  }

  /**
   * Obter vínculo do usuário atual
   */
  const obterVinculoUsuarioAtual = async (userId) => {
    try {
      const q = query(
        collection(db, 'usuarios_clinica'),
        where('userId', '==', userId),
        where('clinicaId', '==', clinicaId.value || 'demo'),
        where('ativo', '==', true)
      )

      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }

      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      }
    } catch (error) {
      console.error('Erro ao obter vínculo do usuário:', error)
      return null
    }
  }

  /**
   * Estatísticas de usuários
   */
  const calcularEstatisticas = () => {
    const total = usuarios.value.length
    const ativos = usuarios.value.filter(u => u.ativo).length
    const inativos = total - ativos

    const porRole = {}
    usuarios.value.forEach(u => {
      if (!porRole[u.role]) {
        porRole[u.role] = { count: 0, ativos: 0 }
      }
      porRole[u.role].count++
      if (u.ativo) porRole[u.role].ativos++
    })

    return {
      total,
      ativos,
      inativos,
      porRole
    }
  }

  return {
    // Estado
    usuarios,
    convites,
    carregando,
    erro,
    rolesDisponiveis,
    permissoesPorRole,

    // Métodos
    buscarUsuariosDaClinica,
    convidarUsuario,
    aceitarConvite,
    atualizarRole,
    desativarUsuario,
    reativarUsuario,
    removerUsuario,
    verificarPermissao,
    obterVinculoUsuarioAtual,
    calcularEstatisticas
  }
}

