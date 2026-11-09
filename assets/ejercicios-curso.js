/* ejercicios-curso.js — casos de clase de Dinámica del Plan Contable (generado por tools/curso_datos.py) */
window.EJERCICIOS = (window.EJERCICIOS || []).concat([
 {
  "id": "curso-s3-arrozal-1",
  "fecha": "14/02",
  "tema": "Clase S3",
  "enunciado": "El Arrozal SAC (abarrotes): 14/02 cobro de boleta B001-00005 por S/ 100 con transferencia · 16/02 cobro de factura F001-00021 por S/ 5,200 con transferencia · 20/02 canje de la factura F001-00022 de S/ 4,000 por una letra · 25/02 apertura de caja chica por S/ 2,000. → Paso 1 de 4: registra el asiento «Por el cobro de la B001-00005, op. 44549».",
  "glosa": "Por el cobro de la B001-00005, op. 44549",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "1041"
    ],
    "monto": 100,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1212"
    ],
    "monto": 100,
    "nota": ""
   }
  ],
  "explicacion": ""
 },
 {
  "id": "curso-s3-arrozal-2",
  "fecha": "16/02",
  "tema": "Clase S3",
  "enunciado": "El Arrozal SAC (abarrotes): 14/02 cobro de boleta B001-00005 por S/ 100 con transferencia · 16/02 cobro de factura F001-00021 por S/ 5,200 con transferencia · 20/02 canje de la factura F001-00022 de S/ 4,000 por una letra · 25/02 apertura de caja chica por S/ 2,000. → Paso 2 de 4: registra el asiento «Por el cobro de la F001-00021, op. 67831».",
  "glosa": "Por el cobro de la F001-00021, op. 67831",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "1041"
    ],
    "monto": 5200,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1212"
    ],
    "monto": 5200,
    "nota": ""
   }
  ],
  "explicacion": ""
 },
 {
  "id": "curso-s3-arrozal-3",
  "fecha": "20/02",
  "tema": "Clase S3",
  "enunciado": "El Arrozal SAC (abarrotes): 14/02 cobro de boleta B001-00005 por S/ 100 con transferencia · 16/02 cobro de factura F001-00021 por S/ 5,200 con transferencia · 20/02 canje de la factura F001-00022 de S/ 4,000 por una letra · 25/02 apertura de caja chica por S/ 2,000. → Paso 3 de 4: registra el asiento «Por el canje de la F001-00022 por la letra L0001».",
  "glosa": "Por el canje de la F001-00022 por la letra L0001",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "123"
    ],
    "monto": 4000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1212"
    ],
    "monto": 4000,
    "nota": ""
   }
  ],
  "explicacion": "El cliente sigue debiendo lo mismo; solo cambia el documento: de factura (121) a letra (123). "
 },
 {
  "id": "curso-s3-arrozal-4",
  "fecha": "25/02",
  "tema": "Clase S3",
  "enunciado": "El Arrozal SAC (abarrotes): 14/02 cobro de boleta B001-00005 por S/ 100 con transferencia · 16/02 cobro de factura F001-00021 por S/ 5,200 con transferencia · 20/02 canje de la factura F001-00022 de S/ 4,000 por una letra · 25/02 apertura de caja chica por S/ 2,000. → Paso 4 de 4: registra el asiento «Por la apertura de caja chica, doc. 20260225».",
  "glosa": "Por la apertura de caja chica, doc. 20260225",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "102"
    ],
    "monto": 2000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1041"
    ],
    "monto": 2000,
    "nota": ""
   }
  ],
  "explicacion": "Se asume que el dinero sale de la cuenta corriente. Todas son operaciones del elemento 1: el dinero o el derecho de cobro cambia de forma, pero el total del activo no cambia."
 },
 {
  "id": "curso-s3-patron",
  "fecha": "10/01",
  "tema": "Clase S3",
  "enunciado": "El Patrón SAC (abarrotes): El 10/01/26 se constituye con: socio A S/ 30,000 depositados en banco y 50 sacos de arroz por S/ 6,750; socio B S/ 40,000 depositados en banco y una laptop HP seminueva por S/ 4,000. Capital S/ 80,750.",
  "glosa": "Por los aportes de los socios según partida registral N.° 4567574",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "1041"
    ],
    "monto": 70000,
    "nota": ""
   },
   {
    "lado": "debe",
    "cuentas": [
     "20111"
    ],
    "monto": 6750,
    "nota": ""
   },
   {
    "lado": "debe",
    "cuentas": [
     "3361"
    ],
    "monto": 4000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "5011"
    ],
    "monto": 80750,
    "nota": ""
   }
  ],
  "explicacion": "Dinero 30,000 + 40,000 = 70,000 · arroz a mercaderías · laptop a equipo de procesamiento de información. Versión directa (semana 3). En la semana 5 verás el método completo de tres pasos: suscripción (1421 / 5221), pago del aporte y formalización (5221 / 501)."
 },
 {
  "id": "curso-s4-victor-1-1",
  "fecha": "02/03",
  "tema": "Clase S4",
  "enunciado": "Don Victor EIRL (abarrotes): 02/03 se paga la factura de Grupo Vega Distribución por S/ 8,000 · 05/03 se paga la factura de Alicorp por S/ 15,000 · 10/03 se paga un préstamo bancario sin intereses de S/ 3,000. Todo con transferencia. → Paso 1 de 3: registra el asiento «Por el pago de la F080-0034345, op. 6947».",
  "glosa": "Por el pago de la F080-0034345, op. 6947",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "4212"
    ],
    "monto": 8000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1041"
    ],
    "monto": 8000,
    "nota": ""
   }
  ],
  "explicacion": ""
 },
 {
  "id": "curso-s4-victor-1-2",
  "fecha": "05/03",
  "tema": "Clase S4",
  "enunciado": "Don Victor EIRL (abarrotes): 02/03 se paga la factura de Grupo Vega Distribución por S/ 8,000 · 05/03 se paga la factura de Alicorp por S/ 15,000 · 10/03 se paga un préstamo bancario sin intereses de S/ 3,000. Todo con transferencia. → Paso 2 de 3: registra el asiento «Por el pago de la F045-0098531, op. 354».",
  "glosa": "Por el pago de la F045-0098531, op. 354",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "4212"
    ],
    "monto": 15000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1041"
    ],
    "monto": 15000,
    "nota": ""
   }
  ],
  "explicacion": ""
 },
 {
  "id": "curso-s4-victor-1-3",
  "fecha": "10/03",
  "tema": "Clase S4",
  "enunciado": "Don Victor EIRL (abarrotes): 02/03 se paga la factura de Grupo Vega Distribución por S/ 8,000 · 05/03 se paga la factura de Alicorp por S/ 15,000 · 10/03 se paga un préstamo bancario sin intereses de S/ 3,000. Todo con transferencia. → Paso 3 de 3: registra el asiento «Por el pago del préstamo bancario, op. 721».",
  "glosa": "Por el pago del préstamo bancario, op. 721",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "4511"
    ],
    "monto": 3000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1041"
    ],
    "monto": 3000,
    "nota": ""
   }
  ],
  "explicacion": "Pagar una deuda disminuye el pasivo (debe) y el banco (haber). La compra ya se registró antes; aquí solo se cancela la factura."
 },
 {
  "id": "curso-s4-victor-2-1",
  "fecha": "03/04",
  "tema": "Clase S4",
  "enunciado": "Don Victor EIRL (abarrotes): 03/04 se paga la factura de Importaciones Hiraoka por S/ 5,000 por una PC Lenovo · 17/04 se paga el IGV de marzo por S/ 3,000 · 30/04 se paga la planilla neta: S/ 4,500 + S/ 3,500 + S/ 1,500. → Paso 1 de 3: registra el asiento «Por el pago de la F005-0047643 (PC Lenovo), op. 7974».",
  "glosa": "Por el pago de la F005-0047643 (PC Lenovo), op. 7974",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "4654"
    ],
    "monto": 5000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1041"
    ],
    "monto": 5000,
    "nota": ""
   }
  ],
  "explicacion": "La PC es activo fijo: su deuda está en la 465, no en la 42. "
 },
 {
  "id": "curso-s4-victor-2-2",
  "fecha": "17/04",
  "tema": "Clase S4",
  "enunciado": "Don Victor EIRL (abarrotes): 03/04 se paga la factura de Importaciones Hiraoka por S/ 5,000 por una PC Lenovo · 17/04 se paga el IGV de marzo por S/ 3,000 · 30/04 se paga la planilla neta: S/ 4,500 + S/ 3,500 + S/ 1,500. → Paso 2 de 3: registra el asiento «Por el pago del IGV de marzo, op. 14424».",
  "glosa": "Por el pago del IGV de marzo, op. 14424",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "40111"
    ],
    "monto": 3000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1041"
    ],
    "monto": 3000,
    "nota": ""
   }
  ],
  "explicacion": ""
 },
 {
  "id": "curso-s4-victor-2-3",
  "fecha": "30/04",
  "tema": "Clase S4",
  "enunciado": "Don Victor EIRL (abarrotes): 03/04 se paga la factura de Importaciones Hiraoka por S/ 5,000 por una PC Lenovo · 17/04 se paga el IGV de marzo por S/ 3,000 · 30/04 se paga la planilla neta: S/ 4,500 + S/ 3,500 + S/ 1,500. → Paso 3 de 3: registra el asiento «Por el pago de la planilla de abril, op. 721».",
  "glosa": "Por el pago de la planilla de abril, op. 721",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "4111"
    ],
    "monto": 9500,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1041"
    ],
    "monto": 9500,
    "nota": ""
   }
  ],
  "explicacion": "4,500 + 3,500 + 1,500 = 9,500 neto a pagar. Si la compra de la PC no estaba registrada, primero va: 3361 4,237.29 y 40111 762.71 al debe, y 4654 5,000 al haber (5,000 / 1.18 = 4,237.29)."
 },
 {
  "id": "curso-s5-grelsa-1-1",
  "fecha": "20/05",
  "tema": "Clase S5",
  "enunciado": "Comercial Grelsa SAC (ferretería): El 20/05/26 se constituye con socio A S/ 80,000 y socio B S/ 20,000 depositados en banco (acciones de S/ 1). Registra la suscripción, el pago de los aportes y la formalización. → Paso 1 de 3: registra el asiento «Por la suscripción de 100,000 acciones».",
  "glosa": "Por la suscripción de 100,000 acciones",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "1421"
    ],
    "monto": 100000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "5221"
    ],
    "monto": 100000,
    "nota": ""
   }
  ],
  "explicacion": "Los socios se comprometen a aportar: nace un derecho de cobro (14) y un aporte en trámite (52). "
 },
 {
  "id": "curso-s5-grelsa-1-2",
  "fecha": "20/05",
  "tema": "Clase S5",
  "enunciado": "Comercial Grelsa SAC (ferretería): El 20/05/26 se constituye con socio A S/ 80,000 y socio B S/ 20,000 depositados en banco (acciones de S/ 1). Registra la suscripción, el pago de los aportes y la formalización. → Paso 2 de 3: registra el asiento «Por el depósito de los aportes».",
  "glosa": "Por el depósito de los aportes",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "1041"
    ],
    "monto": 100000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1421"
    ],
    "monto": 100000,
    "nota": ""
   }
  ],
  "explicacion": ""
 },
 {
  "id": "curso-s5-grelsa-1-3",
  "fecha": "20/05",
  "tema": "Clase S5",
  "enunciado": "Comercial Grelsa SAC (ferretería): El 20/05/26 se constituye con socio A S/ 80,000 y socio B S/ 20,000 depositados en banco (acciones de S/ 1). Registra la suscripción, el pago de los aportes y la formalización. → Paso 3 de 3: registra el asiento «Por la inscripción en registros públicos, partida N.° 74342443».",
  "glosa": "Por la inscripción en registros públicos, partida N.° 74342443",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "5221"
    ],
    "monto": 100000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "5011"
    ],
    "monto": 100000,
    "nota": ""
   }
  ],
  "explicacion": "Ya inscrito, el aporte pasa de capital adicional (transitorio) a capital. La 52 Capital adicional guarda el aporte mientras se formaliza; al inscribirse pasa a la 50."
 },
 {
  "id": "curso-s5-grelsa-2",
  "fecha": "31/01",
  "tema": "Clase S5",
  "enunciado": "Comercial Grelsa SAC: El 31/01/26 se constituye la reserva legal con la utilidad 2025 de S/ 50,000. Capital social S/ 100,000.",
  "glosa": "Por la reserva legal del ejercicio 2025",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "5911"
    ],
    "monto": 5000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "582"
    ],
    "monto": 5000,
    "nota": ""
   }
  ],
  "explicacion": "10 % × 50,000 = 5,000. Tope: 20 % × 100,000 = 20,000. No se pasa del tope. La reserva sale de las utilidades acumuladas (59 al debe) y se guarda en la 58 Reservas (haber)."
 },
 {
  "id": "curso-s6-estrella-compra-1",
  "fecha": "10/04",
  "tema": "Clase S6",
  "enunciado": "Boticas Estrella EIRL (farmacia): El 10/04/26 compra 20 bolsas de pañales a S/ 40 cada una más IGV (factura F040-434784 de Inretail Pharma SAC) y paga con transferencia. → Paso 1 de 3: registra el asiento «Por la compra según F040-434784».",
  "glosa": "Por la compra según F040-434784",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "6011"
    ],
    "monto": 800,
    "nota": ""
   },
   {
    "lado": "debe",
    "cuentas": [
     "40111"
    ],
    "monto": 144,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "4212"
    ],
    "monto": 944,
    "nota": ""
   }
  ],
  "explicacion": "20 × 40 = 800 · IGV 18 % = 144 · total 944. "
 },
 {
  "id": "curso-s6-estrella-compra-2",
  "fecha": "10/04",
  "tema": "Clase S6",
  "enunciado": "Boticas Estrella EIRL (farmacia): El 10/04/26 compra 20 bolsas de pañales a S/ 40 cada una más IGV (factura F040-434784 de Inretail Pharma SAC) y paga con transferencia. → Paso 2 de 3: registra el asiento «Por el ingreso al almacén».",
  "glosa": "Por el ingreso al almacén",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "20111"
    ],
    "monto": 800,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "6111"
    ],
    "monto": 800,
    "nota": ""
   }
  ],
  "explicacion": "Asiento de destino: la compra pasa a existencias. "
 },
 {
  "id": "curso-s6-estrella-compra-3",
  "fecha": "10/04",
  "tema": "Clase S6",
  "enunciado": "Boticas Estrella EIRL (farmacia): El 10/04/26 compra 20 bolsas de pañales a S/ 40 cada una más IGV (factura F040-434784 de Inretail Pharma SAC) y paga con transferencia. → Paso 3 de 3: registra el asiento «Por el pago de la F040-434784, op. 3484843».",
  "glosa": "Por el pago de la F040-434784, op. 3484843",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "4212"
    ],
    "monto": 944,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1041"
    ],
    "monto": 944,
    "nota": ""
   }
  ],
  "explicacion": "El IGV de la compra es crédito fiscal (40111 al debe). La 60 y la 61 se cancelan entre sí al cierre; el inventario queda en la 20."
 },
 {
  "id": "curso-s6-estrella-venta-1",
  "fecha": "20/04",
  "tema": "Clase S6",
  "enunciado": "Boticas Estrella EIRL (farmacia): El 20/04/26 vende las 20 bolsas a S/ 45 cada una más IGV (F001-00001 a Negocios Waymaku EIRL) y cobra con transferencia. → Paso 1 de 3: registra el asiento «Por la venta según F001-00001».",
  "glosa": "Por la venta según F001-00001",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "1212"
    ],
    "monto": 1062,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "40111"
    ],
    "monto": 162,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "7012"
    ],
    "monto": 900,
    "nota": ""
   }
  ],
  "explicacion": "20 × 45 = 900 · IGV 162 · total 1,062. "
 },
 {
  "id": "curso-s6-estrella-venta-2",
  "fecha": "20/04",
  "tema": "Clase S6",
  "enunciado": "Boticas Estrella EIRL (farmacia): El 20/04/26 vende las 20 bolsas a S/ 45 cada una más IGV (F001-00001 a Negocios Waymaku EIRL) y cobra con transferencia. → Paso 2 de 3: registra el asiento «Por el costo de la mercadería vendida».",
  "glosa": "Por el costo de la mercadería vendida",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "6912"
    ],
    "monto": 800,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "20111"
    ],
    "monto": 800,
    "nota": ""
   }
  ],
  "explicacion": "Se usa el costo de compra (20 × 40), no el precio de venta. "
 },
 {
  "id": "curso-s6-estrella-venta-3",
  "fecha": "20/04",
  "tema": "Clase S6",
  "enunciado": "Boticas Estrella EIRL (farmacia): El 20/04/26 vende las 20 bolsas a S/ 45 cada una más IGV (F001-00001 a Negocios Waymaku EIRL) y cobra con transferencia. → Paso 3 de 3: registra el asiento «Por el cobro de la F001-00001, op. 3484843».",
  "glosa": "Por el cobro de la F001-00001, op. 3484843",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "1041"
    ],
    "monto": 1062,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "1212"
    ],
    "monto": 1062,
    "nota": ""
   }
  ],
  "explicacion": "Ganancia bruta de la operación: 900 − 800 = 100. El IGV de la venta (162) es una deuda con SUNAT, por eso va al haber."
 },
 {
  "id": "curso-s7-triunfo-1",
  "fecha": "31/12",
  "tema": "Clase S7",
  "enunciado": "Comercial El Triunfo SAC: Al 31/12/2025: ventas S/ 86,000, compras S/ 38,500 y variación de existencias S/ 4,800 (saldo deudor). Cierra 70, 60 y 61 con la 80 y pasa el margen a la 82. → Paso 1 de 4: registra el asiento «Por el cierre de las ventas».",
  "glosa": "Por el cierre de las ventas",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "7012"
    ],
    "monto": 86000,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "801"
    ],
    "monto": 86000,
    "nota": ""
   }
  ],
  "explicacion": ""
 },
 {
  "id": "curso-s7-triunfo-2",
  "fecha": "31/12",
  "tema": "Clase S7",
  "enunciado": "Comercial El Triunfo SAC: Al 31/12/2025: ventas S/ 86,000, compras S/ 38,500 y variación de existencias S/ 4,800 (saldo deudor). Cierra 70, 60 y 61 con la 80 y pasa el margen a la 82. → Paso 2 de 4: registra el asiento «Por el cierre de las compras».",
  "glosa": "Por el cierre de las compras",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "801"
    ],
    "monto": 38500,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "6011"
    ],
    "monto": 38500,
    "nota": ""
   }
  ],
  "explicacion": ""
 },
 {
  "id": "curso-s7-triunfo-3",
  "fecha": "31/12",
  "tema": "Clase S7",
  "enunciado": "Comercial El Triunfo SAC: Al 31/12/2025: ventas S/ 86,000, compras S/ 38,500 y variación de existencias S/ 4,800 (saldo deudor). Cierra 70, 60 y 61 con la 80 y pasa el margen a la 82. → Paso 3 de 4: registra el asiento «Por el cierre de la variación de existencias».",
  "glosa": "Por el cierre de la variación de existencias",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "801"
    ],
    "monto": 4800,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "6111"
    ],
    "monto": 4800,
    "nota": ""
   }
  ],
  "explicacion": "Saldo deudor de la 61: el inventario bajó, así que se suma al costo. "
 },
 {
  "id": "curso-s7-triunfo-4",
  "fecha": "31/12",
  "tema": "Clase S7",
  "enunciado": "Comercial El Triunfo SAC: Al 31/12/2025: ventas S/ 86,000, compras S/ 38,500 y variación de existencias S/ 4,800 (saldo deudor). Cierra 70, 60 y 61 con la 80 y pasa el margen a la 82. → Paso 4 de 4: registra el asiento «Por el traslado del margen comercial».",
  "glosa": "Por el traslado del margen comercial",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "801"
    ],
    "monto": 42700,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "821"
    ],
    "monto": 42700,
    "nota": ""
   }
  ],
  "explicacion": "Margen comercial = 86,000 − 38,500 − 4,800 = S/ 42,700. Si la 61 tuviera saldo acreedor (el inventario subió), se sumaría al margen."
 },
 {
  "id": "curso-s7-norte-1",
  "fecha": "31/12",
  "tema": "Clase S7",
  "enunciado": "Comercial El Norte SAC: Utilidad antes de impuestos S/ 450,000 y tasa del impuesto a la renta 29.5 %. Calcula el impuesto y regístralo con las cuentas 88 y 89. → Paso 1 de 3: registra el asiento «Por el impuesto a la renta del ejercicio».",
  "glosa": "Por el impuesto a la renta del ejercicio",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "881"
    ],
    "monto": 132750,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "40171"
    ],
    "monto": 132750,
    "nota": ""
   }
  ],
  "explicacion": "450,000 × 29.5 % = 132,750. "
 },
 {
  "id": "curso-s7-norte-2",
  "fecha": "31/12",
  "tema": "Clase S7",
  "enunciado": "Comercial El Norte SAC: Utilidad antes de impuestos S/ 450,000 y tasa del impuesto a la renta 29.5 %. Calcula el impuesto y regístralo con las cuentas 88 y 89. → Paso 2 de 3: registra el asiento «Por el traslado del impuesto a la determinación del resultado».",
  "glosa": "Por el traslado del impuesto a la determinación del resultado",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "891"
    ],
    "monto": 132750,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "881"
    ],
    "monto": 132750,
    "nota": ""
   }
  ],
  "explicacion": ""
 },
 {
  "id": "curso-s7-norte-3",
  "fecha": "31/12",
  "tema": "Clase S7",
  "enunciado": "Comercial El Norte SAC: Utilidad antes de impuestos S/ 450,000 y tasa del impuesto a la renta 29.5 %. Calcula el impuesto y regístralo con las cuentas 88 y 89. → Paso 3 de 3: registra el asiento «Por el traslado de la utilidad neta».",
  "glosa": "Por el traslado de la utilidad neta",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "891"
    ],
    "monto": 317250,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "5911"
    ],
    "monto": 317250,
    "nota": ""
   }
  ],
  "explicacion": "450,000 − 132,750 = 317,250 para los accionistas. Nota de 3 líneas: la 88 se debita porque el impuesto es un gasto del ejercicio que reduce la utilidad. A la vez nace una deuda con SUNAT (40171), que aparece como pasivo corriente en el Estado de Situación Financiera. En el Estado de Resultados el impuesto se resta para llegar a la utilidad neta."
 },
 {
  "id": "curso-s8-logistica-1",
  "fecha": "—",
  "tema": "Clase S8",
  "enunciado": "Logística Integral SAC: Recibo de luz S/ 200 + IGV y de teléfono S/ 100 + IGV; distribución 60 % administración y 40 % ventas. Además, recibe mercadería en consignación por S/ 15,000. → Paso 1 de 3: registra el asiento «Por los recibos de luz y teléfono».",
  "glosa": "Por los recibos de luz y teléfono",
  "solucion": [
   {
    "lado": "debe",
    "cuentas": [
     "6361"
    ],
    "monto": 200,
    "nota": ""
   },
   {
    "lado": "debe",
    "cuentas": [
     "6364"
    ],
    "monto": 100,
    "nota": ""
   },
   {
    "lado": "debe",
    "cuentas": [
     "40111"
    ],
    "monto": 54,
    "nota": ""
   },
   {
    "lado": "haber",
    "cuentas": [
     "4212"
    ],
    "monto": 354,
    "nota": ""
   }
  ],
  "explicacion": ""
 }
]);
