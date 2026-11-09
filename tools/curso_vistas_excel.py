# -*- coding: utf-8 -*-
"""curso_vistas_excel.py — convierte los Excel de contabilidad/curso/materiales/ en vistas JSON para abrirlos en la web.
Lee los valores calculados (no las fórmulas). Uso:  python3 tools/curso_vistas_excel.py"""
import json, os, glob
from openpyxl import load_workbook
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = os.path.join(R, 'contabilidad', 'curso', 'materiales')
OUT = os.path.join(M, 'vistas'); os.makedirs(OUT, exist_ok=True)
MAX_F, MAX_C = 400, 30

def fmt(v):
    if v is None: return ''
    if isinstance(v, bool): return 'Sí' if v else 'No'
    if isinstance(v, int): return str(v)
    if isinstance(v, float): return ('%.2f' % v).rstrip('0').rstrip('.') if abs(v - round(v)) > 1e-9 else str(int(round(v)))
    if hasattr(v, 'strftime'): return v.strftime('%d/%m/%Y')
    return str(v).strip()

for f in sorted(glob.glob(os.path.join(M, '*.xlsx'))):
    wb = load_workbook(f, data_only=True)
    hojas = []
    for ws in wb.worksheets:
        filas = []
        for row in ws.iter_rows(min_row=1, max_row=min(ws.max_row or 1, 3000), max_col=MAX_C, values_only=True):
            filas.append([fmt(v) for v in row])
        while filas and not any(filas[-1]): filas.pop()          # quita filas vacías al final
        nc = max([max([i + 1 for i, v in enumerate(r) if v] or [0]) for r in filas] or [0])
        filas = [r[:nc] for r in filas][:MAX_F]
        if not filas: continue
        hojas.append({'nombre': ws.title, 'filas': filas, 'recortado': (ws.max_row or 0) > MAX_F and len(filas) >= MAX_F})
    nombre = os.path.basename(f)
    json.dump({'archivo': nombre, 'hojas': hojas}, open(os.path.join(OUT, nombre + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(nombre, [(h['nombre'], len(h['filas'])) for h in hojas])
