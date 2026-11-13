/* curso.js — /contabilidad/curso/: ruta del curso, evaluaciones, casos resueltos, proyecto modelo, cuestionarios y materiales.
   Los datos vienen de assets/curso-datos.js (generado por tools/curso_datos.py). El avance se guarda en este navegador. */
(function () {
  'use strict';
  var C = window.CURSO; if (!C) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (n) { return (Math.round(n * 100) / 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var KEY = 'jg-curso-v1';
  var S = (function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  S.quiz = S.quiz || {}; S.fallos = S.fallos || {}; S.check = S.check || {}; S.rub = S.rub || {}; S.notas = S.notas || {};
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

  // nombres de cuentas (PCGE 2019 + elementos 9 y 0)
  var MAP = {};
  try { window.PCGE['2019'].cuentas.forEach(function (x) { MAP[x[0]] = x[1]; }); } catch (e) { }
  Object.keys(C.nombres || {}).forEach(function (k) { MAP[k] = C.nombres[k]; });
  function nom(c) { var n = MAP[c] || ''; return n === n.toUpperCase() ? n.charAt(0) + n.slice(1).toLowerCase() : n; }

  // ---------------------------------------------------------------- pestañas
  var VISTAS = ['ruta', 'evaluaciones', 'casos', 'proyecto', 'cuestionarios', 'materiales'], hechas = {};
  var PINTA = { ruta: pintarRuta, evaluaciones: pintarEvals, casos: pintarCasos, proyecto: pintarProyecto, cuestionarios: pintarQuizHome, materiales: pintarMateriales };
  function vista(v, extra) {
    if (VISTAS.indexOf(v) < 0) v = 'ruta';
    $$('#tabs [data-v]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-v') === v)); });
    VISTAS.forEach(function (x) { $('#v-' + x).hidden = x !== v; });
    if (!hechas[v] || v === 'ruta' || v === 'cuestionarios') { PINTA[v](extra); hechas[v] = 1; if (window.pintarIconos) pintarIconos($('#v-' + v)); }
    try { history.replaceState(null, '', '#' + v + (extra ? '-' + extra : '')); } catch (e) { }
  }
  $('#tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-v]'); if (b) { vista(b.getAttribute('data-v')); window.scrollTo({ top: 0 }); } });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ir]'); if (!a) return;
    e.preventDefault(); var p = a.getAttribute('data-ir').split(':');
    if (p[0] === 'casos') { filtroSem = +p[1] || 0; hechas.casos = 0; }
    vista(p[0], p[0] === 'cuestionarios' ? p[1] : null); window.scrollTo({ top: 0 });
  });

  // ---------------------------------------------------------------- asiento
  function asiento(a, n) {
    var d = 0, h = 0;
    var filas = a.lineas.map(function (l) {
      d += l[1]; h += l[2];
      return '<tr><td class="c">' + esc(l[0]) + '</td><td class="' + (l[2] ? 'hab' : '') + '">' + esc(nom(l[0])) + '</td><td class="n">' + (l[1] ? fmt(l[1]) : '') + '</td><td class="n">' + (l[2] ? fmt(l[2]) : '') + '</td></tr>';
    }).join('');
    return '<div class="as"><div class="as-h"><span class="as-n">' + (n ? 'Asiento ' + n : '') + '</span><span class="as-f">' + esc(a.fecha) + '</span></div>' +
      '<div class="tbl-wrap"><table class="as-t"><thead><tr><th>Cuenta</th><th>Denominación</th><th class="n">Debe</th><th class="n">Haber</th></tr></thead><tbody>' + filas +
      '</tbody><tfoot><tr><td></td><td class="gl">' + esc(a.glosa) + '</td><td class="n">' + fmt(d) + '</td><td class="n">' + fmt(h) + '</td></tr></tfoot></table></div>' +
      (a.nota ? '<p class="as-nota">' + esc(a.nota) + '</p>' : '') + '</div>';
  }

  // ---------------------------------------------------------------- RUTA
  function mejor(sem) { var q = S.quiz[sem]; return q ? q.best : null; }
  function pintarRuta() {
    var w = C.semanas.map(function (s) {
      var b = mejor(s.n), nCasos = C.casos.filter(function (c) { return c.sem === s.n; }).length;
      return '<article class="sem"><div class="sem-n">S' + s.n + '</div><div class="sem-b">' +
        '<h3>' + esc(s.titulo) + '</h3><p class="logro">' + esc(s.logro) + '</p>' +
        '<details><summary>Ideas clave (' + s.ideas.length + ')</summary><ul>' + s.ideas.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></details>' +
        '<p class="avance"><b>Proyecto:</b> ' + esc(s.avance) + '</p>' +
        '<div class="sem-a">' + (nCasos ? '<a href="#" class="chip" data-ir="casos:' + s.n + '">' + nCasos + ' caso' + (nCasos > 1 ? 's' : '') + ' resuelto' + (nCasos > 1 ? 's' : '') + '</a>' : '') +
        '<a href="#" class="chip q" data-ir="cuestionarios:' + s.n + '">Cuestionario' + (b != null ? ' · mejor ' + b + '/' + porSem(s.n).length : '') + '</a></div>' +
        '</div></article>';
    }).join('');
    $('#v-ruta').innerHTML =
      '<div class="ruta-grid"><div class="sems">' + w + '</div><aside class="side">' + calcHTML() +
      '<div class="box"><h3>Datos del curso</h3><dl class="dl"><dt>Institución</dt><dd>' + esc(C.institucion) + '</dd><dt>Ciclo</dt><dd>' + esc(C.ciclo) + ' · ' + C.creditos + ' créditos · ' + C.horas + ' h</dd>' +
      '<dt>Aprobación</dt><dd>Nota mínima ' + C.notaMin + ' · asistencia obligatoria (máx. 30 % de faltas)</dd><dt>Método</dt><dd>Aprendizaje basado en proyectos: una empresa comercial simulada, en equipo.</dd></dl></div></aside></div>';
    calcIniciar();
  }

  // calculadora de nota: CF = E1·0.25 + E2·0.35 + E3·0.40, con E3 = AA3·0.70 + PA·0.30
  var PESOS = { e1: 0.25, e2: 0.35, aa3: 0.28, pa: 0.12 };
  function calcHTML() {
    var campo = function (k, t, s) { return '<label class="nf"><span>' + t + '<small>' + s + '</small></span><input class="in" type="number" min="0" max="20" step="0.5" id="n-' + k + '" value="' + (S.notas[k] != null ? S.notas[k] : '') + '" inputmode="decimal"></label>'; };
    return '<div class="box calc"><h3><i data-icon="FaCalculator"></i> Mi nota</h3>' +
      campo('e1', 'AA1', '25 %') + campo('e2', 'AA2', '35 %') + campo('aa3', 'AA3 informe', '70 % de E3') + campo('pa', 'Participación', '30 % de E3') +
      '<div class="res" id="nRes"></div><p class="tiny">CF = E1×0.25 + E2×0.35 + E3×0.40 · E3 = AA3×0.70 + PA×0.30</p></div>';
  }
  function calcIniciar() {
    var calc = function () {
      var hay = 0, falta = 0, suma = 0;
      Object.keys(PESOS).forEach(function (k) {
        var v = $('#n-' + k).value.trim(); S.notas[k] = v === '' ? null : Math.max(0, Math.min(20, +v));
        if (v === '') falta += PESOS[k]; else { hay += PESOS[k]; suma += S.notas[k] * PESOS[k]; }
      });
      guardar();
      var r = $('#nRes');
      if (!hay) { r.innerHTML = 'Escribe tus notas cuando las tengas.'; return; }
      if (!falta) { var cf = Math.round(suma * 100) / 100; r.innerHTML = 'Nota final: <b class="' + (cf >= C.notaMin ? 'ok' : 'mal') + '">' + cf.toFixed(2) + '</b> ' + (cf >= C.notaMin ? '✓ aprobado' : '— no alcanza ' + C.notaMin); return; }
      var nec = (C.notaMin - suma) / falta;
      r.innerHTML = 'Llevas <b>' + suma.toFixed(2) + '</b> puntos de nota final. ' + (nec <= 0 ? '<b class="ok">Ya aprobaste.</b>' : nec > 20 ? '<b class="mal">Aunque saques 20 en lo que falta no llegas a ' + C.notaMin + '.</b>' : 'En lo que falta necesitas en promedio <b>' + nec.toFixed(1) + '</b> para llegar a ' + C.notaMin + '.');
    };
    $$('.calc input').forEach(function (i) { i.addEventListener('input', calc); }); calc();
  }

  // ---------------------------------------------------------------- EVALUACIONES
  function pintarEvals() {
    $('#v-evaluaciones').innerHTML = '<p class="intro">Cada rúbrica tiene 5 criterios de 1 a 4 puntos (inicio, en proceso, logrado, sobresaliente) que suman 20. Aquí está lo que piden y qué hacer para sacar 4 en cada criterio. Marca lo que ya tienes y autoevalúate antes de entregar.</p>' +
      C.evals.map(function (ev) {
        var ck = S.check[ev.id] || {}, rb = S.rub[ev.id] || {};
        return '<article class="ev" data-ev="' + ev.id + '"><div class="ev-h"><h3>' + esc(ev.nombre) + '</h3><span class="tag">Semana ' + ev.semana + '</span><span class="tag gold">' + esc(ev.peso) + '</span></div>' +
          '<p class="ev-e"><b>Entrega:</b> ' + esc(ev.entrega) + '</p>' +
          '<h4>Lo que debe incluir</h4><ul class="chk">' + ev.incluir.map(function (x, i) { return '<li><label><input type="checkbox" data-ck="' + i + '"' + (ck[i] ? ' checked' : '') + '> ' + esc(x) + '</label></li>'; }).join('') + '</ul>' +
          '<h4>' + (ev.id === 'formativa' ? 'Lista de cotejo: cómo cumplir cada criterio' : 'Rúbrica: cómo sacar 4 puntos') + '</h4><ol class="rub">' + ev.criterios.map(function (c, i) {
            return '<li><div class="rub-c"><b>' + esc(c.c) + '</b><p>' + esc(c.top) + '</p></div><label class="rub-s"><span>Me pongo</span><select data-rb="' + i + '"><option value="">–</option>' +
              (ev.id === 'formativa' ? [['1', 'Cumple'], ['0', 'No cumple']] : [[4, 4], [3, 3], [2, 2], [1, 1]]).map(function (p) { return '<option value="' + p[0] + '"' + (rb[i] != null && String(rb[i]) === String(p[0]) ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') + '</select></label></li>';
          }).join('') + '</ol><p class="rub-t">Autoevaluación: <b data-tot></b></p>' +
          (ev.id !== 'formativa' ? '<p class="tiny"><a href="#" data-ir="proyecto">Mira el proyecto modelo</a> para ver un ejemplo de cada parte.</p>' : '') + '</article>';
      }).join('');
    $$('#v-evaluaciones .ev').forEach(function (art) {
      var id = art.getAttribute('data-ev');
      var nc = C.evals.filter(function (x) { return x.id === id; })[0].criterios.length;
      var tot = function () { var rb = S.rub[id] || {}, s = 0, n = 0; Object.keys(rb).forEach(function (k) { if (rb[k] != null) { s += +rb[k]; n++; } });
        $('[data-tot]', art).textContent = !n ? 'elige una opción por criterio' : id === 'formativa' ? s + ' de ' + nc + ' criterios cumplidos' : s + ' / 20' + (n < nc ? ' (faltan ' + (nc - n) + ' criterios)' : ''); };
      art.addEventListener('change', function (e) {
        var t = e.target;
        if (t.hasAttribute('data-ck')) { S.check[id] = S.check[id] || {}; S.check[id][t.getAttribute('data-ck')] = t.checked; }
        if (t.hasAttribute('data-rb')) { S.rub[id] = S.rub[id] || {}; S.rub[id][t.getAttribute('data-rb')] = t.value === '' ? null : +t.value; tot(); }
        guardar();
      });
      tot();
    });
  }

  // ---------------------------------------------------------------- CASOS
  var filtroSem = 0;
  function pintarCasos() {
    var sems = []; C.casos.forEach(function (c) { if (sems.indexOf(c.sem) < 0) sems.push(c.sem); });
    var lista = C.casos.filter(function (c) { return !filtroSem || c.sem === filtroSem; });
    $('#v-casos').innerHTML = '<p class="intro">Los «Resuelve el caso» de las PPT. Intenta primero y luego abre la solución. Los que tienen <b>Practicar</b> se pueden resolver con verificación automática.</p>' +
      '<div class="filtro"><button class="chip' + (!filtroSem ? ' on' : '') + '" data-f="0">Todas</button>' + sems.map(function (s) { return '<button class="chip' + (filtroSem === s ? ' on' : '') + '" data-f="' + s + '">Semana ' + s + '</button>'; }).join('') + '</div>' +
      lista.map(function (c) {
        var practica = c.asientos && c.asientos.some(function (a) { return !a.lineas.some(function (l) { return /^[09]/.test(l[0]); }); });
        var idP = 'curso-' + c.id + (c.asientos && c.asientos.length > 1 ? '-1' : '');
        var sol = c.tabla ? '<div class="tbl-wrap"><table class="as-t"><thead><tr><th>Código</th><th>Nombre</th><th>Respuesta</th></tr></thead><tbody>' +
            c.tabla.map(function (r) { return '<tr><td class="c">' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') + '</tbody></table></div>'
          : c.asientos.map(function (a, i) { return asiento(a, i + 1); }).join('');
        return '<article class="caso" id="caso-' + c.id + '"><div class="caso-h"><span class="tag">S' + c.sem + '</span><h3>' + esc(c.titulo) + '</h3></div>' +
          '<p class="enun">' + esc(c.enunciado) + '</p>' +
          '<div class="caso-a"><button class="btn navy sm-b" data-sol>Ver solución</button>' + (practica ? '<a class="btn line sm-b" href="../#' + idP + '">Practicar con verificación</a>' : '') + '</div>' +
          '<div class="sol" hidden>' + sol + '<p class="why">' + esc(c.explicacion) + '</p></div></article>';
      }).join('') +
      '<p class="tiny">Falta el caso «Comercial del Ande SAC» de la semana 8: necesita el Excel con el balance de comprobación que el profesor adjunta. Cuando lo tengas, se puede agregar.</p>';
    $('#v-casos').onclick = function (e) {
      var f = e.target.closest('[data-f]'); if (f) { filtroSem = +f.getAttribute('data-f'); pintarCasos(); return; }
      var b = e.target.closest('[data-sol]'); if (b) { var s = b.closest('.caso').querySelector('.sol'); s.hidden = !s.hidden; b.textContent = s.hidden ? 'Ver solución' : 'Ocultar solución'; }
    };
  }

  // ---------------------------------------------------------------- PROYECTO
  function pintarProyecto() {
    var P = C.proyecto, n = 0;
    var tabla = function (filas, tot) {
      return '<table class="ef"><tbody>' + filas.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td class="n">' + fmt(r[1]) + '</td></tr>'; }).join('') +
        (tot ? '<tr class="t"><td>' + esc(tot) + '</td><td class="n">' + fmt(filas.reduce(function (s, r) { return s + r[1]; }, 0)) + '</td></tr>' : '') + '</tbody></table>';
    };
    var sum = function (k) { return P.esf[k].reduce(function (s, r) { return s + r[1]; }, 0); };
    var TA = sum('activo_c') + sum('activo_nc'), TP = sum('pasivo_c') + sum('pasivo_nc'), TPat = sum('patrimonio');
    $('#v-proyecto').innerHTML =
      '<div class="aviso"><b>Es un ejemplo de referencia con una empresa ficticia.</b> Sirve para ver cómo se ve cada parte del proyecto, de la AA1 a la AA3. Tu equipo debe usar su propia empresa, sus propios montos y su redacción.</div>' +
      '<div class="pr-top"><div class="box"><h3>Ficha de la empresa</h3><dl class="dl">' + P.ficha.map(function (f) { return '<dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd>'; }).join('') + '</dl></div>' +
      '<div class="box dl-x"><h3>Excel del proyecto</h3><p>Libro diario en formato 5.1, balance de comprobación y estados financieros, todo con fórmulas: si cambias un monto, se recalcula.</p><a class="btn gold" href="' + P.excel + '" download><i data-icon="FaDownload"></i> Descargar ' + esc(P.excel) + '</a></div></div>' +
      P.etapas.map(function (e) {
        return '<details class="etapa"' + (e.etapa === 'AA1' ? ' open' : '') + '><summary><span class="tag gold">' + e.etapa + '</span> ' + esc(e.titulo) + ' <small>' + e.asientos.length + ' asientos</small></summary>' +
          (e.etapa === 'AA3' ? '<h4>Distribución de gastos al elemento 9</h4><div class="tbl-wrap"><table class="as-t"><thead><tr><th>Gasto</th><th class="n">94 Administración</th><th class="n">95 Ventas</th><th class="n">97 Financieros</th></tr></thead><tbody>' +
            P.destino.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td class="n">' + fmt(r[1]) + '</td><td class="n">' + fmt(r[2]) + '</td><td class="n">' + fmt(r[3]) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '') +
          e.asientos.map(function (a) { n++; return asiento(a, n); }).join('') + '</details>';
      }).join('') +
      '<h3 class="h-ef">Estados financieros</h3><div class="efs"><div class="box"><h4>Estado de Situación Financiera al 28/02/2026</h4>' +
      '<p class="ef-s">Activo corriente</p>' + tabla(P.esf.activo_c, 'Total activo corriente') +
      '<p class="ef-s">Activo no corriente</p>' + tabla(P.esf.activo_nc, 'Total activo no corriente') +
      '<p class="ef-T">TOTAL ACTIVO <b>' + fmt(TA) + '</b></p>' +
      '<p class="ef-s">Pasivo corriente</p>' + tabla(P.esf.pasivo_c, 'Total pasivo corriente') +
      '<p class="ef-s">Pasivo no corriente</p>' + tabla(P.esf.pasivo_nc, 'Total pasivo no corriente') +
      '<p class="ef-s">Patrimonio</p>' + tabla(P.esf.patrimonio, 'Total patrimonio') +
      '<p class="ef-T">TOTAL PASIVO Y PATRIMONIO <b>' + fmt(TP + TPat) + '</b></p>' +
      '<p class="tiny">Cuentas de orden (nota): mercadería recibida en consignación S/ 15,000.00. No suma en el balance.</p></div>' +
      '<div class="box"><h4>Estado de Resultados (por función)</h4><table class="ef"><tbody>' + P.er.map(function (r) { var t = !/^\(/.test(r[0]); return '<tr' + (t ? ' class="t"' : '') + '><td>' + esc(r[0]) + '</td><td class="n">' + fmt(r[1]) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<p class="tiny">La utilidad neta (3,257.10) es la misma que pasa a la 59 Resultados acumulados: así se comprueba que el cierre está bien.</p></div></div>';
  }

  // ---------------------------------------------------------------- CUESTIONARIOS
  function porSem(s) { return C.preguntas.map(function (p, i) { p.i = i; return p; }).filter(function (p) { return !s || p.sem === s; }); }
  function barajar(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var Q = null;
  function pintarQuizHome(extra) {
    if (extra) return iniciarQuiz(extra);
    var nFallos = Object.keys(S.fallos).length;
    $('#v-cuestionarios').innerHTML = '<p class="intro">Ocho preguntas por semana, con la explicación de cada respuesta. Tu mejor puntaje queda guardado en este navegador. Repite hasta que te salgan todas bien.</p>' +
      '<div class="qgrid">' + C.semanas.map(function (s) {
        var q = S.quiz[s.n], tot = porSem(s.n).length;
        return '<button class="qcard' + (q && q.best === tot ? ' full' : '') + '" data-q="' + s.n + '"><span class="qn">S' + s.n + '</span><b>' + esc(s.titulo) + '</b><small>' + (q ? 'Mejor: ' + q.best + '/' + tot + ' · ' + q.veces + ' intento' + (q.veces > 1 ? 's' : '') : tot + ' preguntas') + '</small></button>';
      }).join('') +
      '<button class="qcard mix" data-q="mix"><span class="qn">★</span><b>Examen mixto</b><small>20 preguntas al azar de todo el curso' + (S.quiz.mix ? ' · mejor ' + S.quiz.mix.best + '/20' : '') + '</small></button>' +
      '<button class="qcard err" data-q="err"' + (nFallos ? '' : ' disabled') + '><span class="qn">↺</span><b>Repasar mis errores</b><small>' + (nFallos ? nFallos + ' pregunta' + (nFallos > 1 ? 's' : '') + ' por repasar' : 'Aún no tienes errores guardados') + '</small></button></div>';
    $('#v-cuestionarios').onclick = function (e) { var b = e.target.closest('[data-q]'); if (b && !b.disabled) iniciarQuiz(b.getAttribute('data-q')); };
  }
  function iniciarQuiz(tipo) {
    var preg = tipo === 'mix' ? barajar(porSem(0)).slice(0, 20) : tipo === 'err' ? barajar(porSem(0).filter(function (p) { return S.fallos[p.i]; })) : barajar(porSem(+tipo));
    if (!preg.length) return pintarQuizHome();
    Q = { tipo: tipo, preg: preg, k: 0, bien: 0, resp: false };
    try { history.replaceState(null, '', '#cuestionarios-' + tipo); } catch (e) { }
    pintarPregunta();
  }
  function pintarPregunta() {
    var p = Q.preg[Q.k], orden = barajar(p.op.map(function (o, i) { return i; }));
    var titulo = Q.tipo === 'mix' ? 'Examen mixto' : Q.tipo === 'err' ? 'Repaso de errores' : 'Semana ' + Q.tipo + ' · ' + C.semanas[+Q.tipo - 1].titulo;
    $('#v-cuestionarios').innerHTML = '<div class="quiz"><div class="quiz-h"><button class="lnk" id="qSalir">← Cuestionarios</button><span>' + esc(titulo) + '</span><span class="grow"></span><b>' + (Q.k + 1) + ' / ' + Q.preg.length + '</b></div>' +
      '<div class="prog-bar"><i style="width:' + (Q.k / Q.preg.length * 100) + '%"></i></div>' +
      '<h3 class="qq">' + esc(p.q) + '</h3><div class="ops">' + orden.map(function (i) { return '<button class="op" data-o="' + i + '">' + esc(p.op[i]) + '</button>'; }).join('') + '</div>' +
      '<div class="qfb" id="qfb" hidden></div></div>';
    $('#qSalir').onclick = function () { Q = null; pintarQuizHome(); try { history.replaceState(null, '', '#cuestionarios'); } catch (e) { } };
    $$('.op').forEach(function (b) {
      b.onclick = function () {
        if (Q.resp) return; Q.resp = true;
        var o = +b.getAttribute('data-o'), ok = o === p.ok;
        if (ok) { Q.bien++; delete S.fallos[p.i]; } else S.fallos[p.i] = 1;
        guardar();
        $$('.op').forEach(function (x) { var i = +x.getAttribute('data-o'); if (i === p.ok) x.classList.add('ok'); else if (x === b) x.classList.add('mal'); x.disabled = true; });
        var fb = $('#qfb'); fb.hidden = false; fb.className = 'qfb ' + (ok ? 'ok' : 'mal');
        fb.innerHTML = '<b>' + (ok ? '¡Bien!' : 'No es correcto.') + '</b> ' + esc(p.exp) + '<div><button class="btn navy sm-b" id="qSig">' + (Q.k + 1 < Q.preg.length ? 'Siguiente →' : 'Ver resultado') + '</button></div>';
        $('#qSig').onclick = function () { Q.k++; Q.resp = false; if (Q.k < Q.preg.length) pintarPregunta(); else finQuiz(); };
        $('#qSig').focus();
      };
    });
  }
  function finQuiz() {
    var t = Q.preg.length, b = Q.bien, pct = Math.round(b / t * 100);
    if (Q.tipo !== 'err') { var r = S.quiz[Q.tipo] || { best: 0, veces: 0 }; r.veces++; r.best = Math.max(r.best, b); r.ult = b; S.quiz[Q.tipo] = r; guardar(); }
    var msg = pct === 100 ? '¡Perfecto! Dominas este tema.' : pct >= 75 ? 'Muy bien. Repasa las que fallaste.' : pct >= 50 ? 'Vas avanzando: vuelve a leer las ideas clave de la semana y repite.' : 'Conviene repasar la PPT de la semana y los casos resueltos antes de repetir.';
    $('#v-cuestionarios').innerHTML = '<div class="quiz fin"><div class="big">' + b + ' / ' + t + '</div><p>' + msg + '</p>' +
      '<div class="caso-a"><button class="btn navy" id="qOtra">Repetir</button><button class="btn line" id="qVolver">Otros cuestionarios</button>' +
      (Object.keys(S.fallos).length ? '<button class="btn line" id="qErr">Repasar mis errores</button>' : '') + '</div></div>';
    $('#qOtra').onclick = function () { iniciarQuiz(Q.tipo); };
    $('#qVolver').onclick = function () { Q = null; pintarQuizHome(); };
    if ($('#qErr')) $('#qErr').onclick = function () { iniciarQuiz('err'); };
  }

  // ---------------------------------------------------------------- MATERIALES
  var DRIVE = ''; // enlace fijo a la carpeta de Drive (se puede poner aquí; solo José puede abrirla si es privada)
  function pintarMateriales() {
    var link = S.drive || DRIVE;
    $('#v-materiales').innerHTML =
      '<div class="box drive"><h3><i data-icon="FaFilePdf"></i> Mis PDF y Excel del curso</h3>' +
      '<p>Toca un documento para abrirlo aquí mismo; dentro del visor hay un botón para descargarlo. Si quieres tenerlos también en tu Google Drive, pega aquí el enlace de tu carpeta.</p>' +
      (link ? '<a class="btn gold" href="' + esc(link) + '" target="_blank" rel="noopener"><i data-icon="FaExternalLinkAlt"></i> Abrir la carpeta del curso</a> <button class="lnk" id="dCambiar">Cambiar enlace</button>'
            : '<div class="drive-f"><input class="in" id="dLink" placeholder="Pega aquí el enlace de tu carpeta de Google Drive"><button class="btn navy sm-b" id="dGuardar">Guardar</button></div>') +
      '<p class="tiny">El enlace se guarda solo en este navegador.</p></div>' +
      C.materiales.map(function (g) {
        return '<h3 class="h-ef">' + esc(g.grupo) + '</h3><div class="mats">' + g.items.map(function (m) { return '<div class="mat"><b>' + esc(m[0]) + '</b><p>' + esc(m[1]) + '</p><div class="mat-f">' + (m[2] || []).map(function (f) { return '<button class="chip" data-abrir="' + esc(f[1]) + '" data-tit="' + esc(m[0] + (m[2].length > 1 ? ' – ' + f[0] : '')) + '"><i data-icon="' + (/\.pdf$/.test(f[1]) ? 'FaFilePdf' : 'FaFileInvoiceDollar') + '"></i> ' + esc(f[0]) + '</button>'; }).join('') + '</div></div>'; }).join('') + '</div>';
      }).join('') +
      '<h3 class="h-ef">Fuentes oficiales y de consulta</h3><ul class="links">' + C.enlaces.map(function (l) { return '<li><a href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(l[0]) + ' <i data-icon="FaExternalLinkAlt"></i></a></li>'; }).join('') + '</ul>';
    var g = $('#dGuardar'); if (g) g.onclick = function () { var v = $('#dLink').value.trim(); if (!/^https:\/\/(drive|docs)\.google\.com\//.test(v)) { alert('Pega un enlace de Google Drive (empieza con https://drive.google.com/).'); return; } S.drive = v; guardar(); hechas.materiales = 0; vista('materiales'); };
    var c = $('#dCambiar'); if (c) c.onclick = function () { S.drive = ''; guardar(); hechas.materiales = 0; vista('materiales'); };
  }


  // ---------------------------------------------------------------- VISOR de documentos (PDF con PDF.js local; Excel como tablas)
  var V = { dlg: null, doc: null, zoom: 1, obs: null, pdfjs: null };
  function crearVisor() {
    if (V.dlg) return;
    var d = document.createElement('dialog'); d.id = 'visor';
    d.innerHTML = '<div class="vs-bar"><b id="vsT"></b><span class="grow"></span><span class="vs-pdf" hidden><button class="vs-b" id="vsMenos" aria-label="Alejar">−</button><span id="vsZ">100 %</span><button class="vs-b" id="vsMas" aria-label="Acercar">+</button><span class="vs-pg" id="vsPg"></span></span>' +
      '<a class="vs-b vs-dl" id="vsDl" download><i data-icon="FaDownload"></i> <span>Descargar</span></a><button class="vs-b" id="vsX" aria-label="Cerrar">✕</button></div><div class="vs-body" id="vsB"></div>';
    document.body.appendChild(d); V.dlg = d;
    $('#vsX').onclick = function () { d.close(); };
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('close', function () { if (V.doc) { try { V.doc.destroy(); } catch (e) { } V.doc = null; } if (V.obs) V.obs.disconnect(); $('#vsB').innerHTML = ''; try { history.replaceState(null, '', '#materiales'); } catch (e) { } });
    $('#vsMenos').onclick = function () { zoomPdf(-0.25); }; $('#vsMas').onclick = function () { zoomPdf(0.25); };
    $('#vsB').addEventListener('scroll', function () { if (V.raf) return; V.raf = requestAnimationFrame(function () { V.raf = 0; marcarPagina(); }); });
    if (window.pintarIconos) pintarIconos(d);
  }
  function abrirDoc(archivo, titulo) {
    crearVisor(); var url = 'materiales/' + archivo, esPdf = /\.pdf$/i.test(archivo);
    $('#vsT').textContent = titulo || archivo; $('#vsDl').href = url; $('#vsDl').setAttribute('download', archivo);
    $('.vs-pdf', V.dlg).hidden = !esPdf; $('#vsB').className = 'vs-body ' + (esPdf ? 'es-pdf' : 'es-xls');
    $('#vsB').innerHTML = '<p class="vs-cargando">Abriendo el documento…</p>';
    if (!V.dlg.open) V.dlg.showModal();
    try { history.replaceState(null, '', '#materiales'); } catch (e) { }
    (esPdf ? verPdf(url) : verExcel(archivo)).catch(function () { $('#vsB').innerHTML = '<p class="vs-cargando">No se pudo abrir aquí. Usa el botón <b>Descargar</b>.</p>'; });
  }
  function cargarPdfjs() {
    if (window.pdfjsLib) return Promise.resolve();
    return new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = '../../assets/vendor/pdfjs/pdf.min.js';
      s.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/vendor/pdfjs/pdf.worker.min.js'; ok(); }; s.onerror = no; document.head.appendChild(s);
    });
  }
  function verPdf(url) {
    return cargarPdfjs().then(function () { return window.pdfjsLib.getDocument(url).promise; }).then(function (doc) {
      V.doc = doc; V.zoom = 1; return doc.getPage(1).then(function (p) { V.p1 = p.getViewport({ scale: 1 }); pintarPaginas(); });
    });
  }
  function anchoBase() { var w = Math.min($('#vsB').clientWidth - 24, 980); return Math.max(w, 260); }
  function pintarPaginas() {
    var b = $('#vsB'), n = V.doc.numPages, esc1 = anchoBase() / V.p1.width * V.zoom, alto = V.p1.height * esc1, ancho = V.p1.width * esc1;
    V.escala = esc1; b.innerHTML = '';
    if (V.obs) V.obs.disconnect();
    V.obs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { V.obs.unobserve(e.target); renderPag(e.target); } }); }, { root: b, rootMargin: '700px 0px' });
    for (var i = 1; i <= n; i++) {
      var d = document.createElement('div'); d.className = 'pg'; d.setAttribute('data-n', i); d.style.width = ancho + 'px'; d.style.height = alto + 'px';
      b.appendChild(d); V.obs.observe(d);
    }
    $('#vsZ').textContent = Math.round(V.zoom * 100) + ' %'; marcarPagina();
  }
  function renderPag(div) {
    var doc = V.doc, esc1 = V.escala, n = +div.getAttribute('data-n'); if (!doc) return;
    doc.getPage(n).then(function (page) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), vp = page.getViewport({ scale: esc1 * dpr }), c = document.createElement('canvas');
      c.width = vp.width; c.height = vp.height; c.style.width = vp.width / dpr + 'px'; c.style.height = vp.height / dpr + 'px';
      return page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.then(function () { if (div.isConnected) { div.style.height = 'auto'; div.appendChild(c); } });
    });
  }
  function zoomPdf(d) { if (!V.doc) return; var z = Math.max(0.5, Math.min(4, V.zoom + d)); if (z === V.zoom) return; V.zoom = z; var b = $('#vsB'), ratio = b.scrollTop / Math.max(1, b.scrollHeight); pintarPaginas(); b.scrollTop = ratio * b.scrollHeight; }
  function marcarPagina() {
    if (!V.doc) return; var b = $('#vsB'), pgs = $$('.pg', b), cur = 1, y = b.scrollTop + b.clientHeight / 3;
    for (var i = 0; i < pgs.length; i++) { if (pgs[i].offsetTop - b.offsetTop <= y) cur = i + 1; else break; }
    $('#vsPg').textContent = 'pág. ' + cur + ' / ' + pgs.length;
  }
  function verExcel(archivo) {
    return fetch('materiales/vistas/' + archivo + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      var b = $('#vsB'), n = j.hojas.length;
      b.innerHTML = '<div class="xl-tabs">' + j.hojas.map(function (h, i) { return '<button class="chip' + (i ? '' : ' on') + '" data-h="' + i + '">' + esc(h.nombre) + '</button>'; }).join('') + '</div><div class="xl-t" id="xlT"></div>' +
        '<p class="tiny xl-n">Vista de solo lectura con los valores del archivo. Para editar o usar las fórmulas, descárgalo.</p>';
      function hoja(i) {
        var h = j.hojas[i]; $$('.xl-tabs .chip', b).forEach(function (c, k) { c.classList.toggle('on', k === i); });
        $('#xlT').innerHTML = '<table class="xl"><tbody>' + h.filas.map(function (f) { return '<tr>' + f.map(function (c) { return '<td' + (/^-?[\d.,]+%?$/.test(c) && c !== '' ? ' class="n"' : '') + '>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' + (h.recortado ? '<p class="tiny">Se muestran las primeras filas; descarga el archivo para ver todo.</p>' : '');
      }
      $('.xl-tabs', b).onclick = function (e) { var c = e.target.closest('[data-h]'); if (c) hoja(+c.getAttribute('data-h')); };
      hoja(0);
    });
  }
  document.addEventListener('click', function (e) { var a = e.target.closest('[data-abrir]'); if (a) abrirDoc(a.getAttribute('data-abrir'), a.getAttribute('data-tit')); });

  // ---------------------------------------------------------------- inicio
  var h = decodeURIComponent((location.hash || '').slice(1)), m = /^([a-z]+)(?:-(.+))?$/.exec(h) || [];
  var ver = /^ver=(.+)$/.exec(h);
  if (ver) {
    var arch = ver[1], tit = arch;
    C.materiales.forEach(function (g) { g.items.forEach(function (it) { (it[2] || []).forEach(function (f) { if (f[1] === arch) tit = it[0]; }); }); });
    vista('materiales'); abrirDoc(arch, tit);
  } else vista(m[1] || 'ruta', m[1] === 'cuestionarios' ? m[2] : null);
  if (window.pintarIconos) pintarIconos();
})();
