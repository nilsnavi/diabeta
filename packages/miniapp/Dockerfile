# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/miniapp/package*.json ./packages/miniapp/

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code and config
COPY packages/miniapp ./packages/miniapp
COPY tsconfig.json ./
COPY turbo.json ./

# Build static files
WORKDIR /app/packages/miniapp
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY packages/miniapp/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/packages/miniapp/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
