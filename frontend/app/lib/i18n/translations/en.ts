// ============================================================================
// -rbauer- English dictionary -- this is the SOURCE OF TRUTH for the whole app.
//
// Every other language file (fr.ts, es.ts, de.ts) is checked against the
// exact shape of this object (see the `Dictionary` type in ./index.ts).
// If you add, rename, or remove a key here, TypeScript will immediately
// complain in every other language file until you do the same change there.
//
// Organization: one top-level key per page/feature ("login", "social",
// "lobby"...), so you always know where to look for a given piece of text.
// Inside each one, an optional "errors" group for error messages.
//
// A value can contain a placeholder like "{{count}}" -- that gets replaced
// at runtime by the `t()` function (see ../useTranslation.ts) with a real
// value, e.g. t("lobby.players", { count: 3, max: 4 }) -> "3/4 players".
// ============================================================================
const en = {
  // -rbauer- Small bits of text reused on several pages (back links, logout button).
  common: {
    backToHome: "Home",
    backToHomeAria: "Back to home page",
    backToDashboard: "Dashboard",
    backToDashboardAria: "Back to dashboard",
    logout: "Logout",
  },

  // -rbauer- "/" -- the landing page.
  home: {
    welcome: "Welcome to",
    loginCta: "Login",
    registerCta: "Register",
  },

  // -rbauer- "/login"
  login: {
    heading: "LOGIN",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    submit: "Sign In",
    submitting: "Signing in...",
    errors: {
      emailRequired: "Email is required",
      emailInvalid: "Invalid email format",
      passwordRequired: "Password is required",
      validationFailed: "Validation failed",
      invalidCredentials: "Invalid credentials",
      generic: "Something went wrong",
      network: "Network error. Open the app with https://localhost and check nginx/backend.",
    },
  },

  // -rbauer- "/register"
  register: {
    heading: "REGISTER",
    usernameLabel: "Username",
    usernamePlaceholder: "Choose your username",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    ageLabel: "Age",
    agePlaceholder: "Your age",
    submit: "Sign Up",
    submitting: "Signing up...",
    errors: {
      usernameTooShort: "Username must be at least 3 characters",
      usernameInvalidChars: "Username can only contain letters, numbers, dots and hyphens",
      emailRequired: "Email is required",
      emailTooLong: "Email is too long",
      emailInvalid: "Invalid email format",
      passwordTooShort: "Password must be at least 8 characters",
      ageRequired: "Age is required",
      ageInvalid: "Age must be a whole number between 0 and 150",
      validationFailed: "Validation failed",
      alreadyTaken: "{{field}} already taken",
      alreadyExists: "Resource already exists",
      generic: "Something went wrong",
      network: "Network error. Open the app with https://localhost and check nginx/backend.",
    },
  },

  // -rbauer- "/dashboard" -- the two big buttons (Play / Social).
  dashboard: {
    play: "Play",
    social: "Social",
  },

  // -rbauer- "/dashboard/online" -- the lobby list.
  online: {
    title: "Multiplayer",
    lobbyListTitle: "Lobby List",
    noLobbies: "No lobbies available.",
    lobby: "Lobby",
    join: "Join",
    createLobby: "Create Lobby",
    errors: {
      joinFailed: "Could not join lobby",
      createFailed: "Could not create lobby",
    },
  },

  // -rbauer- "/dashboard/online/lobby/[id]" -- inside one lobby.
  lobby: {
    title: "Lobby",
    connecting: "Connecting…",
    leave: "Leave lobby",
    players: "{{count}}/{{max}} players",
    host: "host",
    you: "you",
    startGame: "Start game",
    needMorePlayers: "Need at least 2 players",
    errors: {
      leaveFailed: "Could not leave lobby",
      generic: "Something went wrong",
    },
  },

  // -rbauer- "/dashboard/social" -- friends list, requests, search.
  social: {
    addFriendLabel: "Add friend",
    searchPlaceholder: "Search username...",
    noUsersFound: "No users found.",
    invite: "Invite",
    invited: "Sent ✓",
    friendsTitle: "Friends",
    noFriends: "No friends yet.",
    online: "Online",
    offline: "Offline",
    removeFriend: "Remove friend",
    friendRequestsLabel: "Friend requests",
    accept: "Accept",
    reject: "Reject",

    // -rbauerMod2- Advanced search: filters, sorting and pagination on top
    // of the basic text search above.
    search: {
      filtersToggle: "Filters",
      hideFilters: "Hide filters",
      ageMinPlaceholder: "Min age",
      ageMaxPlaceholder: "Max age",
      sortByLabel: "Sort by",
      sortByUsername: "Username",
      sortByCreatedAt: "Date joined",
      orderLabel: "Order",
      orderAsc: "Ascending",
      orderDesc: "Descending",
      resultsCount: "{{count}} result(s)",
      prev: "Previous",
      next: "Next",
      pageIndicator: "Page {{page}} / {{totalPages}}",
    },
  },

  // -rbauer- The chat panel inside the Social page.
  chat: {
    title: "Chat",
    emptyState: "Select a friend to start chatting",
    placeholder: "start typing...",
    send: "Send",
  },

  // -rbauer- The "view profile" modal.
  profile: {
    title: "Profile",
    changePhoto: "Change photo",
    removePhoto: "Remove",
    usernameLocked: "Username (cannot be changed)",
    emailLabel: "Email",
    currentPasswordLabel: "Current password (to confirm)",
    saveEmail: "Save email",
    ageLabel: "Age",
    saveAge: "Save age",
    matchHistoryTitle: "Match history",
    comingSoon: "Coming soon.",
    status: {
      photoUpdated: "Photo updated",
      photoRemoved: "Photo removed",
      emailUpdated: "Email updated",
      ageUpdated: "Age updated",
    },
    errors: {
      photoUpdateFailed: "Couldn't update photo (must be an image under 2 MB)",
      photoRemoveFailed: "Couldn't remove photo",
      emailUpdateFailed: "Couldn't update email",
      ageUpdateFailed: "Couldn't update age (must be a whole number between 0 and 150)",
    },
  },

  // -rbauer- "/game" -- placeholder page, not implemented yet.
  game: {
    placeholder: "Coming soon.",
  },

  // -rbauer- The accessible label on the language <select> itself.
  languageSwitcher: {
    label: "Language",
  },
};

export default en;
