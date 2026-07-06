/**
 * router.ts — one job: match a Request to a handler.
 * An explicit route table, walked top to bottom. No magic, no middleware
 * stack — composition happens in server.ts where you can read it.
 */

export type Params = Record<string, string | undefined>;
export type Handler = (req: Request, params: Params) => Response | Promise<Response>;

export interface Route {
  readonly method: string;
  readonly pattern: URLPattern;
  readonly handler: Handler;
}

/** Declare one route. `pathname` uses URLPattern syntax, e.g. "/api/:id". */
export function route(method: string, pathname: string, handler: Handler): Route {
  return { method: method.toUpperCase(), pattern: new URLPattern({ pathname }), handler };
}

/** Fold a route table into a single request handler. */
export function createRouter(routes: readonly Route[], fallback: Handler): Handler {
  return (req, _params) => {
    for (const r of routes) {
      if (r.method !== req.method && !(r.method === "GET" && req.method === "HEAD")) continue;
      const match = r.pattern.exec(req.url);
      if (match) return r.handler(req, match.pathname.groups);
    }
    return fallback(req, {});
  };
}
