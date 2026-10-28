/* sw.js — modo sin conexión de politon.pe/joseguzman.
   Las ponencias que guardas con el botón «Sin conexión» quedan en la caché del navegador.
   HTML: primero la red (para ver siempre la última versión); si no hay internet, la copia guardada.
   Videos, fuentes e imágenes: primero la copia guardada. Responde a las peticiones por rangos de los videos. */
var CACHE = 'jg-ponencias-v1';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

function rangeResponse(res, range) {
  return res.arrayBuffer().then(function (buf) {
    var m = /bytes=(\d*)-(\d*)/.exec(range) || [], size = buf.byteLength;
    var start = m[1] ? parseInt(m[1], 10) : 0, end = m[2] ? parseInt(m[2], 10) : size - 1;
    if (start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
    end = Math.min(end, size - 1);
    return new Response(buf.slice(start, end + 1), { status: 206, headers: {
      'Content-Type': res.headers.get('Content-Type') || 'video/mp4', 'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
      'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url); if (url.origin !== self.location.origin) return;
  var key = url.origin + url.pathname;
  var isPage = req.mode === 'navigate' || /\.html?$/.test(url.pathname) || url.pathname.slice(-1) === '/';
  e.respondWith(caches.open(CACHE).then(function (cache) {
    if (isPage) {
      return fetch(req).then(function (r) { if (r.ok) cache.put(key, r.clone()); return r; })
        .catch(function () { return cache.match(key).then(function (h) { return h || cache.match(key + 'index.html') || cache.match(key.replace(/index\.html$/, '')); }); });
    }
    return cache.match(key).then(function (hit) {
      var range = req.headers.get('range');
      if (hit) return range ? rangeResponse(hit, range) : hit;
      return fetch(req);
    });
  }));
});
