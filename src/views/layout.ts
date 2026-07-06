/**
 * views/layout.ts — one job: wrap page content in the HTML document shell.
 */

import { escape } from "@std/html";

export { escape };

export interface Page {
  readonly title: string;
  readonly description: string;
  readonly body: string;
}

export function layout(page: Page): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(page.title)}</title>
  <meta name="description" content="${escape(page.description)}">
  <meta name="theme-color" content="#101114">
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/static/styles.css">
</head>
<body>
${page.body}
<script src="/static/app.js" defer></script>
</body>
</html>`;
}
