# FROM node:22-slim

# # Requirement for prisma: OpenSSL
# RUN apt-get update -y && apt-get install -y openssl

# WORKDIR /app

# # Dependencies
# COPY package*.json ./
# RUN npm install

# # Source code
# COPY . .

# # IMPORTANT : Prisma client generation (schema-based)
# # Optionnal, done by prisma-init.sh
# # RUN npx prisma generate

# # Expose backend port
# EXPOSE 3000



FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# pnpm via corepack (IMPORTANT)
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# copier workspace
COPY package.json pnpm-workspace.yaml ./
COPY requirements ./requirements

RUN pnpm install
RUN pnpm --filter @project/shared build

WORKDIR /app/requirements/backend

CMD ["sh", "./prisma-init.sh"]