<template>
  <div class="container">
    <div v-if="carregando" class="loading">
      Carregando detalhes...
    </div>

    <div v-else-if="anamnese" class="card">
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Ficha de Anamnese</h1>
            <div class="status-badges">
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
          <div class="header-actions">
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
            <VoltarHome />
            <router-link to="/lista">
              <button class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i>
                Voltar
              </button>
            </router-link>
          </div>
        </div>
      </div>

          <!-- Dados Principais -->
          <div class="dados-principais">
            <div class="cliente-header">
              <div class="foto-cliente">
                <img 
                  v-if="anamnese.fotoURL" 
                  :src="anamnese.fotoURL" 
                  :alt="anamnese.nome"
                  class="foto-img"
                >
                <div v-else class="foto-placeholder">
                  <i class="fas fa-user"></i>
                </div>
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

    <!-- Seção de Observações -->
    <div v-if="anamnese" class="card observacoes-section">
      <div class="observacoes-header">
        <h2><i class="fas fa-sticky-note"></i> Observações e Alterações</h2>
        <button @click="abrirModalObservacao" class="btn btn-primary btn-small">
          <i class="fas fa-plus"></i> Adicionar Observação
        </button>
      </div>

      <div v-if="observacoes.length === 0" class="empty-observacoes">
        <i class="fas fa-sticky-note"></i>
        <p>Nenhuma observação registrada</p>
      </div>

      <div v-else class="observacoes-list">
        <div v-for="obs in observacoes" :key="obs.id" class="observacao-item">
          <div class="observacao-header">
            <div class="observacao-info">
              <span class="observacao-data">{{ formatarData(obs.dataCriacao) }}</span>
              <span class="observacao-tipo" :class="obs.tipo">{{ obs.tipo }}</span>
            </div>
            <button @click="editarObservacao(obs)" class="btn-icon btn-edit" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
          </div>
          <div class="observacao-conteudo">
            <p>{{ obs.conteudo }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Observação -->
    <div v-if="modalObservacao" class="modal-overlay" @click.self="fecharModalObservacao">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-sticky-note"></i> {{ observacaoEditando ? 'Editar' : 'Nova' }} Observação</h2>
          <button @click="fecharModalObservacao" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="salvarObservacao">
          <div class="form-group">
            <label>Tipo *</label>
            <select v-model="formObservacao.tipo" required>
              <option value="observacao">Observação</option>
              <option value="alteracao">Alteração</option>
              <option value="lembrete">Lembrete</option>
              <option value="contato">Contato</option>
            </select>
          </div>
          <div class="form-group">
            <label>Conteúdo *</label>
            <textarea 
              v-model="formObservacao.conteudo" 
              required 
              rows="4" 
              placeholder="Digite sua observação..."
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="fecharModalObservacao" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="salvando">
              <i v-if="!salvando" class="fas fa-save"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../firebase.js'
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import VoltarHome from '../components/VoltarHome.vue'
import { useClinica } from '../composables/useClinica.js'

const { clinicaId } = useClinica()

const route = useRoute()
const anamnese = ref(null)
const carregando = ref(true)
const atualizando = ref(false)

// Observações
const observacoes = ref([])
const modalObservacao = ref(false)
const observacaoEditando = ref(null)
const salvando = ref(false)
const formObservacao = ref({
  tipo: 'observacao',
  conteudo: ''
})

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

const formatarData = (timestamp) => {
  if (!timestamp) return ''
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR')
}

// Funções de observações
const carregarObservacoes = async () => {
  try {
    const q = query(
      collection(db, 'observacoes_anamnese'),
      where('anamneseId', '==', route.params.id),
      orderBy('dataCriacao', 'desc')
    )
    const snapshot = await getDocs(q)
    observacoes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error('Erro ao carregar observações:', err)
  }
}

const abrirModalObservacao = () => {
  modalObservacao.value = true
  observacaoEditando.value = null
  formObservacao.value = {
    tipo: 'observacao',
    conteudo: ''
  }
}

const fecharModalObservacao = () => {
  modalObservacao.value = false
  observacaoEditando.value = null
  formObservacao.value = {
    tipo: 'observacao',
    conteudo: ''
  }
}

const editarObservacao = (obs) => {
  observacaoEditando.value = obs
  formObservacao.value = {
    tipo: obs.tipo,
    conteudo: obs.conteudo
  }
  modalObservacao.value = true
}

const salvarObservacao = async () => {
  try {
    salvando.value = true
    
    const dadosObservacao = {
      anamneseId: route.params.id,
      clinicaId: clinicaId.value || 'demo',
      tipo: formObservacao.value.tipo,
      conteudo: formObservacao.value.conteudo,
      dataCriacao: serverTimestamp()
    }

    if (observacaoEditando.value) {
      // Editar observação existente
      const docRef = doc(db, 'observacoes_anamnese', observacaoEditando.value.id)
      await updateDoc(docRef, {
        tipo: formObservacao.value.tipo,
        conteudo: formObservacao.value.conteudo,
        dataAtualizacao: serverTimestamp()
      })
    } else {
      // Nova observação
      await addDoc(collection(db, 'observacoes_anamnese'), dadosObservacao)
    }

    await carregarObservacoes()
    fecharModalObservacao()
    
  } catch (err) {
    console.error('Erro ao salvar observação:', err)
    alert('Erro ao salvar observação. Tente novamente.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  await carregarAnamnese()
  await carregarObservacoes()
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

/* Header */
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-info h1 {
  font-size: 28px;
  color: #1d1d1f;
  margin: 0;
}

.status-badges {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Dados Principais */
.dados-principais {
  margin-bottom: 30px;
}

.cliente-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.foto-cliente {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(29, 29, 31, 0.2);
}

.foto-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.foto-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1d1d1f 0%, #2c2c2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}

/* Observações */
.observacoes-section {
  margin-top: 30px;
}

.observacoes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.observacoes-header h2 {
  font-size: 20px;
  color: #1d1d1f;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-observacoes {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.empty-observacoes i {
  font-size: 48px;
  margin-bottom: 16px;
}

.observacoes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.observacao-item {
  background: #f8f9fa;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  padding: 16px;
}

.observacao-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.observacao-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.observacao-data {
  font-size: 12px;
  color: #6e6e73;
}

.observacao-tipo {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.observacao-tipo.observacao {
  background: #e3f2fd;
  color: #1976d2;
}

.observacao-tipo.alteracao {
  background: #fff3e0;
  color: #f57c00;
}

.observacao-tipo.lembrete {
  background: #f3e5f5;
  color: #7b1fa2;
}

.observacao-tipo.contato {
  background: #e8f5e8;
  color: #388e3c;
}

.observacao-conteudo p {
  margin: 0;
  line-height: 1.5;
  color: #1d1d1f;
}

/* Modal */
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

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e5ea;
}

.modal-header h2 {
  font-size: 18px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #6e6e73;
  cursor: pointer;
  padding: 4px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #1d1d1f;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid #e5e5ea;
}

.btn-small {
  padding: 8px 16px;
  font-size: 14px;
}
</style>


