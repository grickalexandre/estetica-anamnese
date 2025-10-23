const CACHE_NAME = 'clinica-estetica-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Cacheando arquivos estáticos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para diferentes tipos de recursos
  if (request.method === 'GET') {
    // Para arquivos estáticos (CSS, JS, imagens)
    if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      event.respondWith(
        caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((fetchResponse) => {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, fetchResponse.clone());
              return fetchResponse;
            });
          });
        })
      );
    }
    // Para páginas HTML
    else if (request.headers.get('accept').includes('text/html')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Cache apenas se a resposta for válida
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Fallback para cache se offline
            return caches.match(request).then((response) => {
              if (response) {
                return response;
              }
              // Retornar página offline se disponível
              return caches.match('/');
            });
          })
      );
    }
    // Para API calls
    else {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Cache apenas respostas de sucesso
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            return caches.match(request);
          })
      );
    }
  }
});

// Notificações push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push recebido');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do sistema',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Sistema de Gestão', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notificação clicada');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fechar
  } else {
    // Clique na notificação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sync em background');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui você pode implementar sincronização de dados offline
      console.log('Sincronizando dados em background...')
    );
  }
});