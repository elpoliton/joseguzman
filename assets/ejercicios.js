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
  }
];
