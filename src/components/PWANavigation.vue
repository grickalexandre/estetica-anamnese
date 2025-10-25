<template>
  <div class="pwa-navigation">
    <div class="nav-item" :class="{ active: $route.path === '/' }" @click="navigateTo('/')">
      <i class="fas fa-home"></i>
      <span>Início</span>
    </div>
    <div class="nav-item" :class="{ active: $route.path.startsWith('/agenda') }" @click="navigateTo('/agenda')">
      <i class="fas fa-calendar-alt"></i>
      <span>Agenda</span>
    </div>
    <div class="nav-item" :class="{ active: $route.path.startsWith('/lista') }" @click="navigateTo('/lista')">
      <i class="fas fa-users"></i>
      <span>Pacientes</span>
    </div>
    <div class="nav-item" :class="{ active: $route.path.startsWith('/financeiro') }" @click="navigateTo('/financeiro')">
      <i class="fas fa-chart-line"></i>
      <span>Financeiro</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.pwa-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  padding: 8px 0;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #718096;
}

.nav-item.active {
  color: #667eea;
}

.nav-item:hover {
  color: #667eea;
  transform: translateY(-2px);
}

.nav-item i {
  font-size: 20px;
  margin-bottom: 4px;
}

.nav-item span {
  font-size: 10px;
  font-weight: 500;
}

/* Responsividade */
@media (max-width: 480px) {
  .nav-item {
    padding: 6px 2px;
  }
  
  .nav-item i {
    font-size: 18px;
  }
  
  .nav-item span {
    font-size: 9px;
  }
}
</style>
