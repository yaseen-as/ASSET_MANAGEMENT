# Production Dockerfile for Auth Service
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Generate Prisma client with correct binary target for Alpine
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --silent

# Install Prisma CLI for generating client
RUN npm install prisma --save-dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client for production with correct binary target
RUN npx prisma generate --schema=./prisma/schema.prisma

# Create logs directory
RUN mkdir -p logs

# Install curl for health checks
RUN apk add --no-cache curl openssl libc6-compat

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
# CMD prisma migrate deploy --schema=./prisma/schema.prisma && npm start
CMD ["sh", "-c", "prisma migrate deploy --schema=./prisma/schema.prisma && npm start"]