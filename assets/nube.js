/* nube.js — conexión con Firebase (proyecto organizador-politon) para politon.pe/joseguzman.
   Carga el SDK solo cuando hace falta. Cada web guarda en su propia ruta: apps/{app}/usuarios/{uid}
   (contabilidad → apps/contabilidad/…, control remoto → apps/ponencias/…), separada del organizador. */
(function () {
  'use strict';
  var CONFIG = {
    apiKey: 'AIzaSyBBxHSBfqaL_pOE2xtpZfgivmvRDhJT1XE',
    authDomain: 'organizador-politon.firebaseapp.com',
    projectId: 'organizador-politon',
    storageBucket: 'organizador-politon.firebasestorage.app',
    messagingSenderId: '358075034604',
    appId: '1:358075034604:web:ea3d0ed2918df3639aaec9'
  };
  var V = '10.12.5', BASE = 'https://www.gstatic.com/firebasejs/' + V + '/';
  var listo = null;
  function script(src) { return new Promise(function (ok, ko) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = function () { ko(new Error('No se pudo cargar ' + src)); }; document.head.appendChild(s); }); }
  function cargar() {
    if (listo) return listo;
    listo = script(BASE + 'firebase-app-compat.js')
      .then(function () { return Promise.all([script(BASE + 'firebase-auth-compat.js'), script(BASE + 'firebase-firestore-compat.js')]); })
      .then(function () {
        var app = firebase.apps.length ? firebase.app() : firebase.initializeApp(CONFIG);
        var auth = app.auth(); auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        return { app: app, auth: auth, db: app.firestore(), fb: firebase };
      });
    return listo;
  }
  var MARCA = 'jg-nube-sesion';
  window.Nube = {
    cargar: cargar,
    // ¿hubo sesión antes en este navegador? (para cargar el SDK solo si hace falta)
    huboSesion: function () { try { return localStorage.getItem(MARCA) === '1'; } catch (e) { return false; } },
    alCambiarUsuario: function (cb) { return cargar().then(function (F) { return F.auth.onAuthStateChanged(function (u) { try { localStorage.setItem(MARCA, u ? '1' : '0'); } catch (e) { } cb(u, F); }); }); },
    entrar: function () {
      return cargar().then(function (F) {
        var p = new F.fb.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
        return F.auth.signInWithPopup(p).catch(function (e) {
          if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return F.auth.signInWithRedirect(p);
          throw e;
        });
      });
    },
    salir: function () { return cargar().then(function (F) { try { localStorage.setItem(MARCA, '0'); } catch (e) { } return F.auth.signOut(); }); },
    doc: function (appSlug) { return cargar().then(function (F) { var u = F.auth.currentUser; if (!u) throw new Error('Sin sesión'); return F.db.collection('apps').doc(appSlug).collection('usuarios').doc(u.uid); }); },
    mensajeError: function (e) {
      var c = (e && e.code) || '';
      if (c === 'auth/unauthorized-domain') return 'Este dominio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados → agrega politon.pe).';
      if (c === 'permission-denied' || /permission/i.test(e && e.message)) return 'Firebase rechazó el acceso: revisa las reglas de Firestore para apps/{app}/usuarios/{uid}.';
      if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return 'Se cerró la ventana de Google antes de terminar.';
      if (c === 'unavailable' || c === 'auth/network-request-failed') return 'Sin conexión con Firebase. Revisa el internet.';
      return (e && e.message) || 'Error desconocido';
    }
  };
})();
