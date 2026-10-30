/* ejercicios.js — ejercicios de asientos contables para /contabilidad (PCGE 2019, vigente hasta 2027).
   Cada solución lista las líneas esperadas: «cuentas» acepta varias opciones (la primera es la recomendada). */
window.EJERCICIOS = [
  {
    id: 'cobro-beta', fecha: '5/10/26', tema: 'Cobranzas',
    enunciado: 'Se cobra en efectivo la factura N.° E001-00201, pendiente de cobranza, de nuestro cliente empresa BETA SAC por un valor de S/ 5,000.',
    glosa: 'Por el cobro de la fact. E001-00201',
    solucion: [
      { lado: 'debe', cuentas: ['101'], monto: 5000, nota: 'Entra efectivo a la empresa: aumenta Caja (activo), por eso va al debe.' },
      { lado: 'haber', cuentas: ['1212', '121'], monto: 5000, nota: 'La factura ya no se nos debe: disminuye la cuenta por cobrar (activo), por eso va al haber.' }
    ],
    explicacion: 'Cobrar una factura no es un ingreso nuevo (la venta ya se registró antes): solo cambia un activo por otro. Sale la cuenta por cobrar (12) y entra dinero (10).'
  },
  {
    id: 'cobro-maryluna', fecha: '6/10/26', tema: 'Cobranzas',
    enunciado: 'Se cobra la factura E001-5020 al cliente empresa Maryluna SAC por S/ 1,000 mediante transferencia bancaria.',
    glosa: 'Por el cobro de la fact. E001-5020',
    solucion: [
      { lado: 'debe', cuentas: ['1041', '104'], monto: 1000, nota: 'Transferencia = entra a la cuenta del banco: 1041 Cuentas corrientes operativas.' },
      { lado: 'haber', cuentas: ['1212', '121'], monto: 1000, nota: 'Se cancela la factura por cobrar.' }
    ],
    explicacion: 'Igual que el cobro en efectivo, pero el dinero entra al banco (104) en lugar de a Caja (101). Revisa el monto: el enunciado dice S/ 1,000.'
  },
  {
    id: 'cobro-sanchez', fecha: '7/10/26', tema: 'Cobranzas',
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
    id: 'cobro-letra', fecha: '9/10/26', tema: 'Letras',
    enunciado: 'Se hace la cobranza de la letra de pago N.° 001-250 por un monto de S/ 7,800 mediante transferencia.',
    glosa: 'Por la cobranza de la letra 001-250',
    solucion: [
      { lado: 'debe', cuentas: ['1041', '104'], monto: 7800, nota: 'Entra el dinero al banco.' },
      { lado: 'haber', cuentas: ['1232', '1233', '123'], monto: 7800, nota: 'La letra ya fue cobrada: sale de Letras por cobrar (1232 si estaba en cartera, 1233 si estaba en cobranza en el banco).' }
    ],
    explicacion: 'Ojo con el lado: al cobrar la letra, la cuenta 123 Letras por cobrar DISMINUYE, así que va al HABER, no al debe. Al debe va lo que aumenta: el banco.'
  },
  {
    id: 'cobro-prestamo', fecha: '10/10/26', tema: 'Personal',
    enunciado: 'Se hace el cobro en efectivo de un préstamo a nuestro trabajador José Sánchez por S/ 1,500.',
    glosa: 'Por el cobro del préstamo al trabajador José Sánchez',
    solucion: [
      { lado: 'debe', cuentas: ['101'], monto: 1500, nota: 'Entra efectivo a Caja.' },
      { lado: 'haber', cuentas: ['1411', '141'], monto: 1500, nota: 'Se cancela lo que nos debía el trabajador: 1411 Préstamos (al personal).' }
    ],
    explicacion: 'Lo que nos deben los trabajadores no va en la 12 (clientes), sino en la 14: Cuentas por cobrar al personal. 1411 es Préstamos.'
  },
  {
    id: 'venta-delta', fecha: '12/10/26', tema: 'Ventas con IGV',
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
    id: 'compra-proveedores', fecha: '13/10/26', tema: 'Compras con IGV',
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
    id: 'pago-proveedores', fecha: '15/10/26', tema: 'Pagos',
    enunciado: 'Se paga por transferencia la factura F001-00045 a Proveedores Unidos SAC por S/ 2,360.',
    glosa: 'Por el pago de la fact. F001-00045',
    solucion: [
      { lado: 'debe', cuentas: ['4212', '421'], monto: 2360, nota: 'Se cancela la deuda con el proveedor: el pasivo disminuye, va al debe.' },
      { lado: 'haber', cuentas: ['1041', '104'], monto: 2360, nota: 'Sale dinero del banco: el activo disminuye, va al haber.' }
    ],
    explicacion: 'Regla práctica: el activo aumenta por el debe y disminuye por el haber; el pasivo, al revés.'
  }
];
