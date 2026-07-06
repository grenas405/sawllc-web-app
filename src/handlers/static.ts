/**
 * handlers/static.ts — one job: serve files under /static/ from disk.
 * Delegates to @std/http's battle-tested file server.
 */

import { serveDir } from "@std/http";
import type { Handler } from "../router.ts";

export function createStaticHandler(staticDir: string): Handler {
  return (req) =>
    serveDir(req, {
      fsRoot: staticDir,
      urlRoot: "static",
      quiet: true,
      headers: ["cache-control: public, max-age=3600"],
    });
}
