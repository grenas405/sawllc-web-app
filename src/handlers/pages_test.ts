import { assertEquals, assertStringIncludes } from "@std/assert";
import { createRobots, createSitemap } from "./pages.ts";
import { splitAddress } from "../settings.ts";

const SITE = "https://www.denogenesis.com";

Deno.test("robots.txt blocks /admin and points at the sitemap", async () => {
  const res = await createRobots(SITE)(new Request(`${SITE}/robots.txt`), {});
  const body = await res.text();
  assertStringIncludes(body, "Disallow: /admin");
  assertStringIncludes(body, `Sitemap: ${SITE}/sitemap.xml`);
});

Deno.test("sitemap.xml lists the homepage", async () => {
  const res = await createSitemap(SITE)(new Request(`${SITE}/sitemap.xml`), {});
  assertEquals(res.headers.get("content-type"), "application/xml; charset=utf-8");
  assertStringIncludes(await res.text(), `<loc>${SITE}/</loc>`);
});

Deno.test("splitAddress parses street, city, and region", () => {
  assertEquals(splitAddress("123 Placeholder Ave, Oklahoma City, OK 73100"), {
    street: "123 Placeholder Ave",
    locality: "Oklahoma City",
    region: "OK 73100",
  });
  assertEquals(splitAddress("just a street"), {
    street: "just a street",
    locality: "",
    region: "",
  });
});
