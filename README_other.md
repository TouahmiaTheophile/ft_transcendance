# My App

Stack: **MariaDB** · **NestJS** (backend) · **Next.js** (frontend) · **Prisma** · **Docker**

---

## Arborescence

```
.
├── .docker/
│   ├── backend/Dockerfile       # Multi-stage: development / production
│   └── frontend/Dockerfile      # Multi-stage: development / production
├── backend/
│   ├── prisma/schema.prisma     # Schéma Prisma → modifie ici pour changer la DB
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── prisma/              # PrismaService global injectable
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/app/                 # Next.js App Router
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
├── shared/
│   ├── src/
│   │   ├── index.ts             # Point d'entrée — exporte tout
│   │   ├── types.ts             # Types partagés backend + frontend
│   │   └── utils.ts             # Fonctions utilitaires partagées
│   ├── tsconfig.json
│   └── package.json
├── docker-compose.yml           # Services de base (prod)
├── docker-compose.override.yml  # Surcharge dev (hot reload, volumes, ports)
├── Makefile                     # Toutes les commandes du projet
├── .env.example                 # Template des variables d'environnement
└── .gitignore
```

---

## Installation

### 1. Pré-requis

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (inclut Docker Compose)
- `make` (natif sur Linux/macOS, sur Windows utiliser WSL2 ou Git Bash)

### 2. Initialisation

```bash
# Cloner / placer les sources puis :
make init          # Copie .env.example → .env
# Éditer .env selon ton environnement
```

### 3. Lancer en mode développement

```bash
make dev           # Build + démarrage avec hot reload (logs en direct)
make dev-d         # Même chose en arrière-plan (detached)
```

Le workflow automatique :
1. **MariaDB** démarre et attend le healthcheck
2. **Backend** démarre → `prisma generate` → `prisma db push` → `nest start --watch`
3. **Frontend** démarre indépendamment → `next dev`

### 4. Lancer en mode production

```bash
make prod          # Build optimisé + démarrage en arrière-plan
```

---

## Commandes Make

| Commande | Description |
|---|---|
| `make dev` | Démarrer en dev avec logs |
| `make dev-d` | Démarrer en dev en arrière-plan |
| `make stop` | Arrêter les services dev |
| `make logs s=backend` | Suivre les logs d'un service |
| `make shell s=backend` | Ouvrir un shell dans un container |
| `make fresh` | Repartir de zéro (supprime les volumes) |
| `make prod` | Démarrer en production |
| `make db-push` | Forcer un prisma db push |
| `make db-studio` | Ouvrir Prisma Studio |
| `make deps-add-back p="@nestjs/jwt"` | Ajouter une dépendance backend |
| `make deps-add-front p="axios"` | Ajouter une dépendance frontend |
| `make deps-add-shared p="zod"` | Ajouter une dépendance shared |
| `make ps` | État des containers |
| `make nuke` | ⚠️ Tout supprimer (containers + volumes + images) |

---

## Dépendances

Les dépendances sont gérées via les `package.json` de chaque package.
Pour en ajouter depuis l'hôte (sans entrer dans le container) :

```bash
make deps-add-back  p="@nestjs/config"        # dépendance backend
make deps-add-front p="@tanstack/react-query"  # dépendance frontend
make deps-add-shared p="zod"                   # dépendance partagée
```

Puis rebuild pour que le container prenne en compte les nouvelles dépendances :

```bash
make build && make dev-d
# ou en une commande :
make fresh
```

---

## Hot reload

En mode `dev`, les trois dossiers sont montés en volume :

| Dossier | Technologie de reload |
|---|---|
| `backend/` | `nest start --watch` (ts-node + chokidar) |
| `frontend/` | `next dev` + webpack polling |
| `shared/` | Importé directement en TypeScript source |

> **Note** : `shared` est importé depuis ses sources TypeScript directement (pas compilé),
> ce qui permet le hot reload instantané dans les deux services.

---

## Variables d'environnement

Toutes les variables sont dans `.env` (ignoré par git). Voir `.env.example` pour la liste complète.

La variable `DATABASE_URL` utilise le nom du service Docker (`mariadb`) comme hostname —
elle ne fonctionne qu'à l'intérieur des containers.
