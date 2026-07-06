/**
 * handlers/pages.ts — one job: serve HTML pages.
 */

import type { Handler } from "../router.ts";
import { renderHome } from "../views/home.ts";

export const homePage: Handler = () =>
  new Response(renderHome(), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });

export const notFound: Handler = () =>
  new Response("404 — nothing here.\n", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
