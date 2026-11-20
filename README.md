# politon.pe/joseguzman

> Si eres un chat de Claude: lee primero `CLAUDE.md`.

Página personal de José Manuel Guzmán Valverde y biblioteca de ponencias. Sitio estático, sin dependencias ni paso de compilación.

## Estructura
- `index.html` — página de presentación.
- `ponencias/index.html` — biblioteca con buscador y filtros por categoría y subcategoría.
- `ponencias/<subcategoria>/<ponencia>/index.html` — cada ponencia, con sus videos y su PDF en `media/`.
- `cuentas-claras/` — prototipo «Cuentas Claras FDCP» (propuesta derivada de la tesis de licenciatura): `index.html`, `app.css`, `app.js` y fuentes locales. Datos de ejemplo; lleva `noindex` y no entra al mapa del sitio.
- `assets/ponencias.js` — catálogo: agrega aquí cada ponencia nueva.
- `contabilidad/` — práctica de asientos con el PCGE. Ejercicios en `assets/ejercicios.js`: uno simple lleva `solucion`; uno de varios asientos lleva `asientos: [{ titulo, glosa, solucion, explicacion }]` (y opcional `empresa`, `ruc`, `periodo` para la cabecera del Formato 5.1). Cada ejercicio lleva `subido: 'dd/mm/aa'` (fecha en que se subió): la lista los agrupa por esa fecha, lo más reciente primero. «Mi libro diario» muestra un libro por ejercicio, se filtra por fecha de subida, puede completar con la solución lo no resuelto, y descarga los marcados en PDF o en Excel Formato 5.1 (`assets/libro-xlsx.js`, una hoja por ejercicio). El trabajo de cada asiento se guarda en `trabajo[id]`, `trabajo[id~2]`, `trabajo[id~3]`… Los intentos de verificación de cada asiento van en `intentos[clave]` (filtro «Para repasar»). En Practicar: ⇄ pasa una línea a otro asiento, «Ver todos los asientos y cuentas T» muestra el ejercicio completo y su mayor, y «¿Qué pasó?» explica el efecto en la ecuación contable.
- `assets/deck.js` y `assets/deck.css` — motor de diapositivas (lienzo 1600 × 900).
- `assets/site.js` y `assets/site.css` — página personal y biblioteca.
- `assets/icons.js` — íconos; se regeneran con `node tools/iconos.cjs` (requiere react, react-dom y react-icons).
- `sw.js` — modo sin conexión (botón «Sin conexión» de cada ponencia).

## Presentar
Abre la ponencia y pulsa **F** para pantalla completa. El puntero USB avanza y retrocede (envía AvPág/RePág o flechas).
**S** abre la vista del presentador (notas, siguiente diapositiva y cronómetro); **B** pone la pantalla en negro; **K** pausa el video.
En las diapositivas con video, «siguiente» primero reproduce el video y la siguiente pulsación avanza.

## Panel
`politon.pe/joseguzman/admin/` (con una llave de GitHub de grano fino: Contents lectura y escritura, Actions lectura).
- Biblioteca: editar fichas, ocultar, mostrar o quitar ponencias (edita `assets/ponencias.js`).
- Subir PowerPoint: deja el `.pptx` y su ficha en `entrada/`; la publicación lo convierte con `tools/convertir_pptx.py` (LibreOffice, poppler, ffmpeg, python-pptx).
- Publicaciones: estado de las últimas ejecuciones.

## Nube (Firebase · proyecto organizador-politon)
`assets/nube.js` carga el SDK solo cuando hace falta. Cada web usa su propio documento, separado del organizador:
- `apps/contabilidad/usuarios/{uid}`: práctica de /contabilidad sincronizada entre dispositivos (`assets/contabilidad-nube.js`).
- `salas-ponencias/{código}`: control remoto, sin iniciar sesión (emparejamiento por QR). La laptop publica `sesion` (diapositiva, notas, siguiente) y ejecuta la `cola` de comandos que escribe el celular desde `/control/` (`assets/remoto.js`).

## Publicación
Cada cambio en la rama `main` se publica solo por FTP en politon.pe/joseguzman (`.github/workflows/publicar.yml`).
