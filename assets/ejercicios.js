/* ejercicios.js — ejercicios de asientos contables para /contabilidad (PCGE 2019, vigente hasta 2027).
   Un ejercicio tiene «solucion» (un asiento) o «asientos» (varios, cada uno con su solución). Cada solución lista las líneas esperadas: «cuentas» acepta varias opciones (la primera es la recomendada). */
window.EJERCICIOS = [
  {
    id: 'cobro-beta', fecha: '5/10/26', tema: 'Cobranzas', subido: '30/10/26',
    enunciado: 'Se cobra en efectivo la factura N.° E001-00201, pendiente de cobranza, de nuestro cliente empresa BETA SAC por un valor de S/ 5,000.',
    glosa: 'Por el cobro de la fact. E001-00201',
    solucion: [
      { lado: 'debe', cuentas: ['101'], monto: 5000, nota: 'Entra efectivo a la empresa: aumenta Caja (activo), por eso va al debe.' },
      { lado: 'haber', cuentas: ['1212', '121'], monto: 5000, nota: 'La factura ya no se nos debe: disminuye la cuenta por cobrar (activo), por eso va al haber.' }
    ],
    explicacion: 'Cobrar una factura no es un ingreso nuevo (la venta ya se registró antes): solo cambia un activo por otro. Sale la cuenta por cobrar (12) y entra dinero (10).'
  },
  {
    id: 'cobro-maryluna', fecha: '6/10/26', tema: 'Cobranzas', subido: '30/10/26',
    enunciado: 'Se cobra la factura E001-5020 al cliente empresa Maryluna SAC por S/ 1,000 mediante transferencia bancaria.',
    glosa: 'Por el cobro de la fact. E001-5020',
    solucion: [
      { lado: 'debe', cuentas: ['1041', '104'], monto: 1000, nota: 'Transferencia = entra a la cuenta del banco: 1041 Cuentas corrientes operativas.' },
      { lado: 'haber', cuentas: ['1212', '121'], monto: 1000, nota: 'Se cancela la factura por cobrar.' }
    ],
    explicacion: 'Igual que el cobro en efectivo, pero el dinero entra al banco (104) en lugar de a Caja (101). Revisa el monto: el enunciado dice S/ 1,000.'
  },
  {
    id: 'cobro-sanchez', fecha: '7/10/26', tema: 'Cobranzas', subido: '30/10/26',
    enunciado: 'Se cobra la factura E001-01022 a la empresa Sánchez Hnos. por un monto total de S/ 25,000. El 10 % fue pagado en efectivo y el resto mediante transferencia.',
    glosa: 'Por el cobro de la fact. E001-01022',
    solucion: [
      { lado: 'debe', cuentas: ['101'], monto: 2500, nota: '10 % de 25,000 = 2,500 en efectivo.' },
      { lado: 'debe', cuentas: ['1041', '104'], monto: 22500, nota: 'El resto, 22,500, por transferencia al banco.' },
      { lado: 'haber', cuentas: ['1212', '121'], monto: 25000, nota: 'Se cancela la factura completa.' }
    ],
    explicacion: 'Un asiento puede tener varias cuentas en el debe. Lo importante es que la suma del debe (2,500 + 22,500) sea igual a la del haber (25,000).'
  },
  {
    id: 'cobro-letra', fecha: '9/10/26', tema: 'Letras', subido: '30/10/26',
    enunciado: 'Se hace la cobranza de la letra de pago N.° 001-250 por un monto de S/ 7,800 mediante transferencia.',
    glosa: 'Por la cobranza de la letra 001-250',
    solucion: [
      { lado: 'debe', cuentas: ['1041', '104'], monto: 7800, nota: 'Entra el dinero al banco.' },
      { lado: 'haber', cuentas: ['1232', '1233', '123'], monto: 7800, nota: 'La letra ya fue cobrada: sale de Letras por cobrar (1232 si estaba en cartera, 1233 si estaba en cobranza en el banco).' }
    ],
    explicacion: 'Ojo con el lado: al cobrar la letra, la cuenta 123 Letras por cobrar DISMINUYE, así que va al HABER, no al debe. Al debe va lo que aumenta: el banco.'
  },
  {
    id: 'cobro-prestamo', fecha: '10/10/26', tema: 'Personal', subido: '30/10/26',
    enunciado: 'Se hace el cobro en efectivo de un préstamo a nuestro trabajador José Sánchez por S/ 1,500.',
    glosa: 'Por el cobro del préstamo al trabajador José Sánchez',
    solucion: [
      { lado: 'debe', cuentas: ['101'], monto: 1500, nota: 'Entra efectivo a Caja.' },
      { lado: 'haber', cuentas: ['1411', '141'], monto: 1500, nota: 'Se cancela lo que nos debía el trabajador: 1411 Préstamos (al personal).' }
    ],
    explicacion: 'Lo que nos deben los trabajadores no va en la 12 (clientes), sino en la 14: Cuentas por cobrar al personal. 1411 es Préstamos.'
  },
  {
    id: 'venta-delta', fecha: '12/10/26', tema: 'Ventas con IGV', subido: '30/10/26',
    enunciado: 'Se vende mercadería al crédito a la empresa Delta SAC por S/ 1,180 (IGV incluido), factura E001-00310.',
    glosa: 'Por la venta según fact. E001-00310',
    solucion: [
      { lado: 'debe', cuentas: ['1212', '121'], monto: 1180, nota: 'El cliente nos debe el total, IGV incluido.' },
      { lado: 'haber', cuentas: ['40111', '4011', '401'], monto: 180, nota: 'IGV = 1,180 − 1,000 = 180: deuda con la Sunat (pasivo).' },
      { lado: 'haber', cuentas: ['7012', '701'], monto: 1000, nota: 'Valor de venta sin IGV: 1,180 ÷ 1.18 = 1,000 (7012 Mercaderías – venta local).' }
    ],
    explicacion: 'Es el caso del video de la clase 4: de los S/ 1,180, solo S/ 1,000 son venta; los S/ 180 son IGV que se le debe a la Sunat.'
  },
  {
    id: 'compra-proveedores', fecha: '13/10/26', tema: 'Compras con IGV', subido: '30/10/26',
    enunciado: 'Se compra mercadería al crédito a Proveedores Unidos SAC por S/ 2,360 (IGV incluido), factura F001-00045.',
    glosa: 'Por la compra según fact. F001-00045',
    solucion: [
      { lado: 'debe', cuentas: ['6011', '601'], monto: 2000, nota: 'Valor de compra sin IGV: 2,360 ÷ 1.18 = 2,000.' },
      { lado: 'debe', cuentas: ['40111', '4011', '401'], monto: 360, nota: 'IGV de la compra = crédito fiscal (se resta del IGV de las ventas).' },
      { lado: 'haber', cuentas: ['4212', '421'], monto: 2360, nota: 'Le debemos el total al proveedor (pasivo corriente).' }
    ],
    explicacion: 'Espejo de la venta: aquí el IGV va al DEBE de la 40 porque es crédito fiscal. Luego se hace el asiento de destino (20 Mercaderías contra 61 Variación de inventarios).'
  },
  {
    id: 'pago-proveedores', fecha: '15/10/26', tema: 'Pagos', subido: '30/10/26',
    enunciado: 'Se paga por transferencia la factura F001-00045 a Proveedores Unidos SAC por S/ 2,360.',
    glosa: 'Por el pago de la fact. F001-00045',
    solucion: [
      { lado: 'debe', cuentas: ['4212', '421'], monto: 2360, nota: 'Se cancela la deuda con el proveedor: el pasivo disminuye, va al debe.' },
      { lado: 'haber', cuentas: ['1041', '104'], monto: 2360, nota: 'Sale dinero del banco: el activo disminuye, va al haber.' }
    ],
    explicacion: 'Regla práctica: el activo aumenta por el debe y disminuye por el haber; el pasivo, al revés.'
  },

  /* ---- Ejercicios de varios asientos: cada uno es un libro diario propio (Formato 5.1) ---- */
  {
    id: 'constitucion-gretsa', fecha: '20/05/26', tema: 'Patrimonio: constitución', subido: '17/11/26',
    empresa: 'Comercial Gretsa SAC', ruc: '20406489095', periodo: 'Mayo 2026',
    enunciado: 'El 20/05/26 Comercial Gretsa SAC (RUC 20406489095) se constituye con los siguientes aportes, según partida registral N.° 74342443: Socio A, S/ 80,000 depositados en banco (80,000 acciones de S/ 1.00); Socio B, S/ 20,000 depositados en banco (20,000 acciones de S/ 1.00). Capital: S/ 100,000. Elabora en el Libro Diario (Formato 5.1) los asientos de la suscripción de capital, la cancelación de aportes y la formalización en Registros Públicos.',
    explicacion: 'Constitución en tres pasos: suscripción (14 / 52), cancelación del aporte (10 / 14) y formalización (52 / 50). Al final, la 1421 y la 5221 quedan en cero: solo quedan S/ 100,000 en el banco y S/ 100,000 de capital social.',
    asientos: [
      {
        titulo: 'Suscripción', doc: 'Minuta de constitución', glosa: 'Por la suscripción de 100,000 acciones de S/ 1.00 c/u',
        solucion: [
          { lado: 'debe', cuentas: ['1421', '142'], monto: 80000, detalle: 'Suscripciones por cobrar – Socio A', nota: 'Los socios se comprometen a aportar: nace una cuenta por cobrar a cargo de ellos (activo, al debe). Puedes poner una línea por socio o una sola por S/ 100,000.' },
          { lado: 'debe', cuentas: ['1421', '142'], monto: 20000, detalle: 'Suscripciones por cobrar – Socio B', nota: '' },
          { lado: 'haber', cuentas: ['5221', '522'], monto: 100000, nota: 'El capital aún no está inscrito: va a 5221 Aportes (capitalizaciones en trámite), que es transitoria.' }
        ],
        explicacion: 'Suscribir es comprometerse a aportar. Todavía no entra dinero: la empresa registra lo que los socios le deben (1421) y el capital en trámite (5221).'
      },
      {
        titulo: 'Cancelación de aportes', doc: 'Voucher de depósito', glosa: 'Por el depósito en banco de los aportes suscritos',
        solucion: [
          { lado: 'debe', cuentas: ['1041', '104'], monto: 100000, nota: 'Los socios depositan el dinero en la cuenta corriente de la empresa.' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 80000, detalle: 'Suscripciones por cobrar – Socio A', nota: 'Se cancela lo que debían los socios: la cuenta por cobrar disminuye (haber).' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 20000, detalle: 'Suscripciones por cobrar – Socio B', nota: '' }
        ],
        explicacion: 'Un activo se cambia por otro: sale la cuenta por cobrar a los socios (14) y entra el dinero al banco (10).'
      },
      {
        titulo: 'Formalización en Registros Públicos', doc: 'Partida registral N.° 74342443', glosa: 'Por la inscripción del capital social, partida registral N.° 74342443',
        solucion: [
          { lado: 'debe', cuentas: ['5221', '522'], monto: 100000, nota: 'Se cierra la cuenta transitoria de capital en trámite.' },
          { lado: 'haber', cuentas: ['5011', '501'], monto: 100000, nota: 'Con la inscripción, el aporte ya es capital social definitivo: 5011 Acciones, porque es una SAC.' }
        ],
        explicacion: 'Inscrita la sociedad, el aporte pasa de «en trámite» (52) a capital social (50).'
      }
    ]
  },
  {
    id: 'constitucion-ferremax', fecha: '25/05/26', tema: 'Patrimonio: constitución', subido: '17/11/26',
    empresa: 'Comercial Ferremax SAC', ruc: '20607894531', periodo: 'Mayo 2026',
    enunciado: 'Rubro: venta al por menor de materiales de construcción y artículos de ferretería. El 25/05/2026 se constituye Comercial Ferremax SAC (RUC 20607894531). Según la minuta de constitución, los socios aportan, depositados en la cuenta bancaria de la empresa: Socio A, S/ 60,000 (60,000 acciones de S/ 1.00); Socio B, S/ 30,000 (30,000 acciones); Socio C, S/ 10,000 (10,000 acciones). Capital social: S/ 100,000. La constitución queda formalizada e inscrita en los Registros Públicos, según partida registral N.° 75483921. Registra los asientos en el Libro Diario.',
    explicacion: 'Mismo esquema de tres asientos (14 / 52 → 10 / 14 → 52 / 50), ahora con tres socios. Si detallas por socio, la suma de las líneas de la 1421 debe dar S/ 100,000.',
    asientos: [
      {
        titulo: 'Suscripción', doc: 'Minuta de constitución', glosa: 'Por la suscripción de 100,000 acciones de S/ 1.00 c/u, según minuta de constitución',
        solucion: [
          { lado: 'debe', cuentas: ['1421', '142'], monto: 60000, detalle: 'Suscripciones por cobrar – Socio A', nota: 'Lo que cada socio se compromete a aportar es una cuenta por cobrar (activo, al debe). Una línea por socio o una sola por S/ 100,000.' },
          { lado: 'debe', cuentas: ['1421', '142'], monto: 30000, detalle: 'Suscripciones por cobrar – Socio B', nota: '' },
          { lado: 'debe', cuentas: ['1421', '142'], monto: 10000, detalle: 'Suscripciones por cobrar – Socio C', nota: '' },
          { lado: 'haber', cuentas: ['5221', '522'], monto: 100000, nota: 'Capital aún no inscrito: 5221 Aportes (capitalizaciones en trámite).' }
        ],
        explicacion: 'La minuta formaliza el compromiso de los tres socios. Todavía no hay capital inscrito, por eso se usa la 52.'
      },
      {
        titulo: 'Cancelación de aportes', doc: 'Voucher de depósito', glosa: 'Por el depósito en la cuenta bancaria de los aportes de los socios',
        solucion: [
          { lado: 'debe', cuentas: ['1041', '104'], monto: 100000, nota: 'El dinero entra a la cuenta corriente de la empresa.' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 60000, detalle: 'Suscripciones por cobrar – Socio A', nota: 'Los socios cumplen su aporte: se cancela la cuenta por cobrar (haber).' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 30000, detalle: 'Suscripciones por cobrar – Socio B', nota: '' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 10000, detalle: 'Suscripciones por cobrar – Socio C', nota: '' }
        ],
        explicacion: 'Sale la cuenta por cobrar a los socios (14) y entra el dinero al banco (10). El activo total no cambia.'
      },
      {
        titulo: 'Formalización en Registros Públicos', doc: 'Partida registral N.° 75483921', glosa: 'Por la inscripción del capital social, partida registral N.° 75483921',
        solucion: [
          { lado: 'debe', cuentas: ['5221', '522'], monto: 100000, nota: 'Se cierra la cuenta transitoria.' },
          { lado: 'haber', cuentas: ['5011', '501'], monto: 100000, nota: 'Inscrita la SAC, el aporte es capital social: 5011 Acciones.' }
        ],
        explicacion: 'Con la partida registral, la 52 se traslada a la 50 Capital.'
      }
    ]
  },
  {
    id: 'constitucion-el-constructor', fecha: '02/06/26', tema: 'Patrimonio: constitución', subido: '17/11/26',
    empresa: 'Distribuidora El Constructor SAC', ruc: '20608975321', periodo: 'Junio 2026',
    enunciado: 'El 02/06/2026 se constituye Distribuidora El Constructor SAC (RUC 20608975321). Capital social: S/ 180,000, en acciones de S/ 1.00. Socio A suscribe 80,000 acciones y aportará S/ 80,000 en efectivo por depósito bancario; Socio B suscribe 60,000 acciones y entregará equipos de cómputo y mobiliario por S/ 60,000; Socio C suscribe 40,000 acciones y aportará S/ 40,000 en efectivo por depósito bancario. Operaciones: (1) 02/06 se registra la suscripción del capital, según la minuta; (2) 03/06 el socio A deposita S/ 80,000 en la cuenta corriente; (3) 04/06 el socio B entrega equipos de cómputo por S/ 35,000 y muebles y enseres por S/ 25,000; (4) 05/06 el socio C deposita solo S/ 25,000 y queda pendiente el saldo de su aporte; (5) 10/06 se formaliza la constitución en Registros Públicos, partida registral N.° 76543219.',
    explicacion: 'Lo nuevo aquí: un aporte en bienes (los bienes entran a la 33, no a la 10) y un aporte incompleto. El socio C todavía debe S/ 15,000: ese saldo queda en la 1421 como cuenta por cobrar. Se inscribe el capital suscrito completo, S/ 180,000.',
    asientos: [
      {
        titulo: 'Suscripción', doc: 'Minuta de constitución', fecha: '02/06/26', glosa: 'Por la suscripción de 180,000 acciones de S/ 1.00 c/u, según minuta de constitución',
        solucion: [
          { lado: 'debe', cuentas: ['1421', '142'], monto: 80000, detalle: 'Suscripciones por cobrar – Socio A', nota: 'Lo que cada socio se compromete a aportar es una cuenta por cobrar, sea en dinero o en bienes. Una línea por socio o una sola por S/ 180,000.' },
          { lado: 'debe', cuentas: ['1421', '142'], monto: 60000, detalle: 'Suscripciones por cobrar – Socio B', nota: '' },
          { lado: 'debe', cuentas: ['1421', '142'], monto: 40000, detalle: 'Suscripciones por cobrar – Socio C', nota: '' },
          { lado: 'haber', cuentas: ['5221', '522'], monto: 180000, nota: 'Capital aún no inscrito: 5221 Aportes (capitalizaciones en trámite).' }
        ],
        explicacion: 'Se suscribe todo el capital (S/ 180,000), aunque luego no todo se pague el mismo día.'
      },
      {
        titulo: 'Aporte del socio A', doc: 'Voucher de depósito', fecha: '03/06/26', glosa: 'Por el depósito del aporte del socio A',
        solucion: [
          { lado: 'debe', cuentas: ['1041', '104'], monto: 80000, nota: 'El dinero entra a la cuenta corriente de la empresa.' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 80000, detalle: 'Suscripciones por cobrar – Socio A', nota: 'El socio A cancela todo lo que suscribió.' }
        ],
        explicacion: 'Igual que en los ejercicios anteriores: sale la 14 y entra la 10.'
      },
      {
        titulo: 'Aporte en bienes del socio B', doc: 'Acta de entrega de bienes', fecha: '04/06/26', glosa: 'Por la entrega de equipos de cómputo y muebles como aporte del socio B',
        solucion: [
          { lado: 'debe', cuentas: ['33611', '3361', '336'], monto: 35000, nota: 'Los equipos de cómputo son activo fijo: 3361 Equipo para procesamiento de información (33611 Costo).' },
          { lado: 'debe', cuentas: ['33511', '3351', '335'], monto: 25000, nota: 'Los muebles y enseres: 3351 Muebles (33511 Costo).' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 60000, detalle: 'Suscripciones por cobrar – Socio B', nota: 'El socio B cancela su aporte con bienes en lugar de dinero.' }
        ],
        explicacion: 'Un aporte no dinerario: en vez de la 10, entran a la 33 los bienes que entrega el socio, por el valor acordado (35,000 + 25,000 = 60,000).'
      },
      {
        titulo: 'Aporte parcial del socio C', doc: 'Voucher de depósito', fecha: '05/06/26', glosa: 'Por el depósito parcial del aporte del socio C',
        solucion: [
          { lado: 'debe', cuentas: ['1041', '104'], monto: 25000, nota: 'Solo entran S/ 25,000 al banco.' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 25000, detalle: 'Suscripciones por cobrar – Socio C', nota: 'Se cancela solo lo que pagó. Los S/ 15,000 que faltan siguen en la 1421.' }
        ],
        explicacion: 'Ojo: el asiento es por lo que realmente se deposita (25,000), no por los 40,000 suscritos. El saldo pendiente (15,000) queda como cuenta por cobrar al socio C.'
      },
      {
        titulo: 'Formalización en Registros Públicos', doc: 'Partida registral N.° 76543219', fecha: '10/06/26', glosa: 'Por la inscripción del capital social, partida registral N.° 76543219',
        solucion: [
          { lado: 'debe', cuentas: ['5221', '522'], monto: 180000, nota: 'Se cierra toda la cuenta transitoria.' },
          { lado: 'haber', cuentas: ['5011', '501'], monto: 180000, nota: 'Se inscribe el capital suscrito completo: 5011 Acciones.' }
        ],
        explicacion: 'Se inscribe el capital suscrito (180,000), aunque el socio C aún deba 15,000: esa deuda sigue en la 1421 hasta que pague.'
      }
    ]
  },
  {
    id: 'elemento5-pacifico', fecha: '02/01/26', tema: 'Patrimonio: Elemento 5', subido: '20/11/26',
    empresa: 'Inversiones del Pacífico SAC', periodo: 'Ejercicio 2026',
    enunciado: 'Inversiones del Pacífico SAC (comercialización de equipos de cómputo) registra las operaciones del patrimonio neto del ejercicio 2026 con el Elemento 5 del PCGE. (1) 02/01/26: se constituye con capital de S/ 150,000 en acciones; accionista A aporta S/ 70,000 y B S/ 50,000 depositados en cuenta corriente, y C S/ 30,000 en equipos de cómputo; el capital queda íntegramente suscrito y pagado. (2) 15/02/26: la junta acuerda aumentar el capital en S/ 60,000 con aportes dinerarios, que se depositan en el banco; el aumento queda inscrito. (3) 10/03/26: nueva emisión de acciones de valor nominal S/ 40,000; los nuevos accionistas pagan S/ 50,000; la diferencia es prima de emisión. (4) 20/04/26: se capitalizan S/ 20,000 de resultados acumulados de ejercicios anteriores; la capitalización queda formalizada. (5) Al cierre, la utilidad neta es S/ 80,000 y la junta destina el 10 % a la reserva legal (aún no se alcanza el límite de la LGS). (6) La junta acuerda distribuir dividendos por S/ 25,000 con cargo a resultados acumulados. (7) Revaluación voluntaria de un inmueble: mayor valor de S/ 35,000 sustentado en una tasación. (8) Los resultados acumulados al inicio son S/ 45,000: determina su saldo final.',
    explicacion: 'Operación 8, saldo final de resultados acumulados (5911): inicial 45,000 − capitalización 20,000 + utilidad 80,000 − reserva legal 8,000 − dividendos 25,000 = S/ 72,000. Capital social final: 150,000 + 60,000 + 40,000 + 20,000 = S/ 270,000.',
    asientos: [
      {
        titulo: 'Op. 1 · Suscripción', doc: 'Minuta de constitución', fecha: '02/01/26', glosa: 'Por la suscripción del capital social de S/ 150,000',
        solucion: [
          { lado: 'debe', cuentas: ['1421', '142'], monto: 70000, detalle: 'Suscripciones por cobrar – Accionista A', nota: 'Cada accionista se compromete a aportar: cuenta por cobrar (activo, al debe). Una línea por accionista o una sola por S/ 150,000.' },
          { lado: 'debe', cuentas: ['1421', '142'], monto: 50000, detalle: 'Suscripciones por cobrar – Accionista B', nota: '' },
          { lado: 'debe', cuentas: ['1421', '142'], monto: 30000, detalle: 'Suscripciones por cobrar – Accionista C', nota: '' },
          { lado: 'haber', cuentas: ['5221', '522'], monto: 150000, nota: 'Capital aún no inscrito: 5221 Aportes (capitalizaciones en trámite).' }
        ],
        explicacion: 'Suscribir es comprometerse a aportar: nace la 1421 y el capital queda en trámite (5221).'
      },
      {
        titulo: 'Op. 1 · Pago de los aportes', doc: 'Voucher de depósito / acta de entrega', fecha: '02/01/26', glosa: 'Por el pago de los aportes: depósitos en cuenta corriente y entrega de equipos de cómputo',
        solucion: [
          { lado: 'debe', cuentas: ['1041', '104'], monto: 120000, nota: 'Los accionistas A y B depositan S/ 70,000 + S/ 50,000.' },
          { lado: 'debe', cuentas: ['33611', '3361', '336'], monto: 30000, detalle: 'Equipo para procesamiento de información – Costo', nota: 'El accionista C aporta equipos de cómputo: activo fijo (33).' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 70000, detalle: 'Suscripciones por cobrar – Accionista A', nota: 'Se cancela todo lo suscrito: el capital queda íntegramente pagado.' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 50000, detalle: 'Suscripciones por cobrar – Accionista B', nota: '' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 30000, detalle: 'Suscripciones por cobrar – Accionista C', nota: '' }
        ],
        explicacion: 'El dinero entra a la 10 y los equipos a la 33; la 1421 queda en cero.'
      },
      {
        titulo: 'Op. 1 · Formalización', doc: 'Partida registral', fecha: '02/01/26', glosa: 'Por la inscripción del capital social en Registros Públicos',
        solucion: [
          { lado: 'debe', cuentas: ['5221', '522'], monto: 150000, nota: 'Se cierra la cuenta transitoria.' },
          { lado: 'haber', cuentas: ['5011', '501'], monto: 150000, nota: 'Inscrita la sociedad, el aporte es capital social: 5011 Acciones.' }
        ],
        explicacion: 'De capital en trámite (52) a capital social (50).'
      },
      {
        titulo: 'Op. 2 · Acuerdo de aumento', doc: 'Acta de junta general', fecha: '15/02/26', glosa: 'Por el acuerdo de aumento de capital con nuevos aportes dinerarios',
        solucion: [
          { lado: 'debe', cuentas: ['1421', '142'], monto: 60000, nota: 'Los accionistas se comprometen a aportar S/ 60,000.' },
          { lado: 'haber', cuentas: ['5221', '522'], monto: 60000, nota: 'El aumento está en trámite hasta inscribirse.' }
        ],
        explicacion: 'Un aumento de capital sigue el mismo camino que la constitución: 14 / 52 → 10 / 14 → 52 / 50.'
      },
      {
        titulo: 'Op. 2 · Depósito de los aportes', doc: 'Voucher de depósito', fecha: '15/02/26', glosa: 'Por el depósito de los aportes del aumento de capital',
        solucion: [
          { lado: 'debe', cuentas: ['1041', '104'], monto: 60000, nota: 'Entra el dinero al banco.' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 60000, nota: 'Se cancela lo comprometido.' }
        ],
        explicacion: 'Un activo se cambia por otro: sale la 14 y entra la 10.'
      },
      {
        titulo: 'Op. 2 · Inscripción del aumento', doc: 'Partida registral', fecha: '15/02/26', glosa: 'Por la inscripción del aumento de capital',
        solucion: [
          { lado: 'debe', cuentas: ['5221', '522'], monto: 60000, nota: 'Se cierra la cuenta transitoria.' },
          { lado: 'haber', cuentas: ['5011', '501'], monto: 60000, nota: 'El capital social sube de S/ 150,000 a S/ 210,000.' }
        ],
        explicacion: 'Inscrito el aumento, pasa de la 52 a la 50.'
      },
      {
        titulo: 'Op. 3 · Suscripción con prima', doc: 'Acta de junta general', fecha: '10/03/26', glosa: 'Por la emisión de acciones de valor nominal S/ 40,000 colocadas a S/ 50,000',
        solucion: [
          { lado: 'debe', cuentas: ['1421', '142'], monto: 50000, nota: 'Los nuevos accionistas se comprometen a pagar el precio total: S/ 50,000.' },
          { lado: 'haber', cuentas: ['5221', '522'], monto: 40000, nota: 'Al capital solo va el valor nominal de las acciones: S/ 40,000.' },
          { lado: 'haber', cuentas: ['521'], monto: 10000, detalle: 'Primas (descuento) de acciones – Prima de emisión', nota: 'Lo pagado por encima del nominal (50,000 − 40,000) es prima de emisión: va a la 521, no al capital.' }
        ],
        explicacion: 'La prima de emisión es patrimonio, pero no capital: se separa en la 521.'
      },
      {
        titulo: 'Op. 3 · Pago de las acciones', doc: 'Voucher de depósito', fecha: '10/03/26', glosa: 'Por el pago de las nuevas acciones',
        solucion: [
          { lado: 'debe', cuentas: ['1041', '104'], monto: 50000, nota: 'Entra al banco todo lo pagado.' },
          { lado: 'haber', cuentas: ['1421', '142'], monto: 50000, nota: 'Se cancela lo suscrito.' }
        ],
        explicacion: 'Sale la 14 y entra la 10 por el precio pagado.'
      },
      {
        titulo: 'Op. 3 · Inscripción de la emisión', doc: 'Partida registral', fecha: '10/03/26', glosa: 'Por la inscripción de la nueva emisión de acciones',
        solucion: [
          { lado: 'debe', cuentas: ['5221', '522'], monto: 40000, nota: 'Se cierra la cuenta transitoria.' },
          { lado: 'haber', cuentas: ['5011', '501'], monto: 40000, nota: 'El capital sube a S/ 250,000; la prima queda en la 521.' }
        ],
        explicacion: 'Solo el valor nominal pasa a la 50.'
      },
      {
        titulo: 'Op. 4 · Acuerdo de capitalización', doc: 'Acta de junta general', fecha: '20/04/26', glosa: 'Por el acuerdo de capitalizar resultados acumulados',
        solucion: [
          { lado: 'debe', cuentas: ['5911', '591'], monto: 20000, nota: 'Disminuyen las utilidades acumuladas que se capitalizan.' },
          { lado: 'haber', cuentas: ['5224', '522'], monto: 20000, nota: 'Mientras se formaliza, va a 5224 Utilidades (capitalizaciones en trámite).' }
        ],
        explicacion: 'Capitalizar utilidades no trae dinero nuevo: solo cambia el nombre dentro del patrimonio.'
      },
      {
        titulo: 'Op. 4 · Formalización de la capitalización', doc: 'Partida registral', fecha: '20/04/26', glosa: 'Por la formalización de la capitalización de resultados',
        solucion: [
          { lado: 'debe', cuentas: ['5224', '522'], monto: 20000, nota: 'Se cierra la cuenta transitoria.' },
          { lado: 'haber', cuentas: ['5011', '501'], monto: 20000, nota: 'El capital sube a S/ 270,000.' }
        ],
        explicacion: 'De la 52 a la 50, como cualquier aumento de capital.'
      },
      {
        titulo: 'Op. 5 · Utilidad del ejercicio', doc: 'Estado de resultados', fecha: '31/12/26', glosa: 'Por el traslado de la utilidad neta del ejercicio 2026',
        solucion: [
          { lado: 'debe', cuentas: ['891', '89'], monto: 80000, nota: 'Se cierra la cuenta de resultado del ejercicio.' },
          { lado: 'haber', cuentas: ['5911', '591'], monto: 80000, nota: 'La utilidad pasa a resultados acumulados.' }
        ],
        explicacion: 'Antes de repartir o reservar, la utilidad del ejercicio se traslada de la 89 a la 59.'
      },
      {
        titulo: 'Op. 5 · Reserva legal', doc: 'Acta de junta general', fecha: '31/12/26', glosa: 'Por la reserva legal: 10 % de la utilidad de S/ 80,000',
        solucion: [
          { lado: 'debe', cuentas: ['5911', '591'], monto: 8000, nota: '10 % × 80,000 = 8,000 sale de las utilidades acumuladas.' },
          { lado: 'haber', cuentas: ['582', '58'], monto: 8000, nota: 'Va a 582 Reserva legal (art. 229 de la LGS: 10 % hasta llegar a la quinta parte del capital).' }
        ],
        explicacion: 'La reserva legal no es un gasto: es una parte de la utilidad que la ley obliga a guardar en el patrimonio.'
      },
      {
        titulo: 'Op. 6 · Dividendos', doc: 'Acta de junta general', fecha: '31/12/26', glosa: 'Por el acuerdo de distribución de dividendos',
        solucion: [
          { lado: 'debe', cuentas: ['5911', '591'], monto: 25000, nota: 'Disminuyen las utilidades acumuladas.' },
          { lado: 'haber', cuentas: ['4412', '441'], monto: 25000, nota: 'Nace la deuda con los accionistas: 4412 Dividendos por pagar (pasivo).' }
        ],
        explicacion: 'Acordar dividendos no es pagarlos: primero nace una cuenta por pagar (44); cuando se paga, 4412 / 10.'
      },
      {
        titulo: 'Op. 7 · Excedente de revaluación', doc: 'Informe de tasación', fecha: '31/12/26', glosa: 'Por la revaluación voluntaria del inmueble según tasación',
        solucion: [
          { lado: 'debe', cuentas: ['33212', '3321', '332'], monto: 35000, detalle: 'Edificaciones – Revaluación', nota: 'Sube el valor del inmueble: 33212 Revaluación.' },
          { lado: 'haber', cuentas: ['5712', '571'], monto: 35000, detalle: 'Excedente de revaluación – Propiedad, planta y equipo', nota: 'El mayor valor no es ingreso: va al patrimonio como excedente de revaluación.' }
        ],
        explicacion: 'La revaluación aumenta el activo y el patrimonio, sin pasar por resultados.'
      }
    ]
  },
  {
    id: 'compras-agosto', fecha: '08/08/26', tema: 'Compras con IGV', subido: '24/11/26',
    empresa: 'Caso práctico de compras', periodo: 'Agosto 2026',
    enunciado: '(1) 08/08: se compran mercaderías a Edelmisa SAC (RUC 20577776877), F. 001-0180, por un precio de S/ 18,000; se cancela el 55 % en efectivo y el resto por transferencia. (2) 18/08: se compran mercaderías a Montalván y Hermanos SAC (RUC 20664176864), F. 001-0280, por S/ 85,000 más IGV; se cancela el 30 % al contado y el resto por transferencia. (3) 21/08: se compran mercaderías por S/ 24,500 más IGV a Romero SAC (RUC 20300152555), F. 001-01220; se cancela por transferencia. (4) 23/08: se compra a La Ayacuchana SRL (RUC 20513123890), F. 001-00161: producto A, 1,500 unidades a un precio de S/ 15 c/u; producto B, 1,800 unidades a un valor de S/ 20 c/u; producto C, 1,300 unidades a un precio de S/ 18 c/u; se cancela el 15 % al contado y el resto por transferencia. (5) 25/08: se provisiona el recibo de agua N.° 01-2335473 de Sedapal SA (RUC 20111224422) por el precio de S/ 950; se cancela por transferencia.',
    explicacion: 'Cada compra lleva tres asientos: compra (60 + 40111 / 4212), ingreso al almacén (20 / 61) y pago (4212 / 10). Clave: «precio» incluye IGV (se divide entre 1.18) y «valor» o «más IGV» no lo incluye (se multiplica por 0.18).',
    asientos: [
      {
        titulo: 'Op. 1 · Compra', doc: 'Factura 001-0180', fecha: '08/08/26', glosa: 'Por la compra de mercaderías a Edelmisa SAC, F. 001-0180',
        solucion: [
          { lado: 'debe', cuentas: ['6011', '601'], monto: 15254.24, nota: '«Precio» incluye IGV: valor = 18,000 ÷ 1.18 = 15,254.24.' },
          { lado: 'debe', cuentas: ['40111', '4011'], monto: 2745.76, nota: 'IGV de la compra: crédito fiscal (18 %).' },
          { lado: 'haber', cuentas: ['4212', '421'], monto: 18000, nota: 'Nace la deuda con el proveedor por el total de la factura.' }
        ],
        explicacion: 'Toda compra con factura: 60 (valor) + 40111 (IGV) contra 4212 (total).'
      },
      {
        titulo: 'Op. 1 · Ingreso al almacén', doc: 'Factura 001-0180', fecha: '08/08/26', glosa: 'Por el ingreso de las mercaderías al almacén',
        solucion: [
          { lado: 'debe', cuentas: ['20111', '2011'], monto: 15254.24, nota: 'La mercadería entra al almacén por su costo (sin IGV).' },
          { lado: 'haber', cuentas: ['6111', '611'], monto: 15254.24, nota: 'Asiento de destino de la compra: 20 contra 61.' }
        ],
        explicacion: 'La 60 es una cuenta de gestión: su destino es la 20, y la 61 la equilibra.'
      },
      {
        titulo: 'Op. 1 · Pago', doc: 'Factura 001-0180', fecha: '08/08/26', glosa: 'Por el pago de la F. 001-0180: 55 % en efectivo y el resto por transferencia',
        solucion: [
          { lado: 'debe', cuentas: ['4212', '421'], monto: 18000, nota: 'Se cancela la deuda con el proveedor.' },
          { lado: 'haber', cuentas: ['101', '10'], monto: 9900, nota: '55 % × 18,000 = 9,900 en efectivo.' },
          { lado: 'haber', cuentas: ['1041', '104'], monto: 8100, nota: 'El resto sale por transferencia de la cuenta corriente.' }
        ],
        explicacion: 'El pago no toca el IGV ni la mercadería: solo cancela la 4212.'
      },
      {
        titulo: 'Op. 2 · Compra', doc: 'Factura 001-0280', fecha: '18/08/26', glosa: 'Por la compra de mercaderías a Montalván y Hermanos SAC, F. 001-0280',
        solucion: [
          { lado: 'debe', cuentas: ['6011', '601'], monto: 85000, nota: '85,000 «más IGV»: ese es el valor; IGV = 15,300.' },
          { lado: 'debe', cuentas: ['40111', '4011'], monto: 15300, nota: 'IGV de la compra: crédito fiscal (18 %).' },
          { lado: 'haber', cuentas: ['4212', '421'], monto: 100300, nota: 'Nace la deuda con el proveedor por el total de la factura.' }
        ],
        explicacion: 'Toda compra con factura: 60 (valor) + 40111 (IGV) contra 4212 (total).'
      },
      {
        titulo: 'Op. 2 · Ingreso al almacén', doc: 'Factura 001-0280', fecha: '18/08/26', glosa: 'Por el ingreso de las mercaderías al almacén',
        solucion: [
          { lado: 'debe', cuentas: ['20111', '2011'], monto: 85000, nota: 'La mercadería entra al almacén por su costo (sin IGV).' },
          { lado: 'haber', cuentas: ['6111', '611'], monto: 85000, nota: 'Asiento de destino de la compra: 20 contra 61.' }
        ],
        explicacion: 'La 60 es una cuenta de gestión: su destino es la 20, y la 61 la equilibra.'
      },
      {
        titulo: 'Op. 2 · Pago', doc: 'Factura 001-0280', fecha: '18/08/26', glosa: 'Por el pago de la F. 001-0280: 30 % al contado y el resto por transferencia',
        solucion: [
          { lado: 'debe', cuentas: ['4212', '421'], monto: 100300, nota: 'Se cancela la deuda con el proveedor.' },
          { lado: 'haber', cuentas: ['101', '10'], monto: 30090, nota: '30 % × 100,300 = 30,090 al contado.' },
          { lado: 'haber', cuentas: ['1041', '104'], monto: 70210, nota: 'El resto sale por transferencia de la cuenta corriente.' }
        ],
        explicacion: 'El pago no toca el IGV ni la mercadería: solo cancela la 4212.'
      },
      {
        titulo: 'Op. 3 · Compra', doc: 'Factura 001-01220', fecha: '21/08/26', glosa: 'Por la compra de mercaderías a Romero SAC, F. 001-01220',
        solucion: [
          { lado: 'debe', cuentas: ['6011', '601'], monto: 24500, nota: '24,500 «más IGV»: ese es el valor; IGV = 4,410.' },
          { lado: 'debe', cuentas: ['40111', '4011'], monto: 4410, nota: 'IGV de la compra: crédito fiscal (18 %).' },
          { lado: 'haber', cuentas: ['4212', '421'], monto: 28910, nota: 'Nace la deuda con el proveedor por el total de la factura.' }
        ],
        explicacion: 'Toda compra con factura: 60 (valor) + 40111 (IGV) contra 4212 (total).'
      },
      {
        titulo: 'Op. 3 · Ingreso al almacén', doc: 'Factura 001-01220', fecha: '21/08/26', glosa: 'Por el ingreso de las mercaderías al almacén',
        solucion: [
          { lado: 'debe', cuentas: ['20111', '2011'], monto: 24500, nota: 'La mercadería entra al almacén por su costo (sin IGV).' },
          { lado: 'haber', cuentas: ['6111', '611'], monto: 24500, nota: 'Asiento de destino de la compra: 20 contra 61.' }
        ],
        explicacion: 'La 60 es una cuenta de gestión: su destino es la 20, y la 61 la equilibra.'
      },
      {
        titulo: 'Op. 3 · Pago', doc: 'Factura 001-01220', fecha: '21/08/26', glosa: 'Por el pago de la F. 001-01220 por transferencia',
        solucion: [
          { lado: 'debe', cuentas: ['4212', '421'], monto: 28910, nota: 'Se cancela la deuda con el proveedor.' },
          { lado: 'haber', cuentas: ['1041', '104'], monto: 28910, nota: 'Se paga todo por transferencia.' }
        ],
        explicacion: 'El pago no toca el IGV ni la mercadería: solo cancela la 4212.'
      },
      {
        titulo: 'Op. 4 · Compra', doc: 'Factura 001-00161', fecha: '23/08/26', glosa: 'Por la compra de mercaderías a La Ayacuchana SRL, F. 001-00161',
        solucion: [
          { lado: 'debe', cuentas: ['6011', '601'], monto: 74898.31, nota: 'A y C se dan a «precio» (con IGV) y B a «valor» (sin IGV): valor = 19,067.80 + 36,000 + 19,830.51 = 74,898.31.' },
          { lado: 'debe', cuentas: ['40111', '4011'], monto: 13481.69, nota: 'IGV de la compra: crédito fiscal (18 %).' },
          { lado: 'haber', cuentas: ['4212', '421'], monto: 88380, nota: 'Nace la deuda con el proveedor por el total de la factura.' }
        ],
        explicacion: 'Toda compra con factura: 60 (valor) + 40111 (IGV) contra 4212 (total).'
      },
      {
        titulo: 'Op. 4 · Ingreso al almacén', doc: 'Factura 001-00161', fecha: '23/08/26', glosa: 'Por el ingreso de las mercaderías al almacén',
        solucion: [
          { lado: 'debe', cuentas: ['20111', '2011'], monto: 74898.31, nota: 'La mercadería entra al almacén por su costo (sin IGV).' },
          { lado: 'haber', cuentas: ['6111', '611'], monto: 74898.31, nota: 'Asiento de destino de la compra: 20 contra 61.' }
        ],
        explicacion: 'La 60 es una cuenta de gestión: su destino es la 20, y la 61 la equilibra.'
      },
      {
        titulo: 'Op. 4 · Pago', doc: 'Factura 001-00161', fecha: '23/08/26', glosa: 'Por el pago de la F. 001-00161: 15 % al contado y el resto por transferencia',
        solucion: [
          { lado: 'debe', cuentas: ['4212', '421'], monto: 88380, nota: 'Se cancela la deuda con el proveedor.' },
          { lado: 'haber', cuentas: ['101', '10'], monto: 13257, nota: '15 % × 88,380 = 13,257 al contado.' },
          { lado: 'haber', cuentas: ['1041', '104'], monto: 75123, nota: 'El resto sale por transferencia de la cuenta corriente.' }
        ],
        explicacion: 'El pago no toca el IGV ni la mercadería: solo cancela la 4212.'
      },
      {
        titulo: 'Op. 5 · Provisión del recibo de agua', doc: 'Recibo 01-2335473', fecha: '25/08/26', glosa: 'Por la provisión del recibo de agua de Sedapal SA',
        solucion: [
          { lado: 'debe', cuentas: ['6363', '636'], monto: 805.08, nota: 'Gasto por servicio básico de agua. «Precio» con IGV: 950 ÷ 1.18 = 805.08.' },
          { lado: 'debe', cuentas: ['40111', '4011'], monto: 144.92, nota: 'IGV del recibo.' },
          { lado: 'haber', cuentas: ['4212', '421'], monto: 950, nota: 'Deuda con Sedapal por el total del recibo.' }
        ],
        explicacion: 'Un servicio no va al almacén: es gasto (63), por eso no hay asiento 20 / 61.'
      },
      {
        titulo: 'Op. 5 · Pago del recibo', doc: 'Recibo 01-2335473', fecha: '25/08/26', glosa: 'Por el pago del recibo de agua por transferencia',
        solucion: [
          { lado: 'debe', cuentas: ['4212', '421'], monto: 950, nota: 'Se cancela la deuda con Sedapal.' },
          { lado: 'haber', cuentas: ['1041', '104'], monto: 950, nota: 'Sale del banco.' }
        ],
        explicacion: 'Pago: 4212 contra 1041.'
      }
    ]
  }
];
