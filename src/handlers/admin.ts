/**
 * handlers/admin.ts — one job: the admin surface.
 * Login/logout, the dashboard page, and the settings API. Everything
 * here checks the session cookie; nothing else in the app does auth.
 */

import { getCookies, setCookie } from "@std/http";
import type { Handler } from "../router.ts";
import { getCredential, verifyPassword } from "../auth.ts";
import { createSession, destroySession, hasSession } from "../sessions.ts";
import { loadSettings, saveSettings } from "../settings.ts";
import { parsePassword, parseSettings } from "../schema/settings.ts";
import { renderDashboard, renderLoginPage } from "../views/admin.ts";

const COOKIE = "scf_admin";
const THROTTLE_LIMIT = 5;
const THROTTLE_WINDOW_MS = 15 * 60 * 1000;

function html(body: string): Response {
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function redirect(to: string): Response {
  return new Response(null, { status: 303, headers: { location: to } });
}

function clientIp(req: Request): string {
  return req.headers.get("x-real-ip") ?? "local";
}

function isSecure(req: Request): boolean {
  return req.headers.get("x-forwarded-proto") === "https";
}

export function createAdminHandlers(kv: Deno.Kv): Record<string, Handler> {
  async function isAuthed(req: Request): Promise<boolean> {
    const token = getCookies(req.headers)[COOKIE];
    return token ? await hasSession(kv, token) : false;
  }

  /** Returns remaining-attempts, or null when locked out. */
  async function throttle(ip: string): Promise<number | null> {
    const key = ["throttle", ip];
    const entry = await kv.get<number>(key);
    const fails = entry.value ?? 0;
    if (fails >= THROTTLE_LIMIT) return null;
    return THROTTLE_LIMIT - fails;
  }

  async function recordFailure(ip: string): Promise<void> {
    const key = ["throttle", ip];
    const entry = await kv.get<number>(key);
    await kv.set(key, (entry.value ?? 0) + 1, { expireIn: THROTTLE_WINDOW_MS });
  }

  const loginPage: Handler = async (req) =>
    (await isAuthed(req)) ? redirect("/admin") : html(renderLoginPage());

  const dashboardPage: Handler = async (req) =>
    (await isAuthed(req))
      ? html(renderDashboard(await loadSettings(kv)))
      : redirect("/admin/login");

  const login: Handler = async (req) => {
    const ip = clientIp(req);
    if ((await throttle(ip)) === null) {
      return Response.json(
        {
          ok: false,
          errors: [{ field: "password", message: "Too many attempts — wait 15 minutes" }],
        },
        { status: 429 },
      );
    }

    let input: unknown;
    try {
      input = await req.json();
    } catch {
      return Response.json({ ok: false, errors: [{ field: "", message: "Malformed body" }] }, {
        status: 400,
      });
    }

    const password = parsePassword(input);
    const credential = await getCredential(kv);
    if (credential === null) {
      return Response.json(
        {
          ok: false,
          errors: [{
            field: "password",
            message: "No admin password set — run `deno task setup-password` on the server",
          }],
        },
        { status: 503 },
      );
    }

    if (password === null || !(await verifyPassword(password, credential))) {
      await recordFailure(ip);
      return Response.json(
        { ok: false, errors: [{ field: "password", message: "Wrong password" }] },
        { status: 401 },
      );
    }

    const token = await createSession(kv);
    const headers = new Headers({ "content-type": "application/json" });
    setCookie(headers, {
      name: COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "Strict",
      secure: isSecure(req),
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return new Response(JSON.stringify({ ok: true }), { headers });
  };

  const logout: Handler = async (req) => {
    const token = getCookies(req.headers)[COOKIE];
    if (token) await destroySession(kv, token);
    const headers = new Headers({ "content-type": "application/json" });
    setCookie(headers, {
      name: COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "Strict",
      secure: isSecure(req),
      path: "/",
      maxAge: 0,
    });
    return new Response(JSON.stringify({ ok: true }), { headers });
  };

  const getSettings: Handler = async (req) => {
    if (!(await isAuthed(req))) return Response.json({ ok: false }, { status: 401 });
    return Response.json({ ok: true, settings: await loadSettings(kv) });
  };

  const putSettings: Handler = async (req) => {
    if (!(await isAuthed(req))) return Response.json({ ok: false }, { status: 401 });

    let input: unknown;
    try {
      input = await req.json();
    } catch {
      return Response.json({ ok: false, errors: [{ field: "", message: "Malformed body" }] }, {
        status: 400,
      });
    }

    const result = parseSettings(input);
    if (!result.ok) {
      return Response.json({ ok: false, errors: result.errors }, { status: 422 });
    }
    await saveSettings(kv, result.data);
    return Response.json({ ok: true, settings: result.data });
  };

  return { loginPage, dashboardPage, login, logout, getSettings, putSettings };
}
