# Regenera sitemap.xml desde el catálogo: python3 tools/sitemap.py
import json, os, re, datetime
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
src = open(os.path.join(R, 'assets', 'ponencias.js'), encoding='utf-8').read()
P = json.loads(src[src.index('['):src.rindex(']') + 1])
B = 'https://politon.pe/joseguzman/'
hoy = datetime.date.today().isoformat()
urls = [(B, hoy, '1.0'), (B + 'ponencias/', hoy, '0.8'), (B + 'contabilidad/', hoy, '0.7')] + [(B + 'ponencias/' + p['ruta'], p.get('fecha', hoy)[:10], '0.6') for p in P if not p.get('oculto')]
x = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
    f'  <url><loc>{u}</loc><lastmod>{d}</lastmod><priority>{pr}</priority></url>\n' for u, d, pr in urls) + '</urlset>\n'
open(os.path.join(R, 'sitemap.xml'), 'w', encoding='utf-8').write(x)
print(len(urls), 'direcciones en sitemap.xml')
