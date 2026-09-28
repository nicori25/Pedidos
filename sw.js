const CACHE_NAME = 'pedidos-grafica-v2';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore-compat.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Sirve la interfaz (HTML/CSS/JS/ícono) desde el caché.
// Las llamadas a Firestore (datos) NO se cachean acá: esas las maneja
// la persistencia offline de Firestore, no el Service Worker.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('firestore.googleapis.com') || url.includes('googleapis.com/google.firestore')) {
    return; // dejá pasar directo, sin tocar el caché del SW
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
