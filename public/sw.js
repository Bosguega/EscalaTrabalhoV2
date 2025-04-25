// Service Worker para PWA Escala de Trabalho
const CACHE_NAME = 'escala-trabalho-v1';

// Determina o caminho base da aplicação
const basePath = self.location.pathname.replace('sw.js', '');

const urlsToCache = [
  basePath,
  basePath + 'index.html',
  basePath + 'src/main.ts',
  basePath + 'src/App.vue',
  basePath + 'src/assets/tailwind.css',
  basePath + 'src/utils/anotacoes.ts',
  basePath + 'src/utils/escala.ts',
  basePath + 'src/utils/theme.ts',
  basePath + 'icons/icon-72x72.png',
  basePath + 'icons/icon-96x96.png',
  basePath + 'icons/icon-128x128.png',
  basePath + 'icons/icon-144x144.png',
  basePath + 'icons/icon-152x152.png',
  basePath + 'icons/icon-192x192.png',
  basePath + 'icons/icon-384x384.png',
  basePath + 'icons/icon-512x512.png'
];

// Instalação e cache de recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Estratégia de cache: Cache First, then Network
self.addEventListener('fetch', (event) => {
  // Ignora requisições chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }

        // Clone da requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone da resposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Verifica se a URL é válida antes de armazenar no cache
                if (event.request.url.startsWith('http')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});