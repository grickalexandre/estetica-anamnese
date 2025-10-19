<template>
  <div v-if="totalPaginas > 1" class="paginacao">
    <div class="paginacao-info">
      <span>Mostrando {{ inicioItem }} - {{ fimItem }} de {{ totalItens }} itens</span>
      <select v-model="itensPorPaginaLocal" @change="alterarItensPorPagina" class="select-itens">
        <option value="5">5 por página</option>
        <option value="10">10 por página</option>
        <option value="20">20 por página</option>
        <option value="50">50 por página</option>
        <option value="100">100 por página</option>
      </select>
    </div>

    <div class="paginacao-controles">
      <button 
        @click="primeiraPagina" 
        :disabled="!temPaginaAnterior"
        class="btn-pagina"
        title="Primeira página"
      >
        <i class="fas fa-angle-double-left"></i>
      </button>

      <button 
        @click="paginaAnterior" 
        :disabled="!temPaginaAnterior"
        class="btn-pagina"
        title="Página anterior"
      >
        <i class="fas fa-angle-left"></i>
      </button>

      <template v-for="pagina in paginasVisiveis" :key="pagina">
        <button 
          v-if="pagina !== '...'"
          @click="irParaPagina(pagina)"
          :class="['btn-pagina', 'btn-numero', { 'ativa': pagina === paginaAtual }]"
        >
          {{ pagina }}
        </button>
        <span v-else class="ellipsis">...</span>
      </template>

      <button 
        @click="proximaPagina" 
        :disabled="!temProximaPagina"
        class="btn-pagina"
        title="Próxima página"
      >
        <i class="fas fa-angle-right"></i>
      </button>

      <button 
        @click="ultimaPagina" 
        :disabled="!temProximaPagina"
        class="btn-pagina"
        title="Última página"
      >
        <i class="fas fa-angle-double-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  paginaAtual: {
    type: Number,
    required: true
  },
  totalPaginas: {
    type: Number,
    required: true
  },
  totalItens: {
    type: Number,
    required: true
  },
  itensPorPagina: {
    type: Number,
    required: true
  },
  temPaginaAnterior: {
    type: Boolean,
    required: true
  },
  temProximaPagina: {
    type: Boolean,
    required: true
  },
  paginasVisiveis: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'irParaPagina',
  'proximaPagina', 
  'paginaAnterior',
  'primeiraPagina',
  'ultimaPagina',
  'alterarItensPorPagina'
])

const itensPorPaginaLocal = ref(props.itensPorPagina)

// Computed para mostrar informações
const inicioItem = computed(() => {
  return (props.paginaAtual - 1) * props.itensPorPagina + 1
})

const fimItem = computed(() => {
  const fim = props.paginaAtual * props.itensPorPagina
  return Math.min(fim, props.totalItens)
})

// Métodos
const irParaPagina = (pagina) => {
  emit('irParaPagina', pagina)
}

const proximaPagina = () => {
  emit('proximaPagina')
}

const paginaAnterior = () => {
  emit('paginaAnterior')
}

const primeiraPagina = () => {
  emit('primeiraPagina')
}

const ultimaPagina = () => {
  emit('ultimaPagina')
}

const alterarItensPorPagina = () => {
  emit('alterarItensPorPagina', parseInt(itensPorPaginaLocal.value))
}

// Watch para sincronizar com props
watch(() => props.itensPorPagina, (novoValor) => {
  itensPorPaginaLocal.value = novoValor
})
</script>

<style scoped>
.paginacao {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid #e5e5ea;
  margin-top: 20px;
}

.paginacao-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #6e6e73;
}

.select-itens {
  padding: 6px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #1d1d1f;
}

.paginacao-controles {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-pagina {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #d2d2d7;
  background: white;
  color: #1d1d1f;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.btn-pagina:hover:not(:disabled) {
  background: #f5f5f7;
  border-color: #667eea;
  color: #667eea;
}

.btn-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-pagina.ativa {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.btn-numero {
  font-weight: 600;
}

.ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #6e6e73;
  font-weight: 600;
}

/* Responsivo */
@media (max-width: 768px) {
  .paginacao {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .paginacao-info {
    justify-content: center;
  }
  
  .paginacao-controles {
    justify-content: center;
  }
  
  .btn-pagina {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }
}
</style>
