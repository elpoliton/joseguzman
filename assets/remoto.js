/* remoto.js — controlar una ponencia desde el celular (politon.pe/joseguzman/control/), sin registrarse.
   Al pulsar «📱 Celular», la laptop crea un código de sala largo y aleatorio y lo muestra en un QR.
   El celular que escanea ese QR queda emparejado (lo recuerda) y ambos comparten el documento salas-ponencias/{código} en Firebase:
   la laptop publica el estado y obedece los comandos que escribe el celular. El código se guarda en esta laptop
   para que el celular siga conectado en otras ponencias; «Cambiar código» desconecta a los celulares anteriores. */
(function () {
  'use strict';
  if (!window.DECK || window.DECK.presentador || window.DECK.vista || !window.Nube) return;
  var CONTROL = 'https://politon.pe/joseguzman/control/';
  var KSALA = 'jg-sala';
  var ref = null, quitar = null, vistos = null, tPub = null, celularVisto = 0, sala = null;
  // clave de esta ponencia (para las notas escritas desde el celular): su ruta dentro de /ponencias/
  var RUTA = (location.pathname.split('/ponencias/')[1] || location.pathname).replace(/index\.html$/, '');
  var CLAVE = RUTA.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
  var refLaser = null, quitarLaser = null, notasAplicadas = {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function leerSala() { try { return localStorage.getItem(KSALA); } catch (e) { return null; } }
  function nuevaSala() {
    var b = new Uint8Array(18); (window.crypto || window.msCrypto).getRandomValues(b);
    var s = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    try { localStorage.setItem(KSALA, s); } catch (e) { }
    return s;
  }

  // ---------- botón en los controles
  var hud = document.querySelector('.hud'), help = hud && hud.querySelector('[data-do="help"]');
  var btn = document.createElement('button'); btn.className = 'rm-btn'; btn.title = 'Controlar con el celular';
  btn.innerHTML = '<span class="rm-dot"></span>📱 Celular';
  if (hud) hud.insertBefore(btn, help || null);

  // ---------- ventana con el QR
  var modal = document.createElement('div'); modal.className = 'rm-modal'; modal.hidden = true;
  modal.innerHTML = '<div class="rm-box" role="dialog" aria-label="Controlar con el celular"><button class="rm-x" aria-label="Cerrar">×</button>' +
    '<h3>Controla esta ponencia con tu celular</h3><div class="rm-body"></div></div>';
  document.body.appendChild(modal);
  var body = modal.querySelector('.rm-body');
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.rm-x')) modal.hidden = true; });
  document.addEventListener('keydown', function (e) { if (!modal.hidden && e.key === 'Escape') modal.hidden = true; }, true);

  function qr(texto) {
    return new Promise(function (ok) {
      function hacer() { var q = qrcode(0, 'M'); q.addData(texto); q.make(); ok(q.createSvgTag({ cellSize: 6, margin: 2, scalable: true })); }
      if (window.qrcode) return hacer();
      var s = document.createElement('script'); s.src = (document.body.getAttribute('data-root') || './') + 'assets/qrcode.js'; s.onload = hacer; // copia local del generador de QR
      s.onerror = function () { ok('<p>No se pudo generar el QR. Revisa el internet.</p>'); }; document.head.appendChild(s);
    });
  }
  function enlace() { return CONTROL + '#sala=' + sala; }
  var qrHecho = null;
  function pintarModal(err) {
    if (!sala) { body.innerHTML = '<p>Preparando…</p>'; return; }
    var conectado = Date.now() - celularVisto < 45000;
    if (qrHecho !== sala || !body.querySelector('#rmQr')) {
      body.innerHTML = '<div class="rm-grid"><div class="rm-qr" id="rmQr"></div><div>' +
        '<p class="rm-st" id="rmSt"></p>' +
        '<ol class="rm-pasos"><li>Abre la <b>cámara</b> del celular y apunta a este código.</li><li>Toca el enlace que aparece. <b>No necesitas registrarte.</b></li><li>Listo: el celular queda emparejado con esta laptop, también para tus otras ponencias.</li></ol>' +
        '<p class="rm-small"><button class="rm-link" id="rmCopiar">Copiar enlace</button> · <button class="rm-link" id="rmNuevo">Cambiar código</button> (desconecta los celulares anteriores)</p>' +
        '<p class="rm-err" id="rmErr"></p></div></div>';
      qrHecho = sala;
      qr(enlace()).then(function (svg) { var q = document.getElementById('rmQr'); if (q) q.innerHTML = svg; });
      body.querySelector('#rmCopiar').onclick = function () { var b = this; (navigator.clipboard ? navigator.clipboard.writeText(enlace()) : Promise.reject()).then(function () { b.textContent = '¡Copiado!'; }, function () { prompt('Copia este enlace:', enlace()); }); };
      body.querySelector('#rmNuevo').onclick = function () { if (!confirm('¿Crear un código nuevo? El celular tendrá que escanear el QR otra vez.')) return; sala = nuevaSala(); conectar(); pintarModal(); };
    }
    var st = body.querySelector('#rmSt'); st.className = 'rm-st' + (conectado ? ' ok' : ''); st.textContent = conectado ? '✅ Celular conectado' : '⏳ Esperando al celular…';
    body.querySelector('#rmErr').textContent = err || '';
  }
  btn.onclick = function () {
    if (!sala) sala = leerSala() || nuevaSala();
    modal.hidden = false; pintarModal();
    if (!ref) conectar();
  };

  // ---------- publicar el estado y obedecer comandos
  function publicar() {
    if (!ref) return;
    clearTimeout(tPub);
    tPub = setTimeout(function () {
      var e = DECK.estado();
      ref.set({ sesion: { deck: location.pathname, ruta: RUTA, clave: CLAVE, titulo: document.title.replace(/\s*\|.*$/, ''), i: e.i, n: e.n, video: e.video, negro: e.negro, full: !!e.full, fullPend: !!e.fullPend,
        actual: e.actual, siguiente: e.siguiente, lista: e.lista, url: location.href.split('#')[0].split('?')[0], t: firebase.firestore.FieldValue.serverTimestamp() } }, { merge: true })
        .catch(function (er) { pintarModal(Nube.mensajeError(er)); });
    }, 120);
  }
  document.addEventListener('deck:cambio', publicar);

  function conectar() {
    if (quitar) { quitar(); quitar = null; } if (quitarLaser) { quitarLaser(); quitarLaser = null; }
    ref = null; refLaser = null; vistos = null; celularVisto = 0; btn.classList.remove('on');
    var miSala = sala;
    Nube.sala(miSala).then(function (r) {
      if (miSala !== sala) return;
      ref = r; btn.classList.add('on'); publicar();
      quitar = r.onSnapshot(function (s) {
        if (!s.exists) return;
        var d = s.data(), cel = d.celular;
        if (cel && cel.visto && cel.visto.toMillis) { var antes = celularVisto; celularVisto = cel.visto.toMillis(); if (!antes && Date.now() - celularVisto < 45000) DECK.toast('📱 Celular conectado'); }
        if (!modal.hidden) pintarModal();
        // notas escritas desde el celular (ganan si son más nuevas que lo guardado en el panel)
        var mias = d.notas && d.notas[CLAVE], cambio = false, base = (DECK.ajustes() || {}).t || 0;
        if (mias) Object.keys(mias).forEach(function (k) {
          var x = mias[k]; if (!x || typeof x.texto !== 'string') return;
          var tt = x.t && x.t.toMillis ? x.t.toMillis() : (+x.t || 0);
          if (tt <= base || notasAplicadas[k] === tt) return;
          notasAplicadas[k] = tt; DECK.ponerNota(+k, x.texto); cambio = true;
        });
        if (cambio) publicar();
        // cola de comandos del celular: se ejecutan en orden los que no se han visto (al conectar, los existentes se ignoran)
        var cola = Array.isArray(d.cola) ? d.cola : [];
        if (!vistos) { vistos = {}; cola.forEach(function (x) { vistos[x.id] = 1; }); return; }
        cola.forEach(function (x) {
          if (!x || !x.id || vistos[x.id]) return; vistos[x.id] = 1;
          DECK.cmd(x.c, x.n);
        });
      }, function (e) { pintarModal(Nube.mensajeError(e)); btn.classList.remove('on'); });
      // puntero láser: documento aparte para no mezclarse con los comandos
      return Nube.sala(miSala + '-laser').then(function (rl) {
        refLaser = rl;
        quitarLaser = rl.onSnapshot(function (s) { var p = s.exists ? s.data() : null; var t = p && p.t && p.t.toMillis ? p.t.toMillis() : 0;
          DECK.cmd('laser', p && p.on && Date.now() - t < 15000 ? p : null); }, function () { });
      });
    }).catch(function (e) { pintarModal(Nube.mensajeError(e)); });
  }
  // si esta laptop ya tiene un celular emparejado, se conecta sola (también en otras ponencias)
  sala = leerSala();
  if (sala) conectar();
})();
