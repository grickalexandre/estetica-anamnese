import { ref, computed } from 'vue'
import { db } from '../firebase.js'
import { doc, getDoc } from 'firebase/firestore'

// Estado global da clínica
const clinicaId = ref(null)
const clinicaData = ref(null)
const carregando = ref(false)

/**
 * Composable para gerenciar o contexto da clínica
 * Permite identificar qual clínica está acessando o sistema
 */
export function useClinica() {
  /**
   * Detecta a clínica baseado no subdomínio ou slug na URL
   * Exemplos:
   * - clinica1.estetica.com.br -> clinicaId = 'clinica1'
   * - estetica.com.br/clinica1 -> clinicaId = 'clinica1'
   * - localhost:3000?clinica=clinica1 -> clinicaId = 'clinica1' (dev)
   */
  const detectarClinica = () => {
    // 1. Tentar pegar da URL query (para desenvolvimento)
    const urlParams = new URLSearchParams(window.location.search)
    const clinicaParam = urlParams.get('clinica')
    if (clinicaParam) {
      return clinicaParam
    }

    // 2. Tentar pegar do subdomínio
    const hostname = window.location.hostname
    const parts = hostname.split('.')
    
    // Se for subdomínio (ex: clinica1.estetica.com.br)
    if (parts.length > 2 && parts[0] !== 'www') {
      return parts[0]
    }

    // 3. Tentar pegar do path (ex: /clinica1/...)
    const path = window.location.pathname
    const pathParts = path.split('/').filter(p => p)
    if (pathParts.length > 0 && pathParts[0] !== 'anamnese-cliente') {
      return pathParts[0]
    }

    // 4. Fallback: usar clinicaId padrão (pode ser configurado)
    return localStorage.getItem('clinicaId') || 'demo'
  }

  /**
   * Inicializa o contexto da clínica
   */
  const inicializarClinica = async () => {
    try {
      carregando.value = true
      
      // Detectar clínica
      const id = detectarClinica()
      clinicaId.value = id
      
      // Salvar no localStorage para persistência
      localStorage.setItem('clinicaId', id)
      
      // Carregar dados da clínica
      const docRef = doc(db, 'clinicas', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        clinicaData.value = {
          id: docSnap.id,
          ...docSnap.data()
        }
      } else {
        console.warn(`Clínica ${id} não encontrada. Usando modo demo.`)
        clinicaData.value = {
          id: id,
          nome: 'Clínica Demo',
          ativo: true
        }
      }
      
      return clinicaData.value
    } catch (err) {
      console.error('Erro ao inicializar clínica:', err)
      throw err
    } finally {
      carregando.value = false
    }
  }

  /**
   * Define manualmente a clínica (útil para admin)
   */
  const setClinica = async (id) => {
    clinicaId.value = id
    localStorage.setItem('clinicaId', id)
    await inicializarClinica()
  }

  /**
   * Verifica se a clínica está ativa
   */
  const clinicaAtiva = computed(() => {
    return clinicaData.value?.ativo !== false
  })

  /**
   * Retorna o nome da clínica
   */
  const nomeClinica = computed(() => {
    return clinicaData.value?.nome || 'Clínica'
  })

  /**
   * Gera um ID único para documentos da clínica
   * Formato: {clinicaId}_{timestamp}_{random}
   */
  const gerarDocId = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    return `${clinicaId.value}_${timestamp}_${random}`
  }

  return {
    clinicaId,
    clinicaData,
    carregando,
    detectarClinica,
    inicializarClinica,
    setClinica,
    clinicaAtiva,
    nomeClinica,
    gerarDocId
  }
}

