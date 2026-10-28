# politon.pe/joseguzman

Página personal de José Manuel Guzmán Valverde y biblioteca de ponencias. Sitio estático, sin dependencias ni paso de compilación.

## Estructura
- `index.html` — página de presentación.
- `ponencias/index.html` — biblioteca con buscador y filtros por categoría y subcategoría.
- `ponencias/<subcategoria>/<ponencia>/index.html` — cada ponencia, con sus videos y su PDF en `media/`.
- `assets/ponencias.js` — catálogo: agrega aquí cada ponencia nueva.
- `assets/deck.js` y `assets/deck.css` — motor de diapositivas (lienzo 1600 × 900).
- `assets/site.js` y `assets/site.css` — página personal y biblioteca.
- `assets/icons.js` — íconos; se regeneran con `node tools/iconos.cjs` (requiere react, react-dom y react-icons).
- `sw.js` — modo sin conexión (botón «Sin conexión» de cada ponencia).

## Presentar
Abre la ponencia y pulsa **F** para pantalla completa. El puntero USB avanza y retrocede (envía AvPág/RePág o flechas).
**S** abre la vista del presentador (notas, siguiente diapositiva y cronómetro); **B** pone la pantalla en negro; **K** pausa el video.
En las diapositivas con video, «siguiente» primero reproduce el video y la siguiente pulsación avanza.

## Publicación
Cada cambio en la rama `main` se publica solo por FTP en politon.pe/joseguzman (`.github/workflows/publicar.yml`).
