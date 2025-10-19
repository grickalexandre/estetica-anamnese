<template>
  <div class="filtros-container">
    <div class="filtros-header">
      <h3><i class="fas fa-filter"></i> Filtros</h3>
      <button 
        v-if="temFiltrosAtivos" 
        @click="limparFiltros" 
        class="btn-limpar-filtros"
      >
        <i class="fas fa-times"></i> Limpar Filtros
      </button>
    </div>

    <div class="filtros-grid">
      <!-- Busca -->
      <div class="filtro-item">
        <label>Buscar</label>
        <div class="input-with-icon">
          <i class="fas fa-search"></i>
          <input 
            v-model="filtros.busca"
            type="text" 
            placeholder="Digite para buscar..."
            class="input-busca"
          >
        </div>
      </div>

      <!-- Status -->
      <div v-if="opcoes.status" class="filtro-item">
        <label>Status</label>
        <select v-model="filtros.status" class="select-filtro">
          <option value="">Todos</option>
          <option v-for="opcao in opcoes.status" :key="opcao.value" :value="opcao.value">
            {{ opcao.label }}
          </option>
        </select>
      </div>

      <!-- Categoria -->
      <div v-if="opcoes.categorias" class="filtro-item">
        <label>Categoria</label>
        <select v-model="filtros.categoria" class="select-filtro">
          <option value="">Todas</option>
          <option v-for="categoria in opcoes.categorias" :key="categoria" :value="categoria">
            {{ categoria }}
          </option>
        </select>
      </div>

      <!-- Data Início -->
      <div v-if="opcoes.data" class="filtro-item">
        <label>Data Início</label>
        <input 
          v-model="filtros.dataInicio" 
          type="date" 
          class="input-data"
        >
      </div>

      <!-- Data Fim -->
      <div v-if="opcoes.data" class="filtro-item">
        <label>Data Fim</label>
        <input 
          v-model="filtros.dataFim" 
          type="date" 
          class="input-data"
        >
      </div>

      <!-- Ordenação -->
      <div v-if="opcoes.ordenacao" class="filtro-item">
        <label>Ordenar por</label>
        <select v-model="filtros.ordenacao" class="select-filtro">
          <option v-for="opcao in opcoes.ordenacao" :key="opcao.value" :value="opcao.value">
            {{ opcao.label }}
          </option>
        </select>
      </div>

      <!-- Ordem -->
      <div v-if="opcoes.ordenacao" class="filtro-item">
        <label>Ordem</label>
        <select v-model="filtros.ordem" class="select-filtro">
          <option value="asc">Crescente</option>
          <option value="desc">Decrescente</option>
        </select>
      </div>
    </div>

    <!-- Filtros Ativos -->
    <div v-if="temFiltrosAtivos" class="filtros-ativos">
      <span class="label-ativos">Filtros ativos:</span>
      <div class="chips-filtros">
        <span 
          v-for="filtro in filtrosAtivos" 
          :key="filtro" 
          class="chip-filtro"
        >
          {{ filtro }}
          <button @click="removerFiltro(filtro)" class="btn-remover-chip">
            <i class="fas fa-times"></i>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useFiltros } from '../composables/useFiltros.js'

const props = defineProps({
  opcoes: {
    type: Object,
    default: () => ({
      status: [
        { value: 'ativo', label: 'Ativo' },
        { value: 'inativo', label: 'Inativo' }
      ],
      categorias: [],
      data: true,
      ordenacao: [
        { value: 'nome', label: 'Nome' },
        { value: 'dataCriacao', label: 'Data de Criação' }
      ]
    })
  }
})

const emit = defineEmits(['filtros-alterados'])

const {
  filtros,
  filtrosAtivos,
  temFiltrosAtivos,
  limparFiltros: limparTodosFiltros,
  limparFiltro
} = useFiltros()

// Watch para emitir mudanças
watch(filtros, () => {
  emit('filtros-alterados', filtros.value)
}, { deep: true })

const limparFiltros = () => {
  limparTodosFiltros()
}

const removerFiltro = (filtroTexto) => {
  // Extrair o campo do texto do filtro
  if (filtroTexto.includes('Busca:')) {
    limparFiltro('busca')
  } else if (filtroTexto.includes('Status:')) {
    limparFiltro('status')
  } else if (filtroTexto.includes('Categoria:')) {
    limparFiltro('categoria')
  } else if (filtroTexto.includes('De:')) {
    limparFiltro('dataInicio')
  } else if (filtroTexto.includes('Até:')) {
    limparFiltro('dataFim')
  }
}
</script>

<style scoped>
.filtros-container {
  background: #f8f9fa;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filtros-header h3 {
  font-size: 16px;
  color: #1d1d1f;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-limpar-filtros {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ff3b30;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-limpar-filtros:hover {
  background: #d70015;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filtro-item label {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6e6e73;
  font-size: 14px;
}

.input-busca {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.input-busca:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-filtro,
.input-data {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #1d1d1f;
}

.select-filtro:focus,
.input-data:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filtros-ativos {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e5ea;
}

.label-ativos {
  font-size: 13px;
  font-weight: 600;
  color: #6e6e73;
  white-space: nowrap;
}

.chips-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-filtro {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #667eea;
  color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.btn-remover-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.2s ease;
}

.btn-remover-chip:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsivo */
@media (max-width: 768px) {
  .filtros-grid {
    grid-template-columns: 1fr;
  }
  
  .filtros-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .filtros-ativos {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
