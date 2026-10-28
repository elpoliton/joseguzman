# Genera el ícono (favicon) y la tarjeta para redes (og-image) de politon.pe/joseguzman.
# Uso:  python3 tools/marca.py <lato-latin-900-normal.woff> <lato-latin-700-normal.woff> [foto.jpg]
#       node tools/rasterizar.cjs        (convierte los SVG a PNG)
import sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
IMG = os.path.join(ROOT, 'assets', 'img')
os.makedirs(IMG, exist_ok=True)
NAVY, NAVY2, GOLD, MAG = '#0F1E3D', '#182C55', '#C9A227', '#BF0085'
woff900, woff700 = sys.argv[1], sys.argv[2]
foto = sys.argv[3] if len(sys.argv) > 3 else None

def text_path(font_file, text, size, tracking=0):
    f = TTFont(font_file); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    s = size / upm; x = 0; d = []
    for ch in text:
        g = cmap[ord(ch)]; pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x, 0)))
        d.append(pen.getCommands()); x += gs[g].width * s + tracking
    bp = BoundsPen(gs); xx = 0
    for ch in text:
        g = cmap[ord(ch)]; gs[g].draw(TransformPen(bp, (s, 0, 0, -s, xx, 0))); xx += gs[g].width * s + tracking
    return ' '.join(d), bp.bounds  # bounds: xmin, ymin, xmax, ymax (y hacia abajo)

# ---------- ícono: monograma JG dorado sobre azul, con un atril/micrófono estilizado (ponencias)
d, (x0, y0, x1, y1) = text_path(woff900, 'JG', 300, -6)
w, h = x1 - x0, y1 - y0
sc = 300 / max(w, h * 1.05)
tx = 256 - (x0 + w / 2) * sc
ty = 236 - (y0 + h / 2) * sc
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{NAVY2}"/><stop offset="1" stop-color="{NAVY}"/></linearGradient></defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <rect x="20" y="20" width="472" height="472" rx="96" fill="none" stroke="{GOLD}" stroke-opacity=".55" stroke-width="10"/>
  <path transform="translate({tx:.1f} {ty:.1f}) scale({sc:.4f})" d="{d}" fill="{GOLD}"/>
  <rect x="166" y="392" width="180" height="22" rx="11" fill="{MAG}"/>
</svg>'''
open(os.path.join(ROOT, 'favicon.svg'), 'w').write(svg)
open(os.path.join(IMG, 'icono.svg'), 'w').write(svg)

# ---------- tarjeta para redes 1200 × 630
W, H = 1200, 630
im = Image.new('RGB', (W, H), NAVY)
dr = ImageDraw.Draw(im)
for yy in range(H):  # degradado vertical sutil
    t = yy / H; c = tuple(int(a + (b - a) * t) for a, b in zip((24, 44, 85), (15, 30, 61)))
    dr.line([(0, yy), (W, yy)], fill=c)
F9 = lambda s: ImageFont.truetype(woff900, s); F7 = lambda s: ImageFont.truetype(woff700, s)
left = 72
if foto:
    ph = Image.open(foto).convert('RGB'); pw = 430; phh = H
    r = max(pw / ph.width, phh / ph.height); ph = ph.resize((int(ph.width * r) + 1, int(ph.height * r) + 1), Image.LANCZOS)
    cx = (ph.width - pw) // 2; ph = ph.crop((cx, 0, cx + pw, phh))
    im.paste(ph, (W - pw, 0)); dr.rectangle([W - pw - 8, 0, W - pw, H], fill=GOLD)
    maxw = W - pw - 120
else:
    ic = None; maxw = W - 160
dr.text((left, 92), 'POLITÓLOGO · FUNDADOR DE POLITON', font=F7(26), fill=GOLD)
y = 140
for line in ['José Manuel', 'Guzmán Valverde']:
    s = 86
    while dr.textlength(line, font=F9(s)) > maxw and s > 50: s -= 2
    dr.text((left, y), line, font=F9(s), fill='white'); y += int(s * 1.08)
dr.rectangle([left, y + 18, left + 120, y + 26], fill=MAG)
y += 56
for line in ['Innovación política, representación', 'institucional y tecnología cívica']:
    dr.text((left, y), line, font=F7(32), fill='#CDD6EA'); y += 44
dr.text((left, H - 76), 'politon.pe/joseguzman', font=F7(26), fill=GOLD)
im.save(os.path.join(IMG, 'og-image.jpg'), quality=88)
print('ok', 'con foto' if foto else 'sin foto')
