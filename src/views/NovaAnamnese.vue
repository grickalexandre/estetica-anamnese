<template>
  <div class="container">
    <div class="card">
      <h1>Nova Anamnese</h1>
      
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
            <label>CPF</label>
            <input v-model="formulario.cpf" type="text" placeholder="000.000.000-00">
          </div>
          <div class="form-group">
            <label>Telefone *</label>
            <input v-model="formulario.telefone" type="tel" required placeholder="(00) 00000-0000">
          </div>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="formulario.email" type="email">
        </div>

        <div class="form-group">
          <label>Endereço</label>
          <input v-model="formulario.endereco" type="text">
        </div>

        <!-- Foto do Paciente -->
        <h2>📸 Foto do Paciente</h2>
        <div class="form-group">
          <div class="photo-upload" @click="$refs.fotoInput.click()">
            <input 
              ref="fotoInput" 
              type="file" 
              accept="image/*" 
              @change="handleFotoChange" 
              style="display: none"
            >
            <div v-if="!fotoPreview">
              <p>📷 Clique para adicionar foto</p>
              <p style="font-size: 12px; color: #718096; margin-top: 10px;">
                Formatos aceitos: JPG, PNG, JPEG
              </p>
            </div>
            <img v-else :src="fotoPreview" alt="Preview" class="photo-preview">
          </div>
        </div>

        <!-- Histórico Médico -->
        <h2>🏥 Histórico Médico</h2>
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

        <!-- Hábitos e Estilo de Vida -->
        <h2>💆‍♀️ Hábitos e Estilo de Vida</h2>
        <div class="form-group">
          <label>Pratica exercícios físicos?</label>
          <select v-model="formulario.exercicios">
            <option value="">Selecione...</option>
            <option value="nao">Não</option>
            <option value="raramente">Raramente</option>
            <option value="1-2x">1-2x por semana</option>
            <option value="3-4x">3-4x por semana</option>
            <option value="5+x">5 ou mais vezes por semana</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ingere água diariamente?</label>
          <select v-model="formulario.ingestaoAgua">
            <option value="">Selecione...</option>
            <option value="menos-1l">Menos de 1L</option>
            <option value="1-2l">1 a 2L</option>
            <option value="2-3l">2 a 3L</option>
            <option value="mais-3l">Mais de 3L</option>
          </select>
        </div>

        <div class="form-group">
          <label>Qualidade do sono</label>
          <select v-model="formulario.sono">
            <option value="">Selecione...</option>
            <option value="ruim">Ruim</option>
            <option value="regular">Regular</option>
            <option value="boa">Boa</option>
            <option value="otima">Ótima</option>
          </select>
        </div>

        <div class="form-group">
          <label>Tipo de alimentação</label>
          <select v-model="formulario.alimentacao">
            <option value="">Selecione...</option>
            <option value="normal">Normal</option>
            <option value="vegetariana">Vegetariana</option>
            <option value="vegana">Vegana</option>
            <option value="low-carb">Low Carb</option>
            <option value="outra">Outra</option>
          </select>
        </div>

        <!-- Cuidados com a Pele -->
        <h2>✨ Cuidados com a Pele</h2>
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
          <label>Exposição ao sol</label>
          <select v-model="formulario.exposicaoSol">
            <option value="">Selecione...</option>
            <option value="rara">Rara</option>
            <option value="moderada">Moderada</option>
            <option value="frequente">Frequente</option>
            <option value="intensa">Intensa</option>
          </select>
        </div>

        <div class="form-group">
          <label>Produtos cosméticos em uso</label>
          <textarea v-model="formulario.produtosCosmeticos" placeholder="Liste os produtos que usa atualmente..."></textarea>
        </div>

        <!-- Objetivos do Tratamento -->
        <h2>🎯 Objetivos do Tratamento</h2>
        <div class="form-group">
          <label>Quais são suas expectativas e objetivos?</label>
          <textarea v-model="formulario.objetivos" placeholder="Descreva o que deseja alcançar com o tratamento..." required></textarea>
        </div>

        <div class="form-group">
          <label>Procedimentos estéticos anteriores</label>
          <textarea v-model="formulario.procedimentosAnteriores" placeholder="Descreva procedimentos já realizados..."></textarea>
        </div>

        <!-- Observações -->
        <h2>📝 Observações Adicionais</h2>
        <div class="form-group">
          <label>Observações gerais</label>
          <textarea v-model="formulario.observacoes" placeholder="Informações adicionais relevantes..."></textarea>
        </div>

        <!-- Botões -->
        <div style="display: flex; gap: 10px; margin-top: 30px;">
          <button type="submit" class="btn btn-primary" :disabled="salvando">
            <i v-if="!salvando" class="fas fa-save"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ salvando ? 'Salvando...' : 'Salvar Anamnese' }}
          </button>
          <router-link to="/lista">
            <button type="button" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db, storage } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const router = useRouter()
const error = ref('')
const success = ref('')
const salvando = ref(false)
const fotoFile = ref(null)
const fotoPreview = ref(null)

const formulario = ref({
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
  exercicios: '',
  ingestaoAgua: '',
  sono: '',
  alimentacao: '',
  tipoPele: '',
  protetorSolar: '',
  exposicaoSol: '',
  produtosCosmeticos: '',
  objetivos: '',
  procedimentosAnteriores: '',
  observacoes: '',
  status: 'analisada', // Anamnese preenchida pela profissional já é considerada analisada
  origem: 'profissional' // Marcar que foi preenchida pela profissional
})

const handleFotoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    fotoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      fotoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const salvarAnamnese = async () => {
  try {
    salvando.value = true
    error.value = ''
    success.value = ''

    let fotoURL = null

    // Upload da foto se houver
    if (fotoFile.value) {
      const timestamp = Date.now()
      const nomeArquivo = `pacientes/${timestamp}_${fotoFile.value.name}`
      const fotoRef = storageRef(storage, nomeArquivo)
      
      await uploadBytes(fotoRef, fotoFile.value)
      fotoURL = await getDownloadURL(fotoRef)
    }

    // Salvar no Firestore
    const dadosAnamnese = {
      ...formulario.value,
      fotoURL,
      dataCriacao: serverTimestamp()
    }

    await addDoc(collection(db, 'anamneses'), dadosAnamnese)

    success.value = 'Anamnese salva com sucesso!'
    
    setTimeout(() => {
      router.push('/lista')
    }, 1500)

  } catch (err) {
    console.error('Erro ao salvar:', err)
    error.value = 'Erro ao salvar anamnese. Verifique a configuração do Firebase.'
  } finally {
    salvando.value = false
  }
}
</script>


