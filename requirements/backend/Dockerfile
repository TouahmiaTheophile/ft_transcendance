FROM node:22-slim

# Requirement for prisma: OpenSSL
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm install

# Source code
COPY . .

# IMPORTANT : Prisma client generation (schema-based)
# Optionnal, done by prisma-init.sh
# RUN npx prisma generate

# Expose backend port
EXPOSE 3000