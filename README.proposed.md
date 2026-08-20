*This project has been created as part of the 42 curriculum by van-nguy, ttouahmia, anvacca, rbauer.*

# ft_transcendence

**Description**
- **Project name:** ft_transcendence — the application is called **GRID_RUNNERS**.
- **Overview:** A full-stack real-time web application built for the 42 curriculum. GRID_RUNNERS is a multiplayer light-cycle game played in the browser, wrapped in a complete social layer. Two to four players race on a shared grid: each cycle moves forward on its own and leaves a solid wall behind it, and the last player still riding wins. Empty seats can be filled with AI bots. The entire simulation runs server-side — the browser only sends a direction and renders the state it receives.
- **Goal:** Deliver a playable, networked game with social features (friends, private chat, lobbies) and a secure backend.
- **Key features:** Authentication (JWT + refresh token rotation), user profiles and avatars, friend requests and blocking, private conversations with persisted history, online presence, advanced user search, lobby management, a real-time game engine with AI opponents, a multi-language interface, and Privacy Policy / Terms of Service pages.

**Instructions**
- **Prerequisites:**
  - Docker & Docker Compose — this is the only requirement to run the project.
  - `make` (native on Linux/macOS; on Windows use WSL2 or Git Bash).
  - OpenSSL >= 1.1.1 (used by `make certs` to generate the local HTTPS certificate).
  - Node.js v20+ — optional, only needed for host-side helpers such as `make db-studio`. All services run Node 22 inside their containers.
- **Environment:**
  - A project-level `.env` file is expected at the repository root (there is a provided `.env.example`). Do NOT create it under `backend/` — Docker Compose and the backend service load envs from the repository root `.env`.
  - Required entries (minimum):
    - `DATABASE_URL` — Prisma connection string (example: `mysql://user:pass@mariadb:3306/appdb`).
    - `DB_USER`, `DB_PASSWORD`, `DB_NAME` — also used to provision MariaDB; `validateEnvironment()` checks these at startup.
    - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — secrets for JWT signing. Generate real values (`openssl rand -hex 32`); the ones in `.env.example` are placeholders.
    - `BACKEND_PORT` — optional (defaults to `3000`).
    - `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL` — frontend public URLs. **Leave them empty**: the frontend then falls back to relative URLs, so every call is same-origin regardless of the host used to reach the app.
    - Other helpful vars: `COMPOSE_PROJECT_NAME`, `DB_ROOT_PASSWORD`, `DB_PORT`.
- **Install and run (recommended via Makefile)**
  - This repository includes a `Makefile` with convenient targets. Preferred quick flow (from project root):
    ```bash
    # first-time setup (copies .env.example and creates local HTTPS certs)
    make init

    # start the production stack (build + HTTPS), single command
    make prod

    # development with hot reload
    make dev        # detached: make dev-d
    ```
  - Then open **https://localhost**. The certificate is self-signed, so the browser will show a security warning on first visit — this is expected for a local setup; accept it to continue.
  - To sync the Prisma schema to the database (this project uses `prisma db push` rather than migrations):
    ```bash
    # run inside the dev backend container (Makefile helper):
    make db-push
    ```
  - To create demo accounts for testing the search filters, sorting and pagination:
    ```bash
    make prod-users   # 20 accounts spread across an age range
    ```
  - The `Makefile` also exposes `db-studio`, `db-seed`, `nuke` and other helpers — run `make help` to see available targets.
  - Note: most contributors use the `Makefile`/Docker flow because it guarantees the correct service hostnames (e.g., `mariadb` in `DATABASE_URL`).
- **Notes:**
  - In production only nginx publishes ports: **80** (redirects to HTTPS) and **443**. The frontend, backend and database are reachable only from the internal Docker network.
  - In development, `docker-compose.override.yml` additionally exposes the frontend on `3001`, the backend on `3000` and MariaDB on `3306` for debugging.
  - The backend's `validateEnvironment()` requires `DB_USER`, `DB_PASSWORD` and `DB_NAME` to be present and contain only valid characters when startup bypasses container entry scripts; ensure these keys are set in `.env`.

**Resources**
- NestJS: https://nestjs.com
- Next.js: https://nextjs.org
- Prisma: https://www.prisma.io
- Socket.IO: https://socket.io
- nginx reverse proxy and WebSocket proxying: https://nginx.org/en/docs/http/websocket.html
- bcrypt and password storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- This README was drafted with the assistance of an AI for structure and wording only; implementation decisions and code were written by the project authors.

**AI Usage**
- **Scope:** AI tools were used as an assistant to support the team during documentation, design and development tasks.
- **Tasks where AI was used:**
  - Drafting and editing documentation (README, instructions and explanatory text).
  - Code verification and review: spotting issues, suggesting fixes and alternative approaches.
  - Solution exploration and design brainstorming: surveying existing approaches, selecting suitable patterns, and adapting them to project constraints.
  - Implementing and testing novel solutions: prototyping ideas and validating approaches through targeted examples and tests.
  - Stress-testing ideas: producing comparative evaluations and edge-case reasoning to validate design choices.
- **How outputs were used:** suggestions and code snippets produced by the AI were reviewed, adapted and integrated by the team; final implementation decisions and commits were authored by project members.

**Team Information**
- **van-nguy:** PM, Technical Lead, Developer
  - Responsibilities: Set up the architecture and develop the backend; regularly contacts team members to track progress.
- **anvacca:** PO, PM, Developer
  - Responsibilities: Product vision and organization; wrote initial task lists for project parts; frontend development.
- **ttouahmia:** PO, Developer
  - Responsibilities: Contributed to the overall product vision and responsible for the game; implemented the game and contributed to frontend development.
- **rbauer:** Technical Lead, Developer
  - Responsibilities: Implemented the Nginx configuration during the project to isolate containers; implemented various additional modules beyond the base project.

**Project Management**
- Work organization:
  - The project began with three core members; `rbauer` joined when the mandatory part was approximately completed and primarily implemented additional modules and infrastructure.
  - The team used three primary branches: `backend`, `frontend`, and `game`, each owned by the member responsible for that area.
  - For additional modules (for example, multi-language support and advanced search) and infrastructure work such as the Nginx integration, feature branches were created from the most up-to-date primary branch (backend or frontend). Once a module or integration was tested and validated it was merged into the relevant main branch.
  - Typical workflow: create a feature/module branch from the updated primary branch → implement and test the module → open a PR → validate and merge into the main branch.
- Tools:
  - GitHub for source control and pull requests.
  - GitHub Issues for task tracking and lightweight planning.
- Communication:
  - Discord for team communication and coordination.

**Technical Stack**
- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS 4 + DaisyUI 5, CSS Modules, Socket.IO client
- Backend: NestJS 10 (TypeScript), Passport + JWT, Socket.IO server, Prisma ORM 5, class-validator
- Database: MariaDB 11 (via Prisma) — chosen for relational data, ACID guarantees and school commonality
- Infrastructure: Docker Compose (4 services), nginx 1.27 as reverse proxy and TLS terminator
- Other: Sharp (avatar processing), multer (uploads), bcryptjs (password hashing), Nodemon (dev)
- Shared code: a third TypeScript package, `shared/`, imported directly from source by both the frontend and the backend. It holds the response DTOs, error codes and state-machine definitions, so the API contract is enforced by the compiler instead of by convention.
- Justifications:
  - **Next.js** for routing, the App Router's route groups (`(public)` / `(protected)`) and a `standalone` production build.
  - **NestJS** for a structured, modular backend: modules, services, guards and DTOs give a four-person team a shared vocabulary and clear boundaries.
  - **Prisma** for type-safe DB access, a single schema as source of truth, and parameterized queries — SQL injection is ruled out by construction.
  - **Socket.IO** for automatic reconnection and its rooms model, which maps directly onto our needs: one room per user, per conversation, per lobby and per game.
  - **nginx** so that the browser only ever talks to one origin over HTTPS, which removes CORS entirely and keeps the `SameSite=Lax` auth cookies working.

**Database Schema**
Implemented via `backend/prisma/schema.prisma` (Prisma + MySQL/MariaDB). Below is a precise summary of the models, fields and relationships, followed by a Mermaid ER diagram you can render locally or in GitHub.

Models and key fields
- `User` (SQL table `users` — the only model with an explicit `@@map`)
  - `id` Int PK, auto-increment
  - `username` String, unique, varchar(50)
  - `passwordHash` String, varchar(100)
  - `email` String, unique, varchar(100)
  - `avatarFilename` String?, unique, varchar(100)
  - `age` Int?
  - `createdAt` DateTime (SQL column `created_at`)
  - Relations: `refreshSessions[]`, `sentFriendRequests[]` (as requester), `receivedFriendRequests[]` (as addressee), `sentMessages[]`

- `RefreshSession` (SQL table `RefreshSession`)
  - `id` String PK (cuid)
  - `userId` Int FK -> `users.id` (onDelete: Cascade)
  - `refreshTokenHash` String — the refresh token is stored **hashed with bcrypt**, never in clear text
  - `expiresAt` DateTime, `createdAt` DateTime, `revokedAt` DateTime?

- `Friendship` (SQL table `Friendship`)
  - `id` Int PK, auto-increment
  - `requesterId` Int FK -> `users.id` (onDelete: Cascade)
  - `addresseeId` Int FK -> `users.id` (onDelete: Cascade)
  - `status` enum `FriendshipStatus` (PENDING | ACCEPTED | REJECTED | BLOCKED)
  - `createdAt` DateTime, `updatedAt` DateTime (auto-updated)
  - Unique constraint: (`requesterId`, `addresseeId`) — prevents duplicate requests at the database level
  - Relation: optional `conversation` (one-to-one)

- `Conversation` (SQL table `Conversation`)
  - `id` Int PK, auto-increment
  - `friendshipId` Int unique FK -> `Friendship.id` (onDelete: Cascade)
  - `createdAt` DateTime
  - Relation: `messages[]` (one-to-many)

- `Message` (SQL table `Message`)
  - `id` Int PK, auto-increment
  - `conversationId` Int FK -> `Conversation.id` (onDelete: Cascade)
  - `userId` Int FK -> `users.id` (sender, onDelete: Cascade)
  - `content` String varchar(150)
  - `sentAt` DateTime

Notes and behaviors
- Deletion cascades: all six foreign keys are `ON DELETE CASCADE`. Deleting a friendship removes its conversation and every message in it; deleting a user removes their sessions, friendships and messages. No orphan rows and no application-level cleanup code.
- Unique indexes: `users.username`, `users.email`, `users.avatarFilename`, `Conversation.friendshipId`, and the friendship pair (`requesterId`, `addresseeId`).
- `status` transitions are constrained by a state machine declared in `shared/src/friendship/friendship-transitions.ts` and enforced by `FriendshipPolicy`, so an invalid move (for example BLOCKED -> ACCEPTED) is rejected.
- `CleanupService` runs nightly and removes revoked and expired sessions, rejected friendships, messages older than 30 days, and messages beyond 30 per conversation.

Mermaid ER diagram (renderable)
```mermaid
erDiagram
    USERS {
        Int id PK
        String username
        String passwordHash
        String email
        String avatarFilename
        Int age
        DateTime created_at
    }
    REFRESHSESSION {
        String id PK
        Int userId FK
        String refreshTokenHash
        DateTime expiresAt
        DateTime createdAt
        DateTime revokedAt
    }
    FRIENDSHIP {
        Int id PK
        Int requesterId FK
        Int addresseeId FK
        String status
        DateTime createdAt
        DateTime updatedAt
    }
    CONVERSATION {
        Int id PK
        Int friendshipId FK
        DateTime createdAt
    }
    MESSAGE {
        Int id PK
        Int conversationId FK
        Int userId FK
        String content
        DateTime sentAt
    }

    USERS ||--o{ REFRESHSESSION : has
    USERS ||--o{ FRIENDSHIP : requester
    USERS ||--o{ FRIENDSHIP : addressee
    FRIENDSHIP ||--o| CONVERSATION : has
    CONVERSATION ||--o{ MESSAGE : contains
    USERS ||--o{ MESSAGE : sends
```

**Features List**
- **Authentication** — signup, login, logout, 15-minute access token with 30-day refresh token rotation and revocation, all carried in HttpOnly + Secure cookies. Passwords are hashed and salted with bcrypt (cost 10); the refresh token is itself stored hashed. — `backend/src/auth` — *van-nguy*
- **User profiles** — view and edit profile, change email (requires the current password), change age, avatar upload and removal. Avatars are re-encoded server-side to 256×256 WebP by Sharp, so an uploaded file is never served back as-is. — `backend/src/users`, `frontend/app/(protected)/dashboard/social/components/ProfileModal.tsx` — *van-nguy, anvacca*
- **Advanced user search** — free-text search on username, age-range filter, exclusion list, configurable sorting and pagination. — `backend/src/users` (`searchUsers`), `frontend/.../AddFriend.tsx` — *rbauer*
- **Friends** — send, accept, reject and remove friend requests, block a user, and see friends' online status live. — `backend/src/friends`, `backend/src/websocket/presence.service.ts` — *van-nguy, anvacca*
- **Private chat** — one conversation per accepted friendship, created automatically on acceptance; real-time delivery over WebSocket with persisted history and participant checks on every event. — `backend/src/chat`, `backend/src/websocket` — *van-nguy, anvacca*
- **Lobbies** — create and join lobbies, list joinable lobbies, eject players, add AI bots, and promote a new host when the current one leaves. — `backend/src/lobby` — *van-nguy, ttouahmia*
- **Game engine** — server-authoritative grid simulation on a 150 ms tick, with wall, trail and head-on collision resolution, a server-driven 3-2-1 countdown, and a ready-check so the round only starts once every human player has pressed Play. — `backend/src/game`, `frontend/app/(protected)/game` — *ttouahmia*
- **AI opponents** — two bot types (`random` and `smart`) that consume the same game state as human players. — `backend/src/game/ai` — *ttouahmia*
- **Multi-language interface** — English, French, Spanish and German, plus a pseudo-locale used to catch untranslated strings. — `frontend/app/lib/i18n` — *rbauer*
- **Privacy Policy and Terms of Service** — reachable from a footer present on every page, logged in or not. The content is specific to this project: it names the exact columns stored in `schema.prisma` and the two cookies set by the auth layer. — `frontend/app/(public)/privacy`, `frontend/app/(public)/terms` — *rbauer*
- **HTTPS everywhere** — nginx terminates TLS and is the only container publishing ports; HTTP is redirected to HTTPS and all traffic reaches a single canonical origin. — `.docker/nginx/default.conf`, `Makefile` (`certs`) — *rbauer*

**Modules**
Point system: Major = 2 points, Minor = 1 point.

The project implements the following modules (listed with their point values, justification, implementation summary, and primary contributor(s)). These entries follow the project requirements for Modules: list chosen modules, show point calculation, justify choice, describe how each was implemented, and indicate who worked on them.

- Use frameworks for both frontend and backend — 2 pts (Major)
  - Justification: Using modern frameworks ensures maintainability, routing, SSR/SSG capabilities on the frontend and a structured, modular architecture on the backend.
  - Implementation: Frontend built with Next.js (`frontend/`), backend built with NestJS (`backend/`).
  - Contributors: `anvacca` (frontend), `van-nguy` (backend).

- Real-time features using WebSockets — 2 pts (Major)
  - Justification: Real-time interactions are core to gameplay, lobbies and chat functionality.
  - Implementation: Socket.IO-based real-time communication between client and server. Three gateways (`ws-auth`, `private-chat`, `game`) share one authenticated connection; sockets are authenticated from the auth cookie at handshake time and joined to per-user, per-conversation, per-lobby and per-game rooms so broadcasts only reach the clients concerned. Connections and disconnections update a presence service that notifies the user's friends.
  - Contributors: `van-nguy`, `anvacca`, `ttouahmia`.

- Allow users to interact with other users — 2 pts (Major)
  - Justification: Social features (chat, profiles, friendship) are central to the product vision.
  - Implementation: REST endpoints and WebSocket events for chat and presence; avatar upload and profile management handled by upload endpoints and static serving.
  - Contributors: `van-nguy` (backend), `anvacca` (frontend).

- Use an ORM for the database — 1 pt (Minor)
  - Justification: Type-safe database access and schema management simplify development and reduce runtime errors.
  - Implementation: Prisma ORM is used with a MySQL/MariaDB datasource (`backend/prisma/schema.prisma`).
  - Contributors: `van-nguy`.

- Implement advanced search functionality with filters, sorting, and pagination — 1 pt (Minor)
  - Justification: The friends system is only useful if users can find each other. A plain "list every account" screen stops working as soon as the user base grows: filters narrow the set, sorting makes the result order predictable, and pagination bounds both the database result and the interface.
  - Implementation: A single endpoint, `GET /users/search`, backed by `SearchUsersDto` (`backend/src/users/dto/search-users.dto.ts`) and `UsersService.searchUsers()` (`backend/src/users/users.service.ts`). **Filters:** free-text match on the username, an `ageMin`/`ageMax` range whose bounds can be used independently, and `excludeIds` to hide the current user and existing friends server-side so the returned totals stay accurate. **Sorting:** `sortBy` (`username` | `createdAt`) and `order` (`asc` | `desc`), both constrained by `@IsIn` — this matters because `sortBy` becomes a column name, so the DTO is what keeps an arbitrary string out of the query. **Pagination:** a 1-based `page` and a `limit` capped at 50, converted to Prisma's `skip`/`take`; `findMany` and `count` are issued in parallel so the response carries `total` and `totalPages` for the pagination controls. Every parameter is validated by the global `ValidationPipe` before the controller runs, so malformed input returns a structured 400 rather than reaching the database. On the frontend, `AddFriend.tsx` debounces typing by 300 ms and resets to page 1 whenever a filter changes. `backend/src/scripts/seed-users.ts` (`make prod-users`) creates 20 demo accounts spread evenly across an age range so the filters, sorting and pagination are demonstrable on a fresh database.
  - Contributors: `rbauer`.

- Standard user management and authentication — 2 pts (Major)
  - Justification: Secure authentication, profile editing and session management are required for all other features.
  - Implementation: JWT-based authentication with refresh sessions, secure cookies and Passport strategies; user profile endpoints and avatar uploads implemented in the backend and wired to the frontend flows. Users can add each other as friends and see their online status in real time.
  - Contributors: `van-nguy`, `anvacca`.

- Introduce an AI Opponent for games — 2 pts (Major)
  - Justification: Adds single-player / bot-play options and evaluation scope for AI behavior in gameplay.
  - Implementation: Two controllers implementing a shared `AIController` interface in `backend/src/game/ai`. `RandomAI` picks uniformly among the moves that do not kill it immediately. `SmartAI` scores each candidate direction by how far it can travel before hitting something, weighted by a `Personality` (`straightBias`, `randomness`, `fearThreshold`) drawn at random when the bot is created — which is what makes its play imperfect and variable rather than optimal. Bots receive exactly the same `GameState` as human players and are queried once per tick, so they have no privileged information.
  - Contributors: `ttouahmia` (lead), `van-nguy` (integration).

- Implement a complete web-based game where users can play against each other — 2 pts (Major)
  - Justification: Core project deliverable — provide a playable game with clear rules and win/loss conditions.
  - Implementation: Server-side game engine and match flow in `backend/src/game`, client rendering and controls in `frontend/` components connected via WebSockets. Rules are explicit: the cycle advances on its own, leaves a permanent wall, dies on contact with a border or any wall, cannot reverse, and two cycles entering the same cell both die. The last player alive wins; a simultaneous crash is a draw. An in-game tutorial states these rules before the round begins.
  - Contributors: `ttouahmia`, `anvacca`, `van-nguy`.

- Remote players — Enable two players on separate computers to play the same game in real-time — 2 pts (Major)
  - Justification: Demonstrates robust networking, latency handling and reconnection logic for real-time multiplayer.
  - Implementation: WebSocket-based match sessions with server-authoritative state — clients send only a direction and render the state they receive, so no client can desynchronise the match. Socket.IO handles reconnection; a reconnecting player rejoins their game room on the next ready event, and a ready-check with a timeout prevents a player who left from blocking the lobby.
  - Contributors: `van-nguy`, `ttouahmia`.

- Multiplayer game (more than two players) — 2 pts (Major)
  - Justification: Extends the core game to larger matches and validates synchronization logic at scale.
  - Implementation: Lobbies hold up to four players. Spawn positions and starting directions are assigned per seat so every participant starts symmetrically, and the engine resolves all moves for a tick simultaneously — including head-on collisions between any pair of players — before broadcasting a single state to the whole game room.
  - Contributors: `ttouahmia`, `van-nguy`.

- Support for multiple languages (at least 3 languages) — 1 pt (Minor)
  - Justification: Multilingual support improves accessibility and UX for a broader audience.
  - Implementation: A hand-written i18n system in `frontend/app/lib/i18n`, with no external library. A React Context holds the active locale, persists it to `localStorage` and falls back to the browser language; a `useTranslation()` hook exposes `t("key", vars)` with dotted-path lookup and `{{placeholder}}` interpolation. Four complete dictionaries are provided (English, French, Spanish, German), each 180 keys. English is the source of truth: `type Dictionary = typeof en`, and the other files are checked with `satisfies Dictionary`, so a missing or extra key fails the build rather than shipping a half-translated interface. A fifth pseudo-locale is generated from English by prefixing every string with `X_`, which makes any hardcoded, untranslated text visible on screen during testing. The language switcher is present on every page. Form errors store a translation *key* rather than resolved text, so switching language also re-translates errors already displayed.
  - Contributors: `rbauer`.

Total points for implemented modules: 19 pts.

**Known Limitations**
- Game and lobby state is held in memory, so a backend restart ends any match in progress. This is a deliberate trade-off: it keeps the 150 ms tick loop simple and fast, at the cost of horizontal scalability.
- Validation error messages produced by the backend are returned in English and displayed as-is; only the frontend's own validation messages follow the language switcher. Translating them would require a per-field error code from the backend.
- Match history and player statistics are not implemented; the profile modal shows a placeholder for them. The corresponding module is therefore not claimed.
- The HTTPS certificate is self-signed, so browsers show a warning on first visit. This is expected for a local deployment.

**Individual Contributions**
- **van-nguy:**
  - *Contributions:* Implemented and led the backend development in NestJS: defined the core API surface and controllers, decomposed responsibilities into services and modules for maintainability, adapted endpoints to frontend needs, integrated WebSocket support for real-time features, and implemented a robust error-handling system (generic error objects and global exception filters) to ensure consistent API and WebSocket responses.
  - *Files / modules:* Primary author of backend controllers, services and Prisma integration (see `backend/src`).
  - *Challenges & solutions:* Designed centralized error-formatting and exception filters to normalize runtime and validation errors into a single client-facing format. Also traced a "Game not found" bug to `GameService` being provided by two modules and therefore instantiated twice; the fix was to have a single module provide and export it so all consumers share one instance.

- **anvacca:**
  - *Contributions:* Implemented the frontend using Next.js and designed the site UI/UX; integrated WebSocket client logic for real-time features.
  - *Files / modules:* Primary author of the frontend application (`frontend/`), components, styles, and socket client integration.
  - *Challenges & solutions:* Ensured real-time state synchronization with the backend and adapted frontend flows to the backend authentication and API semantics.

- **ttouahmia:**
  - *Contributions:* Sole designer and developer of the game implemented in NestJS; integrated the game engine into the backend, connecting it to the WebSocket gateways and lobby/matchmaking flows.
  - *Files / modules:* Primary author of `backend/src/game` and associated integration with `backend/src/websocket` and lobby services.
  - *Challenges & solutions:* Implemented deterministic game logic and synchronization mechanisms to keep server and clients consistent during real-time matches. Resolving a tick in three phases (compute moves, apply deaths, then move survivors) was necessary so that two cycles entering the same cell are both eliminated, instead of the outcome depending on iteration order.

- **rbauer:**
  - *Contributions:* Implemented the Nginx setup to isolate containers and handle HTTPS; added the site footer containing Privacy Policy and Terms of Service, and wrote both pages with content specific to this project; implemented the multi-language module; implemented the advanced user search (filters, sorting, pagination) end to end, including the `age` field it filters on and the seed script used to demonstrate it; contributed to several frontend parts.
  - *Files / modules:* Nginx configuration (`.docker/nginx/`) and cert helpers in the `Makefile`; `frontend/app/lib/i18n/`; `frontend/app/components/Footer.tsx` and the `privacy` / `terms` pages; `backend/src/users/dto/search-users.dto.ts`, `UsersService.searchUsers()` and `frontend/.../AddFriend.tsx`.
  - *Challenges & solutions:* A persistent redirect loop to `/login` turned out to be an origin problem: `localhost` and `127.0.0.1` are different origins to a browser and therefore have separate cookie jars, so the `SameSite=Lax` auth cookies were dropped on cross-origin calls. The fix was to leave `NEXT_PUBLIC_API_URL` empty so the frontend uses relative URLs, and to add an nginx server block redirecting `127.0.0.1` to the canonical origin — with the certificate repeated in that block, since TLS completes before nginx can read the `Host` header. On the search module, the design point was to keep every user-supplied value inside a validated DTO before it reaches the query builder, because `sortBy` is used as a column name.

---
