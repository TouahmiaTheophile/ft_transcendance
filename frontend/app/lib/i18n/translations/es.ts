import type { Dictionary } from "./index";

const es = {
  common: {
    backToHome: "Inicio",
    backToHomeAria: "Volver al inicio",
    backToDashboard: "Panel",
    backToDashboardAria: "Volver al panel",
    logout: "Cerrar sesión",

    lastUpdated: "Última actualización: {{date}}",
  },
  home: {
    welcome: "Bienvenido a",
    loginCta: "Iniciar sesión",
    registerCta: "Registrarse",
  },
  login: {
    heading: "INICIAR SESIÓN",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@correo.com",
    passwordLabel: "Contraseña",
    submit: "Iniciar sesión",
    submitting: "Iniciando sesión...",
    errors: {
      emailRequired: "El correo electrónico es obligatorio",
      emailInvalid: "Formato de correo electrónico inválido",
      passwordRequired: "La contraseña es obligatoria",
      validationFailed: "Error de validación",
      invalidCredentials: "Credenciales inválidas",
      generic: "Algo salió mal",
      network: "Error de red. Abre la aplicación con https://localhost y verifica nginx/backend.",
    },
  },
  register: {
    heading: "REGISTRARSE",
    usernameLabel: "Nombre de usuario",
    usernamePlaceholder: "Elige tu nombre de usuario",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@correo.com",
    passwordLabel: "Contraseña",
    ageLabel: "Edad",
    agePlaceholder: "Tu edad",
    submit: "Registrarse",
    submitting: "Registrando...",
    errors: {
      usernameTooShort: "El nombre de usuario debe tener al menos 3 caracteres",
      usernameInvalidChars: "El nombre de usuario solo puede contener letras, números, puntos y guiones",
      emailRequired: "El correo electrónico es obligatorio",
      emailTooLong: "El correo electrónico es demasiado largo",
      emailInvalid: "Formato de correo electrónico inválido",
      passwordTooShort: "La contraseña debe tener al menos 8 caracteres",
      ageRequired: "La edad es obligatoria",
      ageInvalid: "La edad debe ser un número entero entre 0 y 150",
      validationFailed: "Error de validación",
      alreadyTaken: "{{field}} ya está en uso",
      alreadyExists: "Este recurso ya existe",
      generic: "Algo salió mal",
      network: "Error de red. Abre la aplicación con https://localhost y verifica nginx/backend.",
    },
  },
  dashboard: {
    play: "Jugar",
    social: "Social",
  },
  online: {
    title: "Multijugador",
    lobbyListTitle: "Lista de salas",
    noLobbies: "No hay salas disponibles.",
    lobby: "Sala",
    join: "Unirse",
    createLobby: "Crear sala",
    errors: {
      joinFailed: "No se pudo unir a la sala",
      createFailed: "No se pudo crear la sala",
    },
  },
  lobby: {
    title: "Sala",
    connecting: "Conectando…",
    leave: "Salir de la sala",
    players: "{{count}}/{{max}} jugadores",
    host: "anfitrión",
    you: "tú",
    startGame: "Iniciar partida",
    needMorePlayers: "Se necesitan al menos 2 jugadores",

    smartBot: "Bot inteligente",
    randomBot: "Bot aleatorio",
    errors: {
      leaveFailed: "No se pudo salir de la sala",
      addBotFailed: "No se pudo añadir el bot",
      generic: "Algo salió mal",
    },
  },
  social: {
    addFriendLabel: "Añadir amigo",
    searchPlaceholder: "Buscar nombre de usuario...",
    noUsersFound: "No se encontraron usuarios.",
    invite: "Invitar",
    invited: "Enviado ✓",
    friendsTitle: "Amigos",
    noFriends: "Aún no tienes amigos.",
    online: "En línea",
    offline: "Desconectado",
    removeFriend: "Eliminar amigo",
    friendRequestsLabel: "Solicitudes de amistad",
    accept: "Aceptar",
    reject: "Rechazar",

    search: {
      filtersToggle: "Filtros",
      hideFilters: "Ocultar filtros",
      ageMinPlaceholder: "Edad mín.",
      ageMaxPlaceholder: "Edad máx.",
      sortByLabel: "Ordenar por",
      sortByUsername: "Nombre de usuario",
      sortByCreatedAt: "Fecha de registro",
      orderLabel: "Orden",
      orderAsc: "Ascendente",
      orderDesc: "Descendente",
      resultsCount: "{{count}} resultado(s)",
      prev: "Anterior",
      next: "Siguiente",
      pageIndicator: "Página {{page}} / {{totalPages}}",
    },
  },
  chat: {
    title: "Chat",
    emptyState: "Selecciona un amigo para chatear",
    placeholder: "Escribe un mensaje...",
    send: "Enviar",
  },
  profile: {
    title: "Perfil",
    changePhoto: "Cambiar foto",
    removePhoto: "Eliminar",
    usernameLocked: "Nombre de usuario (no se puede cambiar)",
    emailLabel: "Correo electrónico",
    currentPasswordLabel: "Contraseña actual (para confirmar)",
    saveEmail: "Guardar correo",
    ageLabel: "Edad",
    saveAge: "Guardar edad",
    matchHistoryTitle: "Historial de partidas",
    comingSoon: "Próximamente.",
    status: {
      photoUpdated: "Foto actualizada",
      photoRemoved: "Foto eliminada",
      emailUpdated: "Correo actualizado",
      ageUpdated: "Edad actualizada",
    },
    errors: {
      photoUpdateFailed: "No se pudo actualizar la foto (debe ser una imagen de menos de 2 MB)",
      photoRemoveFailed: "No se pudo eliminar la foto",
      emailUpdateFailed: "No se pudo actualizar el correo",
      ageUpdateFailed: "No se pudo actualizar la edad (debe ser un número entero entre 0 y 150)",
    },
  },
  game: {
    waiting: "esperando a que empiece la partida…",
    you: "tú",
    eliminated: "eliminado, como espectador",
    alive: "vivos: {{alive}}/{{total}}",
    go: "¡YA!",
    ai: "IA",
    player: "jugador {{id}}",
    draw: "empate",
    nobodySurvived: "nadie sobrevivió",
    youWin: "¡has ganado!",
    winsTheGame: "gana la partida",
    backToLobby: "volver a la sala",

    tutorial: {
      title: "Cómo jugar",
      goal: "Objetivo: ser la última moto que siga rodando.",

      play: "Jugar",
      waitingPlayers: "Esperando… {{ready}}/{{total}} listos",
      rules: {
        move: "Tu moto nunca se detiene: avanza sola, casilla a casilla.",
        trail: "Deja un muro detrás de ella, y ese muro permanece hasta el final de la ronda.",
        crash: "Quedas eliminado en cuanto tocas un borde o un muro, incluido el tuyo.",
        headOn: "Si dos motos entran en la misma casilla en el mismo instante, ambas quedan eliminadas.",
        noReverse: "No puedes dar media vuelta: el giro de 180° se ignora, anticipa tus curvas.",
        controls: "Conduce con las flechas, WASD o ZQSD.",
        countdown: "Las teclas ya responden durante el 3-2-1: elige tu dirección de salida.",
        win: "Gana el último jugador con vida. Si todos chocan en el mismo instante, la ronda queda en empate.",
      },
    },
  },
  languageSwitcher: {
    label: "Idioma",
  },

  footer: {
    nav: "Enlaces legales",
    privacy: "Política de privacidad",
    terms: "Condiciones de uso",
  },

  privacy: {
    title: "Política de privacidad",
    intro: {
      title: "Quiénes somos",
      body: "GRID_RUNNERS es un proyecto estudiantil desarrollado como parte del plan de estudios de la escuela 42 (ft_transcendence). No es un servicio comercial. Esta página explica qué datos personales recopila la aplicación, por qué los recopila y qué control conservas sobre ellos.",
    },
    dataCollected: {
      title: "Datos que recopilamos",
      body: "Cuando creas una cuenta guardamos tu nombre de usuario, tu dirección de correo electrónico, tu edad y una versión cifrada (hash) de tu contraseña: la contraseña en sí nunca se almacena en texto legible. Si subes un avatar, el archivo de imagen se guarda en nuestro servidor. También registramos la fecha de creación de tu cuenta. Mientras usas la aplicación guardamos los mensajes de chat que envías, tus relaciones de amistad (pendiente, aceptada, rechazada o bloqueada) y tu estado de conexión.",
    },
    purpose: {
      title: "Por qué usamos tus datos",
      body: "Tu correo y tu contraseña sirven para iniciar sesión y proteger tu cuenta. Tu nombre de usuario, tu avatar y tu estado de conexión permiten que otros jugadores te encuentren, te añadan como amigo y vean cuándo estás disponible. Tus mensajes sirven para que funcione el chat. Tu edad solo se usa como filtro de búsqueda en la sección «Añadir amigo»: otros jugadores pueden limitar una búsqueda a un rango de edad, pero tu edad en sí nunca se les muestra. No usamos tus datos con fines publicitarios, de perfilado ni de rastreo.",
    },
    cookies: {
      title: "Cookies",
      body: "Solo usamos dos cookies estrictamente necesarias, llamadas accessToken y refreshToken. Mantienen tu sesión iniciada entre páginas y son la única forma que tiene el servidor de reconocer tu sesión. Son HTTP-only, es decir, JavaScript no puede leerlas, y se eliminan al cerrar sesión. No usamos cookies de analítica, publicidad ni rastreo de terceros.",
    },
    sharing: {
      title: "Quién puede ver tus datos",
      body: "Nunca vendemos ni compartimos tus datos con terceros, y la aplicación no envía datos a ningún servicio externo. Dentro de la aplicación, los demás usuarios conectados pueden ver tu nombre de usuario, tu avatar y tu estado de conexión, y los amigos con los que chateas pueden ver los mensajes que les envías. Tu correo electrónico, tu edad y tu contraseña nunca se muestran a otros usuarios.",
    },
    retention: {
      title: "Cuánto tiempo conservamos tus datos",
      body: "Los datos de tu cuenta se conservan mientras exista tu cuenta. Los mensajes se conservan hasta que se elimina la relación de amistad correspondiente: eliminar a un amigo borra también toda la conversación. Las sesiones caducan automáticamente y se eliminan al cerrar sesión. Al tratarse de un proyecto escolar, toda la base de datos puede reiniciarse cuando el proyecto se evalúe o se retire.",
    },
    security: {
      title: "Seguridad",
      body: "Las contraseñas se almacenan cifradas mediante hash, nunca en texto claro. Todo el tráfico entre tu navegador y el servidor pasa por HTTPS. Los tokens de sesión se guardan en cookies HTTP-only para limitar el impacto de una inyección de scripts. Ningún sistema es perfectamente seguro, así que usa una contraseña que no reutilices en ningún otro sitio.",
    },
    rights: {
      title: "Tus derechos",
      body: "Puedes consultar y modificar tu correo electrónico, tu edad y tu avatar en cualquier momento desde tu página de perfil. El nombre de usuario no se puede cambiar. Si quieres una copia de tus datos, o la eliminación de tu cuenta y de todos los datos asociados, contáctanos y tramitaremos tu solicitud.",
    },
    contact: {
      title: "Contacto",
      body: "Cualquier duda sobre esta política puede enviarse al equipo a través de la intranet de 42 o de Slack: {{logins}}.",
    },
  },

  terms: {
    title: "Condiciones de uso",
    intro: {
      title: "Aceptación de las condiciones",
      body: "GRID_RUNNERS es una plataforma de juego multijugador y chat en línea, creada como proyecto estudiantil dentro del plan de estudios de 42. Al crear una cuenta o usar la aplicación, aceptas estas condiciones de uso. Si no estás de acuerdo con ellas, no uses la aplicación.",
    },
    account: {
      title: "Tu cuenta",
      body: "Debes proporcionar una dirección de correo válida e información veraz al registrarte. Eres responsable de mantener tu contraseña en secreto y de todo lo que ocurra desde tu cuenta. No compartas tu cuenta con nadie y no intentes iniciar sesión como otro usuario.",
    },
    conduct: {
      title: "Uso aceptable",
      body: "Respeta a los demás jugadores. No puedes acosar, amenazar ni insultar a otros usuarios, enviar spam, hacerte pasar por otra persona ni publicar contenido ilegal, de odio o sexualmente explícito. Tampoco puedes hacer trampas, aprovechar errores para obtener ventaja, interrumpir partidas, sobrecargar los servidores ni intentar acceder a partes del sistema para las que no tienes autorización.",
    },
    content: {
      title: "Tus contenidos",
      body: "Sigues siendo responsable de los mensajes que envías. Al enviar un mensaje nos autorizas a almacenarlo y a entregarlo a su destinatario. Podemos eliminar contenido o suspender una cuenta que incumpla estas normas. Puedes bloquear a cualquier usuario en cualquier momento para dejar de recibir sus mensajes.",
    },
    availability: {
      title: "Disponibilidad del servicio",
      body: "Se trata de un proyecto estudiantil, no de un servicio comercial: se ofrece de forma gratuita, sin garantía de disponibilidad, y puede interrumpirse, modificarse o cerrarse en cualquier momento. La base de datos puede reiniciarse sin previo aviso, lo que significa que las cuentas, las partidas y los mensajes pueden perderse.",
    },
    termination: {
      title: "Suspensión y eliminación",
      body: "Podemos suspender o eliminar una cuenta que incumpla estas condiciones. Puedes dejar de usar la aplicación cuando quieras y solicitar la eliminación de tu cuenta; consulta la política de privacidad para saber cómo se tramita esa solicitud.",
    },
    liability: {
      title: "Responsabilidad",
      body: "La aplicación se ofrece tal cual, sin ninguna garantía. En la medida en que lo permita la ley, los autores no se hacen responsables de ningún daño, pérdida de datos o interrupción del servicio derivados del uso de la aplicación.",
    },
    changes: {
      title: "Cambios en estas condiciones",
      body: "Estas condiciones pueden cambiar a medida que evolucione el proyecto. La fecha que aparece en la parte superior de esta página indica la última actualización. Seguir usando la aplicación después de un cambio implica que aceptas la nueva versión.",
    },
  },
} satisfies Dictionary;

export default es;
