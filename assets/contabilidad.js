/* contabilidad.js — práctica de asientos, plan de cuentas completo y libro diario (sin dependencias).
   El avance se guarda en localStorage («jg-contabilidad-v1»). */
(function () {
  'use strict';
  if (window.pintarIconos) window.pintarIconos();
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var KEY = 'jg-contabilidad-v1';
  var S = cargar();
  S.trabajo = S.trabajo || {}; S.propios = S.propios || []; S.estado = S.estado || {}; S.editados = S.editados || {}; S.notas = S.notas || {}; S.intentos = S.intentos || {};
  var ver = S.version || '2019', MAP = {}, LIST = [], actual = null, ak = 0;
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (n) { return (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function (s) { s = String(s || '').replace(/[^\d.,-]/g, '').replace(/,/g, ''); var n = parseFloat(s); return isNaN(n) ? 0 : n; };
  var cap = function (s) { s = String(s || ''); return s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s; };
  function cargar() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } if (window.CXnube) window.CXnube.cambio(); }
  var tt; function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2400); }

  // ---------- naturaleza de cada elemento
  var EL = {
    '0': ['Cuentas de orden', 'el-o', ''], '1': ['Activo', 'el-a', 'debe'], '2': ['Activo', 'el-a', 'debe'], '3': ['Activo', 'el-a', 'debe'],
    '4': ['Pasivo', 'el-p', 'haber'], '5': ['Patrimonio', 'el-pt', 'haber'], '6': ['Gasto', 'el-g', 'debe'], '7': ['Ingreso', 'el-i', 'haber'],
    '8': ['Saldos intermediarios', 'el-o', ''], '9': ['Analítica / por categoría', 'el-o', '']
  };
  function badge(c) {
    var e = EL[c.charAt(0)]; if (!e) return '';
    var t = e[0] + (e[2] ? ' · aumenta por el ' + e[2] : '');
    return '<span class="el ' + e[1] + '">' + esc(t) + '</span>';
  }

  // ---------- plan contable
  function usarVersion(v) {
    var P = (window.PCGE || {})[v]; if (!P) return;
    ver = v; S.version = v; guardar(); MAP = {}; LIST = [];
    P.cuentas.forEach(function (c) { MAP[c[0]] = c[1]; LIST.push({ c: c[0], n: c[1], k: norm(c[1]) }); });
    $('#version').value = v; $('#planInfo').textContent = P.cuentas.length + ' cuentas · ' + P.titulo + ' (' + P.resolucion + ')';
    planHecho = false;
  }
  // detalle para el asiento: en las subdivisionarias genéricas («Costo», «Revaluación»…) antepone la cuenta madre
  function nomDet(c) { var n = cap(MAP[c] || ''), p = c.length === 5 && MAP[c.slice(0, 4)]; return p && n.length < 30 ? cap(p) + ' – ' + n : n; }
  function padre(c) { for (var i = c.length - 1; i > 0; i--) if (MAP[c.slice(0, i)]) return c.slice(0, i); return null; }
  function ruta(c) { var out = [], p = padre(c); while (p) { out.unshift(p); p = padre(p); } return out; }
  function rutaTxt(c, corto) { return ruta(c).map(function (p) { var n = cap(MAP[p]); return p + ' ' + (corto && n.length > 40 ? n.slice(0, 38) + '…' : n); }).join(' › '); }
  function buscar(q, max) {
    q = norm(q).trim(); if (!q) return [];
    var r;
    if (/^\d+$/.test(q)) r = LIST.filter(function (x) { return x.c.indexOf(q) === 0; });
    else { var w = q.split(/\s+/); r = LIST.filter(function (x) { return w.every(function (t) { return x.k.indexOf(t) >= 0 || x.c.indexOf(t) === 0; }); }); }
    return r.sort(function (a, b) { return a.c.length - b.c.length || (a.c < b.c ? -1 : 1); }).slice(0, max || 9999);
  }

  // ---------- vistas
  function vista(v, sinHash) {
    $$('.vtabs [data-v]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-v') === v)); });
    ['practica', 'plan', 'diario'].forEach(function (x) { $('#v-' + x).hidden = x !== v; });
    if (v === 'plan') pintarPlan();
    if (v === 'diario') pintarDiario();
    if (!sinHash) try { history.replaceState(null, '', '#' + (v === 'practica' && actual ? actual.id : v)); } catch (e) { }
  }
  $('.vtabs').addEventListener('click', function (e) { var b = e.target.closest('[data-v]'); if (b) vista(b.getAttribute('data-v')); });

  // ---------- ejercicios
  // fecha en que se subió cada ejercicio («subido» en los datos; en los propios, la de su creación)
  function d2(n) { return ('0' + n).slice(-2); }
  function subidoDe(e) {
    if (e.subido) return e.subido;
    var m = e.propio && /^propio-(\d{12,})$/.exec(e.id); if (!m) return '';
    var d = new Date(+m[1]); return d2(d.getDate()) + '/' + d2(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(2);
  }
  function claveFecha(f) { var m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(f || ''); if (!m) return 0; var y = +m[3]; if (y < 100) y += 2000; return y * 10000 + +m[2] * 100 + +m[1]; }
  function todos() {
    S.editados = S.editados || {};
    var E = (window.EJERCICIOS || []).map(function (e) { var x = S.editados[e.id]; return x ? Object.assign({}, e, x, { editado: true }) : e; }).concat(S.propios.map(function (p) { return Object.assign({ propio: true }, p); }));
    E.forEach(function (e, i) { e._i = i; });
    return E.sort(function (a, b) { return claveFecha(subidoDe(b)) - claveFecha(subidoDe(a)) || a._i - b._i; });
  }
  function fechasSubida(E) { var m = {}; E.forEach(function (e) { var f = subidoDe(e); if (f) m[f] = (m[f] || 0) + 1; }); return Object.keys(m).sort(function (a, b) { return claveFecha(b) - claveFecha(a); }).map(function (f) { return [f, m[f]]; }); }
  // un ejercicio puede tener varios asientos: cada uno se guarda en su propia clave (id, id~2, id~3…)
  function pasos(e) {
    if (e.asientos && e.asientos.length) return e.asientos;
    var out = [{ fecha: e.fecha, glosa: e.glosa, solucion: e.solucion, explicacion: e.explicacion }];
    for (var i = 1; i < (e.propio ? e.nAsientos || 1 : 1); i++) out.push({});
    if (e.propio && e.info) out.forEach(function (p, k) { var x = e.info[k]; if (x) { if (x.titulo) p.titulo = x.titulo; if (x.fecha) p.fecha = x.fecha; } });
    return out;
  }
  function wk(id, k) { return k ? id + '~' + (k + 1) : id; }
  function conLineas(w) { return w && w.lineas ? w.lineas.filter(function (l) { return l.cuenta || l.debe || l.haber; }) : []; }
  function okEj(e) { var P = pasos(e); return P.some(function (p) { return p.solucion; }) && P.every(function (p, k) { return S.estado[wk(e.id, k)] === 'ok'; }); }
  function estadoDe(e) { return okEj(e) ? 'ok' : pasos(e).some(function (p, k) { return conLineas(S.trabajo[wk(e.id, k)]).length; }) ? 'wip' : ''; }
  function paso() { return pasos(actual)[ak] || {}; }
  function clave() { return wk(actual.id, ak); }
  // agrupa líneas de la misma cuenta y lado (p. ej., una línea por socio) para comparar con la solución
  function agrupar(L, deSol) {
    var G = [], m = {};
    L.forEach(function (l, i) {
      var c = deSol ? l.cuentas.join('|') : l.cuenta, lado = deSol ? l.lado : (l.debe ? 'debe' : l.haber ? 'haber' : '');
      if (!c || !lado) return;
      var k = c + '#' + lado;
      if (!m[k]) { m[k] = deSol ? { lado: lado, cuentas: l.cuentas, monto: 0, nota: '', n: 0 } : { cuenta: c, debe: 0, haber: 0, idx: [] }; G.push(m[k]); }
      if (deSol) { m[k].monto += l.monto; m[k].n++; if (l.nota && !m[k].nota) m[k].nota = l.nota; }
      else { m[k].debe += l.debe; m[k].haber += l.haber; m[k].idx.push(i); }
    });
    return G;
  }
  // ---------- estudio: intentos por asiento («Para repasar» y aciertos al primer intento)
  function itn(k) { return S.intentos[k] || {}; }
  function repasarEj(e) { return pasos(e).some(function (p, k) { return itn(wk(e.id, k)).repasar; }); }
  function marcarIntento(k, datos) { S.intentos[k] = Object.assign({}, S.intentos[k], datos, { t: Date.now() }); }
  var filtroTema = '';
  function pasaFiltro(e) {
    if (!filtroTema) return true;
    if (filtroTema === 'est:repasar') return repasarEj(e);
    if (filtroTema === 'est:sin') return !estadoDe(e);
    if (filtroTema === 'est:wip') return estadoDe(e) === 'wip';
    return filtroTema.indexOf('sub:') === 0 ? subidoDe(e) === filtroTema.slice(4) : e.tema === filtroTema;
  }
  function temasUsados(E) { var m = {}; E.forEach(function (e) { if (e.tema) m[e.tema] = 1; }); return Object.keys(m).sort(function (a, b) { return a.localeCompare(b, 'es', { numeric: true }); }); }
  function pintarLista() {
    var E = todos(), T = temasUsados(E), F = fechasSubida(E);
    if (filtroTema && !E.some(pasaFiltro)) filtroTema = '';
    var sel = $('#filtroTema');
    var nRep = E.filter(repasarEj).length, nSin = E.filter(function (e) { return !estadoDe(e); }).length, nWip = E.filter(function (e) { return estadoDe(e) === 'wip'; }).length;
    sel.innerHTML = '<option value="">Todos los ejercicios (' + E.length + ')</option>' +
      '<optgroup label="Para estudiar"><option value="est:repasar">↻ Para repasar (' + nRep + ')</option><option value="est:wip">En progreso (' + nWip + ')</option><option value="est:sin">Sin empezar (' + nSin + ')</option></optgroup>' +
      '<optgroup label="Por fecha de subida">' + F.map(function (f) { return '<option value="sub:' + esc(f[0]) + '">Subidos el ' + esc(f[0]) + ' (' + f[1] + ')</option>'; }).join('') + '</optgroup>' +
      '<optgroup label="Por categoría">' + T.map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + ' (' + E.filter(function (e) { return e.tema === t; }).length + ')</option>'; }).join('') + '</optgroup>';
    sel.value = filtroTema;
    $('#listaTemas').innerHTML = T.map(function (t) { return '<option value="' + esc(t) + '">'; }).join('');
    var grupo = null;
    $('#lista').innerHTML = E.map(function (e, i) {
      if (!pasaFiltro(e)) return '';
      var sb = subidoDe(e), cab = '';
      if (sb !== grupo && filtroTema.indexOf('sub:') !== 0 && filtroTema.indexOf('est:') !== 0) { grupo = sb; cab = '<div class="grp">' + (sb ? 'Subidos el ' + esc(sb) : 'Sin fecha de subida') + '</div>'; }
      var st = estadoDe(e), nota = (S.notas[e.id] || {}).texto, np = pasos(e).length;
      return cab + '<button class="ex" data-id="' + esc(e.id) + '" aria-current="' + (actual && actual.id === e.id) + '"><span class="st ' + st + '">' + (st === 'ok' ? '✓' : i + 1) + '</span>' +
        '<span class="t"><b>' + esc(e.fecha || '') + '</b> ' + esc(e.enunciado.length > 84 ? e.enunciado.slice(0, 82) + '…' : e.enunciado) + '<small>' + esc(e.tema || 'Sin categoría') + (np > 1 ? ' · ' + np + ' asientos' : '') + (e.propio ? ' · propio' : '') + (nota ? ' · 📝' : '') + (repasarEj(e) ? ' · <span class="rep">↻ repasar</span>' : '') + '</small></span></button>';
    }).join('') || '<p class="tiny" style="padding:8px">No hay ejercicios en esta categoría.</p>';
    var base = (window.EJERCICIOS || []), ok = base.filter(okEj).length;
    $('#progTxt').textContent = ok + ' de ' + base.length + ' ejercicios resueltos';
    $('#progBar').style.width = (base.length ? 100 * ok / base.length : 0) + '%';
    var I = Object.keys(S.intentos).map(function (k) { return S.intentos[k]; }).filter(function (x) { return x.n; }), pri = I.filter(function (x) { return x.primero; }).length;
    $('#estTxt').innerHTML = I.length ? '🎯 Al primer intento: <b>' + pri + ' de ' + I.length + '</b> asientos' + (nRep ? ' · <button class="lnk" id="irRepasar">↻ ' + nRep + ' para repasar</button>' : '') : '';
    if ($('#irRepasar')) $('#irRepasar').onclick = function () { filtroTema = 'est:repasar'; pintarLista(); var e1 = todos().find(repasarEj); if (e1) abrir(e1.id, true); };
    var cur = $('#lista .ex[aria-current="true"]'); if (cur && window.innerWidth < 900) cur.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
  $('#filtroTema').onchange = function () { filtroTema = this.value; pintarLista(); };
  $('#lista').addEventListener('click', function (e) { var b = e.target.closest('.ex'); if (b) abrir(b.getAttribute('data-id'), true); });

  function abrir(id, scroll, kAs) {
    var E = todos(), k = Math.max(0, E.findIndex(function (e) { return e.id === id; }));
    var mismo = actual && actual.id === E[k].id;
    actual = E[k]; S.ultimo = actual.id; guardar();
    var P = pasos(actual);
    if (kAs == null) kAs = mismo ? ak : Math.max(0, P.findIndex(function (p, j) { return S.estado[wk(actual.id, j)] !== 'ok'; }));
    ak = Math.min(Math.max(0, kAs), P.length - 1);
    pintarTabs();
    $('#eNum').textContent = 'Ejercicio ' + (k + 1) + ' de ' + E.length;
    var fe = paso().fecha || actual.fecha; $('#eFecha').textContent = fe || 'Sin fecha'; $('#eFecha').hidden = !fe;
    pintarTema(); cargarNota();
    $('#eTexto').textContent = actual.enunciado;
    $('#borrarPropio').hidden = !actual.propio; $('#restaurarEj').hidden = !actual.editado;
    $('#prevEj').disabled = k === 0; $('#nextEj').disabled = k === E.length - 1;
    $('#solucion').hidden = $('#pista').hidden = !paso().solucion;
    $('#verificar span').textContent = paso().solucion ? 'Verificar' : 'Revisar cuadre';
    var w = S.trabajo[clave()] || { lineas: [{}, {}], glosa: '' };
    $('#filas').innerHTML = ''; w.lineas.forEach(function (l) { fila(l); });
    $('#glosa').value = w.glosa || '';
    $('#feedback').className = 'fb'; $('#feedback').innerHTML = '';
    totales(); pintarLista(); pintarTodo();
    try { history.replaceState(null, '', '#' + actual.id); } catch (e) { }
    if (scroll && window.innerWidth < 900) $('.card-e').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // pestañas de asientos dentro de un ejercicio
  function pintarTabs() {
    var P = pasos(actual), box = $('#asTabs');
    box.hidden = P.length < 2 && !actual.propio;
    box.innerHTML = '<span class="as-lbl">Asientos de este ejercicio</span>' + P.map(function (p, j) {
      var st = S.estado[wk(actual.id, j)] === 'ok' ? 'ok' : conLineas(S.trabajo[wk(actual.id, j)]).length ? 'wip' : '';
      return '<button class="as-t" data-k="' + j + '" aria-pressed="' + (j === ak) + '"><span class="st ' + st + '">' + (st === 'ok' ? '✓' : j + 1) + '</span><span>Asiento ' + (j + 1) + (p.titulo ? '<small>' + esc(p.titulo) + '</small>' : '') + '</span></button>';
    }).join('') + (actual.propio ? '<button class="lnk as-mas" data-mas="1">+ Agregar asiento</button><button class="lnk as-cfg" data-cfg="1">⚙ Nombre y fecha del asiento ' + (ak + 1) + '</button>' + (P.length > 1 ? '<button class="lnk as-menos" data-menos="1">Quitar el último</button>' : '') : '');
    $('#asiento').classList.toggle('con-mvas', P.length > 1 || !!actual.propio);
  }
  $('#asTabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]'), id = actual.id, n = pasos(actual).length;
    if (b) { abrir(id, false, +b.getAttribute('data-k')); return; }
    if (e.target.closest('[data-mas]')) { guardarCampos(id, { nAsientos: n + 1 }); abrir(id, false, n); toast('Asiento ' + (n + 1) + ' agregado'); return; }
    if (e.target.closest('[data-cfg]')) {
      var f = $('#fAs').elements, p = paso(); f.titulo.value = p.titulo || ''; f.fecha.value = p.fecha || '';
      $('#dlgAsT').textContent = 'Configurar el asiento ' + (ak + 1); $('#dlgAs').showModal(); return;
    }
    if (e.target.closest('[data-menos]')) {
      if (!confirm('¿Quitar el asiento ' + n + ' y lo que escribiste en él?')) return;
      delete S.trabajo[wk(id, n - 1)]; delete S.estado[wk(id, n - 1)]; guardarCampos(id, { nAsientos: n - 1 }); abrir(id, false, n - 2);
    }
  });
  function mover(d) { var E = todos(), k = E.findIndex(function (e) { return e.id === actual.id; }) + d; if (E[k]) abrir(E[k].id, true); }
  $('#prevEj').onclick = function () { mover(-1); };
  $('#nextEj').onclick = function () { mover(1); };

  // ---------- filas del asiento
  function fila(l) {
    l = l || {};
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><input class="in cta-in" autocomplete="off" placeholder="Código o palabra" aria-label="Cuenta" value="' + esc(l.cuenta || '') + '"><div class="meta"></div></td>' +
      '<td><input class="in det-in" placeholder="Se completa al elegir la cuenta" aria-label="Detalle" value="' + esc(l.detalle || '') + '"><div class="path"></div></td>' +
      '<td class="c-num"><input class="in debe-in" inputmode="decimal" aria-label="Debe" value="' + (l.debe ? fmt(l.debe) : '') + '"></td>' +
      '<td class="c-num"><input class="in haber-in" inputmode="decimal" aria-label="Haber" value="' + (l.haber ? fmt(l.haber) : '') + '"></td>' +
      '<td class="noprint"><div class="ctl"><button class="grip" title="Arrastra para mover la línea (o usa ↑ ↓ con el teclado)" aria-label="Mover línea">⠿</button><span class="ud"><button class="mv up" title="Subir línea" aria-label="Subir línea">▲</button><button class="mv dn" title="Bajar línea" aria-label="Bajar línea">▼</button></span><button class="mvas" title="Pasar esta línea a otro asiento" aria-label="Pasar esta línea a otro asiento">⇄</button><button class="del" title="Quitar línea" aria-label="Quitar línea">×</button></div></td>';
    tr.dataset.auto = !l.detalle || (l.detalle === nomDet(l.cuenta) || l.detalle === cap(MAP[l.cuenta] || '')) ? '1' : '';
    $('#filas').appendChild(tr); meta(tr);
    return tr;
  }
  function meta(tr) {
    var c = tr.querySelector('.cta-in').value.trim(), m = tr.querySelector('.meta'), p = tr.querySelector('.path');
    tr.classList.toggle('haber-row', num(tr.querySelector('.haber-in').value) > 0 && !num(tr.querySelector('.debe-in').value));
    if (!c || !/^\d+$/.test(c)) { m.innerHTML = ''; p.textContent = ''; return; }
    if (!MAP[c]) { m.innerHTML = '<span class="path bad">No existe en el PCGE ' + ver + '</span>'; p.textContent = ''; return; }
    m.innerHTML = badge(c); p.textContent = rutaTxt(c, true);
  }
  function elegirCuenta(tr, c) {
    tr.querySelector('.cta-in').value = c;
    var det = tr.querySelector('.det-in');
    if (tr.dataset.auto === '1' || !det.value) { det.value = nomDet(c); tr.dataset.auto = '1'; }
    meta(tr); cerrarAC(); persistir();
    var d = tr.querySelector('.debe-in'), h = tr.querySelector('.haber-in');
    if (!num(d.value) && !num(h.value)) d.focus(); // tú decides si va al debe o al haber (Tab pasa al haber)
  }
  function leer() {
    return $$('#filas tr').map(function (tr) {
      var c = tr.querySelector('.cta-in').value.trim();
      return { cuenta: /^\d+$/.test(c) ? c : '', detalle: tr.querySelector('.det-in').value.trim(), debe: num(tr.querySelector('.debe-in').value), haber: num(tr.querySelector('.haber-in').value) };
    });
  }
  function persistir() {
    if (!actual) return;
    var antes = S.trabajo[clave()], L = leer();
    S.trabajo[clave()] = { lineas: L, glosa: $('#glosa').value, t: Date.now() };
    // solo pierde el ✓ si de verdad cambiaron las líneas
    if (S.estado[clave()] === 'ok' && (!antes || JSON.stringify(antes.lineas) !== JSON.stringify(L))) { delete S.estado[clave()]; pintarLista(); pintarTabs(); }
    guardar(); totales(); if (todoOn) pintarTodo();
  }
  function totales() {
    var d = 0, h = 0; leer().forEach(function (l) { d += l.debe; h += l.haber; });
    $('#tDebe').textContent = fmt(d); $('#tHaber').textContent = fmt(h);
    var c = $('#cuadre');
    if (!d && !h) { c.className = 'cuadre'; c.textContent = ''; }
    else if (Math.abs(d - h) < 0.005) { c.className = 'cuadre ok'; c.textContent = '✓ Cuadra'; }
    else { c.className = 'cuadre no'; c.textContent = 'Falta S/ ' + fmt(Math.abs(d - h)) + ' en el ' + (d > h ? 'haber' : 'debe'); }
    pintarEcu();
  }
  var filas = $('#filas');
  filas.addEventListener('input', function (e) {
    var t = e.target, tr = t.closest('tr');
    if (t.classList.contains('cta-in')) { abrirAC(t); meta(tr); }
    if (t.classList.contains('det-in')) tr.dataset.auto = '';
    if (t.classList.contains('debe-in') && t.value) tr.querySelector('.haber-in').value = '';
    if (t.classList.contains('haber-in') && t.value) tr.querySelector('.debe-in').value = '';
    persistir();
  });
  filas.addEventListener('focusout', function (e) {
    var t = e.target, tr = t.closest('tr');
    if (t.classList.contains('debe-in') || t.classList.contains('haber-in')) { var n = num(t.value); t.value = n ? fmt(n) : ''; meta(tr); }
    if (t.classList.contains('cta-in')) setTimeout(function () {
      if (document.activeElement === t) return; cerrarAC();
      var c = t.value.trim();
      if (c && !/^\d+$/.test(c)) { var R = buscar(c, 1); if (R.length) { elegirCuenta(tr, R[0].c); return; } }
      if (MAP[c] && (tr.dataset.auto === '1' || !tr.querySelector('.det-in').value)) { tr.querySelector('.det-in').value = nomDet(c); tr.dataset.auto = '1'; persistir(); }
    }, 160);
  });
  filas.addEventListener('focusin', function (e) { if (e.target.classList.contains('cta-in') && e.target.value) abrirAC(e.target); });
  // mover líneas: botones ▲ ▼, teclado en el asa y arrastre con el dedo o el mouse
  function moverFila(tr, d, foco) {
    var o = d < 0 ? tr.previousElementSibling : tr.nextElementSibling; if (!o) return;
    if (d < 0) filas.insertBefore(tr, o); else filas.insertBefore(o, tr);
    persistir(); if (foco) { var b = tr.querySelector(foco); if (b && !b.disabled) b.focus(); }
  }
  filas.addEventListener('click', function (e) {
    var b = e.target.closest('.mv'); if (!b) return;
    moverFila(b.closest('tr'), b.classList.contains('up') ? -1 : 1, b.classList.contains('up') ? '.up' : '.dn');
  });
  filas.addEventListener('keydown', function (e) {
    if (!e.target.classList.contains('grip') || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault(); moverFila(e.target.closest('tr'), e.key === 'ArrowUp' ? -1 : 1, '.grip');
  });
  filas.addEventListener('pointerdown', function (e) {
    var g = e.target.closest('.grip'); if (!g) return; e.preventDefault();
    var tr = g.closest('tr'), mov = false;
    tr.classList.add('arrastrando');
    function mueve(ev) {
      var primera = filas.firstElementChild, ultima = filas.lastElementChild;
      if (ev.clientY > ultima.getBoundingClientRect().bottom && ultima !== tr) { filas.appendChild(tr); mov = true; return; }
      if (ev.clientY < primera.getBoundingClientRect().top && primera !== tr) { filas.insertBefore(tr, primera); mov = true; return; }
      var el = document.elementFromPoint(ev.clientX, ev.clientY), o = el && el.closest && el.closest('#filas tr');
      if (!o || o === tr) return;
      var r = o.getBoundingClientRect(), abajo = ev.clientY > r.top + r.height / 2;
      if (abajo) { if (o.nextElementSibling !== tr) { filas.insertBefore(tr, o.nextElementSibling); mov = true; } }
      else if (o.previousElementSibling !== tr) { filas.insertBefore(tr, o); mov = true; }
    }
    function fin() {
      document.removeEventListener('pointermove', mueve); document.removeEventListener('pointerup', fin); document.removeEventListener('pointercancel', fin);
      tr.classList.remove('arrastrando'); if (mov) persistir();
    }
    // en document: al mover la fila en el DOM el navegador suelta la captura del puntero
    document.addEventListener('pointermove', mueve); document.addEventListener('pointerup', fin); document.addEventListener('pointercancel', fin);
  });
  // pasar una línea a otro asiento del mismo ejercicio (o a uno nuevo, en los propios)
  var mvTr = null;
  function cerrarMv() { $('#mvMenu').hidden = true; mvTr = null; }
  function abrirMv(btn) {
    var P = pasos(actual), m = $('#mvMenu'); mvTr = btn.closest('tr');
    m.innerHTML = '<div class="mv-h">Pasar esta línea al…</div>' + P.map(function (p, j) {
      return j === ak ? '' : '<button role="menuitem" data-dest="' + j + '">Asiento ' + (j + 1) + (p.titulo ? ' · ' + esc(p.titulo) : '') + '</button>';
    }).join('') + (actual.propio ? '<button role="menuitem" data-dest="nuevo">＋ Asiento nuevo (' + (P.length + 1) + ')</button>' : '');
    var b = btn.getBoundingClientRect();
    m.hidden = false; m.style.top = (b.bottom + scrollY + 4) + 'px'; m.style.left = Math.max(12, Math.min(b.right + scrollX - m.offsetWidth, scrollX + innerWidth - m.offsetWidth - 12)) + 'px';
    var f = m.querySelector('button'); if (f) f.focus();
  }
  function moverLinea(tr, dest) {
    var id = actual.id, i = $$('#filas tr').indexOf(tr), l = leer()[i]; if (!l) return;
    if (dest === 'nuevo') { dest = pasos(actual).length; guardarCampos(id, { nAsientos: dest + 1 }); actual = todos().find(function (e) { return e.id === id; }); }
    var k = wk(id, dest), w = S.trabajo[k] || { glosa: '' };
    S.trabajo[k] = { lineas: conLineas(w).concat([l]), glosa: w.glosa || '', t: Date.now() };
    if (S.estado[k] === 'ok') delete S.estado[k];
    tr.remove(); if (!filas.children.length) fila();
    persistir(); pintarTabs(); pintarLista(); if (todoOn) pintarTodo();
    toast('Línea' + (l.cuenta ? ' ' + l.cuenta : '') + ' pasada al asiento ' + (dest + 1));
  }
  filas.addEventListener('click', function (e) { var b = e.target.closest('.mvas'); if (b) { if (mvTr === b.closest('tr') && !$('#mvMenu').hidden) cerrarMv(); else abrirMv(b); } });
  $('#mvMenu').addEventListener('click', function (e) { var b = e.target.closest('[data-dest]'); if (!b || !mvTr) return; var tr = mvTr, d = b.getAttribute('data-dest'); cerrarMv(); moverLinea(tr, d === 'nuevo' ? d : +d); });
  $('#mvMenu').addEventListener('keydown', function (e) {
    var bs = $$('#mvMenu button'), k = bs.indexOf(document.activeElement);
    if (e.key === 'Escape') { var t = mvTr; cerrarMv(); if (t) t.querySelector('.mvas').focus(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); bs[(k + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length].focus(); }
  });
  document.addEventListener('click', function (e) { if (!$('#mvMenu').hidden && !e.target.closest('#mvMenu, .mvas')) cerrarMv(); });
  window.addEventListener('resize', cerrarMv);
  $('#dlgAs').addEventListener('close', function () {
    if ($('#dlgAs').returnValue !== 'ok') return;
    var f = $('#fAs').elements, id = actual.id, info = (actual.info || []).slice();
    while (info.length < ak) info.push(null);
    info[ak] = { titulo: f.titulo.value.trim(), fecha: f.fecha.value.trim() };
    guardarCampos(id, { info: info }); abrir(id, false, ak); toast('Asiento ' + (ak + 1) + ' configurado');
  });
  filas.addEventListener('click', function (e) { if (e.target.closest('.del')) { e.target.closest('tr').remove(); if (!filas.children.length) fila(); persistir(); } });
  filas.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t.classList.contains('cta-in') && !$('#ac').hidden) {
      var os = $$('#ac .o'), k = os.findIndex(function (o) { return o.getAttribute('aria-selected') === 'true'; });
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); k = (k + (e.key === 'ArrowDown' ? 1 : -1) + os.length) % os.length; os.forEach(function (o, j) { o.setAttribute('aria-selected', String(j === k)); }); os[k].scrollIntoView({ block: 'nearest' }); }
      if ((e.key === 'Enter' || e.key === 'Tab') && k >= 0) { e.preventDefault(); elegirCuenta(t.closest('tr'), os[k].getAttribute('data-c')); }
      if (e.key === 'Escape') cerrarAC();
      return;
    }
    if (e.key === 'Enter' && (t.classList.contains('debe-in') || t.classList.contains('haber-in'))) {
      e.preventDefault(); var nt = t.closest('tr').nextElementSibling || fila(); nt.querySelector('.cta-in').focus();
    }
  });
  $('#glosa').addEventListener('input', persistir);
  $('#agregar').onclick = function () { fila().querySelector('.cta-in').focus(); persistir(); };
  $('#limpiar').onclick = function () { if (!confirm('¿Borrar lo que escribiste en este ejercicio?')) return; delete S.trabajo[clave()]; delete S.estado[clave()]; if (S.intentos[clave()]) marcarIntento(clave(), { desdeCero: true }); guardar(); abrir(actual.id); };

  // ---------- autocompletar
  var acFor = null;
  function abrirAC(inp) {
    var R = buscar(inp.value, 12), ac = $('#ac');
    if (!R.length || !inp.value.trim()) { cerrarAC(); return; }
    acFor = inp;
    ac.innerHTML = R.map(function (x, i) {
      return '<div class="o" role="option" data-c="' + x.c + '" aria-selected="' + (i === 0) + '"><b>' + x.c + '</b><span>' + esc(cap(x.n)) + '</span><small>' + esc(rutaTxt(x.c, true) || (EL[x.c] ? 'Elemento ' + x.c : '')) + '</small></div>';
    }).join('') + '<div class="hint">↑ ↓ para moverte · Enter para elegir</div>';
    var b = inp.getBoundingClientRect();
    ac.style.left = Math.max(12, Math.min(b.left + scrollX, scrollX + innerWidth - 452)) + 'px'; ac.style.top = (b.bottom + scrollY + 4) + 'px'; ac.hidden = false;
  }
  function cerrarAC() { $('#ac').hidden = true; acFor = null; }
  $('#ac').addEventListener('mousedown', function (e) { var o = e.target.closest('.o'); if (!o || !acFor) return; e.preventDefault(); elegirCuenta(acFor.closest('tr'), o.getAttribute('data-c')); });
  window.addEventListener('resize', cerrarAC);

  // ---------- verificar, pista y solución
  function acepta(sol, c) { return sol.cuentas.some(function (s) { return c === s || (c.indexOf(s) === 0 && MAP[c]); }); }
  function verificar() {
    var L = leer(), idx = [], fb = $('#feedback'), items = [], todo = true;
    L.forEach(function (l, i) { if (l.cuenta || l.debe || l.haber) idx.push(i); });
    var V = idx.map(function (i) { return L[i]; });
    var d = 0, h = 0; V.forEach(function (l) { d += l.debe; h += l.haber; });
    var trs = $$('#filas tr'); trs.forEach(function (tr) { tr.classList.remove('ok-line', 'bad-line'); });
    if (!V.length) { fb.className = 'fb on'; fb.innerHTML = '<h3>Aún no hay líneas</h3><p>Escribe al menos una cuenta con su monto.</p>'; return; }
    V.forEach(function (l) {
      if (l.cuenta && !MAP[l.cuenta]) { items.push(['✗', '<b>' + esc(l.cuenta) + '</b> no existe en el PCGE ' + ver + '. Búscala en <b>Plan de cuentas</b>.']); todo = false; }
      if (!l.cuenta && (l.debe || l.haber)) { items.push(['✗', 'Hay un monto sin cuenta.']); todo = false; }
    });
    if (Math.abs(d - h) >= 0.005) { items.push(['✗', 'No cuadra: debe S/ ' + fmt(d) + ' y haber S/ ' + fmt(h) + '. En todo asiento, el debe suma lo mismo que el haber.']); todo = false; }
    else items.push(['✓', 'Cuadra: S/ ' + fmt(d) + ' en el debe y en el haber.']);
    var marca = {}, P = paso(), sol = P.solucion;
    if (sol) {
      var G = agrupar(V), SG = agrupar(sol, true), usadas = {};
      var marcar = function (g, m) { g.idx.forEach(function (i) { marca[i] = m; }); };
      SG.forEach(function (s) {
        var lado = s.lado, otro = lado === 'debe' ? 'haber' : 'debe', nom = s.cuentas[0] + ' ' + cap(MAP[s.cuentas[0]] || '');
        var k = G.findIndex(function (g, i) { return !usadas[i] && acepta(s, g.cuenta) && Math.abs(g[lado] - s.monto) < 0.005 && !g[otro]; });
        if (k >= 0) { usadas[k] = 1; marcar(G[k], 'ok'); items.push(['✓', '<b>' + esc(G[k].cuenta) + '</b> en el ' + lado + ' por S/ ' + fmt(s.monto) + (G[k].idx.length > 1 ? ' (en ' + G[k].idx.length + ' líneas)' : '') + '. ' + esc(s.nota)]); return; }
        todo = false;
        var k2 = G.findIndex(function (g, i) { return !usadas[i] && acepta(s, g.cuenta); });
        if (k2 >= 0) {
          usadas[k2] = 1; marcar(G[k2], 'bad'); var g = G[k2];
          if (g[otro] && !g[lado]) items.push(['✗', '<b>' + esc(g.cuenta) + '</b> va al <b>' + lado.toUpperCase() + '</b>, no al ' + otro + '. ' + esc(s.nota)]);
          else items.push(['✗', '<b>' + esc(g.cuenta) + '</b> es la cuenta correcta, pero ' + (s.n > 1 ? 'en total suma' : 'el monto es') + ' S/ ' + fmt(s.monto) + ' (escribiste S/ ' + fmt(g[lado] || g[otro]) + ').']);
          return;
        }
        var k3 = G.findIndex(function (g, i) { return !usadas[i] && g.cuenta.length >= 2 && s.cuentas[0].indexOf(g.cuenta) === 0; });
        if (k3 >= 0) { usadas[k3] = 1; marcar(G[k3], 'bad'); items.push(['~', 'Con <b>' + esc(G[k3].cuenta) + '</b> vas bien encaminado; sé más preciso: <b>' + esc(nom) + '</b>.']); return; }
        items.push(['✗', 'Falta <b>' + esc(nom) + '</b> en el ' + lado + ' por S/ ' + fmt(s.monto) + '. ' + esc(s.nota)]);
      });
      G.forEach(function (g, i) { if (!usadas[i]) { todo = false; marcar(g, 'bad'); items.push(['✗', '<b>' + esc(g.cuenta) + ' ' + esc(cap(MAP[g.cuenta] || '')) + '</b> no corresponde a este asiento.']); } });
      idx.forEach(function (ti, vi) { trs[ti].classList.add(marca[vi] === 'ok' ? 'ok-line' : 'bad-line'); });
    }
    var bien = todo && items.every(function (x) { return x[0] === '✓'; });
    var notaRep = '';
    if (sol) {
      var k0 = clave(), x0 = itn(k0), n0 = (x0.n || 0) + 1, dat = { n: n0 };
      if (n0 === 1 && !x0.vio) dat.primero = bien;
      if (!bien) { dat.fallos = (x0.fallos || 0) + 1; dat.repasar = true; dat.desdeCero = false; }
      else if (x0.repasar && x0.desdeCero) { dat.repasar = false; notaRep = '<p class="why rep-ok">↻ Lo resolviste desde cero: este asiento sale de <b>«Para repasar»</b>.</p>'; }
      else if (x0.repasar) notaRep = '<p class="why">↻ Este asiento sigue en <b>«Para repasar»</b>. Para sacarlo, pulsa <b>Limpiar</b> y resuélvelo otra vez sin ayuda.</p>';
      else if (dat.primero) notaRep = '<p class="why">🎯 ¡Al primer intento!</p>';
      marcarIntento(k0, dat); guardar(); pintarLista();
    }
    if (bien && sol) { S.estado[clave()] = 'ok'; guardar(); pintarLista(); pintarTabs(); }
    var PP = pasos(actual), sigK = -1;
    for (var j = 1; j < PP.length; j++) { var kk = (ak + j) % PP.length; if (PP[kk].solucion && S.estado[wk(actual.id, kk)] !== 'ok') { sigK = kk; break; } }
    var E = todos(), k4 = E.findIndex(function (e) { return e.id === actual.id; }), sig = E.slice(k4 + 1).concat(E.slice(0, k4)).find(function (e) { return pasos(e).some(function (p) { return p.solucion; }) && !okEj(e); });
    var fin = bien && sol && sigK < 0 && okEj(actual);
    fb.className = 'fb on' + (bien ? ' win' : '');
    fb.innerHTML = '<h3>' + (sol ? (bien ? (PP.length > 1 ? '¡Asiento ' + (ak + 1) + ' correcto! 🎉' : '¡Correcto! 🎉') : 'Casi: revisa estos puntos') : (Math.abs(d - h) < 0.005 ? 'Tu asiento cuadra' : 'Revisa el cuadre')) + '</h3><ul>' +
      items.map(function (x) { return '<li><span style="color:' + (x[0] === '✓' ? '#1f9a62' : x[0] === '~' ? '#C99A12' : '#b3262d') + ';font-weight:900">' + x[0] + '</span><span>' + x[1] + '</span></li>'; }).join('') + '</ul>' +
      (sol && bien && P.explicacion ? '<p class="why">' + esc(P.explicacion) + '</p>' : '') +
      (fin && PP.length > 1 && actual.explicacion ? '<p class="why"><b>Todo el ejercicio:</b> ' + esc(actual.explicacion) + ' Míralo completo en <b>Mi libro diario</b>.</p>' : '') +
      notaRep +
      (!sol ? '<p class="why">' + (actual.propio ? 'Ejercicio propio: reviso' : 'Este asiento no tiene solución guardada: reviso') + ' que cuadre y que las cuentas existan.</p>' : '') +
      (bien && sigK >= 0 ? '<div class="next"><button class="btn navy" id="irSigAs">Asiento ' + (sigK + 1) + (PP[sigK].titulo ? ': ' + esc(PP[sigK].titulo) : '') + ' →</button></div>' :
        bien && sig ? '<div class="next"><button class="btn navy" id="irSig">Siguiente ejercicio →</button></div>' : '') +
      (fin && !sig ? '<p class="why">¡Resolviste todos los ejercicios! Agrega uno propio o pídele más a Claude.</p>' : '');
    if ($('#irSigAs')) $('#irSigAs').onclick = function () { abrir(actual.id, true, sigK); };
    if ($('#irSig')) $('#irSig').onclick = function () { abrir(sig.id, true); };
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  $('#verificar').onclick = verificar;
  $('#pista').onclick = function () {
    if (!paso().solucion) return;
    var sol = agrupar(paso().solucion, true), nd = sol.filter(function (s) { return s.lado === 'debe'; }).length, nh = sol.length - nd;
    var els = {}; sol.forEach(function (s) { els[s.cuentas[0].slice(0, 2)] = 1; });
    var fb = $('#feedback'); fb.className = 'fb on';
    fb.innerHTML = '<h3>💡 Pista</h3><ul>' +
      '<li><span>•</span><span>El asiento tiene <b>' + sol.length + ' líneas</b>: ' + nd + ' en el debe y ' + nh + ' en el haber.</span></li>' +
      '<li><span>•</span><span>Usa cuentas de estas familias: ' + Object.keys(els).map(function (c) { return '<b>' + c + '</b> ' + esc(cap(MAP[c] || '')); }).join(' · ') + '.</span></li>' +
      (sol.some(function (s) { return s.n > 1; }) ? '<li><span>•</span><span>Puedes detallar una cuenta en varias líneas (por ejemplo, una por socio): cuento la suma.</span></li>' : '') +
      '<li><span>•</span><span>Pregúntate: ¿qué aumenta y qué disminuye? Mira el recordatorio de abajo.</span></li></ul>';
  };
  $('#solucion').onclick = function () {
    var P = paso(); if (!P.solucion) return;
    marcarIntento(clave(), { vio: true, repasar: true, desdeCero: false }); guardar(); pintarLista();
    var fb = $('#feedback'); fb.className = 'fb on';
    fb.innerHTML = '<h3>Solución</h3><table><tr><th>Cuenta</th><th>Detalle</th><th class="n">Debe</th><th class="n">Haber</th></tr>' +
      P.solucion.map(function (s) { var c = s.cuentas[0]; return '<tr><td><b>' + c + '</b></td><td' + (s.lado === 'haber' ? ' style="padding-left:28px"' : '') + '>' + esc(s.detalle || cap(MAP[c] || '')) + (s.nota ? '<br><small style="color:var(--muted)">' + esc(s.nota) + '</small>' : '') + '</td><td class="n">' + (s.lado === 'debe' ? fmt(s.monto) : '') + '</td><td class="n">' + (s.lado === 'haber' ? fmt(s.monto) : '') + '</td></tr>'; }).join('') +
      '<tr><td></td><td><i>' + esc(P.glosa || '') + '</i></td><td></td><td></td></tr></table>' + (P.explicacion ? '<p class="why">' + esc(P.explicacion) + '</p>' : '') +
      '<div class="next"><button class="btn line sm" id="copiarSol">Copiar la solución a mi asiento</button></div>';
    $('#copiarSol').onclick = function () {
      S.trabajo[clave()] = { lineas: P.solucion.map(function (s) { var c = s.cuentas[0]; return { cuenta: c, detalle: s.detalle || nomDet(c), debe: s.lado === 'debe' ? s.monto : 0, haber: s.lado === 'haber' ? s.monto : 0 }; }), glosa: P.glosa || '', t: Date.now() };
      guardar(); abrir(actual.id); toast('Solución copiada: compárala con la tuya');
    };
  };

  // ---------- plan de cuentas completo
  var planHecho = false, abiertos = {}, filtroEl = '';
  function pintarPlan() {
    if (!planHecho) {
      $('#elems').innerHTML = '<button data-e="" aria-pressed="true">Todos</button>' + LIST.filter(function (x) { return x.c.length === 1; }).map(function (x) { return '<button data-e="' + x.c + '" aria-pressed="false"><b>' + x.c + '</b>' + esc(cap(x.n)) + '</button>'; }).join('');
      var html = '', abiertoGrupo = false;
      LIST.forEach(function (x) {
        if (x.c.length === 1) {
          if (abiertoGrupo) html += '</div>';
          var e = EL[x.c] || ['', 'el-o', ''];
          html += '<div class="pe" data-e="' + x.c + '"><div class="row-e" data-c="' + x.c + '"><b>' + x.c + '</b><span class="nm">' + esc(x.n) + '</span>' + badge(x.c) + '</div>';
          abiertoGrupo = true; return;
        }
        var tiene = LIST.some(function (y) { return y.c.length > x.c.length && y.c.indexOf(x.c) === 0; });
        html += '<div class="pr n' + x.c.length + '" data-c="' + x.c + '" data-p="' + (padre(x.c) || '') + '">' +
          (tiene ? '<button class="tg" aria-expanded="false" aria-label="Ver subcuentas de ' + x.c + '">▸</button>' : '<span></span>') +
          '<span class="cd">' + x.c + '</span><span class="nm">' + esc(cap(x.n)) + '</span><button class="use" data-use="' + x.c + '">Usar en mi asiento</button></div>';
      });
      if (abiertoGrupo) html += '</div>';
      $('#plan').innerHTML = html; planHecho = true; abiertos = {};
    }
    filtrarPlan();
  }
  function filtrarPlan() {
    var q = $('#q').value.trim(), rows = $$('#plan .pr');
    $$('#elems button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-e') === filtroEl)); });
    $$('#plan .pe').forEach(function (g) { g.hidden = !!filtroEl && g.getAttribute('data-e') !== filtroEl; });
    if (q) {
      var R = buscar(q), ver2 = {};
      R.forEach(function (x) { ver2[x.c] = 1; ruta(x.c).forEach(function (p) { ver2[p] = 1; }); });
      var nq = norm(q), w = nq.split(/\s+/);
      rows.forEach(function (r) {
        var c = r.getAttribute('data-c'), show = !!ver2[c] && (!filtroEl || c.charAt(0) === filtroEl); r.hidden = !show;
        var tg = r.querySelector('.tg'); if (tg) tg.setAttribute('aria-expanded', 'true');
        var nm = r.querySelector('.nm'), txt = cap(MAP[c]);
        nm.innerHTML = /^\d+$/.test(nq) ? esc(txt) : esc(txt).replace(new RegExp('(' + w.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi'), function (m) { return norm(m) ? '<mark>' + m + '</mark>' : m; });
      });
      $$('#plan .pe').forEach(function (g) { if (!g.hidden) g.hidden = !g.querySelector('.pr:not([hidden])'); });
      $('#planInfo').textContent = R.length + ' coincidencias';
    } else {
      rows.forEach(function (r) {
        var c = r.getAttribute('data-c'), vis = true; r.querySelector('.nm').textContent = cap(MAP[c]);
        ruta(c).forEach(function (p) { if (p.length > 1 && !abiertos[p]) vis = false; }); r.hidden = !vis;
        var tg = r.querySelector('.tg'); if (tg) tg.setAttribute('aria-expanded', String(!!abiertos[c]));
      });
      $('#planInfo').textContent = LIST.length + ' cuentas · PCGE ' + ver;
    }
    var empty = $('#plan .empty'); if (!$('#plan .pr:not([hidden])') && !empty) $('#plan').insertAdjacentHTML('beforeend', '<div class="empty">Sin resultados.</div>'); else if ($('#plan .pr:not([hidden])') && empty) empty.remove();
  }
  $('#q').addEventListener('input', function () { filtrarPlan(); });
  $('#elems').addEventListener('click', function (e) { var b = e.target.closest('[data-e]'); if (!b) return; filtroEl = b.getAttribute('data-e'); filtrarPlan(); });
  $('#plan').addEventListener('click', function (e) {
    var u = e.target.closest('[data-use]');
    if (u) {
      var c = u.getAttribute('data-use'); vista('practica');
      var tr = $$('#filas tr').find(function (r) { return !r.querySelector('.cta-in').value; }) || fila();
      elegirCuenta(tr, c); tr.scrollIntoView({ block: 'center', behavior: 'smooth' }); toast('Cuenta ' + c + ' agregada a tu asiento'); return;
    }
    var r = e.target.closest('.pr'); if (!r || $('#q').value.trim()) return;
    var c2 = r.getAttribute('data-c'); if (!r.querySelector('.tg')) return;
    if (abiertos[c2]) Object.keys(abiertos).forEach(function (k) { if (k.indexOf(c2) === 0) delete abiertos[k]; }); else abiertos[c2] = 1;
    filtrarPlan();
  });
  $('#abrirTodo').onclick = function () { LIST.forEach(function (x) { if (x.c.length > 1) abiertos[x.c] = 1; }); $('#q').value = ''; filtrarPlan(); };
  $('#cerrarTodo').onclick = function () { abiertos = {}; $('#q').value = ''; filtrarPlan(); };

  // ---------- libro diario: uno por ejercicio (Formato 5.1), con selección para el PDF
  var SELK = 'jg-contabilidad-sel', noSel = (function () { try { return JSON.parse(localStorage.getItem(SELK)) || {}; } catch (e) { return {}; } })();
  function guardarSel() { try { localStorage.setItem(SELK, JSON.stringify(noSel)); } catch (e) { } }
  var DIK = 'jg-contabilidad-diario', DI = (function () { try { return JSON.parse(localStorage.getItem(DIK)) || {}; } catch (e) { return {}; } })();
  function guardarDI() { try { localStorage.setItem(DIK, JSON.stringify(DI)); } catch (e) { } }
  function libros() {
    var out = [];
    todos().forEach(function (e, i) {
      if (DI.sub && subidoDe(e) !== DI.sub) return;
      var A = [];
      pasos(e).forEach(function (p, k) {
        var w = S.trabajo[wk(e.id, k)], L = conLineas(w), sol = false;
        if (!L.length && DI.sol && p.solucion) {
          sol = true; w = { glosa: p.glosa || '' };
          L = p.solucion.map(function (x) { var c = x.cuentas[0]; return { cuenta: c, detalle: x.detalle || nomDet(c), debe: x.lado === 'debe' ? x.monto : 0, haber: x.lado === 'haber' ? x.monto : 0 }; });
        }
        if (L.length) A.push({ k: k, p: p, w: w, sol: sol, ok: S.estado[wk(e.id, k)] === 'ok', L: L.slice().sort(function (a, b) { return (b.debe ? 1 : 0) - (a.debe ? 1 : 0); }) });
      });
      if (A.length) out.push({ e: e, n: i + 1, A: A });
    });
    return out;
  }
  function pintarFiltrosDiario() {
    var F = fechasSubida(todos());
    if (DI.sub && !F.some(function (f) { return f[0] === DI.sub; })) DI.sub = '';
    $('#diSub').innerHTML = '<option value="">Todas las fechas de subida</option>' + F.map(function (f) { return '<option value="' + esc(f[0]) + '">Subidos el ' + esc(f[0]) + ' (' + f[1] + ')</option>'; }).join('');
    $('#diSub').value = DI.sub || ''; $('#diSol').checked = !!DI.sol;
  }
  $('#diSub').onchange = function () { DI.sub = this.value; guardarDI(); pintarDiario(); };
  $('#diSol').onchange = function () { DI.sol = this.checked; guardarDI(); pintarDiario(); };
  function libroHTML(b) {
    var e = b.e, D = 0, H = 0, rows = '';
    b.A.forEach(function (a, j) {
      var r = a.L.length, gl = a.w.glosa || '';
      a.L.forEach(function (l, i) {
        D += l.debe; H += l.haber;
        rows += '<tr' + (i === 0 ? ' class="ini"' : '') + '>' +
          (i === 0 ? '<td class="c" rowspan="' + r + '">' + (j + 1) + (a.ok ? '<span class="okm noprint" title="Verificado">✓</span>' : '') + '</td><td class="c f" rowspan="' + r + '">' + esc(a.p.fecha || e.fecha || '') + '</td><td class="gl" rowspan="' + r + '">' + (gl ? esc(gl) : '<span class="sin">' + esc(a.p.titulo || 'Sin glosa') + '</span>') + '</td>' : '') +
          '<td class="cta"><b>' + esc(l.cuenta) + '</b></td><td' + (l.haber && !l.debe ? ' class="h"' : '') + '>' + esc(l.detalle) + '</td>' +
          '<td class="n">' + (l.debe ? fmt(l.debe) : '') + '</td><td class="n">' + (l.haber ? fmt(l.haber) : '') + '</td></tr>';
      });
    });
    var cab = [['Período', e.periodo], ['RUC', e.ruc], ['Razón social', e.empresa]].filter(function (x) { return x[1]; });
    var cuadra = Math.abs(D - H) < 0.005, tot = pasos(e).length;
    return '<section class="libro' + (noSel[e.id] ? ' off' : '') + '" data-id="' + esc(e.id) + '">' +
      '<div class="lb-top noprint"><label class="lb-sel"><input type="checkbox" data-sel="' + esc(e.id) + '"' + (noSel[e.id] ? '' : ' checked') + '> <b>Ejercicio ' + b.n + '</b></label>' +
      '<span class="lb-meta">' + (subidoDe(e) ? 'Subido el ' + esc(subidoDe(e)) + ' · ' : '') + esc(e.tema || 'Sin categoría') + ' · ' + b.A.length + (tot > b.A.length ? ' de ' + tot : '') + (b.A.length === 1 && tot === 1 ? ' asiento' : ' asientos') + (b.A.some(function (a) { return a.sol; }) ? ' · <span class="lb-sol">' + (b.A.every(function (a) { return a.sol; }) ? 'solución del ejercicio' : 'completado con la solución') + '</span>' : '') + '</span><span class="grow"></span>' +
      '<button class="lnk" data-ir="' + esc(e.id) + '">Abrir en Practicar</button><button class="lnk" data-pdf="' + esc(e.id) + '">PDF de este</button></div>' +
      '<div class="lb-cab"><h3>Libro diario <small>Formato 5.1</small></h3>' + (cab.length ? '<dl>' + cab.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>' : '') + '</div>' +
      '<p class="lb-enun">' + esc(e.enunciado) + '</p>' +
      '<div class="tbl-wrap"><table class="diario"><thead><tr><th class="c">N.°</th><th class="c">Fecha</th><th>Glosa</th><th>Cuenta</th><th>Denominación</th><th class="n">Debe</th><th class="n">Haber</th></tr></thead><tbody>' + rows + '</tbody>' +
      '<tfoot><tr class="tt"><td colspan="5" class="r">Totales' + (cuadra ? '' : ' <span class="cuadre no">no cuadra</span>') + '</td><td class="n">' + fmt(D) + '</td><td class="n">' + fmt(H) + '</td></tr></tfoot></table></div></section>';
  }
  function pintarDiario() {
    pintarFiltrosDiario();
    var LB = libros(), box = $('#diario');
    box.innerHTML = LB.length ? LB.map(libroHTML).join('') : '<div class="empty">' + (DI.sub ? 'Aún no resuelves los ejercicios subidos el ' + esc(DI.sub) + '. Marca <b>«Completar con la solución»</b> para verlos resueltos.' : 'Aún no tienes asientos. Ve a <b>Practicar</b> y resuelve tu primer ejercicio, o marca <b>«Completar con la solución»</b>.') + '</div>';
    pintarSel(LB); infoCopia();
  }
  function marcados(LB) { return (LB || libros()).filter(function (b) { return !noSel[b.e.id]; }); }
  function pintarSel(LB) {
    LB = LB || libros(); var m = marcados(LB).length;
    $('#selInfo').textContent = LB.length ? m + ' de ' + LB.length + ' marcados' : '';
    $('#imprimir').disabled = $('#exportar').disabled = !m;
    $$('#diario .libro').forEach(function (s) { s.classList.toggle('off', !!noSel[s.getAttribute('data-id')]); });
  }
  $('#diario').addEventListener('change', function (e) {
    var c = e.target.closest('[data-sel]'); if (!c) return;
    var id = c.getAttribute('data-sel'); if (c.checked) delete noSel[id]; else noSel[id] = 1;
    guardarSel(); pintarSel();
  });
  $('#diario').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pdf]'); if (b) { imprimirLibros([b.getAttribute('data-pdf')]); return; }
    var a = e.target.closest('[data-ir]'); if (a) { vista('practica'); abrir(a.getAttribute('data-ir'), true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  $('#selTodos').onclick = function () { noSel = {}; guardarSel(); pintarDiario(); };
  $('#selNinguno').onclick = function () { libros().forEach(function (b) { noSel[b.e.id] = 1; }); guardarSel(); pintarDiario(); };
  function hoy() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  // PDF: imprime solo los libros elegidos («Guardar como PDF» en el cuadro de impresión)
  function imprimirLibros(ids) {
    var LB = libros().filter(function (b) { return ids.indexOf(b.e.id) >= 0; }); if (!LB.length) return;
    if ($('#v-diario').hidden) vista('diario');
    $$('#diario .libro').forEach(function (s) { s.classList.toggle('imp-fuera', ids.indexOf(s.getAttribute('data-id')) < 0); });
    var t0 = document.title, uno = LB.length === 1 ? LB[0].e : null;
    document.title = 'Libro diario - ' + (uno ? (uno.empresa || 'Ejercicio ' + LB[0].n) : LB.length + ' ejercicios') + ' - ' + hoy();
    var fin = function () { document.title = t0; $$('#diario .libro').forEach(function (s) { s.classList.remove('imp-fuera'); }); window.removeEventListener('afterprint', fin); };
    window.addEventListener('afterprint', fin);
    toast('En «Destino», elige «Guardar como PDF»');
    setTimeout(function () { window.print(); }, 60);
  }
  $('#imprimir').onclick = function () { imprimirLibros(marcados().map(function (b) { return b.e.id; })); };

  // ---------- ejercicios propios
  // guarda fecha / tema / enunciado de un ejercicio (propio: en su ficha; de clase: como edición sobre el original)
  function guardarCampos(id, datos) {
    datos = Object.assign({}, datos, { t: Date.now() });
    var k = S.propios.findIndex(function (p) { return p.id === id; });
    if (k >= 0) S.propios[k] = Object.assign({}, S.propios[k], datos);
    else { S.editados = S.editados || {}; S.editados[id] = Object.assign({}, S.editados[id], datos); }
    guardar();
  }

  // ---------- categoría (tema) editable al instante
  function pintarTema() {
    var b = $('#eTema'); b.textContent = actual.tema ? actual.tema : '＋ Categoría'; b.classList.toggle('vacio', !actual.tema);
    b.hidden = false; $('#eTemaIn').hidden = true;
  }
  $('#eTema').onclick = function () { var i = $('#eTemaIn'); i.value = actual.tema || ''; this.hidden = true; i.hidden = false; i.focus(); i.select(); };
  (function () {
    var i = $('#eTemaIn'), cancelado = false;
    function cerrar(guarda) {
      if (i.hidden) return; var v = i.value.trim().slice(0, 40); i.hidden = true; $('#eTema').hidden = false;
      if (guarda && v !== (actual.tema || '')) { var id = actual.id; guardarCampos(id, { tema: v }); abrir(id); toast(v ? 'Categoría: ' + v : 'Categoría quitada'); }
    }
    i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); cerrar(true); } if (e.key === 'Escape') { cancelado = true; cerrar(false); } });
    i.addEventListener('blur', function () { if (cancelado) { cancelado = false; return; } cerrar(true); });
  })();

  // ---------- notas por ejercicio
  var tNota;
  function cargarNota() {
    var n = (S.notas[actual.id] || {}).texto || '';
    $('#notaTxt').value = n; $('#notasBox').open = !!n; $('#notasMarca').textContent = n ? '●' : '';
  }
  $('#notaTxt').addEventListener('input', function () {
    var id = actual.id, v = this.value;
    S.notas[id] = { texto: v, t: Date.now() }; $('#notasMarca').textContent = v.trim() ? '●' : '';
    clearTimeout(tNota); tNota = setTimeout(function () { guardar(); pintarLista(); }, 500);
  });
  $('#notaTxt').addEventListener('blur', function () { clearTimeout(tNota); guardar(); pintarLista(); });

  var editando = null;   // id del ejercicio que se está editando (null = creando uno nuevo)
  $('#nuevo').onclick = function () {
    editando = null; $('#fNuevo').reset();
    $('#dlgTitulo').textContent = 'Nuevo ejercicio propio'; $('#dlgOk').textContent = 'Crear';
    $('#dlgAyuda').textContent = 'Escribe un caso de tu clase. Revisaré que el asiento cuadre y que las cuentas existan.';
    $('#dlgNuevo').showModal();
  };
  $('#editarEj').onclick = function () {
    editando = actual.id; var f = $('#fNuevo').elements;
    f.fecha.value = actual.fecha || ''; f.tema.value = actual.tema || ''; f.enunciado.value = actual.enunciado || '';
    $('#dlgTitulo').textContent = 'Editar ejercicio'; $('#dlgOk').textContent = 'Guardar cambios';
    $('#dlgAyuda').textContent = actual.solucion ? 'Cambia el texto, la fecha o el tema. Ojo: la verificación sigue usando la solución original; si cambias cuentas o montos, la corrección no coincidirá con tu versión.' : 'Cambia la fecha, el tema o el enunciado. Tu asiento ya escrito se conserva.';
    $('#dlgNuevo').showModal();
  };
  $('#dlgNuevo').addEventListener('close', function () {
    if ($('#dlgNuevo').returnValue !== 'ok') return;
    var f = $('#fNuevo').elements, en = f.enunciado.value.trim(); if (!en) return;
    var datos = { fecha: f.fecha.value.trim(), tema: f.tema.value.trim(), enunciado: en };
    if (editando) { var id = editando; editando = null; guardarCampos(id, datos); abrir(id, true); toast('Cambios guardados'); return; }
    var p = Object.assign({ id: 'propio-' + Date.now(), t: Date.now() }, datos);
    S.propios.push(p); guardar(); abrir(p.id, true); toast('Ejercicio creado');
  });
  $('#restaurarEj').onclick = function () {
    if (!actual.editado || !confirm('¿Volver al enunciado original de este ejercicio? Tu asiento escrito se conserva.')) return;
    var id = actual.id; delete S.editados[id]; guardar(); abrir(id, true); toast('Enunciado original restaurado');
  };
  $('#borrarPropio').onclick = function () {
    if (!actual.propio || !confirm('¿Eliminar este ejercicio propio y su asiento?')) return;
    var id = actual.id; pasos(actual).forEach(function (p, k) { delete S.trabajo[wk(id, k)]; delete S.estado[wk(id, k)]; });
    S.propios = S.propios.filter(function (p) { return p.id !== id; }); guardar(); abrir(todos()[0].id);
  };

  // ---------- Excel de los libros marcados: Formato 5.1 (.xlsx), una hoja por ejercicio
  $('#exportar').onclick = function () {
    var LB = marcados(); if (!LB.length || !window.LibroXLSX) return;
    window.LibroXLSX(LB.map(function (b) {
      var e = b.e;
      return {
        hoja: e.empresa ? e.empresa.replace(/^(Comercial|Distribuidora)\s+/i, '').replace(/\s+S\.?A\.?C\.?$/i, '') : 'Ejercicio ' + b.n,
        empresa: e.empresa || '', ruc: e.ruc || '', periodo: e.periodo || '', enunciado: e.enunciado,
        asientos: b.A.map(function (a) { return { fecha: a.p.fecha || e.fecha || '', glosa: a.w.glosa || '', doc: a.p.doc || '', lineas: a.L }; })
      };
    }), 'libro-diario-formato-5.1-' + (DI.sub ? 'subidos-' + DI.sub.replace(/\//g, '-') : hoy()) + '.xlsx');
    toast('Excel descargado: una hoja por ejercicio');
  };

  // ---------- copia de seguridad: descarga con fecha y restauración que combina (no borra lo que ya tienes)
  var CPK = 'jg-contabilidad-copia';
  function nAsientos(d) { return Object.keys(d.trabajo || {}).filter(function (k) { return conLineas(d.trabajo[k]).length; }).length; }
  function fechaTxt(t) { return new Date(t).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  function infoCopia() {
    var t = 0; try { t = +localStorage.getItem(CPK) || 0; } catch (e) { }
    var n = nAsientos(S), dias = t ? Math.floor((Date.now() - t) / 864e5) : -1;
    $('#copiaInfo').innerHTML = 'Tienes <b>' + n + ' asiento' + (n === 1 ? '' : 's') + '</b> en este navegador. ' +
      (t ? 'Última copia descargada aquí: <b>' + fechaTxt(t) + '</b>' + (dias >= 7 ? ' (hace ' + dias + ' días: conviene una nueva).' : '.') : (n ? 'Aún no descargas ninguna copia en este equipo.' : ''));
  }
  $('#respaldo').onclick = function () {
    var d = JSON.parse(JSON.stringify(S)); d.copia = { fecha: new Date().toISOString(), asientos: nAsientos(S), origen: 'politon.pe/joseguzman/contabilidad' };
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })); a.download = 'practica-contabilidad-' + hoy() + '.json'; a.click();
    try { localStorage.setItem(CPK, String(Date.now())); } catch (e) { }
    infoCopia(); toast('Copia descargada: guárdala en tu Drive o en un USB');
  };
  $('#importar').onchange = function (e) {
    var inp = e.target, f = inp.files[0]; if (!f) return;
    f.text().then(function (t) {
      var d = JSON.parse(t); if (!d || typeof d.trabajo !== 'object') throw 0;
      var n = nAsientos(d), cuando = d.copia && d.copia.fecha ? ' del ' + fechaTxt(d.copia.fecha) : '';
      if (!confirm('Copia' + cuando + ' con ' + n + ' asiento' + (n === 1 ? '' : 's') + ((d.propios || []).length ? ' y ' + d.propios.length + ' ejercicio(s) propio(s)' : '') + '.\n\nSe combinará con lo que ya tienes: no se borra nada y, si un asiento está en los dos lados, se queda la versión más reciente.\n\n¿Continuar?')) return;
      delete d.copia; var m = unir(S, d);
      S = m; S.trabajo = S.trabajo || {}; S.propios = S.propios || []; S.estado = S.estado || {}; S.editados = S.editados || {}; S.notas = S.notas || {}; S.intentos = S.intentos || {};
      guardar(); usarVersion(S.version || ver); abrir(actual && todos().some(function (x) { return x.id === actual.id; }) ? actual.id : todos()[0].id);
      pintarDiario(); toast('Copia recuperada: ahora tienes ' + nAsientos(S) + ' asientos');
    }).catch(function () { alert('Ese archivo no es una copia válida de esta página.'); }).then(function () { inp.value = ''; });
  };

  // une dos estados (local y copia o nube): por cada asiento gana la versión más reciente
  function unir(a, b) {
    a = a || {}; b = b || {};
    var out = Object.assign({}, b, { version: a.version || b.version, ultimo: a.ultimo || b.ultimo });
    out.trabajo = {}; var ids = Object.keys(Object.assign({}, a.trabajo, b.trabajo));
    ids.forEach(function (id) { var x = (a.trabajo || {})[id], y = (b.trabajo || {})[id]; out.trabajo[id] = !x ? y : !y ? x : ((x.t || 0) >= (y.t || 0) ? x : y); });
    var pm = {}; (b.propios || []).concat(a.propios || []).forEach(function (p) { if (!pm[p.id] || (p.t || 0) >= (pm[p.id].t || 0)) pm[p.id] = p; });
    var orden = []; (b.propios || []).concat(a.propios || []).forEach(function (p) { if (orden.indexOf(p.id) < 0) orden.push(p.id); });
    out.propios = orden.map(function (id) { return pm[id]; });
    out.editados = {}; var eb = b.editados || {}, ea = a.editados || {};
    Object.keys(Object.assign({}, eb, ea)).forEach(function (id) { var x = ea[id], y = eb[id]; out.editados[id] = !x ? y : !y ? x : ((x.t || 0) >= (y.t || 0) ? x : y); });
    out.notas = {}; var nb = b.notas || {}, na = a.notas || {};
    Object.keys(Object.assign({}, nb, na)).forEach(function (id) { var x = na[id], y = nb[id]; out.notas[id] = !x ? y : !y ? x : ((x.t || 0) >= (y.t || 0) ? x : y); });
    out.intentos = {}; var ib = b.intentos || {}, ia = a.intentos || {};
    Object.keys(Object.assign({}, ib, ia)).forEach(function (id) { var x = ia[id], y = ib[id]; out.intentos[id] = !x ? y : !y ? x : ((x.t || 0) >= (y.t || 0) ? x : y); });
    out.estado = Object.assign({}, b.estado, a.estado);
    Object.keys(out.estado).forEach(function (id) { var x = (a.trabajo || {})[id], y = (b.trabajo || {})[id]; if (x && y && (y.t || 0) > (x.t || 0) && !(b.estado || {})[id]) delete out.estado[id]; });
    return out;
  }

  // ---------- puente con la nube (contabilidad-nube.js)
  window.CX = {
    estado: function () { return S; },
    unir: unir,
    escribiendo: function () { var a = document.activeElement; return !!(a && a.closest && a.closest('#filas, #glosa, #notaTxt, #eTemaIn')); },
    aplicar: function (nuevo) {
      S = nuevo; S.trabajo = S.trabajo || {}; S.propios = S.propios || []; S.estado = S.estado || {}; S.editados = S.editados || {}; S.notas = S.notas || {}; S.intentos = S.intentos || {};
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
      usarVersion(S.version || ver);
      var id = actual && todos().some(function (e) { return e.id === actual.id; }) ? actual.id : (S.ultimo || todos()[0].id);
      abrir(id); if (!$('#v-diario').hidden) pintarDiario(); if (!$('#v-plan').hidden) pintarPlan();
    },
    toast: function (m) { toast(m); }
  };

  // ---------- vista completa: todos los asientos del ejercicio y sus cuentas T
  var TODK = 'jg-cx-todo', todoOn = false; try { todoOn = localStorage.getItem(TODK) === '1'; } catch (e) { }
  function lineasAs(j) { return j === ak ? leer().filter(function (l) { return l.cuenta || l.debe || l.haber; }) : conLineas(S.trabajo[wk(actual.id, j)]); }
  function pintarTodo() {
    var bt = $('#verTodo'), box = $('#todoBox');
    bt.setAttribute('aria-pressed', String(todoOn)); bt.textContent = todoOn ? '✕ Cerrar la vista completa' : '▤ Ver todos los asientos y cuentas T';
    box.hidden = !todoOn; if (!todoOn || !actual) return;
    var P = pasos(actual), D = 0, H = 0, html = '';
    P.forEach(function (p, j) {
      var k = wk(actual.id, j), L = lineasAs(j), gl = j === ak ? $('#glosa').value : (S.trabajo[k] || {}).glosa, d = 0, h = 0, fe = p.fecha || actual.fecha;
      L.forEach(function (l) { d += l.debe; h += l.haber; }); D += d; H += h;
      var st = S.estado[k] === 'ok' ? 'ok' : L.length ? 'wip' : '';
      var O = L.slice().sort(function (a, b) { return (b.debe ? 1 : 0) - (a.debe ? 1 : 0); });
      html += '<article class="td-as' + (j === ak ? ' cur' : '') + '"><header><span class="st ' + st + '">' + (st === 'ok' ? '✓' : j + 1) + '</span><b>Asiento ' + (j + 1) + '</b>' + (p.titulo ? '<span class="td-tit">' + esc(p.titulo) + '</span>' : '') + (fe ? '<small>' + esc(fe) + '</small>' : '') + '<span class="grow"></span>' +
        (j === ak ? '<span class="td-ed">✏️ Lo editas abajo</span>' : '<button class="lnk" data-edk="' + j + '">Editar</button>') + '</header>' +
        (O.length ? '<div class="tbl-wrap"><table class="td-t"><tbody>' + O.map(function (l) { return '<tr><td class="cta"><b>' + esc(l.cuenta) + '</b></td><td' + (l.haber && !l.debe ? ' class="h"' : '') + '>' + esc(l.detalle) + '</td><td class="n">' + (l.debe ? fmt(l.debe) : '') + '</td><td class="n">' + (l.haber ? fmt(l.haber) : '') + '</td></tr>'; }).join('') +
          '</tbody><tfoot><tr><td></td><td class="gl">' + (gl ? esc(gl) : '') + (Math.abs(d - h) < 0.005 ? '' : ' <span class="cuadre no">no cuadra</span>') + '</td><td class="n">' + fmt(d) + '</td><td class="n">' + fmt(h) + '</td></tr></tfoot></table></div>' : '<p class="tiny td-vacio">Sin líneas todavía.</p>') + '</article>';
    });
    box.innerHTML = '<div class="td-h"><h3>Todos los asientos del ejercicio</h3><span class="tiny">Debe S/ ' + fmt(D) + ' · Haber S/ ' + fmt(H) + (Math.abs(D - H) < 0.005 ? ' · ✓ cuadra' : '') + '</span></div>' + html + cuentasT();
  }
  function cuentasT() {
    var M = {}, P = pasos(actual);
    P.forEach(function (p, j) { lineasAs(j).forEach(function (l) { if (!l.cuenta) return; var m = M[l.cuenta] || (M[l.cuenta] = { d: [], h: [] }); if (l.debe) m.d.push([j + 1, l.debe]); if (l.haber) m.h.push([j + 1, l.haber]); }); });
    var C = Object.keys(M).sort(); if (!C.length) return '';
    var col = function (A) { return A.map(function (x) { return '<div><span class="tn">(' + x[0] + ')</span>' + fmt(x[1]) + '</div>'; }).join(''); };
    var sum = function (A) { return A.reduce(function (s, x) { return s + x[1]; }, 0); };
    return '<div class="td-h ct-h"><h3>Cuentas T · mayor de este ejercicio</h3><span class="tiny">El número entre paréntesis es el asiento. El saldo es la diferencia entre el debe y el haber.</span></div><div class="ctas">' + C.map(function (c) {
      var m = M[c], d = sum(m.d), h = sum(m.h), sd = d - h, e = EL[c.charAt(0)] || [], nat = e[2], contra = nat && Math.abs(sd) >= 0.005 && ((nat === 'debe') !== (sd > 0)) && !/^(19|29|39|4011|59|61)/.test(c);
      return '<div class="ct' + (contra ? ' raro' : '') + '"><div class="ct-n"><b>' + c + '</b> ' + esc(cap(MAP[c] || '')) + '</div><div class="ct-c"><div class="ct-d"><i>Debe</i>' + col(m.d) + '</div><div class="ct-hb"><i>Haber</i>' + col(m.h) + '</div></div>' +
        '<div class="ct-s">' + (Math.abs(sd) < 0.005 ? 'Saldada (saldo 0)' : 'Saldo ' + (sd > 0 ? 'deudor' : 'acreedor') + ' <b>S/ ' + fmt(Math.abs(sd)) + '</b>') + (contra ? '<br><span class="ct-w">⚠ Su saldo va contra su naturaleza (' + esc(e[0].toLowerCase()) + ', aumenta por el ' + nat + '). ¿Es correcto?</span>' : '') + '</div></div>';
    }).join('') + '</div>';
  }
  $('#verTodo').onclick = function () { todoOn = !todoOn; try { localStorage.setItem(TODK, todoOn ? '1' : '0'); } catch (e) { } pintarTodo(); if (todoOn) $('#todoBox').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  $('#todoBox').addEventListener('click', function (e) { var b = e.target.closest('[data-edk]'); if (!b) return; abrir(actual.id, false, +b.getAttribute('data-edk')); $('#asiento').scrollIntoView({ behavior: 'smooth', block: 'center' }); });

  // ---------- ¿qué pasó? efecto del asiento en la ecuación contable
  var GR = { '1': 'A', '2': 'A', '3': 'A', '4': 'P', '5': 'Pt', '6': 'G', '7': 'I' }, GRN = { A: 'activo', P: 'pasivo', Pt: 'patrimonio', G: 'gasto', I: 'ingreso' };
  var ECK = 'jg-cx-ecu'; try { $('#ecuBox').open = localStorage.getItem(ECK) === '1'; } catch (e) { }
  $('#ecuBox').addEventListener('toggle', function () { try { localStorage.setItem(ECK, this.open ? '1' : '0'); } catch (e) { } });
  function pintarEcu() {
    var box = $('#ecu'), L = leer().filter(function (l) { return l.cuenta && MAP[l.cuenta] && (l.debe || l.haber); });
    if (!L.length) { box.innerHTML = '<p class="tiny">Escribe tu asiento y aquí verás qué aumenta, qué disminuye y si la ecuación contable se mantiene.</p>'; return; }
    var T = { A: 0, P: 0, Pt: 0, G: 0, I: 0 }, fuera = [], li = [];
    L.forEach(function (l) {
      var g = /^79/.test(l.cuenta) ? null : GR[l.cuenta.charAt(0)];
      if (!g) { fuera.push(l.cuenta); return; }
      var v = l.debe - l.haber, dl = g === 'A' || g === 'G' ? v : -v; T[g] += dl;
      var c2 = l.cuenta.slice(0, 2), nm = (l.cuenta.length > 3 && MAP[c2] ? cap(MAP[c2]) + ' – ' : '') + cap(MAP[l.cuenta]);
      li.push('<li><span class="' + (dl >= 0 ? 'up' : 'dn') + '">' + (dl >= 0 ? '▲' : '▼') + '</span><span><b>' + esc(l.cuenta) + '</b> ' + esc(nm) + ' <small>(' + GRN[g] + ')</small>: ' + (dl >= 0 ? 'aumenta' : 'disminuye') + ' S/ ' + fmt(Math.abs(dl)) + ', por eso va al <b>' + (l.debe ? 'debe' : 'haber') + '</b>.' +
        (/^4011/.test(l.cuenta) && l.debe ? ' <small>Es crédito fiscal: reduce el IGV que la empresa pagará.</small>' : '') + '</span></li>');
    });
    var res = T.I - T.G, ok = Math.abs(T.A - (T.P + T.Pt + res)) < 0.005;
    var t = function (n, v) { return '<div class="ec-t"><span>' + n + '</span><b class="' + (v > 0.004 ? 'up' : v < -0.004 ? 'dn' : '') + '">' + (v > 0.004 ? '+' : v < -0.004 ? '−' : '') + fmt(Math.abs(v)) + '</b></div>'; };
    box.innerHTML = '<div class="ec">' + t('Activo', T.A) + '<span class="ec-op">=</span>' + t('Pasivo', T.P) + '<span class="ec-op">+</span>' + t('Patrimonio', T.Pt) + '<span class="ec-op">+</span>' + t('Resultado <small>ingresos − gastos</small>', res) + '</div>' +
      (fuera.length ? '<p class="tiny">' + esc(fuera.join(', ')) + ': cuentas de orden, de saldos, analíticas o de destino (79); no cambian la ecuación.</p>' : '<p class="ec-ok ' + (ok ? 'si' : 'no') + '">' + (ok ? '✓ La ecuación se mantiene: lo que cambia a la izquierda cambia igual a la derecha.' : '✗ La ecuación no se mantiene: tu asiento no cuadra.') + '</p>') +
      '<ul class="ec-l">' + li.join('') + '</ul>';
  }

  // ---------- fecha «Hoy» en los formularios
  function hoyCorto() { var d = new Date(); return d2(d.getDate()) + '/' + d2(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(2); }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-hoy]'); if (!b) return; var i = b.parentNode.querySelector('input'); i.value = hoyCorto(); i.focus(); });

  // ---------- 🎯 ponte a prueba: cuestionario rápido del plan de cuentas
  var QZ = null, QBK = 'jg-cx-quiz-mejor';
  function barajar(A) { A = A.slice(); for (var i = A.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = A[i]; A[i] = A[j]; A[j] = t; } return A; }
  function quizNuevo() {
    var B = LIST.filter(function (x) { return (x.c.length === 2 || x.c.length === 3) && /^[1-7]/.test(x.c); }), Q = [], usados = {}, vueltas = 0;
    while (Q.length < 10 && vueltas++ < 500) {
      var x = B[Math.floor(Math.random() * B.length)], tipo = Q.length % 3; if (usados[x.c]) continue;
      if (tipo === 2 && /^(19|29|39|59|61|79)/.test(x.c)) continue;
      usados[x.c] = 1;
      var mis = B.filter(function (y) { return y.c.length === x.c.length && y.c !== x.c && y.c.charAt(0) === x.c.charAt(0) && norm(y.n) !== norm(x.n); });
      if (mis.length < 3) mis = B.filter(function (y) { return y.c.length === x.c.length && y.c !== x.c; });
      var ops = barajar([x].concat(barajar(mis).slice(0, 3))), ex = '<b>' + x.c + ' ' + esc(cap(x.n)) + '</b>' + (ruta(x.c).length ? ' · ' + esc(rutaTxt(x.c, true)) : '') + '.';
      if (tipo === 0) Q.push({ q: '¿Qué cuenta es la <b>' + x.c + '</b>?', ops: ops.map(function (y) { return { t: cap(y.n), ok: y === x }; }), ex: ex });
      else if (tipo === 1) Q.push({ q: '¿Cuál es el código de <b>' + esc(cap(x.n)) + '</b>?', ops: ops.map(function (y) { return { t: y.c, ok: y === x }; }), ex: ex });
      else { var e = EL[x.c.charAt(0)]; Q.push({ q: 'La cuenta <b>' + x.c + ' ' + esc(cap(x.n)) + '</b>, ¿aumenta por el debe o por el haber?', ops: [{ t: 'Debe', ok: e[2] === 'debe' }, { t: 'Haber', ok: e[2] === 'haber' }], ex: 'Es una cuenta de <b>' + esc(e[0].toLowerCase()) + '</b> (elemento ' + x.c.charAt(0) + '): aumenta por el <b>' + e[2] + '</b>.' }); }
    }
    QZ = { Q: Q, i: 0, ok: 0, r: null };
  }
  function pintarQuiz() {
    var b = $('#quiz'), mejor = 0; try { mejor = +localStorage.getItem(QBK) || 0; } catch (e) { }
    if (QZ.i >= QZ.Q.length) {
      var n = QZ.Q.length, rec = QZ.ok > mejor; if (rec) try { localStorage.setItem(QBK, String(QZ.ok)); } catch (e) { }
      b.innerHTML = '<div class="qz-top"><b>🎯 Resultado</b><span class="grow"></span><button class="lnk" data-qz="cerrar">Cerrar</button></div><p class="qz-res"><b>' + QZ.ok + ' de ' + n + '</b> correctas' + (rec ? ' · ¡nuevo récord!' : mejor ? ' · tu mejor marca: ' + mejor : '') + '</p><p class="tiny">' + (QZ.ok === n ? 'Perfecto. Prueba otra ronda: las preguntas cambian cada vez.' : 'Repasa las que fallaste en el plan de cuentas (abajo) y prueba otra ronda.') + '</p><div class="next"><button class="btn navy sm" data-qz="otra">Otra ronda</button></div>';
      return;
    }
    var p = QZ.Q[QZ.i], r = QZ.r;
    b.innerHTML = '<div class="qz-top"><b>🎯 Ponte a prueba</b><span class="tiny">Pregunta ' + (QZ.i + 1) + ' de ' + QZ.Q.length + ' · ' + QZ.ok + ' correctas</span><span class="grow"></span><button class="lnk" data-qz="cerrar">Cerrar</button></div>' +
      '<p class="qz-q">' + p.q + '</p><div class="qz-ops">' + p.ops.map(function (o, j) { return '<button data-op="' + j + '"' + (r != null ? ' disabled class="' + (o.ok ? 'si' : j === r ? 'no' : '') + '"' : '') + '>' + esc(o.t) + '</button>'; }).join('') + '</div>' +
      (r != null ? '<p class="why">' + (p.ops[r].ok ? '✓ Correcto. ' : '✗ No. ') + p.ex + '</p><div class="next"><button class="btn navy sm" data-qz="sig">' + (QZ.i + 1 < QZ.Q.length ? 'Siguiente →' : 'Ver resultado') + '</button></div>' : '');
    var f = b.querySelector(r != null ? '[data-qz="sig"]' : '[data-op]'); if (f) f.focus({ preventScroll: true });
  }
  $('#quizIr').onclick = function () { quizNuevo(); $('#quiz').hidden = false; pintarQuiz(); $('#quiz').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  $('#quiz').addEventListener('click', function (e) {
    var o = e.target.closest('[data-op]'), a = e.target.closest('[data-qz]');
    if (o && QZ.r == null) { QZ.r = +o.getAttribute('data-op'); if (QZ.Q[QZ.i].ops[QZ.r].ok) QZ.ok++; pintarQuiz(); return; }
    if (!a) return; var v = a.getAttribute('data-qz');
    if (v === 'sig') { QZ.i++; QZ.r = null; pintarQuiz(); }
    if (v === 'otra') { quizNuevo(); pintarQuiz(); }
    if (v === 'cerrar') $('#quiz').hidden = true;
  });

  // ---------- inicio
  $('#version').onchange = function () { usarVersion(this.value); $$('#filas tr').forEach(meta); if (!$('#v-plan').hidden) pintarPlan(); toast('Usando el PCGE ' + this.value); };
  usarVersion(ver);
  var h = decodeURIComponent((location.hash || '').slice(1));
  abrir(todos().some(function (e) { return e.id === h; }) ? h : S.ultimo || todos()[0].id);
  if (h === 'plan' || h === 'diario') vista(h); else vista('practica', true);
})();
