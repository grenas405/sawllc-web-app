/**
 * handlers/contact.ts — one job: accept an estimate request.
 * Parse → validate (zod) → store in KV (feeds the admin inbox) and
 * append one JSON line to an audit log: greppable, tailable, diffable.
 */

import type { Handler } from "../router.ts";
import { parseContactRequest } from "../schema/contact.ts";
import { addRequest } from "../requests.ts";

async function readBody(req: Request): Promise<unknown> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) return await req.json();
  const form = await req.formData();
  return Object.fromEntries(form.entries());
}

async function appendRequest(dataDir: string, record: Record<string, unknown>): Promise<void> {
  await Deno.mkdir(dataDir, { recursive: true });
  const line = JSON.stringify(record) + "\n";
  await Deno.writeTextFile(`${dataDir}/estimate-requests.jsonl`, line, { append: true });
}

export function createContactHandler(kv: Deno.Kv, dataDir: string): Handler {
  return async (req) => {
    let input: unknown;
    try {
      input = await readBody(req);
    } catch {
      return Response.json({
        ok: false,
        errors: [{ field: "", message: "Malformed request body" }],
      }, {
        status: 400,
      });
    }

    const result = parseContactRequest(input);
    if (!result.ok) {
      return Response.json({ ok: false, errors: result.errors }, { status: 422 });
    }

    // Honeypot tripped: pretend success, store nothing.
    if (result.data.company !== "" && result.data.company !== undefined) {
      return Response.json({ ok: true, id: crypto.randomUUID() });
    }

    const { company: _hp, ...data } = result.data;
    const request = await addRequest(kv, data);
    await appendRequest(dataDir, { id: request.id, receivedAt: request.receivedAt, ...data });
    return Response.json({ ok: true, id: request.id }, { status: 201 });
  };
}
