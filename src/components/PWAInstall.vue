<template>
  <div v-if="showInstallPrompt" class="pwa-install-banner">
    <div class="banner-content">
      <div class="banner-icon">
        <i class="fas fa-download"></i>
      </div>
      <div class="banner-text">
        <h3>Instalar App</h3>
        <p>Instale o sistema para acesso rápido e notificações</p>
      </div>
      <div class="banner-actions">
        <button @click="installApp" class="btn-install" :disabled="installing">
          <i v-if="!installing" class="fas fa-download"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          {{ installing ? 'Instalando...' : 'Instalar' }}
        </button>
        <button @click="dismissInstall" class="btn-dismiss">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- Botão de instalação flutuante -->
  <button 
    v-if="showInstallButton && !showInstallPrompt" 
    @click="showInstallPrompt = true"
    class="pwa-install-button"
    title="Instalar App"
  >
    <i class="fas fa-plus"></i>
  </button>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePWA } from '../composables/usePWA.js'

const { isInstallable, installPWA } = usePWA()

const showInstallPrompt = ref(false)
const installing = ref(false)
const dismissed = ref(false)

const showInstallButton = computed(() => {
  return isInstallable.value && !dismissed.value && !showInstallPrompt.value
})

const installApp = async () => {
  try {
    installing.value = true
    const success = await installPWA()
    
    if (success) {
      showInstallPrompt.value = false
      // Salvar que foi instalado
      localStorage.setItem('pwa-installed', 'true')
    } else {
      console.log('Instalação cancelada pelo usuário')
    }
  } catch (error) {
    console.error('Erro ao instalar PWA:', error)
  } finally {
    installing.value = false
  }
}

const dismissInstall = () => {
  showInstallPrompt.value = false
  dismissed.value = true
  // Salvar que foi dispensado por 7 dias
  const dismissUntil = new Date()
  dismissUntil.setDate(dismissUntil.getDate() + 7)
  localStorage.setItem('pwa-dismissed-until', dismissUntil.toISOString())
}

const checkDismissStatus = () => {
  const dismissedUntil = localStorage.getItem('pwa-dismissed-until')
  if (dismissedUntil) {
    const dismissDate = new Date(dismissedUntil)
    if (dismissDate > new Date()) {
      dismissed.value = true
    } else {
      localStorage.removeItem('pwa-dismissed-until')
    }
  }
}

onMounted(() => {
  checkDismissStatus()
  
  // Mostrar prompt após 3 segundos se instalável
  if (isInstallable.value && !dismissed.value) {
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 3000)
  }
})
</script>

<style scoped>
.pwa-install-banner {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-width: 400px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 10000;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.banner-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.banner-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.banner-text p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.banner-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-install {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-install:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-install:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-dismiss {
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-dismiss:hover {
  background: #e5e7eb;
  color: #374151;
}

.pwa-install-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999;
  animation: pulse 2s infinite;
}

.pwa-install-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.8);
  }
  100% {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  }
}

@media (max-width: 768px) {
  .pwa-install-banner {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }
  
  .banner-content {
    padding: 12px;
  }
  
  .banner-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .banner-text h3 {
    font-size: 15px;
  }
  
  .banner-text p {
    font-size: 13px;
  }
  
  .btn-install {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .btn-dismiss {
    width: 32px;
    height: 32px;
  }
  
  .pwa-install-button {
    width: 48px;
    height: 48px;
    font-size: 18px;
    bottom: 16px;
    right: 16px;
  }
}
</style>
