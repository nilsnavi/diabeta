# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY packages/backend ./packages/backend
COPY tsconfig.json ./
COPY turbo.json ./

# Generate Prisma client
WORKDIR /app/packages/backend
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
RUN npm ci --production --ignore-scripts

# Copy built application
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/node_modules/.prisma ./packages/backend/node_modules/.prisma
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma

# Create uploads directory
RUN mkdir -p /app/uploads

WORKDIR /app/packages/backend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
