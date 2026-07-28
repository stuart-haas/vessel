import { defineConfig } from '@hey-api/openapi-ts';

/**
 * Generates a typed client + TanStack Query options from the backend's OpenAPI
 * schema. Regenerate with `npm run codegen`. Refresh the schema first from
 * server/ with `uv run python scripts/export_openapi.py openapi.json`.
 */
export default defineConfig({
  input: '../server/openapi.json',
  output: {
    path: 'src/api/client',
    postProcess: ['prettier'],
  },
  plugins: [
    {
      name: '@hey-api/client-fetch',
      // Base URL is set at runtime in src/api/config.ts; leave it unset here.
      runtimeConfigPath: './src/api/config',
    },
    '@hey-api/schemas',
    '@tanstack/react-query',
  ],
});
