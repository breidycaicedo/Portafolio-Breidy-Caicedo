// Contenido del portafolio: cuentas, piezas estáticas y reels.
window.PORTAFOLIO = {
  cuentas: {
    iei:   { nombre: "Ingeniería en Energía Inteligente", corto: "IEI",   handle: "@iei_icesi",     url: "https://www.instagram.com/iei_icesi/",     desde: "2026-1" },
    ibq:   { nombre: "Ingeniería Bioquímica",            corto: "IBQ",   handle: "@ibq.icesi",     url: "https://www.instagram.com/ibq.icesi/",     desde: "2026-2" },
    bio:   { nombre: "Biología",                         corto: "BIO",   handle: "@bio.icesi",     url: "https://www.instagram.com/bio.icesi/",     desde: "2026-2" },
    powex: { nombre: "POWEX Energy Meeting",             corto: "POWEX", handle: "@powex.oficial", url: "https://www.instagram.com/powex.oficial/", desde: "2026" }
  },
  piezas: [
    { id: "01", h: 1339, cuenta: "iei",   titulo: "Reunión de programa",                       tipo: "Post",     url: "https://www.instagram.com/p/DfmkEyTxdzm/" },
    { id: "02", h: 1338, cuenta: "iei",   titulo: "Feliz día al…",                             tipo: "Carrusel", url: "https://www.instagram.com/p/DdeQTV7kRpx/" },
    { id: "03", h: 1365, cuenta: "iei",   titulo: "Bienvenidos cohorte 2026-2",                tipo: "Post",     url: "https://www.instagram.com/p/DbO2hwVR1Vt/" },
    { id: "04", h: 1364, cuenta: "iei",   titulo: "Charla: sistemas de potencia en tiempo real", tipo: "Post",   url: "https://www.instagram.com/p/DYVa9E5R1aQ/" },
    { id: "05", h: 1363, cuenta: "iei",   titulo: "Cuadro de honor 2025-2",                    tipo: "Carrusel", url: "https://www.instagram.com/p/DYFRkzxEV0S/" },
    { id: "06", h: 1086, cuenta: "iei",   titulo: "Estudiantes IEI: Juan David Maldonado",     tipo: "Carrusel", url: "https://www.instagram.com/p/DXj8mzaERvm/" },
    { id: "07", h: 593, cuenta: "powex", titulo: "POWEX 1.ª edición · Energía Solar 2026",    tipo: "Post",     url: "https://www.instagram.com/p/DWWsOv5EZwh/" },
    { id: "08", h: 1347, cuenta: "powex", titulo: "Conoce al equipo directivo",                tipo: "Carrusel", url: "https://www.instagram.com/p/DVwpPG4kQ4p/" },
    { id: "09", h: 1324, cuenta: "bio",   titulo: "Reunión mensual",                           tipo: "Post",     url: "https://www.instagram.com/p/De-S28pzB14/" },
    { id: "10", h: 1345, cuenta: "bio",   titulo: "Grupos de estudio de Biología",             tipo: "Post",     url: "https://www.instagram.com/p/Dd18SIlvj7k/" },
    { id: "11", h: 1335, cuenta: "bio",   titulo: "¿Cómo se ve el amor desde la Biología?",    tipo: "Carrusel", url: "https://www.instagram.com/p/Ddd_hqSERZF/" },
    { id: "12", h: 1350, cuenta: "bio",   titulo: "Día del Biólogo",                           tipo: "Carrusel", url: "https://www.instagram.com/p/DdZF4tTEXav/" },
    { id: "13", h: 1342, cuenta: "ibq",   titulo: "Reunión de programa",                       tipo: "Post",     url: "https://www.instagram.com/p/DfmkYe6go6J/" },
    { id: "14", h: 1369, cuenta: "ibq",   titulo: "Proyecto de grado II",                      tipo: "Post",     url: "https://www.instagram.com/p/De-TB84pGgY/" },
    { id: "15", h: 1340, cuenta: "ibq",   titulo: "La química del amor",                       tipo: "Carrusel", url: "https://www.instagram.com/p/Ddd_k03lpM1/" }
  ],
  reels: [
    { id: "DXW0vXOBzm_", cuenta: "iei" },
    { id: "DWxIkswjXVk", cuenta: "powex" },
    { id: "DWea8g5kRQ-", cuenta: "powex" },
    { id: "DWSCkXOibCg", cuenta: "powex" },
    { id: "DeCRtoVRfWq", cuenta: "bio" },
    { id: "DeM_y8Qsztb", cuenta: "ibq" },
    { id: "DeCmlvsM0dz", cuenta: "ibq" }
  ],
  app: {
    repo: "https://github.com/breidycaicedo/amigo-secretopp",
    participante: [
      { id: "p1", h: 1688, titulo: "Entrada al juego",   texto: "Cada grupo entra por su propio enlace y escoge si se registra o entra." },
      { id: "p2", h: 2592, titulo: "Registro",           texto: "Nombre, código, lista de deseos, fotos y papelito. Al escribir el nombre del papelito, la app sugiere a las personas ya registradas." },
      { id: "p3", h: 1688, titulo: "Entrar",             texto: "Se entra con el código de estudiante y la sesión dura 14 días." },
      { id: "p4", h: 3582, titulo: "Mi cuenta",          texto: "Antes del sorteo cada quien edita sus datos y sube hasta 4 fotos de lo que le gustaría recibir." },
      { id: "p5", h: 3338, titulo: "Tu amigo secreto",   texto: "Después del sorteo solo ves a quién le regalas, con sus ideas y fotos." }
    ],
    administradora: [
      { id: "a1", h: 2408, titulo: "Mis juegos",            texto: "Lista de juegos y formulario para crear uno nuevo, cada uno con su enlace." },
      { id: "a2", h: 4322, titulo: "Panel del juego",       texto: "Registrados contra esperados, papelitos por revisar, problemas detectados y el botón Asignar todos." },
      { id: "a3", h: 5620, titulo: "Participantes",         texto: "Estado de cada persona (OK, Pendiente, Verificar, Sin vincular o Conflicto) con opciones para confirmar o corregir." },
      { id: "a4", h: 1862, titulo: "Asignaciones ocultas",  texto: "Quedan difuminadas hasta pulsar Mostrar, por si la administradora también juega." },
      { id: "a5", h: 1966, titulo: "Asignaciones visibles", texto: "Quién le regala a quién y si salió de un papelito o del sorteo." },
      { id: "a6", h: 3698, titulo: "Sorteo realizado",      texto: "Después de asignar, el juego queda bloqueado y nadie puede volver a sortear." }
    ]
  }
};
