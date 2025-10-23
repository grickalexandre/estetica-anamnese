import { ref, reactive } from 'vue'
import { usePWA } from './usePWA.js'

export function useNotifications() {
  const { sendNotification, showToast } = usePWA()
  
  // Estado do toast
  const toastState = reactive({
    show: false,
    message: '',
    title: '',
    type: 'info',
    duration: 4000
  })

  // Estado do modal de confirmação
  const confirmState = reactive({
    show: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    confirmIcon: 'fas fa-check',
    loading: false,
    onConfirm: null,
    onCancel: null
  })

  // Estado do modal de prompt
  const promptState = reactive({
    show: false,
    title: '',
    message: '',
    label: '',
    placeholder: '',
    defaultValue: '',
    inputType: 'text',
    required: false,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    loading: false,
    onConfirm: null,
    onCancel: null
  })

  // Mostrar toast
  const showToastNotification = (type, title, message, duration = 4000) => {
    toastState.show = true
    toastState.type = type
    toastState.title = title
    toastState.message = message
    toastState.duration = duration

    // Auto-fechar
    setTimeout(() => {
      closeToast()
    }, duration)

    // Notificação nativa se disponível
    if (type === 'success' || type === 'error') {
      showToast(message, type)
    }
  }

  // Fechar toast
  const closeToast = () => {
    toastState.show = false
  }

  // Mostrar confirmação
  const showConfirm = (title, message, options = {}) => {
    return new Promise((resolve) => {
      confirmState.show = true
      confirmState.title = title
      confirmState.message = message
      confirmState.type = options.type || 'warning'
      confirmState.confirmText = options.confirmText || 'Confirmar'
      confirmState.cancelText = options.cancelText || 'Cancelar'
      confirmState.confirmIcon = options.confirmIcon || 'fas fa-check'
      confirmState.loading = false
      confirmState.onConfirm = () => {
        confirmState.show = false
        resolve(true)
      }
      confirmState.onCancel = () => {
        confirmState.show = false
        resolve(false)
      }
    })
  }

  // Mostrar prompt
  const showPrompt = (title, message, options = {}) => {
    return new Promise((resolve) => {
      promptState.show = true
      promptState.title = title
      promptState.message = message
      promptState.label = options.label || 'Valor'
      promptState.placeholder = options.placeholder || ''
      promptState.defaultValue = options.defaultValue || ''
      promptState.inputType = options.inputType || 'text'
      promptState.required = options.required || false
      promptState.confirmText = options.confirmText || 'Confirmar'
      promptState.cancelText = options.cancelText || 'Cancelar'
      promptState.loading = false
      promptState.onConfirm = (value) => {
        promptState.show = false
        resolve(value)
      }
      promptState.onCancel = () => {
        promptState.show = false
        resolve(null)
      }
    })
  }

  // Handlers dos modais
  const handleConfirmOk = () => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm()
    }
  }

  const handleConfirmCancel = () => {
    if (confirmState.onCancel) {
      confirmState.onCancel()
    }
  }

  const handlePromptOk = (value) => {
    if (promptState.onConfirm) {
      promptState.onConfirm(value)
    }
  }

  const handlePromptCancel = () => {
    if (promptState.onCancel) {
      promptState.onCancel()
    }
  }

  // Funções de conveniência
  const showSuccess = (message, title = 'Sucesso') => {
    showToastNotification('success', title, message)
  }

  const showError = (message, title = 'Erro') => {
    showToastNotification('error', title, message)
  }

  const showWarning = (message, title = 'Atenção') => {
    showToastNotification('warning', title, message)
  }

  const showInfo = (message, title = 'Informação') => {
    showToastNotification('info', title, message)
  }

  // Substituir alert por notificação
  const alert = (message, title = 'Sistema') => {
    showInfo(message, title)
  }

  // Substituir confirm por modal
  const confirm = (message, title = 'Confirmação') => {
    return showConfirm(title, message)
  }

  // Substituir prompt por modal
  const prompt = (message, defaultValue = '', title = 'Entrada') => {
    return showPrompt(title, message, { defaultValue })
  }

  return {
    // Estado
    toastState,
    confirmState,
    promptState,
    
    // Métodos principais
    showToastNotification,
    showConfirm,
    showPrompt,
    closeToast,
    handleConfirmOk,
    handleConfirmCancel,
    handlePromptOk,
    handlePromptCancel,
    
    // Funções de conveniência
    showSuccess,
    showError,
    showWarning,
    showInfo,
    alert,
    confirm,
    prompt
  }
}