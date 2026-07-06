/**
 * handlers/pages.ts — one job: serve HTML pages.
 */

import type { Handler } from "../router.ts";
import { loadSettings } from "../settings.ts";
import { renderHome } from "../views/home.ts";

export function createHomePage(kv: Deno.Kv): Handler {
  return async () =>
    new Response(renderHome(await loadSettings(kv)), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
}

export const notFound: Handler = () =>
  new Response("404 — nothing here.\n", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
