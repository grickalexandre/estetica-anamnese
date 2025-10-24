<template>
  <div class="modal-overlay" @click="fecharModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2><i class="fas fa-vial"></i> {{ exame ? 'Editar Exame' : 'Novo Exame' }}</h2>
        <button @click="fecharModal" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="salvarExame">
          <div class="form-row">
            <div class="form-group">
              <label>Nome do Exame *</label>
              <input v-model="formulario.nome" type="text" required placeholder="Ex: Hemograma, Glicemia, etc.">
            </div>
            <div class="form-group">
              <label>Data de Realização *</label>
              <input v-model="formulario.dataRealizacao" type="date" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Laboratório/Clínica *</label>
              <input v-model="formulario.laboratorio" type="text" required placeholder="Nome do laboratório">
            </div>
            <div class="form-group">
              <label>Status *</label>
              <select v-model="formulario.status" required>
                <option value="">Selecione...</option>
                <option value="solicitado">Solicitado</option>
                <option value="coletado">Coletado</option>
                <option value="processando">Processando</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Resultado</label>
            <textarea v-model="formulario.resultado" placeholder="Descreva o resultado do exame..." rows="4"></textarea>
          </div>

          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="formulario.observacoes" placeholder="Observações adicionais..." rows="3"></textarea>
          </div>

          <!-- Upload de Anexos -->
          <div class="form-group">
            <label>Anexos</label>
            <div class="upload-section">
              <input 
                ref="fileInput"
                type="file" 
                multiple 
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                @change="handleFileUpload"
                style="display: none"
              >
              <button type="button" @click="$refs.fileInput.click()" class="btn-upload">
                <i class="fas fa-upload"></i>
                Adicionar Anexos
              </button>
              <p class="upload-info">Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB cada)</p>
            </div>

            <!-- Lista de Anexos -->
            <div v-if="anexos.length > 0" class="anexos-list">
              <div v-for="(anexo, index) in anexos" :key="index" class="anexo-item">
                <div class="anexo-info">
                  <i class="fas fa-file"></i>
                  <span>{{ anexo.nome }}</span>
                  <span class="anexo-size">({{ formatarTamanho(anexo.tamanho) }})</span>
                </div>
                <button type="button" @click="removerAnexo(index)" class="btn-remove">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="salvando">
              <i v-if="!salvando" class="fas fa-save"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              {{ salvando ? 'Salvando...' : 'Salvar Exame' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  paciente: {
    type: Object,
    required: true
  },
  exame: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['fechar', 'salvar'])

const salvando = ref(false)
const anexos = ref([])

const formulario = ref({
  nome: '',
  dataRealizacao: '',
  laboratorio: '',
  status: '',
  resultado: '',
  observacoes: ''
})

const fecharModal = () => {
  emit('fechar')
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  
  files.forEach(file => {
    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(`Arquivo ${file.name} é muito grande. Máximo 10MB.`)
      return
    }
    
    // Validar tipo
    const tiposPermitidos = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!tiposPermitidos.includes(file.type)) {
      alert(`Tipo de arquivo ${file.type} não é permitido.`)
      return
    }
    
    anexos.value.push({
      nome: file.name,
      tamanho: file.size,
      arquivo: file,
      url: null // Será preenchido após upload
    })
  })
  
  // Limpar input
  event.target.value = ''
}

const removerAnexo = (index) => {
  anexos.value.splice(index, 1)
}

const formatarTamanho = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const salvarExame = async () => {
  try {
    salvando.value = true
    
    // Validações
    if (!formulario.value.nome || !formulario.value.dataRealizacao || 
        !formulario.value.laboratorio || !formulario.value.status) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    // Preparar dados com anexos
    const dadosExame = {
      ...formulario.value,
      anexos: anexos.value.map(anexo => ({
        nome: anexo.nome,
        tamanho: anexo.tamanho,
        url: anexo.url || 'upload_pendente' // Será atualizado após upload real
      }))
    }

    emit('salvar', dadosExame)
  } catch (error) {
    console.error('Erro ao salvar exame:', error)
    alert('Erro ao salvar exame')
  } finally {
    salvando.value = false
  }
}

onMounted(() => {
  // Preencher formulário se editando
  if (props.exame) {
    formulario.value = {
      nome: props.exame.nome || '',
      dataRealizacao: props.exame.dataRealizacao ? new Date(props.exame.dataRealizacao).toISOString().split('T')[0] : '',
      laboratorio: props.exame.laboratorio || '',
      status: props.exame.status || '',
      resultado: props.exame.resultado || '',
      observacoes: props.exame.observacoes || ''
    }
    
    anexos.value = props.exame.anexos || []
  } else {
    // Novo exame - preencher data atual
    formulario.value.dataRealizacao = new Date().toISOString().split('T')[0]
    formulario.value.status = 'solicitado'
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #1d1d1f;
}

.modal-body {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #374151;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.upload-section {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.2s;
}

.upload-section:hover {
  border-color: #3b82f6;
}

.btn-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-upload:hover {
  background: #2563eb;
}

.upload-info {
  margin: 8px 0 0 0;
  color: #6b7280;
  font-size: 12px;
}

.anexos-list {
  margin-top: 16px;
}

.anexo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.anexo-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
}

.anexo-size {
  color: #6b7280;
  font-size: 12px;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #dc2626;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>
