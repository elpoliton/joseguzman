/* admin-diapos.js — editor de diapositivas del panel /admin.
   Por cada ponencia guarda ponencias/<ruta>/ajustes.json con: notas por diapositiva (celular y vista del presentador),
   textos en pantalla cambiados, imágenes reemplazadas, orden y diapositivas ocultas. El motor (deck.js) los aplica al abrir. */
(function () {
  'use strict';
  var A = window.ADMIN; if (!A) return;
  var $ = function (s) { return document.querySelector(s); };
  var esc = A.esc;
  var previasEx = {}, P = null, lista = [], aj = null, base = '', sel = 0, frameListo = false, nuevas = {}, previas = {}, mostrado = false;

  function vacio() { return { version: 1, t: 0, orden: [], ocultas: [], notas: {}, textos: {}, imagenes: {}, extras: {} }; }
  function sucio() { return JSON.stringify(aj) !== base || Object.keys(nuevas).length > 0; }
  function marcar() { var s = !!aj && sucio(); $('#dDirty').hidden = !s; $('#dGuardar').disabled = !s; }
  window.addEventListener('beforeunload', function (e) { if (aj && sucio()) { e.preventDefault(); e.returnValue = ''; } });
  function clave(ruta) { return String(ruta || '').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, ''); }

  // ---------- elegir ponencia
  function opciones() {
    var C = A.catalogo().slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
    var v = $('#dSel').value;
    $('#dSel').innerHTML = '<option value="">— Elige una ponencia —</option>' + C.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.titulo) + ' · ' + esc(p.subcategoria) + '</option>'; }).join('');
    if (v) $('#dSel').value = v;
  }
  $('#dSel').addEventListener('change', function () {
    var id = this.value;
    if (aj && sucio() && !confirm('Tienes cambios sin guardar en esta ponencia. ¿Descartarlos?')) { this.value = P ? P.id : ''; return; }
    abrir(id);
  });
  function abrir(id) {
    opciones(); $('#dSel').value = id || '';
    P = A.catalogo().find(function (p) { return p.id === id; }) || null;
    aj = null; nuevas = {}; previas = {}; marcar(); A.clear('#dMsg');
    $('#dWrap').hidden = !P; $('#dVacio').hidden = !!P;
    if (!P) return;
    A.msg('#dMsg', 'info', 'Cargando diapositivas…');
    frameListo = false;
    var fr = $('#dPrev');
    fr.onload = function () { esperarDeck(fr, 0); };
    fr.src = '../ponencias/' + P.ruta + '?vista&editor&sinajustes&t=' + Date.now();
  }
  function esperarDeck(fr, n) {
    var w = null; try { w = fr.contentWindow; } catch (e) { }
    if (w && w.DECK && w.DECK.editor) { lista = w.DECK.editor.lista(); frameListo = true; cargarAjustes(); return; }
    if (n > 40) { A.msg('#dMsg', 'err', 'No se pudo abrir la ponencia para editarla. Revisa que esté publicada (pestaña Publicaciones) y recarga.'); return; }
    setTimeout(function () { esperarDeck(fr, n + 1); }, 150);
  }
  function cargarAjustes() {
    A.api('/contents/ponencias/' + P.ruta + 'ajustes.json?ref=main').then(function (f) { return JSON.parse(A.textFromB64(f.content)); })
      .catch(function (e) { if (e.status === 404) return {}; throw e; })
      .then(function (j) {
        aj = Object.assign(vacio(), j || {});
        lista.forEach(function (d) { if (aj.orden.indexOf(d.k) < 0) aj.orden.push(d.k); });
        aj.orden = aj.orden.filter(function (k) { return lista[k]; });
        base = JSON.stringify(aj); A.clear('#dMsg');
        sel = aj.orden[0] || 0; pintarLista(); pintarForm(); vista(); marcar();
      }).catch(function (e) { A.msg('#dMsg', 'err', 'No se pudieron leer los ajustes: ' + esc(e.message)); });
  }

  // ---------- lista de diapositivas
  function numVisible(k) { var n = 0; for (var j = 0; j < aj.orden.length; j++) { if (aj.ocultas.indexOf(aj.orden[j]) < 0) n++; if (aj.orden[j] === k) return aj.ocultas.indexOf(k) < 0 ? n : null; } return null; }
  function tieneNota(k) { return Object.prototype.hasOwnProperty.call(aj.notas, k) ? !!aj.notas[k] : !!lista[k].nota; }
  function editada(k) { return Object.prototype.hasOwnProperty.call(aj.notas, k) || (aj.extras[k] || []).length || aj.imagenes[k] || Object.keys(aj.textos).some(function (id) { return id.indexOf(k + ':') === 0; }); }
  function pintarLista() {
    $('#dList').innerHTML = aj.orden.map(function (k, pos) {
      var d = lista[k], n = numVisible(k), oc = n === null;
      var img = previas[k] || (aj.imagenes[k] ? '../ponencias/' + P.ruta + aj.imagenes[k] : d.img ? '../ponencias/' + P.ruta + d.img : null);
      var b = [oc ? '🚫 oculta' : '', tieneNota(k) ? '📝 nota' : '', d.video ? '🎬 video' : '', editada(k) ? '✎ cambiada' : ''].filter(Boolean).join(' · ');
      return '<div class="dit' + (k === sel ? ' sel' : '') + (oc ? ' off' : '') + '" data-k="' + k + '">' +
        '<div class="th">' + (img ? '<img src="' + esc(img) + '" alt="">' : (oc ? '—' : n)) + '</div>' +
        '<div><div class="tt">' + (oc ? '' : n + '. ') + esc(d.titulo || 'Diapositiva ' + (k + 1)) + '</div><div class="bd">' + b + '</div></div>' +
        '<div class="mv"><button data-m="-1" title="Subir"' + (pos === 0 ? ' disabled' : '') + '>▲</button><button data-m="1" title="Bajar"' + (pos === aj.orden.length - 1 ? ' disabled' : '') + '>▼</button></div></div>';
    }).join('');
  }
  $('#dList').addEventListener('click', function (e) {
    var it = e.target.closest('.dit'); if (!it) return;
    var k = +it.getAttribute('data-k'), m = e.target.closest('[data-m]');
    if (m) {
      var pos = aj.orden.indexOf(k), np = pos + (+m.getAttribute('data-m'));
      if (np < 0 || np >= aj.orden.length) return;
      aj.orden.splice(pos, 1); aj.orden.splice(np, 0, k); pintarLista(); marcar(); return;
    }
    sel = k; pintarLista(); pintarForm(); vista();
  });

  // ---------- formulario de la diapositiva elegida
  function pintarForm() {
    var d = lista[sel], k = sel;
    var nota = Object.prototype.hasOwnProperty.call(aj.notas, k) ? aj.notas[k] : d.nota;
    var oc = aj.ocultas.indexOf(k) >= 0;
    var h = '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">' +
      '<h2 style="margin:0;color:var(--navy);font-size:20px">Diapositiva ' + (numVisible(k) || '(oculta)') + '</h2>' +
      '<label style="display:flex;gap:8px;align-items:center;font-size:15px"><input type="checkbox" id="fOculta"' + (oc ? ' checked' : '') + '> Ocultar en la presentación</label></div>' +
      '<label class="f" for="fNota">📝 Nota para mí <small>(aparece en el celular y en la vista del presentador; el público no la ve)</small></label>' +
      '<textarea class="i" id="fNota" style="min-height:120px" placeholder="Lo que quieres recordar o decir en esta diapositiva…">' + esc(nota) + '</textarea>' +
      '<p class="dhint">Deja una línea en blanco para separar párrafos. Escribe <b>**así**</b> para negrita.' + (Object.prototype.hasOwnProperty.call(aj.notas, k) ? ' · <a href="#" id="fNotaOrig">Volver a la nota original</a>' : '') + '</p>';
    if (d.tipo === 'imagen') {
      h += '<label class="f">🖼 Imagen de la diapositiva <small>(si corriges algo en PowerPoint, exporta solo esa diapositiva como imagen y súbela aquí)</small></label>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><input type="file" id="fImg" accept="image/png,image/jpeg,image/webp" class="hidden"><button class="btn line sm" type="button" id="fImgB">Cambiar imagen…</button>' +
        (aj.imagenes[k] || previas[k] ? '<button class="btn line sm" type="button" id="fImgO">Volver a la original</button>' : '') + '</div>' +
        '<p class="dhint">Para cambiar el texto de una diapositiva que vino de PowerPoint, cambia la imagen o vuelve a subir el PowerPoint corregido.</p>';
    }
    // cuadros de texto e imágenes encima de la diapositiva
    var ex = aj.extras[k] || [];
    h += '<label class="f">➕ Agregar encima de la diapositiva <small>(el público sí lo ve)</small></label>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn navy sm" type="button" id="exTxt">🅣 Cuadro de texto</button><button class="btn navy sm" type="button" id="exImgB">🖼 Imagen o pantallazo</button><input type="file" id="exImg" accept="image/*" class="hidden"></div>' +
      '<p class="dhint">Para un pantallazo: cópialo (tecla Impr Pant o Win + Shift + S) y pulsa <b>Ctrl + V</b> aquí. En la vista previa, <b>arrastra</b> el cuadro para moverlo y usa el punto rosado de la esquina para el tamaño.</p>' +
      ex.map(function (x, j) {
        var cab = '<div class="exc" data-j="' + j + '"><div class="exh"><b>' + (x.tipo === 'img' ? '🖼 Imagen ' : '🅣 Texto ') + (j + 1) + '</b><span><button type="button" class="btn line sm" data-exa="subir" title="Traer al frente">⇡</button> <button type="button" class="btn red sm" data-exa="quitar">Eliminar</button></span></div>';
        var pos = '<div class="exrow"><label>Ancho <input type="range" min="4" max="100" step="1" data-ex="w" value="' + (x.w || 30) + '"></label></div>';
        if (x.tipo === 'img') return cab + '<div class="exrow"><img class="exth" src="' + esc(previasEx[x.src] || ('../ponencias/' + P.ruta + x.src)) + '" alt=""><label><input type="checkbox" data-ex="borde"' + (x.borde ? ' checked' : '') + '> Marco blanco con sombra</label></div>' + pos + '</div>';
        var sel = function (campo, ops) { return '<select class="i" data-ex="' + campo + '">' + ops.map(function (o) { return '<option value="' + o[0] + '"' + (String(x[campo]) === String(o[0]) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; };
        return cab + '<textarea class="i" data-ex="texto" rows="2">' + esc(x.texto) + '</textarea>' +
          '<div class="exrow">' + sel('tam', [[24, 'Letra pequeña'], [32, 'Letra mediana'], [40, 'Letra grande'], [56, 'Letra muy grande'], [72, 'Gigante']]) +
          sel('color', [['navy', 'Texto azul'], ['blanco', 'Texto blanco'], ['mag', 'Texto magenta'], ['oro', 'Texto dorado'], ['negro', 'Texto negro'], ['rojo', 'Texto rojo']]) +
          sel('fondo', [['no', 'Sin fondo'], ['amarillo', 'Fondo amarillo'], ['blanco', 'Fondo blanco'], ['navy', 'Fondo azul'], ['mag', 'Fondo magenta'], ['oro', 'Fondo dorado']]) +
          sel('alin', [['left', 'Alinear a la izquierda'], ['center', 'Centrado'], ['right', 'A la derecha']]) +
          '<label><input type="checkbox" data-ex="negrita"' + (x.negrita ? ' checked' : '') + '> Negrita</label></div>' + pos + '</div>';
      }).join('');
    if (d.textos.length) {
      h += '<details class="dtx"' + (d.tipo === 'html' ? ' open' : '') + '><summary>✏️ Textos en pantalla (' + d.textos.length + ')</summary><p class="dhint">Cambia lo que el público ve. Los campos en amarillo están cambiados; bórralo todo para volver al original.</p><div class="dform-t">' +
        d.textos.map(function (t) { var v = aj.textos[t.id] != null ? aj.textos[t.id] : t.texto; return '<label for="tx' + t.id + '">' + esc(t.etiqueta) + '</label><textarea class="i' + (aj.textos[t.id] != null ? ' ed' : '') + '" data-tx="' + t.id + '" id="tx' + t.id + '" rows="' + Math.min(5, Math.max(1, Math.ceil(v.length / 70))) + '">' + esc(v) + '</textarea>'; }).join('') + '</div></details>';
    }
    h += '<div style="display:flex;gap:10px;justify-content:space-between;margin-top:20px;flex-wrap:wrap"><button class="btn line sm" type="button" id="fAnt">◀ Anterior</button><a class="btn line sm" target="_blank" href="../ponencias/' + esc(P.ruta) + '#' + (numVisible(k) || 1) + '">Ver la ponencia publicada ↗</a><button class="btn line sm" type="button" id="fSig">Siguiente ▶</button></div>';
    $('#dForm').innerHTML = h;
  }
  function campoExtra(t) {
    var c = t.closest('.exc'); if (!c || !t.getAttribute('data-ex')) return false;
    var x = aj.extras[sel][+c.getAttribute('data-j')], campo = t.getAttribute('data-ex');
    x[campo] = t.type === 'checkbox' ? t.checked : t.type === 'range' || campo === 'tam' ? +t.value : t.value;
    marcar(); vista(); return true;
  }
  $('#dForm').addEventListener('input', function (e) {
    if (campoExtra(e.target)) return;
    var k = sel, d = lista[k], t = e.target;
    if (t.id === 'fNota') { var v = t.value.replace(/\s+$/, ''); if (v === d.nota) delete aj.notas[k]; else aj.notas[k] = v; }
    var id = t.getAttribute('data-tx');
    if (id) { var o = d.textos.find(function (x) { return x.id === id; }); var v2 = t.value.trim(); if (!v2 || v2 === o.texto) delete aj.textos[id]; else aj.textos[id] = v2; t.classList.toggle('ed', aj.textos[id] != null); }
    marcar(); vista(); pintarListaSuave();
  });
  var tLista = null; function pintarListaSuave() { clearTimeout(tLista); tLista = setTimeout(pintarLista, 400); }
  $('#dForm').addEventListener('change', function (e) {
    var k = sel, t = e.target;
    if (t.id === 'exImg' && t.files[0]) { agregarImagen(t.files[0]); return; }
    if (t.tagName === 'SELECT' || t.type === 'checkbox') { if (campoExtra(t)) return; }
    if (t.id === 'fOculta') { aj.ocultas = aj.ocultas.filter(function (x) { return x !== k; }); if (t.checked) aj.ocultas.push(k); aj.ocultas.sort(function (a, b) { return a - b; }); pintarLista(); pintarForm(); marcar(); }
    if (t.id === 'fImg' && t.files[0]) cambiarImagen(k, t.files[0]);
  });
  $('#dForm').addEventListener('click', function (e) {
    var t = e.target, k = sel;
    if (t.id === 'exTxt') { (aj.extras[k] = aj.extras[k] || []).push({ tipo: 'texto', texto: 'Escribe aquí', x: 8, y: 22, w: 40, tam: 40, color: 'navy', fondo: 'amarillo', alin: 'left', negrita: true }); pintarForm(); vista(); pintarLista(); marcar(); var tas = document.querySelectorAll('[data-ex="texto"]'); if (tas.length) { tas[tas.length - 1].focus(); tas[tas.length - 1].select(); } return; }
    if (t.id === 'exImgB') { $('#exImg').click(); return; }
    var ea = t.closest('[data-exa]');
    if (ea) {
      var j = +ea.closest('.exc').getAttribute('data-j'), L = aj.extras[k];
      if (ea.getAttribute('data-exa') === 'quitar') { var x = L[j]; if (x.tipo === 'img') delete nuevas[x.src]; L.splice(j, 1); if (!L.length) delete aj.extras[k]; }
      else { L.push(L.splice(j, 1)[0]); }
      pintarForm(); vista(); pintarLista(); marcar(); return;
    }
    if (t.id === 'fNotaOrig') { e.preventDefault(); delete aj.notas[k]; pintarForm(); vista(); pintarLista(); marcar(); }
    if (t.id === 'fImgB') $('#fImg').click();
    if (t.id === 'fImgO') { delete aj.imagenes[k]; delete previas[k]; Object.keys(nuevas).forEach(function (p) { if (nuevas[p].k === k && nuevas[p].fondo) delete nuevas[p]; }); pintarForm(); pintarLista(); vista(); marcar(); }
    if (t.id === 'fAnt' || t.id === 'fSig') { var pos = aj.orden.indexOf(k) + (t.id === 'fSig' ? 1 : -1); if (pos >= 0 && pos < aj.orden.length) { sel = aj.orden[pos]; pintarLista(); pintarForm(); vista(); var it = document.querySelector('.dit.sel'); if (it) it.scrollIntoView({ block: 'nearest' }); } }
  });

  // imagen nueva: se ajusta a 1600×900 (como las demás) y se sube al guardar
  function cambiarImagen(k, f) {
    var url = URL.createObjectURL(f), im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas'); c.width = 1600; c.height = 900; var g = c.getContext('2d');
      g.fillStyle = '#000'; g.fillRect(0, 0, 1600, 900);
      var s = Math.min(1600 / im.width, 900 / im.height), w = im.width * s, h = im.height * s;
      g.drawImage(im, (1600 - w) / 2, (900 - h) / 2, w, h);
      var datos = c.toDataURL('image/jpeg', 0.88);
      Object.keys(nuevas).forEach(function (p) { if (nuevas[p].k === k && nuevas[p].fondo) delete nuevas[p]; });
      var rel = 'diapos/editada-' + (k + 1) + '-' + Date.now().toString(36) + '.jpg';
      nuevas[rel] = { k: k, fondo: true, b64: datos.split(',')[1] };
      aj.imagenes[k] = rel; previas[k] = datos;
      URL.revokeObjectURL(url); pintarForm(); pintarLista(); vista(); marcar();
    };
    im.onerror = function () { A.msg('#dMsg', 'err', 'No se pudo leer esa imagen. Usa JPG o PNG.'); };
    im.src = url;
  }

  // imagen o pantallazo encima de la diapositiva (máx. 1600 px; PNG se mantiene para pantallazos nítidos)
  function agregarImagen(f) {
    if (!aj || !f || !/^image\//.test(f.type)) return;
    var k = sel, url = URL.createObjectURL(f), im = new Image();
    im.onload = function () {
      var s = Math.min(1, 1600 / im.width), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      var png = /png/.test(f.type), datos = c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.88);
      if (datos.length > 4e6 && png) { datos = c.toDataURL('image/jpeg', 0.9); png = false; }
      var rel = 'diapos/extra-' + (k + 1) + '-' + Date.now().toString(36) + (png ? '.png' : '.jpg');
      nuevas[rel] = { k: k, b64: datos.split(',')[1] }; previasEx[rel] = datos;
      var w = Math.min(60, Math.round(c.width / 16)); // ancho inicial según su tamaño
      (aj.extras[k] = aj.extras[k] || []).push({ tipo: 'img', src: rel, x: Math.round((100 - w) / 2), y: 18, w: Math.max(20, w), borde: true });
      URL.revokeObjectURL(url); pintarForm(); vista(); pintarLista(); marcar();
      A.msg('#dMsg', 'ok', 'Imagen agregada. Arrástrala en la vista previa para ubicarla y pulsa <b>Guardar y publicar</b>.');
    };
    im.onerror = function () { A.msg('#dMsg', 'err', 'No se pudo leer esa imagen.'); };
    im.src = url;
  }
  document.addEventListener('paste', function (e) {
    if (!aj || $('#tab-dia').classList.contains('hidden')) return;
    var items = (e.clipboardData && e.clipboardData.items) || [];
    for (var i = 0; i < items.length; i++) if (items[i].type.indexOf('image') === 0) { e.preventDefault(); agregarImagen(items[i].getAsFile()); return; }
  });
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !aj) return;
    var m = e.data || {}; if (m.t !== 'deck-extra') return;
    var x = (aj.extras[m.k] || [])[m.j]; if (!x) return;
    x.x = m.x; x.y = m.y; x.w = m.w; marcar();
    var c = document.querySelector('.exc[data-j="' + m.j + '"] [data-ex="w"]'); if (c && m.k === sel) c.value = m.w;
    vista();
  });

  // ---------- vista previa en vivo (la misma ponencia, dentro del panel)
  function vista() {
    if (!frameListo) return;
    try {
      var D = $('#dPrev').contentWindow.DECK, copia = JSON.parse(JSON.stringify(aj));
      Object.keys(previas).forEach(function (k) { copia.imagenes[k] = previas[k]; });
      Object.keys(copia.extras || {}).forEach(function (k) { copia.extras[k].forEach(function (x) { if (x.tipo === 'img') x.src = previasEx[x.src] || x.src; }); });
      Object.keys(copia.imagenes).forEach(function (k) { if (!previas[k]) copia.imagenes[k] = copia.imagenes[k]; });
      D.editor.aplicar(copia); D.editor.ir(sel);
    } catch (e) { }
  }

  // ---------- notas escritas desde el celular (Firebase)
  $('#dCel').onclick = function () {
    if (!P || !aj) { A.msg('#dMsg', 'err', 'Primero elige una ponencia.'); return; }
    var sala = null; try { sala = localStorage.getItem('jg-sala'); } catch (e) { }
    if (!sala) { A.msg('#dMsg', 'err', 'Esta laptop aún no tiene un celular emparejado. Abre una ponencia, pulsa «📱 Celular» y escanea el QR; luego vuelve aquí.'); return; }
    if (!window.Nube) { A.msg('#dMsg', 'err', 'No se pudo cargar la conexión con Firebase.'); return; }
    A.msg('#dMsg', 'info', 'Buscando notas del celular…');
    Nube.sala(sala).then(function (r) { return r.get(); }).then(function (s) {
      var d = s.exists ? s.data() : {}, mias = (d.notas || {})[clave(P.ruta)] || {}, n = 0;
      Object.keys(mias).forEach(function (k) {
        var x = mias[k]; if (!x || typeof x.texto !== 'string' || !lista[+k]) return;
        var t = x.t && x.t.toMillis ? x.t.toMillis() : 0; if (t && t <= (aj.t || 0)) return; // ya incorporada antes
        if (x.texto === (Object.prototype.hasOwnProperty.call(aj.notas, k) ? aj.notas[k] : lista[+k].nota)) return;
        aj.notas[k] = x.texto; n++;
      });
      pintarLista(); pintarForm(); vista(); marcar();
      A.msg('#dMsg', n ? 'ok' : 'info', n ? 'Se trajeron ' + n + (n === 1 ? ' nota' : ' notas') + ' del celular (marcadas con 📝). Revísalas y pulsa <b>Guardar y publicar</b>.' : 'No hay notas nuevas del celular para esta ponencia.');
    }).catch(function (e) { A.msg('#dMsg', 'err', esc(Nube.mensajeError(e))); });
  };

  // ---------- guardar
  $('#dGuardar').onclick = function () {
    if (!aj || !sucio()) return;
    var btn = this; btn.disabled = true;
    A.msg('#dMsg', 'info', 'Guardando…');
    aj.t = Date.now();
    var limpio = JSON.parse(JSON.stringify(aj));
    if (limpio.orden.every(function (k, j) { return k === j; })) limpio.orden = [];
    var files = [{ path: 'ponencias/' + P.ruta + 'ajustes.json', text: JSON.stringify(limpio, null, 2) + '\n' }];
    Object.keys(nuevas).forEach(function (rel) { files.push({ path: 'ponencias/' + P.ruta + rel, b64: nuevas[rel].b64 }); });
    // el número de diapositivas visibles se refleja en la biblioteca
    var C = A.catalogo().map(function (x) { return Object.assign({}, x); }), q = C.find(function (x) { return x.id === P.id; });
    var visibles = lista.length - aj.ocultas.length;
    var cambiaCat = q && q.diapositivas !== visibles;
    if (cambiaCat) { q.diapositivas = visibles; files.push({ path: A.CAT, text: A.textoCatalogo(C) }); }
    A.commit(files, 'Diapositivas y notas: ' + P.titulo).then(function () {
      base = JSON.stringify(aj); nuevas = {}; marcar(); A.vigilar(); if (cambiaCat) A.ponerCatalogo(C);
      A.msg('#dMsg', 'ok', '¡Guardado! En 1 o 2 minutos se verá en la web, en el celular y en la vista del presentador (pestaña <b>Publicaciones</b>).');
    }).catch(function (e) { aj.t = JSON.parse(base).t; btn.disabled = false; A.msg('#dMsg', 'err', 'No se pudo guardar: ' + esc(e.message)); });
  };

  window.EditorDiapos = {
    mostrar: function () { if (!mostrado) { mostrado = true; opciones(); var C = A.catalogo(); if (C.length === 1 && !P) abrir(C[0].id); } else opciones(); },
    abrir: function (id) { mostrado = true; if (P && P.id === id) return; if (aj && sucio() && !confirm('Tienes cambios sin guardar. ¿Descartarlos?')) return; abrir(id); }
  };
})();
