import { ref, onMounted } from 'vue'

export function usePWA() {
  const isInstalled = ref(false)
  const isInstallable = ref(false)
  const deferredPrompt = ref(null)
  const isOnline = ref(navigator.onLine)

  // Verificar se o app já está instalado
  const checkIfInstalled = () => {
    // Verificar se está rodando como PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      isInstalled.value = true
    }
  }

  // Detectar quando o app pode ser instalado
  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    isInstallable.value = true
  }

  // Instalar o PWA
  const installPWA = async () => {
    if (!deferredPrompt.value) return false

    try {
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      
      if (outcome === 'accepted') {
        isInstalled.value = true
        isInstallable.value = false
        deferredPrompt.value = null
        return true
      }
      return false
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
      return false
    }
  }

  // Detectar status de conexão
  const handleOnline = () => {
    isOnline.value = true
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  // Registrar service worker
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registrado:', registration)
        return registration
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error)
        return null
      }
    }
    return null
  }

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Enviar notificação
  const sendNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      })

      // Fechar notificação após 5 segundos
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    }
    return null
  }

  // Mostrar toast nativo
  const showToast = (message, type = 'info') => {
    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Sistema de Anamnese', {
          body: message,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'toast',
          requireInteraction: false,
          silent: true
        })
      })
    }
  }

  onMounted(() => {
    // Verificar se já está instalado
    checkIfInstalled()

    // Registrar eventos
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Registrar service worker
    registerServiceWorker()

    // Solicitar permissão para notificações
    requestNotificationPermission()
  })

  return {
    isInstalled,
    isInstallable,
    isOnline,
    installPWA,
    sendNotification,
    showToast,
    requestNotificationPermission
  }
}
