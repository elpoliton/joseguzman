/* deck.js — motor de diapositivas de politon.pe/joseguzman (sin dependencias)
   Teclas (y puntero USB, que envía las mismas teclas):
     siguiente: → ↓ AvPág Espacio Enter N · anterior: ← ↑ RePág Retroceso
     F o F5: pantalla completa · B o . : pantalla negra · S: vista del presentador
     K: reproducir/pausar video · Inicio/Fin · número + Enter: ir a esa diapositiva · ?: ayuda
   En una diapositiva con video, «siguiente» abre el video en grande; la siguiente pulsación vuelve; la otra avanza.
   ajustes.json (junto al index.html, lo escribe el panel /admin): notas, textos, imágenes, orden y diapositivas ocultas.
   Modos: ?presentador (vista del presentador) · ?vista (miniatura para el celular/panel) · ?vista=grid (todas en cuadrícula)
          · &editor (no aplica orden ni ocultas, para el panel) · &sinajustes (no lee ajustes.json). */
(function () {
  'use strict';
  var W = 1600, H = 900;
  var body = document.body;
  var root = body.getAttribute('data-root') || './';
  var Q = location.search;
  var presenter = /[?&]presentador\b/.test(Q);
  var vista = /[?&]vista\b/.test(Q), grid = /[?&]vista=grid\b/.test(Q), editor = /[?&]editor\b/.test(Q);
  var stage = document.querySelector('.viewport .stage'), viewport = document.querySelector('.viewport');
  var todas = Array.prototype.slice.call(stage.querySelectorAll(':scope > .slide'));
  todas.forEach(function (s, k) { s.setAttribute('data-k', String(k)); });
  var slides = todas.slice(), N = slides.length, i = 0;
  var chan = (!vista && 'BroadcastChannel' in window) ? new BroadcastChannel('deck:' + location.pathname) : null;
  var mainAlive = false;
  if (vista) body.classList.add('vista');
  if (grid) body.classList.add('grid');
  if (window.pintarIconos) window.pintarIconos();

  // en miniatura no se cargan los videos (ahorra datos del celular): se muestra su portada
  if (vista) todas.forEach(function (s) {
    s.querySelectorAll('video').forEach(function (v) { var img = document.createElement('img'); img.src = v.getAttribute('poster') || ''; img.alt = ''; img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'; v.removeAttribute('src'); try { v.load(); } catch (e) { } v.replaceWith(img); });
  });

  // ---------- textos editables y ajustes (panel /admin)
  var SEL = 'h1, h2, h3, h4, .kicker, .ck, .lead, p, li, .c, .h, .d, .simple > div, .card > div, td, th';
  function editables(s) {
    var out = [];
    Array.prototype.forEach.call(s.querySelectorAll(SEL), function (el) {
      if (el.closest('aside.notes, .foot, .brand, .vbox')) return;
      if (out.some(function (o) { return o.contains(el); })) return;
      if (!el.textContent.trim()) return;
      out.push(el);
    });
    return out;
  }
  // texto ⇄ «**negrita**»; el recuadro «En palabras simples» conserva su etiqueta
  var escH = function (t) { return String(t).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };
  function aTexto(el) {
    var c = el.cloneNode(true); var lab = c.querySelector(':scope > .lab'); if (lab) lab.remove();
    c.querySelectorAll('br').forEach(function (b) { b.replaceWith('\n'); });
    c.querySelectorAll('b, strong').forEach(function (b) { b.replaceWith('**' + b.textContent + '**'); });
    return c.textContent.replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
  }
  function aHtml(t) { return escH(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }
  function etiqueta(el) {
    if (el.matches('.simple > div')) return 'Recuadro «En palabras simples»';
    if (el.matches('h1, .title')) return 'Título'; if (el.matches('.kicker, .ck')) return 'Antetítulo';
    if (el.matches('.lead')) return 'Subtítulo'; if (el.matches('h2, h3, h4, .h')) return 'Encabezado';
    if (el.matches('li')) return 'Viñeta'; if (el.matches('td, th')) return 'Celda'; return 'Texto';
  }
  function notaDeHtml(html) { if (html == null) return ''; var d = document.createElement('div'); d.innerHTML = html; var ps = d.querySelectorAll('p'); return ps.length ? Array.prototype.map.call(ps, function (p) { return aTexto(p); }).join('\n\n') : aTexto(d); }
  var orig = todas.map(function (s) {
    var n = s.querySelector('aside.notes'), img = s.querySelector('img.full');
    return { els: editables(s).map(function (el) { return { el: el, html: el.innerHTML, texto: aTexto(el) }; }), notas: n ? n.innerHTML : null, img: img ? img.getAttribute('src') : null };
  });
  function notaTexto(k) { var n = todas[k] && todas[k].querySelector('aside.notes'); return n ? notaDeHtml(n.innerHTML).replace(/\*\*/g, '') : ''; }
  function ponerNota(k, texto) {
    var s = todas[k]; if (!s) return;
    var n = s.querySelector('aside.notes');
    if (texto == null) { if (orig[k].notas == null) { if (n) n.remove(); } else { if (!n) { n = document.createElement('aside'); n.className = 'notes'; s.appendChild(n); } n.innerHTML = orig[k].notas; } return; }
    if (!n) { n = document.createElement('aside'); n.className = 'notes'; s.appendChild(n); }
    n.innerHTML = String(texto).split(/\n+/).filter(function (p) { return p.trim(); }).map(function (p) { return '<p>' + aHtml(p.trim()) + '</p>'; }).join('');
  }
  var ajustes = {};
  function aplicar(aj, estructura) {
    aj = aj || {}; ajustes = aj;
    var notas = aj.notas || {}, textos = aj.textos || {}, imgs = aj.imagenes || {};
    todas.forEach(function (s, k) {
      orig[k].els.forEach(function (o, j) {
        var t = textos[k + ':' + j];
        if (t == null) { o.el.innerHTML = o.html; return; }
        if (o.el.matches('.simple > div')) { o.el.innerHTML = o.html; var lab = o.el.querySelector(':scope > .lab'); o.el.innerHTML = (lab ? lab.outerHTML : '') + aHtml(t); }
        else o.el.innerHTML = /flex|grid/.test(getComputedStyle(o.el).display) ? '<span>' + aHtml(t) + '</span>' : aHtml(t); // en flex se perdían los espacios junto a la negrita
      });
      ponerNota(k, Object.prototype.hasOwnProperty.call(notas, k) ? notas[k] : null);
      var im = s.querySelector('img.full'); if (im && orig[k].img) im.setAttribute('src', imgs[k] ? imgs[k] : orig[k].img);
    });
    if (estructura) {
      var orden = Array.isArray(aj.orden) && aj.orden.length ? aj.orden.slice() : todas.map(function (_, k) { return k; });
      todas.forEach(function (_, k) { if (orden.indexOf(k) < 0) orden.push(k); }); // las nuevas van al final
      var ocultas = aj.ocultas || [];
      slides = orden.filter(function (k) { return todas[k] && ocultas.indexOf(k) < 0; }).map(function (k) { return todas[k]; });
      if (!slides.length) slides = todas.slice();
      todas.forEach(function (s) { s.classList.remove('on'); if (slides.indexOf(s) < 0) s.remove(); });
      slides.forEach(function (s) { stage.insertBefore(s, laser); });
      N = slides.length;
    }
    slides.forEach(function (s, n) { var f = s.querySelector('.foot .n'); if (f) f.textContent = String(n + 1); });
  }

  // ---------- escala
  function fit(st, w, h) {
    var s = Math.min(w / W, h / H);
    st.style.transform = 'translate(' + ((w - W * s) / 2) + 'px,' + ((h - H * s) / 2) + 'px) scale(' + s + ')';
  }
  function fitMain() { fit(stage, window.innerWidth, window.innerHeight); if (grid) pintarGrid(); }
  window.addEventListener('resize', function () { fitMain(); if (presenter) renderPresenter(); });

  // ---------- videos: 1.er «siguiente» = video en grande · 2.º = vuelve a la diapositiva · 3.º = avanza
  var layer = document.createElement('div'); layer.className = 'vlayer';
  layer.innerHTML = '<div class="vslot"></div><div class="vend">Clic para volver a la diapositiva</div>';
  document.body.appendChild(layer);
  var slot = layer.querySelector('.vslot'), openV = null;
  function vidOf(k) { var s = slides[k]; if (!s) return null; var v = s.querySelector('video'); if (!v && openV && s.contains(boxOf(openV))) v = openV; return v; } // mientras está en grande, el video vive fuera de la diapositiva
  function boxOf(v) { return v.__box || (v.__box = v.closest('.vbox')); }
  function stateOf(v) { return !v ? 'none' : openV === v ? (layer.classList.contains('wait') ? 'wait' : v.ended ? 'ended' : v.paused ? 'paused' : 'open') : v.dataset.done ? 'done' : 'idle'; }
  var VERR = { 1: 'se canceló la carga', 2: 'error de red', 3: 'no se pudo decodificar', 4: 'formato no soportado o archivo no encontrado' };
  todas.forEach(function (s) {
    var v = s.querySelector('video'); if (!v) return;
    boxOf(v);
    v.addEventListener('ended', function () { layer.classList.add('ended'); broadcast(); });
    v.addEventListener('pause', function () { if (openV === v && !v.ended) broadcast(); });
    v.addEventListener('play', function () { if (openV === v) broadcast(); });
    v.addEventListener('error', function () { if (v.getAttribute('src')) toast('No se pudo cargar el video (' + (VERR[v.error && v.error.code] || 'error') + ')'); });
    boxOf(v).addEventListener('click', function () { if (vidOf(i) === v) openVideo(v); });
  });
  layer.addEventListener('click', function () { cmd('next'); });
  function playVideo(v) { var p = v.play(); if (p && p.catch) p.catch(function (err) { toast('No se pudo reproducir el video: ' + (err && err.name || 'error') + '. Haz clic sobre él.'); }); }
  // se espera ~1 s antes de dar play: el proyector o los parlantes (HDMI) tardan en «despertar» el audio y se comían el primer segundo
  var ESPERA = 1000, tPlay = null;
  function openVideo(v) {
    if (openV || vista) return; openV = v;
    v.pause(); try { v.currentTime = 0; } catch (e) { } slot.appendChild(v); layer.classList.remove('ended'); layer.classList.add('on', 'wait');
    clearTimeout(tPlay);
    var t0v = Date.now();
    var arrancarV = function () { if (openV !== v) return; layer.classList.remove('wait'); try { v.currentTime = 0; } catch (e) { } playVideo(v); broadcast(); };
    var listo = function () { clearTimeout(tPlay); tPlay = setTimeout(arrancarV, Math.max(0, ESPERA - (Date.now() - t0v))); };
    if (v.readyState >= 3) listo(); else { v.addEventListener('canplay', listo, { once: true }); tPlay = setTimeout(arrancarV, 6000); }
    broadcast();
  }
  function closeVideo() {
    var v = openV; if (!v) return; openV = null; clearTimeout(tPlay); layer.classList.remove('wait');
    v.pause(); v.dataset.done = '1';
    var b = boxOf(v); b.insertBefore(v, b.firstChild); b.classList.add('played');
    layer.classList.remove('on', 'ended'); broadcast();
  }
  function toggleVideo() { var v = openV; if (!v) { v = vidOf(i); if (v) openVideo(v); return; } if (layer.classList.contains('wait')) return; if (v.paused || v.ended) playVideo(v); else v.pause(); }
  function seekVideo(s) { var v = openV; if (!v || layer.classList.contains('wait')) return; v.currentTime = Math.max(0, Math.min((v.duration || 0) - 0.2, v.currentTime + s)); layer.classList.remove('ended'); toast((s > 0 ? '⏩ +' : '⏪ ') + s + ' s'); }
  function volVideo(d) { var v = openV || vidOf(i); if (!v) return; v.volume = Math.max(0, Math.min(1, Math.round((v.volume + d) * 10) / 10)); toast('🔊 Volumen ' + Math.round(v.volume * 100) + ' %'); }

  // ---------- zoom y puntero láser (desde el celular)
  var zoomOn = false;
  function zoom(p) {
    if (!viewport) return;
    viewport.style.transition = 'transform .45s ease';
    if (!p || p.x == null) { zoomOn = false; viewport.style.transform = ''; return; }
    zoomOn = true;
    var r = stage.getBoundingClientRect(), x = r.left + p.x * r.width, y = r.top + p.y * r.height, z = p.z || 2.2;
    viewport.style.transformOrigin = x + 'px ' + y + 'px'; viewport.style.transform = 'scale(' + z + ')';
  }
  var laser = document.createElement('div'); laser.className = 'laser'; stage.appendChild(laser);
  function puntero(p) {
    if (!p || !p.on) { laser.classList.remove('on'); return; }
    laser.style.left = (p.x * W) + 'px'; laser.style.top = (p.y * H) + 'px'; laser.classList.add('on');
  }

  // ---------- navegación
  function show(n, silent) {
    n = Math.max(0, Math.min(N - 1, n));
    var prevI = i;
    if (openV && n !== i) closeVideo();
    if (zoomOn && n !== i) zoom(null);
    if (slides[i]) slides[i].classList.remove('on'); i = n; slides[i].classList.add('on');
    if (n !== prevI) { var nv = vidOf(i); if (nv) { delete nv.dataset.done; boxOf(nv).classList.remove('played'); } } // al volver a la diapositiva, el video se puede ver otra vez
    if (!vista) try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { }
    var c = document.querySelector('.hud .count'); if (c) c.textContent = (i + 1) + ' / ' + N;
    var pr = document.querySelector('.progress'); if (pr) pr.style.width = (100 * (i + 1) / N) + '%';
    if (presenter) renderPresenter();
    if (grid) marcarGrid();
    if (!silent) broadcast();
  }
  function next() {
    if (openV) { closeVideo(); return; }
    var v = vidOf(i);
    if (v && !v.dataset.done && !presenter && !vista) { openVideo(v); return; }
    if (i < N - 1) show(i + 1);
  }
  function prev() { if (openV) { closeVideo(); return; } if (i > 0) show(i - 1); }

  // ---------- canal entre la ventana del público y la del presentador
  function broadcast() {
    if (vista) return;
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
    else if (c === 'vseek') seekVideo(n); else if (c === 'vvol') volVideo(n);
    else if (c === 'zoom') zoom(n); else if (c === 'laser') puntero(n);
    else if (c === 'abrir' && n && !presenter && !vista) { location.href = root + 'ponencias/' + String(n).replace(/^\/+/, ''); }
  }
  if (chan) chan.onmessage = function (e) {
    var m = e.data || {};
    if (presenter && m.t === 'state') { mainAlive = true; videoState = m.v; if (m.i !== i) show(m.i, true); else renderPresenter(); }
    if (!presenter && m.t === 'cmd') run(m.c, m.n);
    if (!presenter && m.t === 'hello') broadcast();
    if (m.t === 'nota') { ponerNota(m.k, m.texto); if (presenter) renderPresenter(); }
  };

  // ---------- pantalla negra, completa, ayuda, avisos
  function black() { var b = document.querySelector('.blackout'); if (b) b.classList.toggle('on'); broadcast(); }
  function fullscreen() {
    var d = document;
    if (!d.fullscreenElement) { (d.documentElement.requestFullscreen || d.documentElement.webkitRequestFullscreen || function () { }).call(d.documentElement); }
    else { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
  }
  var tt;
  function toast(msg) { var t = document.querySelector('.toast'); if (!t || vista) return; t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function help(on) { var h = document.querySelector('.help'); if (h) h.classList.toggle('on', on); }
  function openPresenter() {
    var u = location.pathname + '?presentador' + location.hash;
    var w = window.open(u, 'presentador', 'width=1280,height=760');
    if (!w) toast('Permite las ventanas emergentes para abrir la vista del presentador');
    else toast('Vista del presentador abierta: muévela a tu pantalla y deja esta en el proyector');
  }

  // ---------- teclado y puntero USB
  var digits = '';
  if (!vista) document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target && e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return;
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
      case 'Escape': var b = document.querySelector('.blackout'); if (b && b.classList.contains('on')) b.classList.remove('on'); if (openV) closeVideo(); if (zoomOn) zoom(null); return;
      default: return;
    }
    e.preventDefault();
  });

  // toques en celular/tablet
  var tx = null;
  if (!vista) {
    document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) cmd(dx < 0 ? 'next' : 'prev'); tx = null; }, { passive: true });
  }

  // ---------- controles en pantalla
  var hud = document.querySelector('.hud'), idle;
  function wake() { hud.classList.remove('hide'); body.style.cursor = ''; clearTimeout(idle); idle = setTimeout(function () { hud.classList.add('hide'); body.style.cursor = 'none'; }, 2500); }
  if (hud && !vista) {
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
    var extra = []; // ajustes e imágenes cambiadas desde el panel
    if (ajustes && ajustes.t) extra.push('ajustes.json');
    Object.keys((ajustes && ajustes.imagenes) || {}).forEach(function (k) { extra.push(ajustes.imagenes[k]); });
    toast('Guardando la ponencia para usarla sin internet…');
    navigator.serviceWorker.register(root + 'sw.js', { scope: root }).then(function () { return caches.open('jg-ponencias-v1'); })
      .then(function (c) {
        var todo = list.map(function (u) { return { u: u, opc: false }; }).concat(extra.map(function (u) { return { u: u, opc: true }; }));
        return Promise.all(todo.map(function (x) { return fetch(x.u, { cache: 'reload' }).then(function (r) { if (!r.ok) { if (x.opc) return; throw new Error(x.u); } return c.put(new URL(x.u, location.href).href, r); }); }));
      })
      .then(function () { toast('Listo: esta ponencia ya funciona sin internet en este navegador'); })
      .catch(function (err) { toast('No se pudo guardar todo (' + (err && err.message || 'error') + '). Revisa la conexión e inténtalo otra vez'); });
  }

  // ---------- vista del presentador
  var t0 = Date.now(), videoState = 'none';
  function clonar(s) {
    var c = s.cloneNode(true); c.classList.add('on'); c.style.transition = 'none';
    c.querySelectorAll('video').forEach(function (v) { var img = document.createElement('img'); img.src = v.getAttribute('poster') || ''; img.alt = ''; img.style.cssText = 'width:100%;height:100%;object-fit:cover'; v.replaceWith(img); });
    c.querySelectorAll('aside.notes').forEach(function (a) { a.remove(); });
    return c;
  }
  function cloneInto(pane, k, label) {
    pane.innerHTML = '';
    var lab = document.createElement('div'); lab.className = 'label'; lab.textContent = label; pane.appendChild(lab);
    if (k >= N) { var end = document.createElement('div'); end.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;color:#9fb3d9;font-size:20px'; end.textContent = 'Fin de la presentación'; pane.appendChild(end); return; }
    var st = document.createElement('div'); st.className = 'stage';
    st.appendChild(clonar(slides[k])); pane.appendChild(st);
    fit(st, pane.clientWidth, pane.clientHeight);
  }
  function renderPresenter() {
    var pv = document.querySelector('.pv'); if (!pv) return;
    cloneInto(pv.querySelector('.cur'), i, 'AHORA · ' + (i + 1) + ' / ' + N);
    cloneInto(pv.querySelector('.nxt'), i + 1, 'SIGUIENTE');
    var notes = slides[i].querySelector('aside.notes');
    var simple = slides[i].querySelector('.simple, .say');
    var html = '';
    if (simple) html += '<p><b>En pantalla:</b> ' + escH(simple.textContent.replace(/^\s*(EN PALABRAS SIMPLES|ANTES DE DAR PLAY)\s*/i, '')) + '</p>';
    if (notes) html += notes.innerHTML;
    if (vidOf(i)) html = '<p style="color:#BF0085"><b>Video: ' + ({ none: '', idle: 'listo · «siguiente» lo abre en grande', wait: 'abriéndose…', open: 'en grande, reproduciéndose · «siguiente» vuelve a la diapositiva', paused: 'en pausa', ended: 'terminó · «siguiente» vuelve a la diapositiva', done: 'visto · «siguiente» avanza' }[videoState] || '') + '</b></p>' + html;
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
  }

  // ---------- cuadrícula de todas las diapositivas (?vista=grid, la usa el celular)
  var gridEl = null;
  function pintarGrid() {
    if (!gridEl) { gridEl = document.createElement('div'); gridEl.className = 'dgrid'; body.appendChild(gridEl);
      gridEl.addEventListener('click', function (e) { var c = e.target.closest('[data-i]'); if (!c) return; var n = +c.getAttribute('data-i'); try { parent.postMessage({ t: 'deck-elegir', i: n }, location.origin); } catch (er) { } }); }
    gridEl.innerHTML = '';
    slides.forEach(function (s, n) {
      var cell = document.createElement('div'); cell.className = 'dcell'; cell.setAttribute('data-i', String(n));
      var st = document.createElement('div'); st.className = 'stage'; st.appendChild(clonar(s));
      cell.appendChild(st); var num = document.createElement('span'); num.className = 'dnum'; num.textContent = String(n + 1); cell.appendChild(num);
      gridEl.appendChild(cell);
    });
    requestAnimationFrame(function () { Array.prototype.forEach.call(gridEl.querySelectorAll('.dcell'), function (c) { fit(c.querySelector('.stage'), c.clientWidth, c.clientHeight); }); marcarGrid(); });
  }
  function marcarGrid() { if (!gridEl) return; Array.prototype.forEach.call(gridEl.querySelectorAll('.dcell'), function (c) { c.classList.toggle('cur', +c.getAttribute('data-i') === i); }); var cur = gridEl.querySelector('.dcell.cur'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'center' }); }

  // ---------- API para el celular (remoto.js), el panel (/admin) y la miniatura
  function tituloDe(s) {
    var t = s.querySelector('.title, h1, .vside div[style*="font-size:46px"]'), img = s.querySelector('img.full');
    var titulo = t ? t.textContent.trim() : img ? (img.getAttribute('alt') || '').replace(/^Diapositiva \d+:?\s*/, '') : '';
    var k2 = s.querySelector('.kicker, .ck'); if (k2 && !titulo) titulo = k2.textContent.trim();
    return titulo;
  }
  function textoDe(n) {
    var s = slides[n]; if (!s) return { titulo: '', notas: '' };
    var simple = s.querySelector('.simple, .say'), k = +s.getAttribute('data-k');
    var partes = [];
    if (simple) partes.push(simple.textContent.replace(/^\s*(EN PALABRAS SIMPLES|ANTES DE DAR PLAY)\s*/i, '').trim());
    var nota = notaTexto(k); if (nota) partes.push(nota);
    return { titulo: tituloDe(s), notas: partes.join('\n\n'), nota: nota, k: k };
  }
  function irK(k) { var n = slides.indexOf(todas[k]); if (n >= 0) show(n, true); }
  window.DECK = {
    cmd: function (c, n) { run(c, n); },
    pantallaCompleta: fullscreen,
    toast: toast,
    estado: function () {
      var b = document.querySelector('.blackout');
      return { i: i, n: N, video: stateOf(vidOf(i)), negro: !!(b && b.classList.contains('on')),
        actual: textoDe(i), siguiente: textoDe(i + 1), lista: slides.map(function (s, n) { return tituloDe(s) || ('Diapositiva ' + (n + 1)); }) };
    },
    ponerNota: function (k, texto) { ponerNota(k, texto); if (chan) chan.postMessage({ t: 'nota', k: k, texto: texto }); },
    ajustes: function () { return ajustes; },
    presentador: presenter, vista: vista,
    // para el panel /admin
    editor: {
      lista: function () {
        return todas.map(function (s, k) {
          var img = s.querySelector('img.full');
          return { k: k, titulo: tituloDe(s), tipo: img ? 'imagen' : 'html', img: orig[k].img, video: !!s.querySelector('video, .vbox'),
            nota: notaDeHtml(orig[k].notas), textos: orig[k].els.map(function (o, j) { return { id: k + ':' + j, etiqueta: etiqueta(o.el), texto: o.texto }; }) };
        });
      },
      aplicar: function (aj) { aplicar(aj, false); },
      ir: irK
    }
  };

  // ---------- inicio: primero lee ajustes.json (si existe) y luego muestra
  function arrancar() {
    var h = parseInt((location.hash || '').replace('#', ''), 10);
    slides[0].classList.add('on'); i = 0;
    show(isNaN(h) ? 0 : h - 1, true);
    fitMain();
    stage.style.opacity = '';
    if (presenter && chan) chan.postMessage({ t: 'hello' });
    if (!vista) window.addEventListener('hashchange', function () { var n = parseInt(location.hash.replace('#', ''), 10); if (!isNaN(n) && n - 1 !== i) show(n - 1); });
    document.fonts && document.fonts.ready.then(function () { if (presenter) renderPresenter(); if (grid) pintarGrid(); });
    try { document.dispatchEvent(new CustomEvent('deck:listo')); } catch (e) { }
    broadcast();
  }
  var empezado = false;
  function empezar(aj) { if (empezado) return; empezado = true; aplicar(aj, !editor); arrancar(); }
  if (/[?&]sinajustes\b/.test(Q) || location.protocol === 'file:') empezar({});
  else {
    stage.style.opacity = '0';
    setTimeout(function () { empezar({}); }, 2500); // sin internet o sin archivo: sigue igual
    fetch('ajustes.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : {}; }).then(empezar, function () { empezar({}); });
  }
})();
