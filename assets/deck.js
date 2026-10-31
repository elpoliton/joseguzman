/* deck.js — motor de diapositivas de politon.pe/joseguzman (sin dependencias)
   Teclas (y puntero USB, que envía las mismas teclas):
     siguiente: → ↓ AvPág Espacio Enter N · anterior: ← ↑ RePág Retroceso
     F o F5: pantalla completa · B o . : pantalla negra · S: vista del presentador
     K: reproducir/pausar video · Inicio/Fin · número + Enter: ir a esa diapositiva · ?: ayuda
   En una diapositiva con video, «siguiente» primero reproduce el video; la siguiente pulsación avanza. */
(function () {
  'use strict';
  var W = 1600, H = 900;
  var body = document.body;
  var root = body.getAttribute('data-root') || './';
  var presenter = /[?&]presentador\b/.test(location.search);
  var stage = document.querySelector('.viewport .stage');
  var slides = Array.prototype.slice.call(stage.querySelectorAll(':scope > .slide'));
  var N = slides.length, i = 0;
  var chan = ('BroadcastChannel' in window) ? new BroadcastChannel('deck:' + location.pathname) : null;
  var mainAlive = false;
  if (window.pintarIconos) window.pintarIconos();

  // numeración automática del pie
  slides.forEach(function (s, k) { var n = s.querySelector('.foot .n'); if (n) n.textContent = String(k + 1); });

  // ---------- escala
  function fit(st, w, h) {
    var s = Math.min(w / W, h / H);
    st.style.transform = 'translate(' + ((w - W * s) / 2) + 'px,' + ((h - H * s) / 2) + 'px) scale(' + s + ')';
  }
  function fitMain() { fit(stage, window.innerWidth, window.innerHeight); }
  window.addEventListener('resize', function () { fitMain(); if (presenter) renderPresenter(); });

  // ---------- videos: 1.er «siguiente» = video en grande · 2.º = vuelve a la diapositiva · 3.º = avanza
  var layer = document.createElement('div'); layer.className = 'vlayer';
  layer.innerHTML = '<div class="vslot"></div><div class="vend">Clic para volver a la diapositiva</div>';
  document.body.appendChild(layer);
  var slot = layer.querySelector('.vslot'), openV = null;
  function vidOf(k) { return slides[k] ? slides[k].querySelector('video') : null; }
  function boxOf(v) { return v.__box || (v.__box = v.closest('.vbox')); }
  function stateOf(v) { return !v ? 'none' : openV === v ? (v.ended ? 'ended' : 'open') : v.dataset.done ? 'done' : 'idle'; }
  var VERR = { 1: 'se canceló la carga', 2: 'error de red', 3: 'no se pudo decodificar', 4: 'formato no soportado o archivo no encontrado' };
  slides.forEach(function (s) {
    var v = s.querySelector('video'); if (!v) return;
    boxOf(v);
    v.addEventListener('ended', function () { layer.classList.add('ended'); broadcast(); });
    v.addEventListener('error', function () { toast('No se pudo cargar el video (' + (VERR[v.error && v.error.code] || 'error') + ')'); });
    boxOf(v).addEventListener('click', function () { if (vidOf(i) === v) openVideo(v); });
  });
  layer.addEventListener('click', function () { cmd('next'); });
  function playVideo(v) { var p = v.play(); if (p && p.catch) p.catch(function (err) { toast('No se pudo reproducir el video: ' + (err && err.name || 'error') + '. Haz clic sobre él.'); }); }
  function openVideo(v) {
    if (openV) return; openV = v;
    v.currentTime = 0; slot.appendChild(v); layer.classList.remove('ended'); layer.classList.add('on');
    playVideo(v); broadcast();
  }
  function closeVideo() {
    var v = openV; if (!v) return; openV = null;
    v.pause(); v.dataset.done = '1';
    var b = boxOf(v); b.insertBefore(v, b.firstChild); b.classList.add('played');
    layer.classList.remove('on', 'ended'); broadcast();
  }
  function toggleVideo() { var v = openV; if (!v) { v = vidOf(i); if (v) openVideo(v); return; } if (v.paused || v.ended) playVideo(v); else v.pause(); }

  // ---------- navegación
  function show(n, silent) {
    n = Math.max(0, Math.min(N - 1, n));
    var prevI = i;
    if (openV && n !== i) closeVideo();
    slides[i].classList.remove('on'); i = n; slides[i].classList.add('on');
    if (n !== prevI) { var nv = vidOf(i); if (nv) { delete nv.dataset.done; boxOf(nv).classList.remove('played'); } } // al volver a la diapositiva, el video se puede ver otra vez
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { }
    var c = document.querySelector('.hud .count'); if (c) c.textContent = (i + 1) + ' / ' + N;
    var pr = document.querySelector('.progress'); if (pr) pr.style.width = (100 * (i + 1) / N) + '%';
    if (presenter) renderPresenter();
    if (!silent) broadcast();
  }
  function next() {
    if (openV) { closeVideo(); return; }
    var v = vidOf(i);
    if (v && !v.dataset.done && !presenter) { openVideo(v); return; }
    if (i < N - 1) show(i + 1);
  }
  function prev() { if (openV) { closeVideo(); return; } if (i > 0) show(i - 1); }

  // ---------- canal entre la ventana del público y la del presentador
  function broadcast() {
    if (!presenter) { try { document.dispatchEvent(new CustomEvent('deck:cambio')); } catch (e) { } }
    if (chan && !presenter) chan.postMessage({ t: 'state', i: i, v: stateOf(vidOf(i)) });
  }
  function cmd(c, n) {
    if (presenter && mainAlive) { chan.postMessage({ t: 'cmd', c: c, n: n }); return; }
    run(c, n);
  }
  function run(c, n) {
    if (c === 'next') next(); else if (c === 'prev') prev(); else if (c === 'go') show(n);
    else if (c === 'video') toggleVideo(); else if (c === 'black') black();
  }
  if (chan) chan.onmessage = function (e) {
    var m = e.data || {};
    if (presenter && m.t === 'state') { mainAlive = true; videoState = m.v; if (m.i !== i) show(m.i, true); else renderPresenter(); }
    if (!presenter && m.t === 'cmd') run(m.c, m.n);
    if (!presenter && m.t === 'hello') broadcast();
  };

  // ---------- pantalla negra, completa, ayuda, avisos
  function black() { var b = document.querySelector('.blackout'); b.classList.toggle('on'); broadcast(); }
  function fullscreen() {
    var d = document;
    if (!d.fullscreenElement) { (d.documentElement.requestFullscreen || d.documentElement.webkitRequestFullscreen || function () { }).call(d.documentElement); }
    else { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
  }
  var tt;
  function toast(msg) { var t = document.querySelector('.toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function help(on) { document.querySelector('.help').classList.toggle('on', on); }
  function openPresenter() {
    var u = location.pathname + '?presentador' + location.hash;
    var w = window.open(u, 'presentador', 'width=1280,height=760');
    if (!w) toast('Permite las ventanas emergentes para abrir la vista del presentador');
    else toast('Vista del presentador abierta: muévela a tu pantalla y deja esta en el proyector');
  }

  // ---------- teclado y puntero USB
  var digits = '';
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key;
    if (/^[0-9]$/.test(k)) { digits += k; return; }
    if (k === 'Enter' && digits) { cmd('go', parseInt(digits, 10) - 1); digits = ''; e.preventDefault(); return; }
    digits = '';
    if (document.querySelector('.help.on') && (k === 'Escape' || k === '?')) { help(false); return; }
    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Spacebar': case 'Enter': case 'n': case 'N':
        cmd('next'); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': case 'p': case 'P':
        cmd('prev'); break;
      case 'Home': cmd('go', 0); break;
      case 'End': cmd('go', N - 1); break;
      case 'f': case 'F': case 'F5': case 'BrowserHome': case 'Tab': fullscreen(); break;
      case 'b': case 'B': case '.': cmd('black'); break;
      case 'k': case 'K': cmd('video'); break;
      case 's': case 'S': if (!presenter) openPresenter(); break;
      case '?': case 'h': case 'H': help(true); break;
      case 'Escape': var b = document.querySelector('.blackout'); if (b.classList.contains('on')) b.classList.remove('on'); if (openV) closeVideo(); return;
      default: return;
    }
    e.preventDefault();
  });

  // toques en celular/tablet
  var tx = null;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) cmd(dx < 0 ? 'next' : 'prev'); tx = null; }, { passive: true });

  // ---------- controles en pantalla
  var hud = document.querySelector('.hud'), idle;
  function wake() { hud.classList.remove('hide'); body.style.cursor = ''; clearTimeout(idle); idle = setTimeout(function () { hud.classList.add('hide'); body.style.cursor = 'none'; }, 2500); }
  if (hud) {
    document.addEventListener('mousemove', wake);
    hud.addEventListener('click', function (e) {
      var b = e.target.closest('[data-do]'); if (!b) return;
      var d = b.getAttribute('data-do');
      if (d === 'prev') cmd('prev'); else if (d === 'next') cmd('next'); else if (d === 'full') fullscreen();
      else if (d === 'pres') openPresenter(); else if (d === 'help') help(true); else if (d === 'offline') saveOffline();
    });
    wake();
  }
  var hb = document.querySelector('.help'); if (hb) hb.addEventListener('click', function (e) { if (e.target === hb || e.target.closest('[data-close]')) help(false); });

  // ---------- modo sin conexión (service worker + caché)
  function saveOffline() {
    if (!('serviceWorker' in navigator) || !('caches' in window)) { toast('Este navegador no permite guardar sin conexión'); return; }
    var list = (body.getAttribute('data-offline') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    list.push(location.pathname);
    toast('Guardando la ponencia para usarla sin internet…');
    navigator.serviceWorker.register(root + 'sw.js', { scope: root }).then(function () { return caches.open('jg-ponencias-v1'); })
      .then(function (c) { return Promise.all(list.map(function (u) { return fetch(u, { cache: 'reload' }).then(function (r) { if (!r.ok) throw new Error(u); return c.put(new URL(u, location.href).href, r); }); })); })
      .then(function () { toast('Listo: esta ponencia ya funciona sin internet en este navegador'); })
      .catch(function (err) { toast('No se pudo guardar todo (' + (err && err.message || 'error') + '). Revisa la conexión e inténtalo otra vez'); });
  }
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller == null && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.getRegistration(root).then(function (r) { if (!r) return; });
  }

  // ---------- vista del presentador
  var t0 = Date.now(), videoState = 'none';
  function cloneInto(pane, k, label) {
    pane.innerHTML = '';
    var lab = document.createElement('div'); lab.className = 'label'; lab.textContent = label; pane.appendChild(lab);
    if (k >= N) { var end = document.createElement('div'); end.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;color:#9fb3d9;font-size:20px'; end.textContent = 'Fin de la presentación'; pane.appendChild(end); return; }
    var st = document.createElement('div'); st.className = 'stage';
    var c = slides[k].cloneNode(true); c.classList.add('on'); c.style.transition = 'none';
    c.querySelectorAll('video').forEach(function (v) { var img = document.createElement('img'); img.src = v.getAttribute('poster'); img.alt = ''; v.replaceWith(img); });
    st.appendChild(c); pane.appendChild(st);
    fit(st, pane.clientWidth, pane.clientHeight);
  }
  function renderPresenter() {
    var pv = document.querySelector('.pv'); if (!pv) return;
    cloneInto(pv.querySelector('.cur'), i, 'AHORA · ' + (i + 1) + ' / ' + N);
    cloneInto(pv.querySelector('.nxt'), i + 1, 'SIGUIENTE');
    var notes = slides[i].querySelector('aside.notes');
    var simple = slides[i].querySelector('.simple, .say');
    var html = '';
    if (simple) html += '<p><b>En pantalla:</b> ' + simple.textContent.replace(/^\s*(EN PALABRAS SIMPLES|ANTES DE DAR PLAY)\s*/i, '') + '</p>';
    if (notes) html += notes.innerHTML;
    if (vidOf(i)) html = '<p style="color:#BF0085"><b>Video: ' + ({ none: '', idle: 'listo · «siguiente» lo abre en grande', open: 'en grande, reproduciéndose · «siguiente» vuelve a la diapositiva', ended: 'terminó · «siguiente» vuelve a la diapositiva', done: 'visto · «siguiente» avanza' }[videoState] || '') + '</b></p>' + html;
    pv.querySelector('.pnotes').innerHTML = html || '<p style="color:#888">Sin notas.</p>';
  }
  function clock() {
    var s = Math.floor((Date.now() - t0) / 1000), el = document.querySelector('.pv .clock');
    if (el) el.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    var now = document.querySelector('.pv .now'); if (now) now.textContent = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
  if (presenter) {
    body.classList.add('presenter');
    document.title = 'Presentador · ' + document.title;
    var pv = document.createElement('div'); pv.className = 'pv';
    pv.innerHTML = '<div class="pane cur"></div><div class="side"><div><h4>Siguiente</h4><div class="pane nxt"></div></div><h4 style="margin:0">Notas</h4><div class="pnotes"></div></div>' +
      '<div class="pbar"><span class="clock">00:00</span><button data-p="reset">Reiniciar tiempo</button><span class="grow"></span><span class="now"></span><button data-p="prev">◀ Anterior</button><button data-p="next">Siguiente ▶</button></div>';
    body.appendChild(pv);
    pv.addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (!b) return; var d = b.getAttribute('data-p'); if (d === 'reset') t0 = Date.now(); else cmd(d); });
    setInterval(clock, 500);
    if (chan) chan.postMessage({ t: 'hello' });
  }

  // ---------- API para el control desde el celular (remoto.js)
  function textoDe(k) {
    var s = slides[k]; if (!s) return { titulo: '', notas: '' };
    var t = s.querySelector('.title, h1, .vside div[style*="font-size:46px"]'), img = s.querySelector('img.full');
    var titulo = t ? t.textContent.trim() : img ? (img.getAttribute('alt') || '').replace(/^Diapositiva \d+:?\s*/, '') : '';
    var k2 = s.querySelector('.kicker, .ck'); if (k2 && !titulo) titulo = k2.textContent.trim();
    var simple = s.querySelector('.simple, .say'), notas = s.querySelector('aside.notes');
    var partes = [];
    if (simple) partes.push(simple.textContent.replace(/^\s*(EN PALABRAS SIMPLES|ANTES DE DAR PLAY)\s*/i, '').trim());
    if (notas) Array.prototype.forEach.call(notas.querySelectorAll('p'), function (p) { partes.push(p.textContent.trim()); });
    return { titulo: titulo, notas: partes.join('\n\n') };
  }
  window.DECK = {
    cmd: function (c, n) { run(c, n); },
    pantallaCompleta: fullscreen,
    toast: toast,
    estado: function () { return { i: i, n: N, video: stateOf(vidOf(i)), negro: document.querySelector('.blackout').classList.contains('on'), actual: textoDe(i), siguiente: textoDe(i + 1) }; },
    presentador: presenter
  };

  // ---------- inicio
  var h = parseInt((location.hash || '').replace('#', ''), 10);
  slides[0].classList.add('on');
  show(isNaN(h) ? 0 : h - 1, true);
  fitMain();
  window.addEventListener('hashchange', function () { var n = parseInt(location.hash.replace('#', ''), 10); if (!isNaN(n) && n - 1 !== i) show(n - 1); });
  document.fonts && document.fonts.ready.then(function () { if (presenter) renderPresenter(); });
})();
