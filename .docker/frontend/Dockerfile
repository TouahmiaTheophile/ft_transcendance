# ─── Base ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

WORKDIR /app

# ─── Frontend deps installer ──────────────────────────────────────────────────
FROM base AS frontend-deps

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

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
COPY --from=frontend-deps /app/frontend/node_modules /app/frontend/node_modules
COPY frontend/ /app/frontend/

WORKDIR /app/frontend

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "run", "dev"]

# ─── Builder (prod) ───────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app

COPY --from=shared-build /app/shared /app/shared
COPY --from=frontend-deps /app/frontend/node_modules /app/frontend/node_modules
COPY frontend/ /app/frontend/

WORKDIR /app/frontend

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Production ──────────────────────────────────────────────────────────────
FROM base AS production

WORKDIR /app/frontend

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public
COPY --from=shared-build /app/shared /app/shared

EXPOSE 3000

CMD ["node", "server.js"]
