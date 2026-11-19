/* paginas.js — catálogo de «Mis páginas» (politon.pe/joseguzman/paginas/).
   Para agregar una web: suma un objeto al grupo que corresponda.
   Campos: nombre, url, desc (una línea), privada (true si no debe salir en Google o necesita llave/cuenta),
           editar (opcional: carpeta dentro del repo elpoliton/joseguzman, para el botón «Editar en GitHub»). */
window.PAGINAS = [
  {
    grupo: 'Mi web · politon.pe/joseguzman',
    items: [
      { nombre: 'Página personal', url: 'https://politon.pe/joseguzman/', desc: 'Presentación, trayectoria, formación y experiencia como ponente.', editar: 'index.html' },
      { nombre: 'Ponencias', url: 'https://politon.pe/joseguzman/ponencias/', desc: 'Biblioteca de presentaciones para exponer en pantalla completa.', editar: 'ponencias' },
      { nombre: 'Contabilidad · práctica de asientos', url: 'https://politon.pe/joseguzman/contabilidad/', desc: 'Ejercicios con el PCGE, «Mi libro diario» y descarga en Formato 5.1.', editar: 'contabilidad' },
      { nombre: 'Curso Dinámica del Plan Contable', url: 'https://politon.pe/joseguzman/contabilidad/curso/', desc: 'Ruta del curso, evaluaciones, casos, cuestionarios y materiales de CERTUS.', privada: true, editar: 'contabilidad/curso' },
      { nombre: 'Cuentas Claras FDCP', url: 'https://politon.pe/joseguzman/cuentas-claras/', desc: 'Prototipo de portal de rendición de cuentas.', privada: true, editar: 'cuentas-claras' },
      { nombre: 'Panel', url: 'https://politon.pe/joseguzman/admin/', desc: 'Editar fichas y diapositivas, subir PowerPoint y ver publicaciones.', privada: true, editar: 'admin' },
      { nombre: 'Control desde el celular', url: 'https://politon.pe/joseguzman/control/', desc: 'Control remoto de ponencias emparejado por QR.', privada: true, editar: 'control' }
    ]
  },
  {
    grupo: 'POLITON · politon.pe',
    items: [
      { nombre: 'POLITON E.I.R.L.', url: 'https://politon.pe/', desc: 'Consultoría política y soluciones digitales para partidos.' },
      { nombre: 'Declaración financiera ONPE', url: 'https://politon.pe/declaracion-financiera-onpe', desc: 'Servicio de declaración financiera de campaña.' },
      { nombre: 'Marginalia', url: 'https://politon.pe/marginalia/', desc: 'Taller de lectura y anotación de documentos PDF.' },
      { nombre: 'Mesa de Control Académico', url: 'https://politon.pe/organizador/', desc: 'Organizador académico con cuenta de Google.', privada: true }
    ]
  },
  {
    grupo: 'Plataformas',
    items: [
      { nombre: 'Política.pe', url: 'https://politica.pe/', desc: 'Información política del Perú.' },
      { nombre: 'Congreso · Política.pe', url: 'https://politica.pe/congreso/', desc: 'Seguimiento del Congreso.' },
      { nombre: 'CandidatoElectoral.com', url: 'https://candidatoelectoral.com/', desc: 'Información de candidatos y elecciones.' },
      { nombre: 'Jurista.pe', url: 'https://jurista.pe/', desc: 'Plataforma jurídica.' },
      { nombre: 'Juventudes.pe', url: 'https://juventudes.pe/', desc: 'Plataforma de juventudes.' },
      { nombre: 'CienciaPolitica.pe', url: 'https://cienciapolitica.pe/', desc: 'Plataforma de ciencia política.' },
      { nombre: 'MiVoto.pe', url: 'https://mivoto.pe/', desc: 'Plataforma electoral.' }
    ]
  },
  {
    grupo: 'Herramientas para editar',
    items: [
      { nombre: 'Repositorio joseguzman (GitHub)', url: 'https://github.com/elpoliton/joseguzman', desc: 'Código de politon.pe/joseguzman. Cada cambio en main se publica solo.', privada: true },
      { nombre: 'Publicaciones (GitHub Actions)', url: 'https://github.com/elpoliton/joseguzman/actions', desc: 'Estado de cada publicación en la web.', privada: true },
      { nombre: 'Guía para chats (CLAUDE.md)', url: 'https://github.com/elpoliton/joseguzman/blob/main/CLAUDE.md', desc: 'Cómo trabajar y publicar en la web. Se actualiza con cada cambio.', privada: true },
      { nombre: 'Firebase · organizador-politon', url: 'https://console.firebase.google.com/project/organizador-politon/firestore/rules', desc: 'Reglas y datos de Firestore que comparten tus webs.', privada: true }
    ]
  }
];
