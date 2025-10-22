import { ref } from 'vue'

// Estado global para notificações
const toastState = ref({
  show: false,
  message: '',
  title: '',
  type: 'info',
  duration: 4000
})

const confirmState = ref({
  show: false,
  title: 'Confirmar Ação',
  message: '',
  type: 'warning',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  confirmIcon: 'fas fa-check',
  loading: false,
  resolve: null,
  reject: null
})

const promptState = ref({
  show: false,
  title: 'Informação Necessária',
  message: '',
  label: '',
  placeholder: '',
  defaultValue: '',
  inputType: 'text',
  required: false,
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  loading: false,
  resolve: null,
  reject: null
})

export function useNotifications() {
  // Toast/Alert
  const showToast = (message, options = {}) => {
    toastState.value = {
      show: true,
      message,
      title: options.title || '',
      type: options.type || 'info',
      duration: options.duration || 4000
    }
  }

  const showSuccess = (message, title = 'Sucesso!') => {
    showToast(message, { type: 'success', title, duration: 4000 })
  }

  const showError = (message, title = 'Erro') => {
    showToast(message, { type: 'error', title, duration: 6000 })
  }

  const showWarning = (message, title = 'Atenção') => {
    showToast(message, { type: 'warning', title, duration: 5000 })
  }

  const showInfo = (message, title = '') => {
    showToast(message, { type: 'info', title, duration: 4000 })
  }

  const closeToast = () => {
    toastState.value.show = false
  }

  // Confirm Modal
  const showConfirm = (message, options = {}) => {
    return new Promise((resolve, reject) => {
      confirmState.value = {
        show: true,
        title: options.title || 'Confirmar Ação',
        message,
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        confirmIcon: options.confirmIcon || 'fas fa-check',
        loading: false,
        resolve,
        reject
      }
    })
  }

  const handleConfirmOk = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(true)
    }
    confirmState.value.show = false
  }

  const handleConfirmCancel = () => {
    if (confirmState.value.reject) {
      confirmState.value.reject(false)
    }
    confirmState.value.show = false
  }

  // Prompt Modal
  const showPrompt = (message, options = {}) => {
    return new Promise((resolve, reject) => {
      promptState.value = {
        show: true,
        title: options.title || 'Informação Necessária',
        message,
        label: options.label || '',
        placeholder: options.placeholder || '',
        defaultValue: options.defaultValue || '',
        inputType: options.inputType || 'text',
        required: options.required !== undefined ? options.required : false,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        loading: false,
        resolve,
        reject
      }
    })
  }

  const handlePromptOk = (value) => {
    if (promptState.value.resolve) {
      promptState.value.resolve(value)
    }
    promptState.value.show = false
  }

  const handlePromptCancel = () => {
    if (promptState.value.reject) {
      promptState.value.reject(null)
    }
    promptState.value.show = false
  }

  return {
    // Toast state
    toastState,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeToast,

    // Confirm state
    confirmState,
    showConfirm,
    handleConfirmOk,
    handleConfirmCancel,

    // Prompt state
    promptState,
    showPrompt,
    handlePromptOk,
    handlePromptCancel
  }
}

