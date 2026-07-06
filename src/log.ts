/**
 * log.ts — one job: write one structured line per request to stdout.
 * Text stream in, text stream out; pipe it wherever you like.
 */

export function logRequest(req: Request, res: Response, startedAt: number): void {
  const ms = (performance.now() - startedAt).toFixed(1);
  const path = new URL(req.url).pathname;
  console.log(`${new Date().toISOString()} ${req.method} ${path} ${res.status} ${ms}ms`);
}
