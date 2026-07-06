/**
 * config.ts — one job: read runtime configuration from the environment.
 * Every value has an explicit default so the app runs with zero setup.
 */

export interface Config {
  readonly hostname: string;
  readonly port: number;
  readonly dataDir: string;
  readonly staticDir: string;
}

export function loadConfig(env: (key: string) => string | undefined = Deno.env.get): Config {
  return {
    hostname: env("HOST") ?? "0.0.0.0",
    port: Number(env("PORT") ?? 8000),
    dataDir: env("DATA_DIR") ?? "data",
    staticDir: env("STATIC_DIR") ?? "static",
  };
}
