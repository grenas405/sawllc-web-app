/**
 * sessions.ts — one job: admin login sessions in Deno KV.
 * Tokens are 256-bit random hex; KV's expireIn handles the TTL, so
 * sessions survive restarts and expire without any cleanup code.
 */

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // one working day in the shop

function sessionKey(token: string): Deno.KvKey {
  return ["session", token];
}

export async function createSession(kv: Deno.Kv): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  await kv.set(sessionKey(token), { createdAt: Date.now() }, { expireIn: SESSION_TTL_MS });
  return token;
}

export async function hasSession(kv: Deno.Kv, token: string): Promise<boolean> {
  if (!/^[0-9a-f]{64}$/.test(token)) return false;
  const entry = await kv.get(sessionKey(token));
  return entry.value !== null;
}

export async function destroySession(kv: Deno.Kv, token: string): Promise<void> {
  await kv.delete(sessionKey(token));
}
