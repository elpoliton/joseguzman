# Genera assets/pcge-2019.js y assets/pcge-2026.js desde el dataset abierto pcge-peru (Apache 2.0).
# Uso: python3 tools/pcge_datos.py <carpeta src/pcge/data del repo pcge-peru>
import json, os, sys
D = sys.argv[1]; R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
for v in ('2019', '2026'):
    E = json.load(open(os.path.join(D, v, 'entries.json'), encoding='utf-8'))
    S = json.load(open(os.path.join(D, v, 'source.json'), encoding='utf-8'))
    data = {'version': v, 'titulo': S['title'], 'resolucion': S['resolution'], 'vigencia': S['mandatory_effective_date'], 'url': S['resolution_url'],
            'cuentas': [[e['code'], e['name']] for e in E]}
    open(os.path.join(R, 'assets', f'pcge-{v}.js'), 'w', encoding='utf-8').write(
        f'/* PCGE {v} — {S["title"]} ({S["resolution"]}). Datos: github.com/mat-l-dev/pcge-peru (Apache 2.0). Generado por tools/pcge_datos.py */\n'
        f'window.PCGE = window.PCGE || {{}};\nwindow.PCGE["{v}"] = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(v, len(E), 'cuentas')
