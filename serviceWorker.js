// Nombre de la versión del caché
const CACHE_NAME = 'mi-pwa-v2';

// Archivos esenciales que se almacenan para abrir la app sin conexión
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/offline.html'
];

// INSTALACIÓN: Precachear contenido y garantizar control inmediato
self.addEventListener('install', event => {
  console.log('📦 Instalando Service Worker...');

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(FILES_TO_CACHE);
      console.log('✅ Archivos cacheados correctamente');
    })()
  );

  // Activar el nuevo SW inmediatamente
  self.skipWaiting();
});

// ACTIVACIÓN: Eliminar versiones antiguas del caché
self.addEventListener('activate', event => {
  console.log('🚀 Activando nuevo Service Worker...');

  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché antiguo:', key);
            return caches.delete(key);
          }
        })
      );
    })()
  );

  // Tomar control inmediato de los clientes
  self.clients.claim();
});

// FETCH: Estrategia mejorada con fallback offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // Evitar POST, PUT, etc.

  event.respondWith(
    (async () => {
      try {
        // Intentar obtener desde red y actualizar el caché
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        // Si no hay conexión, intentar desde caché
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // Si es navegación (abrir HTML) y no hay nada cacheado, mostrar offline.html
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      }
    })()
  );
});
