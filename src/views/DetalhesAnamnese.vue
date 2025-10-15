<template>
  <div class="container">
    <div v-if="carregando" class="loading">
      Carregando detalhes...
    </div>

    <div v-else-if="anamnese" class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <div>
          <h1>Ficha de Anamnese</h1>
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <span 
              :class="['status-badge', anamnese.status]"
              :title="anamnese.status === 'pendente' ? 'Aguardando análise' : 'Já analisada'"
            >
              <i :class="anamnese.status === 'pendente' ? 'fas fa-clock' : 'fas fa-check-circle'"></i>
              {{ anamnese.status === 'pendente' ? 'Pendente' : 'Analisada' }}
            </span>
            <span 
              class="origem-badge"
              :title="anamnese.origem === 'cliente' ? 'Preenchida pelo cliente' : 'Preenchida pela profissional'"
            >
              <i :class="anamnese.origem === 'cliente' ? 'fas fa-user' : 'fas fa-user-md'"></i>
              {{ anamnese.origem === 'cliente' ? 'Cliente' : 'Profissional' }}
            </span>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button 
            v-if="anamnese.status === 'pendente'"
            @click="marcarComoAnalisada"
            class="btn btn-primary"
            :disabled="atualizando"
          >
            <i v-if="!atualizando" class="fas fa-check-circle"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ atualizando ? 'Atualizando...' : 'Marcar como Analisada' }}
          </button>
        <router-link to="/lista">
          <button class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i>
            Voltar
          </button>
        </router-link>
        </div>
      </div>

          <!-- Dados Principais -->
          <div style="margin-bottom: 30px;">
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
              <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #1d1d1f 0%, #2c2c2e 100%); display: flex; align-items: center; justify-content: center; font-size: 32px; color: white; box-shadow: 0 4px 12px rgba(29, 29, 31, 0.2);">
                <i class="fas fa-user"></i>
              </div>
              <div>
                <h2 style="margin: 0; font-size: 28px; font-weight: 700;"><i class="fas fa-user"></i> {{ anamnese.nome }}</h2>
                <p style="color: #8e8e93; font-size: 16px; margin: 4px 0 0 0;">Dados do Paciente</p>
              </div>
            </div>
            
            <div style="display: grid; gap: 12px; background: rgba(29, 29, 31, 0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #1d1d1f;">
              <p><strong><i class="fas fa-calendar"></i> Data de Nascimento:</strong> {{ formatarData(anamnese.dataNascimento) }}</p>
              <p v-if="anamnese.cpf"><strong><i class="fas fa-id-card"></i> CPF:</strong> {{ anamnese.cpf }}</p>
              <p><strong><i class="fas fa-phone"></i> Telefone:</strong> {{ anamnese.telefone }}</p>
              <p v-if="anamnese.email"><strong><i class="fas fa-envelope"></i> Email:</strong> {{ anamnese.email }}</p>
              <p v-if="anamnese.endereco"><strong><i class="fas fa-map-marker-alt"></i> Endereço:</strong> {{ anamnese.endereco }}</p>
            </div>
          </div>

      <!-- Histórico Médico -->
      <section v-if="anamnese.doencas || anamnese.medicamentos || anamnese.alergias || anamnese.gestante || anamnese.lactante || anamnese.fumante">
        <h2><i class="fas fa-hospital"></i> Histórico Médico</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p v-if="anamnese.doencas"><strong>Doenças:</strong> {{ anamnese.doencas }}</p>
          <p v-if="anamnese.medicamentos"><strong>Medicamentos:</strong> {{ anamnese.medicamentos }}</p>
          <p v-if="anamnese.alergias"><strong>Alergias:</strong> {{ anamnese.alergias }}</p>
          <div v-if="anamnese.gestante || anamnese.lactante || anamnese.fumante" style="margin-top: 10px;">
            <strong>Condições:</strong>
            <span v-if="anamnese.gestante"> ✓ Gestante</span>
            <span v-if="anamnese.lactante"> ✓ Lactante</span>
            <span v-if="anamnese.fumante"> ✓ Fumante</span>
          </div>
        </div>
      </section>

      <!-- Hábitos e Estilo de Vida -->
      <section v-if="anamnese.exercicios || anamnese.ingestaoAgua || anamnese.sono || anamnese.alimentacao">
        <h2><i class="fas fa-heart"></i> Hábitos e Estilo de Vida</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p v-if="anamnese.exercicios"><strong>Exercícios físicos:</strong> {{ anamnese.exercicios }}</p>
          <p v-if="anamnese.ingestaoAgua"><strong>Ingestão de água:</strong> {{ anamnese.ingestaoAgua }}</p>
          <p v-if="anamnese.sono"><strong>Qualidade do sono:</strong> {{ anamnese.sono }}</p>
          <p v-if="anamnese.alimentacao"><strong>Alimentação:</strong> {{ anamnese.alimentacao }}</p>
        </div>
      </section>

      <!-- Cuidados com a Pele -->
      <section v-if="anamnese.tipoPele || anamnese.protetorSolar || anamnese.exposicaoSol || anamnese.produtosCosmeticos">
        <h2><i class="fas fa-spa"></i> Cuidados com a Pele</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p v-if="anamnese.tipoPele"><strong>Tipo de pele:</strong> {{ anamnese.tipoPele }}</p>
          <p v-if="anamnese.protetorSolar"><strong>Uso de protetor solar:</strong> {{ anamnese.protetorSolar }}</p>
          <p v-if="anamnese.exposicaoSol"><strong>Exposição ao sol:</strong> {{ anamnese.exposicaoSol }}</p>
          <p v-if="anamnese.produtosCosmeticos"><strong>Produtos cosméticos:</strong> {{ anamnese.produtosCosmeticos }}</p>
        </div>
      </section>

      <!-- Objetivos do Tratamento -->
      <section>
        <h2><i class="fas fa-bullseye"></i> Objetivos do Tratamento</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p v-if="anamnese.objetivos"><strong>Objetivos:</strong> {{ anamnese.objetivos }}</p>
          <p v-if="anamnese.procedimentosAnteriores"><strong>Procedimentos anteriores:</strong> {{ anamnese.procedimentosAnteriores }}</p>
        </div>
      </section>

      <!-- Observações -->
      <section v-if="anamnese.observacoes">
        <h2><i class="fas fa-sticky-note"></i> Observações Adicionais</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p>{{ anamnese.observacoes }}</p>
        </div>
      </section>

      <!-- Data de Criação -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <p><strong>Data de cadastro:</strong> {{ formatarDataCriacao(anamnese.dataCriacao) }}</p>
      </div>
    </div>

    <div v-else class="card">
      <p>Anamnese não encontrada.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../firebase.js'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

const route = useRoute()
const anamnese = ref(null)
const carregando = ref(true)
const atualizando = ref(false)

const carregarAnamnese = async () => {
  try {
    const docRef = doc(db, 'anamneses', route.params.id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      anamnese.value = { id: docSnap.id, ...docSnap.data() }
    }
  } catch (err) {
    console.error('Erro ao carregar:', err)
  } finally {
    carregando.value = false
  }
}

const formatarData = (data) => {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR')
}

const marcarComoAnalisada = async () => {
  try {
    atualizando.value = true
    
    const docRef = doc(db, 'anamneses', route.params.id)
    await updateDoc(docRef, {
      status: 'analisada',
      dataAnalise: serverTimestamp()
    })
    
    // Atualizar o estado local
    anamnese.value.status = 'analisada'
    anamnese.value.dataAnalise = new Date()
    
  } catch (err) {
    console.error('Erro ao atualizar:', err)
    alert('Erro ao marcar como analisada. Tente novamente.')
  } finally {
    atualizando.value = false
  }
}

const formatarDataCriacao = (timestamp) => {
  if (!timestamp) return ''
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR')
}

onMounted(() => {
  carregarAnamnese()
})
</script>

<style scoped>
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pendente {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.analisada {
  background-color: #d1fae5;
  color: #065f46;
}

.origem-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  background-color: #e5e7eb;
  color: #374151;
}
</style>


