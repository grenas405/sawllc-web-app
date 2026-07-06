import { assertEquals } from "@std/assert";
import { createRouter, route } from "./router.ts";

const handler = createRouter(
  [
    route("GET", "/", () => new Response("home")),
    route("GET", "/things/:id", (_req, params) => new Response(`thing ${params.id}`)),
    route("POST", "/api/contact", () => new Response("posted", { status: 201 })),
  ],
  () => new Response("nope", { status: 404 }),
);

Deno.test("matches an exact path", async () => {
  const res = await handler(new Request("http://x/"), {});
  assertEquals(await res.text(), "home");
});

Deno.test("extracts path params", async () => {
  const res = await handler(new Request("http://x/things/42"), {});
  assertEquals(await res.text(), "thing 42");
});

Deno.test("distinguishes methods on the same path", async () => {
  const res = await handler(new Request("http://x/api/contact", { method: "POST" }), {});
  assertEquals(res.status, 201);
});

Deno.test("falls through to the fallback", async () => {
  const res = await handler(new Request("http://x/missing"), {});
  assertEquals(res.status, 404);
});

Deno.test("serves HEAD from a GET route", async () => {
  const res = await handler(new Request("http://x/", { method: "HEAD" }), {});
  assertEquals(res.status, 200);
});
