// Cloud Run environment configuration
// This file is used for GCP Cloud Run deployments
// Environment variables are injected at build time via Docker build args

export const environment = {
  production: true,
  api: {
    // These values are replaced at build time by the Dockerfile
    // The Cloud Build pipeline injects the actual Cloud Run service URLs
    server: 'BACKEND_URL_PLACEHOLDER',
    mapKey: 'MAP_API_KEY_PLACEHOLDER',
    googleAuthClientId: 'GOOGLE_CLIENT_ID_PLACEHOLDER',
    webSocketUrl: 'WEBSOCKET_URL_PLACEHOLDER',
  },
  map: {
    tiles: {
      // Using OpenStreetMap tiles (free, no API key required)
      default: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      dark: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    },
  },
  features: {
    restrictedMode: false,
    restrictedHeading: 'Restricted',
    restrictedMessage: 'This feature is currently disabled in this mode.',
  },
};
