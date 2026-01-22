// Note: mapKey, googleAuthClientId, and webSocketUrl are now fetched dynamically
// from the backend via ConfigService. The values below serve as fallbacks only.
// See: frontend/src/app/shared/services/config/config.service.ts

export const environment = {
  production: true,
  api: {
    server: 'http://localhost:8000/',
    mapKey: '',
    googleAuthClientId: '',
    webSocketUrl: '',
  },
  map: {
    tiles: {
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
