// ============================================================================
// -rbauer- German dictionary. Like fr.ts, `satisfies Dictionary` forces the
// same keys as en.ts.
// ============================================================================
import type { Dictionary } from "./index";

const de = {
  common: {
    backToHome: "Startseite",
    backToHomeAria: "Zurück zur Startseite",
    backToDashboard: "Übersicht",
    backToDashboardAria: "Zurück zur Übersicht",
    logout: "Abmelden",

    // -rbauerMod3- See en.ts: the {{date}} placeholder is filled in by the page.
    lastUpdated: "Zuletzt aktualisiert: {{date}}",
  },
  home: {
    welcome: "Willkommen bei",
    loginCta: "Anmelden",
    registerCta: "Registrieren",
  },
  login: {
    heading: "ANMELDUNG",
    emailLabel: "E-Mail",
    emailPlaceholder: "deine@email.com",
    passwordLabel: "Passwort",
    submit: "Anmelden",
    submitting: "Anmeldung läuft...",
    errors: {
      emailRequired: "E-Mail ist erforderlich",
      emailInvalid: "Ungültiges E-Mail-Format",
      passwordRequired: "Passwort ist erforderlich",
      validationFailed: "Validierung fehlgeschlagen",
      invalidCredentials: "Ungültige Anmeldedaten",
      generic: "Etwas ist schiefgelaufen",
      network: "Netzwerkfehler. Öffne die App über https://localhost und überprüfe nginx/backend.",
    },
  },
  register: {
    heading: "REGISTRIEREN",
    usernameLabel: "Benutzername",
    usernamePlaceholder: "Wähle deinen Benutzernamen",
    emailLabel: "E-Mail",
    emailPlaceholder: "deine@email.com",
    passwordLabel: "Passwort",
    ageLabel: "Alter",
    agePlaceholder: "Dein Alter",
    submit: "Registrieren",
    submitting: "Registrierung läuft...",
    errors: {
      usernameTooShort: "Der Benutzername muss mindestens 3 Zeichen lang sein",
      usernameInvalidChars: "Der Benutzername darf nur Buchstaben, Zahlen, Punkte und Bindestriche enthalten",
      emailRequired: "E-Mail ist erforderlich",
      emailTooLong: "E-Mail ist zu lang",
      emailInvalid: "Ungültiges E-Mail-Format",
      passwordTooShort: "Das Passwort muss mindestens 8 Zeichen lang sein",
      ageRequired: "Alter ist erforderlich",
      ageInvalid: "Das Alter muss eine ganze Zahl zwischen 0 und 150 sein",
      validationFailed: "Validierung fehlgeschlagen",
      alreadyTaken: "{{field}} bereits vergeben",
      alreadyExists: "Diese Ressource existiert bereits",
      generic: "Etwas ist schiefgelaufen",
      network: "Netzwerkfehler. Öffne die App über https://localhost und überprüfe nginx/backend.",
    },
  },
  dashboard: {
    play: "Spielen",
    social: "Sozial",
  },
  online: {
    title: "Mehrspieler",
    lobbyListTitle: "Lobby-Liste",
    noLobbies: "Keine Lobbys verfügbar.",
    lobby: "Lobby",
    join: "Beitreten",
    createLobby: "Lobby erstellen",
    errors: {
      joinFailed: "Beitritt zur Lobby fehlgeschlagen",
      createFailed: "Lobby konnte nicht erstellt werden",
    },
  },
  lobby: {
    title: "Lobby",
    connecting: "Verbindung wird hergestellt…",
    leave: "Lobby verlassen",
    players: "{{count}}/{{max}} Spieler",
    host: "Gastgeber",
    you: "du",
    startGame: "Spiel starten",
    needMorePlayers: "Mindestens 2 Spieler erforderlich",
    errors: {
      leaveFailed: "Lobby konnte nicht verlassen werden",
      generic: "Etwas ist schiefgelaufen",
    },
  },
  social: {
    addFriendLabel: "Freund hinzufügen",
    searchPlaceholder: "Benutzernamen suchen...",
    noUsersFound: "Keine Benutzer gefunden.",
    invite: "Einladen",
    invited: "Gesendet ✓",
    friendsTitle: "Freunde",
    noFriends: "Noch keine Freunde.",
    online: "Online",
    offline: "Offline",
    removeFriend: "Freund entfernen",
    friendRequestsLabel: "Freundschaftsanfragen",
    accept: "Annehmen",
    reject: "Ablehnen",

    search: {
      filtersToggle: "Filter",
      hideFilters: "Filter ausblenden",
      ageMinPlaceholder: "Alter min.",
      ageMaxPlaceholder: "Alter max.",
      sortByLabel: "Sortieren nach",
      sortByUsername: "Benutzername",
      sortByCreatedAt: "Beitrittsdatum",
      orderLabel: "Reihenfolge",
      orderAsc: "Aufsteigend",
      orderDesc: "Absteigend",
      resultsCount: "{{count}} Ergebnis(se)",
      prev: "Zurück",
      next: "Weiter",
      pageIndicator: "Seite {{page}} / {{totalPages}}",
    },
  },
  chat: {
    title: "Chat",
    emptyState: "Wähle einen Freund, um zu chatten",
    placeholder: "Nachricht eingeben...",
    send: "Senden",
  },
  profile: {
    title: "Profil",
    changePhoto: "Foto ändern",
    removePhoto: "Entfernen",
    usernameLocked: "Benutzername (nicht änderbar)",
    emailLabel: "E-Mail",
    currentPasswordLabel: "Aktuelles Passwort (zur Bestätigung)",
    saveEmail: "E-Mail speichern",
    ageLabel: "Alter",
    saveAge: "Alter speichern",
    matchHistoryTitle: "Spielverlauf",
    comingSoon: "Demnächst verfügbar.",
    status: {
      photoUpdated: "Foto aktualisiert",
      photoRemoved: "Foto entfernt",
      emailUpdated: "E-Mail aktualisiert",
      ageUpdated: "Alter aktualisiert",
    },
    errors: {
      photoUpdateFailed: "Foto konnte nicht aktualisiert werden (muss ein Bild unter 2 MB sein)",
      photoRemoveFailed: "Foto konnte nicht entfernt werden",
      emailUpdateFailed: "E-Mail konnte nicht aktualisiert werden",
      ageUpdateFailed: "Alter konnte nicht aktualisiert werden (muss eine ganze Zahl zwischen 0 und 150 sein)",
    },
  },
  game: {
    placeholder: "Demnächst verfügbar.",
  },
  languageSwitcher: {
    label: "Sprache",
  },

  // -rbauerMod3- German footer and legal pages. Title/body structure explained
  // in en.ts.
  footer: {
    nav: "Rechtliche Links",
    privacy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
  },

  privacy: {
    title: "Datenschutzerklärung",
    intro: {
      title: "Wer wir sind",
      body: "GRID_RUNNERS ist ein Studierendenprojekt, das im Rahmen des Lehrplans der Schule 42 entwickelt wurde (ft_transcendence). Es ist kein kommerzieller Dienst. Diese Seite erklärt, welche personenbezogenen Daten die Anwendung erhebt, warum sie erhoben werden und welche Kontrolle Sie darüber behalten.",
    },
    dataCollected: {
      title: "Welche Daten wir erheben",
      body: "Bei der Erstellung eines Kontos speichern wir Ihren Benutzernamen, Ihre E-Mail-Adresse, Ihr Alter und eine gehashte Version Ihres Passworts. Das Passwort selbst wird nie im Klartext gespeichert. Wenn Sie ein Profilbild hochladen, wird die Bilddatei auf unserem Server gespeichert. Außerdem halten wir das Erstellungsdatum Ihres Kontos fest. Während der Nutzung speichern wir die Chatnachrichten, die Sie senden, Ihre Freundschaftsbeziehungen (ausstehend, angenommen, abgelehnt oder blockiert) sowie Ihren aktuellen Online-Status.",
    },
    purpose: {
      title: "Warum wir Ihre Daten verwenden",
      // -rbauerMod3- See the comment on the same key in en.ts: the age is a
      // server-side search filter only, it is never returned to other users.
      body: "Ihre E-Mail-Adresse und Ihr Passwort dienen dazu, Sie anzumelden und Ihr Konto zu schützen. Ihr Benutzername, Ihr Profilbild und Ihr Online-Status ermöglichen es anderen Spielern, Sie zu finden, als Freund hinzuzufügen und zu sehen, wann Sie verfügbar sind. Ihre Nachrichten werden für die Chatfunktion benötigt. Ihr Alter wird ausschließlich als Suchfilter im Bereich „Freund hinzufügen“ verwendet: Andere Spieler können eine Suche auf eine Altersspanne eingrenzen, aber Ihr Alter selbst wird ihnen nie angezeigt. Wir verwenden Ihre Daten nicht für Werbung, Profilbildung oder Tracking.",
    },
    cookies: {
      title: "Cookies",
      body: "Wir verwenden nur zwei unbedingt erforderliche Cookies mit den Namen accessToken und refreshToken. Sie halten Sie zwischen Seitenaufrufen angemeldet und sind die einzige Möglichkeit für den Server, Ihre Sitzung zu erkennen. Sie sind HTTP-only, das heißt JavaScript kann sie nicht lesen, und sie werden beim Abmelden gelöscht. Wir setzen keine Analyse-, Werbe- oder Tracking-Cookies von Dritten ein.",
    },
    sharing: {
      title: "Wer Ihre Daten sehen kann",
      body: "Wir verkaufen oder teilen Ihre Daten niemals mit Dritten, und die Anwendung sendet keine Daten an externe Dienste. Innerhalb der Anwendung sehen andere angemeldete Nutzer Ihren Benutzernamen, Ihr Profilbild und Ihren Online-Status, und die Freunde, mit denen Sie chatten, sehen die Nachrichten, die Sie ihnen senden. Ihre E-Mail-Adresse, Ihr Alter und Ihr Passwort werden anderen Nutzern nie angezeigt.",
    },
    retention: {
      title: "Wie lange wir Ihre Daten speichern",
      body: "Ihre Kontodaten werden gespeichert, solange Ihr Konto besteht. Nachrichten werden aufbewahrt, bis die zugehörige Freundschaft gelöscht wird: Das Entfernen eines Freundes löscht auch die gesamte Unterhaltung. Anmeldesitzungen laufen automatisch ab und werden beim Abmelden entfernt. Da es sich um ein Schulprojekt handelt, kann die gesamte Datenbank zurückgesetzt werden, wenn das Projekt bewertet oder abgeschaltet wird.",
    },
    security: {
      title: "Sicherheit",
      body: "Passwörter werden gehasht gespeichert, niemals im Klartext. Der gesamte Datenverkehr zwischen Ihrem Browser und dem Server läuft über HTTPS. Sitzungstokens werden in HTTP-only-Cookies gespeichert, um die Auswirkungen einer Skript-Injektion zu begrenzen. Kein System ist vollkommen sicher, verwenden Sie daher ein Passwort, das Sie nirgendwo sonst benutzen.",
    },
    rights: {
      title: "Ihre Rechte",
      body: "Sie können Ihre E-Mail-Adresse, Ihr Alter und Ihr Profilbild jederzeit auf Ihrer Profilseite einsehen und ändern. Der Benutzername kann nicht geändert werden. Wenn Sie eine Kopie Ihrer Daten oder die Löschung Ihres Kontos und aller zugehörigen Daten wünschen, kontaktieren Sie uns und wir bearbeiten Ihre Anfrage.",
    },
    contact: {
      title: "Kontakt",
      body: "Fragen zu dieser Erklärung können Sie dem Team über das 42-Intranet oder Slack senden: {{logins}}.",
    },
  },

  terms: {
    title: "Nutzungsbedingungen",
    intro: {
      title: "Annahme dieser Bedingungen",
      body: "GRID_RUNNERS ist eine Online-Mehrspieler-Spiel- und Chatplattform, die als Studierendenprojekt im Rahmen des 42-Lehrplans entwickelt wurde. Indem Sie ein Konto erstellen oder die Anwendung nutzen, stimmen Sie diesen Nutzungsbedingungen zu. Wenn Sie damit nicht einverstanden sind, nutzen Sie die Anwendung bitte nicht.",
    },
    account: {
      title: "Ihr Konto",
      body: "Sie müssen bei der Registrierung eine gültige E-Mail-Adresse und zutreffende Angaben machen. Sie sind dafür verantwortlich, Ihr Passwort geheim zu halten, und für alles, was unter Ihrem Konto geschieht. Teilen Sie Ihr Konto mit niemandem und versuchen Sie nicht, sich als anderer Nutzer anzumelden.",
    },
    conduct: {
      title: "Zulässige Nutzung",
      body: "Behandeln Sie andere Spieler respektvoll. Sie dürfen andere Nutzer nicht belästigen, bedrohen oder beleidigen, keinen Spam versenden, sich nicht als jemand anderes ausgeben und keine illegalen, hasserfüllten oder sexuell expliziten Inhalte veröffentlichen. Ebenso dürfen Sie nicht betrügen, Fehler zu Ihrem Vorteil ausnutzen, Partien stören, die Server überlasten oder auf Teile des Systems zugreifen, für die Sie keine Berechtigung haben.",
    },
    content: {
      title: "Ihre Inhalte",
      body: "Sie bleiben für die Nachrichten verantwortlich, die Sie senden. Mit dem Versenden einer Nachricht erlauben Sie uns, sie zu speichern und an den Empfänger zuzustellen. Wir können Inhalte entfernen oder ein Konto sperren, das gegen diese Regeln verstößt. Sie können jeden Nutzer jederzeit blockieren, um keine Nachrichten mehr von ihm zu erhalten.",
    },
    availability: {
      title: "Verfügbarkeit des Dienstes",
      body: "Dies ist ein Studierendenprojekt und kein kommerzieller Dienst: Er wird kostenlos und ohne Verfügbarkeitsgarantie bereitgestellt und kann jederzeit unterbrochen, geändert oder eingestellt werden. Die Datenbank kann ohne Vorankündigung zurückgesetzt werden, wodurch Konten, Partien und Nachrichten verloren gehen können.",
    },
    termination: {
      title: "Sperrung und Löschung",
      body: "Wir können ein Konto sperren oder löschen, das gegen diese Bedingungen verstößt. Sie können die Nutzung der Anwendung jederzeit beenden und die Löschung Ihres Kontos verlangen; wie ein solcher Antrag bearbeitet wird, steht in der Datenschutzerklärung.",
    },
    liability: {
      title: "Haftung",
      body: "Die Anwendung wird ohne jede Gewährleistung so bereitgestellt, wie sie ist. Soweit gesetzlich zulässig, haften die Autoren nicht für Schäden, Datenverluste oder Dienstunterbrechungen, die aus der Nutzung der Anwendung entstehen.",
    },
    changes: {
      title: "Änderungen dieser Bedingungen",
      body: "Diese Bedingungen können sich mit der Weiterentwicklung des Projekts ändern. Das oben auf dieser Seite angezeigte Datum gibt die letzte Aktualisierung an. Wenn Sie die Anwendung nach einer Änderung weiter nutzen, akzeptieren Sie die neue Fassung.",
    },
  },
} satisfies Dictionary;

export default de;
