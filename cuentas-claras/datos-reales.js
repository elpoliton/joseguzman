/* datos-reales.js — información pública verificada en el portal oficial de la Facultad (derecho2.unmsm.edu.pe).
   Revisado el 22 de noviembre de 2026. Solo enlaza a los documentos oficiales: no copia su contenido.
   Todo lo demás de Cuentas Claras sigue siendo un prototipo con datos de ejemplo. */
window.CC_REAL = (function () {
  'use strict';
  var B = 'https://derecho2.unmsm.edu.pe/';
  var T26 = B + '2026/transparencia/', T25 = B + 'dtransparencia/2025/', T24 = B + 'dtransparencia/2024/';
  var TR = 'TRANSCRIPCION%20SESION%20CONSEJO%20DE%20FACULTAD%20DEL%20';
  var A = function (d, u, tipo, nota) { return { d: d, u: u, tipo: tipo || 'acta', nota: nota || '' }; };
  var actas = [
    // 2026 — actas
    A('2026-09-16', T26 + 'ACTA%20DEL%20CONSEJO%20DE%20FACULTAD%20DEL%2016%20DE%20SETIEMBRE%20F%20%20F%20.pdf'),
    A('2026-08-28', T26 + 'ACTA%20DEL%20CONSEJO%20DE%20FACULTAD%20DE%2028%20DE%20AGOSTO%20F%20%20F%20.pdf'),
    A('2026-08-13', T26 + 'ACTA%20DEL%20CONSEJO%20DE%20FACULTAD%20DE%2013%20DE%20AGOSTO%20F%20.pdf'),
    A('2026-07-31', T26 + 'ACTA%20DEL%20CONSEJO%20DE%20FACULTAD%20DE%2031%20DE%20JULIO%20F%20.pdf'),
    A('2026-07-06', T26 + 'ACTA%20DEL%20CONSEJO%20DE%20FACULTAD%20DE%2006%20DE%20JULIO.docx%20F%20%20F%20.pdf'),
    A('2026-06-02', T26 + 'ACTA%20DEL%20CONSEJO%20DE%20FACULTAD%20DE%2002%20DE%20JUNIO%20F%20%20F%20.pdf'),
    A('2026-05-11', T26 + 'ACTA%20DEL%20CONSEJO%20DE%20FACULTAD%20DEL11%20DE%20MAYO%20F%20%20F%20.pdf'),
    A('2026-04-17', T26 + 'ACTA%20DEL%20CONSEJO%20DE%20FACULTAD%20DEL17%20DE%20ABRIL%20F%20%20F%20.pdf'),
    A('2026-04-13', T26 + 'ACTA%20DEL%20CONSEJO%20DE%20FACULTAD%20DEL%2013%20DE%20ABRIL.docx%20F%20%20F%20.pdf'),
    A('2026-04-10', T26 + 'ACTA%20DEL%20CONSEJO%20DE%20FACULTAD%20DEL%2010%20DE%20ABRIL.docx%20F%20%20F%20.pdf'),
    A('2026-03-23', T26 + 'ACTA%20CONSEJO%20FACULTAD%20DEL%2023%20DE%20MARZO_c%20F%20%20F%20.pdf'),
    A('2026-03-16', T26 + 'ACTA%20CONSEJO%20FACULTAD%20DEL%2016%20DE%20MARZO_c%20F%20%20F%20.pdf'),
    A('2026-02-26', T26 + 'ACTA%20CONSEJO%20DE%20FACULTAD%20DEL%2026%20de%20febrero_c%20F%20%20F%20.pdf'),
    A('2026-02-10', T26 + 'ACTA%20CONSEJO%20FACULTAD%20DEL%2010%20DE%20FEBRERO_c%20F%20%20F%20.pdf'),
    A('2026-01-29', T26 + 'ACTA%20CONSEJO%20FACULTAD%20DEL%2029%20DE%20ENERO_c%20F%20%20F%20.pdf'),
    A('2026-01-26', T26 + 'ACTA%20CONSEJO%20FACULTAD%20DEL%2026%20DE%20ENERO_c%20F%20%20F%20.pdf'),
    // 2025 — actas
    A('2025-12-29', T26 + 'ACTA%20CONSEJO%20FACULTAD%20DEL%2029%20DE%20DICIEMBRE.docx%20F%20%20F%20.pdf'),
    A('2025-12-16', T26 + 'ACTA%20CONSEJO%20FACULTAD%20DEL%2016%20DE%20DICIEMBRE.docx%20F%20%20F%20.pdf'),
    A('2025-12-04', T26 + 'ACTA%20CONSEJO%20FACULTAD%20DEL%2004%20DE%20DICIEMBRE.docx%20F%20F%20.pdf'),
    A('2025-11-20', T25 + 'ACTA%20CONSEJO%20DE%20FACULTAD%20DEL%2020%20DE%20NOVIEMBRE%20F%20%20F%20.pdf'),
    A('2025-10-21', T25 + 'ACTA%2021%20DE%20OCTUBRE%20DE%202025%20F%20.pdf'),
    A('2025-10-17', T25 + 'ACTA%2023%20DE%20SEPTIEMBRE%20DE%202025%20F%20.pdf', 'acta', 'El enlace del portal abre el acta del 23 de setiembre.'),
    A('2025-09-23', T25 + 'ACTA%2023%20DE%20SEPTIEMBRE%20DE%202025%20F%20.pdf'),
    // 2025 — transcripciones
    A('2025-09-05', T25 + TR + '5%20DE%20SETIEMBRE%20DEL%202025%20F%20%20F%20.pdf', 'transcripción'),
    A('2025-09-03', T25 + TR + '3%20DE%20SETIEMBRE%20DEL%202025%20F%20%20%201%20%20F%20.pdf', 'transcripción'),
    A('2025-08-08', T25 + TR + '8%20DE%20AGOSTO%20DEL%202025%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2025-08-01', T25 + TR + '1%20DE%20AGOSTO%20DEL%202025%20F%20%20F%20.pdf', 'transcripción'),
    A('2025-07-17', T25 + TR + '17%20DE%20JULIO%20DEL%202025%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2025-06-03', T25 + TR + '03%20DE%20JUNIO%20DEL%202025%20Copy-firmada%20F%20.pdf', 'transcripción'),
    A('2025-04-14', T25 + TR + '14%20DE%20ABRIL%20DEL%202025%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2025-03-25', T25 + TR + '25%20DE%20MARZO%20DEL%202025%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2025-03-17', T25 + TR + '17%20DE%20MARZO%20DEL%202025%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2025-03-05', T25 + TR + '05%20DE%20MARZO%20DEL%202025%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2025-02-19', T25 + TR + '19%20DE%20FEBRERO%20DEL%202025%20Copy%20F%20%20%201%20%20F%20.pdf', 'transcripción'),
    A('2025-01-23', T25 + TR + '23%20DE%20ENERO%20DEL%202025%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2025-01-03', T25 + TR + '3%20DE%20ENERO%20DEL%202025%20Copy%20F%20%20%201%20%20F%20.pdf', 'transcripción'),
    // 2024 — transcripciones (periodo de la tesis)
    A('2024-12-12', T25 + TR + '12%20DE%20DICIEMBRE%20DEL%202024%20Copy%20F%20%20%201%20%20F%20.pdf', 'transcripción'),
    A('2024-12-10', T25 + TR + '10%20DE%20DICIEMBRE%20DEL%202024%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2024-10-17', T24 + TR + '17%20DE%20OCTUBRE%20DEL%202024%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2024-09-05', T24 + TR + '05%20DE%20SETIEMBRE%20DEL%202024%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2024-08-22', T24 + TR + '22%20DE%20AGOSTO%20DEL%202024%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2024-08-14', T24 + TR + '14%20DE%20AGOSTO%20DEL%202024%20Copy%20F%20%20F%20.pdf', 'transcripción'),
    A('2024-06-28', T24 + TR + '28%20DE%20JUNIO%20DEL%202024%20%20F%20.pdf', 'transcripción'),
    A('2024-06-13', T24 + TR + '13%20DE%20JUNIO%20DEL%202024%20%20F%20.pdf', 'transcripción'),
    A('2024-04-11', T24 + TR + '11%20DE%20ABRIL%202024%20F%20%20F%20.pdf', 'transcripción'),
    A('2024-04-08', T24 + TR + '08%20DE%20ABRIL%202024%20F%20%20F%20.pdf', 'transcripción'),
    A('2024-03-11', T24 + '3%20' + TR + '11%20DE%20MARZO%202024%20Copy%20F%20%20F%20%20Copy.pdf', 'transcripción'),
    A('2024-02-29', T24 + '2.2%20' + TR + '29%20DE%20FEBRERO%202024%20Copy%20F%20%20F%20%20Copy.pdf', 'transcripción'),
    A('2024-02-16', T24 + '2.1%20' + TR + '16%20DE%20FEBRERO%202024%20Copy%20F%20%20F%20%20Copy.pdf', 'transcripción'),
    A('2024-02-07', T24 + '2%20' + TR + '07%20DE%20FEBRERO%202024%20Copy%20F%20%20F%20%20Copy.pdf', 'transcripción'),
    A('2024-01-18', T24 + '1%20' + TR + '18%20DE%20ENERO%202024%20Copy%20F%20%20F%20%20Copy.pdf', 'transcripción'),
    A('2024-01-09', T24 + TR + '09%20DE%20ENERO%202024%20F%20%20F%20.pdf', 'transcripción')
  ];
  // años anteriores: solo el conteo de documentos publicados en el portal
  var anteriores = { 2019: 12, 2020: 1, 2021: 7, 2022: 13, 2023: 12 };
  return {
    revisado: '2026-11-22',
    fuente: B + 'transparencianuevo.html',
    actas: actas,
    anteriores: anteriores,
    economia: [
      { t: 'Acta de conciliación de ingresos (2021-2025)', u: B + '2026/transparencia/economia/ingresos%202021-2025.pdf' },
      { t: 'Acta de conciliación de egresos (2021-2025)', u: B + '2026/transparencia/economia/egresos%202021-2025.pdf' }
    ],
    canales: [
      { t: 'Transparencia de la Facultad', s: 'Actas, documentos económicos y unidades', u: B + 'transparencianuevo.html', i: 'eye' },
      { t: 'Portal de transparencia UNMSM', s: 'Presupuesto, personal y contrataciones (Ley 27806)', u: 'https://unmsm.edu.pe/la-universidad/transparencia-universitaria', i: 'doc' },
      { t: 'Trámites en línea (MAT)', s: 'Mesa de partes virtual de la universidad', u: 'https://tramiteonline.unmsm.edu.pe/sgdfd/mat/', i: 'inbox' },
      { t: 'Buzón de sugerencias', s: 'Canal oficial de la Facultad', u: B + 'contactanos.html#sugerencias', i: 'chat' },
      { t: 'Libro de reclamaciones', s: 'Plataforma del Estado (gob.pe)', u: 'https://reclamos.servicios.gob.pe/?institution_id=278', i: 'bell' },
      { t: 'Calidad y acreditación', s: 'Certificaciones ISO 9001 e ISO 21001', u: B + 'about.html#certificaciones', i: 'check' }
    ],
    // Estatuto UNMSM, art. 57 (texto publicado en el portal de la Facultad)
    consejo: [
      { g: 'Decano/a', n: 1, voto: true, nota: 'Lo preside' },
      { g: 'Docentes', n: 6, voto: true, nota: '3 principales, 2 asociados, 1 auxiliar' },
      { g: 'Estudiantes (tercio)', n: 4, voto: true, nota: 'Pregrado y posgrado: un tercio del total' },
      { g: 'Graduados', n: 1, voto: true, nota: 'Con voz y voto' },
      { g: 'Vicedecanos, director administrativo y directores de escuela', n: 5, voto: false, nota: 'Con voz, sin voto' },
      { g: 'Gremios y centros de estudiantes', n: 4, voto: false, nota: 'Docentes, trabajadores, Centro Federado y centros de estudiantes: voz sin voto' }
    ]
  };
})();
