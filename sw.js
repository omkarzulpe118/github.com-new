/* Sign To Text service worker — offline shell + cached AI assets */
const CACHE = 'slt-v1';
const CORE = ['./', './index.html', './manifest.webmanifest'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(
        (r) =>
          r ||
          fetch(e.request).then((res) => {
            const cp = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, cp));
            return res;
          }).catch(() => caches.match('./index.html'))
      )
    );
  } else if (
    u.hostname.includes('jsdelivr') ||
    u.hostname.includes('gstatic') ||
    u.hostname.includes('googleapis')
  ) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const cp = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, cp).catch(() => {}));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
