<template>
  <div class="container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-star"></i> Avaliações de Clientes</h1>
        <div class="header-actions">
          <button @click="voltarHome" class="btn-secondary">
            <i class="fas fa-home"></i> Voltar
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboard NPS -->
    <div class="nps-dashboard">
      <div class="nps-card principal">
        <div class="nps-header">
          <h2><i class="fas fa-chart-line"></i> Net Promoter Score (NPS)</h2>
        </div>
        <div class="nps-score" :class="getNPSClass(npsScore)">
          <span class="nps-value">{{ npsScore }}</span>
          <span class="nps-label">{{ getNPSLabel(npsScore) }}</span>
        </div>
        <div class="nps-breakdown">
          <div class="breakdown-item promotores">
            <i class="fas fa-smile"></i>
            <span class="label">Promotores</span>
            <span class="value">{{ estatisticas?.promotores || 0 }}</span>
          </div>
          <div class="breakdown-item neutros">
            <i class="fas fa-meh"></i>
            <span class="label">Neutros</span>
            <span class="value">{{ estatisticas?.neutros || 0 }}</span>
          </div>
          <div class="breakdown-item detratores">
            <i class="fas fa-frown"></i>
            <span class="label">Detratores</span>
            <span class="value">{{ estatisticas?.detratores || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Média Geral</span>
            <span class="stat-value">{{ formatarNota(mediaGeral) }} <i class="fas fa-star small"></i></span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-comments"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total de Avaliações</span>
            <span class="stat-value">{{ estatisticas?.total || 0 }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-reply"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Respondidas</span>
            <span class="stat-value">{{ estatisticas?.respondidas || 0 }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Pendentes</span>
            <span class="stat-value">{{ estatisticas?.pendentes || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Médias por Aspecto -->
    <div class="card" v-if="mediasAspectos">
      <h2><i class="fas fa-chart-bar"></i> Avaliação por Aspecto</h2>
      <div class="aspectos-grid">
        <div class="aspecto-card">
          <div class="aspecto-header">
            <i class="fas fa-hand-holding-heart"></i>
            <span>Atendimento</span>
          </div>
          <div class="aspecto-nota">
            <span class="nota">{{ formatarNota(mediasAspectos.atendimento) }}</span>
            <div class="estrelas">
              <i v-for="n in 5" :key="n" :class="['fas fa-star', { active: n <= mediasAspectos.atendimento }]"></i>
            </div>
          </div>
        </div>

        <div class="aspecto-card">
          <div class="aspecto-header">
            <i class="fas fa-building"></i>
            <span>Ambiente</span>
          </div>
          <div class="aspecto-nota">
            <span class="nota">{{ formatarNota(mediasAspectos.ambiente) }}</span>
            <div class="estrelas">
              <i v-for="n in 5" :key="n" :class="['fas fa-star', { active: n <= mediasAspectos.ambiente }]"></i>
            </div>
          </div>
        </div>

        <div class="aspecto-card">
          <div class="aspecto-header">
            <i class="fas fa-check-circle"></i>
            <span>Resultado</span>
          </div>
          <div class="aspecto-nota">
            <span class="nota">{{ formatarNota(mediasAspectos.resultado) }}</span>
            <div class="estrelas">
              <i v-for="n in 5" :key="n" :class="['fas fa-star', { active: n <= mediasAspectos.resultado }]"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card">
      <div class="filtros">
        <div class="filtro-grupo">
          <label>Filtrar por Nota</label>
          <select v-model="filtroNota" @change="aplicarFiltros">
            <option value="">Todas</option>
            <option value="5">5 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="2">2 estrelas</option>
            <option value="1">1 estrela</option>
          </select>
        </div>

        <div class="filtro-grupo">
          <label>Status</label>
          <select v-model="filtroStatus" @change="aplicarFiltros">
            <option value="">Todas</option>
            <option value="pendente">Não respondidas</option>
            <option value="respondida">Respondidas</option>
          </select>
        </div>

        <div class="filtro-grupo">
          <button @click="limparFiltros" class="btn-secondary">
            <i class="fas fa-eraser"></i> Limpar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de Avaliações -->
    <div class="card">
      <div class="card-header">
        <h2>Avaliações Recebidas ({{ avaliacoesFiltradas.length }})</h2>
      </div>

      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>

      <div v-else-if="avaliacoesFiltradas.length === 0" class="empty-state">
        <i class="fas fa-star"></i>
        <p>Nenhuma avaliação encontrada</p>
      </div>

      <div v-else class="avaliacoes-list">
        <div 
          v-for="avaliacao in avaliacoesPaginadas" 
          :key="avaliacao.id"
          class="avaliacao-card"
          :class="{ respondida: avaliacao.respondido }"
        >
          <div class="avaliacao-header">
            <div class="cliente-info">
              <div class="avatar">
                <i class="fas fa-user"></i>
              </div>
              <div>
                <h3>{{ avaliacao.clienteNome }}</h3>
                <p class="procedimento">{{ avaliacao.procedimentoNome }}</p>
              </div>
            </div>

            <div class="nota-geral">
              <div class="estrelas-display">
                <i v-for="n in 5" :key="n" :class="['fas fa-star', { active: n <= avaliacao.nota }]"></i>
              </div>
              <span class="data">{{ formatarData(avaliacao.data) }}</span>
            </div>
          </div>

          <div class="avaliacao-aspectos" v-if="avaliacao.aspectos">
            <div class="aspecto-mini">
              <span class="label"><i class="fas fa-hand-holding-heart"></i> Atendimento:</span>
              <span class="mini-estrelas">
                <i v-for="n in 5" :key="n" :class="['fas fa-star', { active: n <= avaliacao.aspectos.atendimento }]"></i>
              </span>
            </div>
            <div class="aspecto-mini">
              <span class="label"><i class="fas fa-building"></i> Ambiente:</span>
              <span class="mini-estrelas">
                <i v-for="n in 5" :key="n" :class="['fas fa-star', { active: n <= avaliacao.aspectos.ambiente }]"></i>
              </span>
            </div>
            <div class="aspecto-mini">
              <span class="label"><i class="fas fa-check-circle"></i> Resultado:</span>
              <span class="mini-estrelas">
                <i v-for="n in 5" :key="n" :class="['fas fa-star', { active: n <= avaliacao.aspectos.resultado }]"></i>
              </span>
            </div>
          </div>

          <div class="avaliacao-comentario" v-if="avaliacao.comentario">
            <i class="fas fa-quote-left"></i>
            <p>{{ avaliacao.comentario }}</p>
          </div>

          <div class="avaliacao-recomendacao" v-if="avaliacao.recomendaria !== undefined">
            <i :class="['fas', avaliacao.recomendaria ? 'fa-thumbs-up positivo' : 'fa-thumbs-down negativo']"></i>
            <span>{{ avaliacao.recomendaria ? 'Recomendaria a clínica' : 'Não recomendaria a clínica' }}</span>
          </div>

          <div class="avaliacao-resposta" v-if="avaliacao.respondido">
            <div class="resposta-header">
              <i class="fas fa-reply"></i>
              <span>Resposta da clínica</span>
              <span class="data">{{ formatarData(avaliacao.dataResposta) }}</span>
            </div>
            <p>{{ avaliacao.respostaClinica }}</p>
          </div>

          <div class="avaliacao-actions">
            <button 
              v-if="!avaliacao.respondido"
              @click="responder(avaliacao)" 
              class="btn-responder"
            >
              <i class="fas fa-reply"></i> Responder
            </button>
            <button 
              v-else
              @click="editarResposta(avaliacao)" 
              class="btn-secondary small"
            >
              <i class="fas fa-edit"></i> Editar Resposta
            </button>
          </div>
        </div>
      </div>

      <!-- Paginação -->
      <Paginacao
        v-if="avaliacoesFiltradas.length > 0"
        :itens-por-pagina="itensPorPagina"
        :total-itens="avaliacoesFiltradas.length"
        @pagina-alterada="mudarPagina"
      />
    </div>

    <!-- Modal Responder -->
    <div v-if="modalResposta" class="modal-overlay" @click="fecharModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-reply"></i> Responder Avaliação</h2>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body" v-if="avaliacaoSelecionada">
          <div class="avaliacao-resumo">
            <h3>{{ avaliacaoSelecionada.clienteNome }}</h3>
            <div class="estrelas-display">
              <i v-for="n in 5" :key="n" :class="['fas fa-star', { active: n <= avaliacaoSelecionada.nota }]"></i>
            </div>
            <p class="comentario-resumo" v-if="avaliacaoSelecionada.comentario">
              "{{ avaliacaoSelecionada.comentario }}"
            </p>
          </div>

          <form @submit.prevent="salvarResposta">
            <div class="form-group">
              <label>Sua Resposta *</label>
              <textarea 
                v-model="respostaTexto" 
                rows="5"
                placeholder="Digite sua resposta ao cliente..."
                required
              ></textarea>
              <small class="helper-text">
                Seja cordial e profissional. Agradeça pelo feedback e, se necessário, ofereça soluções.
              </small>
            </div>

            <div class="form-actions">
              <button type="button" @click="fecharModal" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                <i class="fas fa-paper-plane"></i> Enviar Resposta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAvaliacoes } from '../composables/useAvaliacoes.js'
import { useAuth } from '../composables/useAuth.js'
import Paginacao from '../components/Paginacao.vue'

const router = useRouter()
const { 
  buscarAvaliacoes, 
  responderAvaliacao, 
  calcularNPS, 
  calcularMediaNotas,
  calcularMediaAspectos,
  calcularEstatisticas 
} = useAvaliacoes()
const { currentUser } = useAuth()

// Estado
const avaliacoes = ref([])
const estatisticas = ref(null)
const npsScore = ref(0)
const mediaGeral = ref(0)
const mediasAspectos = ref(null)
const carregando = ref(false)

// Modal
const modalResposta = ref(false)
const avaliacaoSelecionada = ref(null)
const respostaTexto = ref('')

// Filtros
const filtroNota = ref('')
const filtroStatus = ref('')

// Paginação
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

// Computed
const avaliacoesFiltradas = computed(() => {
  let filtradas = avaliacoes.value

  if (filtroNota.value) {
    filtradas = filtradas.filter(a => a.nota === parseInt(filtroNota.value))
  }

  if (filtroStatus.value === 'pendente') {
    filtradas = filtradas.filter(a => !a.respondido)
  } else if (filtroStatus.value === 'respondida') {
    filtradas = filtradas.filter(a => a.respondido)
  }

  return filtradas
})

const avaliacoesPaginadas = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina.value
  const fim = inicio + itensPorPagina.value
  return avaliacoesFiltradas.value.slice(inicio, fim)
})

// Métodos
const carregarAvaliacoes = async () => {
  carregando.value = true
  try {
    const resultado = await buscarAvaliacoes()
    
    if (resultado.success) {
      avaliacoes.value = resultado.data
      
      // Calcular métricas
      const nps = await calcularNPS()
      if (nps.success) {
        npsScore.value = nps.data
      }

      const media = await calcularMediaNotas()
      if (media.success) {
        mediaGeral.value = media.data
      }

      const aspectos = await calcularMediaAspectos()
      if (aspectos.success) {
        mediasAspectos.value = aspectos.data
      }

      const stats = await calcularEstatisticas()
      if (stats.success) {
        estatisticas.value = stats.data
      }
    }
  } catch (error) {
    console.error('Erro ao carregar avaliações:', error)
    alert('Erro ao carregar avaliações')
  } finally {
    carregando.value = false
  }
}

const aplicarFiltros = () => {
  paginaAtual.value = 1
}

const limparFiltros = () => {
  filtroNota.value = ''
  filtroStatus.value = ''
}

const mudarPagina = (novaPagina) => {
  paginaAtual.value = novaPagina
}

const responder = (avaliacao) => {
  avaliacaoSelecionada.value = avaliacao
  respostaTexto.value = ''
  modalResposta.value = true
}

const editarResposta = (avaliacao) => {
  avaliacaoSelecionada.value = avaliacao
  respostaTexto.value = avaliacao.respostaClinica
  modalResposta.value = true
}

const fecharModal = () => {
  modalResposta.value = false
  avaliacaoSelecionada.value = null
  respostaTexto.value = ''
}

const salvarResposta = async () => {
  if (!respostaTexto.value.trim()) {
    alert('Por favor, digite uma resposta')
    return
  }

  try {
    const resultado = await responderAvaliacao(
      avaliacaoSelecionada.value.id,
      respostaTexto.value,
      currentUser.value.uid
    )
    
    if (resultado.success) {
      alert('Resposta enviada com sucesso!')
      fecharModal()
      carregarAvaliacoes()
    } else {
      alert('Erro ao enviar resposta: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao salvar resposta:', error)
    alert('Erro ao salvar resposta')
  }
}

const voltarHome = () => {
  router.push('/')
}

// Helpers
const getNPSClass = (score) => {
  if (score >= 75) return 'excelente'
  if (score >= 50) return 'muito-bom'
  if (score >= 0) return 'bom'
  if (score >= -50) return 'ruim'
  return 'critico'
}

const getNPSLabel = (score) => {
  if (score >= 75) return 'Excelente'
  if (score >= 50) return 'Muito Bom'
  if (score >= 0) return 'Bom'
  if (score >= -50) return 'Ruim'
  return 'Crítico'
}

const formatarNota = (nota) => {
  if (!nota) return '0.0'
  return nota.toFixed(1)
}

const formatarData = (data) => {
  if (!data) return '-'
  const date = data.toDate ? data.toDate() : new Date(data)
  return date.toLocaleDateString('pt-BR')
}

// Lifecycle
onMounted(() => {
  carregarAvaliacoes()
})
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  font-size: 1.8rem;
  margin: 0;
}

/* NPS Dashboard */
.nps-dashboard {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.nps-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nps-header h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nps-score {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.nps-score.excelente {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.nps-score.muito-bom {
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  color: white;
}

.nps-score.bom {
  background: linear-gradient(135deg, #ffc107 0%, #ffeb3b 100%);
  color: #000;
}

.nps-score.ruim {
  background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
  color: white;
}

.nps-score.critico {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.nps-value {
  font-size: 4rem;
  font-weight: bold;
  display: block;
  line-height: 1;
}

.nps-label {
  font-size: 1.2rem;
  font-weight: 600;
  opacity: 0.9;
}

.nps-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8f9fa;
}

.breakdown-item i {
  font-size: 1.5rem;
}

.breakdown-item.promotores i {
  color: #28a745;
}

.breakdown-item.neutros i {
  color: #ffc107;
}

.breakdown-item.detratores i {
  color: #dc3545;
}

.breakdown-item .label {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.breakdown-item .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-value i.small {
  font-size: 1rem;
  color: #ffc107;
}

/* Card */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.card h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Aspectos */
.aspectos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.aspecto-card {
  text-align: center;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.2s;
}

.aspecto-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.aspecto-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.aspecto-header i {
  color: #667eea;
  font-size: 1.2rem;
}

.aspecto-nota .nota {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  display: block;
  margin-bottom: 0.5rem;
}

.estrelas {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.estrelas i {
  color: #ddd;
  font-size: 1rem;
}

.estrelas i.active {
  color: #ffc107;
}

/* Filtros */
.filtros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filtro-grupo label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.filtro-grupo select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

/* Lista de Avaliações */
.avaliacoes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.avaliacao-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  background: white;
  transition: all 0.2s;
}

.avaliacao-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avaliacao-card.respondida {
  background: #f8f9fa;
  border-left: 4px solid #28a745;
}

.avaliacao-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.cliente-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.cliente-info h3 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.procedimento {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.nota-geral {
  text-align: right;
}

.estrelas-display {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
  justify-content: flex-end;
}

.estrelas-display i {
  color: #ddd;
  font-size: 1.2rem;
}

.estrelas-display i.active {
  color: #ffc107;
}

.data {
  font-size: 0.875rem;
  color: #666;
}

.avaliacao-aspectos {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.aspecto-mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.aspecto-mini .label {
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.aspecto-mini i {
  color: #667eea;
}

.mini-estrelas {
  display: flex;
  gap: 0.125rem;
}

.mini-estrelas i {
  color: #ddd;
  font-size: 0.75rem;
}

.mini-estrelas i.active {
  color: #ffc107;
}

.avaliacao-comentario {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  position: relative;
}

.avaliacao-comentario i {
  position: absolute;
  top: 1rem;
  left: 1rem;
  color: #667eea;
  opacity: 0.3;
  font-size: 1.5rem;
}

.avaliacao-comentario p {
  margin: 0 0 0 2rem;
  color: #2c3e50;
  line-height: 1.6;
  font-style: italic;
}

.avaliacao-recomendacao {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.avaliacao-recomendacao i {
  font-size: 1.2rem;
}

.avaliacao-recomendacao i.positivo {
  color: #28a745;
}

.avaliacao-recomendacao i.negativo {
  color: #dc3545;
}

.avaliacao-resposta {
  background: #e7f3ff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #667eea;
}

.resposta-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #667eea;
}

.resposta-header .data {
  margin-left: auto;
  font-size: 0.875rem;
  font-weight: normal;
}

.avaliacao-resposta p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.6;
}

.avaliacao-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-responder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-responder:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary.small {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* Loading e Empty State */
.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
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
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.avaliacao-resumo {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.avaliacao-resumo h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.avaliacao-resumo .estrelas-display {
  justify-content: center;
  margin-bottom: 0.5rem;
}

.comentario-resumo {
  font-style: italic;
  color: #666;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.helper-text {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Responsivo */
@media (max-width: 1024px) {
  .nps-dashboard {
    grid-template-columns: 1fr;
  }

  .aspectos-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .avaliacao-header {
    flex-direction: column;
    gap: 1rem;
  }

  .nota-geral {
    text-align: left;
  }

  .avaliacao-aspectos {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

