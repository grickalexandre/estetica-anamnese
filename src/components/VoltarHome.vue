<template>
  <button @click="voltarHome" class="btn-voltar-home" :title="tooltip">
    <i class="fas fa-home"></i>
    <span v-if="!apenasIcone">Home</span>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  apenasIcone: {
    type: Boolean,
    default: false
  },
  tooltip: {
    type: String,
    default: 'Voltar para Home'
  }
})

const voltarHome = () => {
  router.push('/')
}
</script>

<style scoped>
.btn-voltar-home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-voltar-home:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.btn-voltar-home:active {
  transform: translateY(0);
}

.btn-voltar-home i {
  font-size: 16px;
}

/* Versão apenas ícone */
.btn-voltar-home.apenas-icone {
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  justify-content: center;
}

.btn-voltar-home.apenas-icone span {
  display: none;
}
</style>
