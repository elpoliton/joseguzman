# Genera assets/pcge-2019.js y assets/pcge-2026.js desde el dataset abierto pcge-peru (Apache 2.0).
# Uso: python3 tools/pcge_datos.py <carpeta src/pcge/data del repo pcge-peru>
import json, os, sys
# Divisionarias que el dataset omite y que sí trae el PCGE oficial: (código, nombre, va después de)
CORRECCIONES = {'2019': [('70121', 'Terceros', '7012'), ('70122', 'Relacionadas', '70121')]}
D = sys.argv[1]; R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
for v in ('2019', '2026'):
    E = json.load(open(os.path.join(D, v, 'entries.json'), encoding='utf-8'))
    S = json.load(open(os.path.join(D, v, 'source.json'), encoding='utf-8'))
    data = {'version': v, 'titulo': S['title'], 'resolucion': S['resolution'], 'vigencia': S['mandatory_effective_date'], 'url': S['resolution_url'],
            'cuentas': [[e['code'], e['name']] for e in E]}
    for cod, nom, tras in CORRECCIONES.get(v, []):
        cs = data['cuentas']
        if not any(c[0] == cod for c in cs):
            cs.insert(next(i for i, c in enumerate(cs) if c[0] == tras) + 1, [cod, nom])
    open(os.path.join(R, 'assets', f'pcge-{v}.js'), 'w', encoding='utf-8').write(
        f'/* PCGE {v} — {S["title"]} ({S["resolution"]}). Datos: github.com/mat-l-dev/pcge-peru (Apache 2.0). Generado por tools/pcge_datos.py */\n'
        f'window.PCGE = window.PCGE || {{}};\nwindow.PCGE["{v}"] = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(v, len(E), 'cuentas')
