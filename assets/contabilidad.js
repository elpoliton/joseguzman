/* contabilidad.js — práctica de asientos, plan de cuentas completo y libro diario (sin dependencias).
   El avance se guarda en localStorage («jg-contabilidad-v1»). */
(function () {
  'use strict';
  if (window.pintarIconos) window.pintarIconos();
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var KEY = 'jg-contabilidad-v1';
  var S = cargar();
  S.trabajo = S.trabajo || {}; S.propios = S.propios || []; S.estado = S.estado || {};
  var ver = S.version || '2019', MAP = {}, LIST = [], actual = null;
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (n) { return (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function (s) { s = String(s || '').replace(/[^\d.,-]/g, '').replace(/,/g, ''); var n = parseFloat(s); return isNaN(n) ? 0 : n; };
  var cap = function (s) { s = String(s || ''); return s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s; };
  function cargar() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
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
  function todos() { return (window.EJERCICIOS || []).concat(S.propios.map(function (p) { return Object.assign({ propio: true }, p); })); }
  function estadoDe(e) { return S.estado[e.id] || (S.trabajo[e.id] && S.trabajo[e.id].lineas.some(function (l) { return l.cuenta || l.debe || l.haber; }) ? 'wip' : ''); }
  function pintarLista() {
    var E = todos();
    $('#lista').innerHTML = E.map(function (e, i) {
      var st = estadoDe(e);
      return '<button class="ex" data-id="' + esc(e.id) + '" aria-current="' + (actual && actual.id === e.id) + '"><span class="st ' + st + '">' + (st === 'ok' ? '✓' : i + 1) + '</span>' +
        '<span class="t"><b>' + esc(e.fecha || '') + '</b> ' + esc(e.enunciado.length > 84 ? e.enunciado.slice(0, 82) + '…' : e.enunciado) + '<small>' + esc(e.tema || '') + (e.propio ? ' · propio' : '') + '</small></span></button>';
    }).join('');
    var base = (window.EJERCICIOS || []), ok = base.filter(function (e) { return S.estado[e.id] === 'ok'; }).length;
    $('#progTxt').textContent = ok + ' de ' + base.length + ' ejercicios resueltos';
    $('#progBar').style.width = (base.length ? 100 * ok / base.length : 0) + '%';
    var cur = $('#lista .ex[aria-current="true"]'); if (cur && window.innerWidth < 900) cur.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
  $('#lista').addEventListener('click', function (e) { var b = e.target.closest('.ex'); if (b) abrir(b.getAttribute('data-id'), true); });

  function abrir(id, scroll) {
    var E = todos(), k = Math.max(0, E.findIndex(function (e) { return e.id === id; }));
    actual = E[k]; S.ultimo = actual.id; guardar();
    $('#eNum').textContent = 'Ejercicio ' + (k + 1) + ' de ' + E.length;
    $('#eFecha').textContent = actual.fecha || 'Sin fecha'; $('#eFecha').hidden = !actual.fecha;
    $('#eTema').textContent = actual.tema || '';
    $('#eTexto').textContent = actual.enunciado;
    $('#borrarPropio').hidden = !actual.propio;
    $('#prevEj').disabled = k === 0; $('#nextEj').disabled = k === E.length - 1;
    $('#solucion').hidden = $('#pista').hidden = !actual.solucion;
    $('#verificar span').textContent = actual.solucion ? 'Verificar' : 'Revisar cuadre';
    var w = S.trabajo[actual.id] || { lineas: [{}, {}], glosa: '' };
    $('#filas').innerHTML = ''; w.lineas.forEach(function (l) { fila(l); });
    $('#glosa').value = w.glosa || '';
    $('#feedback').className = 'fb'; $('#feedback').innerHTML = '';
    totales(); pintarLista();
    try { history.replaceState(null, '', '#' + actual.id); } catch (e) { }
    if (scroll && window.innerWidth < 900) $('.card-e').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
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
      '<td class="noprint"><button class="del" title="Quitar línea" aria-label="Quitar línea">×</button></td>';
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
    S.trabajo[actual.id] = { lineas: leer(), glosa: $('#glosa').value };
    if (S.estado[actual.id] === 'ok') { delete S.estado[actual.id]; pintarLista(); }
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
  $('#limpiar').onclick = function () { if (!confirm('¿Borrar lo que escribiste en este ejercicio?')) return; delete S.trabajo[actual.id]; delete S.estado[actual.id]; guardar(); abrir(actual.id); };

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
    var marca = {};
    if (actual.solucion) {
      var usadas = {};
      actual.solucion.forEach(function (s) {
        var lado = s.lado, otro = lado === 'debe' ? 'haber' : 'debe', nom = s.cuentas[0] + ' ' + cap(MAP[s.cuentas[0]] || '');
        var k = V.findIndex(function (l, i) { return !usadas[i] && acepta(s, l.cuenta) && Math.abs(l[lado] - s.monto) < 0.005; });
        if (k >= 0) { usadas[k] = 1; marca[k] = 'ok'; items.push(['✓', '<b>' + esc(V[k].cuenta) + '</b> en el ' + lado + ' por S/ ' + fmt(s.monto) + '. ' + esc(s.nota)]); return; }
        todo = false;
        var k2 = V.findIndex(function (l, i) { return !usadas[i] && acepta(s, l.cuenta); });
        if (k2 >= 0) {
          usadas[k2] = 1; marca[k2] = 'bad'; var l = V[k2];
          if (l[otro] && !l[lado]) items.push(['✗', '<b>' + esc(l.cuenta) + '</b> va al <b>' + lado.toUpperCase() + '</b>, no al ' + otro + '. ' + esc(s.nota)]);
          else items.push(['✗', '<b>' + esc(l.cuenta) + '</b> es la cuenta correcta, pero el monto es S/ ' + fmt(s.monto) + ' (escribiste S/ ' + fmt(l[lado] || l[otro]) + ').']);
          return;
        }
        var k3 = V.findIndex(function (l, i) { return !usadas[i] && l.cuenta && l.cuenta.length >= 2 && s.cuentas[0].indexOf(l.cuenta) === 0; });
        if (k3 >= 0) { usadas[k3] = 1; marca[k3] = 'bad'; items.push(['~', 'Con <b>' + esc(V[k3].cuenta) + '</b> vas bien encaminado; sé más preciso: <b>' + esc(nom) + '</b>.']); return; }
        items.push(['✗', 'Falta <b>' + esc(nom) + '</b> en el ' + lado + ' por S/ ' + fmt(s.monto) + '. ' + esc(s.nota)]);
      });
      V.forEach(function (l, i) { if (!usadas[i] && l.cuenta) { todo = false; marca[i] = 'bad'; items.push(['✗', '<b>' + esc(l.cuenta) + ' ' + esc(cap(MAP[l.cuenta] || '')) + '</b> no corresponde a este caso.']); } });
      idx.forEach(function (ti, vi) { trs[ti].classList.add(marca[vi] === 'ok' ? 'ok-line' : 'bad-line'); });
    }
    var bien = todo && items.every(function (x) { return x[0] === '✓'; });
    if (bien && actual.solucion) { S.estado[actual.id] = 'ok'; guardar(); pintarLista(); }
    var E = todos(), k4 = E.findIndex(function (e) { return e.id === actual.id; }), sig = E.slice(k4 + 1).concat(E.slice(0, k4)).find(function (e) { return e.solucion && S.estado[e.id] !== 'ok'; });
    fb.className = 'fb on' + (bien ? ' win' : '');
    fb.innerHTML = '<h3>' + (actual.solucion ? (bien ? '¡Correcto! 🎉' : 'Casi: revisa estos puntos') : (Math.abs(d - h) < 0.005 ? 'Tu asiento cuadra' : 'Revisa el cuadre')) + '</h3><ul>' +
      items.map(function (x) { return '<li><span style="color:' + (x[0] === '✓' ? '#1f9a62' : x[0] === '~' ? '#C99A12' : '#b3262d') + ';font-weight:900">' + x[0] + '</span><span>' + x[1] + '</span></li>'; }).join('') + '</ul>' +
      (actual.solucion && bien ? '<p class="why">' + esc(actual.explicacion) + '</p>' : '') +
      (!actual.solucion ? '<p class="why">Ejercicio propio: reviso que cuadre y que las cuentas existan, pero no tengo su solución.</p>' : '') +
      (bien && sig ? '<div class="next"><button class="btn navy" id="irSig">Siguiente ejercicio →</button></div>' : '') +
      (bien && actual.solucion && !sig ? '<p class="why">¡Resolviste todos los ejercicios! Agrega uno propio o pídele más a Claude.</p>' : '');
    if ($('#irSig')) $('#irSig').onclick = function () { abrir(sig.id, true); };
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  $('#verificar').onclick = verificar;
  $('#pista').onclick = function () {
    if (!actual.solucion) return;
    var sol = actual.solucion, nd = sol.filter(function (s) { return s.lado === 'debe'; }).length, nh = sol.length - nd;
    var els = {}; sol.forEach(function (s) { els[s.cuentas[0].slice(0, 2)] = 1; });
    var fb = $('#feedback'); fb.className = 'fb on';
    fb.innerHTML = '<h3>💡 Pista</h3><ul>' +
      '<li><span>•</span><span>El asiento tiene <b>' + sol.length + ' líneas</b>: ' + nd + ' en el debe y ' + nh + ' en el haber.</span></li>' +
      '<li><span>•</span><span>Usa cuentas de estas familias: ' + Object.keys(els).map(function (c) { return '<b>' + c + '</b> ' + esc(cap(MAP[c] || '')); }).join(' · ') + '.</span></li>' +
      '<li><span>•</span><span>Pregúntate: ¿qué aumenta y qué disminuye? Mira el recordatorio de abajo.</span></li></ul>';
  };
  $('#solucion').onclick = function () {
    if (!actual.solucion) return;
    var fb = $('#feedback'); fb.className = 'fb on';
    fb.innerHTML = '<h3>Solución</h3><table><tr><th>Cuenta</th><th>Detalle</th><th class="n">Debe</th><th class="n">Haber</th></tr>' +
      actual.solucion.map(function (s) { var c = s.cuentas[0]; return '<tr><td><b>' + c + '</b></td><td' + (s.lado === 'haber' ? ' style="padding-left:28px"' : '') + '>' + esc(cap(MAP[c] || '')) + '<br><small style="color:var(--muted)">' + esc(s.nota) + '</small></td><td class="n">' + (s.lado === 'debe' ? fmt(s.monto) : '') + '</td><td class="n">' + (s.lado === 'haber' ? fmt(s.monto) : '') + '</td></tr>'; }).join('') +
      '<tr><td></td><td><i>' + esc(actual.glosa || '') + '</i></td><td></td><td></td></tr></table><p class="why">' + esc(actual.explicacion) + '</p>' +
      '<div class="next"><button class="btn line sm" id="copiarSol">Copiar la solución a mi asiento</button></div>';
    $('#copiarSol').onclick = function () {
      S.trabajo[actual.id] = { lineas: actual.solucion.map(function (s) { var c = s.cuentas[0]; return { cuenta: c, detalle: cap(MAP[c] || ''), debe: s.lado === 'debe' ? s.monto : 0, haber: s.lado === 'haber' ? s.monto : 0 }; }), glosa: actual.glosa || '' };
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

  // ---------- libro diario
  function pintarDiario() {
    var n = 0, D = 0, Hh = 0, html = '<tr><th style="width:90px">N.°</th><th style="width:100px">Cuenta</th><th>Detalle</th><th class="n">Debe</th><th class="n">Haber</th></tr>';
    todos().forEach(function (e) {
      var w = S.trabajo[e.id]; if (!w) return;
      var L = w.lineas.filter(function (l) { return l.cuenta || l.debe || l.haber; }); if (!L.length) return;
      n++;
      html += '<tr class="as"><td>' + n + '</td><td colspan="2">' + esc(e.fecha || '') + ' ' + (S.estado[e.id] === 'ok' ? '✓ ' : '') + '<span style="font-weight:400">' + esc(e.enunciado.length > 110 ? e.enunciado.slice(0, 108) + '…' : e.enunciado) + '</span></td><td></td><td></td></tr>';
      L.sort(function (a, b) { return (b.debe ? 1 : 0) - (a.debe ? 1 : 0); }).forEach(function (l) { D += l.debe; Hh += l.haber; html += '<tr><td></td><td><b>' + esc(l.cuenta) + '</b></td><td' + (l.haber && !l.debe ? ' class="h"' : '') + '>' + esc(l.detalle) + '</td><td class="n">' + (l.debe ? fmt(l.debe) : '') + '</td><td class="n">' + (l.haber ? fmt(l.haber) : '') + '</td></tr>'; });
      if (w.glosa) html += '<tr class="gl"><td></td><td></td><td>' + esc(w.glosa) + '</td><td></td><td></td></tr>';
    });
    if (!n) { $('#diario').innerHTML = '<tr><td class="empty">Aún no tienes asientos. Ve a <b>Practicar</b> y resuelve tu primer ejercicio.</td></tr>'; return; }
    html += '<tr class="tt"><td></td><td></td><td style="text-align:right">Totales</td><td class="n">' + fmt(D) + '</td><td class="n">' + fmt(Hh) + '</td></tr>';
    $('#diario').innerHTML = html;
  }

  // ---------- ejercicios propios
  $('#nuevo').onclick = function () { $('#fNuevo').reset(); $('#dlgNuevo').showModal(); };
  $('#dlgNuevo').addEventListener('close', function () {
    if ($('#dlgNuevo').returnValue !== 'ok') return;
    var f = $('#fNuevo').elements, en = f.enunciado.value.trim(); if (!en) return;
    var p = { id: 'propio-' + Date.now(), fecha: f.fecha.value.trim(), tema: f.tema.value.trim(), enunciado: en };
    S.propios.push(p); guardar(); abrir(p.id, true); toast('Ejercicio creado');
  });
  $('#borrarPropio').onclick = function () {
    if (!actual.propio || !confirm('¿Eliminar este ejercicio propio y su asiento?')) return;
    S.propios = S.propios.filter(function (p) { return p.id !== actual.id; }); delete S.trabajo[actual.id]; guardar(); abrir(todos()[0].id);
  };

  // ---------- exportar, imprimir, respaldo
  $('#exportar').onclick = function () {
    var rows = [['N.', 'Fecha', 'Enunciado', 'Cuenta', 'Detalle', 'Debe', 'Haber', 'Glosa']], n = 0;
    todos().forEach(function (e) {
      var w = S.trabajo[e.id]; if (!w) return; var L = w.lineas.filter(function (l) { return l.cuenta || l.debe || l.haber; }); if (!L.length) return; n++;
      L.forEach(function (l, i) { rows.push([i ? '' : n, i ? '' : e.fecha || '', i ? '' : e.enunciado, l.cuenta, l.detalle, l.debe ? l.debe.toFixed(2) : '', l.haber ? l.haber.toFixed(2) : '', i ? '' : w.glosa || '']); });
      rows.push([]);
    });
    var csv = 'sep=;\r\n' + rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[;"\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';'); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = 'libro-diario-practica.csv'; a.click();
  };
  $('#imprimir').onclick = function () { window.print(); };
  $('#respaldo').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); a.download = 'practica-contabilidad.json'; a.click(); };
  $('#importar').onchange = function (e) {
    var f = e.target.files[0]; if (!f) return;
    f.text().then(function (t) { var d = JSON.parse(t); if (!d.trabajo) throw 0; S = d; S.propios = S.propios || []; S.estado = S.estado || {}; guardar(); usarVersion(S.version || '2019'); abrir(S.ultimo || todos()[0].id); pintarDiario(); toast('Copia recuperada'); })
      .catch(function () { alert('Ese archivo no es una copia válida.'); });
  };

  // ---------- inicio
  $('#version').onchange = function () { usarVersion(this.value); $$('#filas tr').forEach(meta); if (!$('#v-plan').hidden) pintarPlan(); toast('Usando el PCGE ' + this.value); };
  usarVersion(ver);
  var h = decodeURIComponent((location.hash || '').slice(1));
  abrir(todos().some(function (e) { return e.id === h; }) ? h : S.ultimo || todos()[0].id);
  if (h === 'plan' || h === 'diario') vista(h); else vista('practica', true);
})();
