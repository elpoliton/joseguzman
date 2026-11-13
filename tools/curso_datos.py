# -*- coding: utf-8 -*-
"""curso_datos.py — contenido de /contabilidad/curso/ (UD Dinámica del Plan Contable, CERTUS, ciclo 1).

Genera:
  assets/curso-datos.js            → window.CURSO (semanas, evaluaciones, casos, proyecto, preguntas, materiales)
  assets/ejercicios-curso.js       → casos de clase como ejercicios de la práctica (/contabilidad/)
Y comprueba que cada asiento cuadre y que el proyecto modelo cierre (activo = pasivo + patrimonio).
El Excel del proyecto modelo lo arma tools/curso_excel.py a partir de este mismo archivo.
Uso:  python3 tools/curso_datos.py
"""
import json, os, sys
from collections import defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Nombres que no están en assets/pcge-2019.js (elementos 9 y 0, y cuentas genéricas)
NOMBRES = {
    '94': 'Gastos administrativos', '95': 'Gastos de ventas', '97': 'Gastos financieros',
    '06': 'Bienes y valores recibidos', '09': 'Acreedoras por contra',
    '01': 'Bienes y valores entregados', '04': 'Deudoras por contra',
    '10': 'Efectivo y equivalentes de efectivo', '20': 'Mercaderías', '33': 'Propiedad, planta y equipo',
    '42': 'Cuentas por pagar comerciales – terceros', '45': 'Obligaciones financieras', '50': 'Capital',
    # nombres más claros para los niveles de 4 y 5 dígitos que usan los casos
    '102': 'Fondos fijos (caja chica)', '123': 'Letras por cobrar', '1212': 'Facturas por cobrar – emitidas en cartera',
    '1421': 'Suscripciones por cobrar a socios o accionistas', '20111': 'Mercaderías – costo',
    '395': 'Depreciación acumulada de propiedad, planta y equipo', '40171': 'Impuesto a la renta de tercera categoría',
    '4031': 'ESSALUD por pagar', '4032': 'ONP por pagar', '4111': 'Sueldos y salarios por pagar',
    '4212': 'Facturas por pagar – emitidas', '423': 'Letras por pagar', '4511': 'Préstamos de instituciones financieras',
    '4654': 'Pasivo por compra de propiedad, planta y equipo', '5011': 'Capital social – acciones',
    '5221': 'Capital adicional – aportes en trámite', '582': 'Reserva legal', '5911': 'Utilidades acumuladas',
    '6011': 'Compras – mercaderías', '6111': 'Variación de existencias – mercaderías', '6211': 'Sueldos y salarios',
    '6271': 'ESSALUD (régimen de prestaciones de salud)', '6731': 'Intereses por préstamos de instituciones financieras',
    '6841': 'Depreciación de propiedad, planta y equipo – costo', '6912': 'Costo de ventas – mercaderías (venta local)',
    '7012': 'Ventas – mercaderías (venta local)', '891': 'Determinación del resultado – utilidad',
}

def A(fecha, glosa, lineas, nota=''):
    """lineas: [cuenta, debe, haber]"""
    return {'fecha': fecha, 'glosa': glosa, 'lineas': [[c, round(d, 2), round(h, 2)] for c, d, h in lineas], 'nota': nota}

# ---------------------------------------------------------------- semanas (resumen de las PPT S1–S8)
SEMANAS = [
    {'n': 1, 'titulo': 'La empresa y el PCGE', 'logro': 'Comprende la naturaleza y el origen del Plan Contable General Empresarial.',
     'ideas': ['Empresa: personas, bienes y capacidades organizadas para producir o vender y obtener una utilidad.',
               'Por su responsabilidad: individual (responde con todo su patrimonio) o societaria (aportes en acciones o participaciones).',
               'Por su actividad: comercial, industrial, extractiva, de servicios, financiera o agrícola.',
               'Activo = recurso controlado que genera beneficios · Pasivo = obligación presente · Patrimonio = activo − pasivo.',
               'Corriente = 12 meses o menos · No corriente = más de 12 meses.',
               'Historia del plan en el Perú: PCG 1974 (inspirado en el plan francés de 1957) → PCGR 1985 → PCGE 2011 → PCGE modificado 2019.',
               'Sistemas contables: CONCAR, SISCONT o un registro en Excel.'],
     'avance': 'AA1 – etapa 1: formar el equipo, elegir una empresa comercial y llenar su ficha de constitución; revisar la estructura del PCGE.'},
    {'n': 2, 'titulo': 'Estructura del PCGE y cuentas T', 'logro': 'Interpreta la estructura del PCGE e identifica sus niveles.',
     'ideas': ['Niveles: elemento (1 dígito) → cuenta (2) → subcuenta (3) → divisionaria (4) → subdivisionaria (5).',
               'Elementos 1, 2 y 3 (activo) y 6 (gastos): nacen y aumentan en el DEBE.',
               'Elementos 4 (pasivo), 5 (patrimonio) y 7 (ingresos): nacen y aumentan en el HABER.',
               'Elemento 8: saldos intermediarios de gestión, cierran gastos e ingresos para hallar el resultado.',
               'Elemento 9: contabilidad analítica (costos y gastos por función) · Elemento 0: cuentas de orden.',
               'La cuenta T muestra de forma visual los cargos (debe) y abonos (haber) de una cuenta.',
               'El PCGE se subordina a las NIIF: primero se reconoce y mide con la norma, luego se registra con el plan.'],
     'avance': 'AA1 – etapa 2: organizar la información de la empresa, presentar la estructura del PCGE e identificar las cuentas de los elementos 1 a 4 a partir del asiento de apertura.'},
    {'n': 3, 'titulo': 'Elementos 1, 2 y 3: el activo', 'logro': 'Contabiliza correctamente en el libro diario operaciones del activo.',
     'ideas': ['Elemento 1 – activo disponible (caja, bancos) y exigible (cuentas por cobrar).',
               'Elemento 2 – activo realizable: existencias como las mercaderías.',
               'Elemento 3 – activo inmovilizado: muebles, vehículos, equipos de cómputo (más de un año de uso).',
               'Un cobro no es un ingreso nuevo: cambia una cuenta por cobrar (12) por dinero (10).',
               'Canje de factura por letra: sale la 121 y entra la 123 Letras por cobrar.',
               'La caja chica se registra en la 102 Fondos fijos.'],
     'avance': 'AA1 – etapa 3: analizar el asiento de apertura, relacionar las cuentas con el giro y registrar las operaciones del caso.'},
    {'n': 4, 'titulo': 'Elemento 4: el pasivo', 'logro': 'Contabiliza correctamente en el libro diario operaciones del pasivo.',
     'ideas': ['Pasivo corriente: vence en 12 meses o menos (proveedores, tributos, sueldos por pagar).',
               'Pasivo no corriente: vence en más de 12 meses (préstamos a largo plazo).',
               'Pagar una deuda: el pasivo disminuye (debe) y sale dinero del banco (haber).',
               '40 Tributos por pagar (IGV, renta, ESSALUD, ONP) · 41 Remuneraciones por pagar · 42 Proveedores · 45 Obligaciones financieras · 46 Cuentas por pagar diversas.',
               'Compra de un activo fijo al crédito: la deuda va a la 465 Pasivos por compra de activo inmovilizado, no a la 42.'],
     'avance': 'Entrega y exposición de la AA1 (25 % de la nota).'},
    {'n': 5, 'titulo': 'Elemento 5: el patrimonio', 'logro': 'Registra operaciones del patrimonio con criterio.',
     'ideas': ['Cuentas 50 a 59: capital, acciones de inversión, capital adicional, resultados no realizados, excedente de revaluación, reservas y resultados acumulados.',
               'Constitución en tres pasos: suscripción (14 / 52), pago del aporte (10 / 14) y formalización en registros públicos (52 / 50).',
               'La 52 Capital adicional es transitoria: guarda aportes que aún no están inscritos.',
               'Reserva legal: 10 % de la utilidad neta, hasta llegar al 20 % del capital (59 al debe, 58 al haber).',
               'La 59 Resultados acumulados recibe la utilidad o la pérdida del ejercicio.'],
     'avance': 'AA2 – etapa 1: organizar el proyecto en Excel y registrar las operaciones de los elementos 5, 6 y 7.'},
    {'n': 6, 'titulo': 'Elementos 6 y 7: gastos e ingresos', 'logro': 'Registra gastos e ingresos con las cuentas correctas.',
     'ideas': ['Elemento 6 (60–69): gastos por naturaleza. Nacen en el debe y se cierran con el elemento 8.',
               'Compra de mercadería en tres asientos: compra (60 + 40111 / 42), destino al almacén (20 / 61) y pago (42 / 10).',
               'Venta en tres asientos: venta (12 / 40111 + 70), costo de ventas (69 / 20) y cobro (10 / 12).',
               '62 personal · 63 servicios de terceros · 64 tributos · 65 otros gastos · 67 financieros · 68 depreciación y provisiones · 69 costo de ventas.',
               'Elemento 7 (70–79): ingresos. Nacen en el haber. La 79 sirve para pasar los gastos al elemento 9.'],
     'avance': 'Entrega y exposición de la AA2 (35 % de la nota).'},
    {'n': 7, 'titulo': 'Elemento 8: saldos intermediarios de gestión', 'logro': 'Cierra las cuentas de resultados con el elemento 8.',
     'ideas': ['Secuencia: 80 Margen comercial → 82 Valor agregado → 83 Excedente bruto de explotación → 84 Resultado de explotación → 85 Resultado antes de impuestos → 88 Impuesto a la renta → 89 Determinación del resultado.',
               '80 = ventas − compras ± variación de existencias (en una empresa comercial).',
               '82 resta los servicios de terceros (63); 83 resta personal (62) y tributos (64); 84 resta otros gastos (65), pérdidas (66) y provisiones (68) y suma otros ingresos (75).',
               '85 resta los gastos financieros (67) y suma los ingresos financieros (77).',
               'Impuesto a la renta de tercera categoría (régimen general): 29.5 % → 88 al debe, 40171 al haber.',
               'La utilidad neta pasa de la 89 a la 59 Resultados acumulados.'],
     'avance': 'AA3 – etapa 1: unir AA1 y AA2 y registrar las operaciones de los elementos 8, 9 y 0.'},
    {'n': 8, 'titulo': 'Elementos 9 y 0', 'logro': 'Registra costos por función y cuentas de orden.',
     'ideas': ['Elemento 9: la empresa crea sus propias cuentas. Referencia: 92 costos de producción, 94 gastos administrativos, 95 gastos de ventas, 97 gastos financieros.',
               'Asiento de destino: 94/95/97 al debe y 791 Cargas imputables a cuentas de costos y gastos al haber.',
               'Al cierre, la 791 se cancela contra las cuentas del elemento 9.',
               'Elemento 0: compromisos y contingencias que no afectan el patrimonio (garantías, bienes en consignación).',
               'Cuentas de orden deudoras (bienes entregados) y acreedoras (bienes recibidos), siempre con su cuenta "por contra".',
               'La participación de los trabajadores (NIC 19) es un gasto, no un reparto de utilidades.'],
     'avance': 'Entrega y exposición de la AA3 (40 % de la nota, junto con la participación).'},
]

# ---------------------------------------------------------------- casos de clase resueltos
CASOS = [
 {'id': 's2-codigos', 'sem': 2, 'titulo': 'Identifica el nivel de cada código', 'empresa': '—',
  'enunciado': 'Con ayuda del PCGE escribe el nombre de cada código y di si es cuenta, subcuenta, divisionaria o subdivisionaria.',
  'tabla': [['10', 'Efectivo y equivalentes de efectivo', 'Cuenta (2 dígitos)'],
            ['1041', 'Cuentas corrientes operativas', 'Divisionaria (4 dígitos)'],
            ['121', 'Facturas, boletas y otros comprobantes por cobrar', 'Subcuenta (3 dígitos)'],
            ['20111', 'Mercaderías – costo', 'Subdivisionaria (5 dígitos)'],
            ['40111', 'IGV – cuenta propia', 'Subdivisionaria (5 dígitos)'],
            ['42', 'Cuentas por pagar comerciales – terceros', 'Cuenta (2 dígitos)'],
            ['5011', 'Acciones', 'Divisionaria (4 dígitos)'],
            ['6011', 'Mercaderías (compras)', 'Divisionaria (4 dígitos)'],
            ['621', 'Remuneraciones', 'Subcuenta (3 dígitos)'],
            ['70', 'Ventas', 'Cuenta (2 dígitos)']],
  'explicacion': 'El nivel lo da la cantidad de dígitos: 2 = cuenta, 3 = subcuenta, 4 = divisionaria, 5 = subdivisionaria. El primer dígito siempre es el elemento.'},
 {'id': 's2-melgarejo', 'sem': 2, 'titulo': 'Melgarejo S.A.C. – cuentas T a 2 dígitos', 'empresa': 'Ferretería Melgarejo S.A.C.',
  'enunciado': 'Al 01/04: cuenta corriente S/ 13,000 · 50 bolsas de cemento a S/ 30 · 2 laptops de S/ 5,000 · factura por pagar a Aceros Arequipa S/ 6,000 · préstamo bancario S/ 10,000 · aportes de 2 socios de S/ 30,000 cada uno. Ubica cada partida en su cuenta T a 2 dígitos.',
  'tabla': [['10', 'Efectivo y equivalentes de efectivo', 'Activo · DEBE 13,000'],
            ['20', 'Mercaderías', 'Activo · DEBE 1,500 (50 × 30)'],
            ['33', 'Propiedad, planta y equipo', 'Activo · DEBE 10,000 (2 × 5,000)'],
            ['42', 'Cuentas por pagar comerciales – terceros', 'Pasivo · HABER 6,000'],
            ['45', 'Obligaciones financieras', 'Pasivo · HABER 10,000'],
            ['50', 'Capital', 'Patrimonio · HABER 60,000 (2 × 30,000)']],
  'explicacion': 'Activo nace en el debe; pasivo y patrimonio nacen en el haber. Ojo: si lo armas como asiento de apertura no cuadra (activo 24,500 contra pasivo + patrimonio 76,000). El ejercicio busca practicar en qué lado va cada cuenta, no un balance completo; si el profesor lo pide como apertura, pregunta qué pasó con el resto del aporte.'},
 {'id': 's3-arrozal', 'sem': 3, 'titulo': 'El Arrozal SAC – cobros, letra y caja chica', 'empresa': 'El Arrozal SAC (abarrotes)',
  'enunciado': '14/02 cobro de boleta B001-00005 por S/ 100 con transferencia · 16/02 cobro de factura F001-00021 por S/ 5,200 con transferencia · 20/02 canje de la factura F001-00022 de S/ 4,000 por una letra · 25/02 apertura de caja chica por S/ 2,000.',
  'asientos': [A('14/02', 'Por el cobro de la B001-00005, op. 44549', [['1041', 100, 0], ['1212', 0, 100]]),
               A('16/02', 'Por el cobro de la F001-00021, op. 67831', [['1041', 5200, 0], ['1212', 0, 5200]]),
               A('20/02', 'Por el canje de la F001-00022 por la letra L0001', [['123', 4000, 0], ['1212', 0, 4000]], 'El cliente sigue debiendo lo mismo; solo cambia el documento: de factura (121) a letra (123).'),
               A('25/02', 'Por la apertura de caja chica, doc. 20260225', [['102', 2000, 0], ['1041', 0, 2000]], 'Se asume que el dinero sale de la cuenta corriente.')],
  'explicacion': 'Todas son operaciones del elemento 1: el dinero o el derecho de cobro cambia de forma, pero el total del activo no cambia.'},
 {'id': 's3-patron', 'sem': 3, 'titulo': 'El Patrón SAC – constitución con aportes', 'empresa': 'El Patrón SAC (abarrotes)',
  'enunciado': 'El 10/01/26 se constituye con: socio A S/ 30,000 depositados en banco y 50 sacos de arroz por S/ 6,750; socio B S/ 40,000 depositados en banco y una laptop HP seminueva por S/ 4,000. Capital S/ 80,750.',
  'asientos': [A('10/01', 'Por los aportes de los socios según partida registral N.° 4567574',
                 [['1041', 70000, 0], ['20111', 6750, 0], ['3361', 4000, 0], ['5011', 0, 80750]],
                 'Dinero 30,000 + 40,000 = 70,000 · arroz a mercaderías · laptop a equipo de procesamiento de información.')],
  'explicacion': 'Versión directa (semana 3). En la semana 5 verás el método completo de tres pasos: suscripción (1421 / 5221), pago del aporte y formalización (5221 / 501).'},
 {'id': 's4-victor-1', 'sem': 4, 'titulo': 'Don Victor EIRL – pagos de marzo', 'empresa': 'Don Victor EIRL (abarrotes)',
  'enunciado': '02/03 se paga la factura de Grupo Vega Distribución por S/ 8,000 · 05/03 se paga la factura de Alicorp por S/ 15,000 · 10/03 se paga un préstamo bancario sin intereses de S/ 3,000. Todo con transferencia.',
  'asientos': [A('02/03', 'Por el pago de la F080-0034345, op. 6947', [['4212', 8000, 0], ['1041', 0, 8000]]),
               A('05/03', 'Por el pago de la F045-0098531, op. 354', [['4212', 15000, 0], ['1041', 0, 15000]]),
               A('10/03', 'Por el pago del préstamo bancario, op. 721', [['4511', 3000, 0], ['1041', 0, 3000]])],
  'explicacion': 'Pagar una deuda disminuye el pasivo (debe) y el banco (haber). La compra ya se registró antes; aquí solo se cancela la factura.'},
 {'id': 's4-victor-2', 'sem': 4, 'titulo': 'Don Victor EIRL – pagos de abril', 'empresa': 'Don Victor EIRL (abarrotes)',
  'enunciado': '03/04 se paga la factura de Importaciones Hiraoka por S/ 5,000 por una PC Lenovo · 17/04 se paga el IGV de marzo por S/ 3,000 · 30/04 se paga la planilla neta: S/ 4,500 + S/ 3,500 + S/ 1,500.',
  'asientos': [A('03/04', 'Por el pago de la F005-0047643 (PC Lenovo), op. 7974', [['4654', 5000, 0], ['1041', 0, 5000]], 'La PC es activo fijo: su deuda está en la 465, no en la 42.'),
               A('17/04', 'Por el pago del IGV de marzo, op. 14424', [['40111', 3000, 0], ['1041', 0, 3000]]),
               A('30/04', 'Por el pago de la planilla de abril, op. 721', [['4111', 9500, 0], ['1041', 0, 9500]], '4,500 + 3,500 + 1,500 = 9,500 neto a pagar.')],
  'explicacion': 'Si la compra de la PC no estaba registrada, primero va: 3361 4,237.29 y 40111 762.71 al debe, y 4654 5,000 al haber (5,000 / 1.18 = 4,237.29).'},
 {'id': 's5-grelsa-1', 'sem': 5, 'titulo': 'Comercial Grelsa SAC – constitución en 3 pasos', 'empresa': 'Comercial Grelsa SAC (ferretería)',
  'enunciado': 'El 20/05/26 se constituye con socio A S/ 80,000 y socio B S/ 20,000 depositados en banco (acciones de S/ 1). Registra la suscripción, el pago de los aportes y la formalización.',
  'asientos': [A('20/05', 'Por la suscripción de 100,000 acciones', [['1421', 100000, 0], ['5221', 0, 100000]], 'Los socios se comprometen a aportar: nace un derecho de cobro (14) y un aporte en trámite (52).'),
               A('20/05', 'Por el depósito de los aportes', [['1041', 100000, 0], ['1421', 0, 100000]]),
               A('20/05', 'Por la inscripción en registros públicos, partida N.° 74342443', [['5221', 100000, 0], ['5011', 0, 100000]], 'Ya inscrito, el aporte pasa de capital adicional (transitorio) a capital.')],
  'explicacion': 'La 52 Capital adicional guarda el aporte mientras se formaliza; al inscribirse pasa a la 50.'},
 {'id': 's5-grelsa-2', 'sem': 5, 'titulo': 'Comercial Grelsa SAC – reserva legal', 'empresa': 'Comercial Grelsa SAC',
  'enunciado': 'El 31/01/26 se constituye la reserva legal con la utilidad 2025 de S/ 50,000. Capital social S/ 100,000.',
  'asientos': [A('31/01', 'Por la reserva legal del ejercicio 2025', [['5911', 5000, 0], ['582', 0, 5000]], '10 % × 50,000 = 5,000. Tope: 20 % × 100,000 = 20,000. No se pasa del tope.')],
  'explicacion': 'La reserva sale de las utilidades acumuladas (59 al debe) y se guarda en la 58 Reservas (haber).'},
 {'id': 's6-estrella-compra', 'sem': 6, 'titulo': 'Boticas Estrella EIRL – compra de mercadería', 'empresa': 'Boticas Estrella EIRL (farmacia)',
  'enunciado': 'El 10/04/26 compra 20 bolsas de pañales a S/ 40 cada una más IGV (factura F040-434784 de Inretail Pharma SAC) y paga con transferencia.',
  'asientos': [A('10/04', 'Por la compra según F040-434784', [['6011', 800, 0], ['40111', 144, 0], ['4212', 0, 944]], '20 × 40 = 800 · IGV 18 % = 144 · total 944.'),
               A('10/04', 'Por el ingreso al almacén', [['20111', 800, 0], ['6111', 0, 800]], 'Asiento de destino: la compra pasa a existencias.'),
               A('10/04', 'Por el pago de la F040-434784, op. 3484843', [['4212', 944, 0], ['1041', 0, 944]])],
  'explicacion': 'El IGV de la compra es crédito fiscal (40111 al debe). La 60 y la 61 se cancelan entre sí al cierre; el inventario queda en la 20.'},
 {'id': 's6-estrella-venta', 'sem': 6, 'titulo': 'Boticas Estrella EIRL – venta de mercadería', 'empresa': 'Boticas Estrella EIRL (farmacia)',
  'enunciado': 'El 20/04/26 vende las 20 bolsas a S/ 45 cada una más IGV (F001-00001 a Negocios Waymaku EIRL) y cobra con transferencia.',
  'asientos': [A('20/04', 'Por la venta según F001-00001', [['1212', 1062, 0], ['40111', 0, 162], ['7012', 0, 900]], '20 × 45 = 900 · IGV 162 · total 1,062.'),
               A('20/04', 'Por el costo de la mercadería vendida', [['6912', 800, 0], ['20111', 0, 800]], 'Se usa el costo de compra (20 × 40), no el precio de venta.'),
               A('20/04', 'Por el cobro de la F001-00001, op. 3484843', [['1041', 1062, 0], ['1212', 0, 1062]])],
  'explicacion': 'Ganancia bruta de la operación: 900 − 800 = 100. El IGV de la venta (162) es una deuda con SUNAT, por eso va al haber.'},
 {'id': 's7-triunfo', 'sem': 7, 'titulo': 'Comercial El Triunfo SAC – margen comercial', 'empresa': 'Comercial El Triunfo SAC',
  'enunciado': 'Al 31/12/2025: ventas S/ 86,000, compras S/ 38,500 y variación de existencias S/ 4,800 (saldo deudor). Cierra 70, 60 y 61 con la 80 y pasa el margen a la 82.',
  'asientos': [A('31/12', 'Por el cierre de las ventas', [['7012', 86000, 0], ['801', 0, 86000]]),
               A('31/12', 'Por el cierre de las compras', [['801', 38500, 0], ['6011', 0, 38500]]),
               A('31/12', 'Por el cierre de la variación de existencias', [['801', 4800, 0], ['6111', 0, 4800]], 'Saldo deudor de la 61: el inventario bajó, así que se suma al costo.'),
               A('31/12', 'Por el traslado del margen comercial', [['801', 42700, 0], ['821', 0, 42700]])],
  'explicacion': 'Margen comercial = 86,000 − 38,500 − 4,800 = S/ 42,700. Si la 61 tuviera saldo acreedor (el inventario subió), se sumaría al margen.'},
 {'id': 's7-norte', 'sem': 7, 'titulo': 'Comercial El Norte SAC – impuesto a la renta', 'empresa': 'Comercial El Norte SAC',
  'enunciado': 'Utilidad antes de impuestos S/ 450,000 y tasa del impuesto a la renta 29.5 %. Calcula el impuesto y regístralo con las cuentas 88 y 89.',
  'asientos': [A('31/12', 'Por el impuesto a la renta del ejercicio', [['881', 132750, 0], ['40171', 0, 132750]], '450,000 × 29.5 % = 132,750.'),
               A('31/12', 'Por el traslado del impuesto a la determinación del resultado', [['891', 132750, 0], ['881', 0, 132750]]),
               A('31/12', 'Por el traslado de la utilidad neta', [['891', 317250, 0], ['5911', 0, 317250]], '450,000 − 132,750 = 317,250 para los accionistas.')],
  'explicacion': 'Nota de 3 líneas: la 88 se debita porque el impuesto es un gasto del ejercicio que reduce la utilidad. A la vez nace una deuda con SUNAT (40171), que aparece como pasivo corriente en el Estado de Situación Financiera. En el Estado de Resultados el impuesto se resta para llegar a la utilidad neta.'},
 {'id': 's8-logistica', 'sem': 8, 'titulo': 'Logística Integral SAC – destino y cuentas de orden', 'empresa': 'Logística Integral SAC',
  'enunciado': 'Recibo de luz S/ 200 + IGV y de teléfono S/ 100 + IGV; distribución 60 % administración y 40 % ventas. Además, recibe mercadería en consignación por S/ 15,000.',
  'asientos': [A('—', 'Por los recibos de luz y teléfono', [['6361', 200, 0], ['6364', 100, 0], ['40111', 54, 0], ['4212', 0, 354]]),
               A('—', 'Por el destino de los servicios', [['94', 180, 0], ['95', 120, 0], ['791', 0, 300]], '300 × 60 % = 180 administración · 300 × 40 % = 120 ventas. El IGV no se distribuye.'),
               A('—', 'Por la mercadería recibida en consignación', [['09', 15000, 0], ['06', 0, 15000]], 'Cuenta de orden acreedora (bienes recibidos) y su contracuenta.')],
  'explicacion': 'La mercadería en consignación no va al elemento 2 ni al 6 porque todavía no es de la empresa: solo la custodia. Por eso se controla en el elemento 0, que no afecta el balance. Revisa con tu profesor el código exacto que usa para el elemento 0; lo importante es registrar el par de cuentas de orden.'},
]

# ---------------------------------------------------------------- proyecto modelo (empresa ficticia)
PROY_FICHA = [
    ['Razón social', 'Ferretería Los Andes S.A.C. (empresa ficticia, solo de ejemplo)'],
    ['Tipo de empresa', 'Societaria – Sociedad Anónima Cerrada (S.A.C.), 2 socios'],
    ['Actividad', 'Comercial: venta al por menor de artículos de ferretería (CIIU 4752)'],
    ['Régimen tributario', 'Régimen general del impuesto a la renta (29.5 %) · IGV 18 %'],
    ['Inicio del proceso contable', '02/01/2026 con el asiento de apertura'],
    ['Periodo del modelo', 'Enero y febrero de 2026 (cierre didáctico al 28/02/2026; en la vida real el cierre es anual)'],
    ['Hechos económicos típicos', 'Compras a proveedores, ventas al crédito y al contado, cobros, pagos de servicios, planilla, préstamo bancario, depreciación'],
]
APERTURA = A('02/01', 'Por el asiento de apertura según inventario inicial', [
    ['101', 3000, 0], ['1041', 45000, 0], ['1212', 6000, 0], ['20111', 30000, 0],
    ['3341', 36000, 0], ['3351', 8400, 0], ['3361', 6000, 0],
    ['4212', 0, 12000], ['4511', 0, 20000], ['5011', 0, 102400]],
    'Capital = activo 134,400 − pasivo 32,000 = 102,400.')

PROY = [
 {'etapa': 'AA1', 'titulo': 'Elementos 1, 2, 3 y 4', 'asientos': [
    APERTURA,
    A('05/01', 'Por el cobro de la factura de un cliente, transferencia', [['1041', 6000, 0], ['1212', 0, 6000]], 'Elemento 1: cambia un derecho de cobro por dinero.'),
    A('08/01', 'Por la apertura de caja chica', [['102', 1000, 0], ['1041', 0, 1000]], 'Elemento 1.'),
    A('12/01', 'Por la compra de mercadería al crédito, F001-00450', [['6011', 10000, 0], ['40111', 1800, 0], ['4212', 0, 11800]], 'Elemento 2 (se necesita la 60: la verás en la semana 6).'),
    A('12/01', 'Por el ingreso de la mercadería al almacén', [['20111', 10000, 0], ['6111', 0, 10000]], 'Elemento 2: la mercadería entra a existencias.'),
    A('15/01', 'Por el canje de la factura del proveedor por una letra', [['4212', 12000, 0], ['423', 0, 12000]], 'Elemento 4: la deuda sigue, pero ahora es una letra.'),
    A('20/01', 'Por la compra de una laptop al crédito, F002-00031', [['3361', 3600, 0], ['40111', 648, 0], ['4654', 0, 4248]], 'Elemento 3: activo fijo. Su deuda va a la 465.'),
    A('22/01', 'Por el pago de la laptop, transferencia', [['4654', 4248, 0], ['1041', 0, 4248]], 'Elemento 4.'),
    A('30/01', 'Por la amortización del préstamo bancario', [['4511', 2000, 0], ['1041', 0, 2000]], 'Elemento 4.')]},
 {'etapa': 'AA2', 'titulo': 'Elementos 5, 6 y 7', 'asientos': [
    A('02/02', 'Por la suscripción del aumento de capital', [['1421', 10000, 0], ['5221', 0, 10000]], 'Elemento 5.'),
    A('03/02', 'Por el depósito del aporte', [['1041', 10000, 0], ['1421', 0, 10000]], 'Elemento 5.'),
    A('16/02', 'Por la inscripción del aumento de capital', [['5221', 10000, 0], ['5011', 0, 10000]], 'Elemento 5.'),
    A('05/02', 'Por la compra de mercadería, F001-00512', [['6011', 20000, 0], ['40111', 3600, 0], ['4212', 0, 23600]], 'Elemento 6.'),
    A('05/02', 'Por el ingreso de la mercadería al almacén', [['20111', 20000, 0], ['6111', 0, 20000]], 'Elemento 6 (61) y elemento 2.'),
    A('10/02', 'Por el pago de la F001-00512', [['4212', 23600, 0], ['1041', 0, 23600]]),
    A('12/02', 'Por la venta de mercadería, F001-00001', [['1212', 47200, 0], ['40111', 0, 7200], ['7012', 0, 40000]], 'Elemento 7.'),
    A('12/02', 'Por el costo de la mercadería vendida', [['6912', 26000, 0], ['20111', 0, 26000]], 'Elemento 6 (69).'),
    A('20/02', 'Por el cobro de la F001-00001', [['1041', 47200, 0], ['1212', 0, 47200]]),
    A('25/02', 'Por los recibos de luz e internet', [['6361', 500, 0], ['6365', 300, 0], ['40111', 144, 0], ['4212', 0, 944]], 'Elemento 6 (63).'),
    A('26/02', 'Por el pago de los recibos', [['4212', 944, 0], ['1041', 0, 944]]),
    A('27/02', 'Por el pago de intereses del préstamo', [['6731', 300, 0], ['1041', 0, 300]], 'Elemento 6 (67).'),
    A('28/02', 'Por la planilla de febrero', [['6211', 6000, 0], ['6271', 540, 0], ['4031', 0, 540], ['4032', 0, 780], ['4111', 0, 5220]], 'ESSALUD 9 % lo paga la empresa (gasto) · ONP 13 % se descuenta al trabajador.'),
    A('28/02', 'Por el pago de la planilla', [['4111', 5220, 0], ['1041', 0, 5220]])]},
 {'etapa': 'AA3', 'titulo': 'Ajustes y elementos 9, 0 y 8', 'asientos': [
    A('26/02', 'Por la mercadería recibida en consignación', [['09', 15000, 0], ['06', 0, 15000]], 'Elemento 0: no es de la empresa; no entra al balance.'),
    A('28/02', 'Por la depreciación de enero y febrero', [['6841', 1740, 0], ['395', 0, 1740]], 'Vehículo 36,000 × 20 % ÷ 12 × 2 = 1,200 · cómputo 9,600 × 25 % ÷ 12 × 2 = 400 · muebles 8,400 × 10 % ÷ 12 × 2 = 140.'),
    A('28/02', 'Por el destino de los gastos (elemento 9)', [['94', 4620, 0], ['95', 4460, 0], ['97', 300, 0], ['791', 0, 9380]], 'Servicios 60/40, planilla y depreciación 50/50, intereses 100 % a financieros.'),
    A('28/02', 'Por el cierre del costo de ventas', [['6111', 26000, 0], ['6912', 0, 26000]], 'La 69 se cancela contra la 61.'),
    A('28/02', 'Por el cierre de las ventas', [['7012', 40000, 0], ['801', 0, 40000]]),
    A('28/02', 'Por el cierre de las compras', [['801', 30000, 0], ['6011', 0, 30000]]),
    A('28/02', 'Por el cierre de la variación de existencias', [['6111', 4000, 0], ['801', 0, 4000]], 'Saldo acreedor: el inventario subió de 30,000 a 34,000.'),
    A('28/02', 'Por el margen comercial', [['801', 14000, 0], ['821', 0, 14000]], '40,000 − 30,000 + 4,000 = 14,000.'),
    A('28/02', 'Por el cierre de los servicios', [['821', 800, 0], ['6361', 0, 500], ['6365', 0, 300]]),
    A('28/02', 'Por el valor agregado', [['821', 13200, 0], ['831', 0, 13200]]),
    A('28/02', 'Por el cierre de los gastos de personal', [['831', 6540, 0], ['6211', 0, 6000], ['6271', 0, 540]]),
    A('28/02', 'Por el excedente bruto de explotación', [['831', 6660, 0], ['841', 0, 6660]]),
    A('28/02', 'Por el cierre de la depreciación', [['841', 1740, 0], ['6841', 0, 1740]]),
    A('28/02', 'Por el resultado de explotación', [['841', 4920, 0], ['851', 0, 4920]]),
    A('28/02', 'Por el cierre de los gastos financieros', [['851', 300, 0], ['6731', 0, 300]]),
    A('28/02', 'Por el resultado antes de impuestos', [['851', 4620, 0], ['891', 0, 4620]]),
    A('28/02', 'Por el impuesto a la renta', [['881', 1362.90, 0], ['40171', 0, 1362.90]], '4,620 × 29.5 % = 1,362.90.'),
    A('28/02', 'Por el traslado del impuesto', [['891', 1362.90, 0], ['881', 0, 1362.90]]),
    A('28/02', 'Por el cierre de las cuentas analíticas', [['791', 9380, 0], ['94', 0, 4620], ['95', 0, 4460], ['97', 0, 300]]),
    A('28/02', 'Por la utilidad neta del periodo', [['891', 3257.10, 0], ['5911', 0, 3257.10]], '4,620 − 1,362.90 = 3,257.10.')]},
]
DESTINO = [  # tabla de distribución del elemento 9
    ['63 Servicios (800)', 480, 320, 0], ['62 Personal (6,540)', 3270, 3270, 0],
    ['68 Depreciación (1,740)', 870, 870, 0], ['67 Intereses (300)', 0, 0, 300]]

# ---------------------------------------------------------------- evaluaciones y rúbricas
EVALS = [
 {'id': 'formativa', 'nombre': 'Avance de la AA1 (formativa)', 'semana': 2, 'peso': 'Sin nota (obligatoria)',
  'entrega': 'Word o PDF · Arial o Times 12 · interlineado 1.5 · carátula del Anexo 1 · nombre: AA1_Grupo N_Apellidos',
  'incluir': ['Selección de la empresa comercial', 'Ficha del proyecto de constitución', 'Estructura del PCGE', 'Identificación de cuentas de los elementos 1, 2, 3 y 4', 'Asiento de apertura y operaciones iniciales'],
  'criterios': [{'c': 'Responde al propósito de la evidencia', 'top': 'Que todo el avance gire en torno a la empresa elegida y su asiento de apertura.'},
                {'c': 'Integra los contenidos de la unidad', 'top': 'Usa los términos de clase: elemento, cuenta, subcuenta, divisionaria; activo corriente y no corriente.'},
                {'c': 'Información clara y coherente', 'top': 'Títulos, una tabla por idea y montos que cuadren.'},
                {'c': 'Incluye todo lo pedido para la semana', 'top': 'Revisa la lista de arriba antes de subirlo.'}]},
 {'id': 'aa1', 'nombre': 'AA1 – Elementos 1 al 4', 'semana': 4, 'peso': '25 %',
  'entrega': 'Excel · grupal (máx. 5) · cada integrante lo sube · nombre: AA1_Grupo N_Apellido_Nombre · exposición de 10 a 15 min con PPT o Canva · al menos 2 preguntas a otros grupos',
  'incluir': ['Breve descripción de la empresa y su actividad', 'Asiento de apertura como punto de partida', 'Cuentas de los elementos 1, 2, 3 y 4 según cada transacción', 'Registro en el libro diario siguiendo la dinámica del PCGE'],
  'criterios': [
    {'c': 'Cuentas del PCGE en el asiento de apertura', 'top': 'Registra la apertura separando activo, pasivo y patrimonio, y explica por qué cada cuenta va al debe o al haber (su naturaleza). Muestra el cálculo: capital = activo − pasivo.'},
    {'c': 'Contabilización del elemento 1', 'top': 'Registra cobros, caja chica y depósitos, y explica su efecto: el activo total no cambia, solo cambia de forma.'},
    {'c': 'Contabilización del elemento 2', 'top': 'Registra compras con su destino al almacén (20 / 61) y explica cómo cambia el inventario.'},
    {'c': 'Contabilización de los elementos 3 y 4', 'top': 'Registra un activo fijo con su deuda en la 465 y pagos de pasivos; explica corriente y no corriente.'},
    {'c': 'Respuesta asertiva (exposición)', 'top': 'Escucha la pregunta completa, repítela con tus palabras, responde con un ejemplo del caso y pregunta si quedó claro.'}]},
 {'id': 'aa2', 'nombre': 'AA2 – Elementos 5, 6 y 7', 'semana': 6, 'peso': '35 %',
  'entrega': 'Excel + informe en Word · nombre: AA2_Grupo N_Apellidos · exposición de 10 a 15 min',
  'incluir': ['Excel: identificación y clasificación de transacciones', 'Excel: cuentas de los elementos 5, 6 y 7', 'Excel: libro diario y proceso contable', 'Word: carátula, empresa, cuentas usadas, explicación del diario, observaciones y conclusiones'],
  'criterios': [
    {'c': 'Elemento 5 – patrimonio', 'top': 'Aporte en 3 pasos (14 / 52 / 50) y la explicación de por qué la 52 es transitoria.'},
    {'c': 'Elemento 6 – gastos', 'top': 'Compra, servicios, planilla e intereses, cada uno con su cuenta de 2 a 4 dígitos y el IGV separado.'},
    {'c': 'Elemento 7 – ingresos', 'top': 'Venta con IGV, costo de ventas y cobro: los tres asientos y su efecto en la utilidad.'},
    {'c': 'Integración de los elementos 5, 6 y 7', 'top': 'Explica cómo cada operación cambia el patrimonio y conecta las cuentas con el giro del negocio.'},
    {'c': 'Redacción coherente (Word)', 'top': 'Párrafos cortos, conectores (por ello, además, en consecuencia), cero faltas: revisa con el corrector y lee en voz alta.'}]},
 {'id': 'aa3', 'nombre': 'AA3 – Informe final (elementos 1 al 0)', 'semana': 8, 'peso': '40 % (70 % informe + 30 % participación)',
  'entrega': 'Excel + informe en Word · nombre: AA3_Grupo N_Apellido_Nombre · exposición de 10 a 15 min',
  'incluir': ['Excel: AA1 y AA2 unidos', 'Excel: elementos 9, 0 y 8 en el diario', 'Excel: ajustes, cierre y estados financieros', 'Word: carátula, empresa, avances previos, cuentas 9, 0 y 8, explicación, observaciones y conclusiones'],
  'criterios': [
    {'c': 'Elemento 9 – cuentas analíticas', 'top': 'Asiento de destino con una tabla de distribución (porcentajes por área) y su cierre contra la 791.'},
    {'c': 'Elemento 0 – cuentas de orden', 'top': 'Un caso real (consignación o garantía) con su par de cuentas y la explicación de por qué no afecta el balance.'},
    {'c': 'Elemento 8 – saldos intermediarios', 'top': 'Cierre completo 80 → 82 → 83 → 84 → 85 → 88 → 89 → 59, con el monto de cada saldo explicado.'},
    {'c': 'Estados financieros (NIIF)', 'top': 'Estado de Situación Financiera y Estado de Resultados que cuadren con el diario, con corriente / no corriente bien separado.'},
    {'c': 'Estructura clara y ordenada (Word)', 'top': 'Títulos y subtítulos, listas, tablas y negritas que guíen al lector; un índice al inicio.'}]},
]

# ---------------------------------------------------------------- preguntas (cuestionarios por semana)
# (semana, pregunta, opciones, índice correcto, explicación)
P = [
 (1, '¿Qué tipo de empresa compra bienes para revenderlos sin transformarlos?', ['Industrial', 'Comercial', 'Extractiva', 'De servicios'], 1, 'Una empresa comercial compra y revende, como un supermercado o una ferretería.'),
 (1, 'El dueño de una empresa individual responde por las deudas…', ['Solo con lo que aportó', 'Con todo su patrimonio', 'Solo con las ganancias', 'No responde'], 1, 'En la empresa individual (persona natural con negocio) la responsabilidad alcanza todo su patrimonio.'),
 (1, 'Según el PCGE, el patrimonio es…', ['Lo que la empresa debe', 'El dinero en el banco', 'Lo que queda del activo después de restar el pasivo', 'Las ventas del año'], 2, 'Patrimonio = activo − pasivo (parte residual).'),
 (1, 'Una deuda que vence en 8 meses es…', ['Pasivo corriente', 'Pasivo no corriente', 'Activo corriente', 'Patrimonio'], 0, 'Corriente = 12 meses o menos.'),
 (1, '¿En qué año se aprobó el PCGE modificado que se usa hoy?', ['1974', '1985', '2011', '2019'], 3, 'PCGE modificado 2019, Resolución N.° 002-2019-EF/30, vigente desde 2020.'),
 (1, 'El primer plan contable peruano (1973–74) se basó en el plan…', ['Español', 'Francés de 1957', 'Estadounidense', 'Alemán'], 1, 'El PCG peruano se inspiró en el plan contable francés de 1957, organizado en 10 clases.'),
 (1, 'Un local que la empresa usará 20 años es…', ['Activo corriente', 'Activo no corriente', 'Pasivo', 'Gasto'], 1, 'Se usa por más de 12 meses: activo no corriente.'),
 (1, '¿Cuál de estos es un sistema contable?', ['Canva', 'CONCAR', 'Zoom', 'Word'], 1, 'CONCAR y SISCONT son sistemas contables usados en el Perú.'),

 (2, '¿Cuántos dígitos tiene una divisionaria?', ['2', '3', '4', '5'], 2, 'Cuenta 2 · subcuenta 3 · divisionaria 4 · subdivisionaria 5.'),
 (2, 'El código 40111 es una…', ['Cuenta', 'Subcuenta', 'Divisionaria', 'Subdivisionaria'], 3, 'Tiene 5 dígitos: subdivisionaria (IGV – cuenta propia).'),
 (2, 'Las cuentas del activo nacen y aumentan en el…', ['Debe', 'Haber', 'Depende de la empresa', 'Elemento 8'], 0, 'Activo (1, 2, 3) y gastos (6): debe.'),
 (2, 'Las cuentas del pasivo nacen y aumentan en el…', ['Debe', 'Haber', 'Saldo', 'Elemento 0'], 1, 'Pasivo (4), patrimonio (5) e ingresos (7): haber.'),
 (2, '¿Qué elemento agrupa las cuentas de orden?', ['Elemento 0', 'Elemento 5', 'Elemento 8', 'Elemento 9'], 0, 'Elemento 0: compromisos y contingencias que no afectan el patrimonio.'),
 (2, '¿Para qué sirve el elemento 8?', ['Registrar compras', 'Cerrar ingresos y gastos para hallar el resultado', 'Registrar el capital', 'Controlar garantías'], 1, 'Saldos intermediarios de gestión: cierran las cuentas de resultados.'),
 (2, 'La 1041 «Cuentas corrientes operativas» pertenece al elemento…', ['1', '2', '4', '10'], 0, 'El primer dígito es el elemento: 1 = activo disponible y exigible.'),
 (2, 'Si una cuenta muestra movimientos en sus dos lados en forma de letra T, se llama…', ['Libro diario', 'Cuenta T', 'Balance', 'Kárdex'], 1, 'La cuenta T muestra cargos a la izquierda (debe) y abonos a la derecha (haber).'),

 (3, 'Se cobra una factura de un cliente por transferencia. ¿Qué cuenta va al DEBE?', ['1212', '1041', '7012', '4212'], 1, 'Entra dinero al banco: 1041 al debe. La factura por cobrar (1212) sale por el haber.'),
 (3, 'Al cobrar una factura, ¿aumenta el activo total?', ['Sí, por el monto cobrado', 'No, solo cambia de forma', 'Sí, se duplica', 'No, disminuye'], 1, 'Sale un derecho de cobro y entra dinero por el mismo monto.'),
 (3, 'La caja chica se registra en la cuenta…', ['101 Caja', '102 Fondos fijos', '104 Bancos', '121 Facturas'], 1, 'La caja chica es un fondo fijo: 102.'),
 (3, 'Se canjea una factura por cobrar por una letra. ¿Qué cuenta entra?', ['123 Letras por cobrar', '423 Letras por pagar', '121 Facturas', '101 Caja'], 0, 'El cliente firma una letra: 123 al debe, 121 al haber.'),
 (3, 'Las mercaderías pertenecen al elemento…', ['1', '2', '3', '6'], 1, 'Elemento 2: activo realizable (existencias).'),
 (3, 'Una camioneta para repartir pedidos va a la cuenta…', ['2011', '3341', '6011', '4211'], 1, '3341 Vehículos motorizados (elemento 3).'),
 (3, 'Un socio aporta una laptop a la empresa. ¿Qué cuenta va al DEBE?', ['5011', '3361', '2011', '6011'], 1, 'Es equipo de procesamiento de información (3361); el aporte va al haber del capital.'),
 (3, '¿Qué distingue al activo corriente del no corriente?', ['El color', 'Si se convierte en dinero o se usa en menos de un año', 'Si es de un socio', 'Si tiene IGV'], 1, 'Corriente: se usa o se realiza en el ciclo normal (menos de 12 meses).'),

 (4, 'Se paga a un proveedor por transferencia. El asiento es…', ['4212 al debe y 1041 al haber', '1041 al debe y 4212 al haber', '6011 al debe y 1041 al haber', '4212 al haber y 1212 al debe'], 0, 'Disminuye la deuda (debe) y sale dinero del banco (haber).'),
 (4, 'Se paga el IGV del mes a SUNAT. ¿Qué cuenta va al DEBE?', ['40111', '6411', '1041', '4212'], 0, 'Se cancela la deuda de IGV: 40111 al debe.'),
 (4, 'Un préstamo bancario a 3 años es…', ['Pasivo corriente', 'Pasivo no corriente', 'Activo no corriente', 'Ingreso'], 1, 'Vence en más de 12 meses: pasivo no corriente (la parte del próximo año suele mostrarse como corriente).'),
 (4, 'Se paga la planilla neta. ¿Qué cuenta se cancela?', ['6211 Sueldos', '4111 Sueldos por pagar', '4031 ESSALUD', '1212'], 1, 'Al registrar la planilla nació la deuda 4111; al pagar se cancela.'),
 (4, 'Una PC comprada al crédito genera deuda en la cuenta…', ['4212', '4654', '4511', '423'], 1, '465 Pasivos por compra de activo inmovilizado (4654 propiedad, planta y equipo).'),
 (4, 'El aporte a la ONP descontado al trabajador se registra en…', ['4032 ONP (haber)', '6271 (debe)', '4031 (debe)', '1041 (haber)'], 0, 'La empresa lo retiene y lo debe pagar: 4032 al haber.'),
 (4, 'Se canjea una factura por pagar por una letra. ¿Qué cuenta va al HABER?', ['4212', '423', '123', '1041'], 1, 'Nace la letra por pagar (423) y se cancela la factura (4212 al debe).'),
 (4, 'Las cuentas del elemento 4 disminuyen en el…', ['Debe', 'Haber', 'No disminuyen', 'Elemento 8'], 0, 'El pasivo nace en el haber y disminuye en el debe.'),

 (5, 'Cuando los socios se comprometen a aportar (suscripción), ¿qué cuenta va al DEBE?', ['1421', '5011', '1041', '5221'], 0, 'Nace un derecho de cobro a los socios: 1421 al debe, 5221 al haber.'),
 (5, 'La cuenta 52 Capital adicional es…', ['Permanente', 'Transitoria', 'De gasto', 'De orden'], 1, 'Guarda aportes hasta que se inscriben en registros públicos.'),
 (5, 'Al inscribir el capital en registros públicos…', ['5221 al debe y 5011 al haber', '5011 al debe y 5221 al haber', '1421 al debe y 5011 al haber', '1041 al debe y 5011 al haber'], 0, 'El aporte pasa de la 52 (transitoria) a la 50 Capital.'),
 (5, 'Utilidad neta S/ 50,000 y capital S/ 100,000. ¿Reserva legal del año?', ['S/ 2,500', 'S/ 5,000', 'S/ 10,000', 'S/ 20,000'], 1, '10 % de 50,000 = 5,000. El tope total es 20 % del capital (20,000).'),
 (5, 'La reserva legal tiene un tope de…', ['10 % del capital', '20 % del capital', '50 % de la utilidad', 'No tiene tope'], 1, 'Se detrae 10 % de la utilidad hasta que la reserva llegue al 20 % del capital.'),
 (5, 'Las utilidades no distribuidas se acumulan en la cuenta…', ['58', '59', '50', '89'], 1, '59 Resultados acumulados (5911 Utilidades acumuladas).'),
 (5, 'Las cuentas del patrimonio nacen en el…', ['Debe', 'Haber', 'Elemento 9', 'Depende'], 1, 'Igual que el pasivo: haber.'),
 (5, '¿Capital y patrimonio son lo mismo?', ['Sí', 'No: el capital es una parte del patrimonio', 'No: el patrimonio es una parte del capital', 'Solo en una EIRL'], 1, 'Patrimonio = capital + reservas + resultados acumulados + otros.'),

 (6, 'Compra de mercadería por S/ 800 + IGV. ¿Cuánto es el IGV?', ['S/ 80', 'S/ 144', 'S/ 152', 'S/ 800'], 1, '800 × 18 % = 144. Total de la factura: 944.'),
 (6, 'El asiento de destino de una compra de mercadería es…', ['20 al debe y 61 al haber', '60 al debe y 42 al haber', '69 al debe y 20 al haber', '42 al debe y 10 al haber'], 0, 'La mercadería entra al almacén: 20 al debe, 61 Variación de existencias al haber.'),
 (6, 'Al vender, el IGV de la venta va al…', ['Debe de la 40111', 'Haber de la 40111', 'Debe de la 70', 'Haber de la 12'], 1, 'Es una deuda con SUNAT: 40111 al haber.'),
 (6, 'El costo de ventas se registra…', ['69 al debe y 20 al haber', '20 al debe y 69 al haber', '70 al debe y 69 al haber', '60 al debe y 20 al haber'], 0, 'Sale mercadería del almacén a su costo: 69 al debe, 20 al haber.'),
 (6, 'El recibo de luz de la oficina se registra en la cuenta…', ['6361', '6211', '6011', '6731'], 0, '636 Servicios básicos → 6361 Energía eléctrica.'),
 (6, 'Los intereses de un préstamo bancario van a la cuenta…', ['63', '65', '67', '68'], 2, '67 Gastos financieros (6731).'),
 (6, 'El ESSALUD (9 %) que paga el empleador se registra en…', ['6271 al debe', '4032 al haber', '6211 al haber', '4111 al debe'], 0, 'Es un gasto de la empresa: 6271 al debe y 4031 al haber.'),
 (6, 'La depreciación de los equipos se registra en la cuenta…', ['68', '39 al debe', '33 al haber', '62'], 0, '68 al debe (6841) y 39 Depreciación acumulada al haber.'),

 (7, 'Ventas 86,000 · compras 38,500 · variación 4,800 (deudora). ¿Margen comercial?', ['S/ 42,700', 'S/ 47,500', 'S/ 52,300', 'S/ 81,200'], 0, '86,000 − 38,500 − 4,800 = 42,700.'),
 (7, '¿Qué cuenta resta los servicios de terceros (63)?', ['80', '82', '83', '85'], 1, '82 Valor agregado = margen − servicios.'),
 (7, 'Los gastos de personal (62) se cierran contra la…', ['80', '82', '83', '84'], 2, '83 Excedente bruto de explotación.'),
 (7, 'Los gastos financieros (67) se cierran contra la…', ['83', '84', '85', '89'], 2, '85 Resultado antes de participaciones e impuestos.'),
 (7, 'Utilidad antes de impuestos S/ 450,000, tasa 29.5 %. ¿Impuesto a la renta?', ['S/ 132,750', 'S/ 135,000', 'S/ 45,000', 'S/ 317,250'], 0, '450,000 × 0.295 = 132,750.'),
 (7, 'El impuesto a la renta del ejercicio se registra…', ['881 al debe y 40171 al haber', '40171 al debe y 881 al haber', '891 al debe y 1041 al haber', '6411 al debe'], 0, 'Es un gasto (88 al debe) y una deuda con SUNAT (40171 al haber).'),
 (7, 'La utilidad neta pasa de la 89 a la…', ['58', '59', '50', '70'], 1, '891 al debe y 5911 Utilidades acumuladas al haber.'),
 (7, '¿Cuál es el orden correcto?', ['80 → 82 → 83 → 84 → 85 → 89', '89 → 85 → 80', '82 → 80 → 84 → 83', '80 → 85 → 82'], 0, 'Margen, valor agregado, excedente bruto, resultado de explotación, resultado antes de impuestos y determinación del resultado.'),

 (8, 'En el asiento de destino, ¿qué cuenta va al HABER?', ['94', '95', '791', '6361'], 2, '791 Cargas imputables a cuentas de costos y gastos.'),
 (8, 'Un gasto de S/ 300 se reparte 60 % administración y 40 % ventas. ¿Cuánto va a la 94?', ['S/ 120', 'S/ 180', 'S/ 300', 'S/ 240'], 1, '300 × 60 % = 180 a gastos administrativos (94).'),
 (8, 'Las cuentas del elemento 9…', ['Son iguales para todas las empresas', 'Las define cada empresa según su necesidad', 'Solo existen en bancos', 'Reemplazan al elemento 6'], 1, 'El PCGE deja libre el elemento 9; 94, 95 y 97 son referenciales.'),
 (8, 'Mercadería recibida en consignación por S/ 15,000 se registra en…', ['Elemento 2', 'Elemento 6', 'Elemento 0', 'Elemento 4'], 2, 'No es de la empresa todavía: se controla en cuentas de orden.'),
 (8, 'Las cuentas de orden…', ['Aumentan el activo', 'No afectan el patrimonio ni el resultado', 'Son gastos', 'Son ingresos'], 1, 'Solo informan y controlan compromisos y contingencias.'),
 (8, 'Según la NIC 19, la participación de los trabajadores en las utilidades es…', ['Un reparto de utilidades', 'Un gasto', 'Un activo', 'Una reserva'], 1, 'Se reconoce como gasto cuando se devenga.'),
 (8, 'Al cierre, la 791 se cancela contra…', ['Las cuentas del elemento 9', 'La 59', 'La 40111', 'La 1041'], 0, '791 al debe y 94, 95, 97 al haber.'),
 (8, 'Los gastos de ventas (por función) se acumulan en la cuenta…', ['92', '94', '95', '97'], 2, '95 Gastos de ventas.'),
]
PREGUNTAS = [{'sem': s, 'q': q, 'op': o, 'ok': k, 'exp': e} for s, q, o, k, e in P]

# ---------------------------------------------------------------- materiales
MATERIALES = [
 {'grupo': 'Documentos del curso (CERTUS)', 'items': [
   ['Sílabo – Dinámica del Plan Contable', 'Sumilla, indicadores de logro (IL1–IL4), contenidos por sesión, evaluación y bibliografía. Nota mínima 13; inasistencias hasta 30 %.', [['PDF', 'silabo-dinamica-plan-contable.pdf']]],
   ['Descripción del proyecto', 'Proyecto de empresa comercial simulada, del asiento de apertura a los estados financieros, en equipos de 4 o 5. Entrega en Excel + Word y exposición.', [['PDF', 'descripcion-proyecto.pdf']]],
   ['Evaluación formativa (avance AA1)', 'Avance de la AA1 en la semana 2, sin nota pero obligatorio. Incluye la carátula del Anexo 1.', [['PDF', 'lineamiento-formativa-aa1.pdf']]],
   ['Lineamientos de evaluación', 'Qué entregar, formato, nombre del archivo y etapas por semana.', [['AA1', 'lineamiento-aa1.pdf'], ['AA2', 'lineamiento-aa2.pdf'], ['AA3', 'lineamiento-aa3.pdf']]],
   ['Rúbricas', 'Cinco criterios de 1 a 4 puntos (inicio, en proceso, logrado, sobresaliente) = 20 puntos.', [['AA1', 'rubrica-aa1.pdf'], ['AA2', 'rubrica-aa2.pdf'], ['AA3', 'rubrica-aa3.pdf']]],
   ['PPT de las semanas 1 a 8', 'Teoría y casos «Resuelve el caso» de cada clase (resueltos en la pestaña Casos de clase).', [['S%d' % n, 'ppt-semana-%d.pdf' % n] for n in range(1, 9)]]]},
 {'grupo': 'Plantillas y casos en Excel', 'items': [
   ['Formatos de contabilidad', 'Libro diario (formato 5.1), registro de ventas, registro de compras, caja y bancos (efectivo y cuenta corriente). Hay dos versiones que dio el profesor.', [['Versión 2', 'formatos-contabilidad-v2.xlsx'], ['Versión 1', 'formatos-contabilidad-v1.xlsx']]],
   ['Tablas de la SUNAT', 'Tablas de códigos de los libros electrónicos: medios de pago, tipos de comprobante, documentos de identidad, monedas, entre otras.', [['Excel', 'tablas-sunat.xlsx']]],
   ['Caso: Estado de Situación Financiera (resuelto)', 'Comercial Mendoza: clasificación de partidas, estado de situación financiera y asiento de apertura. Capital S/ 155,300. Resuelto con fórmulas sobre tu hoja TAREA.', [['Excel', 'caso-estado-situacion-financiera-resuelto-v1.xlsx']]]]},
 {'grupo': 'Mis entregas', 'items': [
   ['AA1 · POLITON E.I.R.L. · Informe', 'Informe de la AA1: apertura, cobranzas, pagos, compras, ingresos al almacén y compra de activos, con cada asiento explicado. Entregado el 12/11/2026.', [['PDF', 'aa1-politon-informe-v1.pdf']]],
   ['AA1 · POLITON E.I.R.L. · Libro diario', 'Asiento de apertura y 17 operaciones de octubre 2026 en el formato 5.1, con registro de compras, caja y bancos y un balance de comprobación con fórmulas.', [['Excel', 'aa1-politon-libro-diario-v1.xlsx']]]]},
]
ENLACES = [
  ['PCGE 2019 (PDF oficial, MEF)', 'https://www.mef.gob.pe/contenidos/conta_publ/documentac/PCGE_2019.pdf'],
  ['Resolución N.° 002-2019-EF/30', 'https://www.gob.pe/institucion/mef/normas-legales/277088-002-2019-ef-30'],
  ['Registrar o constituir una empresa (gob.pe)', 'https://www.gob.pe/269-registrar-o-constituir-una-empresa'],
  ['Método de la partida doble (Grupo Verona)', 'https://grupoverona.pe/preguntas-frecuentes-metodo-de-la-partida-doble/'],
]

# ================================================================= verificación
def cuadra(a):
    d = round(sum(l[1] for l in a['lineas']), 2); h = round(sum(l[2] for l in a['lineas']), 2)
    return d, h

errores = []
for c in CASOS:
    for a in c.get('asientos', []):
        d, h = cuadra(a)
        if abs(d - h) > 0.004: errores.append('%s: %s no cuadra (%s / %s)' % (c['id'], a['glosa'], d, h))
todos = [a for e in PROY for a in e['asientos']]
for a in todos:
    d, h = cuadra(a)
    if abs(d - h) > 0.004: errores.append('Proyecto: %s no cuadra (%s / %s)' % (a['glosa'], d, h))

saldo = defaultdict(float)
for a in todos:
    for c, d, h in a['lineas']: saldo[c] += d - h
saldo = {c: round(v, 2) for c, v in saldo.items() if abs(v) > 0.004}
for c in saldo:
    if c[0] in '6789': errores.append('Cuenta de resultados sin cerrar: %s = %s' % (c, saldo[c]))

def grupo(pref): return round(sum(v for c, v in saldo.items() if any(c.startswith(p) for p in pref)), 2)
ACT_C = grupo(['10', '12', '14', '20'])
ACT_NC = grupo(['33', '39'])
PAS = -grupo(['40', '41', '42', '423', '45', '46'])
PAT = -grupo(['50', '52', '59'])
ORDEN = grupo(['0'])
if abs(ACT_C + ACT_NC - PAS - PAT) > 0.004: errores.append('ESF no cuadra: activo %s, pasivo %s, patrimonio %s' % (ACT_C + ACT_NC, PAS, PAT))
if abs(saldo.get('09', 0) + saldo.get('06', 0)) > 0.004: errores.append('Cuentas de orden descuadradas')

if errores:
    print('\n'.join(errores)); sys.exit(1)
print('Saldos finales:', json.dumps(saldo, ensure_ascii=False))
print('Activo corriente %.2f · no corriente %.2f · pasivo %.2f · patrimonio %.2f' % (ACT_C, ACT_NC, PAS, PAT))

# Estados financieros (para la web y el Excel)
s = lambda c: saldo.get(c, 0)
ESF = {
 'activo_c': [['Efectivo y equivalentes de efectivo', s('101') + s('102') + s('1041')], ['Mercaderías', s('20111')]],
 'activo_nc': [['Propiedad, planta y equipo', s('3341') + s('3351') + s('3361')], ['(−) Depreciación acumulada', s('395')]],
 'pasivo_c': [['Tributos y aportes por pagar', -(s('40111') + s('40171') + s('4031') + s('4032'))], ['Cuentas por pagar comerciales', -(s('4212') + s('423'))]],
 'pasivo_nc': [['Obligaciones financieras', -s('4511')]],
 'patrimonio': [['Capital social', -s('5011')], ['Resultados acumulados', -s('5911')]],
}
ER = [['Ventas netas', 40000], ['(−) Costo de ventas', -26000], ['Utilidad bruta', 14000],
      ['(−) Gastos administrativos', -4620], ['(−) Gastos de ventas', -4460], ['Utilidad operativa', 4920],
      ['(−) Gastos financieros', -300], ['Utilidad antes de impuestos', 4620],
      ['(−) Impuesto a la renta (29.5 %)', -1362.90], ['Utilidad neta', 3257.10]]

# ================================================================= salida
CURSO = {'curso': 'Dinámica del Plan Contable', 'institucion': 'IES CERTUS', 'ciclo': 'Primero', 'creditos': 4, 'horas': 80,
         'notaMin': 13, 'semanas': SEMANAS, 'evals': EVALS, 'casos': CASOS,
         'proyecto': {'ficha': PROY_FICHA, 'etapas': PROY, 'destino': DESTINO, 'esf': ESF, 'er': ER, 'excel': 'proyecto-modelo-v1.xlsx'},
         'preguntas': PREGUNTAS, 'materiales': MATERIALES, 'enlaces': ENLACES, 'nombres': NOMBRES}
with open(os.path.join(RAIZ, 'assets', 'curso-datos.js'), 'w', encoding='utf-8') as f:
    f.write('/* curso-datos.js — generado por tools/curso_datos.py (no editar a mano) */\nwindow.CURSO = ')
    f.write(json.dumps(CURSO, ensure_ascii=False, separators=(',', ':')))
    f.write(';\n')

# Ejercicios para /contabilidad/ (solo asientos cuyas cuentas existen en el PCGE 2019 de la práctica)
ej = []
for c in CASOS:
    A_ = c.get('asientos', [])
    for i, a in enumerate(A_):
        if any(l[0][0] in '09' for l in a['lineas']): continue
        sol = []
        for cta, d, h in a['lineas']:
            sol.append({'lado': 'debe' if d else 'haber', 'cuentas': [cta], 'monto': d or h, 'nota': ''})
        ej.append({'id': 'curso-' + c['id'] + ('-%d' % (i + 1) if len(A_) > 1 else ''), 'fecha': a['fecha'],
                   'tema': 'Clase S%d' % c['sem'],
                   'enunciado': c['empresa'] + ': ' + c['enunciado'] + (' → Paso %d de %d: registra el asiento «%s».' % (i + 1, len(A_), a['glosa']) if len(A_) > 1 else ''),
                   'glosa': a['glosa'], 'solucion': sol,
                   'explicacion': (a['nota'] + ' ' if a['nota'] else '') + (c['explicacion'] if i == len(A_) - 1 else '')})
with open(os.path.join(RAIZ, 'assets', 'ejercicios-curso.js'), 'w', encoding='utf-8') as f:
    f.write('/* ejercicios-curso.js — casos de clase de Dinámica del Plan Contable (generado por tools/curso_datos.py) */\n')
    f.write('window.EJERCICIOS = (window.EJERCICIOS || []).concat(')
    f.write(json.dumps(ej, ensure_ascii=False, indent=1))
    f.write(');\n')
print('OK: %d casos, %d asientos del proyecto, %d preguntas, %d ejercicios de práctica' % (len(CASOS), len(todos), len(PREGUNTAS), len(ej)))
