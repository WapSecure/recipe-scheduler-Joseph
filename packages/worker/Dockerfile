# packages/worker/Dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm i

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

# Health check (custom for worker)
HEALTHCHECK --interval=1m --timeout=3s \
  CMD ps aux | grep [n]ode || exit 1

CMD ["node", "dist/index.js"]