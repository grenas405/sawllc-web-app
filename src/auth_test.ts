import { assertEquals } from "@std/assert";
import { createCredential, getCredential, setCredential, verifyPassword } from "./auth.ts";
import { createSession, destroySession, hasSession } from "./sessions.ts";
import { defaultSettings, loadSettings, saveSettings } from "./settings.ts";

Deno.test("password verifies against its own credential and rejects others", async () => {
  const credential = await createCredential("torque-spec-4055");
  assertEquals(await verifyPassword("torque-spec-4055", credential), true);
  assertEquals(await verifyPassword("wrong-password", credential), false);
});

Deno.test("credential round-trips through KV", async () => {
  const kv = await Deno.openKv(":memory:");
  assertEquals(await getCredential(kv), null);
  const credential = await createCredential("torque-spec-4055");
  await setCredential(kv, credential);
  assertEquals(await getCredential(kv), credential);
  kv.close();
});

Deno.test("sessions are created, found, and destroyed", async () => {
  const kv = await Deno.openKv(":memory:");
  const token = await createSession(kv);
  assertEquals(await hasSession(kv, token), true);
  assertEquals(await hasSession(kv, "not-a-token"), false);
  await destroySession(kv, token);
  assertEquals(await hasSession(kv, token), false);
  kv.close();
});

Deno.test("settings fall back to defaults and persist overrides", async () => {
  const kv = await Deno.openKv(":memory:");
  assertEquals(await loadSettings(kv), defaultSettings());
  const changed = { ...defaultSettings(), phone: "(405) 111-2222", badges: ["Chevrolet"] };
  await saveSettings(kv, changed);
  assertEquals(await loadSettings(kv), changed);
  kv.close();
});
