# Environment Variables Documentation

This document describes all environment variables used by the Real Estate Management application, including which are required, their sources, and default values.

## Backend Environment Variables

The backend Fastify application uses the following environment variables:

### Required Variables

| Variable | Description | Source | Example |
|----------|-------------|--------|---------|
| `DB_CONNECT` | MongoDB connection string | Secret Manager | `mongodb+srv://user:pass@cluster.mongodb.net/rem-db` |
| `SECRET_KEY` | JWT signing secret for authentication | Secret Manager | `your-secure-jwt-secret` |

### Optional Variables

| Variable | Description | Source | Default |
|----------|-------------|--------|---------|
| `PORT` | Server listening port | Direct config | `5000` (local), `8080` (Cloud Run) |
| `NODE_ENV` | Environment mode | Direct config | `development` |
| `LOGGER` | Enable Fastify logging | Direct config | `true` |
| `SALT` | Bcrypt salt rounds | Direct config | `12` |
| `GOOGLE_AUTH_CLIENT_ID` | Google OAuth client ID for social login | Secret Manager | (empty) |
| `USER_ACTIVITIES_MAX` | Maximum activities stored per user | Direct config | `20` |
| `USER_NOTIFICATIONS_MAX` | Maximum notifications per user | Direct config | `20` |

### Local Development (.env file)

Create a `.env` file in `backend-fastify/` with the following content:

```env
PORT=8000
LOGGER=true
SALT=12
SECRET_KEY=your-local-dev-secret
DB_CONNECT=mongodb://localhost:27017/rem-db
GOOGLE_AUTH_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Cloud Run Configuration

In Cloud Run, environment variables are configured as follows:

**Direct Environment Variables:**
- `PORT=8080` (Cloud Run requirement)
- `NODE_ENV=production`

**From Secret Manager:**
- `DB_CONNECT` from `real-estate-db-connect`
- `SECRET_KEY` from `real-estate-jwt-secret`
- `GOOGLE_AUTH_CLIENT_ID` from `real-estate-google-client-id`

## Frontend Environment Variables

The Angular frontend uses environment files that are replaced at build time. These are not runtime environment variables but compile-time configuration.

### Environment Configuration Structure

```typescript
export const environment = {
  production: boolean,
  api: {
    server: string,      // Backend API URL
    mapKey: string,      // Map tiles API key
    googleAuthClientId: string,  // Google OAuth client ID
    webSocketUrl: string,  // WebSocket connection URL
  },
  map: {
    tiles: {
      default: string,   // Light theme map tiles URL
      dark: string,      // Dark theme map tiles URL
    },
  },
  features: {
    restrictedMode: boolean,
    restrictedHeading: string,
    restrictedMessage: string,
  },
};
```

### Development Configuration

File: `frontend/src/environments/environment.ts`

| Property | Description | Default Value |
|----------|-------------|---------------|
| `production` | Production mode flag | `false` |
| `api.server` | Backend API URL | `http://localhost:8000/` |
| `api.mapKey` | Map API key | (empty) |
| `api.googleAuthClientId` | Google OAuth client ID | (empty) |
| `api.webSocketUrl` | WebSocket URL | `ws://localhost:8000/websocket` |
| `map.tiles.default` | Light theme tiles | Stadia Maps URL |
| `map.tiles.dark` | Dark theme tiles | Stadia Maps dark URL |

### Production Configuration

File: `frontend/src/environments/environment.prod.ts`

In Cloud Run deployments, this file is generated during the Docker build with values from build arguments:

| Build Argument | Maps To | Source |
|----------------|---------|--------|
| `BACKEND_URL` | `api.server` | Auto-detected from backend Cloud Run service |
| `WEBSOCKET_URL` | `api.webSocketUrl` | Derived from backend URL (https → wss) |
| `MAP_API_KEY` | `api.mapKey` | Secret Manager: `real-estate-map-api-key` |
| `GOOGLE_CLIENT_ID` | `api.googleAuthClientId` | Secret Manager: `real-estate-google-client-id` |

## Variable Categories

### Secrets (Sensitive Data)

These variables contain sensitive information and must be stored in Secret Manager:

1. **`DB_CONNECT`** - Contains database credentials
2. **`SECRET_KEY`** - JWT signing key, must be kept secret
3. **`GOOGLE_AUTH_CLIENT_ID`** - OAuth credentials
4. **`MAP_API_KEY`** - Third-party API key

### Configuration (Non-Sensitive)

These variables are configuration settings that can be set directly:

1. **`PORT`** - Network configuration
2. **`NODE_ENV`** - Runtime mode
3. **`LOGGER`** - Logging preference
4. **`SALT`** - Bcrypt configuration (not a secret, just a number)

## Environment-Specific Values

### Local Development

```
Backend:
  PORT=8000
  DB_CONNECT=mongodb://localhost:27017/rem-db
  SECRET_KEY=local-dev-secret
  NODE_ENV=development

Frontend:
  api.server=http://localhost:8000/
  api.webSocketUrl=ws://localhost:8000/websocket
```

### Cloud Run (Production)

```
Backend:
  PORT=8080
  DB_CONNECT=(from Secret Manager)
  SECRET_KEY=(from Secret Manager)
  NODE_ENV=production

Frontend:
  api.server=https://real-estate-backend-xxxxx.run.app/
  api.webSocketUrl=wss://real-estate-backend-xxxxx.run.app/websocket
```

## WebSocket Configuration

The backend supports WebSocket connections for real-time notifications. Important considerations:

1. **Cloud Run WebSocket Support**: Cloud Run supports WebSocket connections with session affinity enabled
2. **URL Protocol**: Use `wss://` for HTTPS backends, `ws://` for HTTP
3. **Path**: The WebSocket endpoint is at `/websocket`

## Troubleshooting

### Backend won't start

1. Check that `DB_CONNECT` is set and valid
2. Verify MongoDB is accessible from the deployment environment
3. Check logs for connection errors

### Frontend can't connect to backend

1. Verify `api.server` URL is correct and accessible
2. Check CORS configuration on the backend
3. Ensure the protocol matches (http/https)

### WebSocket connection fails

1. Verify `api.webSocketUrl` uses the correct protocol (ws/wss)
2. Check that session affinity is enabled on Cloud Run
3. Verify the `/websocket` path is correct

### Google Auth not working

1. Verify `GOOGLE_AUTH_CLIENT_ID` is set on both frontend and backend
2. Check that authorized origins include your deployment URLs
3. Verify the OAuth consent screen is configured
