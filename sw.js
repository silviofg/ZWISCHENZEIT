// Offline-Cache für ZWISCHENZEIT. Bei Änderungen am Spiel die Versionsnummer erhöhen.
const CACHE = 'zwischenzeit-v7';
const FILES = ['./', './index.html', './config.js', './datenschutz.html', './manifest.webmanifest',
               './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  // Nur eigene Dateien aus dem Cache, die Rangliste immer live aus dem Internet
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
