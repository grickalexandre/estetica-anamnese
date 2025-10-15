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
        
        <!-- Foto do Profissional -->
        <div class="form-group">
          <label>Foto do Profissional</label>
          <div class="foto-upload">
            <div v-if="fotoPreview || configuracoes.fotoProfissional" class="foto-preview">
              <img :src="fotoPreview || configuracoes.fotoProfissional" alt="Foto do profissional">
              <button type="button" @click="removerFoto" class="btn-remove-foto">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <label v-else for="foto-profissional" class="foto-placeholder">
              <i class="fas fa-camera"></i>
              <p>Clique para adicionar foto</p>
              <p style="font-size: 12px; color: #718096;">JPG, PNG ou WebP (máx. 10MB)</p>
            </label>
            <input
              id="foto-profissional"
              type="file"
              accept="image/*"
              @change="handleFotoChange"
              style="display: none"
            >
          </div>
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
            <span>{{ uploadProgress }}%</span>
          </div>
        </div>

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
import { db } from '../firebase.js'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { compressProfileImage, isValidImage } from '../utils/imageCompressor.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import { useClinica } from '../composables/useClinica.js'

const { clinicaId } = useClinica()

const error = ref('')
const success = ref('')
const salvando = ref(false)
const fotoFile = ref(null)
const fotoPreview = ref(null)
const uploadProgress = ref(0)

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
  fotoProfissional: '',
  formacao: '',
  experiencia: '',
  especialidades: '',
  horarioSegSex: '',
  horarioSabado: '',
  observacoesHorarios: ''
})

const carregarConfiguracoes = async () => {
  try {
    const id = clinicaId.value || 'demo'
    const docRef = doc(db, 'configuracoes', id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const dados = docSnap.data()
      configuracoes.value = { ...configuracoes.value, ...dados }
    }
  } catch (err) {
    console.error('Erro ao carregar configurações:', err)
  }
}

// Função para lidar com seleção de foto
const handleFotoChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    // Validar imagem
    isValidImage(file)

    // Mostrar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      fotoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)

    // Armazenar arquivo para upload posterior
    fotoFile.value = file
    error.value = ''
  } catch (err) {
    error.value = err.message
    event.target.value = ''
  }
}

// Função para remover foto
const removerFoto = () => {
  fotoPreview.value = null
  fotoFile.value = null
  configuracoes.value.fotoProfissional = ''
}

// Função para fazer upload da foto (Cloudinary)
const uploadFoto = async () => {
  if (!fotoFile.value) return configuracoes.value.fotoProfissional

  try {
    const compressedFile = await compressProfileImage(fotoFile.value)
    uploadProgress.value = 10
    const url = await uploadToCloudinary(compressedFile, {
      preset: 'profissionais',
      folder: 'estetica/profissionais',
      cloudName: 'dkliyeyoq'
    })
    uploadProgress.value = 100
    setTimeout(() => (uploadProgress.value = 0), 400)
    return url
  } catch (err) {
    console.error('Erro ao comprimir/upload:', err)
    throw err
  }
}

const salvarConfiguracoes = async () => {
  try {
    salvando.value = true
    error.value = ''
    success.value = ''

    // Fazer upload da foto se houver
    if (fotoFile.value) {
      const fotoURL = await uploadFoto()
      configuracoes.value.fotoProfissional = fotoURL
    }

    // Salvar no Firestore com clinicaId
    const id = clinicaId.value || 'demo'
    const dadosConfiguracoes = {
      ...configuracoes.value,
      clinicaId: id,
      dataAtualizacao: serverTimestamp()
    }

    await setDoc(doc(db, 'configuracoes', id), dadosConfiguracoes)

    success.value = 'Configurações salvas com sucesso!'
    fotoFile.value = null
    
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

/* Estilos para upload de foto */
.foto-upload {
  margin-top: 10px;
}

.foto-preview {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e5e7eb;
}

.foto-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-foto {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-remove-foto:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
}

.foto-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.foto-placeholder:hover {
  border-color: #1d1d1f;
  background: #f3f4f6;
}

.foto-placeholder i {
  font-size: 32px;
  color: #9ca3af;
  margin-bottom: 10px;
}

.foto-placeholder p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.upload-progress {
  margin-top: 15px;
  position: relative;
  width: 200px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #1d1d1f, #4b5563);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.upload-progress span {
  position: absolute;
  top: -25px;
  right: 0;
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
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
