const CACHE_NAME = 'anas-app-images-v1';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

function isImageRequest(url) {
  const u = new URL(url);
  return IMAGE_EXTENSIONS.some(ext => u.pathname.toLowerCase().endsWith(ext))
    || u.hostname.includes('supabase') // base44 storage
    || u.pathname.includes('/storage/');
}

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  try {
    if (!isImageRequest(req.url)) return;
  } catch {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(req);
      if (cached) return cached;

      const response = await fetch(req);
      if (response && response.status === 200) {
        // Clone before consuming
        cache.put(req, response.clone());
      }
      return response;
    })
  );
});
