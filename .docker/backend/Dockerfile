# ─── Base ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

WORKDIR /app
RUN apk add --no-cache openssl

# ─── Backend deps installer ───────────────────────────────────────────────────
FROM base AS backend-deps

WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --include=dev

# ─── Shared builder ───────────────────────────────────────────────────────────
FROM base AS shared-build

WORKDIR /app/shared
COPY shared/package.json shared/package-lock.json* ./
RUN npm install
COPY shared/ ./
RUN npm run build 2>/dev/null || true

# ─── Development ─────────────────────────────────────────────────────────────
FROM base AS development

WORKDIR /app

COPY --from=shared-build /app/shared /app/shared
COPY --from=backend-deps /app/backend/node_modules /app/backend/node_modules
COPY backend/ /app/backend/

WORKDIR /app/backend

ENV NODE_ENV=development

# nodemon + ts-node : exécute TypeScript directement, pas de dist/ impliqué
CMD sh -c "npx prisma generate && npx prisma db push --accept-data-loss && npm run start:dev"

# ─── Builder (prod) ───────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app
COPY --from=shared-build /app/shared /app/shared
COPY --from=backend-deps /app/backend/node_modules /app/backend/node_modules
COPY backend/ /app/backend/

WORKDIR /app/backend
RUN npx prisma generate && npm run build

# ─── Production ──────────────────────────────────────────────────────────────
FROM base AS production

WORKDIR /app/backend

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=shared-build /app/shared /app/shared

ENV NODE_ENV=production

# Les imports @shared/* pointent hors de backend/, donc tsc remonte le rootDir
# au parent commun : la sortie est dist/backend/src/, pas dist/.
CMD sh -c "npx prisma db push --accept-data-loss && node dist/backend/src/main"
