<template>
  <div class="container">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-users"></i> Lista de Pacientes</h1>
        <div class="header-actions">
          <VoltarHome />
          <router-link to="/nova">
            <button class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Nova Anamnese
            </button>
          </router-link>
        </div>
      </div>
    </div>

    <div class="card">
      <!-- Filtros -->
      <Filtros 
        :opcoes="opcoesFiltros"
        @filtros-alterados="aplicarFiltros"
      />

      <!-- Loading -->
      <div v-if="carregando" class="loading">
        Carregando pacientes...
      </div>

          <!-- Lista de Anamneses Agrupadas -->
          <div v-else-if="anamnesesAgrupadas.length > 0">
            <div
              v-for="grupo in anamnesesAgrupadas"
              :key="`${grupo.paciente.nome}-${grupo.paciente.telefone}`"
              class="patient-group"
            >
              <!-- Cabeçalho do Paciente -->
              <div class="patient-header">
                <div style="display: flex; align-items: center; gap: 20px;">
                  <div class="patient-avatar">
                    <img 
                      v-if="grupo.paciente.fotoURL" 
                      :src="grupo.paciente.fotoURL" 
                      :alt="grupo.paciente.nome"
                      class="avatar-image"
                      @error="handleImageError"
                    >
                    <i v-else class="fas fa-user avatar-icon"></i>
                  </div>

                  <div style="flex: 1;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 600;">{{ grupo.paciente.nome }}</h3>
                    <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">
                      <i class="fas fa-phone"></i> {{ grupo.paciente.telefone }}
                      <span v-if="grupo.paciente.email"> • <i class="fas fa-envelope"></i> {{ grupo.paciente.email }}</span>
                    </p>
                    <div style="display: flex; gap: 8px; margin-top: 8px; align-items: center;">
                      <span class="anamnese-count">
                        <i class="fas fa-file-medical"></i>
                        {{ grupo.anamneses.length }} anamnese{{ grupo.anamneses.length > 1 ? 's' : '' }}
                      </span>
                      <span v-if="grupo.anamneses.some(a => a.status === 'pendente')" class="pending-indicator">
                        <i class="fas fa-clock"></i>
                        Pendente
                      </span>
                      <button @click="editarPaciente(grupo.paciente)" class="btn btn-sm btn-outline">
                        <i class="fas fa-edit"></i> Editar Cliente
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lista de Anamneses do Paciente -->
              <div class="anamneses-list">
                <div
                  v-for="(anamnese, index) in grupo.anamneses"
                  :key="anamnese.id"
                  class="anamnese-item"
                  @click="verDetalhes(anamnese.id)"
                >
                  <div style="display: flex; align-items: center; gap: 16px; padding: 12px 0;">
                    <div style="display: flex; align-items: center; gap: 12px;">
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
                      <span v-if="index === 0" class="latest-badge">
                        <i class="fas fa-star"></i>
                        Mais Recente
                      </span>
                    </div>
                    
                    <div style="flex: 1; text-align: right; color: #9ca3af; font-size: 12px;">
                      {{ formatarDataCriacao(anamnese.dataCriacao) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </div>

      <!-- Nenhum resultado -->
      <div v-else style="text-align: center; padding: 40px; color: #9ca3af;">
        <i class="fas fa-user-slash" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>Nenhum paciente encontrado</p>
      </div>

      <!-- Paginação -->
      <Paginacao
        :pagina-atual="paginaAtual"
        :total-paginas="totalPaginas"
        :total-itens="totalItens"
        :itens-por-pagina="itensPorPagina"
        :tem-pagina-anterior="temPaginaAnterior"
        :tem-proxima-pagina="temProximaPagina"
        :paginas-visiveis="paginasVisiveis"
        @ir-para-pagina="irParaPagina"
        @proxima-pagina="proximaPagina"
        @pagina-anterior="paginaAnterior"
        @primeira-pagina="primeiraPagina"
        @ultima-pagina="ultimaPagina"
        @alterar-itens-por-pagina="alterarItensPorPagina"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase.js'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { useClinica } from '../composables/useClinica.js'
import { usePaginacao } from '../composables/usePaginacao.js'
import { useFiltros } from '../composables/useFiltros.js'
import VoltarHome from '../components/VoltarHome.vue'
import Filtros from '../components/Filtros.vue'
import Paginacao from '../components/Paginacao.vue'

const router = useRouter()
const { clinicaId } = useClinica()
const anamneses = ref([])
const carregando = ref(true)

// Paginação
const {
  paginaAtual,
  totalItens,
  itensPorPagina,
  totalPaginas,
  temPaginaAnterior,
  temProximaPagina,
  itensVisiveis,
  paginasVisiveis,
  irParaPagina,
  proximaPagina,
  paginaAnterior,
  primeiraPagina,
  ultimaPagina,
  atualizarTotalItens,
  alterarItensPorPagina
} = usePaginacao(10)

// Filtros
const {
  filtros,
  aplicarFiltros: aplicarFiltrosComposable
} = useFiltros()

// Opções para os filtros
const opcoesFiltros = {
  status: [
    { value: 'pendente', label: 'Pendente' },
    { value: 'analisada', label: 'Analisada' }
  ],
  categorias: ['cliente', 'profissional'],
  data: true,
  ordenacao: [
    { value: 'nome', label: 'Nome' },
    { value: 'dataCriacao', label: 'Data de Criação' },
    { value: 'status', label: 'Status' }
  ]
}

const anamnesesFiltradas = computed(() => {
  return aplicarFiltrosComposable(anamneses.value, ['nome', 'telefone', 'cpf'])
})

const anamnesesPaginadas = computed(() => {
  const { inicio, fim } = itensVisiveis.value
  return anamnesesFiltradas.value.slice(inicio, fim)
})

// Agrupar anamneses por paciente
const anamnesesAgrupadas = computed(() => {
  const grupos = {}
  
  anamnesesPaginadas.value.forEach(anamnese => {
    const chave = `${anamnese.nome}-${anamnese.telefone}`
    
    if (!grupos[chave]) {
      grupos[chave] = {
        paciente: {
          nome: anamnese.nome,
          telefone: anamnese.telefone,
          email: anamnese.email,
          fotoURL: anamnese.fotoURL
        },
        anamneses: []
      }
    }
    
    grupos[chave].anamneses.push(anamnese)
  })
  
  // Ordenar anamneses de cada paciente por data (mais recente primeiro)
  Object.values(grupos).forEach(grupo => {
    grupo.anamneses.sort((a, b) => {
      const dataA = a.dataCriacao?.toDate ? a.dataCriacao.toDate() : new Date(a.dataCriacao)
      const dataB = b.dataCriacao?.toDate ? b.dataCriacao.toDate() : new Date(b.dataCriacao)
      return dataB - dataA
    })
  })
  
  return Object.values(grupos)
})

// Função para aplicar filtros
const aplicarFiltros = (novosFiltros) => {
  // Atualizar total de itens quando filtros mudarem
  atualizarTotalItens(anamnesesFiltradas.value.length)
}

const carregarAnamneses = async () => {
  try {
    console.log('Carregando anamneses para clinicaId:', clinicaId.value)
    
    if (!clinicaId.value) {
      console.warn('clinicaId não definido')
      return
    }
    
    // Consulta simples sem orderBy primeiro (para evitar problemas de índice)
    const q = query(
      collection(db, 'anamneses'),
      where('clinicaId', '==', clinicaId.value)
    )
    const querySnapshot = await getDocs(q)
    
    console.log('Anamneses encontradas para clinicaId', clinicaId.value, ':', querySnapshot.size)
    
    anamneses.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Ordenar manualmente por data
    anamneses.value.sort((a, b) => {
      const dataA = a.dataCriacao?.toDate ? a.dataCriacao.toDate() : new Date(a.dataCriacao)
      const dataB = b.dataCriacao?.toDate ? b.dataCriacao.toDate() : new Date(b.dataCriacao)
      return dataB - dataA
    })
    
    console.log('Anamneses carregadas e ordenadas:', anamneses.value.length)
  } catch (err) {
    console.error('Erro ao carregar anamneses:', err)
  } finally {
    carregando.value = false
  }
}

const verDetalhes = (id) => {
  router.push(`/detalhes/${id}`)
}

const formatarData = (data) => {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR')
}

const formatarDataCriacao = (timestamp) => {
  if (!timestamp) return ''
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR')
}

const handleImageError = (event) => {
  // Se a imagem falhar ao carregar, esconder a img e mostrar o ícone
  event.target.style.display = 'none'
  const avatar = event.target.parentElement
  const icon = avatar.querySelector('.avatar-icon')
  if (icon) {
    icon.style.display = 'flex'
  }
}

const editarPaciente = (paciente) => {
  // Redirecionar para página de edição do paciente
  router.push(`/editar-paciente/${paciente.id}`)
}

onMounted(async () => {
  await carregarAnamneses()
  // Inicializar paginação com o total de itens
  atualizarTotalItens(anamnesesFiltradas.value.length)
})
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

.status-badge {
  padding: 2px 6px;
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
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  background-color: #e5e7eb;
  color: #374151;
}

/* Filtros responsivos */
.filters-container {
  margin-bottom: 20px;
}

.search-group {
  margin-bottom: 16px;
}

.search-input {
  font-size: 16px; /* Previne zoom no iOS */
}

.filters-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 150px;
}

.filter-select {
  font-size: 16px; /* Previne zoom no iOS */
}

/* Mobile filters */
@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .search-input,
  .filter-select {
    padding: 14px 16px;
    font-size: 16px;
  }
}

/* Lista mobile */
@media (max-width: 768px) {
  .list-item {
    padding: 16px;
  }
  
  .list-item > div {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .list-item img,
  .list-item > div > div:first-child {
    width: 50px;
    height: 50px;
    align-self: center;
  }
  
  .list-item h3 {
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  .list-item p {
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .status-badge,
  .origem-badge {
    font-size: 11px;
    padding: 3px 6px;
  }
}

/* Estilos para agrupamento de pacientes */
.patient-group {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 18px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.patient-group:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.patient-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d1d1f 0%, #2c2c2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  box-shadow: 0 2px 8px rgba(29, 29, 31, 0.2);
  overflow: hidden;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.patient-header {
  padding: 20px 24px;
  background: rgba(29, 29, 31, 0.03);
  border-bottom: 1px solid rgba(29, 29, 31, 0.08);
}

.anamneses-list {
  padding: 0 24px 16px 24px;
}

.anamnese-item {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.anamnese-item:hover {
  background: rgba(29, 29, 31, 0.05);
  border-left-color: #1d1d1f;
}

.anamnese-item:not(:last-child) {
  border-bottom: 1px solid rgba(29, 29, 31, 0.08);
  margin-bottom: 8px;
  padding-bottom: 16px;
}

.anamnese-count {
  background: rgba(29, 29, 31, 0.1);
  color: #1d1d1f;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pending-indicator {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.latest-badge {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Mobile styles para agrupamento */
@media (max-width: 768px) {
  .patient-header {
    padding: 16px 20px;
  }
  
  .anamneses-list {
    padding: 0 20px 12px 20px;
  }
  
  .patient-header > div {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .patient-header img,
  .patient-header > div > div:first-child {
    width: 50px;
    height: 50px;
    align-self: center;
  }
  
  .anamnese-item {
    padding: 8px 0;
  }
  
  .anamnese-item > div {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}

.btn-outline {
  background: transparent;
  border: 1px solid #007bff;
  color: #007bff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}
</style>


