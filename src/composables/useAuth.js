import { ref, computed } from 'vue'
import { auth, db } from '../firebase.js'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

// Estado global do usuário
const user = ref(null)
const loading = ref(true)
const userProfile = ref(null)

/**
 * Composable para gerenciar autenticação
 */
export function useAuth() {
  /**
   * Inicializa o observador de autenticação
   */
  const initAuth = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      
      if (firebaseUser) {
        // Carregar perfil do usuário
        await loadUserProfile(firebaseUser.uid)
      } else {
        userProfile.value = null
      }
      
      loading.value = false
    })
  }

  /**
   * Carrega o perfil do usuário do Firestore
   */
  const loadUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'usuarios', uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        userProfile.value = docSnap.data()
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  /**
   * Registra novo usuário e cria clínica
   */
  const register = async (dados) => {
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        dados.email,
        dados.senha
      )

      // Atualizar nome do usuário
      await updateProfile(userCredential.user, {
        displayName: dados.nome
      })

      // Gerar clinicaId único
      const clinicaId = dados.slug || generateSlug(dados.nomeClinica)

      // Criar documento da clínica
      await setDoc(doc(db, 'clinicas', clinicaId), {
        id: clinicaId,
        nome: dados.nomeClinica,
        slug: clinicaId,
        ownerId: userCredential.user.uid,
        plano: dados.plano || 'free',
        ativo: true,
        dataCriacao: serverTimestamp(),
        limites: {
          maxAnamneses: dados.plano === 'free' ? 100 : 10000,
          maxUsuarios: dados.plano === 'free' ? 1 : 10,
          maxFotos: dados.plano === 'free' ? 4 : 20,
          uploadSize: dados.plano === 'free' ? 10 : 50 // MB
        },
        contato: {
          email: dados.email,
          telefone: dados.telefone || ''
        }
      })

      // Criar perfil do usuário
      await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
        uid: userCredential.user.uid,
        nome: dados.nome,
        email: dados.email,
        clinicaId: clinicaId,
        role: 'owner', // owner, admin, user
        plano: dados.plano || 'free',
        dataCriacao: serverTimestamp()
      })

      // Criar configurações iniciais da clínica
      await setDoc(doc(db, 'configuracoes', clinicaId), {
        clinicaId: clinicaId,
        nomeClinica: dados.nomeClinica,
        cnpj: '',
        endereco: '',
        telefone: dados.telefone || '',
        whatsapp: '',
        email: dados.email,
        website: '',
        nomeProprietario: dados.nome,
        registroProfissional: '',
        fotoProfissional: '',
        formacao: '',
        experiencia: '',
        especialidades: '',
        horarioSegSex: '',
        horarioSabado: '',
        observacoesHorarios: '',
        dataCriacao: serverTimestamp()
      })

      return { success: true, clinicaId }
    } catch (error) {
      console.error('Erro ao registrar:', error)
      throw error
    }
  }

  /**
   * Faz login do usuário
   */
  const login = async (email, senha) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha)
      await loadUserProfile(userCredential.user.uid)
      return { success: true }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  }

  /**
   * Faz logout do usuário
   */
  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      userProfile.value = null
      return { success: true }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      throw error
    }
  }

  /**
   * Gera um slug a partir do nome da clínica
   */
  const generateSlug = (nome) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
      .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
      .substring(0, 50) + '-' + Date.now().toString(36).substring(0, 6)
  }

  /**
   * Verifica se o usuário está autenticado
   */
  const isAuthenticated = computed(() => !!user.value)

  /**
   * Retorna a clínica do usuário
   */
  const clinicaId = computed(() => userProfile.value?.clinicaId)

  /**
   * Retorna o plano do usuário
   */
  const planoAtual = computed(() => userProfile.value?.plano || 'free')

  /**
   * Verifica se é plano free
   */
  const isFree = computed(() => planoAtual.value === 'free')

  /**
   * Verifica se é plano pago
   */
  const isPaid = computed(() => planoAtual.value !== 'free')

  /**
   * Verifica se o usuário é owner da clínica
   */
  const isOwner = computed(() => userProfile.value?.role === 'owner')

  /**
   * Verifica se o usuário é admin
   */
  const isAdmin = computed(() => {
    const role = userProfile.value?.role
    return role === 'owner' || role === 'admin'
  })

  return {
    user,
    loading,
    userProfile,
    initAuth,
    register,
    login,
    logout,
    isAuthenticated,
    clinicaId,
    planoAtual,
    isFree,
    isPaid,
    isOwner,
    isAdmin,
    loadUserProfile
  }
}

