/* formato51.js — «Mi Formato 5.1»: libro diario editable, con descarga en Excel y PDF.
   Guarda en S.formatos (se sincroniza con la nube junto con el resto de la práctica).
   Libro: { id, nombre, periodo, ruc, empresa, creado, t, asientos: [{ fecha (aaaa-mm-dd), glosa, libro, corr, doc, lineas: [{ cuenta, detalle, auto, debe, haber }] }] } */
(function () {
  'use strict';
  var CX = window.CX; if (!CX) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (n) { return (+n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function (v) { v = String(v || '').replace(/[^\d.,-]/g, '').replace(/,/g, ''); return Math.round((parseFloat(v) || 0) * 100) / 100; };
  var SELK = 'jg-f51-actual';
  function S() { var s = CX.estado(); s.formatos = s.formatos || []; s.f51borrados = s.f51borrados || {}; return s; }
  function libros() { return S().formatos; }
  var actualId = (function () { try { return localStorage.getItem(SELK) || ''; } catch (e) { return ''; } })();
  function actual() { var L = libros(); return L.find(function (l) { return l.id === actualId; }) || L[0] || null; }
  var tGuardar = null;
  function guardar(rapido) {
    var l = actual(); if (l) l.t = Date.now();
    clearTimeout(tGuardar); tGuardar = setTimeout(function () { tGuardar = null; CX.guardar(); }, rapido ? 0 : 500);
  }
  function guardarYa() { if (tGuardar) { clearTimeout(tGuardar); tGuardar = null; CX.guardar(); } }
  window.addEventListener('pagehide', guardarYa); window.addEventListener('beforeunload', guardarYa);
  document.addEventListener('visibilitychange', function () { if (document.hidden) guardarYa(); });
  function hoyISO() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function aISO(f) { // 'dd/mm/aa' → 'aaaa-mm-dd'
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(String(f || '').trim()); if (!m) return '';
    var y = +m[3]; if (y < 100) y += 2000; return y + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  }
  function aDMA(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : (iso || ''); }
  function lineaVacia() { return { cuenta: '', detalle: '', auto: true, debe: 0, haber: 0, nota: '' }; }
  function asientoVacio(fecha) { return { fecha: fecha || hoyISO(), glosa: '', libro: '', corr: '', doc: '', lineas: [lineaVacia(), lineaVacia()] }; }
  function nuevoLibro(datos) {
    var t = Date.now(), l = Object.assign({ id: 'f51-' + t, nombre: 'Libro diario ' + (libros().length + 1), periodo: '', ruc: '', empresa: '', creado: t, t: t, asientos: [asientoVacio()] }, datos || {});
    libros().push(l); actualId = l.id; try { localStorage.setItem(SELK, actualId); } catch (e) { }
    guardar(true); return l;
  }

  // ---------- dibujo
  var box = $('#f5'), dl = null;
  function datalist() {
    if (dl) return; dl = document.createElement('datalist'); dl.id = 'f5Cuentas';
    dl.innerHTML = CX.cuentas().map(function (x) { return '<option value="' + x.c + '">' + esc(x.n) + '</option>'; }).join('');
    document.body.appendChild(dl);
  }
  function pintar() {
    datalist();
    var L = libros(), l = actual();
    if (l) actualId = l.id;
    $('#f5Sel').innerHTML = L.length ? L.map(function (x) { return '<option value="' + esc(x.id) + '"' + (l && x.id === l.id ? ' selected' : '') + '>' + esc(x.nombre || 'Sin nombre') + '</option>'; }).join('') : '<option value="">Aún no tienes libros</option>';
    $('#f5Ej').innerHTML = '<option value="">Copiar un ejercicio de la práctica…</option>' + CX.ejercicios().map(function (e) { return '<option value="' + esc(e.id) + '">' + e.n + '. ' + esc(e.titulo) + (e.subido ? ' · subido ' + esc(e.subido) : '') + (e.nAs > 1 ? ' · ' + e.nAs + ' asientos' : '') + '</option>'; }).join('');
    ['#f5Dup', '#f5Del', '#f5Xls', '#f5Pdf', '#f5Ren'].forEach(function (s) { $(s).disabled = !l; });
    if (!l) { box.innerHTML = '<div class="empty">Crea tu primer libro con <b>+ Nuevo libro</b> o copia un ejercicio de la práctica para editarlo.</div>'; return; }
    var filas = '', n = 0;
    l.asientos.forEach(function (a, j) {
      var r = a.lineas.length + 1;
      a.lineas.forEach(function (x, i) {
        filas += '<tr data-a="' + j + '" data-l="' + i + '"' + (i === 0 ? ' class="ini"' : '') + '>' +
          (i === 0 ? '<td class="c" rowspan="' + r + '"><b>' + (j + 1) + '</b><button class="f5-x" data-del-a="' + j + '" title="Quitar el asiento ' + (j + 1) + '" aria-label="Quitar el asiento ' + (j + 1) + '">×</button></td>' +
            '<td rowspan="' + r + '"><input class="in" type="date" data-k="fecha" value="' + esc(a.fecha) + '" aria-label="Fecha"></td>' +
            '<td rowspan="' + r + '"><textarea class="in" data-k="glosa" rows="2" placeholder="Por la…" aria-label="Glosa">' + esc(a.glosa) + '</textarea></td>' +
            '<td rowspan="' + r + '"><input class="in c" data-k="libro" value="' + esc(a.libro) + '" placeholder="050100" aria-label="Código del libro (Tabla 8)"></td>' +
            '<td rowspan="' + r + '"><input class="in c" data-k="corr" value="' + esc(a.corr) + '" aria-label="Número correlativo"></td>' +
            '<td rowspan="' + r + '"><input class="in" data-k="doc" value="' + esc(a.doc) + '" placeholder="Factura, voucher…" aria-label="Documento sustentatorio"></td>' : '') +
          '<td><input class="in cta' + (x.cuenta && !CX.existe(x.cuenta) ? ' mal' : '') + '" list="f5Cuentas" data-c="cuenta" value="' + esc(x.cuenta) + '" placeholder="Código" aria-label="Código de cuenta" inputmode="numeric"></td>' +
          '<td><input class="in' + (x.haber && !x.debe ? ' hab' : '') + '" data-c="detalle" value="' + esc(x.detalle) + '" aria-label="Denominación"></td>' +
          '<td><input class="in n" data-c="debe" value="' + (x.debe ? fmt(x.debe) : '') + '" inputmode="decimal" aria-label="Debe"></td>' +
          '<td><input class="in n" data-c="haber" value="' + (x.haber ? fmt(x.haber) : '') + '" inputmode="decimal" aria-label="Haber"></td>' +
          '<td><textarea class="in f5-nota" data-c="nota" rows="' + Math.max(1, Math.ceil((x.nota || '').length / 34)) + '" placeholder="¿Por qué va aquí?" aria-label="¿Por qué va aquí?">' + esc(x.nota || '') + '</textarea></td>' +
          '<td class="acc"><button class="f5-x" data-del-l="' + j + ':' + i + '" title="Quitar línea" aria-label="Quitar línea">×</button></td></tr>';
      });
      filas += '<tr class="f5-pie" data-a="' + j + '"><td colspan="2"><button class="lnk" data-add-l="' + j + '">+ línea</button></td><td colspan="2" class="cuad" id="f5c' + j + '"></td><td colspan="2"></td></tr>';
      n++;
    });
    box.innerHTML = '<div class="tbl-wrap"><table class="f5t"><colgroup>' + [40, 126, 180, 64, 64, 116, 76, 236, 104, 104, 230, 28].map(function (w) { return '<col style="width:' + w + 'px">'; }).join('') + '</colgroup><thead>' +
      '<tr><th rowspan="2" class="c">N.°</th><th rowspan="2">Fecha</th><th rowspan="2">Glosa o descripción de la operación</th><th colspan="3">Referencia de la operación</th><th colspan="2">Cuenta contable asociada</th><th colspan="2">Movimiento</th><th rowspan="2">¿Por qué va aquí?<br><small>(sale en la pestaña «Explicación» del Excel)</small></th><th rowspan="2"></th></tr>' +
      '<tr><th>Cód. libro (Tabla 8)</th><th>N.° correlativo</th><th>Doc. sustentatorio</th><th>Código</th><th>Denominación</th><th class="n">Debe</th><th class="n">Haber</th></tr></thead>' +
      '<tbody>' + filas + '</tbody><tfoot><tr class="tt"><td colspan="8" class="r">Totales <span id="f5Cuadre"></span></td><td class="n" id="f5D"></td><td class="n" id="f5H"></td><td colspan="2"></td></tr></tfoot></table></div>' +
      '<div class="f5-bot"><button class="btn navy sm" id="f5AddA">+ Agregar asiento</button><span class="tiny">Escribe el código y elige la cuenta: la denominación se completa sola (puedes cambiarla). Se guarda solo.</span></div>';
    ['nombre', 'periodo', 'ruc', 'empresa'].forEach(function (k) { $('#f5' + k).value = l[k] || ''; });
    totales();
  }
  function totales() {
    var l = actual(); if (!l) return; var D = 0, H = 0;
    l.asientos.forEach(function (a, j) {
      var d = 0, h = 0; a.lineas.forEach(function (x) { d += x.debe; h += x.haber; }); D += d; H += h;
      var c = $('#f5c' + j); if (c) { var ok = Math.abs(d - h) < 0.005; c.className = 'cuad ' + (d || h ? (ok ? 'ok' : 'no') : ''); c.textContent = d || h ? (ok ? '✓ Cuadra: ' + fmt(d) : 'No cuadra: debe ' + fmt(d) + ' · haber ' + fmt(h)) : ''; }
    });
    $('#f5D').textContent = fmt(D); $('#f5H').textContent = fmt(H);
    $('#f5Cuadre').innerHTML = D || H ? (Math.abs(D - H) < 0.005 ? '<span class="cuadre si">cuadra</span>' : '<span class="cuadre no">no cuadra</span>') : '';
  }

  // ---------- edición
  box.addEventListener('input', function (e) {
    var t = e.target, tr = t.closest('tr[data-a]'), l = actual(); if (!tr || !l) return;
    var a = l.asientos[+tr.getAttribute('data-a')];
    if (t.hasAttribute('data-k')) { a[t.getAttribute('data-k')] = t.value; guardar(); return; }
    var x = a.lineas[+tr.getAttribute('data-l')], c = t.getAttribute('data-c'); if (!x) return;
    if (c === 'cuenta') {
      x.cuenta = t.value.trim(); var nm = CX.nombre(x.cuenta);
      t.classList.toggle('mal', !!x.cuenta && !nm && x.cuenta.length >= 2);
      if (nm && (x.auto || !x.detalle)) { x.detalle = nm; x.auto = true; tr.querySelector('[data-c="detalle"]').value = nm; }
    } else if (c === 'detalle') { x.detalle = t.value; x.auto = false; }
    else if (c === 'nota') { x.nota = t.value; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }
    else { x[c] = num(t.value); if (x[c]) { var o = c === 'debe' ? 'haber' : 'debe'; if (x[o]) { x[o] = 0; tr.querySelector('[data-c="' + o + '"]').value = ''; } } tr.querySelector('[data-c="detalle"]').classList.toggle('hab', !!x.haber && !x.debe); totales(); }
    guardar();
  });
  box.addEventListener('focusout', function (e) { var t = e.target; if (t.matches && t.matches('.n') && t.value) t.value = num(t.value) ? fmt(num(t.value)) : ''; });
  box.addEventListener('keydown', function (e) { // Enter en el haber/debe de la última línea → nueva línea
    var t = e.target; if (e.key !== 'Enter' || !t.matches || !t.matches('input.n')) return;
    var tr = t.closest('tr[data-a]'), l = actual(), j = +tr.getAttribute('data-a'), i = +tr.getAttribute('data-l');
    e.preventDefault(); if (i === l.asientos[j].lineas.length - 1) { l.asientos[j].lineas.push(lineaVacia()); guardar(); pintar(); }
    var sig = box.querySelector('tr[data-a="' + j + '"][data-l="' + (i + 1) + '"] .cta'); if (sig) sig.focus();
  });
  box.addEventListener('click', function (e) {
    var l = actual(), b;
    if ((b = e.target.closest('[data-add-l]'))) { var j = +b.getAttribute('data-add-l'); l.asientos[j].lineas.push(lineaVacia()); guardar(); pintar(); var f = box.querySelector('tr[data-a="' + j + '"][data-l="' + (l.asientos[j].lineas.length - 1) + '"] .cta'); if (f) f.focus(); return; }
    if ((b = e.target.closest('[data-del-l]'))) {
      var p = b.getAttribute('data-del-l').split(':'), A = l.asientos[+p[0]];
      if (A.lineas.length > 1) A.lineas.splice(+p[1], 1); else A.lineas[0] = lineaVacia();
      guardar(); pintar(); return;
    }
    if ((b = e.target.closest('[data-del-a]'))) {
      var k = +b.getAttribute('data-del-a');
      if (!confirm('¿Quitar el asiento ' + (k + 1) + ' con todas sus líneas?')) return;
      l.asientos.splice(k, 1); if (!l.asientos.length) l.asientos.push(asientoVacio()); guardar(); pintar(); return;
    }
    if (e.target.closest('#f5AddA')) {
      var ult = l.asientos[l.asientos.length - 1]; l.asientos.push(asientoVacio(ult && ult.fecha)); guardar(); pintar();
      var g = box.querySelector('tr[data-a="' + (l.asientos.length - 1) + '"] textarea'); if (g) { g.focus(); g.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    }
  });
  ['nombre', 'periodo', 'ruc', 'empresa'].forEach(function (k) {
    $('#f5' + k).addEventListener('input', function () { var l = actual(); if (!l) return; l[k] = this.value; guardar(); if (k === 'nombre') { var o = $('#f5Sel').selectedOptions[0]; if (o) o.textContent = this.value || 'Sin nombre'; } });
  });

  // ---------- libros
  $('#f5Sel').onchange = function () { actualId = this.value; try { localStorage.setItem(SELK, actualId); } catch (e) { } pintar(); };
  $('#f5Nuevo').onclick = function () { nuevoLibro(); pintar(); $('#f5nombre').select(); CX.toast('Libro nuevo creado'); };
  $('#f5Ren').onclick = function () { $('#f5nombre').focus(); $('#f5nombre').select(); };
  $('#f5Dup').onclick = function () { var l = actual(); if (!l) return; var c = JSON.parse(JSON.stringify(l)); delete c.id; c.nombre = (l.nombre || 'Libro') + ' (copia)'; nuevoLibro(c); pintar(); CX.toast('Copia creada'); };
  $('#f5Del').onclick = function () {
    var l = actual(); if (!l || !confirm('¿Eliminar «' + (l.nombre || 'Sin nombre') + '»? No se puede deshacer.')) return;
    S().f51borrados[l.id] = Date.now(); S().formatos = libros().filter(function (x) { return x.id !== l.id; });
    actualId = (libros()[0] || {}).id || ''; guardar(true); pintar();
  };
  $('#f5Ej').onchange = function () {
    var id = this.value; this.value = ''; if (!id) return;
    var d = CX.libroDe(id); if (!d || !d.asientos.length) { CX.toast('Ese ejercicio no tiene asientos todavía'); return; }
    nuevoLibro({
      nombre: d.nombre, empresa: d.empresa, ruc: d.ruc, periodo: d.periodo, enunciado: d.enunciado,
      asientos: d.asientos.map(function (a) { return { fecha: aISO(a.fecha) || a.fecha, glosa: a.glosa, libro: '', corr: '', doc: a.doc, expl: a.expl || '', lineas: a.lineas.map(function (x) { return { cuenta: x.cuenta, detalle: x.detalle, auto: false, debe: x.debe, haber: x.haber, nota: x.nota || '' }; }) }; })
    });
    pintar(); CX.toast('Copiado: ahora puedes editarlo');
  };

  // ---------- descargas
  function paraXLSX(l) {
    return {
      hoja: l.nombre || 'Libro diario', empresa: l.empresa, ruc: l.ruc, periodo: l.periodo, enunciado: l.enunciado || '', explicar: true,
      asientos: l.asientos.map(function (a) {
        var L = a.lineas.filter(function (x) { return x.cuenta || x.debe || x.haber; });
        return { fecha: aDMA(a.fecha), glosa: a.glosa, libro: a.libro, corr: a.corr, doc: a.doc, expl: a.expl || '', lineas: L.length ? L : [lineaVacia()] };
      })
    };
  }
  function nombreArchivo(l, ext) { return (l.nombre || 'libro-diario').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-formato-5.1.' + ext; }
  $('#f5Xls').onclick = function () { var l = actual(); if (l && window.LibroXLSX) { window.LibroXLSX([paraXLSX(l)], nombreArchivo(l, 'xlsx')); CX.toast('Excel descargado'); } };
  $('#f5Blanco').onclick = function () {
    var A = []; for (var i = 0; i < 25; i++) A.push({ num: '', fecha: '', glosa: '', lineas: [lineaVacia()] });
    window.LibroXLSX([{ hoja: 'Libro diario', empresa: '', ruc: '', periodo: '', asientos: A }], 'formato-5.1-libro-diario-en-blanco.xlsx');
  };
  $('#f5Pdf').onclick = function () {
    var l = actual(); if (!l) return;
    var D = 0, H = 0, rows = '';
    l.asientos.forEach(function (a, j) {
      var L = a.lineas.filter(function (x) { return x.cuenta || x.debe || x.haber; }); if (!L.length) return;
      L.forEach(function (x, i) {
        D += x.debe; H += x.haber;
        rows += '<tr' + (i === 0 ? ' class="ini"' : '') + '>' + (i === 0 ? '<td class="c" rowspan="' + L.length + '">' + (j + 1) + '</td><td class="c f" rowspan="' + L.length + '">' + esc(aDMA(a.fecha)) + '</td><td class="gl" rowspan="' + L.length + '">' + esc(a.glosa) + '</td><td class="c" rowspan="' + L.length + '">' + esc(a.libro) + '</td><td class="c" rowspan="' + L.length + '">' + esc(a.corr) + '</td><td rowspan="' + L.length + '">' + esc(a.doc) + '</td>' : '') +
          '<td class="cta"><b>' + esc(x.cuenta) + '</b></td><td' + (x.haber && !x.debe ? ' class="h"' : '') + '>' + esc(x.detalle) + '</td><td class="n">' + (x.debe ? fmt(x.debe) : '') + '</td><td class="n">' + (x.haber ? fmt(x.haber) : '') + '</td></tr>';
      });
    });
    var cab = [['Período', l.periodo], ['RUC', l.ruc], ['Razón social', l.empresa]].filter(function (x) { return x[1]; });
    $('#f5Print').innerHTML = '<section class="libro"><div class="lb-cab"><h3>Libro diario <small>Formato 5.1</small></h3>' + (cab.length ? '<dl>' + cab.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>' : '') + '</div>' +
      '<table class="diario f5p"><thead><tr><th class="c">N.°</th><th class="c">Fecha</th><th>Glosa</th><th class="c">Cód. libro</th><th class="c">Correl.</th><th>Doc. sustentatorio</th><th>Cuenta</th><th>Denominación</th><th class="n">Debe</th><th class="n">Haber</th></tr></thead><tbody>' + rows +
      '</tbody><tfoot><tr class="tt"><td colspan="8" class="r">Totales</td><td class="n">' + fmt(D) + '</td><td class="n">' + fmt(H) + '</td></tr></tfoot></table></section>';
    var t0 = document.title; document.title = nombreArchivo(l, 'pdf').replace(/\.pdf$/, '');
    document.body.classList.add('imp-f5');
    var fin = function () { document.body.classList.remove('imp-f5'); document.title = t0; window.removeEventListener('afterprint', fin); };
    window.addEventListener('afterprint', fin);
    CX.toast('En «Destino», elige «Guardar como PDF»');
    setTimeout(function () { window.print(); }, 60);
  };

  window.F51 = { pintar: pintar };
  if (!$('#v-formato').hidden) pintar(); // se abrió directo en #formato
})();
