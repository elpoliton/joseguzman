/* espejo.js — varias pantallas sincronizadas con la ponencia (laptops, tablets, celulares del público).
   En la laptop principal, el botón «🖥️ Pantallas» crea un código de espejo y muestra un QR/enlace.
   Cada pantalla que abre ese enlace (…/?espejo=<código>) se vuelve una copia «solo lectura»: muestra la misma diapositiva,
   la pantalla negra, el zoom, el puntero láser y el estado de las diapositivas interactivas (red de códigos), sin poder moverse sola.
   La laptop principal obedece al celular (remoto.js) o al teclado/puntero, y publica su estado en salas-ponencias/esp-<código>.
   El código del espejo es distinto del código del celular: quien tiene el enlace de espejo solo puede mirar, no controlar. */
(function () {
  'use strict';
  if (!window.DECK || window.DECK.presentador || window.DECK.vista || !window.Nube) return;
  var Q = location.search, m = /[?&]espejo=([a-f0-9]{16,64})/i.exec(Q);
  var KESP = 'jg-espejo';
  var PATH = location.pathname.replace(/index\.html$/, '');
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function aleatorio() { var b = new Uint8Array(16); (window.crypto || window.msCrypto).getRandomValues(b); return Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
  var red = function () { return window.REDSYNC || null; };

  // ================================================================ PANTALLA ESPEJO (seguidora)
  if (m) {
    var code = m[1].toLowerCase(), yo = aleatorio().slice(0, 10);
    document.body.classList.add('espejo');
    // bloquea la navegación propia: teclado, toques y rueda (la pantalla solo sigue a la principal)
    var NAV = /^(Arrow|Page|Home|End|Backspace| |Spacebar|Enter|[0-9nNpPbBkK.sS?hH])/;
    window.addEventListener('keydown', function (e) { if (e.key === 'f' || e.key === 'F' || e.key === 'F5') return; if (NAV.test(e.key)) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    ['touchstart', 'touchend', 'wheel'].forEach(function (ev) { window.addEventListener(ev, function (e) { e.stopImmediatePropagation(); }, { capture: true, passive: true }); });
    // aviso: tocar para pantalla completa y mantener la pantalla encendida
    var av = document.createElement('div'); av.className = 'esp-aviso';
    av.innerHTML = '<b>🖥️ Pantalla sincronizada</b><span class="esp-st">Conectando…</span><small>Toca la pantalla para verla completa. Esta pantalla sigue al presentador.</small>';
    document.body.appendChild(av);
    var st = av.querySelector('.esp-st'), wl = null;
    function despertar() { try { if (navigator.wakeLock && !wl) navigator.wakeLock.request('screen').then(function (w) { wl = w; w.addEventListener('release', function () { wl = null; }); }, function () { }); } catch (e) { } }
    document.addEventListener('pointerdown', function () {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () { });
      despertar(); av.classList.add('min');
    }, true);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') despertar(); });
    var ultimo = 0;
    function aplicar(e) {
      if (!e) return;
      if (e.ruta && e.ruta !== PATH) { location.href = e.ruta + '?espejo=' + code + '#' + ((e.i || 0) + 1); return; }  // el presentador cambió de ponencia
      var s = DECK.estado();
      if (typeof e.i === 'number' && e.i !== s.i) DECK.cmd('go', e.i);
      if (!!e.negro !== !!s.negro) DECK.cmd('black');
      DECK.cmd('zoom', e.zoom || null);
      if (e.red && red()) setTimeout(function () { red().set(e.red); }, 30);
      DECK.cmd('web', e.web || null); // página web abierta dentro de la presentación (misma posición)
    }
    Nube.sala('esp-' + code).then(function (ref) {
      ref.onSnapshot(function (snap) {
        var d = snap.exists ? snap.data() : null;
        if (!d || !d.estado) { st.textContent = 'Esperando al presentador…'; return; }
        ultimo = Date.now(); st.textContent = 'Conectada · diapositiva ' + ((d.estado.i || 0) + 1);
        aplicar(d.estado);
      }, function (er) { st.textContent = Nube.mensajeError(er); });
      // latido: la principal cuenta cuántas pantallas siguen conectadas
      function latido() { var o = {}; o[yo] = firebase.firestore.FieldValue.serverTimestamp(); ref.set({ pantallas: o }, { merge: true }).catch(function () { }); }
      latido(); setInterval(latido, 20000);
      return Nube.sala('esp-' + code + '-laser').then(function (rl) {
        rl.onSnapshot(function (s) { var p = s.exists ? s.data() : null; var t = p && p.t && p.t.toMillis ? p.t.toMillis() : 0; DECK.cmd('laser', p && p.on && Date.now() - t < 15000 ? p : null); }, function () { });
      });
    }).catch(function (er) { st.textContent = Nube.mensajeError(er); });
    setInterval(function () { if (ultimo && Date.now() - ultimo > 120000) st.textContent = 'Sin novedades del presentador (revisa el internet)'; }, 15000);
    return;
  }

  // ================================================================ PANTALLA PRINCIPAL
  var esp = null, ref = null, refL = null, tPub = null, tL = null, pantallas = 0, zoomActual = null, quitar = null;
  function leer() { try { return localStorage.getItem(KESP); } catch (e) { return null; } }
  function nuevo() { var c = aleatorio(); try { localStorage.setItem(KESP, c); } catch (e) { } return c; }
  function enlace() { return location.origin + PATH + '?espejo=' + esp; }

  var hud = document.querySelector('.hud'), help = hud && hud.querySelector('[data-do="help"]');
  var btn = document.createElement('button'); btn.className = 'rm-btn esp-btn'; btn.title = 'Sincronizar otras pantallas (laptops, tablets)';
  btn.innerHTML = '<span class="rm-dot"></span>🖥️ Pantallas<b class="esp-n"></b>';
  if (hud) hud.insertBefore(btn, help || null);
  var nEl = btn.querySelector('.esp-n');

  var modal = document.createElement('div'); modal.className = 'rm-modal'; modal.hidden = true;
  modal.innerHTML = '<div class="rm-box" role="dialog" aria-label="Pantallas sincronizadas"><button class="rm-x" aria-label="Cerrar">×</button>' +
    '<h3>Muestra esta ponencia en otras pantallas</h3><div class="rm-body"></div></div>';
  document.body.appendChild(modal);
  var body = modal.querySelector('.rm-body');
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.rm-x')) modal.hidden = true; });
  document.addEventListener('keydown', function (e) { if (!modal.hidden && e.key === 'Escape') modal.hidden = true; }, true);

  function qr(texto) {
    return new Promise(function (ok) {
      function hacer() { var q = qrcode(0, 'M'); q.addData(texto); q.make(); ok(q.createSvgTag({ cellSize: 6, margin: 2, scalable: true })); }
      if (window.qrcode) return hacer();
      var s = document.createElement('script'); s.src = (document.body.getAttribute('data-root') || './') + 'assets/qrcode.js'; s.onload = hacer;
      s.onerror = function () { ok('<p>No se pudo generar el QR.</p>'); }; document.head.appendChild(s);
    });
  }
  var hecho = null;
  function pintar(err) {
    if (!esp) { body.innerHTML = '<p>Preparando…</p>'; return; }
    if (hecho !== esp || !body.querySelector('#espQr')) {
      body.innerHTML = '<div class="rm-grid"><div class="rm-qr" id="espQr"></div><div>' +
        '<p class="rm-st" id="espSt"></p>' +
        '<ol class="rm-pasos"><li>En cada laptop o tablet, <b>escanea este código</b> o abre el enlace.</li><li>Toca la pantalla una vez para verla <b>completa</b>.</li><li>Listo: todas muestran lo mismo que esta laptop. Tú avanzas con el celular o el puntero.</li></ol>' +
        '<p class="rm-small"><input class="esp-url" readonly value="' + esc(enlace()) + '"></p>' +
        '<p class="rm-small"><button class="rm-link" id="espCopiar">Copiar enlace</button> · <button class="rm-link" id="espNuevo">Cambiar código</button> (desconecta las pantallas actuales)</p>' +
        '<p class="rm-small">Las pantallas copia no pueden avanzar solas. Necesitan internet.</p>' +
        '<p class="rm-err" id="espErr" hidden></p></div></div>';
      hecho = esp;
      qr(enlace()).then(function (svg) { var q = document.getElementById('espQr'); if (q) q.innerHTML = svg; });
      body.querySelector('#espCopiar').onclick = function () { var b = this; (navigator.clipboard ? navigator.clipboard.writeText(enlace()) : Promise.reject()).then(function () { b.textContent = '¡Copiado!'; }, function () { prompt('Copia este enlace:', enlace()); }); };
      body.querySelector('#espNuevo').onclick = function () { if (!confirm('¿Crear un código nuevo? Las pantallas tendrán que abrir el enlace otra vez.')) return; esp = nuevo(); conectar(); pintar(); };
    }
    var s = body.querySelector('#espSt'); s.className = 'rm-st' + (pantallas ? ' ok' : '');
    s.textContent = pantallas ? '✅ ' + pantallas + (pantallas === 1 ? ' pantalla conectada' : ' pantallas conectadas') : '⏳ Esperando pantallas…';
    var er = body.querySelector('#espErr'); er.hidden = !err; er.textContent = err || '';
  }
  btn.onclick = function () { if (!esp) { esp = leer() || nuevo(); conectar(); } modal.hidden = false; pintar(); };

  function estado() {
    var e = DECK.estado(), r = red();
    return { i: e.i, n: e.n, negro: !!e.negro, zoom: zoomActual, red: r ? r.get() : null, web: e.web || null, ruta: PATH, t: firebase.firestore.FieldValue.serverTimestamp() };
  }
  function publicar() {
    if (!ref) return; clearTimeout(tPub);
    tPub = setTimeout(function () { ref.set({ estado: estado() }, { merge: true }).catch(function (er) { if (!modal.hidden) pintar(Nube.mensajeError(er)); }); }, 60);
  }
  document.addEventListener('deck:cambio', publicar);
  document.addEventListener('red:cambio', publicar);
  // la pantalla negra y el zoom no siempre disparan deck:cambio: se envuelven los comandos
  var cmd0 = DECK.cmd;
  DECK.cmd = function (c, n) {
    cmd0(c, n);
    if (c === 'zoom') { zoomActual = n && n.x != null ? { x: n.x, y: n.y, z: n.z || 2.2 } : null; publicar(); }
    else if (c === 'black') publicar();
    else if (c === 'laser' && refL) { clearTimeout(tL); var p = n; tL = setTimeout(function () { refL.set(p && p.on ? { on: true, x: p.x, y: p.y, t: firebase.firestore.FieldValue.serverTimestamp() } : { on: false, t: firebase.firestore.FieldValue.serverTimestamp() }).catch(function () { }); }, 40); }
  };
  document.addEventListener('keydown', function (e) { if (e.key === 'b' || e.key === 'B' || e.key === '.') setTimeout(publicar, 30); });

  function conectar() {
    if (quitar) { quitar(); quitar = null; }
    ref = null; refL = null; pantallas = 0; btn.classList.remove('on');
    var mio = esp;
    Nube.sala('esp-' + mio).then(function (r) {
      if (mio !== esp) return;
      ref = r; btn.classList.add('on'); publicar();
      quitar = r.onSnapshot(function (s) {
        var d = s.exists ? s.data() : {}, p = d.pantallas || {}, ahora = Date.now();
        pantallas = Object.keys(p).filter(function (k) { var t = p[k] && p[k].toMillis ? p[k].toMillis() : 0; return ahora - t < 60000; }).length;
        nEl.textContent = pantallas ? ' · ' + pantallas : '';
        if (!modal.hidden) pintar();
      }, function (er) { if (!modal.hidden) pintar(Nube.mensajeError(er)); });
      return Nube.sala('esp-' + mio + '-laser').then(function (rl) { refL = rl; });
    }).catch(function (er) { if (!modal.hidden) pintar(Nube.mensajeError(er)); });
  }
  setInterval(function () { if (ref) publicar(); }, 30000);   // refresco para pantallas que se conectan tarde
  esp = leer(); if (esp) conectar();
})();
