# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/bot/package*.json ./packages/bot/

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY packages/bot ./packages/bot
COPY tsconfig.json ./
COPY turbo.json ./

# Build application
WORKDIR /app/packages/bot
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY packages/bot/package*.json ./packages/bot/
RUN npm ci --production --ignore-scripts

# Copy built application
COPY --from=builder /app/packages/bot/dist ./packages/bot/dist

WORKDIR /app/packages/bot

# Health check (bot doesn't have HTTP, so we check if process is running)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD pgrep -f "node dist/main.js" || exit 1

# Start bot
CMD ["node", "dist/main.js"]
