*This project has been created as part of the 42 curriculum by van-nguy, ttouahmia, anvacca, rbauer.*

# ft_transcendence

**Description**
- **Project name:** ft_transcendence
- **Overview:** A full-stack real-time web application built for the 42 curriculum. The project implements user authentication, private messaging, friend management, game lobbies and a real-time multiplayer game using WebSockets.
- **Goal:** Deliver a playable, networked game with social features (friends, private chat, lobbies) and a secure backend.
- **Key features:** Authentication (JWT + refresh), user profiles and avatars, friend requests, private conversations, lobby management, real-time game engine and AI opponents, file uploads for avatars, REST + WebSocket APIs.

**Instructions**
- **Prerequisites:**
  - Node.js (recommended v18+)
  - npm or yarn
  - Docker & Docker Compose (recommended for an easy local setup)
  - Git
- **Environment:**
  - A project-level `.env` file is expected at the repository root (there is a provided `.env.example`). Do NOT create it under `backend/` — Docker Compose and the backend service load envs from the repository root `.env`.
  - Required entries (minimum):
    - `DATABASE_URL` — Prisma connection string (example: `mysql://user:pass@mariadb:3306/appdb`).
    - Alternatively, the project also uses `DB_USER`, `DB_PASSWORD`, `DB_NAME` (internal validation checks these at startup).
    - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — secrets for JWT signing.
    - `BACKEND_PORT` — optional (defaults to `3000`).
    - `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL` — frontend public URLs (can be left empty for relative URLs).
    - Other helpful vars: `COMPOSE_PROJECT_NAME`, `DB_ROOT_PASSWORD`, `DB_PORT`.
- **Install and run (development)**
 - **Install and run (recommended via Makefile)**
   - This repository includes a `Makefile` with convenient targets. Preferred quick flow (from project root):
     ```bash
     # first-time setup (copies .env.example and creates certs)
     make init

     # create local HTTPS certs for nginx (if needed)
     make certs

     # start all services in development (hot reload)
     make dev

     # detached: make dev-d
     # start production stack (build static files + HTTPS): make prod
     ```
   - To sync the Prisma schema to the database (this project uses `prisma db push` rather than migrations):
     ```bash
     # run inside the dev backend container (Makefile helper):
     make db-push
     ```
   - The `Makefile` also exposes `db-studio`, `db-seed`, and other helpers — run `make help` to see available targets.

  - Note: most contributors use the `Makefile`/Docker flow because it guarantees the correct service hostnames (e.g., `mariadb` in `DATABASE_URL`).

 - **Notes:**
   - The backend's `validateEnvironment()` requires `DB_USER`, `DB_PASSWORD` and `DB_NAME` to be present and contain only valid characters when startup bypasses container entry scripts; ensure these keys are set in `.env`.
   - Default ports: frontend `3001`, backend `3000` (override with `.env`).

**Resources**
- NestJS: https://nestjs.com
- Next.js: https://nextjs.org
- Prisma: https://www.prisma.io
- Socket.IO: https://socket.io
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
  - For additional modules (for example, multi-language support) and infrastructure work such as the Nginx integration, feature branches were created from the most up-to-date primary branch (backend or frontend). `rbauer` joined the project later (while the core work was mostly done) and primarily implemented additional modules and infrastructure; once a module or integration was tested and validated it was merged into the relevant main branch.
  - Typical workflow: create a feature/module branch from the updated primary branch → implement and test the module → open a PR → validate and merge into the main branch.
- Tools:
  - GitHub for source control and pull requests.
  - GitHub Issues for task tracking and lightweight planning.
- Communication:
  - Discord for team communication and coordination.

**Technical Stack**
- Frontend: Next.js, React 19, Tailwind/DaisyUI, Socket.IO client
- Backend: NestJS (TypeScript), Passport + JWT, Socket.IO server, Prisma ORM
- Database: MySQL / MariaDB (via Prisma) — chosen for relational data, ACID guarantees and school commonality
- Other: Sharp (image processing), multer (uploads), Jest (tests), Nodemon (dev)
- Justifications: Next.js for fast SSR/SSG and routes; NestJS for structured modular backend; Prisma for type-safe DB access and quick migrations.

**Database Schema**
Implemented via `backend/prisma/schema.prisma` (Prisma + MySQL). Below is a precise summary of the models, fields and relationships, followed by a Mermaid ER diagram you can render locally or in GitHub.

Models and key fields
- `User` (`users` table)
  - `id` Int PK, auto-increment
  - `username` String, unique, varchar(50)
  - `passwordHash` String, varchar(100)
  - `email` String, unique, varchar(100)
  - `avatarFilename` String?, unique, varchar(100)
  - `age` Int?
  - `createdAt` DateTime
  - Relations: `refreshSessions[]`, `sentFriendRequests[]` (as requester), `receivedFriendRequests[]` (as addressee), `sentMessages[]`

- `RefreshSession` (`refresh_sessions`-style)
  - `id` String PK (cuid)
  - `userId` Int FK -> `User.id` (onDelete: Cascade)
  - `refreshTokenHash` String
  - `expiresAt` DateTime, `createdAt` DateTime, `revokedAt` DateTime?

- `Friendship` (`friendships`)
  - `id` Int PK, auto-increment
  - `requesterId` Int FK -> `User.id`
  - `addresseeId` Int FK -> `User.id`
  - `status` enum `FriendshipStatus` (PENDING | ACCEPTED | REJECTED | BLOCKED)
  - `createdAt` DateTime, `updatedAt` DateTime (auto-updated)
  - Unique constraint: (`requesterId`, `addresseeId`)
  - Relation: optional `conversation` (one-to-one)

- `Conversation` (`conversations`)
  - `id` Int PK, auto-increment
  - `friendshipId` Int unique FK -> `Friendship.id` (onDelete: Cascade)
  - `createdAt` DateTime
  - Relation: `messages[]` (one-to-many)

- `Message` (`messages`)
  - `id` Int PK, auto-increment
  - `conversationId` Int FK -> `Conversation.id` (onDelete: Cascade)
  - `userId` Int FK -> `User.id` (sender, onDelete: Cascade)
  - `content` String varchar(150)
  - `sentAt` DateTime

Notes and behaviors
- Deletion cascades: friendships → conversation → messages; deleting a user cascades related friendships/messages/sessions where specified.
- Unique indexes: `username`, `email`, `avatarFilename`, and friendship pair (`requesterId`, `addresseeId`).

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
        DateTime createdAt
    }
    REFRESHSESSIONS {
        String id PK
        Int userId FK
        String refreshTokenHash
        DateTime expiresAt
        DateTime createdAt
        DateTime revokedAt
    }
    FRIENDSHIPS {
        Int id PK
        Int requesterId FK
        Int addresseeId FK
        String status
        DateTime createdAt
        DateTime updatedAt
    }
    CONVERSATIONS {
        Int id PK
        Int friendshipId FK
        DateTime createdAt
    }
    MESSAGES {
        Int id PK
        Int conversationId FK
        Int userId FK
        String content
        DateTime sentAt
    }

    USERS ||--o{ REFRESHSESSIONS : has
    USERS ||--o{ FRIENDSHIPS : requester
    USERS ||--o{ FRIENDSHIPS : addressee
    FRIENDSHIPS ||--|| CONVERSATIONS : has
    CONVERSATIONS ||--o{ MESSAGES : contains
    USERS ||--o{ MESSAGES : sends
```

**Features List**
- Authentication: login, refresh tokens, secure cookies — (backend: `src/auth`)
- Friends: send/accept/reject/block requests — (backend: `src/friends`)
- Private Chat: create conversations and exchange messages — (backend: `src/chat`, `src/websocket`)
- Lobbies & Matchmaking: create/join lobbies, invite bots — (backend: `src/lobby`)
- Game Engine: real-time multiplayer game logic + AI opponents — (backend: `src/game`)
- Uploads: avatar upload and serving via static assets

 

**Modules**
Point system: Major = 2 points, Minor = 1 point.

The project implements the following modules (listed with their point values, justification, implementation summary, and primary contributor(s)). These entries follow the project requirements for Modules: list chosen modules, show point calculation, justify choice, describe how each was implemented, and indicate who worked on them.

- Use frameworks for both frontend and backend — 2 pts (Major)
  - Justification: Using modern frameworks ensures maintainability, routing, SSR/SSG capabilities on the frontend and a structured, modular architecture on the backend.
  - Implementation: Frontend built with Next.js (`frontend/`), backend built with NestJS (`backend/`).
  - Contributors: `anvacca` (frontend), `van-nguy` (backend).

- real-time features using WebSockets — 2 pts (Major)
  - Justification: Real-time interactions are core to gameplay, lobbies and chat functionality.
  - Implementation: Socket.IO-based real-time communication between client and server (see `frontend/` socket client and `backend/` WebSocket gateways).
  - Contributors: `van-nguy`, `anvacca`, `ttouahmia`.

- Allow users to interact with others users — 2 pts (Major)
  - Justification: Social features (chat, profiles, friendship) are central to the product vision.
  - Implementation: REST endpoints and WebSocket events for chat and presence; avatar upload and profile management handled by upload endpoints and static serving.
  - Contributors: `van-nguy` (backend), `anvacca` (frontend).

- Use an ORM for the database — 1 pt (Minor)
  - Justification: Type-safe database access and schema management simplify development and reduce runtime errors.
  - Implementation: Prisma ORM is used with a MySQL/MariaDB datasource (`backend/prisma/schema.prisma`).
  - Contributors: `van-nguy`.

- Standard user management and authentication — 2 pts (Major)
  - Justification: Secure authentication, profile editing and session management are required for all other features.
  - Implementation: JWT-based authentication with refresh sessions, secure cookies and Passport strategies; user profile endpoints and avatar uploads implemented in the backend and wired to the frontend flows.
  - Contributors: `van-nguy`, `anvacca`.

- Introduce an AI Opponent for games — 2 pts (Major)
  - Justification: Adds single-player / bot-play options and evaluation scope for AI behavior in gameplay.
  - Implementation: Game AI implemented in the game service (server-side logic inside `backend/src/game`), designed to simulate non-perfect human-like play and configurable difficulty.
  - Contributors: `ttouahmia` (lead), `van-nguy` (integration).

- Implement a complete web-based game where users can play against each other — 2 pts (Major)
  - Justification: Core project deliverable — provide a playable game with clear rules and win/loss conditions.
  - Implementation: Server-side game engine and match flow in `backend/src/game`, client rendering and controls in `frontend/` components connected via WebSockets.
  - Contributors: `ttouahmia`, `anvacca`, `van-nguy`.

- Remote players — Enable two players on separate computers to play the same game in real-time — 2 pts (Major)
  - Justification: Demonstrates robust networking, latency handling and reconnection logic for real-time multiplayer.
  - Implementation: WebSocket-based match sessions, reconnection handling, and networked game state synchronization in the backend game engine and frontend client.
  - Contributors: `van-nguy`, `ttouahmia`.

- Multiplayer game (more than two players) — 2 pts (Major)
  - Justification: Extends the core game to larger matches and validates synchronization logic at scale.
  - Implementation: Server match management, multi-client synchronization and fairness mechanisms in the game service and WebSocket layers.
  - Contributors: `ttouahmia`, `van-nguy`.

- Support for 2 additional browsers — 1 pt (Minor)
  - Justification: The chosen frameworks and frontend architecture already provide broad browser compatibility; no project-specific changes were required.
  - Implementation: No bespoke cross-browser polyfills or workarounds were necessary; components and styles are responsive and tested across common browsers.
  - Contributors: implicit (frameworks + frontend implementation).

- Support for multiple languages (at least 3 languages) — 1 pt (Minor)
  - Justification: Multilingual support improves accessibility and UX for a broader audience.
  - Implementation: i18n integration in the frontend with language selection; language resources and toggles included in the UI footer and site configuration.
  - Contributors: `rbauer`.

Total points for implemented modules: 19 pts.

**Individual Contributions**
- **van-nguy:**
  - *Contributions:* Implemented and led the backend development in NestJS: defined the core API surface and controllers, decomposed responsibilities into services and modules for maintainability, adapted endpoints to frontend needs, integrated WebSocket support for real-time features, and implemented a robust error-handling system (generic error objects and global exception filters) to ensure consistent API and WebSocket responses.
  - *Files / modules:* Primary author of backend controllers, services and Prisma integration (see `backend/src`).
  - *Challenges & solutions:* Designed centralized error-formatting and exception filters to normalize runtime and validation errors into a single client-facing format.

- **anvacca:**
  - *Contributions:* Implemented the frontend using Next.js and designed the site UI/UX; integrated WebSocket client logic for real-time features.
  - *Files / modules:* Primary author of the frontend application (`frontend/`), components, styles, and socket client integration.
  - *Challenges & solutions:* Ensured real-time state synchronization with the backend and adapted frontend flows to the backend authentication and API semantics.

- **ttouahmia:**
  - *Contributions:* Sole designer and developer of the game implemented in NestJS; integrated the game engine into the backend, connecting it to the WebSocket gateways and lobby/matchmaking flows.
  - *Files / modules:* Primary author of `backend/src/game` and associated integration with `backend/src/websocket` and lobby services.
  - *Challenges & solutions:* Implemented deterministic game logic and synchronization mechanisms to keep server and clients consistent during real-time matches.

- **rbauer:**
  - *Contributions:* Implemented the Nginx setup to isolate containers and handle HTTPS; added site footer containing Privacy Policy and Terms of Service for easy access; implemented a language module to switch site language; contributed to several frontend parts.
  - *Files / modules:* Primary author of Nginx configuration (`.docker/nginx/`), cert helpers and frontend footer/i18n components.
  - *Challenges & solutions:* Ensured correct HTTPS certificates and reverse-proxy configuration, integrated multi-language support and ensured policies are publicly accessible in the UI footer.

---

