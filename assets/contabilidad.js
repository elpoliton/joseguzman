/* contabilidad.js — práctica de asientos con el PCGE (sin dependencias). El avance se guarda en localStorage. */
(function () {
  'use strict';
  if (window.pintarIconos) window.pintarIconos();
  var $ = function (s) { return document.querySelector(s); };
  var KEY = 'jg-contabilidad-v1';
  var S = cargar();
  var ver = S.version || '2019', MAP = {}, LIST = [];
  var actual = null;
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (n) { return (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function (s) { s = String(s || '').replace(/[^\d.,-]/g, '').replace(/,/g, ''); var n = parseFloat(s); return isNaN(n) ? 0 : n; };

  function cargar() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  S.trabajo = S.trabajo || {}; S.propios = S.propios || []; S.estado = S.estado || {};

  // ---------- plan contable
  function usarVersion(v) {
    ver = v; S.version = v; guardar();
    var P = (window.PCGE || {})[v]; MAP = {}; LIST = [];
    P.cuentas.forEach(function (c) { MAP[c[0]] = c[1]; LIST.push({ c: c[0], n: c[1], k: norm(c[1]) }); });
    $('#version').value = v;
  }
  function nombre(c) { return MAP[c] || ''; }
  function ruta(c) { // Elemento › 12 … › 121 … › 1212 …
    var out = [];
    for (var i = 1; i <= c.length; i++) { var p = c.slice(0, i); if (MAP[p]) out.push(p + ' ' + cap(MAP[p])); }
    return out;
  }
  function cap(s) { return s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s; }
  function buscar(q, max) {
    q = norm(q).trim(); if (!q) return [];
    if (/^\d+$/.test(q)) return LIST.filter(function (x) { return x.c.indexOf(q) === 0; }).sort(function (a, b) { return a.c.length - b.c.length || (a.c < b.c ? -1 : 1); }).slice(0, max);
    var w = q.split(/\s+/);
    return LIST.filter(function (x) { return w.every(function (t) { return x.k.indexOf(t) >= 0 || x.c.indexOf(t) === 0; }); })
      .sort(function (a, b) { return a.c.length - b.c.length || (a.c < b.c ? -1 : 1); }).slice(0, max);
  }

  // ---------- ejercicios
  function todos() { return (window.EJERCICIOS || []).concat(S.propios.map(function (p) { return Object.assign({ propio: true }, p); })); }
  function pintarLista() {
    var E = todos(), ok = 0;
    $('#lista').innerHTML = E.map(function (e, i) {
      var st = S.estado[e.id] || (S.trabajo[e.id] && S.trabajo[e.id].lineas.some(function (l) { return l.cuenta || l.debe || l.haber; }) ? 'wip' : '');
      if (st === 'ok') ok++;
      return '<button class="ex" data-id="' + esc(e.id) + '" aria-current="' + (actual && actual.id === e.id) + '"><span class="st ' + st + '">' + (st === 'ok' ? '✓' : i + 1) + '</span>' +
        '<span class="t"><b>' + esc(e.fecha || '') + '</b> ' + esc(e.enunciado.length > 90 ? e.enunciado.slice(0, 88) + '…' : e.enunciado) + '<small>' + esc(e.tema || '') + (e.propio ? ' · propio' : '') + '</small></span></button>';
    }).join('');
    var conSol = (window.EJERCICIOS || []).length;
    $('#avance').textContent = ok + ' de ' + conSol + ' resueltos';
  }
  $('#lista').addEventListener('click', function (e) { var b = e.target.closest('.ex'); if (b) abrir(b.getAttribute('data-id')); });

  function abrir(id) {
    actual = todos().find(function (e) { return e.id === id; }) || todos()[0];
    S.ultimo = actual.id; guardar();
    $('#eFecha').textContent = actual.fecha || 'Sin fecha'; $('#eTema').textContent = actual.tema || '';
    $('#eTexto').textContent = actual.enunciado;
    $('#borrarPropio').hidden = !actual.propio;
    $('#solucion').hidden = !actual.solucion; $('#verificar').innerHTML = (window.ICONOS ? '<i class="ico">' + window.ICONOS.FaCheck + '</i> ' : '') + (actual.solucion ? 'Verificar' : 'Revisar cuadre');
    var w = S.trabajo[actual.id] || { lineas: [{}, {}], glosa: '' };
    $('#filas').innerHTML = ''; w.lineas.forEach(function (l) { fila(l); });
    $('#glosa').value = w.glosa || '';
    $('#feedback').className = 'fb'; $('#feedback').innerHTML = '';
    totales(); pintarLista();
    if (window.innerWidth < 900) $('.cx-work').scrollIntoView({ behavior: 'smooth' });
  }

  // ---------- filas del asiento
  function fila(l) {
    l = l || {};
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><div class="cta-wrap"><input class="in cta-in" inputmode="numeric" placeholder="Código" aria-label="Cuenta" value="' + esc(l.cuenta || '') + '"><div class="path"></div></div></td>' +
      '<td><input class="in det-in" placeholder="Detalle (se completa al elegir la cuenta)" aria-label="Detalle" value="' + esc(l.detalle || '') + '"></td>' +
      '<td class="c-num"><input class="in debe-in" inputmode="decimal" placeholder="0.00" aria-label="Debe" value="' + (l.debe ? fmt(l.debe) : '') + '"></td>' +
      '<td class="c-num"><input class="in haber-in" inputmode="decimal" placeholder="0.00" aria-label="Haber" value="' + (l.haber ? fmt(l.haber) : '') + '"></td>' +
      '<td class="noprint"><button class="del" title="Quitar línea" aria-label="Quitar línea">×</button></td>';
    tr.dataset.auto = l.detalle && l.detalle === nombre(l.cuenta) ? '1' : (l.detalle ? '' : '1');
    $('#filas').appendChild(tr); mostrarRuta(tr);
    return tr;
  }
  function mostrarRuta(tr) {
    var c = tr.querySelector('.cta-in').value.trim(), p = tr.querySelector('.path');
    if (!c) { p.textContent = ''; p.className = 'path'; return; }
    if (!MAP[c]) { p.textContent = 'No existe en el PCGE ' + ver; p.className = 'path bad'; return; }
    var r = ruta(c); p.className = 'path'; p.textContent = r.slice(0, -1).map(function (x) { return x.length > 46 ? x.slice(0, 44) + '…' : x; }).join(' › ');
    tr.classList.toggle('haber-row', num(tr.querySelector('.haber-in').value) > 0 && !num(tr.querySelector('.debe-in').value));
  }
  function elegirCuenta(tr, c) {
    tr.querySelector('.cta-in').value = c;
    var det = tr.querySelector('.det-in');
    if (tr.dataset.auto === '1' || !det.value) { det.value = cap(nombre(c)); tr.dataset.auto = '1'; }
    mostrarRuta(tr); cerrarAC(); persistir();
    var d = tr.querySelector('.debe-in'), h = tr.querySelector('.haber-in'); (num(d.value) || num(h.value) ? det : d).focus();
  }
  function leer() {
    return Array.prototype.map.call(document.querySelectorAll('#filas tr'), function (tr) {
      return { cuenta: tr.querySelector('.cta-in').value.trim(), detalle: tr.querySelector('.det-in').value.trim(), debe: num(tr.querySelector('.debe-in').value), haber: num(tr.querySelector('.haber-in').value) };
    });
  }
  function persistir() {
    if (!actual) return;
    S.trabajo[actual.id] = { lineas: leer(), glosa: $('#glosa').value };
    if (S.estado[actual.id] === 'ok') delete S.estado[actual.id];
    guardar(); totales();
  }
  function totales() {
    var L = leer(), d = 0, h = 0; L.forEach(function (l) { d += l.debe; h += l.haber; });
    $('#tDebe').textContent = fmt(d); $('#tHaber').textContent = fmt(h);
    var c = $('#cuadre');
    if (!d && !h) { c.className = 'cuadre'; c.textContent = ''; }
    else if (Math.abs(d - h) < 0.005) { c.className = 'cuadre ok'; c.textContent = '✓ Cuadra: debe = haber'; }
    else { c.className = 'cuadre no'; c.textContent = '✗ No cuadra: diferencia S/ ' + fmt(Math.abs(d - h)); }
  }

  var filas = $('#filas');
  filas.addEventListener('input', function (e) {
    var tr = e.target.closest('tr');
    if (e.target.classList.contains('cta-in')) { e.target.value = e.target.value.replace(/[^\d]/g, '').slice(0, 6); abrirAC(e.target); mostrarRuta(tr); }
    if (e.target.classList.contains('det-in')) tr.dataset.auto = '';
    if (e.target.classList.contains('debe-in') && e.target.value) tr.querySelector('.haber-in').value = '';
    if (e.target.classList.contains('haber-in') && e.target.value) tr.querySelector('.debe-in').value = '';
    persistir();
  });
  filas.addEventListener('focusout', function (e) {
    var t = e.target, tr = t.closest('tr');
    if (t.classList.contains('debe-in') || t.classList.contains('haber-in')) { var n = num(t.value); t.value = n ? fmt(n) : ''; mostrarRuta(tr); }
    if (t.classList.contains('cta-in')) { setTimeout(function () { if (document.activeElement !== t) cerrarAC(); var c = t.value.trim(); if (c && MAP[c] && (tr.dataset.auto === '1' || !tr.querySelector('.det-in').value)) { tr.querySelector('.det-in').value = cap(nombre(c)); tr.dataset.auto = '1'; persistir(); } }, 180); }
  });
  filas.addEventListener('focusin', function (e) { if (e.target.classList.contains('cta-in') && e.target.value) abrirAC(e.target); });
  filas.addEventListener('click', function (e) { if (e.target.closest('.del')) { e.target.closest('tr').remove(); if (!filas.children.length) fila(); persistir(); } });
  filas.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t.classList.contains('cta-in') && !$('#ac').hidden) {
      var os = Array.prototype.slice.call($('#ac').querySelectorAll('.o')), k = os.findIndex(function (o) { return o.getAttribute('aria-selected') === 'true'; });
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); k = (k + (e.key === 'ArrowDown' ? 1 : -1) + os.length) % os.length; os.forEach(function (o, j) { o.setAttribute('aria-selected', String(j === k)); }); os[k].scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter' && k >= 0) { e.preventDefault(); elegirCuenta(t.closest('tr'), os[k].getAttribute('data-c')); }
      if (e.key === 'Escape') cerrarAC();
      return;
    }
    if (e.key === 'Enter' && (t.classList.contains('debe-in') || t.classList.contains('haber-in'))) { e.preventDefault(); var nt = t.closest('tr').nextElementSibling || fila(); nt.querySelector('.cta-in').focus(); }
  });
  $('#glosa').addEventListener('input', persistir);
  $('#agregar').onclick = function () { fila().querySelector('.cta-in').focus(); persistir(); };
  $('#limpiar').onclick = function () { if (!confirm('¿Borrar lo que escribiste en este ejercicio?')) return; delete S.trabajo[actual.id]; delete S.estado[actual.id]; guardar(); abrir(actual.id); };

  // ---------- autocompletar
  var acFor = null;
  function abrirAC(inp) {
    var R = buscar(inp.value, 12), ac = $('#ac');
    if (!R.length) { cerrarAC(); return; }
    acFor = inp;
    ac.innerHTML = R.map(function (x, i) { var r = ruta(x.c); return '<div class="o" role="option" data-c="' + x.c + '" aria-selected="' + (i === 0) + '"><b>' + x.c + '</b>' + esc(cap(x.n)) + (r.length > 1 ? '<small>' + esc(r.slice(0, -1).map(function (s) { return s.split(' ')[0]; }).join(' › ')) + ' · ' + esc(cap(MAP[x.c.slice(0, 2)] || '')) + '</small>' : '') + '</div>'; }).join('');
    var b = inp.getBoundingClientRect(); ac.style.left = Math.max(12, Math.min(b.left + scrollX, innerWidth - 432)) + 'px'; ac.style.top = (b.bottom + scrollY + 4) + 'px'; ac.hidden = false;
  }
  function cerrarAC() { $('#ac').hidden = true; acFor = null; }
  $('#ac').addEventListener('mousedown', function (e) { var o = e.target.closest('.o'); if (!o || !acFor) return; e.preventDefault(); elegirCuenta(acFor.closest('tr'), o.getAttribute('data-c')); });
  window.addEventListener('resize', cerrarAC);

  // ---------- verificar
  function acepta(sol, c) { return sol.cuentas.some(function (s) { return c === s || (c.indexOf(s) === 0 && MAP[c]); }); }
  function verificar() {
    var L = leer().filter(function (l) { return l.cuenta || l.debe || l.haber; }), fb = $('#feedback'), items = [], todo = true;
    var d = 0, h = 0; L.forEach(function (l) { d += l.debe; h += l.haber; });
    var trs = Array.prototype.slice.call(document.querySelectorAll('#filas tr')); trs.forEach(function (tr) { tr.classList.remove('ok-line', 'bad-line'); });
    if (!L.length) { fb.className = 'fb on'; fb.innerHTML = '<h3>Aún no hay líneas</h3><p>Escribe al menos una cuenta con su monto.</p>'; return; }
    L.forEach(function (l) { if (l.cuenta && !MAP[l.cuenta]) { items.push(['✗', '<b>' + esc(l.cuenta) + '</b> no existe en el PCGE ' + ver + '. Revisa el código en el buscador.']); todo = false; } if (l.debe && l.haber) { items.push(['✗', 'Una línea tiene monto en el debe y en el haber a la vez.']); todo = false; } });
    if (Math.abs(d - h) >= 0.005) { items.push(['✗', 'El asiento no cuadra: debe S/ ' + fmt(d) + ' y haber S/ ' + fmt(h) + '. En todo asiento, la suma del debe es igual a la del haber.']); todo = false; }
    else items.push(['✓', 'El asiento cuadra: S/ ' + fmt(d) + ' en el debe y en el haber.']);
    if (actual.solucion) {
      var usadas = {}, marca = {};
      actual.solucion.forEach(function (s) {
        var lado = s.lado, otro = lado === 'debe' ? 'haber' : 'debe';
        var k = L.findIndex(function (l, i) { return !usadas[i] && acepta(s, l.cuenta) && Math.abs(l[lado] - s.monto) < 0.005; });
        var nom = s.cuentas[0] + ' ' + cap(MAP[s.cuentas[0]] || '');
        if (k >= 0) { usadas[k] = 1; marca[k] = 'ok'; items.push(['✓', '<b>' + esc(L[k].cuenta) + '</b> en el ' + lado + ' por S/ ' + fmt(s.monto) + '. ' + esc(s.nota)]); return; }
        todo = false;
        var k2 = L.findIndex(function (l, i) { return !usadas[i] && acepta(s, l.cuenta); });
        if (k2 >= 0) {
          usadas[k2] = 1; marca[k2] = 'bad'; var l = L[k2];
          if (l[otro] && !l[lado]) items.push(['✗', '<b>' + esc(l.cuenta) + '</b> va al <b>' + lado.toUpperCase() + '</b>, no al ' + otro + '. ' + esc(s.nota)]);
          else items.push(['✗', '<b>' + esc(l.cuenta) + '</b> está bien, pero el monto es S/ ' + fmt(s.monto) + ' (escribiste S/ ' + fmt(l[lado] || l[otro]) + ').']);
          return;
        }
        var corta = L.findIndex(function (l, i) { return !usadas[i] && l.cuenta && l.cuenta.length >= 2 && s.cuentas[0].indexOf(l.cuenta) === 0 && Math.abs((l[lado] || 0) - s.monto) < 0.005; });
        if (corta >= 0) { usadas[corta] = 1; marca[corta] = 'bad'; items.push(['~', 'Usaste <b>' + esc(L[corta].cuenta) + '</b>: va bien encaminado, pero sé más preciso. Lo esperado es <b>' + esc(nom) + '</b>.']); return; }
        items.push(['✗', 'Falta: <b>' + esc(nom) + '</b> en el ' + lado + ' por S/ ' + fmt(s.monto) + '. ' + esc(s.nota)]);
      });
      L.forEach(function (l, i) { if (!usadas[i] && (l.cuenta || l.debe || l.haber)) marca[i] = 'bad'; if (!usadas[i] && l.cuenta) { todo = false; items.push(['✗', 'La cuenta <b>' + esc(l.cuenta) + ' ' + esc(cap(MAP[l.cuenta] || '')) + '</b> no corresponde a este caso.']); } });
      var vi = 0, todasL = leer(); trs.forEach(function (tr, j) { var l = todasL[j]; if (!(l.cuenta || l.debe || l.haber)) return; tr.classList.add(marca[vi] === 'ok' ? 'ok-line' : 'bad-line'); vi++; });
    }
    var bien = todo && !items.some(function (x) { return x[0] !== '✓'; });
    if (bien && actual.solucion) { S.estado[actual.id] = 'ok'; guardar(); pintarLista(); }
    fb.className = 'fb on';
    fb.innerHTML = '<h3>' + (actual.solucion ? (bien ? '¡Correcto! 🎉' : 'Revisa estos puntos') : (Math.abs(d - h) < 0.005 ? 'Tu asiento cuadra' : 'Revisa el cuadre')) + '</h3><ul>' +
      items.map(function (x) { return '<li><span style="color:' + (x[0] === '✓' ? '#1f9a62' : x[0] === '~' ? '#C99A12' : '#b3262d') + ';font-weight:900">' + x[0] + '</span><span>' + x[1] + '</span></li>'; }).join('') + '</ul>' +
      (actual.solucion && bien ? '<p class="why">' + esc(actual.explicacion) + '</p>' : '') +
      (!actual.solucion ? '<p class="why">Este es un ejercicio propio: reviso que el asiento cuadre y que las cuentas existan. Pídele a tu profesor o a Claude que revise la solución.</p>' : '');
  }
  $('#verificar').onclick = verificar;
  $('#solucion').onclick = function () {
    if (!actual.solucion) return;
    var fb = $('#feedback'); fb.className = 'fb on';
    fb.innerHTML = '<h3>Solución</h3><table><tr><th>Cuenta</th><th>Detalle</th><th class="n">Debe</th><th class="n">Haber</th></tr>' +
      actual.solucion.map(function (s) { var c = s.cuentas[0]; return '<tr><td><b>' + c + '</b></td><td>' + esc(cap(MAP[c] || '')) + '<br><small style="color:var(--muted)">' + esc(s.nota) + '</small></td><td class="n">' + (s.lado === 'debe' ? fmt(s.monto) : '') + '</td><td class="n">' + (s.lado === 'haber' ? fmt(s.monto) : '') + '</td></tr>'; }).join('') +
      '<tr><td></td><td><i>' + esc(actual.glosa || '') + '</i></td><td></td><td></td></tr></table><p class="why">' + esc(actual.explicacion) + '</p>' +
      '<p><button class="btn line sm" id="copiarSol">Copiar la solución a mi asiento</button></p>';
    $('#copiarSol').onclick = function () {
      S.trabajo[actual.id] = { lineas: actual.solucion.map(function (s) { var c = s.cuentas[0]; return { cuenta: c, detalle: cap(MAP[c] || ''), debe: s.lado === 'debe' ? s.monto : 0, haber: s.lado === 'haber' ? s.monto : 0 }; }), glosa: actual.glosa || '' };
      guardar(); abrir(actual.id);
    };
  };

  // ---------- buscador
  function pintarBusqueda() {
    var R = buscar($('#q').value, 60);
    $('#res').innerHTML = R.map(function (x) {
      var r = ruta(x.c);
      return '<div class="r-it l' + Math.min(x.c.length, 3) + '"><b>' + x.c + '</b><span>' + esc(cap(x.n)) + (r.length > 1 ? '<span class="p">' + esc(r.slice(0, -1).join(' › ')) + '</span>' : '') + '</span><button data-c="' + x.c + '">Usar</button></div>';
    }).join('') || ($('#q').value ? '<p class="tiny">Sin resultados.</p>' : '');
  }
  $('#q').addEventListener('input', pintarBusqueda);
  $('#res').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-c]'); if (!b) return;
    var vacia = Array.prototype.find.call(document.querySelectorAll('#filas tr'), function (tr) { return !tr.querySelector('.cta-in').value; }) || fila();
    elegirCuenta(vacia, b.getAttribute('data-c')); vacia.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  // ---------- ejercicios propios
  $('#nuevo').onclick = function () { $('#fNuevo').reset(); $('#dlgNuevo').showModal(); };
  $('#dlgNuevo').addEventListener('close', function () {
    if ($('#dlgNuevo').returnValue !== 'ok') return;
    var f = $('#fNuevo').elements, en = f.enunciado.value.trim(); if (!en) return;
    var p = { id: 'propio-' + Date.now(), fecha: f.fecha.value.trim(), tema: f.tema.value.trim(), enunciado: en };
    S.propios.push(p); guardar(); abrir(p.id);
  });
  $('#borrarPropio').onclick = function () {
    if (!actual.propio || !confirm('¿Eliminar este ejercicio propio y su asiento?')) return;
    S.propios = S.propios.filter(function (p) { return p.id !== actual.id; }); delete S.trabajo[actual.id]; guardar(); abrir(todos()[0].id);
  };

  // ---------- exportar, imprimir, respaldo
  $('#exportar').onclick = function () {
    var rows = [['Fecha', 'Enunciado', 'Cuenta', 'Detalle', 'Debe', 'Haber', 'Glosa']];
    todos().forEach(function (e) {
      var w = S.trabajo[e.id]; if (!w) return;
      w.lineas.filter(function (l) { return l.cuenta || l.debe || l.haber; }).forEach(function (l, i) { rows.push([i ? '' : e.fecha || '', i ? '' : e.enunciado, l.cuenta, l.detalle, l.debe ? l.debe.toFixed(2) : '', l.haber ? l.haber.toFixed(2) : '', i ? '' : w.glosa || '']); });
      rows.push([]);
    });
    var csv = 'sep=;\r\n' + rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[;"\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';'); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = 'libro-diario-practica.csv'; a.click();
  };
  $('#imprimir').onclick = function () { window.print(); };
  $('#respaldo').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); a.download = 'practica-contabilidad.json'; a.click(); };
  $('#importar').onchange = function (e) {
    var f = e.target.files[0]; if (!f) return;
    f.text().then(function (t) { var d = JSON.parse(t); if (!d.trabajo) throw 0; S = d; S.propios = S.propios || []; S.estado = S.estado || {}; guardar(); usarVersion(S.version || '2019'); abrir(S.ultimo || todos()[0].id); alert('Copia recuperada.'); })
      .catch(function () { alert('Ese archivo no es una copia válida.'); });
  };

  // ---------- inicio
  $('#version').onchange = function () { usarVersion(this.value); document.querySelectorAll('#filas tr').forEach(mostrarRuta); pintarBusqueda(); };
  usarVersion(ver);
  var h = (location.hash || '').slice(1);
  abrir(todos().some(function (e) { return e.id === h; }) ? h : S.ultimo || todos()[0].id);
})();
