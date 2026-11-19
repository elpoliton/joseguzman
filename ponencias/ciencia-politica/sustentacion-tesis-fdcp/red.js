/* red.js — diapositiva interactiva «Red de códigos».
   Con la diapositiva activa: «siguiente» / «anterior» (teclado o puntero) recorren las 6 redes;
   al llegar a la última, «siguiente» pasa a la diapositiva que sigue. Clic en un código: su explicación y un fragmento real.
   «Recorrido» muestra los códigos de la red, uno por uno. */
(function () {
  'use strict';
  var D = window.RED_CODIGOS; if (!D) return;
  var NS = 'http://www.w3.org/2000/svg';
  var ORDER = ['formal', 'informal', 'difusion', 'transparencia', 'efectividad', 'participacion'];
  var RC = { formal: 1, informal: 1, difusion: 1 };
  var COL = { rc: '#2A6F77', pe: '#C8553D' };
  function sub(id) { return D.subs.filter(function (s) { return s.id === id; })[0]; }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function wrap(t, max) { var w = t.split(' '), lines = [''], i; for (i = 0; i < w.length; i++) { var cand = (lines[lines.length - 1] + ' ' + w[i]).trim(); if (cand.length > max && lines[lines.length - 1]) lines.push(w[i]); else lines[lines.length - 1] = cand; } return lines; }

  function mount(root) {
    var step = 0, selCode = -1, tourT = null, tab = 'codigos';
    function avisar() { try { document.dispatchEvent(new CustomEvent('red:cambio')); } catch (e) { } }
    var stage = root.querySelector('svg.net'), panel = root.querySelector('.panel .in');
    var navBtns = root.querySelectorAll('.nav button');
    var chainLis = root.querySelectorAll('.chain li');

    function color(id) { return RC[id] ? COL.rc : COL.pe; }

    function draw(animate) {
      var s = sub(ORDER[step]), c = color(s.id), n = s.codigos.length;
      root.style.setProperty('--c', c);
      while (stage.firstChild) stage.removeChild(stage.firstChild);
      stage.classList.remove('focus');
      var W = 712, H = 520, cx = W / 2, cy = H / 2, rx = 262, ry = 198;
      var gE = el('g', {}, stage), gN = el('g', {}, stage);
      s.codigos.forEach(function (code, k) {
        var a = -Math.PI / 2 + (k * 2 * Math.PI / n) + (n % 2 ? 0 : Math.PI / n);
        var x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
        var mx = cx + (x - cx) * 0.5 + Math.sin(a) * 18, my = cy + (y - cy) * 0.5 - Math.cos(a) * 18;
        var p = el('path', { d: 'M' + cx + ',' + cy + ' Q' + mx + ',' + my + ' ' + x + ',' + y, 'class': 'edge', 'data-k': k }, gE);
        if (animate) { var L = p.getTotalLength ? p.getTotalLength() : 300; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.style.transition = 'stroke-dashoffset .6s ease ' + (0.08 * k) + 's, stroke .3s, opacity .3s'; requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = 0; }); }); }
        var lines = wrap(code.n, 21), bw = 186, bh = 22 + lines.length * 18;
        var g = el('g', { 'class': 'node', 'data-k': k, transform: 'translate(' + (x - bw / 2) + ',' + (y - bh / 2) + ')', tabindex: 0, role: 'button', 'aria-label': code.n }, gN);
        el('rect', { 'class': 'pulse', x: 0, y: 0, width: bw, height: bh, rx: 9 }, g);
        el('rect', { x: 0, y: 0, width: bw, height: bh, rx: 9 }, g);
        el('rect', { 'class': 'dia', x: 12, y: bh / 2 - 5, width: 10, height: 10, transform: 'rotate(45 17 ' + (bh / 2) + ')' }, g);
        lines.forEach(function (ln, j) { var t = el('text', { x: 32, y: 11 + 18 * (j + 1) - 3 }, g); t.textContent = ln; });
        if (animate) { g.style.opacity = 0; g.style.transition = 'opacity .35s ease ' + (0.25 + 0.08 * k) + 's'; requestAnimationFrame(function () { requestAnimationFrame(function () { g.style.opacity = ''; }); }); }
        g.addEventListener('click', function (e) { e.stopPropagation(); stopTour(); pick(k); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.stopPropagation(); e.preventDefault(); stopTour(); pick(k); } });
      });
      var hub = el('g', { 'class': 'hub' }, stage);
      el('circle', { 'class': 'halo', cx: cx, cy: cy, r: 92 }, hub);
      el('circle', { 'class': 'core', cx: cx, cy: cy, r: 74 }, hub);
      var t1 = el('text', { x: cx, y: cy - 8, 'font-size': 12, 'letter-spacing': 1.5, opacity: .85 }, hub); t1.textContent = 'SUBCATEGORÍA';
      var t2 = el('text', { x: cx, y: cy + 18, 'font-size': s.nombre.length > 12 ? 19 : 23, 'class': 'serif' }, hub); t2.textContent = s.nombre;
      hub.addEventListener('click', function () { stopTour(); pick(-1); });
      // cabecera, navegación y hallazgo
      root.querySelector('.ttl h2').textContent = 'Red «' + s.nombre + '»';
      var ob = root.querySelector('.ttl .obj'); ob.textContent = s.objetivo; ob.classList.toggle('rc', !!RC[s.id]);
      root.querySelector('.ttl .q').textContent = s.pregunta;
      root.querySelector('.hall small').textContent = 'Hallazgo de esta red · Figura ' + s.figura + ' de la tesis';
      root.querySelector('.hall p').textContent = s.hallazgo;
      Array.prototype.forEach.call(navBtns, function (b, k) { b.classList.toggle('on', k === step); });
      root.querySelector('.foot2 .pos').textContent = 'Red ' + (step + 1) + ' de 6';
      pick(-1, true);
    }

    function setPanel(html) { panel.classList.add('out'); setTimeout(function () { panel.innerHTML = html; panel.classList.remove('out'); bindPanel(); }, 160); }
    function bindPanel() {
      Array.prototype.forEach.call(panel.querySelectorAll('[data-k]'), function (li) { li.addEventListener('click', function () { stopTour(); pick(+li.getAttribute('data-k')); }); });
      Array.prototype.forEach.call(panel.querySelectorAll('[data-tab]'), function (b) { b.addEventListener('click', function () { tab = b.getAttribute('data-tab'); pick(-1); }); });
    }

    function pick(k, quiet) {
      var s = sub(ORDER[step]); selCode = k;
      Array.prototype.forEach.call(stage.querySelectorAll('.node'), function (g) { g.classList.toggle('sel', +g.getAttribute('data-k') === k); });
      Array.prototype.forEach.call(stage.querySelectorAll('.edge'), function (p) { p.classList.toggle('hot', +p.getAttribute('data-k') === k); });
      stage.classList.toggle('focus', k >= 0);
      Array.prototype.forEach.call(chainLis, function (li, j) { li.classList.toggle('hit', k >= 0 ? true : j >= 2); });
      var html;
      if (k < 0) {
        var tabs = '<div class="tabs2"><button type="button" data-tab="codigos"' + (tab === 'codigos' ? ' class="on"' : '') + '>Códigos</button><button type="button" data-tab="instrumento"' + (tab === 'instrumento' ? ' class="on"' : '') + '>Instrumento</button></div>';
        if (tab === 'instrumento') {
          var I = s.instrumento || { preguntas: [], ficha: [] };
          html = tabs + '<div class="lab">Cómo se recogió · ' + esc(s.nombre) + '</div><h3 class="serif">Guía de entrevista semiestructurada</h3>' +
            '<p class="ind">Indicador: <b>' + esc(I.indicador || '') + '</b></p>' +
            '<ol class="preg">' + I.preguntas.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' +
            (I.ficha && I.ficha.length ? '<div class="lab l2">Ficha de análisis documental</div><table class="ficha"><tr><th>Observable</th><th>Documento revisado</th></tr>' +
              I.ficha.map(function (f) { return '<tr><td>' + esc(f[0]) + '</td><td>' + esc(f[1]) + '</td></tr>'; }).join('') + '</table>'
              : '<p class="none">Esta subcategoría de la percepción se analizó con las entrevistas.</p>');
        } else {
          html = tabs + '<div class="lab">Cómo leer esta red</div><h3 class="serif">' + esc(s.codigos.length) + ' códigos alrededor de «' + esc(s.nombre) + '»</h3>' +
            '<p class="what">Cada recuadro es un <b>código</b>: agrupa respuestas que dicen algo parecido. Haz clic en uno para ver la pregunta, la respuesta y lo que muestra.</p>' +
            '<ul class="codes">' + s.codigos.map(function (c, j) { return '<li data-k="' + j + '">' + esc(c.n) + '<span>ver →</span></li>'; }).join('') + '</ul>';
        }
      } else {
        var c = s.codigos[k];
        html = '<div class="lab">Código ' + (k + 1) + ' de ' + s.codigos.length + ' · ' + esc(s.nombre) + '</div><h3 class="serif">' + esc(c.n) + '</h3>' +
          '<p class="what">' + esc(c.q) + '</p>' +
          (c.p ? '<div class="pq"><small>Pregunta de la entrevista</small>' + esc(c.p) + '</div>' : '') +
          (c.c ? '<blockquote><small>Respuesta</small>«' + esc(c.c) + '»<cite>Estudiante entrevistado · cita ' + esc(c.r) + ' en ATLAS.ti</cite></blockquote>'
               : '<p class="none">Código construido con varias citas (' + esc(c.r) + ' en ATLAS.ti); ver la figura ' + s.figura + ' de la tesis.</p>') +
          '<p class="read"><b>Qué muestra: </b>' + esc(c.l) + '</p>';
      }
      if (quiet) { panel.innerHTML = html; bindPanel(); } else setPanel(html);
      if (!quiet) avisar();
    }

    function go(n, animate, quiet) { step = (n + 6) % 6; stopTour(); draw(animate !== false); if (!quiet) avisar(); }
    function stopTour() { if (tourT) { clearInterval(tourT); tourT = null; } var b = root.querySelector('.tour'); if (b) { b.classList.remove('on'); b.textContent = '▶ Recorrido'; } }
    function startTour() {
      var b = root.querySelector('.tour'), s = sub(ORDER[step]), k = selCode;
      b.classList.add('on'); b.textContent = '❚❚ Detener';
      function nx() { k = k + 1; if (k >= s.codigos.length) { stopTour(); pick(-1); return; } pick(k); }
      nx(); tourT = setInterval(nx, 6500);
    }

    Array.prototype.forEach.call(navBtns, function (b, k) { b.addEventListener('click', function () { go(k); }); });
    root.querySelector('.tour').addEventListener('click', function () { if (tourT) stopTour(); else startTour(); });

    // teclado / puntero: con la diapositiva activa, «siguiente» y «anterior» recorren las redes
    var NEXT = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ' ': 1, Spacebar: 1, n: 1, N: 1 }, PREV = { ArrowLeft: 1, ArrowUp: 1, PageUp: 1, Backspace: 1, p: 1, P: 1 };
    var wasOn = false, lastDir = 1;
    window.addEventListener('keydown', function (e) {
      if (!root.classList.contains('on') || e.altKey || e.ctrlKey || e.metaKey || document.body.classList.contains('espejo')) return;
      if (document.querySelector('.help.on')) return;
      if (NEXT[e.key] && step < 5) { e.preventDefault(); e.stopImmediatePropagation(); go(step + 1); lastDir = 1; }
      else if (PREV[e.key] && step > 0) { e.preventDefault(); e.stopImmediatePropagation(); go(step - 1); lastDir = -1; }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); e.stopImmediatePropagation(); if (tourT) stopTour(); else startTour(); }
      else if (e.key === 'i' || e.key === 'I') { e.preventDefault(); e.stopImmediatePropagation(); stopTour(); tab = tab === 'instrumento' ? 'codigos' : 'instrumento'; pick(-1); }
    }, true);
    // al entrar a la diapositiva: desde la anterior empieza en la red 1; desde la siguiente, en la 6
    new MutationObserver(function () {
      var on = root.classList.contains('on');
      if (on && !wasOn) { go(window.__redDesde === 'prev' ? 5 : 0); }
      if (!on && wasOn) stopTour();
      wasOn = on;
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('keydown', function (e) { if (root.classList.contains('on')) return; window.__redDesde = PREV[e.key] ? 'prev' : 'next'; }, true);

    // estado para las pantallas espejo (espejo.js)
    window.REDSYNC = {
      get: function () { return { step: step, code: selCode, tab: tab }; },
      set: function (o) { if (!o) return; if (o.tab) tab = o.tab; if (o.step !== step) go(o.step, true, true); pick(typeof o.code === 'number' ? o.code : -1, true); }
    };
    // el celular (remoto.js) manda «siguiente/anterior» por DECK.cmd: aquí también recorren las redes
    document.addEventListener('deck:listo', function () {
      if (!window.DECK || document.body.classList.contains('espejo')) return;
      var c0 = window.DECK.cmd;
      window.DECK.cmd = function (c, n) {
        if (!root.classList.contains('on')) { if (c === 'prev') window.__redDesde = 'prev'; else if (c === 'next') window.__redDesde = 'next'; return c0(c, n); }
        if (c === 'next' && step < 5) return go(step + 1);
        if (c === 'prev' && step > 0) return go(step - 1);
        if (c === 'prev') window.__redDesde = 'prev';
        return c0(c, n);
      };
    });
    draw(false);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.slide.red'), mount);
})();
