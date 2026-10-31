/* contabilidad-nube.js — sincroniza la práctica de /contabilidad con Firebase (apps/contabilidad/usuarios/{uid}).
   Sin sesión, todo sigue funcionando solo en el navegador. */
(function () {
  'use strict';
  var caja = document.getElementById('nube'); if (!caja || !window.Nube || !window.CX) return;
  var ref = null, usuario = null, tGuardar = null, pendiente = null, quitarEscucha = null;
  var DISP = (function () { try { var d = localStorage.getItem('jg-dispositivo'); if (!d) { d = Math.random().toString(36).slice(2, 10); localStorage.setItem('jg-dispositivo', d); } return d; } catch (e) { return 'x'; } })();
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function pintar(estado, txt) {
    if (!usuario) {
      caja.innerHTML = '<button class="btn line sm nube-btn" id="nubeEntrar" title="Guarda tus asientos en tu cuenta de Google y úsalos en cualquier equipo">☁️ Guardar en la nube</button>' + (txt ? '<span class="nube-st err">' + esc(txt) + '</span>' : '');
      document.getElementById('nubeEntrar').onclick = entrar; return;
    }
    var nom = (usuario.displayName || usuario.email || '').split(' ')[0];
    caja.innerHTML = (usuario.photoURL ? '<img src="' + esc(usuario.photoURL) + '" alt="" referrerpolicy="no-referrer">' : '') +
      '<span class="nube-st ' + (estado || 'ok') + '">' + esc(txt || '☁️ Sincronizado') + '</span>' +
      '<span class="nube-who">' + esc(nom) + ' · <button class="lnk" id="nubeSalir">Salir</button></span>';
    document.getElementById('nubeSalir').onclick = function () { if (confirm('¿Cerrar sesión? Tus asientos quedan guardados en la nube y en este navegador.')) Nube.salir(); };
  }
  function entrar() { pintar('', ''); caja.querySelector('button').textContent = 'Abriendo Google…'; Nube.entrar().catch(function (e) { pintar('', Nube.mensajeError(e)); }); }

  // une lo local con lo de la nube: por cada ejercicio gana la versión más reciente
  function unir(a, b) {
    a = a || {}; b = b || {};
    var out = Object.assign({}, b, { version: a.version || b.version, ultimo: a.ultimo || b.ultimo });
    out.trabajo = {}; var ids = Object.keys(Object.assign({}, a.trabajo, b.trabajo));
    ids.forEach(function (id) { var x = (a.trabajo || {})[id], y = (b.trabajo || {})[id]; out.trabajo[id] = !x ? y : !y ? x : ((x.t || 0) >= (y.t || 0) ? x : y); });
    var vistos = {}; out.propios = (b.propios || []).concat(a.propios || []).filter(function (p) { if (vistos[p.id]) return false; vistos[p.id] = 1; return true; });
    out.estado = Object.assign({}, b.estado, a.estado);
    Object.keys(out.estado).forEach(function (id) { var x = (a.trabajo || {})[id], y = (b.trabajo || {})[id]; if (x && y && (y.t || 0) > (x.t || 0) && !(b.estado || {})[id]) delete out.estado[id]; });
    return out;
  }
  function limpio(S) { return JSON.parse(JSON.stringify(S)); }
  function subir() {
    if (!ref) return;
    pintar('sync', 'Guardando…');
    ref.set({ datos: limpio(CX.estado()), dispositivo: DISP, actualizado: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true })
      .then(function () { pintar('ok', '☁️ Guardado en la nube'); })
      .catch(function (e) { pintar('err', Nube.mensajeError(e)); });
  }
  window.CXnube = { cambio: function () { if (!ref) return; clearTimeout(tGuardar); pintar('sync', 'Cambios sin guardar…'); tGuardar = setTimeout(subir, 1200); } };

  function aplicarRemoto(datos) {
    if (CX.escribiendo()) { pendiente = datos; return; }
    pendiente = null; var m = unir(CX.estado(), datos);
    if (JSON.stringify(m) !== JSON.stringify(CX.estado())) { CX.aplicar(m); CX.toast('Se actualizó desde otro dispositivo'); }
  }
  document.addEventListener('focusout', function () { setTimeout(function () { if (pendiente && !CX.escribiendo()) aplicarRemoto(pendiente); }, 300); });

  function alUsuario(u) {
    usuario = u; if (quitarEscucha) { quitarEscucha(); quitarEscucha = null; } ref = null;
    if (!u) { pintar(); return; }
    pintar('sync', 'Conectando…');
    Nube.doc('contabilidad').then(function (r) {
      ref = r;
      return r.get().then(function (snap) {
        var remoto = snap.exists ? (snap.data().datos || {}) : {};
        var m = unir(CX.estado(), remoto);
        CX.aplicar(m); subir();
        if (snap.exists && Object.keys(remoto.trabajo || {}).length) CX.toast('Tus asientos de la nube están aquí');
        quitarEscucha = r.onSnapshot(function (s) {
          if (s.metadata.hasPendingWrites || !s.exists) return;
          var d = s.data(); if (d.dispositivo === DISP) return;
          aplicarRemoto(d.datos || {});
        }, function (e) { pintar('err', Nube.mensajeError(e)); });
      });
    }).catch(function (e) { ref = null; pintar('err', Nube.mensajeError(e)); });
  }

  pintar();
  Nube.alCambiarUsuario(alUsuario).catch(function (e) { pintar('', 'No se pudo conectar con Firebase'); });
})();
