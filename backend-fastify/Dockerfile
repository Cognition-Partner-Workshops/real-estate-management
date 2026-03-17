# ============================================================================
# Real Estate Management - Backend Fastify (Azure Container Apps)
# Multi-stage Docker build optimized for Azure Container Apps deployment
# ============================================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fastify -u 1001

# Copy application files
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

# Create uploads directory (local dev fallback)
RUN mkdir -p uploads && chown -R fastify:nodejs uploads

# Switch to non-root user
USER fastify

# Expose port
EXPOSE 8080

# Set environment defaults
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application (Azure Container Apps)
CMD ["node", "src/index.js"]
