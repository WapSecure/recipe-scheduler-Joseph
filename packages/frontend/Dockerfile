# packages/frontend/Dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Install Expo CLI globally
RUN npm install -g expo-cli

# Copy package files first
COPY package*.json ./
COPY yarn.lock* ./

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
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env ./

EXPOSE 3000
CMD ["npm", "start"]