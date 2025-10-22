<template>
  <div class="container">
    <VoltarHome />
    
    <div class="card">
      <div class="header">
        <h1><i class="fas fa-user-edit"></i> Editar Paciente</h1>
      </div>

      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando dados...
      </div>

      <div v-else-if="erro" class="error">
        {{ erro }}
      </div>

      <form v-else @submit.prevent="salvarCliente">
        <!-- Toast/Notificação -->
        <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
          <div class="toast-content">
            <i class="toast-icon" :class="{
              'fas fa-check-circle': toast.type === 'success',
              'fas fa-exclamation-triangle': toast.type === 'warning',
              'fas fa-times-circle': toast.type === 'error'
            }"></i>
            <span class="toast-message">{{ toast.message }}</span>
            <button @click="fecharToast" class="toast-close" aria-label="Fechar notificação">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Foto do Paciente -->
        <div class="form-section">
          <h2><i class="fas fa-camera"></i> Foto do Paciente</h2>
          <div class="photo-upload">
            <div v-if="fotoPreview || cliente.fotoURL" class="photo-preview">
              <img 
                :src="fotoPreview || cliente.fotoURL" 
                alt="Foto do paciente"
                class="preview-image"
                @error="handleImageError"
              >
              <div class="photo-overlay">
                <button type="button" @click="triggerFileInput" class="btn-change-photo">
                  <i class="fas fa-camera"></i> Alterar Foto
                </button>
                <button type="button" @click="removerFoto" class="btn-remove-photo">
                  <i class="fas fa-trash"></i> Remover
                </button>
              </div>
            </div>
            <div v-else class="photo-placeholder" @click="triggerFileInput">
              <i class="fas fa-user-circle"></i>
              <span>Clique para adicionar foto</span>
            </div>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              style="display: none"
            >
          </div>
        </div>

        <!-- Dados Pessoais -->
        <div class="form-section">
          <h2><i class="fas fa-user"></i> Dados Pessoais</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="nome">Nome Completo *</label>
              <input 
                id="nome"
                v-model="cliente.nome" 
                type="text" 
                required
                class="input-field"
              >
            </div>
            <div class="form-group">
              <label for="dataNascimento">Data de Nascimento *</label>
              <input 
                id="dataNascimento"
                v-model="cliente.dataNascimento" 
                type="date" 
                required
                class="input-field"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="cpf">CPF</label>
              <input 
                id="cpf"
                v-model="cliente.cpf" 
                type="text" 
                placeholder="000.000.000-00"
                class="input-field"
              >
            </div>
            <div class="form-group">
              <label for="telefone">Telefone *</label>
              <input 
                id="telefone"
                v-model="cliente.telefone" 
                type="tel" 
                required
                placeholder="(00) 00000-0000"
                class="input-field"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                id="email"
                v-model="cliente.email" 
                type="email"
                placeholder="email@exemplo.com"
                class="input-field"
              >
            </div>
            <div class="form-group">
              <label for="endereco">Endereço</label>
              <input 
                id="endereco"
                v-model="cliente.endereco" 
                type="text"
                placeholder="Rua, número, bairro"
                class="input-field"
              >
            </div>
          </div>
        </div>

        <!-- Histórico de Saúde -->
        <div class="form-section">
          <h2><i class="fas fa-notes-medical"></i> Histórico de Saúde</h2>
          <div class="form-group">
            <label for="doencas">Doenças e Condições</label>
            <textarea 
              id="doencas"
              v-model="cliente.doencas"
              placeholder="Informe doenças crônicas, condições médicas, etc."
              rows="3"
              class="input-field"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="medicamentos">Medicamentos em Uso</label>
            <textarea 
              id="medicamentos"
              v-model="cliente.medicamentos"
              placeholder="Liste os medicamentos que utiliza regularmente"
              rows="3"
              class="input-field"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="alergias">Alergias</label>
            <textarea 
              id="alergias"
              v-model="cliente.alergias"
              placeholder="Informe alergias a medicamentos, cosméticos, etc."
              rows="3"
              class="input-field"
            ></textarea>
          </div>

          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="cliente.gestante">
              <span>Gestante</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="cliente.lactante">
              <span>Lactante</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="cliente.fumante">
              <span>Fumante</span>
            </label>
          </div>
        </div>

        <!-- Informações Estéticas -->
        <div class="form-section">
          <h2><i class="fas fa-spa"></i> Informações Estéticas</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="tipoPele">Tipo de Pele</label>
              <select id="tipoPele" v-model="cliente.tipoPele" class="input-field">
                <option value="">Selecione...</option>
                <option value="normal">Normal</option>
                <option value="seca">Seca</option>
                <option value="oleosa">Oleosa</option>
                <option value="mista">Mista</option>
                <option value="sensivel">Sensível</option>
              </select>
            </div>
            <div class="form-group">
              <label for="protetorSolar">Uso de Protetor Solar</label>
              <select id="protetorSolar" v-model="cliente.protetorSolar" class="input-field">
                <option value="">Selecione...</option>
                <option value="diario">Diário</option>
                <option value="ocasional">Ocasional</option>
                <option value="raro">Raro</option>
                <option value="nunca">Nunca</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="produtosCosmeticos">Produtos Cosméticos Utilizados</label>
            <textarea 
              id="produtosCosmeticos"
              v-model="cliente.produtosCosmeticos"
              placeholder="Liste os produtos que utiliza (limpadores, hidratantes, etc.)"
              rows="3"
              class="input-field"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="objetivos">Objetivos e Expectativas</label>
            <textarea 
              id="objetivos"
              v-model="cliente.objetivos"
              placeholder="Descreva os objetivos com os tratamentos estéticos"
              rows="3"
              class="input-field"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="procedimentosAnteriores">Procedimentos Anteriores</label>
            <textarea 
              id="procedimentosAnteriores"
              v-model="cliente.procedimentosAnteriores"
              placeholder="Descreva procedimentos estéticos já realizados"
              rows="3"
              class="input-field"
            ></textarea>
          </div>
        </div>

        <!-- Observações -->
        <div class="form-section">
          <h2><i class="fas fa-clipboard"></i> Observações</h2>
          <div class="form-group">
            <label for="observacoes">Observações Gerais</label>
            <textarea 
              id="observacoes"
              v-model="cliente.observacoes"
              placeholder="Informações adicionais relevantes"
              rows="4"
              class="input-field"
            ></textarea>
          </div>
        </div>

        <!-- Botões -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="salvando"
          >
            <i v-if="!salvando" class="fas fa-save"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
          <button 
            type="button" 
            @click="voltar" 
            class="btn-secondary"
          >
            <i class="fas fa-arrow-left"></i>
            Voltar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase.js'
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { compressProfileImage, isValidImage } from '../utils/imageCompressor.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import { useClinica } from '../composables/useClinica.js'
import VoltarHome from '../components/VoltarHome.vue'

const route = useRoute()
const router = useRouter()
const { clinicaId } = useClinica()

const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')
const cliente = ref({
  nome: '',
  dataNascimento: '',
  cpf: '',
  telefone: '',
  email: '',
  endereco: '',
  doencas: '',
  medicamentos: '',
  alergias: '',
  gestante: false,
  lactante: false,
  fumante: false,
  tipoPele: '',
  protetorSolar: '',
  produtosCosmeticos: '',
  objetivos: '',
  procedimentosAnteriores: '',
  observacoes: '',
  fotoURL: ''
})

const fotoPreview = ref(null)
const fileInputRef = ref(null)
const novaFotoFile = ref(null)
const anamneseId = ref(null)
const clienteId = ref(null)

const toast = ref({
  show: false,
  message: '',
  type: 'error',
  timeoutId: null
})

const mostrarToast = (message, type = 'error') => {
  if (toast.value.timeoutId) {
    clearTimeout(toast.value.timeoutId)
  }

  toast.value = {
    show: true,
    message,
    type,
    timeoutId: null
  }

  const timeoutDuration = type === 'error' ? 6000 : 4000
  toast.value.timeoutId = setTimeout(() => {
    toast.value.show = false
    toast.value.timeoutId = null
  }, timeoutDuration)
}

const fecharToast = () => {
  if (toast.value.timeoutId) {
    clearTimeout(toast.value.timeoutId)
    toast.value.timeoutId = null
  }
  toast.value.show = false
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    // Validar imagem
    isValidImage(file)

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      fotoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)

    // Armazenar arquivo
    novaFotoFile.value = file
    console.log('Arquivo selecionado:', file.name, file.size)
  } catch (err) {
    console.error('Erro ao selecionar foto:', err)
    mostrarToast(err.message, 'error')
    event.target.value = ''
  }
}

const handleImageError = (event) => {
  console.error('Erro ao carregar imagem:', event.target.src)
  event.target.style.display = 'none'
}

const removerFoto = () => {
  fotoPreview.value = null
  novaFotoFile.value = null
  cliente.value.fotoURL = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const carregarDados = async () => {
  try {
    carregando.value = true
    anamneseId.value = route.params.id

    console.log('=== CARREGANDO DADOS DO PACIENTE ===')
    console.log('AnamneseId:', anamneseId.value)

    // Buscar anamnese
    const anamneseRef = doc(db, 'anamneses', anamneseId.value)
    const anamneseDoc = await getDoc(anamneseRef)

    if (!anamneseDoc.exists()) {
      erro.value = 'Anamnese não encontrada'
      return
    }

    const anamneseData = anamneseDoc.data()
    console.log('Anamnese encontrada:', anamneseData)

    // Buscar cliente pelo clienteId da anamnese
    if (anamneseData.clienteId) {
      clienteId.value = anamneseData.clienteId
      const clienteRef = doc(db, 'clientes', clienteId.value)
      const clienteDoc = await getDoc(clienteRef)

      if (clienteDoc.exists()) {
        const clienteData = clienteDoc.data()
        console.log('Cliente encontrado:', clienteData)
        
        // Preencher formulário
        cliente.value = {
          nome: anamneseData.nome || clienteData.nome || '',
          dataNascimento: anamneseData.dataNascimento || clienteData.dataNascimento || '',
          cpf: anamneseData.cpf || clienteData.cpf || '',
          telefone: anamneseData.telefone || clienteData.telefone || '',
          email: anamneseData.email || clienteData.email || '',
          endereco: anamneseData.endereco || clienteData.endereco || '',
          doencas: anamneseData.doencas || '',
          medicamentos: anamneseData.medicamentos || '',
          alergias: anamneseData.alergias || '',
          gestante: anamneseData.gestante || false,
          lactante: anamneseData.lactante || false,
          fumante: anamneseData.fumante || false,
          tipoPele: anamneseData.tipoPele || '',
          protetorSolar: anamneseData.protetorSolar || '',
          produtosCosmeticos: anamneseData.produtosCosmeticos || '',
          objetivos: anamneseData.objetivos || '',
          procedimentosAnteriores: anamneseData.procedimentosAnteriores || '',
          observacoes: anamneseData.observacoes || '',
          fotoURL: clienteData.fotoURL || anamneseData.fotoURL || ''
        }
      }
    } else {
      // Se não tem clienteId, usar dados da anamnese
      cliente.value = {
        nome: anamneseData.nome || '',
        dataNascimento: anamneseData.dataNascimento || '',
        cpf: anamneseData.cpf || '',
        telefone: anamneseData.telefone || '',
        email: anamneseData.email || '',
        endereco: anamneseData.endereco || '',
        doencas: anamneseData.doencas || '',
        medicamentos: anamneseData.medicamentos || '',
        alergias: anamneseData.alergias || '',
        gestante: anamneseData.gestante || false,
        lactante: anamneseData.lactante || false,
        fumante: anamneseData.fumante || false,
        tipoPele: anamneseData.tipoPele || '',
        protetorSolar: anamneseData.protetorSolar || '',
        produtosCosmeticos: anamneseData.produtosCosmeticos || '',
        objetivos: anamneseData.objetivos || '',
        procedimentosAnteriores: anamneseData.procedimentosAnteriores || '',
        observacoes: anamneseData.observacoes || '',
        fotoURL: anamneseData.fotoURL || ''
      }
    }

    console.log('Dados carregados:', cliente.value)
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    erro.value = 'Erro ao carregar dados do paciente'
  } finally {
    carregando.value = false
  }
}

const salvarCliente = async () => {
  try {
    salvando.value = true
    console.log('=== SALVANDO ALTERAÇÕES DO CLIENTE ===')
    console.log('AnamneseId:', anamneseId.value)
    console.log('ClienteId:', clienteId.value)
    console.log('Nova foto?', !!novaFotoFile.value)

    let fotoURL = cliente.value.fotoURL

    // Upload da nova foto se houver
    if (novaFotoFile.value) {
      try {
        console.log('Comprimindo e fazendo upload da foto...')
        const compressed = await compressProfileImage(novaFotoFile.value)
        fotoURL = await uploadToCloudinary(compressed, {
          preset: 'pacientes',
          folder: 'estetica/clientes'
        })
        console.log('Upload concluído:', fotoURL)
      } catch (uploadError) {
        console.error('Erro no upload:', uploadError)
        mostrarToast(`Erro ao fazer upload da foto: ${uploadError.message}`, 'error')
        // Continua sem atualizar a foto
      }
    }

    // Dados para atualizar
    const dadosAtualizados = {
      ...cliente.value,
      fotoURL,
      dataAtualizacao: serverTimestamp()
    }

    // Atualizar anamnese
    const anamneseRef = doc(db, 'anamneses', anamneseId.value)
    await updateDoc(anamneseRef, dadosAtualizados)
    console.log('Anamnese atualizada')

    // Atualizar cliente se existir
    if (clienteId.value) {
      const clienteRef = doc(db, 'clientes', clienteId.value)
      await updateDoc(clienteRef, {
        nome: cliente.value.nome,
        dataNascimento: cliente.value.dataNascimento,
        cpf: cliente.value.cpf,
        telefone: cliente.value.telefone,
        email: cliente.value.email,
        endereco: cliente.value.endereco,
        fotoURL,
        dataAtualizacao: serverTimestamp()
      })
      console.log('Cliente atualizado')
    }

    mostrarToast('Alterações salvas com sucesso!', 'success')
    
    // Resetar nova foto após salvar
    novaFotoFile.value = null
    fotoPreview.value = null
    
    // Aguardar um pouco antes de voltar
    setTimeout(() => {
      router.push('/lista')
    }, 2000)

  } catch (err) {
    console.error('Erro ao salvar cliente:', err)
    mostrarToast(`Erro ao salvar alterações: ${err.message}`, 'error')
  } finally {
    salvando.value = false
  }
}

const voltar = () => {
  router.push('/lista')
}

onMounted(() => {
  carregarDados()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header {
  margin-bottom: 32px;
}

.header h1 {
  font-size: 28px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 12px;
}

.loading,
.error {
  text-align: center;
  padding: 40px 20px;
  font-size: 18px;
}

.loading {
  color: #667eea;
}

.error {
  color: #dc3545;
}

/* Toast Styles */
.toast {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideInMobile 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-color: #28a745;
  color: #155724;
}

.toast-warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-color: #ffc107;
  color: #856404;
}

.toast-error {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border-color: #dc3545;
  color: #721c24;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
}

.toast-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-message {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  flex: 1;
  padding-right: 40px;
}

.toast-close {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

@keyframes slideInMobile {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Photo Upload */
.photo-upload {
  margin: 20px 0;
}

.photo-placeholder {
  width: 200px;
  height: 200px;
  border: 3px dashed #d2d2d7;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f5f5f7;
  margin: 0 auto;
}

.photo-placeholder:hover {
  border-color: #667eea;
  background: #f0f0f5;
}

.photo-placeholder i {
  font-size: 64px;
  color: #8e8e93;
  margin-bottom: 12px;
}

.photo-placeholder span {
  font-size: 14px;
  color: #6e6e73;
  font-weight: 500;
}

.photo-preview {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 16px 12px 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-preview:hover .photo-overlay {
  opacity: 1;
}

.btn-change-photo,
.btn-remove-photo {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-change-photo {
  background: white;
  color: #667eea;
}

.btn-change-photo:hover {
  background: #667eea;
  color: white;
}

.btn-remove-photo {
  background: #dc3545;
  color: white;
}

.btn-remove-photo:hover {
  background: #c82333;
}

/* Form Sections */
.form-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e5e5ea;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  font-size: 20px;
  color: #1d1d1f;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e5ea;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  font-family: inherit;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

textarea.input-field {
  resize: vertical;
  min-height: 80px;
}

.checkbox-group {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e5ea;
}

.btn-primary,
.btn-secondary {
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  min-height: 48px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #6e6e73;
  border: 2px solid #e5e5ea;
}

.btn-secondary:hover {
  background: #f5f5f7;
  border-color: #d2d2d7;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .card {
    padding: 20px;
    border-radius: 12px;
  }

  .header h1 {
    font-size: 22px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-section h2 {
    font-size: 18px;
  }

  .input-field {
    font-size: 16px;
    padding: 14px 16px;
  }

  .photo-placeholder,
  .photo-preview {
    width: 160px;
    height: 160px;
  }

  .photo-placeholder i {
    font-size: 48px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .toast {
    top: 20px;
    left: 20px;
    right: 20px;
  }
}

@media (min-width: 769px) {
  .toast {
    top: 20px;
    right: 20px;
    left: auto;
    max-width: 400px;
    min-width: 350px;
    animation: slideInDesktop 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  @keyframes slideInDesktop {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
}

/* PWA Safe Area */
@supports (padding: max(0px)) {
  .toast {
    top: max(20px, env(safe-area-inset-top));
    left: max(20px, env(safe-area-inset-left));
    right: max(20px, env(safe-area-inset-right));
  }
}
</style>
