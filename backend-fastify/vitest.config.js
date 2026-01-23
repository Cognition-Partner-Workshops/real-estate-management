import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/controllers/users/**/*.js',
        'src/controllers/auth/**/*.js',
        'src/utils/users.js',
      ],
      exclude: [
        'node_modules',
        'src/**/*.test.js',
      ],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
