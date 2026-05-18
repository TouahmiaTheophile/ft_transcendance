FROM node:22-slim

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm install

COPY . .

# Build Next.js for production
RUN npm run build

# Expose frontend port
EXPOSE 3000

CMD ["npm", "run", "start"]
