import { defineConfig } from '@hey-api/openapi-ts';

/**
 * Generates a typed client + TanStack Query options from the backend's OpenAPI
 * schema. Regenerate with `npm run codegen` (see the root Makefile `codegen`
 * target, which exports server/openapi.json first).
 */
export default defineConfig({
  input: '../server/openapi.json',
  output: {
    path: 'src/client',
    postProcess: ['prettier'],
  },
  plugins: [
    {
      name: '@hey-api/client-fetch',
      // Base URL is set at runtime in src/api.ts; leave it unset here.
      runtimeConfigPath: './src/api',
    },
    '@hey-api/schemas',
    '@tanstack/react-query',
  ],
});
