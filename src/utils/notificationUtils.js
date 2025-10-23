// Utilitários para substituir alerts por notificações PWA

// Função global para substituir alert
window.alert = (message, title = 'Sistema') => {
  // Usar notificação nativa se disponível
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png'
    })
  } else {
    // Fallback para alert nativo
    console.log(`${title}: ${message}`)
  }
}

// Função global para substituir confirm
window.confirm = (message, title = 'Confirmação') => {
  // Retornar true por padrão para não quebrar funcionalidades
  // Em uma implementação completa, você usaria modais customizados
  console.log(`Confirm: ${title} - ${message}`)
  return true
}

// Função global para substituir prompt
window.prompt = (message, defaultValue = '', title = 'Entrada') => {
  // Retornar valor padrão por padrão para não quebrar funcionalidades
  // Em uma implementação completa, você usaria modais customizados
  console.log(`Prompt: ${title} - ${message}`)
  return defaultValue
}

// Função para mostrar notificações de sucesso
export const showSuccess = (message, title = 'Sucesso') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'success'
    })
  }
  console.log(`✅ ${title}: ${message}`)
}

// Função para mostrar notificações de erro
export const showError = (message, title = 'Erro') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'error'
    })
  }
  console.error(`❌ ${title}: ${message}`)
}

// Função para mostrar notificações de aviso
export const showWarning = (message, title = 'Atenção') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'warning'
    })
  }
  console.warn(`⚠️ ${title}: ${message}`)
}

// Função para mostrar notificações de informação
export const showInfo = (message, title = 'Informação') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'info'
    })
  }
  console.info(`ℹ️ ${title}: ${message}`)
}

// Solicitar permissão para notificações
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

// Verificar se notificações são suportadas
export const isNotificationSupported = () => {
  return 'Notification' in window
}

// Verificar se PWA é suportado
export const isPWASupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window
}
