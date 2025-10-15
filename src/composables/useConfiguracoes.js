import { ref, onMounted } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useClinica } from './useClinica.js'

const configuracoes = ref({
  nomeClinica: 'Clínica de Estética',
  cnpj: '',
  endereco: '',
  telefone: '',
  whatsapp: '',
  email: '',
  website: '',
  nomeProprietario: '',
  registroProfissional: '',
  formacao: '',
  experiencia: '',
  especialidades: '',
  horarioSegSex: '',
  horarioSabado: '',
  observacoesHorarios: ''
})

const carregando = ref(true)

export function useConfiguracoes() {
  const { clinicaId } = useClinica()
  
  const carregarConfiguracoes = async () => {
    try {
      carregando.value = true
      
      // Usar clinicaId para buscar configurações específicas
      const id = clinicaId.value || 'demo'
      const docRef = doc(db, 'configuracoes', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const dados = docSnap.data()
        configuracoes.value = { ...configuracoes.value, ...dados }
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    } finally {
      carregando.value = false
    }
  }

  onMounted(() => {
    carregarConfiguracoes()
  })

  return {
    configuracoes,
    carregando,
    carregarConfiguracoes
  }
}
