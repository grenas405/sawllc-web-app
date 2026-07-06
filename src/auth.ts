/**
 * auth.ts — one job: create and verify the admin password credential.
 * PBKDF2-SHA256 via Web Crypto; the credential lives at one Deno KV key.
 */

const ITERATIONS = 210_000;
const KEY_BYTES = 32;
const CREDENTIAL_KEY = ["admin", "credential"];

export interface Credential {
  readonly algorithm: "PBKDF2-SHA256";
  readonly iterations: number;
  readonly salt: string; // hex
  readonly hash: string; // hex
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    KEY_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function createCredential(password: string): Promise<Credential> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return {
    algorithm: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    salt: toHex(salt),
    hash: toHex(hash),
  };
}

export async function verifyPassword(password: string, credential: Credential): Promise<boolean> {
  const expected = fromHex(credential.hash);
  const actual = await derive(password, fromHex(credential.salt), credential.iterations);
  // Constant-time comparison.
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export async function getCredential(kv: Deno.Kv): Promise<Credential | null> {
  const entry = await kv.get<Credential>(CREDENTIAL_KEY);
  return entry.value;
}

export async function setCredential(kv: Deno.Kv, credential: Credential): Promise<void> {
  await kv.set(CREDENTIAL_KEY, credential);
}
