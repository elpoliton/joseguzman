/* remoto.js — controlar una ponencia desde el celular (politon.pe/joseguzman/control/).
   La laptop publica el estado en apps/ponencias/usuarios/{uid} (Firebase) y obedece los comandos que escribe el celular.
   Solo se activa cuando el presentador pulsa «Celular» e inicia sesión con Google. */
(function () {
  'use strict';
  if (!window.DECK || window.DECK.presentador || !window.Nube) return;
  var root = document.body.getAttribute('data-root') || './';
  var CONTROL = 'https://politon.pe/joseguzman/control/';
  var ref = null, usuario = null, quitar = null, vistos = null, inicio = Date.now(), tPub = null, celularVisto = 0;
  var ACT = 'jg-remoto-activo';
  var activo = function () { try { return sessionStorage.getItem(ACT) === '1'; } catch (e) { return false; } };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

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
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'; s.onload = hacer;
      s.onerror = function () { ok('<p>No se pudo generar el QR. Abre en tu celular: <b>' + esc(CONTROL) + '</b></p>'); }; document.head.appendChild(s);
    });
  }
  function pintarModal(err) {
    if (!usuario) {
      body.innerHTML = '<ol class="rm-pasos"><li>Entra con tu cuenta de Google aquí (una vez).</li><li>Escanea el QR con tu celular y entra con la misma cuenta.</li><li>Listo: pasa las diapositivas, ve tus notas y el cronómetro desde el celular.</li></ol>' +
        '<button class="rm-g" id="rmEntrar">Entrar con Google</button>' + (err ? '<p class="rm-err">' + esc(err) + '</p>' : '');
      body.querySelector('#rmEntrar').onclick = function () { this.textContent = 'Abriendo Google…'; Nube.entrar().catch(function (e) { pintarModal(Nube.mensajeError(e)); }); };
      return;
    }
    var conectado = Date.now() - celularVisto < 45000;
    body.innerHTML = '<div class="rm-grid"><div class="rm-qr" id="rmQr"></div><div>' +
      '<p class="rm-st ' + (conectado ? 'ok' : '') + '">' + (conectado ? '✅ Celular conectado' : '⏳ Esperando al celular…') + '</p>' +
      '<p>Escanea el código o abre en tu celular:<br><b>politon.pe/joseguzman/control</b></p>' +
      '<p class="rm-small">Sesión: ' + esc(usuario.email || '') + ' · <button class="rm-link" id="rmSalir">Cerrar sesión</button></p>' +
      (err ? '<p class="rm-err">' + esc(err) + '</p>' : '') + '</div></div>';
    qr(CONTROL).then(function (svg) { var q = document.getElementById('rmQr'); if (q) q.innerHTML = svg; });
    body.querySelector('#rmSalir').onclick = function () { try { sessionStorage.removeItem(ACT); } catch (e) { } Nube.salir(); };
  }
  btn.onclick = function () {
    try { sessionStorage.setItem(ACT, '1'); } catch (e) { }
    modal.hidden = false; body.innerHTML = '<p>Conectando…</p>';
    escuchar();
  };

  // ---------- publicar el estado y obedecer comandos
  function publicar() {
    if (!ref) return;
    clearTimeout(tPub);
    tPub = setTimeout(function () {
      var e = DECK.estado();
      ref.set({ sesion: { deck: location.pathname, titulo: document.title.replace(/\s*\|.*$/, ''), i: e.i, n: e.n, video: e.video, negro: e.negro,
        actual: e.actual, siguiente: e.siguiente, url: location.href.split('#')[0], t: firebase.firestore.FieldValue.serverTimestamp() } }, { merge: true })
        .catch(function (er) { pintarModal(Nube.mensajeError(er)); });
    }, 120);
  }
  document.addEventListener('deck:cambio', publicar);

  function alUsuario(u) {
    usuario = u; if (quitar) { quitar(); quitar = null; } ref = null;
    btn.classList.remove('on');
    if (!u || !activo()) { if (!modal.hidden) pintarModal(); return; }
    Nube.doc('ponencias').then(function (r) {
      ref = r; vistos = null; btn.classList.add('on'); publicar();
      quitar = r.onSnapshot(function (s) {
        if (!s.exists) return;
        var d = s.data(), cel = d.celular;
        if (cel && cel.visto && cel.visto.toMillis) { var antes = celularVisto; celularVisto = cel.visto.toMillis(); if (!antes && Date.now() - celularVisto < 45000) DECK.toast('📱 Celular conectado'); }
        if (!modal.hidden) pintarModal();
        // cola de comandos del celular: se ejecutan en orden los que no se han visto (al conectar, los existentes se ignoran)
        var cola = Array.isArray(d.cola) ? d.cola : [];
        if (!vistos) { vistos = {}; cola.forEach(function (x) { vistos[x.id] = 1; }); return; }
        cola.forEach(function (x) {
          if (!x || !x.id || vistos[x.id]) return; vistos[x.id] = 1;
          DECK.cmd(x.c, x.n);
        });
      }, function (e) { pintarModal(Nube.mensajeError(e)); });
    }).catch(function (e) { pintarModal(Nube.mensajeError(e)); });
  }
  var escuchando = false;
  function escuchar() { if (escuchando) { alUsuario(usuario); return; } escuchando = true; Nube.alCambiarUsuario(alUsuario).catch(function () { pintarModal('No se pudo conectar con Firebase'); }); }
  if (activo()) escuchar(); // al recargar la página sigue conectado
})();
