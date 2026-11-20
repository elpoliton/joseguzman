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
| `/joseguzman/contabilidad/` | `contabilidad/`, `assets/contabilidad*.js`, `assets/ejercicios.js`, `assets/libro-xlsx.js` | Práctica de asientos y «Mi libro diario» |
| `/joseguzman/contabilidad/curso/` | `contabilidad/curso/`, `assets/curso*.js`, `tools/curso_*.py` | Curso Dinámica del Plan Contable (CERTUS) y sus materiales |
| `/joseguzman/cuentas-claras/` | `cuentas-claras/` | Prototipo Cuentas Claras FDCP (`noindex`) |

Más detalle de cada sección en `README.md`.

## 3. Tareas frecuentes
- **Agregar una página nueva:** crea su carpeta con `index.html`. Si no debe salir en Google, pon `<meta name="robots" content="noindex">`. Agrégala en `assets/paginas.js` para que aparezca en «Mis páginas».
- **Registrar una web que vive fuera de este repo** (otra carpeta de politon.pe u otro dominio): solo agrégala en `assets/paginas.js`.
- **Atajo politon.pe/paginas:** es un archivo de redirección que José sube a mano a la raíz de politon.pe (ver `tools/raiz-politon/LEEME.md`). No hay que tocarlo para sumar páginas.
- **Subir una ponencia desde un PowerPoint:** copia el `.pptx` a `entrada/<id>.pptx` y crea `entrada/<id>.json` con `id`, `titulo`, `subtitulo`, `categoria`, `subcategoria`, `fecha`, `lugar`, `resumen`, `etiquetas`, `oculto` y `pptx` (ruta del archivo). Al publicar se convierte sola. Para verla antes, ejecuta `python3 tools/convertir_pptx.py entrada/<id>.json` y luego borra los dos archivos de `entrada/`. Los enlaces http del PowerPoint quedan clicables.
- **Subir un documento al curso:** cópialo a `contabilidad/curso/materiales/` y agrégalo en `MATERIALES` de `tools/curso_datos.py`. Luego ejecuta `python3 tools/curso_datos.py`; si es un Excel, también `python3 tools/curso_vistas_excel.py`. Se abre en el visor de la web. Enlace directo: `…/contabilidad/curso/#ver=<archivo>`.
- **Agregar un ejercicio de contabilidad:** en `assets/ejercicios.js`. Formato en `README.md`; cada ejercicio lleva `subido: 'dd/mm/aa'`.
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
- 20/11/2026: Practicar de contabilidad: botón ⇄ por línea para pasarla a otro asiento (o a uno nuevo en los propios); «⚙ Nombre y fecha» por asiento en los propios (`propio.info[k] = {titulo, fecha}`); «▤ Ver todos los asientos y cuentas T»; panel «¿Qué pasó?» con el efecto en la ecuación contable; botón «Hoy» en las fechas; estudio: `S.intentos[clave] = {n, fallos, primero, vio, repasar, desdeCero, t}` (filtro «Para repasar», aciertos al primer intento; se une con la nube por `t`) y cuestionario «🎯 Ponte a prueba» en Plan de cuentas.
- 19/11/2026: pantallas espejo (`assets/espejo.js`, botón «🖥️ Pantallas» en todas las ponencias y en el conversor). La laptop principal publica diapositiva, pantalla negra, zoom, láser y el estado de las diapositivas interactivas (`window.REDSYNC` + evento `red:cambio`). `remoto.js` no corre en modo espejo. Sustentación FDCP en v5 (19 diapositivas): la red interactiva muestra la pregunta de la entrevista y una pestaña «Instrumento».
- 19/11/2026: ponencia «Sustentación de tesis FDCP» (`ponencias/ciencia-politica/sustentacion-tesis-fdcp/`), hecha a mano desde el PPTX v4: diapositivas en imagen + la 7 es HTML interactivo (`red.js`, `red.css`, `red-datos.js`), que intercepta «siguiente/anterior» para recorrer las 6 redes de códigos antes de avanzar.
- 19/11/2026: se crea esta guía y la página «Mis páginas» (`/paginas/`, catálogo en `assets/paginas.js`).
- 17/11/2026: contabilidad con ejercicios de varios asientos, libro diario por ejercicio y Excel en Formato 5.1.
- 16/11/2026: prototipo Cuentas Claras FDCP.
- 13/11/2026: AA1 de POLITON en Ponencias y en Materiales del curso; el conversor conserva los enlaces del PowerPoint; enlace `#ver=` en el curso.
