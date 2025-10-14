<template>
  <div class="container">
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h1><i class="fas fa-cog"></i> Configurações da Clínica</h1>
        <button @click="salvarConfiguracoes" class="btn btn-primary" :disabled="salvando">
          <i v-if="!salvando" class="fas fa-save"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>

      <form @submit.prevent="salvarConfiguracoes">
        <!-- Informações Básicas -->
        <h2><i class="fas fa-building"></i> Informações Básicas</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Nome da Clínica *</label>
            <input v-model="configuracoes.nomeClinica" type="text" required>
          </div>
          <div class="form-group">
            <label>CNPJ</label>
            <input v-model="configuracoes.cnpj" type="text" placeholder="00.000.000/0000-00">
          </div>
        </div>

        <div class="form-group">
          <label>Endereço Completo</label>
          <textarea v-model="configuracoes.endereco" placeholder="Rua, número, bairro, cidade - UF, CEP"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Telefone</label>
            <input v-model="configuracoes.telefone" type="tel" placeholder="(00) 0000-0000">
          </div>
          <div class="form-group">
            <label>WhatsApp</label>
            <input v-model="configuracoes.whatsapp" type="tel" placeholder="(00) 00000-0000">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input v-model="configuracoes.email" type="email">
          </div>
          <div class="form-group">
            <label>Website</label>
            <input v-model="configuracoes.website" type="url" placeholder="https://www.exemplo.com">
          </div>
        </div>

        <!-- Informações do Proprietário -->
        <h2><i class="fas fa-user-md"></i> Informações do Proprietário</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Nome do Proprietário *</label>
            <input v-model="configuracoes.nomeProprietario" type="text" required>
          </div>
          <div class="form-group">
            <label>CRF/CRM</label>
            <input v-model="configuracoes.registroProfissional" type="text" placeholder="Número do registro profissional">
          </div>
        </div>


        <!-- Mini Currículo -->
        <h2><i class="fas fa-graduation-cap"></i> Mini Currículo</h2>
        <div class="form-group">
          <label>Formação e Especializações</label>
          <textarea v-model="configuracoes.formacao" placeholder="Descreva sua formação acadêmica e especializações..."></textarea>
        </div>

        <div class="form-group">
          <label>Experiência Profissional</label>
          <textarea v-model="configuracoes.experiencia" placeholder="Descreva sua experiência profissional..."></textarea>
        </div>

        <div class="form-group">
          <label>Especialidades</label>
          <textarea v-model="configuracoes.especialidades" placeholder="Liste suas especialidades e tratamentos oferecidos..."></textarea>
        </div>

        <!-- Horários de Funcionamento -->
        <h2><i class="fas fa-clock"></i> Horários de Funcionamento</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Segunda a Sexta</label>
            <input v-model="configuracoes.horarioSegSex" type="text" placeholder="08:00 às 18:00">
          </div>
          <div class="form-group">
            <label>Sábado</label>
            <input v-model="configuracoes.horarioSabado" type="text" placeholder="08:00 às 12:00">
          </div>
        </div>

        <div class="form-group">
          <label>Observações sobre horários</label>
          <textarea v-model="configuracoes.observacoesHorarios" placeholder="Informações adicionais sobre horários..."></textarea>
        </div>

        <!-- Botões -->
        <div style="display: flex; gap: 10px; margin-top: 30px;">
          <button type="submit" class="btn btn-primary" :disabled="salvando">
            <i v-if="!salvando" class="fas fa-save"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ salvando ? 'Salvando...' : 'Salvar Configurações' }}
          </button>
          <router-link to="/">
            <button type="button" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i>
              Voltar
            </button>
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const error = ref('')
const success = ref('')
const salvando = ref(false)

const configuracoes = ref({
  nomeClinica: '',
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

const carregarConfiguracoes = async () => {
  try {
    const docRef = doc(db, 'configuracoes', 'clinica')
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const dados = docSnap.data()
      configuracoes.value = { ...configuracoes.value, ...dados }
      if (dados.fotoProprietarioURL) {
        fotoProprietarioPreview.value = dados.fotoProprietarioURL
      }
    }
  } catch (err) {
    console.error('Erro ao carregar configurações:', err)
  }
}


const salvarConfiguracoes = async () => {
  try {
    salvando.value = true
    error.value = ''
    success.value = ''

    // Salvar no Firestore
    const dadosConfiguracoes = {
      ...configuracoes.value,
      dataAtualizacao: serverTimestamp()
    }

    await setDoc(doc(db, 'configuracoes', 'clinica'), dadosConfiguracoes)

    success.value = 'Configurações salvas com sucesso!'
    
    setTimeout(() => {
      success.value = ''
    }, 3000)

  } catch (err) {
    console.error('Erro ao salvar:', err)
    error.value = 'Erro ao salvar configurações. Tente novamente.'
  } finally {
    salvando.value = false
  }
}

onMounted(() => {
  carregarConfiguracoes()
})
</script>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1d1d1f;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1d1d1f;
  box-shadow: 0 0 0 3px rgba(29, 29, 31, 0.1);
}


.error {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #dc2626;
}

.success {
  background: #d1fae5;
  color: #065f46;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #065f46;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .photo-upload {
    padding: 20px 16px;
  }
  
  .photo-preview {
    width: 120px;
    height: 120px;
  }
}
</style>
