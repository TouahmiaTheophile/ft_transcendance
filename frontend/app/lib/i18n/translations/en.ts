const en = {
  common: {
    backToHome: "Home",
    backToHomeAria: "Back to home page",
    backToDashboard: "Dashboard",
    backToDashboardAria: "Back to dashboard",
    logout: "Logout",

    lastUpdated: "Last updated: {{date}}",
  },

  home: {
    welcome: "Welcome to",
    loginCta: "Login",
    registerCta: "Register",
  },

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

  dashboard: {
    play: "Play",
    social: "Social",
  },

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

  lobby: {
    title: "Lobby",
    connecting: "Connecting…",
    leave: "Leave lobby",
    players: "{{count}}/{{max}} players",
    host: "host",
    you: "you",
    startGame: "Start game",
    needMorePlayers: "Need at least 2 players",

    smartBot: "Smart bot",
    randomBot: "Random bot",
    errors: {
      leaveFailed: "Could not leave lobby",
      addBotFailed: "Could not add bot",
      generic: "Something went wrong",
    },
  },

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

  chat: {
    title: "Chat",
    emptyState: "Select a friend to start chatting",
    placeholder: "start typing...",
    send: "Send",
  },

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

  game: {
    waiting: "waiting for the game to start…",
    you: "you",
    eliminated: "eliminated, spectating",

    alive: "alive: {{alive}}/{{total}}",

    go: "GO!",

    ai: "AI",
    player: "player {{id}}",

    draw: "draw",
    nobodySurvived: "nobody survived",
    youWin: "you win!",
    winsTheGame: "wins the game",
    backToLobby: "back to lobby",

    tutorial: {
      title: "How to play",
      goal: "Goal: be the last cycle still riding.",

      play: "Play",
      waitingPlayers: "Waiting… {{ready}}/{{total}} ready",
      rules: {
        move: "Your cycle never stops: it moves forward on its own, one cell at a time.",
        trail: "It leaves a solid wall behind it, and that wall stays until the end of the round.",
        crash: "You are eliminated the moment you touch a border or a wall — your own included.",
        headOn: "If two cycles enter the same cell at the same moment, both are eliminated.",
        noReverse: "You cannot turn back on yourself: a half-turn is ignored, so plan your turns.",
        controls: "Steer with the arrow keys, WASD or ZQSD.",
        countdown: "The keys already answer during the 3-2-1: use it to pick your starting direction.",
        win: "The last player alive wins. If everyone crashes at the same moment, the round is a draw.",
      },
    },
  },

  languageSwitcher: {
    label: "Language",
  },

  footer: {
    nav: "Legal links",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },

  privacy: {
    title: "Privacy Policy",
    intro: {
      title: "Who we are",
      body: "GRID_RUNNERS is a student project developed as part of the 42 school curriculum (ft_transcendence). It is not a commercial service. This page explains which personal data the application collects, why it is collected, and what control you have over it.",
    },
    dataCollected: {
      title: "Data we collect",
      body: "When you create an account we store your username, your email address, your age and a hashed version of your password -- the password itself is never stored in readable form. If you upload an avatar, the image file is stored on our server. We also record the date your account was created. While you use the application we store the chat messages you send, your friend relationships (pending, accepted, rejected or blocked) and your current online status.",
    },
    purpose: {
      title: "Why we use your data",
      body: "Your email and password are used to sign you in and to secure your account. Your username, avatar and online status let other players find you, add you as a friend and see when you are available. Your messages are used to deliver the chat feature. Your age is only used as a search filter in the Add Friend section: other players can narrow a search to an age range, but your age itself is never shown to them. We do not use your data for advertising, profiling or tracking.",
    },
    cookies: {
      title: "Cookies",
      body: "We only use two strictly necessary cookies, named accessToken and refreshToken. They keep you signed in between page loads and are the only way the server can recognise your session. They are HTTP-only, which means JavaScript cannot read them, and they are deleted when you log out. We use no analytics, advertising or third-party tracking cookies.",
    },
    sharing: {
      title: "Who can see your data",
      body: "We never sell or share your data with third parties, and the application does not send data to any external service. Inside the application, other signed-in users can see your username, your avatar and your online status, and the friends you chat with can see the messages you send them. Your email address, your age and your password are never shown to other users.",
    },
    retention: {
      title: "How long we keep your data",
      body: "Your account data is kept for as long as your account exists. Chat messages are kept until the corresponding friendship is deleted: removing a friend also deletes the whole conversation. Sign-in sessions expire automatically and are removed when you log out. Because this is a school project, the whole database may be reset when the project is evaluated or taken offline.",
    },
    security: {
      title: "Security",
      body: "Passwords are stored hashed, never in clear text. All traffic between your browser and the server goes through HTTPS. Session tokens are stored in HTTP-only cookies to limit the impact of a script injection. No system is perfectly secure, so please use a password that you do not reuse anywhere else.",
    },
    rights: {
      title: "Your rights",
      body: "You can view and change your email address, your age and your avatar at any time from your profile page. Your username cannot be changed. If you want a copy of your data, or want your account and all related data deleted, contact us and we will process your request.",
    },
    contact: {
      title: "Contact",
      body: "Questions about this policy can be sent to the team through the 42 intranet or Slack: {{logins}}.",
    },
  },

  terms: {
    title: "Terms of Service",
    intro: {
      title: "Acceptance of these terms",
      body: "GRID_RUNNERS is an online multiplayer game and chat platform built as a student project for the 42 curriculum. By creating an account or using the application, you agree to these Terms of Service. If you do not agree with them, please do not use the application.",
    },
    account: {
      title: "Your account",
      body: "You must provide a valid email address and accurate information when you register. You are responsible for keeping your password secret and for everything that happens under your account. Do not share your account with anyone, and do not try to sign in as another user.",
    },
    conduct: {
      title: "Acceptable use",
      body: "Be respectful of other players. You may not harass, threaten or insult other users, send spam, impersonate someone else, or post illegal, hateful or sexually explicit content. You may not cheat, exploit bugs to gain an advantage, disrupt matches, overload the servers, or try to access parts of the system you are not authorised to access.",
    },
    content: {
      title: "Your content",
      body: "You remain responsible for the messages you send. By sending a message you allow us to store it and to deliver it to its recipient. We may remove content or suspend an account that breaks these rules. You can block any user at any time to stop receiving messages from them.",
    },
    availability: {
      title: "Availability of the service",
      body: "This is a student project, not a commercial service: it is provided free of charge, with no guarantee of availability, and it may be interrupted, modified or shut down at any time. The database may be reset without notice, which means accounts, matches and messages can be lost.",
    },
    termination: {
      title: "Suspension and deletion",
      body: "We may suspend or delete an account that violates these terms. You can stop using the application at any time and ask for your account to be deleted; see the Privacy Policy for how that request is handled.",
    },
    liability: {
      title: "Liability",
      body: "The application is provided as is, without any warranty. To the extent permitted by law, the authors cannot be held liable for any damage, data loss or service interruption resulting from the use of the application.",
    },
    changes: {
      title: "Changes to these terms",
      body: "These terms may change as the project evolves. The date shown at the top of this page indicates the last update. Continuing to use the application after a change means that you accept the new version.",
    },
  },
};

export default en;
