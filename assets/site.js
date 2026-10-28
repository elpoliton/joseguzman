/* site.js — tarjetas de ponencias, buscador y filtros (página personal y biblioteca) */
(function () {
  'use strict';
  if (window.pintarIconos) window.pintarIconos();
  var P = (window.PONENCIAS || []).slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ICON = function (n) { return '<i class="ico">' + ((window.ICONOS || {})[n] || '') + '</i>'; };

  function card(p, base) {
    return '<article class="pc">' +
      '<div class="thumb">' + (p.portada ? '<img src="' + base + esc(p.portada) + '" alt="" loading="lazy">' : '') + '<span class="n">' + p.diapositivas + ' diapositivas' + (p.videos ? ' · ' + p.videos + ' videos' : '') + '</span></div>' +
      '<div class="info"><div class="crumb">' + esc(p.categoria) + ' · ' + esc(p.subcategoria) + '</div>' +
      '<h3>' + esc(p.titulo) + '</h3>' + (p.subtitulo ? '<div class="sub">' + esc(p.subtitulo) + '</div>' : '') +
      '<p>' + esc(p.resumen) + '</p>' +
      '<div class="meta"><span>' + ICON('FaCalendarAlt') + ' ' + esc(p.fechaTexto) + '</span>' + (p.lugar ? '<span>' + ICON('FaLandmark') + ' ' + esc(p.lugar) + '</span>' : '') + '</div>' +
      '<div class="tags">' + (p.etiquetas || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="btns"><a class="btn navy" href="' + base + esc(p.ruta) + '">' + ICON('FaPlay') + ' Presentar</a>' +
      (p.pdf ? '<a class="btn line" href="' + base + esc(p.pdf) + '" download>' + ICON('FaFilePdf') + ' PDF</a>' : '') + '</div>' +
      '</div></article>';
  }

  // página personal: últimas ponencias
  var latest = document.getElementById('ultimas');
  if (latest) latest.innerHTML = P.slice(0, 3).map(function (p) { return card(p, latest.getAttribute('data-base') || 'ponencias/'); }).join('') || '<div class="empty">Pronto.</div>';

  // biblioteca
  var lib = document.getElementById('biblioteca');
  if (!lib) return;
  var base = lib.getAttribute('data-base') || './';
  var q = document.getElementById('q'), fc = document.getElementById('fcat'), fs = document.getElementById('fsub');
  var state = { cat: '', sub: '' };
  var cats = []; P.forEach(function (p) { if (cats.indexOf(p.categoria) < 0) cats.push(p.categoria); });
  function subsOf(c) { var s = []; P.forEach(function (p) { if ((!c || p.categoria === c) && s.indexOf(p.subcategoria) < 0) s.push(p.subcategoria); }); return s; }
  function pills(el, items, cur, key) {
    el.innerHTML = ['<button type="button" data-v="" aria-pressed="' + (!cur) + '">Todas</button>'].concat(items.map(function (v) { return '<button type="button" data-v="' + esc(v) + '" aria-pressed="' + (cur === v) + '">' + esc(v) + '</button>'; })).join('');
    el.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; state[key] = b.getAttribute('data-v'); if (key === 'cat') state.sub = ''; save(); render(); };
  }
  function save() { var h = []; if (state.cat) h.push('c=' + encodeURIComponent(state.cat)); if (state.sub) h.push('s=' + encodeURIComponent(state.sub)); if (q.value) h.push('q=' + encodeURIComponent(q.value)); try { history.replaceState(null, '', h.length ? '#' + h.join('&') : location.pathname); } catch (e) { } }
  function load() { (location.hash.slice(1) || '').split('&').forEach(function (kv) { var p = kv.split('='); var v = decodeURIComponent(p[1] || ''); if (p[0] === 'c') state.cat = v; if (p[0] === 's') state.sub = v; if (p[0] === 'q') q.value = v; }); }
  function render() {
    pills(fc, cats, state.cat, 'cat'); pills(fs, subsOf(state.cat), state.sub, 'sub');
    var words = norm(q.value).split(/\s+/).filter(Boolean);
    var rows = P.filter(function (p) {
      if (state.cat && p.categoria !== state.cat) return false;
      if (state.sub && p.subcategoria !== state.sub) return false;
      var hay = norm([p.titulo, p.subtitulo, p.resumen, p.categoria, p.subcategoria, p.lugar, p.fechaTexto].concat(p.etiquetas || []).join(' '));
      return words.every(function (w) { return hay.indexOf(w) >= 0; });
    });
    if (!rows.length) { lib.innerHTML = '<div class="empty">No encontré ponencias con esos filtros.</div>'; return; }
    var html = '', groups = {};
    rows.forEach(function (p) { (groups[p.categoria] = groups[p.categoria] || {}); (groups[p.categoria][p.subcategoria] = groups[p.categoria][p.subcategoria] || []).push(p); });
    Object.keys(groups).forEach(function (c) {
      html += '<h2 class="cat">' + esc(c) + '</h2>';
      Object.keys(groups[c]).forEach(function (s) { html += '<h3 class="subcat">' + esc(s) + '</h3><div class="list">' + groups[c][s].map(function (p) { return card(p, base); }).join('') + '</div>'; });
    });
    lib.innerHTML = html;
  }
  load();
  q.addEventListener('input', function () { save(); render(); });
  document.addEventListener('keydown', function (e) { if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); } });
  render();
})();
