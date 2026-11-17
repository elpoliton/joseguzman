/* Cuentas Claras FDCP — prototipo académico con datos de ejemplo.
   Todo ocurre en el navegador: lo que la persona hace se guarda en localStorage (clave cc-fdcp-v2). */
(function () {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/* ---------- fechas ---------- */
const today = new Date(); today.setHours(0, 0, 0, 0);
const Y = today.getFullYear();
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MSHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
const fmt = d => { d = new Date(d); return String(d.getDate()).padStart(2, '0') + ' ' + MSHORT[d.getMonth()] + ' ' + d.getFullYear(); };
const fmtMY = d => MSHORT[d.getMonth()][0].toUpperCase() + MSHORT[d.getMonth()].slice(1) + ' ' + d.getFullYear();
const daysAgo = n => { const x = new Date(today); x.setDate(x.getDate() - n); return x; };
const monthsFrom = n => new Date(today.getFullYear(), today.getMonth() + n, 1);
const dayDiff = d => Math.round((today - new Date(d)) / 864e5);
function addBusinessDays(d, n) { const x = new Date(d); let k = 0; while (k < n) { x.setDate(x.getDate() + 1); const w = x.getDay(); if (w !== 0 && w !== 6) k++; } return x; }
function businessDaysLeft(due) { let n = 0; const x = new Date(today); const sign = due >= today ? 1 : -1; while (sign > 0 ? x < due : x > due) { x.setDate(x.getDate() + sign); const w = x.getDay(); if (w !== 0 && w !== 6) n += sign; } return n; }

/* ---------- estado guardado ---------- */
const KEY = 'cc-fdcp-v2';
const DEF = () => ({ role: 'estudiante', theme: 'auto', size: 0, follows: [], votes: {}, supported: [], rating: null, demandas: [], replies: {}, comp: {}, solicitudes: [], solDone: {}, ley: {}, informes: [], tour: false });
let S = DEF();
try { const raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && typeof raw === 'object') S = Object.assign(DEF(), raw); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

/* ---------- datos de ejemplo ---------- */
const STATUS = {
  ok: { label: 'Cumplido', cls: 'st-ok', color: 'var(--ok)' },
  part: { label: 'Atendido en parte', cls: 'st-part', color: 'var(--part)' },
  run: { label: 'En curso', cls: 'st-run', color: 'var(--run)' },
  pend: { label: 'Pendiente', cls: 'st-pend', color: 'var(--pend)' }
};
const LEYLABEL = { ok: 'Publicado', part: 'Incompleto', run: 'En preparación', pend: 'No publicado' };
const DSTAT = {
  recibida: { label: 'Sin respuesta', heard: false, done: 'no' },
  respondida: { label: 'Respondida', heard: true, done: 'no' },
  parcial: { label: 'Atendida en parte', heard: true, done: 'half' },
  atendida: { label: 'Atendida', heard: true, done: 'yes' }
};
const FUNCIONES = [
  'Presidir el Consejo de Facultad',
  'Dirigir administrativamente la Facultad',
  'Dirigir académicamente la Facultad (departamentos, escuelas y posgrado)',
  'Representar a la Facultad ante la Asamblea y el Consejo Universitario',
  'Designar a vicedecanos y directores de escuela',
  'Proponer al Consejo de Facultad sanciones a docentes y estudiantes',
  'Presentar el plan anual de funcionamiento y su informe de gestión'
];
const RATING = [[38, 24, 18], [30, 28, 22], [26, 30, 24], [34, 27, 19], [22, 31, 27], [20, 29, 31], [18, 26, 36]];
const ORGANOS = [
  { id: 'decanato', kind: 'Autoridad unipersonal', name: 'Decanato', desc: 'Máxima autoridad de gobierno de la Facultad. La representa ante el Consejo Universitario y la Asamblea Universitaria (Estatuto UNMSM, art. 70).', resp: 'Decano/a de la Facultad' },
  { id: 'consejo', kind: 'Órgano colegiado', name: 'Consejo de Facultad', desc: 'Aprueba el plan de funcionamiento, las sanciones y los acuerdos de la Facultad. Sus actas deben publicarse (Ley 30220, art. 11).', resp: 'Lo preside el Decanato' },
  { id: 'tercio', kind: 'Representación estudiantil', name: 'Tercio estudiantil', desc: 'Representantes estudiantiles ante el Consejo de Facultad. Llevan las demandas de las bases a los órganos de decisión.', resp: 'Representantes elegidos' },
  { id: 'federado', kind: 'Gremio', name: 'Centro Federado', desc: 'Gremio de estudiantes de la Facultad. Organiza asambleas y difunde información a las bases.', resp: 'Junta directiva' },
  { id: 'cecp', kind: 'Gremio', name: 'Centro de Estudiantes de Ciencia Política', desc: 'Representa a la Escuela de Ciencia Política y canaliza sus demandas académicas.', resp: 'Junta directiva' },
  { id: 'imagen', kind: 'Unidad administrativa', name: 'Imagen institucional', desc: 'Publica los comunicados y mantiene la página web y las redes de la Facultad.', resp: 'Jefatura de la unidad' }
];

let DATA;
function build() {
  const comp = [
    { id: 1, title: 'Publicar las actas del Consejo de Facultad en la web', eje: 'Institucionalidad', organo: 'Consejo de Facultad', status: 'run', avance: 40, origen: 'Plan de gestión', updated: daysAgo(9), due: fmtMY(monthsFrom(4)), evidence: '3 de 8 actas del año publicadas en la sección Documentos.', a: 14, d: 6,
      log: [{ d: daysAgo(70), t: 'El Consejo aprueba publicar sus actas.' }, { d: daysAgo(9), t: 'Se publican las 3 primeras actas.' }] },
    { id: 2, title: 'Ciclo de verano a costo cero', eje: 'Bienestar', organo: 'Consejo de Facultad', status: 'part', avance: 60, origen: 'Demanda estudiantil (asamblea)', updated: daysAgo(30), due: fmtMY(monthsFrom(2)), evidence: 'Se aprobó una reducción del 30 % del costo, no la gratuidad solicitada. Acuerdo N.° 112-CF.', a: 9, d: 21,
      log: [{ d: daysAgo(64), t: 'La asamblea estudiantil presenta el pedido.' }, { d: daysAgo(41), t: 'Mesa de diálogo con el Tercio estudiantil.' }, { d: daysAgo(30), t: 'El Consejo aprueba una reducción del 30 %.' }] },
    { id: 3, title: 'Mejorar los servicios higiénicos del pabellón', eje: 'Infraestructura', organo: 'Decanato', status: 'ok', avance: 100, origen: 'Propuesta de campaña', updated: daysAgo(52), due: fmtMY(monthsFrom(-1)), evidence: 'Obra entregada. Acta de recepción y fotografías del antes y el después.', a: 31, d: 4,
      log: [{ d: daysAgo(150), t: 'Se aprueba el presupuesto de la obra.' }, { d: daysAgo(96), t: 'Inicio de los trabajos.' }, { d: daysAgo(52), t: 'Entrega de la obra con acta de recepción.' }] },
    { id: 4, title: 'Remodelar el pabellón de Ciencia Política', eje: 'Infraestructura', organo: 'Decanato', status: 'pend', avance: 0, origen: 'Propuesta de campaña', updated: daysAgo(120), due: 'Sin fecha', evidence: 'Expediente técnico no iniciado.', a: 2, d: 27,
      log: [{ d: daysAgo(120), t: 'Se anuncia la elaboración del expediente técnico.' }] },
    { id: 5, title: 'Convenios con universidades extranjeras', eje: 'Calidad académica', organo: 'Decanato', status: 'run', avance: 50, origen: 'Propuesta de campaña', updated: daysAgo(18), due: fmtMY(monthsFrom(13)), evidence: '2 convenios firmados y 2 en negociación.', a: 12, d: 5,
      log: [{ d: daysAgo(88), t: 'Primer convenio firmado.' }, { d: daysAgo(18), t: 'Segundo convenio firmado; dos más en negociación.' }] },
    { id: 6, title: 'Actualizar la página web de la Facultad cada semana', eje: 'Difusión', organo: 'Imagen institucional', status: 'run', avance: 25, origen: 'Recomendación de la tesis', updated: daysAgo(5), due: fmtMY(monthsFrom(7)), evidence: 'Responsable designado. Primera publicación semanal realizada.', a: 18, d: 3,
      log: [{ d: daysAgo(20), t: 'Se designa un responsable de la web.' }, { d: daysAgo(5), t: 'Primera actualización semanal.' }] }
  ];
  comp.forEach(k => {
    const o = S.comp[k.id];
    if (o) { k.status = o.status; k.avance = o.avance; k.updated = new Date(o.updated); k.log = k.log.concat((o.log || []).map(l => ({ d: new Date(l.d), t: l.t }))); }
    const v = S.votes[k.id]; if (v === 'a') k.a++; if (v === 'd') k.d++;
  });

  const comunicados = [
    { type: 'con', label: 'En consulta', title: 'Propuesta de horario de biblioteca en exámenes', text: 'Opina antes de que el Consejo de Facultad decida.', date: daysAgo(2), closes: daysAgo(-6), href: '#participa/nueva' },
    { type: 'avi', label: 'Aviso', title: 'Cronograma de matrícula del próximo semestre', text: 'Fechas por escuela y requisitos.', date: daysAgo(4), href: '#informes' },
    { type: 'dec', label: 'Decisión tomada', title: 'Designación del nuevo director de la Escuela de Ciencia Política', text: 'Resolución de Decanato publicada con su fundamento.', date: daysAgo(11), href: '#informes' },
    { type: 'dec', label: 'Decisión tomada', title: 'Acuerdo sobre el costo del ciclo de verano', text: 'Reducción del 30 %. Revisa el fundamento y el historial.', date: daysAgo(30), href: '#compromisos/2' }
  ];

  const inf = [
    [0, 'Consulta sobre el horario de biblioteca', 'Encuesta abierta a estudiantes.', 'Resultados parciales'],
    [1, 'Informe de convenios internacionales', 'Dos convenios firmados.', 'Convenios escaneados'],
    [2, 'Entrega de la obra de servicios higiénicos', 'Recepción de obra y conformidad.', 'Acta de recepción'],
    [3, 'Sesión extraordinaria del Consejo de Facultad', 'Proceso de contratación docente.', 'Acta de sesión'],
    [5, 'Rendición de cuentas semestral', 'Ejecución presupuestal y avance de compromisos.', 'Presentación y video'],
    [7, 'Mesa de diálogo con gremios', 'Agenda: servicios higiénicos, biblioteca y verano.', 'Acta de acuerdos'],
    [8, 'Informe de inicio de semestre', 'Programación académica, aulas y plana docente.', 'Informe PDF'],
    [10, 'Sesión ordinaria del Consejo de Facultad', 'Aprobación del cuadro de vacantes.', 'Acta de sesión'],
    [12, 'Informe anual de gestión', 'Resultados del año y ejecución presupuestal.', 'Informe PDF'],
    [16, 'Informe semestral de gestión', 'Avances y pendientes del semestre.', 'Informe PDF'],
    [18, 'Sesión ordinaria del Consejo de Facultad', 'Aprobación de sílabos y carga lectiva.', 'Acta de sesión'],
    [21, 'Plan anual de funcionamiento', 'Presentado al Consejo de Facultad.', 'Plan aprobado']
  ].map(r => { const d = monthsFrom(-r[0]); return { y: d.getFullYear(), m: d.getMonth(), act: r[1], desc: r[2], ev: r[3] }; })
    .concat(S.informes.map(i => Object.assign({ nuevo: true }, i)));

  const ley = [
    { t: 'Estatuto, TUPA, plan estratégico y reglamentos', s: 'ok', w: 'Actualizado hace 3 semanas' },
    { t: 'Actas de Consejo de Facultad y de Consejo Universitario', s: 'part', w: '3 de 8 actas del año' },
    { t: 'Estados financieros, presupuesto y ejecución presupuestal', s: 'pend', w: 'Última versión: ' + (Y - 2) },
    { t: 'Becas y créditos educativos disponibles y otorgados', s: 'ok', w: 'Actualizado este semestre' },
    { t: 'Inversiones, donaciones y obras de infraestructura', s: 'part', w: 'Solo obras concluidas' },
    { t: 'Proyectos de investigación y sus gastos', s: 'pend', w: 'No publicado' },
    { t: 'Pagos exigidos a los estudiantes', s: 'ok', w: 'Tarifario vigente publicado' },
    { t: 'Número de estudiantes por programa', s: 'ok', w: 'Datos del último semestre' },
    { t: 'Plana docente: clase, categoría y hoja de vida', s: 'part', w: 'Falta la hoja de vida del 40 % de docentes' },
    { t: 'Postulantes, ingresantes, matriculados y egresados', s: 'run', w: 'En preparación' }
  ];
  ley.forEach((l, i) => { if (S.ley[i]) { l.s = S.ley[i]; l.w = 'Actualizado hoy'; } });

  const solicitudes = S.solicitudes.map(r => ({ folio: r.folio, tema: r.tema, sent: new Date(r.sent), mine: true }))
    .concat([
      { folio: 'SAIP-' + Y + '-0134', tema: 'Costo desagregado del ciclo de verano', sent: daysAgo(6) },
      { folio: 'SAIP-' + Y + '-0131', tema: 'Ejecución presupuestal del año de la Facultad', sent: daysAgo(20) },
      { folio: 'SAIP-' + Y + '-0128', tema: 'Criterios del concurso de ayudantías', sent: daysAgo(16), answered: true }
    ]);
  solicitudes.forEach(r => { if (S.solDone[r.folio]) r.answered = true; r.due = addBusinessDays(r.sent, 10); r.left = businessDaysLeft(r.due); });

  const demandas = [
    { id: 1, cat: 'Infraestructura', title: 'Más tomacorrientes en las aulas del tercer piso', text: 'Varias aulas no tienen tomas para laptops.', apoyos: 64, date: daysAgo(34), status: 'atendida', reply: { who: 'Decanato', when: daysAgo(10), text: 'Se instalaron 24 tomacorrientes. Se adjunta la conformidad del área de mantenimiento.' } },
    { id: 2, cat: 'Trámites', title: 'Plazo fijo para entregar constancias de notas', text: 'Hoy demora entre una y tres semanas, sin aviso.', apoyos: 91, date: daysAgo(15), status: 'respondida', reply: { who: 'Secretaría Administrativa', when: daysAgo(3), text: 'Evaluamos fijar un plazo de 5 días hábiles. Informaremos en la próxima sesión del Consejo.' } },
    { id: 3, cat: 'Académico', title: 'Publicar los sílabos antes de la matrícula', text: 'Para elegir cursos con información completa.', apoyos: 48, date: daysAgo(40), status: 'parcial', reply: { who: 'Dirección de Escuela', when: daysAgo(21), text: 'Se publicarán los sílabos de los cursos obligatorios. Los electivos quedan pendientes.' } },
    { id: 4, cat: 'Bienestar', title: 'Ampliar el horario del comedor en época de exámenes', text: 'Muchos estudiantes salen de clases después de las 3 p. m.', apoyos: 37, date: daysAgo(8), status: 'recibida', reply: null }
  ].concat(S.demandas.map(d => ({ id: d.id, cat: d.cat, title: d.title, text: d.text, apoyos: 1, date: new Date(d.date), status: 'recibida', reply: null, mine: true })));
  demandas.forEach(d => {
    const r = S.replies[d.id]; if (r) { d.status = r.status; d.reply = { who: r.who, when: new Date(r.when), text: r.text }; }
    if (S.supported.indexOf(d.id) >= 0) d.apoyos++;
  });

  DATA = { comp, comunicados, inf, ley, solicitudes, demandas };
}

/* ---------- índice de rendición de cuentas ---------- */
function indice() {
  const c = DATA.comp, resp = Math.round(c.reduce((a, k) => a + k.avance, 0) / c.length);
  let withRep = 0; for (let k = 0; k < 12; k++) { const d = monthsFrom(-k); if (DATA.inf.some(i => i.y === d.getFullYear() && i.m === d.getMonth())) withRep++; }
  const dif = Math.round(withRep / 12 * 100);
  const lw = { ok: 1, part: .5, run: 0, pend: 0 };
  const tra = Math.round(DATA.ley.reduce((a, l) => a + lw[l.s], 0) / DATA.ley.length * 100);
  const n = DATA.demandas.length, heard = DATA.demandas.filter(d => DSTAT[d.status].heard).length;
  const done = DATA.demandas.reduce((a, d) => a + ({ yes: 1, half: .5, no: 0 }[DSTAT[d.status].done]), 0);
  const par = Math.round((heard / n + done / n) / 2 * 100);
  const full = DATA.demandas.filter(d => d.status === 'atendida').length, half = DATA.demandas.filter(d => d.status === 'parcial').length;
  const dims = [
    { k: 'Responsabilidad', v: resp, how: 'Avance promedio de los ' + c.length + ' compromisos', href: '#compromisos' },
    { k: 'Difusión', v: dif, how: withRep + ' de los últimos 12 meses tienen informe', href: '#informes' },
    { k: 'Transparencia', v: tra, how: 'Rubros del art. 11 publicados (los incompletos valen la mitad)', href: '#transparencia' },
    { k: 'Participación', v: par, how: heard + ' de ' + n + ' demandas escuchadas; ' + full + ' atendida' + (full === 1 ? '' : 's') + (half ? ' y ' + half + ' en parte' : ''), href: '#participa' }
  ];
  const total = Math.round(dims.reduce((a, d) => a + d.v, 0) / 4);
  const verdict = total >= 80 ? 'Sólida' : total >= 60 ? 'Aceptable' : total >= 40 ? 'En desarrollo' : 'Insuficiente';
  return { dims, total, verdict };
}
function pendientes() {
  const dem = DATA.demandas.filter(d => d.status === 'recibida').sort((a, b) => b.apoyos - a.apoyos);
  const sol = DATA.solicitudes.filter(r => !r.answered).sort((a, b) => a.left - b.left);
  const comp = DATA.comp.filter(k => k.status !== 'ok' && dayDiff(k.updated) > 60);
  const ley = DATA.ley.filter(l => l.s === 'pend').length;
  return { dem, sol, comp, ley, total: dem.length + sol.length + comp.length };
}

/* ---------- estado de interfaz ---------- */
let filter = 'all', dfilter = 'all';
let year = Y, month = today.getMonth();
let lastReceipt = null, pendingPrefill = null;
const drafts = {};
const ICON = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  check: 'M9 11l3 3 8-8M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  inbox: 'M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 13h5l1 3h6l1-3h5',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3',
  bell: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 21h4',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  auto: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 3v18M12 7h7.5M12 12h9M12 17h7.5',
  play: 'M7 4l13 8-13 8z',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a5 5 0 0 0-4-4.9'
};
const ic = n => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICON[n] + '"/></svg>';
const chip = s => '<span class="chip ' + STATUS[s].cls + '">' + STATUS[s].label + '</span>';
const panelName = () => S.role === 'autoridad' ? 'Bandeja' : 'Mi panel';

function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 2800);
}

/* ---------- vistas ---------- */
function vInicio() {
  const I = indice(), C = 2 * Math.PI * 52;
  const intents = [
    ['check', 'Saber si cumplieron lo que prometieron', 'Compromisos con plazo, avance y evidencia', '#compromisos'],
    ['doc', 'Entender una decisión que ya se tomó', 'Informes y actas, mes a mes', '#informes'],
    ['eye', 'Pedir un documento o un dato', 'Solicitud con respuesta en 10 días hábiles', '#transparencia/solicitar'],
    ['chat', 'Reportar un problema o proponer algo', 'Tu demanda, con seguimiento público', '#participa/nueva'],
    ['users', 'Saber quién decide qué', 'Órganos de gobierno y sus funciones', '#organos']
  ];
  return `<section class="view">
    <div class="hero">
      <div>
        <p class="eyebrow">Rendición de cuentas de la Facultad</p>
        <h1 style="margin-top:10px">Qué se prometió, qué se hizo y qué falta.</h1>
        <p class="lead">Las autoridades informan aquí sus compromisos, sus decisiones y su gestión. Tú revisas la evidencia, pides información y ves si tu demanda fue escuchada y atendida.</p>
        <div class="intents" id="intents">
          <p class="q">¿Qué necesitas hoy?</p>
          ${intents.map(i => `<a class="intent" href="${i[3]}"><span class="n">${ic(i[0])}</span><span><b>${i[1]}</b><small>${i[2]}</small></span><span class="go" aria-hidden="true">→</span></a>`).join('')}
        </div>
        <div class="tourcta"><button type="button" class="btn ghost" data-act="tour" id="start-tour">${ic('play')} Recorrido guiado de 1 minuto</button><span class="muted" style="font-size:.86rem">o pulsa <kbd>/</kbd> para buscar</span></div>
      </div>
      <div class="panel index" id="indice">
        <div><p class="eyebrow">Índice de rendición de cuentas</p><p class="muted" style="font-size:.84rem;margin-top:2px">Se recalcula cada vez que la autoridad cumple, publica o responde.</p></div>
        <div class="sum" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:center">
          <div class="ring" role="img" aria-label="Índice ${I.total} de 100"><svg viewBox="0 0 124 124"><circle class="track" cx="62" cy="62" r="52"/><circle class="val" cx="62" cy="62" r="52" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - I.total / 100)).toFixed(1)}"/></svg><div class="num"><span class="mono">${I.total}<small>DE 100</small></span></div></div>
          <p class="verdict"><b style="font-family:var(--font-display);font-size:1.25rem">${I.verdict}</b><br><span class="muted">Promedio de las cuatro dimensiones que analiza la tesis. Indicador de demostración.</span></p>
        </div>
        <div>${I.dims.map(d => `<a class="dim" href="${d.href}"><b>${d.k}</b><span class="mono">${d.v} %</span><span class="bar"><span style="width:${d.v}%"></span></span><small>${d.how}</small></a>`).join('')}</div>
      </div>
    </div>
    <div class="grid" style="gap:12px">
      <div class="section-head"><h2>Comunicados recientes</h2><p>Las decisiones se publican con su fundamento. Las que aún no se toman se abren a consulta.</p></div>
      <div class="panel feed">${DATA.comunicados.map(x => `<article><time class="mono">${fmt(x.date)}</time><div><h3><a href="${x.href}" style="color:inherit;text-decoration:none">${esc(x.title)}</a></h3><p>${esc(x.text)}${x.closes ? ` Cierra el <b>${fmt(x.closes)}</b>.` : ''}</p></div><div>${x.type === 'con' ? `<a class="btn small primary" href="${x.href}">Opinar</a>` : `<span class="chip type-${x.type}">${x.label}</span>`}</div></article>`).join('')}</div>
    </div>
  </section>`;
}

function vOrganos(arg) {
  const o = ORGANOS.find(x => x.id === arg);
  if (o) return vPerfil(o);
  return `<section class="view">
    <div class="section-head"><p class="eyebrow">Órganos de gobierno</p><h2>Quién decide en la Facultad y a quién le rinde cuentas</h2><p>Elige un órgano para ver sus funciones y el estado de sus compromisos.</p></div>
    <div class="grid g3">${ORGANOS.map(o => { const n = DATA.comp.filter(k => k.organo === o.name).length; return `<a class="organ" href="#organos/${o.id}"><span class="kind">${o.kind}</span><h3>${o.name}</h3><p class="muted" style="font-size:.9rem">${o.desc}</p><span class="meta"><span class="chip plain">${n} compromiso${n === 1 ? '' : 's'}</span></span></a>`; }).join('')}</div>
  </section>`;
}
function vPerfil(o) {
  const mine = DATA.comp.filter(k => k.organo === o.name);
  const funcs = o.id === 'decanato' ? `<ol class="funcs">${FUNCIONES.map(f => `<li>${f}</li>`).join('')}</ol><p class="muted" style="font-size:.8rem;margin-top:10px">Fuente: Estatuto de la UNMSM, art. 72.</p>` : `<p class="muted">${o.desc}</p>`;
  return `<section class="view">
    <div><a class="btn ghost small" href="#organos">← Todos los órganos</a></div>
    <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div class="avatar" aria-hidden="true">${o.name.split(' ').filter(w => w.length > 2).map(w => w[0]).slice(0, 2).join('')}</div><div><p class="eyebrow">${o.kind}</p><h2>${o.name}</h2><p class="muted">${o.resp} · Gestión de ejemplo</p></div></div>
    <div class="profile">
      <div class="panel pad" style="display:grid;gap:12px;align-content:start"><h3>Funciones</h3>${funcs}</div>
      <div class="grid" style="align-content:start">
        <div class="panel pad"><h3>Compromisos a su cargo</h3><div style="margin-top:8px">${mine.length ? mine.map(k => `<a class="minirow" href="#compromisos/${k.id}"><span>${esc(k.title)}</span>${chip(k.status)}</a>`).join('') : '<p class="muted">Este órgano aún no registra compromisos.</p>'}</div></div>
        ${o.id === 'decanato' ? `<div class="panel pad" style="display:grid;gap:10px"><h3>Califica su gestión</h3><p class="muted" style="font-size:.9rem">Se evalúa cada función del cargo, no a la persona. Es anónimo y solo se publican porcentajes.</p><div><a class="btn primary small" href="#participa/calificar">Ir a la evaluación</a></div></div>` : ''}
      </div>
    </div>
  </section>`;
}

function vCompromisos() {
  const list = DATA.comp.filter(k => filter === 'all' || (filter === 'sigo' ? S.follows.indexOf(k.id) >= 0 : k.status === filter));
  const fb = (k, l) => `<button type="button" class="filter" data-act="filter" data-v="${k}" id="f-${k}" aria-pressed="${filter === k}">${l}</button>`;
  return `<section class="view">
    <div class="section-head"><p class="eyebrow">Responsabilidad</p><h2>Compromisos con evidencia y seguimiento</h2><p>Cada promesa de gestión o demanda aceptada tiene un responsable, un plazo y una prueba de avance. Si no se actualiza, se nota.</p></div>
    <div class="toolbar">${fb('all', 'Todos')}${fb('ok', 'Cumplidos')}${fb('part', 'Atendidos en parte')}${fb('run', 'En curso')}${fb('pend', 'Pendientes')}${fb('sigo', 'Los que sigo · ' + S.follows.length)}</div>
    <div class="grid g2">${list.map(k => {
      const age = dayDiff(k.updated), stale = age > 90 && k.status !== 'ok', mv = S.votes[k.id], fol = S.follows.indexOf(k.id) >= 0;
      return `<article class="panel commit" data-key="compromisos/${k.id}">
        <div class="head"><div style="display:grid;gap:4px;min-width:0"><span class="eyebrow">${k.eje} · ${k.origen}</span><h3>${esc(k.title)}</h3></div>${chip(k.status)}</div>
        <div class="progress" role="img" aria-label="Avance ${k.avance} %"><span style="width:${k.avance}%;background:${STATUS[k.status].color}"></span></div>
        <dl class="facts"><div><dt>Responsable</dt><dd>${k.organo}</dd></div><div><dt>Plazo</dt><dd>${k.due}</dd></div><div><dt>Avance</dt><dd class="mono">${k.avance} %</dd></div><div><dt>Actualizado</dt><dd class="mono" ${stale ? 'style="color:var(--pend);font-weight:800"' : ''}>${fmt(k.updated)}${stale ? ' · hace ' + Math.round(age / 30) + ' meses' : ''}</dd></div></dl>
        <p class="evidence"><b>Evidencia:</b> ${esc(k.evidence)}</p>
        <details class="hist"><summary>Historial (${k.log.length})</summary><ol class="timeline">${k.log.slice().sort((a, b) => b.d - a.d).map(l => `<li><time class="mono">${fmt(l.d)}</time>${esc(l.t)}</li>`).join('')}</ol></details>
        <div class="vote"><span class="muted q">¿El estado refleja lo que ves en la Facultad?</span>
          <button type="button" data-act="vote" data-id="${k.id}" data-v="a" aria-pressed="${mv === 'a'}">Sí · <span class="mono">${k.a}</span></button>
          <button type="button" data-act="vote" data-id="${k.id}" data-v="d" aria-pressed="${mv === 'd'}">No · <span class="mono">${k.d}</span></button></div>
        <div class="actions"><button type="button" class="btn ghost small" data-act="follow" data-id="${k.id}" aria-pressed="${fol}">${ic('bell')} ${fol ? 'Siguiendo' : 'Seguir'}</button><button type="button" class="btn ghost small" data-act="copy" data-v="compromisos/${k.id}">${ic('link')} Copiar enlace</button></div>
        ${S.role === 'autoridad' ? `<form class="admin" data-form="comp" data-id="${k.id}"><label for="cs-${k.id}">Estado<select id="cs-${k.id}">${Object.keys(STATUS).map(s => `<option value="${s}" ${s === k.status ? 'selected' : ''}>${STATUS[s].label}</option>`).join('')}</select></label><label for="ca-${k.id}" style="flex:0 1 90px">Avance %<input type="text" inputmode="numeric" id="ca-${k.id}" value="${k.avance}"></label><label for="cn-${k.id}" style="flex:2 1 220px">Nota para el historial<input type="text" id="cn-${k.id}" placeholder="Qué se hizo y dónde está la evidencia"></label><button class="btn small primary" type="submit">Registrar avance</button></form>` : ''}
      </article>`;
    }).join('') || `<p class="empty">${filter === 'sigo' ? 'Aún no sigues ningún compromiso. Pulsa «Seguir» en el que te interese y aparecerá aquí y en tu panel.' : 'No hay compromisos con ese estado.'}</p>`}</div>
  </section>`;
}

function vInformes() {
  const years = Array.from(new Set(DATA.inf.map(i => i.y).concat([Y]))).sort().reverse();
  const byM = m => DATA.inf.filter(i => i.y === year && i.m === m);
  const fut = m => year > Y || (year === Y && m > today.getMonth());
  const sel = byM(month);
  return `<section class="view">
    <div class="section-head"><p class="eyebrow">Difusión</p><h2>Informes de gestión mes a mes</h2><p>Lo que hizo cada autoridad, con su descripción y su evidencia, en un calendario que no depende de las redes sociales.</p></div>
    <div class="toolbar"><span class="eyebrow" style="margin-right:4px">Año</span>${years.map(y => `<button type="button" class="filter" data-act="year" data-v="${y}" id="y-${y}" aria-pressed="${y === year}">${y}</button>`).join('')}</div>
    <div class="months">${MONTHS.map((n, i) => { const k = byM(i).length, f = fut(i); return `<button type="button" class="month ${f ? 'future' : k ? '' : 'empty'}" data-act="month" data-v="${i}" id="m-${i}" aria-pressed="${i === month}" ${f ? 'disabled' : ''}><b>${n}</b><small>${f ? 'Aún no llega' : k ? `${k} actividad${k > 1 ? 'es' : ''}` : 'Sin informe'}</small></button>`; }).join('')}</div>
    <div class="grid" style="gap:10px"><h3>${MONTHS[month]} ${year}</h3>
      ${sel.length ? `<div class="tablebox"><table><thead><tr><th>Actividad</th><th>Descripción</th><th>Evidencia</th></tr></thead><tbody>${sel.map(i => `<tr><td><b>${esc(i.act)}</b>${i.nuevo ? ' <span class="chip mine">Nuevo</span>' : ''}</td><td>${esc(i.desc)}</td><td><span class="chip plain">${esc(i.ev)}</span></td></tr>`).join('')}</tbody></table></div>` : `<div class="panel pad"><p><b>No se registraron informes este mes.</b> <span class="muted">Un mes sin informe también es información: la plataforma lo deja visible y baja el índice de difusión.</span></p></div>`}
      ${S.role === 'autoridad' && !fut(month) ? `<form class="panel pad stack-form" data-form="informe"><h3>Publicar una actividad de ${MONTHS[month].toLowerCase()}</h3><div class="grid g3"><label for="in-act">Actividad<input type="text" id="in-act" required placeholder="Ej.: Sesión ordinaria del Consejo"></label><label for="in-desc">Descripción<input type="text" id="in-desc" placeholder="Qué se decidió o informó"></label><label for="in-ev">Evidencia<input type="text" id="in-ev" placeholder="Acta, informe, video…"></label></div><div><button class="btn primary small" type="submit">Publicar</button></div></form>` : ''}
    </div>
  </section>`;
}

function vTransparencia() {
  const n = DATA.ley.length, ok = DATA.ley.filter(l => l.s === 'ok').length;
  return `<section class="view">
    <div class="section-head"><p class="eyebrow">Transparencia</p><h2>Lo que la ley obliga a publicar, y si está publicado</h2><p>El artículo 11 de la Ley Universitaria exige publicar esta información de forma permanente y actualizada. Aquí se ve su estado real; lo que falta se puede pedir.</p></div>
    <div class="panel pad" style="display:grid;gap:10px">
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline"><h3>Cumplimiento del art. 11</h3><span class="mono"><b>${ok}</b> de ${n} rubros completos</span></div>
      <div class="meter" role="img" aria-label="${ok} de ${n} rubros completos">${DATA.ley.map(l => `<span style="background:${STATUS[l.s].color}" title="${esc(l.t)}"></span>`).join('')}</div>
    </div>
    <div class="panel law" id="ley">${DATA.ley.map((l, i) => `<div class="row"><span class="n">${String(i + 1).padStart(2, '0')}</span><div style="min-width:0"><b>${l.t}</b><div class="when">${l.w}</div></div><div class="side">${S.role === 'autoridad' ? `<select aria-label="Estado de: ${esc(l.t)}" data-act-change="ley" data-id="${i}" id="ley-${i}" style="width:auto">${Object.keys(LEYLABEL).map(s => `<option value="${s}" ${s === l.s ? 'selected' : ''}>${LEYLABEL[s]}</option>`).join('')}</select>` : `${l.s !== 'ok' ? `<button type="button" class="btn ghost small" data-act="prefill" data-v="${esc(l.t)}">Pedir este dato</button>` : ''}<span class="chip ${STATUS[l.s].cls}">${LEYLABEL[l.s]}</span>`}</div></div>`).join('')}</div>
    <div class="grid g2">
      <div class="panel pad" style="display:grid;gap:14px;align-content:start" data-key="transparencia/solicitar">
        <div><h3>Solicita información</h3><p class="muted" style="font-size:.9rem;margin-top:4px">Si algo no está publicado, pídelo. La Facultad tiene 10 días hábiles para responder (TUO de la Ley N.° 27806).</p></div>
        <form class="stack-form" data-form="saip">
          <label for="saip-tema">¿Qué información necesitas?<input type="text" id="saip-tema" data-focus required placeholder="Ej.: ejecución presupuestal del año"></label>
          <label for="saip-det">Detalle<textarea id="saip-det" placeholder="Periodo, formato o documento específico"></textarea></label>
          <label for="saip-med">Recibir la respuesta por<select id="saip-med"><option>Correo institucional</option><option>Recojo en mesa de partes</option></select></label>
          <div><button class="btn primary" type="submit">Enviar solicitud</button></div>
        </form>
        ${lastReceipt ? `<div class="receipt" role="status"><span class="eyebrow">Cargo de recepción (demostración)</span><b class="mono">${lastReceipt.folio}</b><span>Plazo de respuesta: <b>${fmt(lastReceipt.due)}</b></span><span class="muted" style="font-size:.84rem">La encontrarás en <a href="#mi-panel">tu panel</a> con su cuenta regresiva.</span></div>` : ''}
      </div>
      <div class="panel pad" style="align-content:start;display:grid;gap:6px"><h3>Solicitudes en trámite</h3><p class="muted" style="font-size:.88rem">La demora también se publica: una respuesta tardía deja de ser útil.</p><div style="margin-top:6px">${DATA.solicitudes.map(reqRow).join('')}</div></div>
    </div>
  </section>`;
}
function reqRow(r) {
  const used = Math.max(0, Math.min(100, (10 - r.left) * 10));
  const st = r.answered ? '<span class="chip st-ok">Respondida</span>' : r.left < 0 ? `<span class="chip st-pend">Vencida hace ${-r.left} d. háb.</span>` : `<span class="chip ${r.left <= 3 ? 'st-part' : 'st-run'}">Quedan ${r.left} d. háb.</span>`;
  return `<div class="req"><div style="min-width:0"><b>${esc(r.tema)}</b> ${r.mine ? '<span class="chip mine">Tuya</span>' : ''}<div class="muted mono" style="font-size:.8rem">${r.folio} · enviada ${fmt(r.sent)} · vence ${fmt(r.due)}</div>${r.answered ? '' : `<div class="clock" aria-hidden="true"><span style="width:${used}%;background:${r.left < 0 ? 'var(--pend)' : r.left <= 3 ? 'var(--part)' : 'var(--run)'}"></span></div>`}</div><div style="display:grid;gap:6px;justify-items:end">${st}${S.role === 'autoridad' && !r.answered ? `<button type="button" class="btn small primary" data-act="sol-done" data-v="${r.folio}">Marcar respondida</button>` : ''}</div></div>`;
}

function tracker(d) {
  const s = DSTAT[d.status];
  return `<ol class="track" aria-label="Seguimiento"><li class="done">Recibida</li><li class="${s.heard ? 'done' : 'wait'}">${s.heard ? 'Escuchada' : 'Esperando respuesta'}</li><li class="${s.done === 'yes' ? 'done' : s.done === 'half' ? 'half' : 'wait'}">${s.done === 'yes' ? 'Atendida' : s.done === 'half' ? 'Atendida en parte' : 'Por atender'}</li></ol>`;
}
function demandCard(d) {
  return `<article class="panel demand" data-key="participa/${d.id}">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div style="min-width:0;display:grid;gap:4px"><span class="eyebrow">${esc(d.cat)} · ${fmt(d.date)}${d.mine ? ' · <span style="color:var(--accent-text)">tuya</span>' : ''}</span><h3>${esc(d.title)}</h3></div><button type="button" class="support" data-act="support" data-id="${d.id}" id="sup-${d.id}" aria-pressed="${S.supported.indexOf(d.id) >= 0}" aria-label="Apoyar esta demanda">▲ <span class="mono">${d.apoyos}</span></button></div>
    ${d.text ? `<p class="muted" style="font-size:.9rem">${esc(d.text)}</p>` : ''}
    ${tracker(d)}
    ${d.reply ? `<div class="reply"><b>${esc(d.reply.who)}</b> <span class="muted mono" style="font-size:.78rem">${fmt(d.reply.when)}</span><br>${esc(d.reply.text)}</div>` : ''}
    ${S.role === 'autoridad' ? `<form class="admin" data-form="reply" data-id="${d.id}"><label for="rp-${d.id}" style="flex:2 1 220px">Respuesta pública<input type="text" id="rp-${d.id}" data-focus placeholder="Qué se hará, quién y cuándo" value="${d.reply ? esc(d.reply.text) : ''}"></label><label for="rs-${d.id}">Estado<select id="rs-${d.id}">${['respondida', 'parcial', 'atendida'].map(k => `<option value="${k}" ${k === d.status ? 'selected' : ''}>${DSTAT[k].label}</option>`).join('')}</select></label><button class="btn small primary" type="submit">Publicar</button></form>` : ''}
  </article>`;
}
function vParticipa() {
  const list = DATA.demandas.filter(d => dfilter === 'all' || d.status === dfilter).sort((a, b) => b.apoyos - a.apoyos);
  const fb = (k, l) => `<button type="button" class="filter" data-act="dfilter" data-v="${k}" id="df-${k}" aria-pressed="${dfilter === k}">${l}</button>`;
  const ur = S.rating;
  const rateRows = FUNCIONES.map((f, i) => {
    const b = RATING[i].slice(); if (ur && ur[i] != null) b[ur[i]]++;
    const t = b[0] + b[1] + b[2], p = j => Math.round(b[j] / t * 100), cur = ur ? ur[i] : (drafts['r' + i] != null ? +drafts['r' + i] : null);
    return `<div class="item"><div style="min-width:0"><b style="font-size:.92rem">${f}</b>
      <div class="bars" role="img" aria-label="Bien ${p(0)} %, regular ${p(1)} %, mal ${p(2)} %"><span style="width:${b[0] / t * 100}%;background:var(--ok)"></span><span style="width:${b[1] / t * 100}%;background:var(--part)"></span><span style="width:${b[2] / t * 100}%;background:var(--pend)"></span></div>
      <div class="barlegend mono">Bien ${p(0)} % · Regular ${p(1)} % · Mal ${p(2)} % · n=${t}</div></div>
      <div class="choices" role="radiogroup" aria-label="${f}">${['Bien', 'Regular', 'Mal'].map((l, j) => `<label for="r${i}-${j}"><input type="radio" name="r${i}" id="r${i}-${j}" value="${j}" ${cur === j ? 'checked' : ''} ${ur ? 'disabled' : ''}>${l}</label>`).join('')}</div></div>`;
  }).join('');
  return `<section class="view">
    <div class="section-head"><p class="eyebrow">Participación</p><h2>Ser escuchado y ser tomado en cuenta</h2><p>Plantea una demanda o apoya la de otros. Cada una avanza por tres etapas, como el seguimiento de un envío: recibida, escuchada y atendida.</p></div>
    <div class="grid g2" style="align-items:start">
      <form class="panel pad stack-form" data-form="demanda" data-key="participa/nueva">
        <h3>Nueva demanda</h3>
        <label for="dm-title">Tu demanda en una línea<input type="text" id="dm-title" data-focus required maxlength="110" placeholder="Ej.: Wifi estable en la biblioteca" autocomplete="off"></label>
        <div id="dm-sim" aria-live="polite"></div>
        <label for="dm-cat">Tema<select id="dm-cat"><option>Académico</option><option>Infraestructura</option><option>Trámites</option><option>Bienestar</option><option>Gobierno de la Facultad</option></select></label>
        <label for="dm-text">¿Por qué es importante?<textarea id="dm-text" placeholder="Describe el problema y a quiénes afecta"></textarea></label>
        <div><button class="btn primary" type="submit">Publicar demanda</button></div>
      </form>
      <div class="panel pad" style="display:grid;gap:12px">
        <h3>Cómo leer el seguimiento</h3>
        <div class="legendrow">
          <div><ol class="track"><li class="done">Recibida</li><li class="wait">Esperando respuesta</li><li class="wait">Por atender</li></ol></div>
          <div><ol class="track"><li class="done">Recibida</li><li class="done">Escuchada</li><li class="half">Atendida en parte</li></ol></div>
          <div><ol class="track"><li class="done">Recibida</li><li class="done">Escuchada</li><li class="done">Atendida</li></ol></div>
        </div>
        <p class="muted" style="font-size:.86rem">«Escuchada» significa que la autoridad publicó una respuesta. «Atendida» exige evidencia de la acción. Las demandas con más apoyos pasan a la agenda de la siguiente mesa de diálogo con el Tercio estudiantil.</p>
      </div>
    </div>
    <div class="toolbar">${fb('all', 'Todas')}${fb('recibida', 'Sin respuesta')}${fb('respondida', 'Respondidas')}${fb('parcial', 'Atendidas en parte')}${fb('atendida', 'Atendidas')}</div>
    <div class="grid g2">${list.map(demandCard).join('') || '<p class="empty">No hay demandas en este estado.</p>'}</div>
    <div class="grid" style="gap:12px" data-key="participa/calificar">
      <div class="section-head"><h2>Califica la gestión del Decanato</h2><p>Evalúa cada función que le asigna el Estatuto. Es anónimo y solo se publican los porcentajes.</p></div>
      <form class="panel rating" data-form="rate">${rateRows}
        <div class="item" style="grid-template-columns:1fr"><div>${ur ? '<span class="chip st-ok">Gracias, tu evaluación se sumó a los resultados</span>' : '<button class="btn primary" type="submit">Enviar evaluación</button>'}</div></div>
      </form>
    </div>
  </section>`;
}

function vPanel() {
  if (S.role === 'autoridad') {
    const P = pendientes();
    return `<section class="view">
      <div class="section-head"><p class="eyebrow">Vista de la autoridad</p><h2>Bandeja de rendición de cuentas</h2><p>Lo que espera una respuesta tuya, ordenado por urgencia. Rendir cuentas deja de depender de la presión estudiantil.</p></div>
      <div class="grid g3" id="bandeja">
        <div class="panel stat"><span class="eyebrow">Demandas sin respuesta</span><b class="mono">${P.dem.length}</b></div>
        <div class="panel stat"><span class="eyebrow">Solicitudes por responder</span><b class="mono">${P.sol.length}</b></div>
        <div class="panel stat"><span class="eyebrow">Compromisos sin actualizar</span><b class="mono">${P.comp.length}</b></div>
      </div>
      <div class="grid" style="gap:10px"><h3>Demandas sin respuesta</h3>${P.dem.length ? `<div class="panel inbox">${P.dem.map(d => `<div class="row"><div style="min-width:0"><b>${esc(d.title)}</b><div class="muted" style="font-size:.82rem">${esc(d.cat)} · <span class="mono">${d.apoyos}</span> apoyos · hace ${dayDiff(d.date)} días</div></div><a class="btn small primary" href="#participa/${d.id}">Responder</a></div>`).join('')}</div>` : '<p class="empty">Todas las demandas tienen respuesta. </p>'}</div>
      <div class="grid" style="gap:10px"><h3>Solicitudes de información</h3>${P.sol.length ? `<div class="panel pad">${P.sol.map(reqRow).join('')}</div>` : '<p class="empty">No hay solicitudes pendientes.</p>'}</div>
      <div class="grid" style="gap:10px"><h3>Compromisos sin actualizar hace más de 60 días</h3>${P.comp.length ? `<div class="panel inbox">${P.comp.map(k => `<div class="row"><div style="min-width:0"><b>${esc(k.title)}</b><div class="muted" style="font-size:.82rem">${k.organo} · última actualización ${fmt(k.updated)}</div></div><a class="btn small primary" href="#compromisos/${k.id}">Actualizar</a></div>`).join('')}</div>` : '<p class="empty">Todos los compromisos están al día.</p>'}</div>
      ${P.ley ? `<p class="muted">Además, <b>${P.ley}</b> rubros del artículo 11 siguen sin publicarse. <a href="#transparencia">Revisar</a></p>` : ''}
    </section>`;
  }
  const fol = DATA.comp.filter(k => S.follows.indexOf(k.id) >= 0), dem = DATA.demandas.filter(d => d.mine), sol = DATA.solicitudes.filter(r => r.mine);
  return `<section class="view">
    <div class="section-head"><p class="eyebrow">Tu espacio</p><h2>Mi panel</h2><p>Lo que sigues, lo que pediste y lo que planteaste, en un solo lugar. Se guarda en este navegador.</p></div>
    <div class="grid" style="gap:10px"><h3>Compromisos que sigo</h3>${fol.length ? `<div class="panel pad">${fol.map(k => `<a class="minirow" href="#compromisos/${k.id}"><span>${esc(k.title)}<br><small class="muted mono">actualizado ${fmt(k.updated)}</small></span>${chip(k.status)}</a>`).join('')}</div>` : '<p class="empty">Aún no sigues ningún compromiso. Entra a <a href="#compromisos">Compromisos</a> y pulsa «Seguir» para ver aquí cada cambio.</p>'}</div>
    <div class="grid" style="gap:10px"><h3>Mis demandas</h3>${dem.length ? `<div class="grid g2">${dem.map(demandCard).join('')}</div>` : '<p class="empty">No has planteado demandas. <a href="#participa/nueva">Plantea la primera</a> y sigue aquí si fue escuchada y atendida.</p>'}</div>
    <div class="grid" style="gap:10px"><h3>Mis solicitudes de información</h3>${sol.length ? `<div class="panel pad">${sol.map(reqRow).join('')}</div>` : '<p class="empty">No has pedido información. <a href="#transparencia/solicitar">Haz una solicitud</a> y verás aquí el plazo de respuesta.</p>'}</div>
    <div class="panel pad" style="display:grid;gap:10px"><h3>Preferencias</h3><div class="prefs"><button type="button" class="btn ghost small" data-act="theme">Cambiar tema</button><button type="button" class="btn ghost small" data-act="size">Tamaño del texto</button><button type="button" class="btn ghost small" data-act="tour">${ic('play')} Ver el recorrido</button><button type="button" class="btn ghost small" data-act="reset-ask" id="reset-panel">Restablecer la demostración</button></div></div>
  </section>`;
}

function vPorQue() {
  const rows = [
    ['Responsabilidad', 'Percibida como escasa: hay consejos, comités y mesas de diálogo, pero sin seguimiento ni compromisos claros.', 'Compromisos con responsable, plazo, historial y evidencia. La autoridad recibe una bandeja de pendientes.'],
    ['Difusión', 'Escasa y poco clara: Facebook como canal central, gremios como intermediarios y decisiones comunicadas cuando ya están tomadas.', 'Comunicados en un solo lugar, consultas abiertas antes de decidir e informes mensuales.'],
    ['Transparencia', 'Escasa: la información es difícil de ubicar, llega tarde y obliga a preguntar a compañeros.', 'Buscador único, estado del art. 11 de la Ley 30220 y solicitudes con plazo a la vista.'],
    ['Participación', 'Los estudiantes distinguen entre ser oídos y ser tomados en cuenta.', 'Demandas con seguimiento en tres etapas: recibida, escuchada y atendida.'],
    ['Efectividad', 'La rendición de cuentas es reactiva: aparece cuando hay presión o conflicto.', 'Un índice público que sube o baja según lo que la autoridad hace, no según lo que anuncia.']
  ];
  return `<section class="view">
    <div class="section-head"><p class="eyebrow">Fundamento</p><h2>Por qué existe esta plataforma</h2><p>Es una propuesta de solución derivada de la tesis «Percepción de los estudiantes sobre la rendición de cuentas de las autoridades universitarias de la Facultad de Derecho y Ciencia Política de la UNMSM, Perú, 2024».</p></div>
    <blockquote>«En la Facultad, la rendición de cuentas existe en lo formal, pero no se vive como un proceso sistemático, dialógico y verificable.»</blockquote>
    <div class="panel map">${rows.map(r => `<div class="row"><div style="display:grid;gap:4px"><span class="dimname">${r[0]} · Hallazgo</span><p>${r[1]}</p></div><span class="arrow" aria-hidden="true">→</span><div style="display:grid;gap:4px"><span class="dimname">Respuesta de la plataforma</span><p><b>${r[2]}</b></p></div></div>`).join('')}</div>
    <p class="muted" style="font-size:.88rem;max-width:72ch">Método de la tesis: enfoque cualitativo, diseño fenomenológico-hermenéutico, 10 entrevistas semiestructuradas a estudiantes con cargo de representación y análisis de 5 documentos institucionales. Autor: José Manuel Guzmán Valverde.</p>
  </section>`;
}

const VIEWS = { inicio: vInicio, organos: vOrganos, compromisos: vCompromisos, informes: vInformes, transparencia: vTransparencia, participa: vParticipa, 'mi-panel': vPanel, 'por-que': vPorQue };
const TITLES = { inicio: 'Inicio', organos: 'Órganos de gobierno', compromisos: 'Compromisos', informes: 'Informes de gestión', transparencia: 'Transparencia', participa: 'Participa', 'mi-panel': null, 'por-que': 'Por qué existe' };

function route() { const h = decodeURIComponent((location.hash || '').slice(1)).split('/'); return VIEWS[h[0]] ? { v: h[0], arg: h[1] || null } : { v: 'inicio', arg: null }; }

function chrome(v) {
  const P = S.role === 'autoridad' ? pendientes().total : 0;
  const badge = P ? ' <span class="count" aria-label="' + P + ' pendientes">' + P + '</span>' : '';
  $('#tabs').innerHTML = Object.keys(VIEWS).map(k => `<li><a href="#${k}" ${k === v ? 'aria-current="page"' : ''}>${TITLES[k] || panelName()}${k === 'mi-panel' ? badge : ''}</a></li>`).join('');
  const bn = [['inicio', 'home', 'Inicio'], ['compromisos', 'check', 'Compromisos'], ['participa', 'chat', 'Participa'], ['mi-panel', S.role === 'autoridad' ? 'inbox' : 'user', panelName()]];
  $('#bottomnav').innerHTML = bn.map(b => `<a href="#${b[0]}" ${b[0] === v ? 'aria-current="page"' : ''}>${ic(b[1])}<span>${b[2]}</span>${b[0] === 'mi-panel' && P ? '<span class="count">' + P + '</span>' : ''}</a>`).join('') + `<button type="button" data-act="search">${ic('search')}<span>Buscar</span></button>`;
  $$('.seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.role === S.role)));
  $('#theme-btn').innerHTML = ic(S.theme === 'dark' ? 'moon' : S.theme === 'light' ? 'sun' : 'auto');
  document.title = (TITLES[v] || panelName()) + ' · Cuentas Claras FDCP';
}

function render(keepScroll) {
  const r = route();
  if (r.arg && r.v === 'compromisos') filter = 'all';
  if (r.arg && r.v === 'participa') dfilter = 'all';
  chrome(r.v);
  const active = document.activeElement && document.activeElement.id;
  $('#app').innerHTML = VIEWS[r.v](r.arg);
  Object.keys(drafts).forEach(id => { const el = document.getElementById(id); if (el && el.type !== 'radio') el.value = drafts[id]; });
  if (pendingPrefill) { const el = $('#saip-tema'); if (el) { el.value = pendingPrefill; drafts['saip-tema'] = pendingPrefill; } pendingPrefill = null; }
  simil();
  if (keepScroll) { if (active) { const el = document.getElementById(active); if (el && el.closest('#app')) try { el.focus({ preventScroll: true }); } catch (e) {} } }
  else {
    window.scrollTo({ top: 0 });
    if (r.arg) {
      const el = $('[data-key="' + r.v + '/' + r.arg + '"]');
      if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); const f = $('[data-focus]', el); if (f && !tour) try { f.focus({ preventScroll: true }); } catch (e) {} }
    }
  }
  if (tour) tourPaint();
}

/* Cambia datos, guarda y avisa si el índice se movió. */
function commit(fn, msg) {
  const before = indice().total; fn(); save(); build(); render(true);
  const after = indice().total;
  toast(after !== before ? (msg ? msg + ' · ' : '') + 'El índice ' + (after > before ? 'subió' : 'bajó') + ' de ' + before + ' a ' + after : msg);
}

/* Sugerir demandas parecidas mientras se escribe, para no duplicar. */
function simil() {
  const box = $('#dm-sim'), inp = $('#dm-title'); if (!box || !inp) return;
  const words = norm(inp.value).split(/[^a-z0-9ñ]+/).filter(w => w.length > 3);
  const hits = words.length ? DATA.demandas.map(d => ({ d, n: words.filter(w => norm(d.title + ' ' + d.text).indexOf(w) >= 0).length })).filter(x => x.n).sort((a, b) => b.n - a.n || b.d.apoyos - a.d.apoyos).slice(0, 3) : [];
  box.innerHTML = hits.length ? `<div class="similar"><b>¿Es alguna de estas? Apoyarla suma más que duplicarla.</b>${hits.map(x => `<a href="#participa/${x.d.id}">${esc(x.d.title)} · ▲ ${x.d.apoyos}</a>`).join('')}</div>` : '';
}

/* ---------- buscador ---------- */
let palItems = [], palSel = 0;
function searchIndex() {
  const it = [];
  Object.keys(VIEWS).forEach(k => it.push({ g: 'Secciones', t: TITLES[k] || panelName(), s: '', h: '#' + k }));
  [['Plantear una demanda', '#participa/nueva'], ['Pedir información a la Facultad', '#transparencia/solicitar'], ['Calificar la gestión del Decanato', '#participa/calificar']].forEach(a => it.push({ g: 'Acciones', t: a[0], s: '', h: a[1] }));
  DATA.comp.forEach(k => it.push({ g: 'Compromisos', t: k.title, s: STATUS[k.status].label + ' · ' + k.organo + ' · ' + k.evidence, h: '#compromisos/' + k.id }));
  DATA.demandas.forEach(d => it.push({ g: 'Demandas estudiantiles', t: d.title, s: DSTAT[d.status].label + ' · ' + d.apoyos + ' apoyos · ' + d.text, h: '#participa/' + d.id }));
  DATA.inf.forEach(i => it.push({ g: 'Informes y actas', t: i.act, s: MONTHS[i.m] + ' ' + i.y + ' · ' + i.desc + ' · ' + i.ev, h: '#informes', y: i.y, m: i.m }));
  DATA.ley.forEach(l => it.push({ g: 'Información del art. 11', t: l.t, s: LEYLABEL[l.s] + ' · ' + l.w, h: '#transparencia' }));
  DATA.comunicados.forEach(c => it.push({ g: 'Comunicados', t: c.title, s: c.label + ' · ' + c.text, h: c.href }));
  ORGANOS.forEach(o => it.push({ g: 'Órganos de gobierno', t: o.name, s: o.kind + ' · ' + o.desc, h: '#organos/' + o.id }));
  return it;
}
function hl(text, toks) {
  let out = esc(text);
  toks.forEach(t => { if (t.length < 2) return; const n = norm(out); let i = n.indexOf(t); if (i >= 0 && out.length === n.length) out = out.slice(0, i) + '<mark>' + out.slice(i, i + t.length) + '</mark>' + out.slice(i + t.length); });
  return out;
}
function palRender() {
  const q = norm($('#pal-input').value.trim()), toks = q.split(/\s+/).filter(Boolean);
  const all = searchIndex();
  palItems = toks.length ? all.filter(i => { const n = norm(i.t + ' ' + i.s + ' ' + i.g); return toks.every(t => n.indexOf(t) >= 0); }).slice(0, 24) : all.filter(i => i.g === 'Secciones' || i.g === 'Acciones');
  if (palSel >= palItems.length) palSel = 0;
  let g = '', html = '';
  palItems.forEach((i, n) => {
    if (i.g !== g) { g = i.g; html += '<div class="pal-group">' + g + '</div>'; }
    html += `<a class="pal-item" role="option" href="${i.h}" data-act="pal-go" data-n="${n}" id="pal-${n}" aria-selected="${n === palSel}"><span style="min-width:0"><span>${hl(i.t, toks)}</span>${i.s ? '<small>' + hl(i.s, toks) + '</small>' : ''}</span><span class="muted" aria-hidden="true">↵</span></a>`;
  });
  $('#pal-list').innerHTML = html || '<p class="empty" style="margin:10px">Nada coincide con «' + esc($('#pal-input').value) + '». Si la información debería existir, <a href="#transparencia/solicitar" data-act="pal-ask">pídela aquí</a>.</p>';
}
function palOpen() { const d = $('#palette'); if (d.open) return; $('#pal-input').value = ''; palSel = 0; palRender(); if (d.showModal) d.showModal(); else d.setAttribute('open', ''); $('#pal-input').focus(); }
function palClose() { const d = $('#palette'); if (d.open) d.close ? d.close() : d.removeAttribute('open'); }
function palGo(n) { const i = palItems[n]; if (!i) return; if (i.y != null) { year = i.y; month = i.m; } palClose(); if (location.hash === i.h) render(); else location.hash = i.h; }

/* ---------- recorrido guiado ---------- */
let tour = null;
const STEPS = [
  { h: '#inicio', sel: '#indice', t: 'Un índice que resume todo', p: 'Las cuatro dimensiones de la tesis en un solo número. Se recalcula cada vez que la autoridad cumple, publica o responde.' },
  { h: '#compromisos', sel: '[data-key="compromisos/2"]', t: 'Promesas con evidencia', p: 'Cada compromiso tiene responsable, plazo, historial y prueba. El estudiante puede seguirlo y decir si el estado es real.' },
  { h: '#transparencia', sel: '#ley', t: 'La ley como lista de control', p: 'Los 10 rubros del artículo 11 con su estado. Lo que falta se pide con un clic y el plazo de 10 días hábiles queda a la vista.' },
  { h: '#participa', sel: '[data-key="participa/3"]', t: 'Escuchada no es lo mismo que atendida', p: 'Cada demanda avanza por tres etapas, como el seguimiento de un envío. Es el hallazgo central de la tesis convertido en interfaz.' },
  { h: '#mi-panel', role: 'autoridad', sel: '#bandeja', t: 'La autoridad recibe una bandeja', p: 'Demandas sin respuesta, solicitudes por vencer y compromisos sin actualizar. Rendir cuentas deja de depender de la presión.' },
  { h: '#inicio', role: 'estudiante', sel: null, t: 'Pruébalo en tu celular', p: 'Escanea el código para abrir el prototipo. Todo lo que hagas se guarda solo en tu dispositivo.', qr: true }
];
function tourGo(i) {
  if (i < 0) return; if (i >= STEPS.length) return tourEnd();
  tour.i = i; const st = STEPS[i];
  if (st.role && st.role !== S.role) S.role = st.role;
  if (location.hash !== st.h) location.hash = st.h; else render();
}
function tourPaint() {
  const st = STEPS[tour.i], box = $('#tour');
  $$('.spot').forEach(e => e.classList.remove('spot'));
  box.hidden = false; document.body.classList.add('touring');
  box.innerHTML = `<span class="steps">Paso ${tour.i + 1} de ${STEPS.length}</span>${st.qr ? `<div class="qr"><div id="tour-qr"></div><div><h3>${st.t}</h3><p>${st.p}</p></div></div>` : `<h3>${st.t}</h3><p>${st.p}</p>`}
    <div class="row"><button type="button" class="btn ghost small" data-act="tour-end">Salir</button><span style="display:flex;gap:8px">${tour.i ? '<button type="button" class="btn ghost small" data-act="tour-prev">Anterior</button>' : ''}<button type="button" class="btn primary small" data-act="${tour.i === STEPS.length - 1 ? 'tour-end' : 'tour-next'}" id="tour-next">${tour.i === STEPS.length - 1 ? 'Terminar' : 'Siguiente'}</button></span></div>`;
  if (st.sel) { const el = $(st.sel); if (el) { el.classList.add('spot'); el.scrollIntoView({ block: 'center' }); } } else window.scrollTo({ top: 0 });
  if (st.qr) qr($('#tour-qr'));
  const nx = $('#tour-next'); if (nx) try { nx.focus({ preventScroll: true }); } catch (e) {}
}
function tourEnd() {
  if (!tour) return; const prev = tour.role; tour = null;
  $('#tour').hidden = true; document.body.classList.remove('touring'); $$('.spot').forEach(e => e.classList.remove('spot'));
  S.role = prev; S.tour = true; save(); render(true);
}
function qr(box) {
  const url = location.origin + location.pathname;
  const draw = () => { try { const q = window.qrcode(0, 'M'); q.addData(url); q.make(); box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { box.textContent = ''; } };
  if (window.qrcode) return draw();
  const s = document.createElement('script'); s.src = '../assets/qrcode.js'; s.onload = draw; document.head.appendChild(s);
}

/* ---------- eventos ---------- */
function applyPrefs() {
  const r = document.documentElement;
  if (S.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.theme);
  if (S.size) r.setAttribute('data-size', S.size); else r.removeAttribute('data-size');
}
let resetArmed = 0;
const ACT = {
  search: palOpen, 'pal-close': palClose,
  'pal-go': (t, e) => { e.preventDefault(); palGo(+t.dataset.n); },
  'pal-ask': () => { pendingPrefill = $('#pal-input').value.trim(); palClose(); },
  role: t => { S.role = t.dataset.role; save(); render(true); toast(S.role === 'autoridad' ? 'Vista de autoridad: responde demandas, actualiza compromisos y publica informes' : 'Vista de estudiante'); },
  theme: () => { S.theme = { auto: 'light', light: 'dark', dark: 'auto' }[S.theme]; applyPrefs(); save(); render(true); toast('Tema: ' + { auto: 'según tu dispositivo', light: 'claro', dark: 'oscuro' }[S.theme]); },
  size: () => { S.size = (S.size + 1) % 3; applyPrefs(); save(); toast('Texto: ' + ['normal', 'grande', 'muy grande'][S.size]); },
  filter: t => { filter = t.dataset.v; render(true); },
  dfilter: t => { dfilter = t.dataset.v; render(true); },
  year: t => { year = +t.dataset.v; const ms = DATA.inf.filter(i => i.y === year).map(i => i.m); month = year === Y ? today.getMonth() : ms.length ? Math.max.apply(null, ms) : 0; render(true); },
  month: t => { month = +t.dataset.v; render(true); },
  vote: t => { const id = +t.dataset.id, v = t.dataset.v; if (S.votes[id] === v) delete S.votes[id]; else S.votes[id] = v; save(); build(); render(true); },
  follow: t => { const id = +t.dataset.id, i = S.follows.indexOf(id); if (i >= 0) S.follows.splice(i, 1); else S.follows.push(id); save(); render(true); toast(i >= 0 ? 'Dejaste de seguir este compromiso' : 'Lo sigues: sus cambios aparecerán en tu panel'); },
  support: t => { const id = +t.dataset.id, i = S.supported.indexOf(id); if (i >= 0) S.supported.splice(i, 1); else S.supported.push(id); save(); build(); render(true); },
  copy: t => { const url = location.origin + location.pathname + '#' + t.dataset.v; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('Enlace copiado'), () => toast(url)); },
  prefill: t => { pendingPrefill = t.dataset.v; if (location.hash === '#transparencia/solicitar') render(); else location.hash = '#transparencia/solicitar'; },
  'sol-done': t => commit(() => { S.solDone[t.dataset.v] = true; }, 'Solicitud respondida'),
  tour: () => { tour = { i: 0, role: S.role }; tourGo(0); },
  'tour-next': () => tourGo(tour.i + 1), 'tour-prev': () => tourGo(tour.i - 1), 'tour-end': tourEnd,
  'reset-ask': t => {
    if (Date.now() - resetArmed < 5000) { resetArmed = 0; const keep = { theme: S.theme, size: S.size }; S = Object.assign(DEF(), keep); Object.keys(drafts).forEach(k => delete drafts[k]); lastReceipt = null; filter = dfilter = 'all'; save(); build(); render(); toast('Demostración restablecida'); }
    else { resetArmed = Date.now(); toast('Se borrará lo que hiciste aquí. Pulsa otra vez para confirmar'); }
  }
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) { if (e.target.id === 'palette') palClose(); return; }
  const f = ACT[t.dataset.act]; if (f) f(t, e);
});
document.addEventListener('input', e => {
  const el = e.target; if (!el.id || !el.closest('#app')) return;
  if (el.type === 'radio') drafts[el.name] = el.value; else drafts[el.id] = el.value;
  if (el.id === 'dm-title') simil();
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset && el.dataset.actChange === 'ley') { delete drafts[el.id]; commit(() => { S.ley[el.dataset.id] = el.value; }, 'Rubro actualizado'); }
});
$('#pal-input').addEventListener('input', () => { palSel = 0; palRender(); });
$('#pal-input').addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!palItems.length) return; palSel = (palSel + (e.key === 'ArrowDown' ? 1 : palItems.length - 1)) % palItems.length; palRender(); const el = $('#pal-' + palSel); if (el) el.scrollIntoView({ block: 'nearest' }); }
  else if (e.key === 'Enter') { e.preventDefault(); palGo(palSel); }
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palOpen(); return; }
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if (e.key === '/' && !typing) { e.preventDefault(); palOpen(); }
  if (e.key === 'Escape' && tour && !$('#palette').open) tourEnd();
  if (tour && !typing && !$('#palette').open) { if (e.key === 'ArrowRight') tourGo(tour.i + 1); if (e.key === 'ArrowLeft') tourGo(tour.i - 1); }
});
document.addEventListener('submit', e => {
  const f = e.target, kind = f.dataset.form; if (!kind) return; e.preventDefault();
  const clear = ids => ids.forEach(i => delete drafts[i]);
  if (kind === 'saip') {
    const tema = $('#saip-tema').value.trim(); if (!tema) return;
    const folio = 'SAIP-' + Y + '-0' + (135 + S.solicitudes.length);
    S.solicitudes.unshift({ folio, tema, sent: today.toISOString() }); lastReceipt = { folio, due: addBusinessDays(today, 10) };
    clear(['saip-tema', 'saip-det', 'saip-med']); save(); build(); render(true); toast('Solicitud registrada con folio ' + folio);
  } else if (kind === 'demanda') {
    const title = $('#dm-title').value.trim(); if (!title) return;
    const id = Date.now();
    const d = { id, cat: $('#dm-cat').value, title, text: $('#dm-text').value.trim(), date: today.toISOString() };
    clear(['dm-title', 'dm-cat', 'dm-text']); dfilter = 'all';
    commit(() => { S.demandas.push(d); }, 'Demanda publicada');
    const el = $('[data-key="participa/' + id + '"]'); if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); }
  } else if (kind === 'reply') {
    const id = +f.dataset.id, txt = $('#rp-' + id).value.trim(); if (!txt) { toast('Escribe la respuesta pública antes de publicar'); return; }
    const status = $('#rs-' + id).value; clear(['rp-' + id, 'rs-' + id]);
    commit(() => { S.replies[id] = { who: 'Decanato', when: today.toISOString(), text: txt, status }; }, 'Respuesta publicada');
  } else if (kind === 'comp') {
    const id = +f.dataset.id, status = $('#cs-' + id).value, nota = $('#cn-' + id).value.trim();
    let av = parseInt($('#ca-' + id).value, 10); if (isNaN(av)) av = 0; av = Math.max(0, Math.min(100, av)); if (status === 'ok') av = 100;
    const prev = S.comp[id] || { log: [] };
    clear(['cs-' + id, 'ca-' + id, 'cn-' + id]);
    commit(() => { S.comp[id] = { status, avance: av, updated: today.toISOString(), log: prev.log.concat([{ d: today.toISOString(), t: nota || 'Estado actualizado a «' + STATUS[status].label + '» (' + av + ' %).' }]) }; }, 'Avance registrado');
  } else if (kind === 'informe') {
    const act = $('#in-act').value.trim(); if (!act) return;
    const it = { y: year, m: month, act, desc: $('#in-desc').value.trim() || 'Sin descripción', ev: $('#in-ev').value.trim() || 'Por adjuntar' };
    clear(['in-act', 'in-desc', 'in-ev']);
    commit(() => { S.informes.push(it); }, 'Actividad publicada');
  } else if (kind === 'rate') {
    const r = FUNCIONES.map((_, i) => { const c = f.querySelector('input[name="r' + i + '"]:checked'); return c ? +c.value : null; });
    if (r.every(x => x === null)) { toast('Marca al menos una función para enviar'); return; }
    S.rating = r; FUNCIONES.forEach((_, i) => delete drafts['r' + i]); save(); render(true); toast('Evaluación enviada de forma anónima');
  }
});
window.addEventListener('hashchange', () => render());
$('#palette').addEventListener('close', () => {});

applyPrefs(); build(); render();
})();
