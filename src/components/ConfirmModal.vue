<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" :class="`modal-${type}`" @click.stop>
        <div class="modal-header">
          <div class="modal-icon">
            <i :class="iconClass"></i>
          </div>
          <h3 class="modal-title">{{ title }}</h3>
        </div>

        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
        </div>

        <div class="modal-actions">
          <button 
            class="btn-cancel" 
            @click="handleCancel"
            :disabled="loading"
          >
            <i class="fas fa-times"></i>
            {{ cancelText }}
          </button>
          <button 
            class="btn-confirm" 
            :class="`btn-${type}`"
            @click="handleConfirm"
            :disabled="loading"
          >
            <i v-if="!loading" :class="confirmIcon"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmar Ação'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'warning',
    validator: (value) => ['warning', 'danger', 'info', 'success'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  confirmIcon: {
    type: String,
    default: 'fas fa-check'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const visible = ref(props.show)

const iconClass = computed(() => {
  const icons = {
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle'
  }
  return icons[props.type] || icons.warning
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
  emit('close')
}

const handleOverlayClick = () => {
  if (!props.loading) {
    handleCancel()
  }
}

watch(() => props.show, (newVal) => {
  visible.value = newVal
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}

/* Tipos de Modal */
.modal-warning .modal-icon {
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
}

.modal-danger .modal-icon {
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
}

.modal-info .modal-icon {
  color: #00A859;
  background: rgba(0, 168, 89, 0.1);
}

.modal-success .modal-icon {
  color: #00A859;
  background: rgba(0, 168, 89, 0.1);
}

/* Header */
.modal-header {
  padding: 24px 24px 20px;
  text-align: center;
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

/* Body */
.modal-body {
  padding: 0 24px 24px;
}

.modal-message {
  font-size: 16px;
  line-height: 1.6;
  color: #6e6e73;
  text-align: center;
  margin: 0;
  white-space: pre-line;
}

/* Actions */
.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 20px 24px 24px;
  border-top: 1px solid #e5e5ea;
}

.btn-cancel,
.btn-confirm {
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
}

.btn-cancel {
  background: #f5f5f7;
  color: #6e6e73;
}

.btn-cancel:hover:not(:disabled) {
  background: #e5e5ea;
}

.btn-confirm {
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-warning {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
}

.btn-danger {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
}

.btn-info {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
}

.btn-success {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
}

.btn-cancel:disabled,
.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Animações */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: scale(0.9) translateY(20px);
}

.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

/* Mobile */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }

  .modal-container {
    border-radius: 16px;
  }

  .modal-header {
    padding: 20px 20px 16px;
  }

  .modal-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
    margin-bottom: 12px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-body {
    padding: 0 20px 20px;
  }

  .modal-message {
    font-size: 15px;
  }

  .modal-actions {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px 20px 20px;
  }

  .btn-cancel,
  .btn-confirm {
    width: 100%;
    padding: 14px 16px;
    font-size: 15px;
  }

  /* Inverter ordem no mobile - botão primário primeiro */
  .modal-actions {
    display: flex;
    flex-direction: column-reverse;
  }
}

/* PWA Safe Area */
@supports (padding: max(0px)) {
  .modal-overlay {
    padding: max(20px, env(safe-area-inset-top)) 
             max(20px, env(safe-area-inset-right)) 
             max(20px, env(safe-area-inset-bottom)) 
             max(20px, env(safe-area-inset-left));
  }
}
</style>

