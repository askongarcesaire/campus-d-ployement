# CampusHub Africa — Production Dockerfile
# Node.js 22 Multi-stage build

FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy application sources
COPY . .

# Build frontend and compile app
RUN npm run build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package and install production dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy built frontend assets and server sources
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
