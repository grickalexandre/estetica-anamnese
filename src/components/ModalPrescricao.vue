<template>
  <div class="modal-overlay" @click="fecharModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2><i class="fas fa-prescription-bottle"></i> {{ prescricao ? 'Editar Prescrição' : 'Nova Prescrição' }}</h2>
        <button @click="fecharModal" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="salvarPrescricao">
          <div class="form-row">
            <div class="form-group">
              <label>Título da Prescrição *</label>
              <input v-model="formulario.titulo" type="text" required placeholder="Ex: Prescrição pós-procedimento, etc.">
            </div>
            <div class="form-group">
              <label>Data *</label>
              <input v-model="formulario.data" type="date" required>
            </div>
          </div>

          <div class="form-group">
            <label>Profissional Responsável *</label>
            <input v-model="formulario.profissional" type="text" required placeholder="Nome do profissional">
          </div>

          <!-- Medicamentos -->
          <div class="medicamentos-section">
            <div class="section-header">
              <h3><i class="fas fa-pills"></i> Medicamentos</h3>
              <button type="button" @click="adicionarMedicamento" class="btn btn-secondary">
                <i class="fas fa-plus"></i>
                Adicionar Medicamento
              </button>
            </div>

            <div v-if="medicamentos.length === 0" class="empty-medicamentos">
              <i class="fas fa-pills"></i>
              <p>Nenhum medicamento adicionado</p>
            </div>

            <div v-else class="medicamentos-list">
              <div v-for="(medicamento, index) in medicamentos" :key="index" class="medicamento-item">
                <div class="medicamento-fields">
                  <div class="field-group">
                    <label>Nome do Medicamento *</label>
                    <input v-model="medicamento.nome" type="text" required placeholder="Ex: Paracetamol">
                  </div>
                  <div class="field-group">
                    <label>Dosagem *</label>
                    <input v-model="medicamento.dosagem" type="text" required placeholder="Ex: 500mg">
                  </div>
                  <div class="field-group">
                    <label>Posologia *</label>
                    <input v-model="medicamento.posologia" type="text" required placeholder="Ex: 1 comprimido de 8/8h">
                  </div>
                  <div class="field-group">
                    <label>Duração</label>
                    <input v-model="medicamento.duracao" type="text" placeholder="Ex: 7 dias">
                  </div>
                </div>
                <button type="button" @click="removerMedicamento(index)" class="btn-remove">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Orientações Gerais</label>
            <textarea v-model="formulario.orientacoes" placeholder="Orientações adicionais para o paciente..." rows="4"></textarea>
          </div>

          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="formulario.observacoes" placeholder="Observações complementares..." rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="salvando">
              <i v-if="!salvando" class="fas fa-save"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              {{ salvando ? 'Salvando...' : 'Salvar Prescrição' }}
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
  prescricao: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['fechar', 'salvar'])

const salvando = ref(false)
const medicamentos = ref([])

const formulario = ref({
  titulo: '',
  data: '',
  profissional: '',
  orientacoes: '',
  observacoes: ''
})

const fecharModal = () => {
  emit('fechar')
}

const adicionarMedicamento = () => {
  medicamentos.value.push({
    nome: '',
    dosagem: '',
    posologia: '',
    duracao: ''
  })
}

const removerMedicamento = (index) => {
  medicamentos.value.splice(index, 1)
}

const salvarPrescricao = async () => {
  try {
    salvando.value = true
    
    // Validações
    if (!formulario.value.titulo || !formulario.value.data || !formulario.value.profissional) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (medicamentos.value.length === 0) {
      alert('Adicione pelo menos um medicamento')
      return
    }

    // Validar medicamentos
    for (const medicamento of medicamentos.value) {
      if (!medicamento.nome || !medicamento.dosagem || !medicamento.posologia) {
        alert('Preencha todos os campos obrigatórios dos medicamentos')
        return
      }
    }

    const dadosPrescricao = {
      ...formulario.value,
      medicamentos: medicamentos.value
    }

    emit('salvar', dadosPrescricao)
  } catch (error) {
    console.error('Erro ao salvar prescrição:', error)
    alert('Erro ao salvar prescrição')
  } finally {
    salvando.value = false
  }
}

onMounted(() => {
  // Preencher formulário se editando
  if (props.prescricao) {
    formulario.value = {
      titulo: props.prescricao.titulo || '',
      data: props.prescricao.data ? new Date(props.prescricao.data).toISOString().split('T')[0] : '',
      profissional: props.prescricao.profissional || '',
      orientacoes: props.prescricao.orientacoes || '',
      observacoes: props.prescricao.observacoes || ''
    }
    
    medicamentos.value = props.prescricao.medicamentos || []
  } else {
    // Nova prescrição - preencher data atual
    formulario.value.data = new Date().toISOString().split('T')[0]
    // Adicionar um medicamento vazio por padrão
    adicionarMedicamento()
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
  max-width: 900px;
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
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Seção de Medicamentos */
.medicamentos-section {
  margin: 24px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-medicamentos {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.empty-medicamentos i {
  font-size: 32px;
  margin-bottom: 12px;
  color: #d1d5db;
}

.medicamentos-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.medicamento-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.medicamento-fields {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr;
  gap: 12px;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-group label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.field-group input {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.btn-remove {
  width: 32px;
  height: 32px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  align-self: flex-start;
  margin-top: 20px;
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
  
  .medicamento-fields {
    grid-template-columns: 1fr;
  }
  
  .medicamento-item {
    flex-direction: column;
  }
  
  .btn-remove {
    align-self: stretch;
    margin-top: 12px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>
