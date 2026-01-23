# Frontend Dockerfile for Real Estate Management Application
# Multi-stage build: Node.js for building Angular app, Nginx for serving

# Build arguments for environment configuration
ARG BACKEND_URL=http://localhost:8000/
ARG WEBSOCKET_URL=ws://localhost:8000/websocket
ARG MAP_API_KEY=
ARG GOOGLE_CLIENT_ID=

# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

# Re-declare build args for this stage
ARG BACKEND_URL
ARG WEBSOCKET_URL
ARG MAP_API_KEY
ARG GOOGLE_CLIENT_ID

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate environment.prod.ts with build-time variables
RUN echo "export const environment = {" > src/environments/environment.prod.ts && \
    echo "  production: true," >> src/environments/environment.prod.ts && \
    echo "  api: {" >> src/environments/environment.prod.ts && \
    echo "    server: '${BACKEND_URL}'," >> src/environments/environment.prod.ts && \
    echo "    mapKey: '${MAP_API_KEY}'," >> src/environments/environment.prod.ts && \
    echo "    googleAuthClientId: '${GOOGLE_CLIENT_ID}'," >> src/environments/environment.prod.ts && \
    echo "    webSocketUrl: '${WEBSOCKET_URL}'," >> src/environments/environment.prod.ts && \
    echo "  }," >> src/environments/environment.prod.ts && \
    echo "  map: {" >> src/environments/environment.prod.ts && \
    echo "    tiles: {" >> src/environments/environment.prod.ts && \
    echo "      default: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'," >> src/environments/environment.prod.ts && \
    echo "      dark: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'," >> src/environments/environment.prod.ts && \
    echo "    }," >> src/environments/environment.prod.ts && \
    echo "  }," >> src/environments/environment.prod.ts && \
    echo "  features: {" >> src/environments/environment.prod.ts && \
    echo "    restrictedMode: false," >> src/environments/environment.prod.ts && \
    echo "    restrictedHeading: 'Restricted'," >> src/environments/environment.prod.ts && \
    echo "    restrictedMessage: 'This feature is currently disabled in this mode.'," >> src/environments/environment.prod.ts && \
    echo "  }," >> src/environments/environment.prod.ts && \
    echo "};" >> src/environments/environment.prod.ts

# Build Tailwind CSS
RUN npm run tailwind:build

# Build the Angular application for production
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001 -G nginx-app

# Copy built Angular app from builder stage
COPY --from=builder /app/www /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx-app:nginx-app /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Cloud Run expects port 8080
EXPOSE 8080

# Switch to non-root user
USER nginx-app

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
