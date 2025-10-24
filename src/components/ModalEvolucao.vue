<template>
  <div class="modal-overlay" @click="fecharModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2><i class="fas fa-stethoscope"></i> {{ evolucao ? 'Editar Evolução' : 'Nova Evolução Clínica' }}</h2>
        <button @click="fecharModal" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="salvarEvolucao">
          <div class="form-row">
            <div class="form-group">
              <label>Título da Evolução *</label>
              <input v-model="formulario.titulo" type="text" required placeholder="Ex: Primeira consulta, Retorno, etc.">
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

          <div class="form-group">
            <label>Queixa Principal *</label>
            <textarea v-model="formulario.queixaPrincipal" required placeholder="Descreva a queixa principal do paciente..." rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>História da Doença Atual</label>
            <textarea v-model="formulario.historiaDoenca" placeholder="Descreva a evolução da doença/queixa..." rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Exame Físico *</label>
            <textarea v-model="formulario.exameFisico" required placeholder="Descreva os achados do exame físico..." rows="4"></textarea>
          </div>

          <div class="form-group">
            <label>Diagnóstico *</label>
            <textarea v-model="formulario.diagnostico" required placeholder="Descreva o diagnóstico..." rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Conduta *</label>
            <textarea v-model="formulario.conduta" required placeholder="Descreva a conduta adotada..." rows="4"></textarea>
          </div>

          <div class="form-group">
            <label>Observações Adicionais</label>
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
              {{ salvando ? 'Salvando...' : 'Salvar Evolução' }}
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
  evolucao: {
    type: Object,
    default: null
  },
  profissionalSugerido: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['fechar', 'salvar'])

const salvando = ref(false)

const formulario = ref({
  titulo: '',
  data: '',
  profissional: '',
  queixaPrincipal: '',
  historiaDoenca: '',
  exameFisico: '',
  diagnostico: '',
  conduta: '',
  observacoes: ''
})

const fecharModal = () => {
  emit('fechar')
}

const salvarEvolucao = async () => {
  try {
    salvando.value = true
    
    // Validações
    if (!formulario.value.titulo || !formulario.value.data || !formulario.value.profissional || 
        !formulario.value.queixaPrincipal || !formulario.value.exameFisico || 
        !formulario.value.diagnostico || !formulario.value.conduta) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    emit('salvar', { ...formulario.value })
  } catch (error) {
    console.error('Erro ao salvar evolução:', error)
    alert('Erro ao salvar evolução')
  } finally {
    salvando.value = false
  }
}

onMounted(() => {
  console.log('🔧 Inicializando modal de evolução...')
  console.log('👤 Paciente:', props.paciente)
  console.log('👨‍⚕️ Profissional sugerido:', props.profissionalSugerido)
  console.log('📋 Evolução editando:', props.evolucao)
  
  // Preencher formulário se editando
  if (props.evolucao) {
    console.log('✏️ Editando evolução existente')
    formulario.value = {
      titulo: props.evolucao.titulo || '',
      data: props.evolucao.data ? new Date(props.evolucao.data).toISOString().split('T')[0] : '',
      profissional: props.evolucao.profissional || '',
      queixaPrincipal: props.evolucao.queixaPrincipal || '',
      historiaDoenca: props.evolucao.historiaDoenca || '',
      exameFisico: props.evolucao.exameFisico || '',
      diagnostico: props.evolucao.diagnostico || '',
      conduta: props.evolucao.conduta || '',
      observacoes: props.evolucao.observacoes || ''
    }
  } else {
    console.log('➕ Nova evolução - preenchendo dados iniciais')
    // Nova evolução - preencher data atual e profissional sugerido
    formulario.value.data = new Date().toISOString().split('T')[0]
    if (props.profissionalSugerido) {
      console.log('✅ Preenchendo profissional sugerido:', props.profissionalSugerido)
      formulario.value.profissional = props.profissionalSugerido
    }
  }
  
  console.log('📋 Formulário inicializado:', formulario.value)
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
