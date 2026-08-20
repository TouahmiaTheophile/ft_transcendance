import type { Dictionary } from "./index";

const fr = {
  common: {
    backToHome: "Accueil",
    backToHomeAria: "Retour à l'accueil",
    backToDashboard: "Tableau de bord",
    backToDashboardAria: "Retour au tableau de bord",
    logout: "Déconnexion",

    lastUpdated: "Dernière mise à jour : {{date}}",
  },
  home: {
    welcome: "Bienvenue sur",
    loginCta: "Connexion",
    registerCta: "Inscription",
  },
  login: {
    heading: "CONNEXION",
    emailLabel: "E-mail",
    emailPlaceholder: "votre@email.com",
    passwordLabel: "Mot de passe",
    submit: "Se connecter",
    submitting: "Connexion en cours...",
    errors: {
      emailRequired: "L'e-mail est requis",
      emailInvalid: "Format d'e-mail invalide",
      passwordRequired: "Le mot de passe est requis",
      validationFailed: "Échec de la validation",
      invalidCredentials: "Identifiants invalides",
      generic: "Une erreur est survenue",
      network: "Erreur réseau. Ouvrez l'application via https://localhost et vérifiez nginx/backend.",
    },
  },
  register: {
    heading: "INSCRIPTION",
    usernameLabel: "Nom d'utilisateur",
    usernamePlaceholder: "Choisissez un nom d'utilisateur",
    emailLabel: "E-mail",
    emailPlaceholder: "votre@email.com",
    passwordLabel: "Mot de passe",
    ageLabel: "Âge",
    agePlaceholder: "Votre âge",
    submit: "S'inscrire",
    submitting: "Inscription en cours...",
    errors: {
      usernameTooShort: "Le nom d'utilisateur doit contenir au moins 3 caractères",
      usernameInvalidChars: "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points et tirets",
      emailRequired: "L'e-mail est requis",
      emailTooLong: "L'e-mail est trop long",
      emailInvalid: "Format d'e-mail invalide",
      passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères",
      ageRequired: "L'âge est requis",
      ageInvalid: "L'âge doit être un nombre entier entre 0 et 150",
      validationFailed: "Échec de la validation",
      alreadyTaken: "{{field}} déjà utilisé",
      alreadyExists: "Cette ressource existe déjà",
      generic: "Une erreur est survenue",
      network: "Erreur réseau. Ouvrez l'application via https://localhost et vérifiez nginx/backend.",
    },
  },
  dashboard: {
    play: "Jouer",
    social: "Social",
  },
  online: {
    title: "Multijoueur",
    lobbyListTitle: "Liste des salons",
    noLobbies: "Aucun salon disponible.",
    lobby: "Salon",
    join: "Rejoindre",
    createLobby: "Créer un salon",
    errors: {
      joinFailed: "Impossible de rejoindre le salon",
      createFailed: "Impossible de créer le salon",
    },
  },
  lobby: {
    title: "Salon",
    connecting: "Connexion en cours…",
    leave: "Quitter le salon",
    players: "{{count}}/{{max}} joueurs",
    host: "hôte",
    you: "vous",
    startGame: "Démarrer la partie",
    needMorePlayers: "Il faut au moins 2 joueurs",

    smartBot: "Bot intelligent",
    randomBot: "Bot aléatoire",
    errors: {
      leaveFailed: "Impossible de quitter le salon",
      addBotFailed: "Impossible d'ajouter un bot",
      generic: "Une erreur est survenue",
    },
  },
  social: {
    addFriendLabel: "Ajouter un ami",
    searchPlaceholder: "Rechercher un nom d'utilisateur...",
    noUsersFound: "Aucun utilisateur trouvé.",
    invite: "Inviter",
    invited: "Envoyé ✓",
    friendsTitle: "Amis",
    noFriends: "Aucun ami pour le moment.",
    online: "En ligne",
    offline: "Hors ligne",
    removeFriend: "Retirer l'ami",
    friendRequestsLabel: "Demandes d'ami",
    accept: "Accepter",
    reject: "Refuser",

    search: {
      filtersToggle: "Filtres",
      hideFilters: "Masquer les filtres",
      ageMinPlaceholder: "Âge min",
      ageMaxPlaceholder: "Âge max",
      sortByLabel: "Trier par",
      sortByUsername: "Nom d'utilisateur",
      sortByCreatedAt: "Date d'inscription",
      orderLabel: "Ordre",
      orderAsc: "Croissant",
      orderDesc: "Décroissant",
      resultsCount: "{{count}} résultat(s)",
      prev: "Précédent",
      next: "Suivant",
      pageIndicator: "Page {{page}} / {{totalPages}}",
    },
  },
  chat: {
    title: "Discussion",
    emptyState: "Sélectionnez un ami pour discuter",
    placeholder: "Écrivez un message...",
    send: "Envoyer",
  },
  profile: {
    title: "Profil",
    changePhoto: "Changer la photo",
    removePhoto: "Supprimer",
    usernameLocked: "Nom d'utilisateur (non modifiable)",
    emailLabel: "E-mail",
    currentPasswordLabel: "Mot de passe actuel (pour confirmer)",
    saveEmail: "Enregistrer l'e-mail",
    ageLabel: "Âge",
    saveAge: "Enregistrer l'âge",
    matchHistoryTitle: "Historique des matchs",
    comingSoon: "Bientôt disponible.",
    status: {
      photoUpdated: "Photo mise à jour",
      photoRemoved: "Photo supprimée",
      emailUpdated: "E-mail mis à jour",
      ageUpdated: "Âge mis à jour",
    },
    errors: {
      photoUpdateFailed: "Impossible de mettre à jour la photo (image de moins de 2 Mo requise)",
      photoRemoveFailed: "Impossible de supprimer la photo",
      emailUpdateFailed: "Impossible de mettre à jour l'e-mail",
      ageUpdateFailed: "Impossible de mettre à jour l'âge (doit être un nombre entier entre 0 et 150)",
    },
  },
  game: {
    waiting: "en attente du début de la partie…",
    you: "vous",
    eliminated: "éliminé, en spectateur",
    alive: "en vie : {{alive}}/{{total}}",
    go: "PARTEZ !",
    ai: "IA",
    player: "joueur {{id}}",
    draw: "égalité",
    nobodySurvived: "personne n'a survécu",
    youWin: "vous avez gagné !",
    winsTheGame: "remporte la partie",
    backToLobby: "retour au salon",

    tutorial: {
      title: "Comment jouer",
      goal: "But : être la dernière moto encore en course.",

      play: "Jouer",
      waitingPlayers: "En attente… {{ready}}/{{total}} prêts",
      rules: {
        move: "Votre moto ne s'arrête jamais : elle avance toute seule, case par case.",
        trail: "Elle laisse un mur derrière elle, et ce mur reste jusqu'à la fin de la manche.",
        crash: "Vous êtes éliminé dès que vous touchez un bord ou un mur — le vôtre compris.",
        headOn: "Si deux motos entrent dans la même case au même instant, les deux sont éliminées.",
        noReverse: "Impossible de faire demi-tour : le demi-tour est ignoré, anticipez vos virages.",
        controls: "Dirigez-vous avec les flèches, WASD ou ZQSD.",
        countdown: "Les touches répondent déjà pendant le 3-2-1 : choisissez votre direction de départ.",
        win: "Le dernier joueur en vie gagne. Si tout le monde s'écrase au même instant, la manche est nulle.",
      },
    },
  },
  languageSwitcher: {
    label: "Langue",
  },

  footer: {
    nav: "Liens légaux",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
  },

  privacy: {
    title: "Politique de confidentialité",
    intro: {
      title: "Qui sommes-nous",
      body: "GRID_RUNNERS est un projet étudiant développé dans le cadre du cursus de l'école 42 (ft_transcendence). Ce n'est pas un service commercial. Cette page explique quelles données personnelles l'application collecte, pourquoi elle les collecte, et quel contrôle vous gardez dessus.",
    },
    dataCollected: {
      title: "Les données que nous collectons",
      body: "Lors de la création de votre compte, nous enregistrons votre nom d'utilisateur, votre adresse e-mail, votre âge et une version hachée de votre mot de passe : le mot de passe lui-même n'est jamais stocké en clair. Si vous envoyez un avatar, le fichier image est stocké sur notre serveur. Nous enregistrons également la date de création de votre compte. Pendant votre utilisation de l'application, nous conservons les messages que vous envoyez, vos relations d'amitié (en attente, acceptée, refusée ou bloquée) ainsi que votre statut de connexion.",
    },
    purpose: {
      title: "Pourquoi nous utilisons vos données",
      body: "Votre e-mail et votre mot de passe servent à vous connecter et à sécuriser votre compte. Votre nom d'utilisateur, votre avatar et votre statut de connexion permettent aux autres joueurs de vous trouver, de vous ajouter en ami et de voir quand vous êtes disponible. Vos messages servent à faire fonctionner le chat. Votre âge sert uniquement de filtre de recherche dans la section « Ajouter un ami » : les autres joueurs peuvent restreindre une recherche à une tranche d'âge, mais votre âge lui-même ne leur est jamais montré. Nous n'utilisons pas vos données à des fins publicitaires, de profilage ou de traçage.",
    },
    cookies: {
      title: "Cookies",
      body: "Nous n'utilisons que deux cookies strictement nécessaires, nommés accessToken et refreshToken. Ils vous maintiennent connecté d'une page à l'autre et sont le seul moyen pour le serveur de reconnaître votre session. Ils sont HTTP-only, c'est-à-dire illisibles par JavaScript, et ils sont supprimés à la déconnexion. Nous n'utilisons aucun cookie de mesure d'audience, de publicité ou de traçage tiers.",
    },
    sharing: {
      title: "Qui peut voir vos données",
      body: "Nous ne vendons ni ne partageons jamais vos données à des tiers, et l'application n'envoie aucune donnée à un service externe. À l'intérieur de l'application, les autres utilisateurs connectés voient votre nom d'utilisateur, votre avatar et votre statut de connexion, et les amis avec qui vous discutez voient les messages que vous leur envoyez. Votre adresse e-mail, votre âge et votre mot de passe ne sont jamais montrés aux autres utilisateurs.",
    },
    retention: {
      title: "Combien de temps nous les conservons",
      body: "Les données de votre compte sont conservées tant que votre compte existe. Les messages sont conservés jusqu'à la suppression de la relation d'amitié correspondante : retirer un ami supprime aussi toute la conversation. Les sessions de connexion expirent automatiquement et sont supprimées lorsque vous vous déconnectez. Comme il s'agit d'un projet scolaire, l'ensemble de la base de données peut être réinitialisé lors de l'évaluation du projet ou de son arrêt.",
    },
    security: {
      title: "Sécurité",
      body: "Les mots de passe sont stockés hachés, jamais en clair. Tout le trafic entre votre navigateur et le serveur passe par HTTPS. Les jetons de session sont stockés dans des cookies HTTP-only afin de limiter l'impact d'une injection de script. Aucun système n'est parfaitement sûr : utilisez un mot de passe que vous ne réutilisez nulle part ailleurs.",
    },
    rights: {
      title: "Vos droits",
      body: "Vous pouvez consulter et modifier votre adresse e-mail, votre âge et votre avatar à tout moment depuis votre page de profil. Votre nom d'utilisateur ne peut pas être modifié. Si vous souhaitez une copie de vos données, ou la suppression de votre compte et de toutes les données associées, contactez-nous et nous traiterons votre demande.",
    },
    contact: {
      title: "Contact",
      body: "Toute question sur cette politique peut être adressée à l'équipe via l'intranet 42 ou Slack : {{logins}}.",
    },
  },

  terms: {
    title: "Conditions d'utilisation",
    intro: {
      title: "Acceptation des conditions",
      body: "GRID_RUNNERS est une plateforme de jeu multijoueur et de chat en ligne, réalisée comme projet étudiant dans le cadre du cursus 42. En créant un compte ou en utilisant l'application, vous acceptez les présentes conditions d'utilisation. Si vous ne les acceptez pas, n'utilisez pas l'application.",
    },
    account: {
      title: "Votre compte",
      body: "Vous devez fournir une adresse e-mail valide et des informations exactes lors de votre inscription. Vous êtes responsable de la confidentialité de votre mot de passe et de tout ce qui se passe depuis votre compte. Ne partagez votre compte avec personne et n'essayez pas de vous connecter en tant qu'un autre utilisateur.",
    },
    conduct: {
      title: "Usage acceptable",
      body: "Respectez les autres joueurs. Il est interdit de harceler, menacer ou insulter d'autres utilisateurs, d'envoyer du spam, d'usurper l'identité d'autrui ou de publier des contenus illégaux, haineux ou sexuellement explicites. Il est également interdit de tricher, d'exploiter des bugs pour obtenir un avantage, de perturber les parties, de surcharger les serveurs ou de tenter d'accéder à des parties du système auxquelles vous n'avez pas droit.",
    },
    content: {
      title: "Vos contenus",
      body: "Vous restez responsable des messages que vous envoyez. En envoyant un message, vous nous autorisez à le stocker et à le transmettre à son destinataire. Nous pouvons supprimer un contenu ou suspendre un compte qui enfreint ces règles. Vous pouvez bloquer n'importe quel utilisateur à tout moment pour ne plus recevoir ses messages.",
    },
    availability: {
      title: "Disponibilité du service",
      body: "Il s'agit d'un projet étudiant, pas d'un service commercial : il est fourni gratuitement, sans garantie de disponibilité, et peut être interrompu, modifié ou arrêté à tout moment. La base de données peut être réinitialisée sans préavis, ce qui signifie que les comptes, les parties et les messages peuvent être perdus.",
    },
    termination: {
      title: "Suspension et suppression",
      body: "Nous pouvons suspendre ou supprimer un compte qui enfreint ces conditions. Vous pouvez cesser d'utiliser l'application à tout moment et demander la suppression de votre compte ; consultez la politique de confidentialité pour savoir comment cette demande est traitée.",
    },
    liability: {
      title: "Responsabilité",
      body: "L'application est fournie en l'état, sans aucune garantie. Dans les limites permises par la loi, les auteurs ne peuvent être tenus responsables d'un dommage, d'une perte de données ou d'une interruption de service résultant de l'utilisation de l'application.",
    },
    changes: {
      title: "Modification des conditions",
      body: "Ces conditions peuvent évoluer avec le projet. La date affichée en haut de cette page indique la dernière mise à jour. Continuer à utiliser l'application après une modification vaut acceptation de la nouvelle version.",
    },
  },
} satisfies Dictionary;

export default fr;
