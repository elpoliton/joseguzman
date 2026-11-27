# Guía para trabajar en politon.pe/joseguzman

> Guía viva para cualquier chat que edite este repositorio. **Léela completa antes de tocar nada** y **actualízala al terminar** si cambiaste la estructura, un flujo o una regla. Anota el cambio en el «Registro de cambios» del final, con la fecha.
> El repositorio es **público**. Aquí no van claves, correos ni datos privados.

## 1. Acceso y publicación
- **Repositorio:** `elpoliton/joseguzman`, rama `main`. Sitio estático, sin compilación. En un chat nuevo, adjúntalo con permiso de escritura (`add_repo`, `access: "push"`), clónalo y regístralo (`register_repo_root`).
- **Publicar:** cada push a `main` ejecuta `.github/workflows/publicar.yml` (unos 100 s). Ese flujo:
  1. convierte los PowerPoint que haya en `entrada/`;
  2. regenera `sitemap.xml`;
  3. sube por FTP solo lo que cambió.
  - No sube `tools/`, `entrada/`, `.github/`, `README.md` ni `CLAUDE.md`. La cuenta FTP solo llega a la carpeta politon.pe/joseguzman: desde aquí **no** se puede tocar la raíz de politon.pe ni otras carpetas como /marginalia u /organizador.
- **Comprobar la publicación:** `gh run list --limit 1` hasta ver `completed` + `success`. Si falla: `gh run view <id> --log-failed`.
- **Varios chats editan este repo.** Haz `git pull --rebase` justo antes de cada commit y push. No reescribas archivos de otra sección sin leerlos antes.
- **Commits:** mensaje en español que diga qué cambió. Termina con las líneas de atribución (Co-Authored-By y Claude-Session) que indique el sistema de ese chat.
- **Probar en local:** `npx http-server -p 8766 .` y Playwright (Chromium ya instalado). El servidor de Python no sirve rangos de video. Firebase y otros sitios externos no cargan en el entorno de pruebas: esos errores de red son normales.

## 2. Mapa del sitio
| Ruta pública | Archivos | Qué es |
|---|---|---|
| `/joseguzman/` | `index.html`, `assets/site.js`, `assets/site.css` | Página personal |
| `/joseguzman/paginas/` | `paginas/index.html`, `assets/paginas.js` | **Mis páginas**: acceso único a todas las webs de José (privada, `noindex`) |
| `/joseguzman/ponencias/` | `ponencias/`, `assets/ponencias.js` (catálogo), `assets/deck.js` | Biblioteca de ponencias y motor de diapositivas |
| `/joseguzman/admin/` | `admin/`, `assets/admin.js`, `assets/admin-diapos.js` | Panel (llave de GitHub de grano fino del propio José) |
| `/joseguzman/control/` | `control/`, `assets/remoto.js`, `assets/nube.js` | Control de ponencias desde el celular (Firestore `salas-ponencias/{código}`) |
| `…/ponencias/<ruta>/?espejo=<código>` | `assets/espejo.js` | **Pantallas espejo**: otras laptops/tablets siguen a la laptop principal (Firestore `salas-ponencias/esp-<código>` y `esp-<código>-laser`); solo miran, no controlan |
| `/joseguzman/contabilidad/` | `contabilidad/`, `assets/contabilidad*.js`, `assets/ejercicios.js`, `assets/libro-xlsx.js`, `assets/formato51.js` | Práctica de asientos, «Mi libro diario» y «Mi Formato 5.1» (libro editable, `#formato`) |
| `/joseguzman/contabilidad/curso/` | `contabilidad/curso/`, `assets/curso*.js`, `tools/curso_*.py` | Curso Dinámica del Plan Contable (CERTUS) y sus materiales |
| `/joseguzman/cuentas-claras/` | `cuentas-claras/` | Prototipo Cuentas Claras FDCP (`noindex`) |

Más detalle de cada sección en `README.md`.

## 3. Tareas frecuentes
- **Agregar una página nueva:** crea su carpeta con `index.html`. Si no debe salir en Google, pon `<meta name="robots" content="noindex">`. Agrégala en `assets/paginas.js` para que aparezca en «Mis páginas».
- **Registrar una web que vive fuera de este repo** (otra carpeta de politon.pe u otro dominio): solo agrégala en `assets/paginas.js`.
- **Atajo politon.pe/paginas:** es un archivo de redirección que José sube a mano a la raíz de politon.pe (ver `tools/raiz-politon/LEEME.md`). No hay que tocarlo para sumar páginas.
- **Subir una ponencia desde un PowerPoint:** copia el `.pptx` a `entrada/<id>.pptx` y crea `entrada/<id>.json` con `id`, `titulo`, `subtitulo`, `categoria`, `subcategoria`, `fecha`, `lugar`, `resumen`, `etiquetas`, `oculto` y `pptx` (ruta del archivo). Al publicar se convierte sola. Para verla antes, ejecuta `python3 tools/convertir_pptx.py entrada/<id>.json` y luego borra los dos archivos de `entrada/`. Los enlaces http del PowerPoint quedan clicables.
- **Subir un documento al curso:** cópialo a `contabilidad/curso/materiales/` y agrégalo en `MATERIALES` de `tools/curso_datos.py`. Luego ejecuta `python3 tools/curso_datos.py`; si es un Excel, también `python3 tools/curso_vistas_excel.py`. Se abre en el visor de la web. Enlace directo: `…/contabilidad/curso/#ver=<archivo>`.
- **Agregar un ejercicio de contabilidad:** en `assets/ejercicios.js`. Formato en `README.md`; cada ejercicio lleva `subido: 'dd/mm/aa'`. Si José pide el libro resuelto, súbelo también (PDF + Excel, con versión) a `contabilidad/curso/materiales/` y al grupo «Ejercicios resueltos en Formato 5.1» de `MATERIALES` en `tools/curso_datos.py`.
- **Marginalia** (politon.pe/marginalia, otro chat) lee sola la carpeta `contabilidad/curso/materiales/` de GitHub: lo que se sube ahí aparece en Marginalia → «Documentos de la web» → Dinámica del Plan Contable. El enlace «📓 Cuaderno del curso» de contabilidad y del curso apunta a Marginalia.
- **No mover ni renombrar** los archivos de `contabilidad/curso/materiales/`: otro proyecto (Marginalia) y algunas presentaciones los enlazan.

## 4. Reglas de José
- Todo en español. Nombres de archivo de entregables con versión (v1, v2…).
- Lo que se le entrega va en «modo presentación»: limpio, sin notas internas ni marcadores. Lo que haya que confirmar o editar se le avisa en el chat.
- No publicar su correo, teléfonos ni contactos de terceros, ni formularios de campaña o grupos de WhatsApp.
- No publicar fotos de menores.
- Antes de publicar datos personales de terceros (por ejemplo, nombres de compañeros), avísale: el repo y la web son públicos.

## 5. Firebase (proyecto `organizador-politon`)
- Lo comparten varias webs de José. Cada app guarda sus datos en `apps/{app}/usuarios/{uid}`. El control remoto usa `salas-ponencias/{código}` sin iniciar sesión.
- Las reglas se editan en la consola de Firebase, no en este repo. La regla de `salas-ponencias` tiene que estar **en el nivel de `documents`**, no dentro de otro `match`.

## Registro de cambios
- 27/11/2026: AA2 (`dpc-aa2-politon`) con botones al informe (PDF) y al libro diario (Excel) en las diapositivas 1, 3, 14 y 15 (formas con enlace en el PPTX v3). PCGE 2019 de la web: se agregan 70121 y 70122, que el dataset omitía; la corrección queda en `CORRECCIONES` de `tools/pcge_datos.py`.
- 26/11/2026: AA2 (`dpc-aa2-politon`) en 15 diapositivas: la 2 es el video horizontal «¿Cuánto gané?» (`media/video-1.mp4`), hecho con el kit video-expediente en 16:9.
- 26/11/2026: AA2 de POLITON (equipo Los Contables) en Ponencias (`dpc-aa2-politon`) y en Materiales › Mis entregas (`aa2-politon-informe-v1.pdf`, `aa2-politon-libro-diario-v1.xlsx`). «Tocar» desde el celular: los enlaces del sitio (también con `www.` o http) se abren en el visor; los externos muestran en la laptop un aviso «🔗 Enlace externo · Abrir ↗» (el navegador no abre otra pestaña sin un clic real).
- 24/11/2026: «Mi Formato 5.1» tiene columna editable «¿Por qué va aquí?» por línea (`linea.nota`; al copiar un ejercicio se llena con la `nota` de la solución, y `asiento.expl` con su explicación) y su Excel trae la hoja «Explicación». El editor guarda al instante al salir de la pestaña (`pagehide`).
- 24/11/2026: el Excel Formato 5.1 que descarga «Mi libro diario» trae una hoja «Explicación» por ejercicio (`explicar: true` en `LibroXLSX`): cada fila con tipo de cuenta, efecto y la razón (la `nota` de la solución para esa cuenta y lado). Compras de agosto en v2.
- 24/11/2026: ejercicio «Caso práctico de compras (agosto)» (`compras-agosto`, 14 asientos) y su libro resuelto en Materiales del curso.
- 23/11/2026: QR en grande: un elemento con `data-qr="<imagen>"` (y `data-qr-texto="Título|url"`) muestra el QR a pantalla completa al hacer clic, con la tecla Q o al tocarlo desde el celular; se cierra con clic, Escape o siguiente/anterior. Llega al celular y a las pantallas espejo (`qr` en `DECK.estado()`). Usado en la diapositiva 15 de la sustentación FDCP.
- 23/11/2026: control desde el celular: modo «👆 Tocar» (tocar la miniatura pulsa ese punto en la laptop: comando `tocar` en `deck.js`) y **visor web**: los enlaces del mismo sitio con `target="_blank"` (p. ej. Cuentas Claras en la diapositiva 15) se abren dentro de la presentación, encima de la diapositiva, en vez de otra pestaña. Se cierra con «← Volver», Escape, siguiente/anterior o desde el celular (`web`, `webscroll`). `DECK.estado().web` y `REDSYNC` llegan al celular (`remoto.js`) y a las pantallas espejo.
- 22/11/2026: Sustentación FDCP en v6 (20 diapositivas): misma información con letra más grande para leer a distancia; el Anexo C (instrumentos) pasa a dos diapositivas (19 y 20). La diapositiva 7 interactiva también agranda su letra (`red.css`, bloque «v3») y los nodos (`red.js`).
- 22/11/2026: Cuentas Claras: sección «Datos reales» (`#actas`, `cuentas-claras/datos-reales.js`) con las actas del Consejo publicadas en derecho2.unmsm.edu.pe (2019-2026, enlaces a los PDF de 2024-2026), documentos económicos, canales oficiales y composición del Consejo (Estatuto art. 57). Revisado el 22/11/2026; si se actualiza, cambiar `revisado`. No se usan fotos ni logo del portal oficial.
- 20/11/2026: pestaña «Mi Formato 5.1» (`assets/formato51.js`): libros diarios editables en `S.formatos` (borrados en `S.f51borrados`; se unen con la nube por `t`), copiar un ejercicio, descargar Excel/PDF y Formato 5.1 en blanco. `libro-xlsx.js` acepta `num`, `libro` y `corr` por asiento. Libros resueltos (constitución y Elemento 5) en Materiales del curso, visibles en Marginalia; enlace «📓 Cuaderno del curso».
- 20/11/2026: ejercicio «Inversiones del Pacífico SAC · Elemento 5» (15 asientos: constitución, aumento, prima de emisión, capitalización, utilidad, reserva legal, dividendos y revaluación). `assets/libro-xlsx.js` da más alto a las filas con denominaciones largas.
- 20/11/2026: Practicar de contabilidad: botón ⇄ por línea para pasarla a otro asiento (o a uno nuevo en los propios); «⚙ Nombre y fecha» por asiento en los propios (`propio.info[k] = {titulo, fecha}`); «▤ Ver todos los asientos y cuentas T»; panel «¿Qué pasó?» con el efecto en la ecuación contable; botón «Hoy» en las fechas; estudio: `S.intentos[clave] = {n, fallos, primero, vio, repasar, desdeCero, t}` (filtro «Para repasar», aciertos al primer intento; se une con la nube por `t`) y cuestionario «🎯 Ponte a prueba» en Plan de cuentas.
- 19/11/2026: pantallas espejo (`assets/espejo.js`, botón «🖥️ Pantallas» en todas las ponencias y en el conversor). La laptop principal publica diapositiva, pantalla negra, zoom, láser y el estado de las diapositivas interactivas (`window.REDSYNC` + evento `red:cambio`). `remoto.js` no corre en modo espejo. Sustentación FDCP en v5 (19 diapositivas): la red interactiva muestra la pregunta de la entrevista y una pestaña «Instrumento».
- 19/11/2026: ponencia «Sustentación de tesis FDCP» (`ponencias/ciencia-politica/sustentacion-tesis-fdcp/`), hecha a mano desde el PPTX v4: diapositivas en imagen + la 7 es HTML interactivo (`red.js`, `red.css`, `red-datos.js`), que intercepta «siguiente/anterior» para recorrer las 6 redes de códigos antes de avanzar.
- 19/11/2026: se crea esta guía y la página «Mis páginas» (`/paginas/`, catálogo en `assets/paginas.js`).
- 17/11/2026: contabilidad con ejercicios de varios asientos, libro diario por ejercicio y Excel en Formato 5.1.
- 16/11/2026: prototipo Cuentas Claras FDCP.
- 13/11/2026: AA1 de POLITON en Ponencias y en Materiales del curso; el conversor conserva los enlaces del PowerPoint; enlace `#ver=` en el curso.
