/**
 * server.ts — one job: compose the pieces into a running HTTP server.
 * The whole request pipeline is visible in this one file:
 * route table → security headers → access log.
 */

import type { Config } from "./config.ts";
import { createRouter, route } from "./router.ts";
import { logRequest } from "./log.ts";
import { createHomePage, notFound } from "./handlers/pages.ts";
import { health } from "./handlers/health.ts";
import { createContactHandler } from "./handlers/contact.ts";
import { createStaticHandler } from "./handlers/static.ts";
import { createAdminHandlers } from "./handlers/admin.ts";

function withSecurityHeaders(res: Response): Response {
  const headers = new Headers(res.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export async function openKv(config: Config): Promise<Deno.Kv> {
  const parent = config.kvPath.includes("/")
    ? config.kvPath.slice(0, config.kvPath.lastIndexOf("/"))
    : ".";
  await Deno.mkdir(parent, { recursive: true });
  return await Deno.openKv(config.kvPath);
}

export function createHandler(config: Config, kv: Deno.Kv): (req: Request) => Promise<Response> {
  const admin = createAdminHandlers(kv);
  const router = createRouter(
    [
      route("GET", "/", createHomePage(kv)),
      route("GET", "/healthz", health),
      route("POST", "/api/contact", createContactHandler(config.dataDir)),
      route("GET", "/admin", admin.dashboardPage),
      route("GET", "/admin/login", admin.loginPage),
      route("POST", "/api/admin/login", admin.login),
      route("POST", "/api/admin/logout", admin.logout),
      route("GET", "/api/admin/settings", admin.getSettings),
      route("PUT", "/api/admin/settings", admin.putSettings),
      route("GET", "/static/*", createStaticHandler(config.staticDir)),
    ],
    notFound,
  );

  return async (req) => {
    const startedAt = performance.now();
    let res: Response;
    try {
      res = withSecurityHeaders(await router(req, {}));
    } catch (err) {
      console.error("unhandled error:", err);
      res = new Response("500 — internal error\n", { status: 500 });
    }
    logRequest(req, res, startedAt);
    return res;
  };
}

export async function startServer(config: Config): Promise<Deno.HttpServer> {
  const kv = await openKv(config);
  return Deno.serve(
    { hostname: config.hostname, port: config.port },
    createHandler(config, kv),
  );
}
