const CACHE_NAME = 'app-images-v1';

/**
 * Caches images persistently using the Cache Storage API.
 * On first visit: downloads & stores. On future visits: instant from cache.
 */
export async function preloadImages(urls) {
  const validUrls = urls?.filter(Boolean) || [];
  if (!validUrls.length) return;

  if ('caches' in window) {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(validUrls.map(async (url) => {
      const cached = await cache.match(url);
      if (!cached) {
        fetch(url).then(res => { if (res.ok) cache.put(url, res.clone()); }).catch(() => {});
      }
    }));
  } else {
    // Fallback: browser memory cache
    validUrls.forEach(url => { const img = new Image(); img.src = url; });
  }
}