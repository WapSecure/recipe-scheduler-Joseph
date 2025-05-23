# packages/backend/Dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies including devDependencies
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

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

EXPOSE 3000
CMD ["node", "dist/index.js"]