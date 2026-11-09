# -*- coding: utf-8 -*-
"""curso_excel.py — arma contabilidad/curso/proyecto-modelo-v1.xlsx con el proyecto modelo de tools/curso_datos.py.
Libro diario (formato 5.1), balance de comprobación con SUMIF y estados financieros con fórmulas.
Uso:  python3 tools/curso_excel.py   (luego recalcular con LibreOffice para guardar los valores)"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curso_datos as D
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.comments import Comment

RAIZ = D.RAIZ
txt = open(os.path.join(RAIZ, 'assets', 'pcge-2019.js'), encoding='utf-8').read()
js = txt[txt.index('= {', txt.index('window.PCGE["2019"]')) + 2:].rstrip().rstrip(';')
MAP = {c: n for c, n in json.loads(js)['cuentas']}
MAP.update(D.NOMBRES)
def nombre(c):
    n = MAP.get(c, '')
    return n[:1].upper() + n[1:].lower() if n.isupper() else n

AZ = '0F1E3D'
F = lambda **k: Font(name='Arial', size=k.pop('size', 10), **k)
fill = lambda c: PatternFill('solid', fgColor=c)
thin = Side(style='thin', color='C9D2E3')
BOX = Border(top=thin, bottom=thin, left=thin, right=thin)
NUM = '#,##0.00;(#,##0.00);"-"'

wb = Workbook()
# ------------------------------------------------------------ Ficha
ws = wb.active; ws.title = 'Ficha'
ws['A1'] = 'PROYECTO MODELO – Dinámica del Plan Contable'; ws['A1'].font = F(bold=True, size=14, color=AZ)
ws['A2'] = 'Ejemplo de referencia con una empresa ficticia. Úsalo para guiarte; tu equipo debe trabajar con su propia empresa.'
ws['A2'].font = F(italic=True, color='666666')
for i, (k, v) in enumerate(D.PROY_FICHA, start=4):
    ws.cell(i, 1, k).font = F(bold=True); ws.cell(i, 2, v).font = F()
    ws.cell(i, 2).alignment = Alignment(wrap_text=True, vertical='top')
ws.column_dimensions['A'].width = 28; ws.column_dimensions['B'].width = 90

# ------------------------------------------------------------ Libro Diario (formato 5.1)
dz = wb.create_sheet('Libro Diario')
dz['A1'] = 'FORMATO 5.1: LIBRO DIARIO'; dz['A1'].font = F(bold=True, size=13, color=AZ)
dz['A2'] = 'PERIODO: ENERO – FEBRERO 2026'; dz['A3'] = 'RAZÓN SOCIAL: FERRETERÍA LOS ANDES S.A.C. (ficticia)'
for c in ('A2', 'A3'): dz[c].font = F(bold=True)
H = ['N.° asiento', 'Etapa', 'Fecha', 'Glosa', 'Código', 'Denominación', 'Debe', 'Haber']
for j, h in enumerate(H, 1):
    c = dz.cell(5, j, h); c.font = F(bold=True, color='FFFFFF'); c.fill = fill(AZ); c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True); c.border = BOX
r = 6; n = 0
for etapa in D.PROY:
    for a in etapa['asientos']:
        n += 1; ini = r
        for k, (cta, d, h) in enumerate(a['lineas']):
            dz.cell(r, 1, n if k == 0 else None); dz.cell(r, 2, etapa['etapa'] if k == 0 else None)
            dz.cell(r, 3, a['fecha'] + '/2026' if k == 0 else None); dz.cell(r, 4, a['glosa'] if k == 0 else None)
            dz.cell(r, 5, cta); dz.cell(r, 6, ('      ' if not d else '') + nombre(cta))
            if d: dz.cell(r, 7, d)
            if h: dz.cell(r, 8, h)
            for j in range(1, 9):
                cl = dz.cell(r, j); cl.font = F(color='0000FF' if j in (7, 8) else '000000'); cl.border = BOX
                if j in (7, 8): cl.number_format = NUM
            dz.cell(r, 5).number_format = '@'
            r += 1
        if a['nota']: dz.cell(ini, 4).comment = Comment(a['nota'], 'Modelo')
fin = r - 1
dz.cell(r, 6, 'TOTALES').font = F(bold=True)
dz.cell(r, 7, '=SUM(G6:G%d)' % fin); dz.cell(r, 8, '=SUM(H6:H%d)' % fin)
dz.cell(r + 1, 6, 'Comprobación (debe − haber)').font = F(italic=True)
dz.cell(r + 1, 7, '=G%d-H%d' % (r, r))
for j in (7, 8):
    dz.cell(r, j).font = F(bold=True); dz.cell(r, j).number_format = NUM; dz.cell(r, j).fill = fill('F3D27A')
dz.cell(r + 1, 7).number_format = NUM
for col, w in zip('ABCDEFGH', [10, 7, 12, 52, 9, 52, 14, 14]): dz.column_dimensions[col].width = w
dz.freeze_panes = 'A6'
TOT = r
DR = '$E$6:$E$%d' % fin; DD = '$G$6:$G$%d' % fin; DH = '$H$6:$H$%d' % fin

# ------------------------------------------------------------ Balance de comprobación
bz = wb.create_sheet('Balance de comprobación')
bz['A1'] = 'BALANCE DE COMPROBACIÓN AL 28/02/2026 (después del cierre)'; bz['A1'].font = F(bold=True, size=13, color=AZ)
bz['A2'] = 'Sumas y saldos calculados desde el Libro Diario con SUMIF.'; bz['A2'].font = F(italic=True, color='666666')
for j, h in enumerate(['Código', 'Denominación', 'Suma debe', 'Suma haber', 'Saldo deudor', 'Saldo acreedor'], 1):
    c = bz.cell(4, j, h); c.font = F(bold=True, color='FFFFFF'); c.fill = fill(AZ); c.border = BOX; c.alignment = Alignment(horizontal='center')
codigos = sorted({l[0] for e in D.PROY for a in e['asientos'] for l in a['lineas']}, key=lambda c: (c[0] == '0', c))
r = 5
for c in codigos:
    bz.cell(r, 1, c).number_format = '@'; bz.cell(r, 2, nombre(c))
    bz.cell(r, 3, "=SUMIF('Libro Diario'!%s,A%d,'Libro Diario'!%s)" % (DR, r, DD))
    bz.cell(r, 4, "=SUMIF('Libro Diario'!%s,A%d,'Libro Diario'!%s)" % (DR, r, DH))
    bz.cell(r, 5, '=MAX(C%d-D%d,0)' % (r, r)); bz.cell(r, 6, '=MAX(D%d-C%d,0)' % (r, r))
    for j in range(1, 7):
        cl = bz.cell(r, j); cl.font = F(color='008000' if j in (3, 4) else '000000'); cl.border = BOX
        if j > 2: cl.number_format = NUM
    r += 1
bfin = r - 1
bz.cell(r, 2, 'TOTALES').font = F(bold=True)
for j, L in zip(range(3, 7), 'CDEF'):
    bz.cell(r, j, '=SUM(%s5:%s%d)' % (L, L, bfin)); bz.cell(r, j).font = F(bold=True); bz.cell(r, j).number_format = NUM; bz.cell(r, j).fill = fill('F3D27A')
for col, w in zip('ABCDEF', [9, 55, 15, 15, 15, 15]): bz.column_dimensions[col].width = w
bz.freeze_panes = 'A5'
fila_cta = {c: 5 + i for i, c in enumerate(codigos)}
def SAL(c, signo=1):  # saldo deudor − acreedor de una cuenta del balance
    rr = fila_cta[c]
    return "('Balance de comprobación'!E%d-'Balance de comprobación'!F%d)" % (rr, rr) if signo > 0 else "('Balance de comprobación'!F%d-'Balance de comprobación'!E%d)" % (rr, rr)
def MOV(c, lado):
    return "SUMIF('Libro Diario'!%s,\"%s\",'Libro Diario'!%s)" % (DR, c, DD if lado == 'd' else DH)

# ------------------------------------------------------------ Estados financieros
ez = wb.create_sheet('Estados financieros')
ez['A1'] = 'FERRETERÍA LOS ANDES S.A.C. (ficticia)'; ez['A1'].font = F(bold=True, size=13, color=AZ)
ez['A2'] = 'Estado de Situación Financiera al 28/02/2026 (en soles)'; ez['A2'].font = F(bold=True)
def sec(r, t): c = ez.cell(r, 1, t); c.font = F(bold=True, color='FFFFFF'); c.fill = fill(AZ); ez.cell(r, 2).fill = fill(AZ); return r + 1
def lin(r, t, f, bold=False):
    ez.cell(r, 1, t).font = F(bold=bold); c = ez.cell(r, 2, f); c.number_format = NUM; c.font = F(bold=bold)
    if bold: c.fill = fill('EEF2F9'); ez.cell(r, 1).fill = fill('EEF2F9')
    return r + 1
r = 4
r = sec(r, 'ACTIVO')
r = lin(r, 'Efectivo y equivalentes de efectivo', '=' + '+'.join(SAL(c) for c in ['101', '102', '1041'])); a1 = r - 1
r = lin(r, 'Mercaderías', '=' + SAL('20111')); a2 = r - 1
r = lin(r, 'Total activo corriente', '=SUM(B%d:B%d)' % (a1, a2), True); tac = r - 1
r = lin(r, 'Propiedad, planta y equipo', '=' + '+'.join(SAL(c) for c in ['3341', '3351', '3361'])); n1 = r - 1
r = lin(r, '(−) Depreciación acumulada', '=' + SAL('395')); n2 = r - 1
r = lin(r, 'Total activo no corriente', '=SUM(B%d:B%d)' % (n1, n2), True); tanc = r - 1
r = lin(r, 'TOTAL ACTIVO', '=B%d+B%d' % (tac, tanc), True); TA = r - 1
r += 1
r = sec(r, 'PASIVO Y PATRIMONIO')
r = lin(r, 'Tributos y aportes por pagar (IGV, renta, ESSALUD, ONP)', '=' + '+'.join(SAL(c, -1) for c in ['40111', '40171', '4031', '4032'])); p1 = r - 1
r = lin(r, 'Cuentas por pagar comerciales (facturas y letras)', '=' + '+'.join(SAL(c, -1) for c in ['4212', '423'])); p2 = r - 1
r = lin(r, 'Total pasivo corriente', '=SUM(B%d:B%d)' % (p1, p2), True); tpc = r - 1
r = lin(r, 'Obligaciones financieras (préstamo a largo plazo)', '=' + SAL('4511', -1)); p3 = r - 1
ez.cell(p3, 1).comment = Comment('Supuesto: préstamo a 3 años. Si una parte vence en los próximos 12 meses, esa parte se presenta como pasivo corriente.', 'Modelo')
r = lin(r, 'Total pasivo no corriente', '=B%d' % p3, True); tpnc = r - 1
r = lin(r, 'TOTAL PASIVO', '=B%d+B%d' % (tpc, tpnc), True); TP = r - 1
r = lin(r, 'Capital social', '=' + SAL('5011', -1)); q1 = r - 1
r = lin(r, 'Resultados acumulados (utilidad del periodo)', '=' + SAL('5911', -1)); q2 = r - 1
r = lin(r, 'TOTAL PATRIMONIO', '=SUM(B%d:B%d)' % (q1, q2), True); TPat = r - 1
r = lin(r, 'TOTAL PASIVO Y PATRIMONIO', '=B%d+B%d' % (TP, TPat), True); TPP = r - 1
r = lin(r, 'Comprobación: activo − (pasivo + patrimonio)', '=B%d-B%d' % (TA, TPP))
r += 1
ez.cell(r, 1, 'Cuentas de orden (nota): mercadería recibida en consignación').font = F(italic=True)
ez.cell(r, 2, '=' + MOV('06', 'h')).number_format = NUM
r += 2
ez.cell(r, 1, 'Estado de Resultados (por función) – enero y febrero 2026').font = F(bold=True); r += 1
r = sec(r, 'CONCEPTO')
r = lin(r, 'Ventas netas', '=' + MOV('7012', 'h')); e1 = r - 1
r = lin(r, '(−) Costo de ventas', '=-' + MOV('6912', 'd')); e2 = r - 1
r = lin(r, 'UTILIDAD BRUTA', '=B%d+B%d' % (e1, e2), True); ub = r - 1
r = lin(r, '(−) Gastos administrativos (94)', '=-' + MOV('94', 'd')); e3 = r - 1
r = lin(r, '(−) Gastos de ventas (95)', '=-' + MOV('95', 'd')); e4 = r - 1
r = lin(r, 'UTILIDAD OPERATIVA', '=B%d+B%d+B%d' % (ub, e3, e4), True); uo = r - 1
r = lin(r, '(−) Gastos financieros (97)', '=-' + MOV('97', 'd')); e5 = r - 1
r = lin(r, 'UTILIDAD ANTES DE IMPUESTOS', '=B%d+B%d' % (uo, e5), True); uai = r - 1
r = lin(r, '(−) Impuesto a la renta (29.5 %)', '=-ROUND(B%d*0.295,2)' % uai); e6 = r - 1
r = lin(r, 'UTILIDAD NETA', '=B%d+B%d' % (uai, e6), True); un = r - 1
r = lin(r, 'Comprobación: utilidad neta − resultados acumulados', '=B%d-B%d' % (un, q2))
ez.column_dimensions['A'].width = 58; ez.column_dimensions['B'].width = 18

out = os.path.join(RAIZ, 'contabilidad', 'curso', 'proyecto-modelo-v1.xlsx')
os.makedirs(os.path.dirname(out), exist_ok=True)
wb.save(out)
print('Excel:', out, '· filas del diario:', fin - 5, '· total en fila', TOT)
