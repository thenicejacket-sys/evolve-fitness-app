/* Evolve Fitness — service worker "network-first" pour l'app, cache pour le hors-ligne.
   But : l'utilisateur voit toujours la dernière version en ligne, sans vider le cache.
   - HTML / navigation  -> network-first (toujours frais ; repli cache si hors-ligne)
   - autres ressources  -> stale-while-revalidate (rapide + se met à jour en fond) */
const CACHE = 'evolve-cache-v1';

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) { if (k !== CACHE) await caches.delete(k); }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // ne touche pas aux requêtes externes

  const isHTML = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');

  if (isHTML) {
    // network-first : toujours la dernière version quand on est en ligne
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        const c = await caches.open(CACHE); c.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        return (await caches.match(req)) || (await caches.match('index.html')) || Response.error();
      }
    })());
  } else {
    // stale-while-revalidate : sert le cache tout de suite, met à jour en arrière-plan
    e.respondWith((async () => {
      const cached = await caches.match(req);
      const fetching = fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => null);
      return cached || (await fetching) || Response.error();
    })());
  }
});
