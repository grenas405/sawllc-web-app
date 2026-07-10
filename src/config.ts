/**
 * config.ts — one job: read runtime configuration from the environment.
 * Every value has an explicit default so the app runs with zero setup.
 */

export interface Config {
  readonly hostname: string;
  readonly port: number;
  readonly dataDir: string;
  readonly staticDir: string;
  readonly kvPath: string;
  readonly siteUrl: string;
}

export function loadConfig(env: (key: string) => string | undefined = Deno.env.get): Config {
  const dataDir = env("DATA_DIR") ?? "data";
  return {
    hostname: env("HOST") ?? "0.0.0.0",
    port: Number(env("PORT") ?? 8000),
    dataDir,
    staticDir: env("STATIC_DIR") ?? "static",
    kvPath: env("KV_PATH") ?? `${dataDir}/site.kv`,
    siteUrl: (env("SITE_URL") ?? "https://www.denogenesis.com").replace(/\/+$/, ""),
  };
}
