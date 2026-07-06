/**
 * setup-admin-password.ts — one job: set the admin password in Deno KV.
 *
 * Interactive:      deno task setup-password
 * Non-interactive:  SCF_ADMIN_PASSWORD=... deno task setup-password
 * On the VPS:       sudo -u sysadmin KV_PATH=/var/lib/denogenesis/site.kv \
 *                     deno task setup-password
 */

import { promptSecret } from "@std/cli/prompt-secret";
import { loadConfig } from "../src/config.ts";
import { createCredential, getCredential, setCredential } from "../src/auth.ts";
import { openKv } from "../src/server.ts";

const MIN_LENGTH = 12;

function fail(message: string): never {
  console.error(`error: ${message}`);
  Deno.exit(1);
}

function readPassword(): string {
  const fromEnv = Deno.env.get("SCF_ADMIN_PASSWORD");
  if (fromEnv !== undefined) {
    console.log("Using password from SCF_ADMIN_PASSWORD.");
    return fromEnv;
  }

  const first = promptSecret(`New admin password (${MIN_LENGTH}+ chars): `);
  if (first === null) fail("No input — run from an interactive terminal or set SCF_ADMIN_PASSWORD");
  const second = promptSecret("Repeat it: ");
  if (first !== second) fail("Passwords do not match");
  return first;
}

if (import.meta.main) {
  const config = loadConfig();
  const kv = await openKv(config);

  const existing = await getCredential(kv);
  if (existing !== null) {
    console.log("An admin password is already set — it will be replaced.");
  }

  const password = readPassword();
  if (password.length < MIN_LENGTH) fail(`Password must be at least ${MIN_LENGTH} characters`);

  await setCredential(kv, await createCredential(password));
  kv.close();
  console.log(`Admin password ${existing ? "replaced" : "set"}. Sign in at /admin/login.`);
}
