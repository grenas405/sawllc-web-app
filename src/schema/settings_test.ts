import { assertEquals } from "@std/assert";
import { parsePassword, parseSettings } from "./settings.ts";

const valid = {
  phone: "(405) 555-0139",
  email: "shop@example.com",
  address: "123 Placeholder Ave, Oklahoma City, OK 73100",
  hours: "Mon–Fri 8am–5pm",
  badges: ["Chevrolet", "Honda"],
};

Deno.test("accepts valid settings", () => {
  const result = parseSettings(valid);
  assertEquals(result.ok, true);
});

Deno.test("rejects a bad email with a field-scoped error", () => {
  const result = parseSettings({ ...valid, email: "not-an-email" });
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.errors.some((e) => e.field === "email"), true);
});

Deno.test("rejects an empty brand list", () => {
  const result = parseSettings({ ...valid, badges: [] });
  assertEquals(result.ok, false);
});

Deno.test("rejects a one-character brand", () => {
  const result = parseSettings({ ...valid, badges: ["X"] });
  assertEquals(result.ok, false);
});

Deno.test("parsePassword returns the password or null", () => {
  assertEquals(parsePassword({ password: "hunter2222" }), "hunter2222");
  assertEquals(parsePassword({ password: "" }), null);
  assertEquals(parsePassword({}), null);
});
