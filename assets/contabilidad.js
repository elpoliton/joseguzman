/* contabilidad.js — práctica de asientos, plan de cuentas completo y libro diario (sin dependencias).
   El avance se guarda en localStorage («jg-contabilidad-v1»). */
(function () {
  'use strict';
  if (window.pintarIconos) window.pintarIconos();
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var KEY = 'jg-contabilidad-v1';
  var S = cargar();
  S.trabajo = S.trabajo || {}; S.propios = S.propios || []; S.estado = S.estado || {}; S.editados = S.editados || {}; S.notas = S.notas || {};
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
  function todos() { S.editados = S.editados || {}; return (window.EJERCICIOS || []).map(function (e) { var x = S.editados[e.id]; return x ? Object.assign({}, e, x, { editado: true }) : e; }).concat(S.propios.map(function (p) { return Object.assign({ propio: true }, p); })); }
  // un ejercicio puede tener varios asientos: cada uno se guarda en su propia clave (id, id~2, id~3…)
  function pasos(e) {
    if (e.asientos && e.asientos.length) return e.asientos;
    var out = [{ fecha: e.fecha, glosa: e.glosa, solucion: e.solucion, explicacion: e.explicacion }];
    for (var i = 1; i < (e.propio ? e.nAsientos || 1 : 1); i++) out.push({});
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
  var filtroTema = '';
  function temasUsados(E) { var m = {}; E.forEach(function (e) { if (e.tema) m[e.tema] = 1; }); return Object.keys(m).sort(function (a, b) { return a.localeCompare(b, 'es', { numeric: true }); }); }
  function pintarLista() {
    var E = todos(), T = temasUsados(E);
    if (filtroTema && T.indexOf(filtroTema) < 0) filtroTema = '';
    var sel = $('#filtroTema');
    sel.innerHTML = '<option value="">Todas las categorías (' + E.length + ')</option>' + T.map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + ' (' + E.filter(function (e) { return e.tema === t; }).length + ')</option>'; }).join('');
    sel.value = filtroTema;
    $('#listaTemas').innerHTML = T.map(function (t) { return '<option value="' + esc(t) + '">'; }).join('');
    $('#lista').innerHTML = E.map(function (e, i) {
      if (filtroTema && e.tema !== filtroTema) return '';
      var st = estadoDe(e), nota = (S.notas[e.id] || {}).texto, np = pasos(e).length;
      return '<button class="ex" data-id="' + esc(e.id) + '" aria-current="' + (actual && actual.id === e.id) + '"><span class="st ' + st + '">' + (st === 'ok' ? '✓' : i + 1) + '</span>' +
        '<span class="t"><b>' + esc(e.fecha || '') + '</b> ' + esc(e.enunciado.length > 84 ? e.enunciado.slice(0, 82) + '…' : e.enunciado) + '<small>' + esc(e.tema || 'Sin categoría') + (np > 1 ? ' · ' + np + ' asientos' : '') + (e.propio ? ' · propio' : '') + (nota ? ' · 📝' : '') + '</small></span></button>';
    }).join('') || '<p class="tiny" style="padding:8px">No hay ejercicios en esta categoría.</p>';
    var base = (window.EJERCICIOS || []), ok = base.filter(okEj).length;
    $('#progTxt').textContent = ok + ' de ' + base.length + ' ejercicios resueltos';
    $('#progBar').style.width = (base.length ? 100 * ok / base.length : 0) + '%';
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
    $('#eFecha').textContent = actual.fecha || 'Sin fecha'; $('#eFecha').hidden = !actual.fecha;
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
    totales(); pintarLista();
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
    }).join('') + (actual.propio ? '<button class="lnk as-mas" data-mas="1">+ Agregar asiento</button>' + (P.length > 1 ? '<button class="lnk as-menos" data-menos="1">Quitar el último</button>' : '') : '');
  }
  $('#asTabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]'), id = actual.id, n = pasos(actual).length;
    if (b) { abrir(id, false, +b.getAttribute('data-k')); return; }
    if (e.target.closest('[data-mas]')) { guardarCampos(id, { nAsientos: n + 1 }); abrir(id, false, n); toast('Asiento ' + (n + 1) + ' agregado'); return; }
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
      '<td class="noprint"><div class="ctl"><button class="grip" title="Arrastra para mover la línea (o usa ↑ ↓ con el teclado)" aria-label="Mover línea">⠿</button><span class="ud"><button class="mv up" title="Subir línea" aria-label="Subir línea">▲</button><button class="mv dn" title="Bajar línea" aria-label="Bajar línea">▼</button></span><button class="del" title="Quitar línea" aria-label="Quitar línea">×</button></div></td>';
    tr.dataset.auto = !l.detalle || l.detalle === cap(MAP[l.cuenta] || '') ? '1' : '';
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
    if (tr.dataset.auto === '1' || !det.value) { det.value = cap(MAP[c]); tr.dataset.auto = '1'; }
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
    guardar(); totales();
  }
  function totales() {
    var d = 0, h = 0; leer().forEach(function (l) { d += l.debe; h += l.haber; });
    $('#tDebe').textContent = fmt(d); $('#tHaber').textContent = fmt(h);
    var c = $('#cuadre');
    if (!d && !h) { c.className = 'cuadre'; c.textContent = ''; }
    else if (Math.abs(d - h) < 0.005) { c.className = 'cuadre ok'; c.textContent = '✓ Cuadra'; }
    else { c.className = 'cuadre no'; c.textContent = 'Falta S/ ' + fmt(Math.abs(d - h)) + ' en el ' + (d > h ? 'haber' : 'debe'); }
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
      if (MAP[c] && (tr.dataset.auto === '1' || !tr.querySelector('.det-in').value)) { tr.querySelector('.det-in').value = cap(MAP[c]); tr.dataset.auto = '1'; persistir(); }
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
  $('#limpiar').onclick = function () { if (!confirm('¿Borrar lo que escribiste en este ejercicio?')) return; delete S.trabajo[clave()]; delete S.estado[clave()]; guardar(); abrir(actual.id); };

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
    var fb = $('#feedback'); fb.className = 'fb on';
    fb.innerHTML = '<h3>Solución</h3><table><tr><th>Cuenta</th><th>Detalle</th><th class="n">Debe</th><th class="n">Haber</th></tr>' +
      P.solucion.map(function (s) { var c = s.cuentas[0]; return '<tr><td><b>' + c + '</b></td><td' + (s.lado === 'haber' ? ' style="padding-left:28px"' : '') + '>' + esc(s.detalle || cap(MAP[c] || '')) + (s.nota ? '<br><small style="color:var(--muted)">' + esc(s.nota) + '</small>' : '') + '</td><td class="n">' + (s.lado === 'debe' ? fmt(s.monto) : '') + '</td><td class="n">' + (s.lado === 'haber' ? fmt(s.monto) : '') + '</td></tr>'; }).join('') +
      '<tr><td></td><td><i>' + esc(P.glosa || '') + '</i></td><td></td><td></td></tr></table>' + (P.explicacion ? '<p class="why">' + esc(P.explicacion) + '</p>' : '') +
      '<div class="next"><button class="btn line sm" id="copiarSol">Copiar la solución a mi asiento</button></div>';
    $('#copiarSol').onclick = function () {
      S.trabajo[clave()] = { lineas: P.solucion.map(function (s) { var c = s.cuentas[0]; return { cuenta: c, detalle: s.detalle || cap(MAP[c] || ''), debe: s.lado === 'debe' ? s.monto : 0, haber: s.lado === 'haber' ? s.monto : 0 }; }), glosa: P.glosa || '', t: Date.now() };
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
  function libros() {
    var out = [];
    todos().forEach(function (e, i) {
      var A = [];
      pasos(e).forEach(function (p, k) {
        var w = S.trabajo[wk(e.id, k)], L = conLineas(w);
        if (L.length) A.push({ k: k, p: p, w: w, ok: S.estado[wk(e.id, k)] === 'ok', L: L.slice().sort(function (a, b) { return (b.debe ? 1 : 0) - (a.debe ? 1 : 0); }) });
      });
      if (A.length) out.push({ e: e, n: i + 1, A: A });
    });
    return out;
  }
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
      '<span class="lb-meta">' + esc(e.tema || 'Sin categoría') + ' · ' + b.A.length + (tot > b.A.length ? ' de ' + tot : '') + (b.A.length === 1 && tot === 1 ? ' asiento' : ' asientos') + '</span><span class="grow"></span>' +
      '<button class="lnk" data-ir="' + esc(e.id) + '">Abrir en Practicar</button><button class="lnk" data-pdf="' + esc(e.id) + '">PDF de este</button></div>' +
      '<div class="lb-cab"><h3>Libro diario <small>Formato 5.1</small></h3>' + (cab.length ? '<dl>' + cab.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>' : '') + '</div>' +
      '<p class="lb-enun">' + esc(e.enunciado) + '</p>' +
      '<div class="tbl-wrap"><table class="diario"><thead><tr><th class="c">N.°</th><th class="c">Fecha</th><th>Glosa</th><th>Cuenta</th><th>Denominación</th><th class="n">Debe</th><th class="n">Haber</th></tr></thead><tbody>' + rows + '</tbody>' +
      '<tfoot><tr class="tt"><td colspan="5" class="r">Totales' + (cuadra ? '' : ' <span class="cuadre no">no cuadra</span>') + '</td><td class="n">' + fmt(D) + '</td><td class="n">' + fmt(H) + '</td></tr></tfoot></table></div></section>';
  }
  function pintarDiario() {
    var LB = libros(), box = $('#diario');
    box.innerHTML = LB.length ? LB.map(libroHTML).join('') : '<div class="empty">Aún no tienes asientos. Ve a <b>Practicar</b> y resuelve tu primer ejercicio.</div>';
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

  // ---------- Excel de los libros marcados
  $('#exportar').onclick = function () {
    var LB = marcados(); if (!LB.length) return;
    var rows = [];
    LB.forEach(function (b) {
      var e = b.e, D = 0, H = 0;
      rows.push(['LIBRO DIARIO - FORMATO 5.1 · Ejercicio ' + b.n + (e.empresa ? ' · ' + e.empresa : '') + (e.ruc ? ' · RUC ' + e.ruc : '')]);
      rows.push([e.enunciado]);
      rows.push(['N.°', 'Fecha', 'Glosa', 'Cuenta', 'Denominación', 'Debe', 'Haber']);
      b.A.forEach(function (a, j) {
        a.L.forEach(function (l, i) { D += l.debe; H += l.haber; rows.push([i ? '' : j + 1, i ? '' : a.p.fecha || e.fecha || '', i ? '' : a.w.glosa || '', l.cuenta, l.detalle, l.debe ? l.debe.toFixed(2) : '', l.haber ? l.haber.toFixed(2) : '']); });
      });
      rows.push(['', '', '', '', 'Totales', D.toFixed(2), H.toFixed(2)]); rows.push([]);
    });
    var csv = 'sep=;\r\n' + rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[;"\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';'); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = 'libro-diario-' + hoy() + '.csv'; a.click();
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
      S = m; S.trabajo = S.trabajo || {}; S.propios = S.propios || []; S.estado = S.estado || {}; S.editados = S.editados || {}; S.notas = S.notas || {};
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
      S = nuevo; S.trabajo = S.trabajo || {}; S.propios = S.propios || []; S.estado = S.estado || {}; S.editados = S.editados || {}; S.notas = S.notas || {};
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
      usarVersion(S.version || ver);
      var id = actual && todos().some(function (e) { return e.id === actual.id; }) ? actual.id : (S.ultimo || todos()[0].id);
      abrir(id); if (!$('#v-diario').hidden) pintarDiario(); if (!$('#v-plan').hidden) pintarPlan();
    },
    toast: function (m) { toast(m); }
  };

  // ---------- inicio
  $('#version').onchange = function () { usarVersion(this.value); $$('#filas tr').forEach(meta); if (!$('#v-plan').hidden) pintarPlan(); toast('Usando el PCGE ' + this.value); };
  usarVersion(ver);
  var h = decodeURIComponent((location.hash || '').slice(1));
  abrir(todos().some(function (e) { return e.id === h; }) ? h : S.ultimo || todos()[0].id);
  if (h === 'plan' || h === 'diario') vista(h); else vista('practica', true);
})();
