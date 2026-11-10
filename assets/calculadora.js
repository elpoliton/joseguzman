/* calculadora.js — calculadora flotante con atajos del IGV (sin dependencias).
   En /contabilidad/ puede enviar el resultado al debe o al haber de la última línea tocada. */
(function () {
  'use strict';
  var IGV = 0.18;
  var fmt = function (n) { return (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var r2 = function (n) { return Math.round((n + Number.EPSILON) * 100) / 100; };

  // evaluador seguro (sin eval): + − × ÷ ( ) y números
  function evaluar(txt) {
    var s = String(txt || '').replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/[\s,]/g, '');
    if (!s) return NaN;
    var i = 0;
    function expr() { var v = term(); while (s[i] === '+' || s[i] === '-') { var o = s[i++], w = term(); v = o === '+' ? v + w : v - w; } return v; }
    function term() { var v = fact(); while (s[i] === '*' || s[i] === '/') { var o = s[i++], w = fact(); v = o === '*' ? v * w : v / w; } return v; }
    function fact() {
      if (s[i] === '-') { i++; return -fact(); }
      if (s[i] === '+') { i++; return fact(); }
      if (s[i] === '(') { i++; var v = expr(); if (s[i] !== ')') return NaN; i++; return v; }
      var m = /^\d*\.?\d+|^\d+\.?/.exec(s.slice(i)); if (!m) return NaN; i += m[0].length; return parseFloat(m[0]);
    }
    var r = expr(); return i === s.length && isFinite(r) ? r : NaN;
  }

  var fab = document.createElement('button');
  fab.className = 'calc-fab noprint'; fab.type = 'button'; fab.id = 'calcFab'; fab.setAttribute('aria-label', 'Calculadora'); fab.setAttribute('aria-expanded', 'false'); fab.title = 'Calculadora (IGV y porcentajes)'; fab.textContent = '🧮';
  var tecla = function (t, cl, extra) { return '<button type="button" class="k ' + (cl || '') + '" ' + (extra || '') + '>' + t + '</button>'; };
  var panel = document.createElement('div');
  panel.className = 'calc noprint'; panel.id = 'calcPanel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Calculadora');
  panel.innerHTML =
    '<div class="calc-h"><b>Calculadora</b><button type="button" id="calcX" aria-label="Cerrar calculadora">×</button></div>' +
    '<input id="calcIn" autocomplete="off" spellcheck="false" inputmode="decimal" placeholder="0" aria-label="Operación">' +
    '<div class="calc-out" id="calcOut" aria-live="polite"></div>' +
    '<h4>IGV 18 %</h4><div class="calc-g c2">' +
    tecla('+ IGV<small>base → total (×1.18)</small>', 'ig', 'data-a="mas"') + tecla('Quitar IGV<small>total → base (÷1.18)</small>', 'ig', 'data-a="base"') +
    tecla('IGV de la base<small>base × 0.18</small>', 'ig', 'data-a="igvb"') + tecla('IGV del total<small>total × 18/118</small>', 'ig', 'data-a="igvt"') + '</div>' +
    '<h4>Porcentaje del valor</h4><div class="calc-g c5">' +
    ['1.5', '3', '10', '12', '29.5'].map(function (p) { return tecla(p + '%', 'pct', 'data-p="' + p + '" title="' + p + ' % del valor actual"'); }).join('') + '</div>' +
    '<h4>Teclado</h4><div class="calc-g c4">' +
    tecla('C', 'op', 'data-k="C"') + tecla('⌫', 'op', 'data-k="B" aria-label="Borrar"') + tecla('(', 'op', 'data-k="("') + tecla(')', 'op', 'data-k=")"') +
    tecla('7', '', 'data-k="7"') + tecla('8', '', 'data-k="8"') + tecla('9', '', 'data-k="9"') + tecla('÷', 'op', 'data-k="÷"') +
    tecla('4', '', 'data-k="4"') + tecla('5', '', 'data-k="5"') + tecla('6', '', 'data-k="6"') + tecla('×', 'op', 'data-k="×"') +
    tecla('1', '', 'data-k="1"') + tecla('2', '', 'data-k="2"') + tecla('3', '', 'data-k="3"') + tecla('−', 'op', 'data-k="−"') +
    tecla('0', '', 'data-k="0"') + tecla('.', '', 'data-k="."') + tecla('=', 'eq', 'data-k="="') + tecla('+', 'op', 'data-k="+"') + '</div>' +
    '<div class="calc-g c3" style="margin-top:10px" id="calcAcc">' +
    tecla('Copiar', '', 'data-a="copiar"') + tecla('→ Debe', 'go', 'data-a="debe"') + tecla('→ Haber', 'go', 'data-a="haber"') + '</div>';
  document.body.appendChild(fab); document.body.appendChild(panel);

  var inp = panel.querySelector('#calcIn'), out = panel.querySelector('#calcOut'), filas = document.getElementById('filas'), ultima = null;
  if (!filas) panel.querySelector('#calcAcc').className = 'calc-g c2'; // sin asiento no hay a dónde enviar
  if (!filas) [].forEach.call(panel.querySelectorAll('[data-a="debe"],[data-a="haber"]'), function (b) { b.remove(); });
  if (window.matchMedia && matchMedia('(pointer: coarse)').matches) inp.setAttribute('inputmode', 'none'); // en celular se usa el teclado de la calculadora

  function valor() { return evaluar(inp.value); }
  function vista() { var v = valor(); out.innerHTML = inp.value.trim() && !isNaN(v) && /[+\-×÷*/−(]/.test(inp.value.replace(/^-/, '')) ? '= <b>' + fmt(v) + '</b>' : ''; }
  function poner(n) { inp.value = String(r2(n)); vista(); inp.focus(); }
  function aviso(m) { out.innerHTML = m; }

  function abrir(si) {
    panel.hidden = !si; fab.setAttribute('aria-expanded', String(si));
    if (si) { inp.focus({ preventScroll: true }); inp.select(); }
  }
  fab.onclick = function () { abrir(panel.hidden); };
  panel.querySelector('#calcX').onclick = function () { abrir(false); fab.focus(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden && panel.contains(document.activeElement)) { abrir(false); fab.focus(); } });

  inp.addEventListener('input', function () { inp.value = inp.value.replace(/[^\d.+\-*/×÷−()\s,]/g, ''); vista(); });
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); igual(); } });
  function igual() { var v = valor(); if (isNaN(v)) { aviso('Revisa la operación'); return false; } poner(v); return true; }

  // última línea del asiento donde estuvo el cursor
  if (filas) filas.addEventListener('focusin', function (e) { var tr = e.target.closest('tr'); if (tr) ultima = tr; });
  function enviar(lado) {
    var v = valor(); if (isNaN(v) || v <= 0) { aviso('Calcula primero un monto mayor que 0'); return; }
    if (!ultima || !document.body.contains(ultima)) { aviso('Toca primero una línea del asiento'); return; }
    var c = ultima.querySelector('.' + lado + '-in'); if (!c) return;
    c.value = fmt(v);
    c.dispatchEvent(new Event('input', { bubbles: true }));
    c.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    aviso('Enviado al ' + lado + ': <b>' + fmt(v) + '</b>');
  }

  panel.addEventListener('click', function (e) {
    var b = e.target.closest('button.k'); if (!b) return;
    var k = b.getAttribute('data-k'), a = b.getAttribute('data-a'), p = b.getAttribute('data-p');
    if (k) {
      if (k === 'C') { inp.value = ''; vista(); inp.focus(); return; }
      if (k === 'B') { inp.value = inp.value.slice(0, -1); vista(); inp.focus(); return; }
      if (k === '=') { igual(); return; }
      inp.value += k; vista(); inp.focus(); return;
    }
    var v = valor();
    if (p) { if (isNaN(v)) { aviso('Escribe primero un monto'); return; } poner(v * parseFloat(p) / 100); return; }
    if (a === 'copiar') { var t = isNaN(v) ? '' : String(r2(v)); if (!t) { aviso('No hay nada que copiar'); return; } (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { aviso('Copiado: <b>' + fmt(v) + '</b>'); }, function () { inp.select(); aviso('Selecciona y copia (Ctrl+C)'); }); return; }
    if (a === 'debe' || a === 'haber') { enviar(a); return; }
    if (isNaN(v)) { aviso('Escribe primero un monto'); return; }
    if (a === 'mas') poner(v * (1 + IGV));
    else if (a === 'base') poner(v / (1 + IGV));
    else if (a === 'igvb') poner(v * IGV);
    else if (a === 'igvt') poner(v - v / (1 + IGV));
  });
})();
