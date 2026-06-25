// Noisecatcher Service Worker v11
// Offline-first caching:
//   • Shell pages        — network-first, cache fallback
//   • /_next/static/**   — cache-first forever (content-addressed by hash)
//   • /maplibre-worker.js — cache-first
//   • Google Fonts       — stale-while-revalidate
//   • OSM map tiles      — cache-first, 7-day TTL, max 500 tiles
//   • Everything else    — network-only (WMS/WFS community data, TF.js model)

// DEPLOY CHECKLIST: bump VERSION on every deploy that changes shell assets,
// routes, or this file. Old caches keyed on previous VERSION are purged in
// the 'activate' handler. Forgetting to bump means users stay on stale HTML.
const VERSION   = 'v11';
const SHELL     = `nc-shell-${VERSION}`;
const STATIC    = `nc-static-${VERSION}`;
const TILES     = `nc-tiles-${VERSION}`;
const KEEP      = new Set([SHELL, STATIC, TILES]);

const SHELL_PAGES = ['/', '/meter', '/map', '/abecedaire', '/about', '/act', '/help', '/pamphlet', '/carnets', '/microphones', '/methodology', '/offline'];
const TILE_TTL    = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const MAX_TILES   = 500;
const PRUNE_COUNT = 100; // entries deleted when MAX_TILES is exceeded

// ── Message: allow the page to trigger skipWaiting on a waiting SW ───
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Install ──────────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  // Cache pages individually — addAll is all-or-nothing; one dynamic page
  // returning an unexpected status kills the whole install and leaves the
  // SW permanently unactivated with an empty cache.
  e.waitUntil(
    caches.open(SHELL).then((c) =>
      Promise.allSettled(SHELL_PAGES.map((url) => c.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: purge stale caches ─────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Navigation — network-first, shell fallback
  if (request.mode === 'navigate') {
    e.respondWith(navigationHandler(request));
    return;
  }

  // Next.js content-addressed chunks (hashed filenames — safe to cache forever)
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(cacheFirst(request, STATIC));
    return;
  }

  // Static worker + theme script (rarely change, serve from cache)
  if (url.pathname === '/maplibre-worker.js' || url.pathname === '/theme-init.js') {
    e.respondWith(cacheFirst(request, STATIC));
    return;
  }

  // Google Fonts — stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(staleWhileRevalidate(request, STATIC));
    return;
  }

  // OSM raster tiles — cache-first with TTL (kept for backwards compat / fallback)
  if (url.hostname === 'tile.openstreetmap.org') {
    e.respondWith(tileHandler(request));
    return;
  }

  // OpenFreeMap vector tiles + style — cache-first with TTL
  if (url.hostname === 'tiles.openfreemap.org') {
    e.respondWith(tileHandler(request));
    return;
  }

  // MapLibre glyph / sprite tiles — cache-first (static data, changes rarely)
  if (url.hostname === 'demotiles.maplibre.org') {
    e.respondWith(cacheFirst(request, STATIC));
    return;
  }

  // Everything else (WFS/WMS community data, TF.js, YAMNet, external APIs)
  // — network-only; don't cache large/dynamic external resources
});

// ── Strategy: network-first with shell fallback ───────────────────────
async function navigationHandler(request) {
  try {
    const response = await fetch(request);
    // Refresh the shell cache while we have a fresh copy
    const cache = await caches.open(SHELL);
    cache.put(request, response.clone());
    return response;
  } catch {
    // Offline: try the exact URL, fall back to '/'
    const cached = await caches.match(request, { cacheName: SHELL })
      ?? await caches.match('/', { cacheName: SHELL });
    return cached
      ?? await caches.match('/offline', { cacheName: SHELL })
      ?? new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

// ── Strategy: cache-first ─────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request, { cacheName });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 504 });
  }
}

// ── Strategy: stale-while-revalidate ─────────────────────────────────
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached ?? networkFetch;
}

// ── Strategy: cache-first for tiles with 7-day TTL ───────────────────
async function tileHandler(request) {
  const cache = await caches.open(TILES);
  const cached = await cache.match(request);

  if (cached) {
    const cachedAt = Number(cached.headers.get('x-nc-cached-at') ?? 0);
    if (Date.now() - cachedAt < TILE_TTL) {
      return cached; // fresh — serve from cache
    }
    // TTL expired — fall through to network, but keep stale as fallback
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Clone headers, inject our cache timestamp
      const headers = new Headers(response.headers);
      headers.set('x-nc-cached-at', String(Date.now()));
      const stored = new Response(await response.clone().blob(), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });

      // Prune oldest entries if tile cache is full
      const keys = await cache.keys();
      if (keys.length >= MAX_TILES) {
        await Promise.all(keys.slice(0, PRUNE_COUNT).map((k) => cache.delete(k)));
      }

      cache.put(request, stored);
    }
    return response;
  } catch {
    // Offline: return stale tile (any age) rather than an error
    return cached ?? new Response('', { status: 504 });
  }
}
