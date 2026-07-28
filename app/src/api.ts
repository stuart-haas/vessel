import type { CreateClientConfig } from './client/client.gen';

/**
 * Runtime configuration for the generated hey-api client.
 *
 * `@hey-api/openapi-ts` is pointed at this file via `runtimeConfigPath`, so the
 * generated client picks up this base URL. It comes from EXPO_PUBLIC_API_URL
 * (see .env.example); the default is correct for web and the iOS simulator.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: API_URL,
});
