import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

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
  const carregarConfiguracoes = async () => {
    try {
      carregando.value = true
      const docRef = doc(db, 'configuracoes', 'clinica')
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
