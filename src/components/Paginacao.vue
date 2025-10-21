<template>
  <div v-if="totalPaginas > 1" class="paginacao">
    <!-- Mobile: Layout simplificado -->
    <div v-if="isMobile" class="paginacao-mobile">
      <div class="paginacao-info-mobile">
        <span class="info-text">{{ inicioItem }}-{{ fimItem }} de {{ totalItens }}</span>
        <select v-model="itensPorPaginaLocal" @change="alterarItensPorPagina" class="select-mobile">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      
      <div class="paginacao-controles-mobile">
        <button 
          @click="paginaAnterior" 
          :disabled="!temPaginaAnterior"
          class="btn-mobile btn-anterior"
        >
          <i class="fas fa-chevron-left"></i>
          <span>Anterior</span>
        </button>
        
        <div class="pagina-atual-mobile">
          <span>{{ paginaAtual }} de {{ totalPaginas }}</span>
        </div>
        
        <button 
          @click="proximaPagina" 
          :disabled="!temProximaPagina"
          class="btn-mobile btn-proximo"
        >
          <span>Próxima</span>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Desktop: Layout completo -->
    <div v-else class="paginacao-desktop">
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

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
const isMobile = ref(false)

// Detectar mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

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

/* Mobile Styles */
.paginacao-mobile {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.paginacao-info-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e5e5ea;
}

.info-text {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.select-mobile {
  padding: 8px 12px;
  border: 2px solid #e5e5ea;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  min-width: 60px;
}

.paginacao-controles-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.btn-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
  flex: 1;
  justify-content: center;
}

.btn-mobile:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-mobile:active:not(:disabled) {
  transform: translateY(0);
}

.btn-mobile:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f7;
  color: #8e8e93;
  border-color: #d2d2d7;
}

.pagina-atual-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  min-width: 100px;
}

/* Desktop Styles */
.paginacao-desktop {
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
  .paginacao-desktop {
    display: none;
  }
  
  .paginacao-mobile {
    display: flex;
  }
}

@media (min-width: 769px) {
  .paginacao-mobile {
    display: none;
  }
  
  .paginacao-desktop {
    display: flex;
  }
}
</style>
