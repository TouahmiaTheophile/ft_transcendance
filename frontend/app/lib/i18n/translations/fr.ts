// ============================================================================
// -rbauer- French dictionary.
//
// `satisfies Dictionary` at the bottom means: "TypeScript, please check that
// this object has EXACTLY the same keys as the English one (en.ts)". If a
// key is missing here, or if one exists here but not in en.ts, the build
// fails right away -- you can't accidentally ship an incomplete translation.
//
// The values themselves are free: only the shape (the keys) has to match,
// the French text can be as different from the English text as needed.
// ============================================================================
import type { Dictionary } from "./index";

const fr = {
  common: {
    backToHome: "Accueil",
    backToHomeAria: "Retour à l'accueil",
    backToDashboard: "Tableau de bord",
    backToDashboardAria: "Retour au tableau de bord",
    logout: "Déconnexion",
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
    errors: {
      leaveFailed: "Impossible de quitter le salon",
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
    placeholder: "Bientôt disponible.",
  },
  languageSwitcher: {
    label: "Langue",
  },
} satisfies Dictionary;

export default fr;
