/* libro-xlsx.js — arma un Excel (.xlsx) con el Formato 5.1 «Libro diario», una hoja por ejercicio. Sin dependencias.
   window.LibroXLSX(libros, nombreArchivo)
   libros: [{ hoja, empresa, ruc, periodo, enunciado, asientos: [{ fecha, glosa, doc, lineas: [{ cuenta, detalle, debe, haber }] }] }] */
(function () {
  'use strict';
  // ---------- zip sin compresión
  var T = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc(u) { var c = 0xFFFFFFFF; for (var i = 0; i < u.length; i++) c = T[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {
    var enc = new TextEncoder(), parts = [], cen = [], off = 0;
    files.forEach(function (f) {
      var nm = enc.encode(f.name), d = enc.encode(f.data), c = crc(d);
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(12, 33, true);
      h.setUint32(14, c, true); h.setUint32(18, d.length, true); h.setUint32(22, d.length, true); h.setUint16(26, nm.length, true);
      parts.push(h, nm, d);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(14, 33, true);
      ch.setUint32(16, c, true); ch.setUint32(20, d.length, true); ch.setUint32(24, d.length, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
      cen.push(ch, nm); off += 30 + nm.length + d.length;
    });
    var cs = 0; cen.forEach(function (x) { cs += x.byteLength; });
    var e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
    return new Blob(parts.concat(cen, [e]), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // ---------- xml
  var x = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var COLS = 'ABCDEFGHIJ';
  var MONEY = '_ "S/."\\ * #,##0.00_ ;_ "S/."\\ * \\-#,##0.00_ ;_ "S/."\\ * "-"??_ ;_ @_ ';
  var STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<numFmts count="2"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/><numFmt numFmtId="165" formatCode="' + x(MONEY) + '"/></numFmts>' +
    '<fonts count="4"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="16"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font><font><b/><sz val="9"/><name val="Arial"/></font></fonts>' +
    '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF2F2F2"/><bgColor indexed="64"/></patternFill></fill></fills>' +
    '<borders count="3"><border><left/><right/><top/><bottom/><diagonal/></border>' +
    '<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right><top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border>' +
    '<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right><top style="medium"><color auto="1"/></top><bottom style="medium"><color auto="1"/></bottom><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="15">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +                                                                                         // 0
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +                                                                             // 1 título
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +                                                                             // 2 etiqueta
    '<xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' + // 3 encabezado
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' + // 4 centrado
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>' +   // 5 glosa
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' + // 6 fecha
    '<xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>' +        // 7 monto
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' + // 8 cuenta
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>' +   // 9 denominación
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="3" wrapText="1"/></xf>' + // 10 denominación (haber)
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>' + // 11 TOTALES
    '<xf numFmtId="165" fontId="2" fillId="0" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>' + // 12 total
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="left" vertical="top" wrapText="1"/></xf>' +                  // 13 enunciado
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="2" xfId="0" applyBorder="1"/>' +                                                                            // 14 fila de totales
    '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

  function serial(f) { // 'dd/mm/yy' o 'dd/mm/yyyy' → número de fecha de Excel; si no se puede, null
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(String(f || '').trim()); if (!m) return null;
    var y = +m[3]; if (y < 100) y += 2000;
    return Date.UTC(y, +m[2] - 1, +m[1]) / 864e5 + 25569;
  }

  function hoja(L) {
    var rows = {}, merges = [], alto = {};
    function put(r, c, xml) { (rows[r] = rows[r] || {})[c] = xml; }
    function s(r, c, st, v) { put(r, c, '<c r="' + COLS[c] + r + '" s="' + st + '" t="inlineStr"><is><t xml:space="preserve">' + x(v) + '</t></is></c>'); }
    function n(r, c, st, v) { put(r, c, '<c r="' + COLS[c] + r + '" s="' + st + '"><v>' + v + '</v></c>'); }
    function e(r, c, st) { put(r, c, '<c r="' + COLS[c] + r + '" s="' + st + '"/>'); }
    function f(r, c, st, fx, v) { put(r, c, '<c r="' + COLS[c] + r + '" s="' + st + '"><f>' + fx + '</f><v>' + v + '</v></c>'); }
    function mg(a, b) { merges.push(a + ':' + b); }

    s(1, 0, 1, 'FORMATO 5.1: "LIBRO DIARIO"');
    s(3, 0, 2, 'PERIODO: ' + (L.periodo || '').toUpperCase());
    s(4, 0, 2, 'RUC: ' + (L.ruc || ''));
    s(5, 0, 2, 'APELLIDOS Y NOMBRES, DENOMINACIÓN O RAZÓN SOCIAL: ' + (L.empresa || '').toUpperCase());
    for (var r0 = 7; r0 <= 9; r0++) for (var c0 = 0; c0 < 10; c0++) e(r0, c0, 3);
    [['A', 'NÚMERO CORRELATIVO DEL ASIENTO O CÓDIGO ÚNICO DE LA OPERACIÓN'], ['B', 'FECHA DE LA OPERACIÓN'], ['C', 'GLOSA O DESCRIPCIÓN DE LA OPERACIÓN']].forEach(function (h) { s(7, COLS.indexOf(h[0]), 3, h[1]); mg(h[0] + '7', h[0] + '9'); });
    s(7, 3, 3, 'REFERENCIA DE LA OPERACIÓN'); mg('D7', 'F7');
    s(7, 6, 3, 'CUENTA CONTABLE ASOCIADA A LA OPERACIÓN'); mg('G7', 'H7');
    s(7, 8, 3, 'MOVIMIENTO'); mg('I7', 'J7');
    [['D', 'CÓDIGO DEL LIBRO O REGISTRO (TABLA 8)'], ['E', 'NÚMERO CORRELATIVO'], ['F', 'NÚMERO DEL DOCUMENTO SUSTENTATORIO'], ['G', 'CÓDIGO'], ['H', 'DENOMINACIÓN'], ['I', 'DEBE'], ['J', 'HABER']].forEach(function (h) { s(8, COLS.indexOf(h[0]), 3, h[1]); mg(h[0] + '8', h[0] + '9'); });
    alto[7] = 22; alto[8] = 24; alto[9] = 24;

    var r = 10, D = 0, H = 0;
    L.asientos.forEach(function (a, j) {
      var ini = r;
      a.lineas.forEach(function (l, i) {
        if (i === 0) {
          s(r, 0, 4, a.num != null ? String(a.num) : String(j + 1));
          var sf = serial(a.fecha); if (sf != null) n(r, 1, 6, sf); else s(r, 1, 4, a.fecha || '');
          s(r, 2, 5, a.glosa || ''); s(r, 3, 4, a.libro || ''); s(r, 4, 4, a.corr || ''); s(r, 5, 4, a.doc || '');
        } else for (var c = 0; c < 6; c++) e(r, c, 4);
        if (l.cuenta) s(r, 6, 8, l.cuenta); else e(r, 6, 8); s(r, 7, l.haber && !l.debe ? 10 : 9, l.detalle || '');
        if (l.debe) n(r, 8, 7, l.debe); else e(r, 8, 7);
        if (l.haber) n(r, 9, 7, l.haber); else e(r, 9, 7);
        D += l.debe || 0; H += l.haber || 0; alto[r] = (l.detalle || '').length > (l.haber && !l.debe ? 40 : 46) ? 28 : 20; r++;
      });
      if (r - 1 > ini) 'ABCDEF'.split('').forEach(function (c) { mg(c + ini, c + (r - 1)); });
    });
    for (var c1 = 0; c1 < 7; c1++) e(r, c1, 14);
    s(r, 7, 11, 'TOTALES');
    f(r, 8, 12, 'SUM(I10:I' + (r - 1) + ')', Math.round(D * 100) / 100);
    f(r, 9, 12, 'SUM(J10:J' + (r - 1) + ')', Math.round(H * 100) / 100);
    alto[r] = 22;
    if (L.enunciado) {
      s(r + 2, 0, 2, 'Enunciado:');
      s(r + 3, 0, 13, L.enunciado); mg('A' + (r + 3), 'J' + (r + 3));
      alto[r + 3] = Math.max(30, Math.ceil(L.enunciado.length / 190) * 14 + 6);
    }
    var data = Object.keys(rows).map(Number).sort(function (a, b) { return a - b; }).map(function (rr) {
      var cs = rows[rr]; return '<row r="' + rr + '"' + (alto[rr] ? ' ht="' + alto[rr] + '" customHeight="1"' : '') + '>' + Object.keys(cs).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return cs[k]; }).join('') + '</row>';
    }).join('');
    var anchos = [16, 12, 40, 12, 14, 22, 10, 44, 17, 17];
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews><sheetFormatPr defaultRowHeight="13"/>' +
      '<cols>' + anchos.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join('') + '</cols>' +
      '<sheetData>' + data + '</sheetData>' +
      '<mergeCells count="' + merges.length + '">' + merges.map(function (m) { return '<mergeCell ref="' + m + '"/>'; }).join('') + '</mergeCells>' +
      '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>' +
      '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>';
  }

  function nombreHoja(s, usados) {
    var b = String(s || 'Libro').replace(/[\[\]:*?\/\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 28) || 'Libro', n = b, i = 2;
    while (usados[n.toLowerCase()]) n = b.slice(0, 26) + ' ' + (i++);
    usados[n.toLowerCase()] = 1; return n;
  }

  window.LibroXLSX = function (libros, archivo) {
    var usados = {}, nombres = libros.map(function (L) { return nombreHoja(L.hoja, usados); });
    var files = [
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + libros.map(function (L, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join('') + '</Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + nombres.map(function (nm, i) { return '<sheet name="' + x(nm) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join('') + '</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + libros.map(function (L, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('') + '<Relationship Id="rId' + (libros.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'xl/styles.xml', data: STYLES }
    ].concat(libros.map(function (L, i) { return { name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: hoja(L) }; }));
    var a = document.createElement('a'); a.href = URL.createObjectURL(zip(files)); a.download = archivo; document.body.appendChild(a); a.click(); a.remove();
  };
})();
