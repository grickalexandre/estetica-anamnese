<template>
  <div class="client-container">
        <div class="client-header">
          <div class="client-logo">
            <h1>{{ configuracoes.nomeClinica || '🌸 Clínica de Estética' }}</h1>
            <p>Anamnese Online</p>
            <div v-if="!carregando && configuracoes.nomeProprietario" class="proprietario-info">
              <p><i class="fas fa-user-md"></i> {{ configuracoes.nomeProprietario }}</p>
            </div>
          </div>
        </div>
    
    <div class="container">
      <div class="card client-form">
        <div class="form-intro">
          <h2>Preencha sua Anamnese</h2>
          <p>Complete este formulário para agilizar seu atendimento e garantir um tratamento personalizado.</p>
        </div>
      
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>

      <form @submit.prevent="salvarAnamnese">
        <!-- Dados Pessoais -->
        <h2>👤 Dados Pessoais</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Nome Completo *</label>
            <input v-model="formulario.nome" type="text" required>
          </div>
          <div class="form-group">
            <label>Data de Nascimento *</label>
            <input v-model="formulario.dataNascimento" type="date" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Telefone *</label>
            <input v-model="formulario.telefone" type="tel" required placeholder="(00) 00000-0000">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="formulario.email" type="email">
          </div>
        </div>


        <!-- Histórico Médico -->
        <h2><i class="fas fa-hospital"></i> Histórico Médico</h2>
        <div class="form-group">
          <label>Possui alguma doença? Qual?</label>
          <textarea v-model="formulario.doencas" placeholder="Descreva as doenças..."></textarea>
        </div>

        <div class="form-group">
          <label>Faz uso de medicamentos? Quais?</label>
          <textarea v-model="formulario.medicamentos" placeholder="Liste os medicamentos..."></textarea>
        </div>

        <div class="form-group">
          <label>Possui alergias? Quais?</label>
          <textarea v-model="formulario.alergias" placeholder="Descreva as alergias..."></textarea>
        </div>

        <div class="form-row">
          <div class="checkbox-group">
            <input v-model="formulario.gestante" type="checkbox" id="gestante">
            <label for="gestante">Gestante</label>
          </div>
          <div class="checkbox-group">
            <input v-model="formulario.lactante" type="checkbox" id="lactante">
            <label for="lactante">Lactante</label>
          </div>
          <div class="checkbox-group">
            <input v-model="formulario.fumante" type="checkbox" id="fumante">
            <label for="fumante">Fumante</label>
          </div>
        </div>

        <!-- Cuidados com a Pele -->
        <h2><i class="fas fa-spa"></i> Cuidados com a Pele</h2>
        <div class="form-group">
          <label>Tipo de Pele</label>
          <select v-model="formulario.tipoPele">
            <option value="">Selecione...</option>
            <option value="normal">Normal</option>
            <option value="seca">Seca</option>
            <option value="oleosa">Oleosa</option>
            <option value="mista">Mista</option>
            <option value="sensivel">Sensível</option>
          </select>
        </div>

        <div class="form-group">
          <label>Usa protetor solar?</label>
          <select v-model="formulario.protetorSolar">
            <option value="">Selecione...</option>
            <option value="nao">Não</option>
            <option value="as-vezes">Às vezes</option>
            <option value="diariamente">Diariamente</option>
          </select>
        </div>

        <div class="form-group">
          <label>Produtos cosméticos em uso</label>
          <textarea v-model="formulario.produtosCosmeticos" placeholder="Liste os produtos que usa atualmente..."></textarea>
        </div>

        <!-- Objetivos do Tratamento -->
        <h2><i class="fas fa-bullseye"></i> Objetivos do Tratamento</h2>
        <div class="form-group">
          <label>Quais são suas expectativas e objetivos? *</label>
          <textarea v-model="formulario.objetivos" placeholder="Descreva o que deseja alcançar com o tratamento..." required></textarea>
        </div>

        <div class="form-group">
          <label>Procedimentos estéticos anteriores</label>
          <textarea v-model="formulario.procedimentosAnteriores" placeholder="Descreva procedimentos já realizados..."></textarea>
        </div>

        <!-- Observações -->
        <h2><i class="fas fa-sticky-note"></i> Observações Adicionais</h2>
        <div class="form-group">
          <label>Observações gerais</label>
          <textarea v-model="formulario.observacoes" placeholder="Informações adicionais relevantes..."></textarea>
        </div>

        <!-- Botões -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-large" :disabled="salvando">
            <i v-if="!salvando" class="fas fa-paper-plane"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ salvando ? 'Enviando...' : 'Enviar Anamnese' }}
          </button>
        </div>
      </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { useConfiguracoes } from '../composables/useConfiguracoes'

const { configuracoes, carregando } = useConfiguracoes()

const error = ref('')
const success = ref('')
const salvando = ref(false)

const formulario = ref({
  nome: '',
  dataNascimento: '',
  telefone: '',
  email: '',
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
  status: 'pendente' // Status inicial
})


const salvarAnamnese = async () => {
  try {
    salvando.value = true
    error.value = ''
    success.value = ''

    // Verificar se já existe anamnese para este paciente
    const q = query(
      collection(db, 'anamneses'),
      where('nome', '==', formulario.value.nome),
      where('telefone', '==', formulario.value.telefone)
    )
    
    const existingAnamneses = await getDocs(q)
    
    if (existingAnamneses.size > 0) {
      const confirmar = confirm(
        `Já existe ${existingAnamneses.size} anamnese(s) para ${formulario.value.nome}. ` +
        'Deseja criar uma nova anamnese mesmo assim?'
      )
      
      if (!confirmar) {
        salvando.value = false
        return
      }
    }

    // Salvar no Firestore
    const dadosAnamnese = {
      ...formulario.value,
      dataCriacao: serverTimestamp(),
      origem: 'cliente' // Marcar que foi preenchida pelo cliente
    }

    await addDoc(collection(db, 'anamneses'), dadosAnamnese)

    success.value = 'Anamnese enviada com sucesso! Nossa equipe entrará em contato em breve.'
    
    // Limpar formulário após sucesso
    setTimeout(() => {
      formulario.value = {
        nome: '',
        dataNascimento: '',
        telefone: '',
        email: '',
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
        status: 'pendente'
      }
      success.value = ''
    }, 3000)

  } catch (err) {
    console.error('Erro ao salvar:', err)
    error.value = 'Erro ao enviar anamnese. Tente novamente.'
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.client-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1d1d1f 0%, #2c2c2e 100%);
  position: relative;
  overflow: hidden;
}

.client-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
  z-index: 0;
}

.client-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 40px 20px;
  text-align: center;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.client-logo h1 {
  color: white;
  font-size: 2.5em;
  margin-bottom: 8px;
  font-weight: 800;
  letter-spacing: -0.022em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.client-logo p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2em;
  font-weight: 400;
  letter-spacing: -0.022em;
}

.proprietario-info {
  margin-top: 8px;
}

.proprietario-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1em;
  font-weight: 500;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.proprietario-info i {
  font-size: 0.9em;
}

.client-form {
  margin-top: -40px;
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 0.5px solid rgba(255, 255, 255, 0.2);
}

.form-intro {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.form-intro h2 {
  color: #1d1d1f;
  font-size: 2em;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: -0.022em;
}

.form-intro p {
  color: #8e8e93;
  font-size: 1.1em;
  line-height: 1.47059;
  font-weight: 400;
  letter-spacing: -0.022em;
}

.form-actions {
  text-align: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 0.5px solid rgba(0, 0, 0, 0.1);
}

.btn-large {
  padding: 18px 36px;
  font-size: 18px;
  font-weight: 700;
  min-width: 220px;
  border-radius: 16px;
  letter-spacing: -0.022em;
}

/* Seções do formulário */
h2 {
  color: #1d1d1f;
  font-size: 1.5em;
  margin: 32px 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
  font-weight: 700;
  letter-spacing: -0.022em;
}

h2:first-of-type {
  margin-top: 0;
}

/* Melhorar espaçamento dos campos */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  display: block;
  font-size: 17px;
  letter-spacing: -0.022em;
}

/* Estilo para checkboxes */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: rgba(29, 29, 31, 0.05);
  border-radius: 12px;
  border: 0.5px solid rgba(29, 29, 31, 0.1);
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.checkbox-group:hover {
  background: rgba(29, 29, 31, 0.1);
  transform: scale(1.02);
}

.checkbox-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #1d1d1f;
  transform: scale(1.2);
}

.checkbox-group label {
  margin: 0;
  cursor: pointer;
  font-weight: 500;
  color: #1d1d1f;
  font-size: 17px;
  letter-spacing: -0.022em;
}

/* Responsividade */
@media (max-width: 768px) {
  .client-header {
    padding: 30px 16px;
  }
  
  .client-logo h1 {
    font-size: 2em;
  }
  
  .client-logo p {
    font-size: 1.1em;
  }
  
  .form-intro h2 {
    font-size: 1.5em;
  }
  
  .form-intro p {
    font-size: 1em;
  }
  
  .client-form {
    margin: -20px 12px 0 12px;
    border-radius: 16px;
  }
  
  .btn-large {
    padding: 16px 24px;
    font-size: 16px;
    min-width: 100%;
    width: 100%;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 14px 16px;
    font-size: 16px; /* Previne zoom no iOS */
  }
  
  .checkbox-group {
    padding: 14px 16px;
  }
  
  .checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }
  
  .checkbox-group label {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .client-header {
    padding: 20px 12px;
  }
  
  .client-logo h1 {
    font-size: 1.8em;
  }
  
  .client-form {
    margin: -15px 8px 0 8px;
    border-radius: 12px;
  }
  
  .form-intro {
    margin-bottom: 24px;
    padding-bottom: 16px;
  }
  
  .form-intro h2 {
    font-size: 1.3em;
  }
  
  h2 {
    font-size: 1.2em;
    margin: 24px 0 16px 0;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    font-size: 16px;
  }
}

</style>
