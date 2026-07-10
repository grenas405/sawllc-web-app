/**
 * handlers/pages.ts — one job: serve HTML pages.
 */

import type { Handler } from "../router.ts";
import { loadSettings } from "../settings.ts";
import { renderHome } from "../views/home.ts";

export function createHomePage(kv: Deno.Kv, siteUrl: string): Handler {
  return async () =>
    new Response(renderHome(await loadSettings(kv), siteUrl), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
}

export function createRobots(siteUrl: string): Handler {
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
  return () => new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

export function createSitemap(siteUrl: string): Handler {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  return () =>
    new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
}

export const notFound: Handler = () =>
  new Response("404 — nothing here.\n", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
