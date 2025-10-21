<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-user-edit"></i> Editar Cliente</h1>
        <VoltarHome />
      </div>
    </div>

    <div v-if="carregando" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Carregando dados do cliente...
    </div>

    <div v-else-if="!paciente" class="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>Cliente não encontrado</p>
    </div>

    <div v-else class="card">
      <form @submit.prevent="salvar">
        <h2><i class="fas fa-user"></i> Dados Pessoais</h2>
        
        <!-- Foto do Cliente -->
        <div class="form-group">
          <label><i class="fas fa-camera"></i> Foto do Cliente</label>
          <div class="photo-upload">
            <div v-if="!fotoPreview && !form.fotoURL" class="photo-placeholder">
              <i class="fas fa-user"></i>
              <p>Clique para adicionar foto</p>
            </div>
            <img v-else :src="fotoPreview || form.fotoURL" alt="Foto do cliente" class="photo-preview">
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileSelect" 
              accept="image/*"
              style="display: none;"
            >
            <button type="button" @click="$refs.fileInput.click()" class="btn btn-secondary btn-sm">
              <i class="fas fa-camera"></i> {{ form.fotoURL ? 'Alterar Foto' : 'Adicionar Foto' }}
            </button>
            <button v-if="form.fotoURL || fotoPreview" type="button" @click="removerFoto" class="btn btn-danger btn-sm">
              <i class="fas fa-trash"></i> Remover
            </button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Nome Completo *</label>
            <input 
              type="text" 
              v-model="form.nome" 
              required 
              class="form-control"
              placeholder="Nome completo do cliente"
            >
          </div>
          <div class="form-group">
            <label>CPF</label>
            <input 
              type="text" 
              v-model="form.cpf" 
              class="form-control"
              placeholder="000.000.000-00"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Telefone *</label>
            <input 
              type="tel" 
              v-model="form.telefone" 
              required 
              class="form-control"
              placeholder="(00) 00000-0000"
            >
          </div>
          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="form.email" 
              class="form-control"
              placeholder="email@exemplo.com"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Data de Nascimento</label>
            <input 
              type="date" 
              v-model="form.dataNascimento" 
              class="form-control"
            >
          </div>
          <div class="form-group">
            <label>Endereço</label>
            <input 
              type="text" 
              v-model="form.endereco" 
              class="form-control"
              placeholder="Endereço completo"
            >
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="cancelar" class="btn btn-secondary">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="salvando">
            <i v-if="!salvando" class="fas fa-save"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </div>
  </div>

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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase.js'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import VoltarHome from '../components/VoltarHome.vue'
import { useClinica } from '../composables/useClinica.js'

const route = useRoute()
const router = useRouter()
const { clinicaId, inicializarClinica } = useClinica()

// Estados
const carregando = ref(true)
const salvando = ref(false)
const paciente = ref(null)
const fotoPreview = ref(null)

// Estado para toast/notificação
const toast = ref({
  show: false,
  message: '',
  type: 'error' // 'success', 'error', 'warning'
})

const mostrarToast = (message, type = 'error') => {
  // Limpar timeout anterior se existir
  if (toast.value.timeoutId) {
    clearTimeout(toast.value.timeoutId)
  }
  
  toast.value = {
    show: true,
    message,
    type,
    timeoutId: null
  }
  
  // Auto-hide após tempo baseado no tipo
  const timeoutDuration = type === 'error' ? 6000 : 4000 // Erros ficam mais tempo
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

// Formulário
const form = ref({
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  dataNascimento: '',
  endereco: '',
  fotoURL: ''
})

// Carregar dados do paciente
const carregarPaciente = async () => {
  try {
    carregando.value = true
    console.log('ID recebido:', route.params.id)
    const docRef = doc(db, 'anamneses', route.params.id)
    const docSnap = await getDoc(docRef)
    
    console.log('Documento existe:', docSnap.exists())
    if (docSnap.exists()) {
      const data = docSnap.data()
      console.log('Dados do documento:', data)
      paciente.value = { id: docSnap.id, ...data }
      
      // Preencher formulário com dados do paciente
      form.value = {
        nome: data.nome || '',
        cpf: data.cpf || '',
        telefone: data.telefone || '',
        email: data.email || '',
        dataNascimento: data.dataNascimento || '',
        endereco: data.endereco || '',
        fotoURL: data.fotoURL || ''
      }
      console.log('Formulário preenchido:', form.value)
    } else {
      console.error('Paciente não encontrado')
    }
  } catch (error) {
    console.error('Erro ao carregar paciente:', error)
  } finally {
    carregando.value = false
  }
}

// Manipular seleção de arquivo
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  console.log('📁 Arquivo selecionado:', {
    nome: file?.name,
    tamanho: file?.size,
    tipo: file?.type,
    existe: !!file
  })
  
  if (file) {
    // Validar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!tiposPermitidos.includes(file.type)) {
      console.error('❌ Tipo de arquivo inválido:', file.type)
      mostrarToast('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, WebP).', 'error')
      return
    }
    
    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ Arquivo muito grande:', file.size)
      mostrarToast('A imagem deve ter no máximo 5MB.', 'error')
      return
    }
    
    // Validar se o arquivo não está vazio
    if (file.size === 0) {
      console.error('❌ Arquivo vazio')
      mostrarToast('O arquivo selecionado está vazio.', 'error')
      return
    }
    
    console.log('✅ Arquivo válido, criando preview...')
    
    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      fotoPreview.value = e.target.result
      console.log('✅ Preview criado com sucesso')
    }
    reader.onerror = (error) => {
      console.error('❌ Erro ao ler arquivo:', error)
      mostrarToast('Erro ao processar a imagem.', 'error')
    }
    reader.readAsDataURL(file)
  }
}

// Remover foto
const removerFoto = () => {
  form.value.fotoURL = ''
  fotoPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Salvar alterações
const salvar = async () => {
  try {
    salvando.value = true
    console.log('=== SALVANDO CLIENTE ===')
    console.log('ID do documento:', route.params.id)
    console.log('Dados do formulário:', form.value)
    
    // Upload da nova foto se houver
    let fotoURL = form.value.fotoURL
    console.log('📸 Estado da foto:', {
      fotoURLAtual: form.value.fotoURL,
      temPreview: !!fotoPreview.value,
      temFileInput: !!fileInput.value,
      temFile: fileInput.value?.files?.[0]
    })
    
    if (fotoPreview.value) {
      console.log('📤 Fazendo upload da nova foto...')
      const file = fileInput.value.files[0]
      if (file) {
        try {
          console.log('📁 Arquivo para upload:', {
            nome: file.name,
            tamanho: file.size,
            tipo: file.type
          })
          
          console.log('📤 Iniciando upload para Cloudinary...')
          fotoURL = await uploadToCloudinary(file, { 
            preset: 'unsigned',
            folder: 'estetica/clientes'
          })
          console.log('✅ Foto enviada com sucesso:', fotoURL)
        } catch (uploadError) {
          console.error('❌ Erro no upload:', uploadError)
          console.error('❌ Detalhes do erro:', {
            name: uploadError.name,
            message: uploadError.message,
            stack: uploadError.stack
          })
          mostrarToast(`Erro ao fazer upload da foto: ${uploadError.message}`, 'error')
          return
        }
      } else {
        console.warn('⚠️ Preview existe mas não há arquivo selecionado')
      }
    } else {
      console.log('ℹ️ Nenhuma nova foto para upload, mantendo URL atual:', fotoURL)
    }
    
    // Atualizar dados do paciente
    const dadosAtualizacao = {
      nome: form.value.nome,
      cpf: form.value.cpf,
      telefone: form.value.telefone,
      email: form.value.email,
      dataNascimento: form.value.dataNascimento,
      endereco: form.value.endereco,
      fotoURL: fotoURL,
      dataAtualizacao: serverTimestamp()
    }
    
    console.log('Dados para atualização:', dadosAtualizacao)
    
    const docRef = doc(db, 'anamneses', route.params.id)
    console.log('Referência do documento:', docRef.path)
    
    await updateDoc(docRef, dadosAtualizacao)
    console.log('Documento atualizado com sucesso!')
    
    mostrarToast('Cliente atualizado com sucesso!', 'success')
    setTimeout(() => {
      router.push('/lista')
    }, 1500)
    
  } catch (error) {
    console.error('Erro ao salvar cliente:', error)
    console.error('Detalhes do erro:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    mostrarToast('Erro ao salvar alterações. Tente novamente.', 'error')
  } finally {
    salvando.value = false
  }
}

// Cancelar edição
const cancelar = () => {
  router.push('/lista')
}

// Lifecycle
onMounted(async () => {
  try {
    await inicializarClinica()
    await carregarPaciente()
  } catch (error) {
    console.error('Erro ao inicializar:', error)
  }
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  color: #333;
  margin: 0;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading i, .error i {
  font-size: 24px;
  margin-bottom: 10px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card h2 {
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-weight: 600;
  color: #555;
}

.form-control {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.photo-placeholder, .photo-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ddd;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-preview {
  object-fit: cover;
  border: 2px solid #007bff;
  background: white;
}

.photo-placeholder:hover {
  border-color: #007bff;
  background: #f0f8ff;
}

.photo-placeholder i {
  font-size: 32px;
  margin-bottom: 8px;
}

.photo-placeholder p {
  margin: 0;
  font-size: 12px;
  text-align: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* Toast/Notificação - Mobile First */
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

.toast-close:active {
  transform: scale(0.95);
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

@media (min-width: 769px) {
  .toast {
    top: 20px;
    right: 20px;
    left: auto;
    max-width: 400px;
    min-width: 350px;
    animation: slideInDesktop 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  .toast-content {
    align-items: center;
  }
  
  .toast-icon {
    font-size: 20px;
    margin-top: 0;
  }
  
  .toast-message {
    font-size: 15px;
  }
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

@supports (padding: max(0px)) {
  .toast {
    top: max(20px, env(safe-area-inset-top));
    left: max(20px, env(safe-area-inset-left));
    right: max(20px, env(safe-area-inset-right));
  }
}
</style>
