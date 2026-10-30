/* admin.js — panel de politon.pe/joseguzman. Guarda los cambios en GitHub (elpoliton/joseguzman) con la llave del usuario;
   el flujo «Publicar» los sube a la web y convierte los PowerPoint que lleguen a entrada/. */
(function () {
  'use strict';
  var OWNER = 'elpoliton', REPO = 'joseguzman', BRANCH = 'main', CAT = 'assets/ponencias.js', KEY = 'jg-panel-llave';
  var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO;
  var $ = function (s) { return document.querySelector(s); };
  var tok = null, catalogo = [], cabecera = '', catSha = null, archivo = null, pollT = null;

  // ---------- utilidades
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slug(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'ponencia'; }
  function msg(el, kind, html) { el = $(el); el.className = 'msg on ' + kind; el.innerHTML = html; }
  function clear(el) { $(el).className = 'msg'; }
  function b64FromText(s) { var b = new TextEncoder().encode(s), out = ''; for (var i = 0; i < b.length; i += 0x8000) out += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(out); }
  function textFromB64(b) { var bin = atob(b.replace(/\s/g, '')), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); }
  function b64FromFile(f) { return new Promise(function (ok, ko) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(',')[1]); }; r.onerror = ko; r.readAsDataURL(f); }); }
  var MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  function fechaTexto(f) { var m = /^(\d{4})-(\d{2})/.exec(f || ''); return m ? MESES[+m[2] - 1] + ' ' + m[1] : ''; }
  function hoy() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function hace(t) { var s = Math.round((Date.now() - new Date(t)) / 1000); if (s < 60) return 'hace ' + s + ' s'; if (s < 3600) return 'hace ' + Math.round(s / 60) + ' min'; if (s < 86400) return 'hace ' + Math.round(s / 3600) + ' h'; return new Date(t).toLocaleDateString('es-PE'); }

  // ---------- GitHub
  function api(path, opt) {
    opt = opt || {};
    return fetch(path.indexOf('http') === 0 ? path : API + path, {
      method: opt.method || 'GET',
      headers: { 'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: opt.body ? JSON.stringify(opt.body) : undefined, cache: 'no-store'
    }).then(function (r) {
      if (r.status === 204) return null;
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.message || ('Error ' + r.status)); e.status = r.status; throw e; }
        return j;
      });
    });
  }
  // un solo commit con varios archivos (crear, cambiar o borrar)
  function commit(files, message, intento) {
    var head, baseTree;
    return api('/git/ref/heads/' + BRANCH).then(function (ref) { head = ref.object.sha; return api('/git/commits/' + head); })
      .then(function (c) {
        baseTree = c.tree.sha;
        return Promise.all(files.map(function (f) {
          if (f.borrar) return Promise.resolve({ path: f.path, mode: '100644', type: 'blob', sha: null });
          return api('/git/blobs', { method: 'POST', body: { content: f.b64 || b64FromText(f.text), encoding: 'base64' } })
            .then(function (b) { return { path: f.path, mode: '100644', type: 'blob', sha: b.sha }; });
        }));
      })
      .then(function (tree) { return api('/git/trees', { method: 'POST', body: { base_tree: baseTree, tree: tree } }); })
      .then(function (t) { return api('/git/commits', { method: 'POST', body: { message: message, tree: t.sha, parents: [head] } }); })
      .then(function (c) { return api('/git/refs/heads/' + BRANCH, { method: 'PATCH', body: { sha: c.sha } }); })
      .catch(function (e) { if ((e.status === 422 || e.status === 409) && !intento) return commit(files, message, 1); throw e; });
  }

  // ---------- catálogo
  function cargarCatalogo() {
    return api('/contents/' + CAT + '?ref=' + BRANCH).then(function (f) {
      var src = textFromB64(f.content); catSha = f.sha;
      cabecera = src.slice(0, src.indexOf('['));
      catalogo = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
      return catalogo;
    });
  }
  function textoCatalogo(P) { return cabecera + JSON.stringify(P, null, 2) + ';\n'; }
  function guardarCatalogo(P, mensaje) {
    return commit([{ path: CAT, text: textoCatalogo(P) }], mensaje).then(function () { catalogo = P; pintarLista(); vigilar(); });
  }
  function listas() {
    var cats = {}, subs = {};
    catalogo.forEach(function (p) { cats[p.categoria] = 1; subs[p.subcategoria] = 1; });
    $('#dlCat').innerHTML = Object.keys(cats).map(function (c) { return '<option value="' + esc(c) + '">'; }).join('');
    $('#dlSub').innerHTML = Object.keys(subs).map(function (c) { return '<option value="' + esc(c) + '">'; }).join('');
  }

  // ---------- formulario de ficha (sirve para editar y para subir)
  function campos(form, p, nuevo) {
    p = p || {};
    form.innerHTML =
      '<label class="f">Título *</label><input class="i" name="titulo" required value="' + esc(p.titulo) + '">' +
      '<label class="f">Subtítulo</label><input class="i" name="subtitulo" value="' + esc(p.subtitulo) + '">' +
      '<div class="row2"><div><label class="f">Categoría * <small>(ej. Contabilidad, Política)</small></label><input class="i" name="categoria" list="dlCat" required value="' + esc(p.categoria) + '"></div>' +
      '<div><label class="f">Subcategoría * <small>(curso o evento)</small></label><input class="i" name="subcategoria" list="dlSub" required value="' + esc(p.subcategoria) + '"></div></div>' +
      '<div class="row2"><div><label class="f">Fecha</label><input class="i" type="date" name="fecha" value="' + esc((p.fecha || hoy()).slice(0, 10)) + '"></div>' +
      '<div><label class="f">Lugar</label><input class="i" name="lugar" value="' + esc(p.lugar) + '" placeholder="Ej. CERTUS, Congreso, Lima"></div></div>' +
      '<label class="f">Resumen <small>(aparece en la biblioteca y en Google)</small></label><textarea class="i" name="resumen">' + esc(p.resumen) + '</textarea>' +
      '<label class="f">Etiquetas <small>(separadas por comas)</small></label><input class="i" name="etiquetas" value="' + esc((p.etiquetas || []).join(', ')) + '">' +
      '<label style="display:flex;gap:8px;align-items:center;margin-top:16px;font-size:15px"><input type="checkbox" name="oculto"' + (p.oculto ? ' checked' : '') + '> Oculta (no aparece en la biblioteca)</label>' +
      (nuevo ? '<div class="url" id="urlPrev"></div>' : '');
    if (nuevo) {
      var upd = function () { var f = datos(form); $('#urlPrev').textContent = f.titulo && f.subcategoria ? 'Quedará en: politon.pe/joseguzman/ponencias/' + slug(f.subcategoria) + '/' + slug(f.titulo) + '/' : ''; };
      form.addEventListener('input', upd); upd();
    }
  }
  function datos(form) {
    var g = function (n) { var e = form.elements[n]; return e ? (e.type === 'checkbox' ? e.checked : e.value.trim()) : ''; };
    return { titulo: g('titulo'), subtitulo: g('subtitulo'), categoria: g('categoria'), subcategoria: g('subcategoria'), fecha: g('fecha') || hoy(),
      lugar: g('lugar'), resumen: g('resumen'), etiquetas: g('etiquetas').split(',').map(function (s) { return s.trim(); }).filter(Boolean), oculto: g('oculto') };
  }

  // ---------- biblioteca
  function pintarLista() {
    listas();
    var P = catalogo.slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
    $('#bibCount').textContent = P.length + (P.length === 1 ? ' ponencia' : ' ponencias') + ' · ' + P.filter(function (p) { return p.oculto; }).length + ' ocultas';
    $('#lista').innerHTML = P.map(function (p) {
      return '<div class="item' + (p.oculto ? ' off' : '') + '" data-id="' + esc(p.id) + '">' +
        '<img src="../ponencias/' + esc(p.portada || '') + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
        '<div><h3>' + esc(p.titulo) + (p.oculto ? '<span class="pill">Oculta</span>' : '') + '</h3>' +
        '<div class="m">' + esc(p.categoria) + ' › ' + esc(p.subcategoria) + ' · ' + esc(p.fechaTexto || p.fecha) + ' · ' + (p.diapositivas || '?') + ' diapositivas</div></div>' +
        '<div class="acts"><a class="btn line sm" href="../ponencias/' + esc(p.ruta) + '" target="_blank">Ver</a>' +
        '<button class="btn line sm" data-a="editar">Editar</button>' +
        '<button class="btn line sm" data-a="ocultar">' + (p.oculto ? 'Mostrar' : 'Ocultar') + '</button>' +
        '<button class="btn red sm" data-a="quitar">Quitar</button></div></div>';
    }).join('') || '<div class="empty">Aún no hay ponencias.</div>';
  }
  $('#lista').addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b) return;
    var id = b.closest('.item').getAttribute('data-id'), p = catalogo.find(function (x) { return x.id === id; });
    var a = b.getAttribute('data-a');
    if (a === 'editar') { editando = id; campos($('#fEdit'), p); clear('#dlgMsg'); $('#dlg').showModal(); return; }
    var P = catalogo.map(function (x) { return Object.assign({}, x); }), q = P.find(function (x) { return x.id === id; });
    var m;
    if (a === 'ocultar') { q.oculto = !q.oculto; m = (q.oculto ? 'Ocultar' : 'Mostrar') + ' ponencia: ' + q.titulo; }
    if (a === 'quitar') {
      if (!confirm('¿Quitar «' + p.titulo + '» de la biblioteca?\n\nSus archivos quedan guardados en GitHub; si quieres, luego puedo restaurarla.')) return;
      P = P.filter(function (x) { return x.id !== id; }); m = 'Quitar ponencia de la biblioteca: ' + p.titulo;
    }
    msg('#bibMsg', 'info', 'Guardando…');
    guardarCatalogo(P, m).then(function () { msg('#bibMsg', 'ok', 'Guardado. Se publicará en 1 o 2 minutos (pestaña <b>Publicaciones</b>).'); })
      .catch(function (err) { msg('#bibMsg', 'err', 'No se pudo guardar: ' + esc(err.message)); });
  });
  var editando = null;
  $('#cancelar').onclick = function () { $('#dlg').close(); };
  $('#fEdit').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = datos($('#fEdit')), P = catalogo.map(function (x) { return Object.assign({}, x); }), q = P.find(function (x) { return x.id === editando; });
    Object.assign(q, d, { fechaTexto: fechaTexto(d.fecha) });
    msg('#dlgMsg', 'info', 'Guardando…');
    guardarCatalogo(P, 'Editar ponencia: ' + q.titulo).then(function () { $('#dlg').close(); msg('#bibMsg', 'ok', 'Cambios guardados. Se publicarán en 1 o 2 minutos.'); })
      .catch(function (err) { msg('#dlgMsg', 'err', 'No se pudo guardar: ' + esc(err.message)); });
  });
  $('#recargar').onclick = function () { cargarCatalogo().then(pintarLista); };

  // ---------- subir PowerPoint
  var drop = $('#drop'), inp = $('#file');
  function elegir(f) {
    if (!f) return;
    if (!/\.pptx$/i.test(f.name)) { msg('#subMsg', 'err', 'El archivo debe ser .pptx (PowerPoint). Si es .ppt, ábrelo en PowerPoint y guárdalo como .pptx.'); return; }
    if (f.size > 50 * 1024 * 1024) { msg('#subMsg', 'err', 'El archivo pesa ' + (f.size / 1048576).toFixed(1) + ' MB; el máximo es 50 MB. Comprime los videos o imágenes en PowerPoint (Archivo → Comprimir medios).'); return; }
    archivo = f; $('#fn').textContent = f.name + ' · ' + (f.size / 1048576).toFixed(1) + ' MB'; clear('#subMsg');
    var t = $('#fSub').elements.titulo; if (t && !t.value) { t.value = f.name.replace(/\.pptx$/i, '').replace(/[_-]+/g, ' '); t.dispatchEvent(new Event('input', { bubbles: true })); }
  }
  drop.onclick = function () { inp.click(); };
  drop.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } };
  inp.onchange = function () { elegir(inp.files[0]); };
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('on'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('on'); }); });
  drop.addEventListener('drop', function (e) { elegir(e.dataTransfer.files[0]); });
  $('#fSub').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!archivo) { msg('#subMsg', 'err', 'Primero elige el archivo .pptx.'); return; }
    var d = datos($('#fSub')), id = slug(d.titulo);
    var existe = catalogo.find(function (p) { return p.id === id; });
    if (existe && !confirm('Ya hay una ponencia con el título «' + existe.titulo + '». ¿Reemplazarla por este PowerPoint?')) return;
    var btn = $('#subir'); btn.disabled = true;
    msg('#subMsg', 'info', 'Subiendo ' + esc(archivo.name) + '… no cierres esta página.');
    b64FromFile(archivo).then(function (b64) {
      var meta = Object.assign({ id: id, pptx: 'entrada/' + id + '.pptx' }, d);
      return commit([{ path: 'entrada/' + id + '.pptx', b64: b64 }, { path: 'entrada/' + id + '.json', text: JSON.stringify(meta, null, 2) + '\n' }], 'Subir PowerPoint: ' + d.titulo);
    }).then(function () {
      msg('#subMsg', 'ok', '¡Subido! Ahora GitHub lo convierte y lo publica (unos 3 a 5 minutos). Quedará en <a href="../ponencias/' + slug(d.subcategoria) + '/' + id + '/" target="_blank">politon.pe/joseguzman/ponencias/' + slug(d.subcategoria) + '/' + id + '/</a>. Sigue el avance en <b>Publicaciones</b>.');
      archivo = null; $('#fn').textContent = ''; inp.value = ''; campos($('#fSub'), {}, true); vigilar();
    }).catch(function (err) { msg('#subMsg', 'err', 'No se pudo subir: ' + esc(err.message)); })
      .then(function () { btn.disabled = false; });
  });

  // ---------- publicaciones
  function pintarRuns() {
    return api('/actions/runs?per_page=8').then(function (j) {
      var corre = false;
      $('#runs').innerHTML = (j.workflow_runs || []).map(function (r) {
        var st = r.status !== 'completed' ? (corre = true, '⏳') : r.conclusion === 'success' ? '✅' : r.conclusion === 'cancelled' ? '⏹️' : '❌';
        var msg1 = (r.head_commit && r.head_commit.message || r.name).split('\n')[0];
        return '<li><span class="st">' + st + '</span><div><div>' + esc(msg1) + '</div><div class="m">' + esc(r.name) + ' · ' + hace(r.created_at) + (r.status !== 'completed' ? ' · en curso' : '') + '</div></div>' +
          '<a class="btn line sm" href="' + esc(r.html_url) + '" target="_blank">Detalle</a></li>';
      }).join('') || '<li>Sin publicaciones todavía.</li>';
      return corre;
    });
  }
  function vigilar() {
    clearTimeout(pollT);
    var tick = function () { pintarRuns().then(function (c) { pollT = setTimeout(tick, c ? 8000 : 30000); }).catch(function () { pollT = setTimeout(tick, 30000); }); };
    pollT = setTimeout(tick, 2500);
  }

  // ---------- pestañas
  document.querySelector('.tabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]'); if (!b) return;
    document.querySelectorAll('.tabs [data-tab]').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
    ['bib', 'sub', 'pub'].forEach(function (t) { $('#tab-' + t).classList.toggle('hidden', t !== b.getAttribute('data-tab')); });
    if (b.getAttribute('data-tab') === 'pub') pintarRuns();
  });

  // ---------- acceso
  function entrar(t, recordar) {
    tok = t;
    return api('').then(function (repo) {
      if (repo.permissions && !repo.permissions.push) throw new Error('La llave no tiene permiso de escritura (Contents: Read and write).');
      if (recordar) try { localStorage.setItem(KEY, t); } catch (e) { }
      return api('https://api.github.com/user').catch(function () { return { login: OWNER }; });
    }).then(function (u) {
      $('#whoName').textContent = 'Conectado como ' + (u.login || OWNER);
      $('#login').classList.add('hidden'); $('#app').classList.remove('hidden');
      campos($('#fSub'), {}, true);
      return cargarCatalogo().then(function () { pintarLista(); pintarRuns().then(function (c) { if (c) vigilar(); }); });
    });
  }
  $('#entrar').onclick = function () {
    var t = $('#tok').value.trim(); if (!t) return;
    msg('#loginMsg', 'info', 'Comprobando la llave…');
    entrar(t, $('#rem').checked).catch(function (e) { tok = null; msg('#loginMsg', 'err', e.status === 401 ? 'La llave no es válida o venció.' : e.status === 404 ? 'La llave no tiene acceso al repositorio joseguzman.' : esc(e.message)); });
  };
  $('#tok').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#entrar').click(); });
  $('#salir').onclick = function () { try { localStorage.removeItem(KEY); } catch (e) { } location.reload(); };
  var guardada = null; try { guardada = localStorage.getItem(KEY); } catch (e) { }
  if (guardada) entrar(guardada, true).catch(function () { $('#login').classList.remove('hidden'); msg('#loginMsg', 'err', 'Tu llave guardada ya no funciona. Pega una nueva.'); });
  else $('#login').classList.remove('hidden');
})();
