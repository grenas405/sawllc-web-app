/**
 * handlers/health.ts — one job: answer "is the process alive?"
 */

import type { Handler } from "../router.ts";

export const health: Handler = () =>
  Response.json({ ok: true, service: "scf-autoworks-web", time: new Date().toISOString() });
