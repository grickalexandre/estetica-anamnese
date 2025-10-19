<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-file-medical"></i> Nova Anamnese</h1>
        <div class="header-actions">
          <VoltarHome />
        </div>
      </div>
    </div>

    <div class="card">
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
import { db } from '../firebase.js'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { compressAnamneseImage } from '../utils/imageCompressor.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import { useClinica } from '../composables/useClinica.js'
import { usePacientes } from '../composables/usePacientes.js'
import VoltarHome from '../components/VoltarHome.vue'

const router = useRouter()
const { clinicaId } = useClinica()
const { buscarOuCriarCliente, atualizarCliente, incrementarAnamnese } = usePacientes()
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

    console.log('=== INÍCIO DO SALVAMENTO ===')
    console.log('Salvando anamnese com clinicaId:', clinicaId.value)
    console.log('Dados do formulário:', formulario.value)

    // Validações básicas
    if (!formulario.value.nome || !formulario.value.telefone || !formulario.value.dataNascimento) {
      error.value = 'Por favor, preencha os campos obrigatórios: Nome, Telefone e Data de Nascimento'
      salvando.value = false
      return
    }

    // 1. Buscar ou criar cliente automaticamente (por CPF ou telefone)
    console.log('--- Etapa 1: Buscar/Criar Cliente ---')
    console.log('Buscando ou criando cliente:', formulario.value.nome, formulario.value.cpf || formulario.value.telefone)
    const cliente = await buscarOuCriarCliente({
      nome: formulario.value.nome,
      cpf: formulario.value.cpf,
      telefone: formulario.value.telefone,
      email: formulario.value.email,
      dataNascimento: formulario.value.dataNascimento,
      endereco: formulario.value.endereco
    })
    console.log('Cliente encontrado/criado:', cliente)

    let fotoURL = null

    // 2. Upload da foto via Cloudinary
    console.log('--- Etapa 2: Upload de Foto ---')
    if (fotoFile.value) {
      console.log('Fazendo upload da foto...')
      try {
        const compressed = await compressAnamneseImage(fotoFile.value)
        fotoURL = await uploadToCloudinary(compressed, {
          preset: 'pacientes',
          folder: 'estetica/anamneses',
          cloudName: 'dkliyeyoq'
        })
        console.log('Foto enviada com sucesso:', fotoURL)
      } catch (uploadError) {
        console.error('Erro no upload da foto:', uploadError)
        // Continua sem a foto
      }
    } else {
      console.log('Sem foto para upload')
    }

    // 3. Salvar anamnese com vinculação ao cliente
    console.log('--- Etapa 3: Salvar Anamnese ---')
    const dadosAnamnese = {
      ...formulario.value,
      fotoURL,
      clienteId: cliente?.id || null, // Vincular ao cliente
      clinicaId: clinicaId.value || 'demo',
      origem: 'profissional',
      status: 'analisada',
      dataCriacao: serverTimestamp()
    }

    console.log('Dados da anamnese a serem salvos:', dadosAnamnese)

    const docRef = await addDoc(collection(db, 'anamneses'), dadosAnamnese)
    console.log('✅ Anamnese salva com sucesso! ID:', docRef.id)

    // 4. Atualizar dados do cliente com informações da anamnese
    console.log('--- Etapa 4: Atualizar Cliente ---')
    if (cliente?.id) {
      console.log('Atualizando cliente ID:', cliente.id)
      try {
        await atualizarCliente(cliente.id, {
          email: formulario.value.email || cliente.email,
          dataNascimento: formulario.value.dataNascimento || cliente.dataNascimento,
          cpf: formulario.value.cpf || cliente.cpf,
          endereco: formulario.value.endereco || cliente.endereco,
          fotoURL: fotoURL || cliente.fotoURL
        })
        // Incrementar contador de anamneses
        await incrementarAnamnese(cliente.id)
        console.log('✅ Cliente atualizado com sucesso')
      } catch (updateError) {
        console.error('Erro ao atualizar cliente:', updateError)
        // Continua mesmo se falhar atualização
      }
    } else {
      console.warn('Cliente não tem ID, pulando atualização')
    }

    console.log('=== SALVAMENTO CONCLUÍDO COM SUCESSO ===')
    success.value = 'Anamnese salva com sucesso! Cliente cadastrado/atualizado automaticamente.'
    
    setTimeout(() => {
      router.push('/lista')
    }, 1500)

  } catch (err) {
    console.error('❌ ERRO AO SALVAR ANAMNESE:', err)
    console.error('Tipo do erro:', err.name)
    console.error('Mensagem:', err.message)
    console.error('Stack:', err.stack)
    error.value = `Erro ao salvar anamnese: ${err.message}. Verifique o console para mais detalhes.`
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-content h1 {
  font-size: 28px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
