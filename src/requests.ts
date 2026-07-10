/**
 * requests.ts — one job: estimate requests in Deno KV.
 * Keyed ["estimate", timestamp, id] so KV's key order is time order;
 * the newest work is always at the end, listed in reverse.
 */

import type { ContactRequest } from "./schema/contact.ts";

const PREFIX = ["estimate"];
const LIST_LIMIT = 100;

export type RequestFields = Omit<ContactRequest, "company">;

export interface EstimateRequest extends RequestFields {
  readonly id: string;
  readonly ts: number;
  readonly receivedAt: string;
  readonly handled: boolean;
}

export async function addRequest(kv: Deno.Kv, fields: RequestFields): Promise<EstimateRequest> {
  const ts = Date.now();
  const request: EstimateRequest = {
    ...fields,
    id: crypto.randomUUID(),
    ts,
    receivedAt: new Date(ts).toISOString(),
    handled: false,
  };
  await kv.set([...PREFIX, ts, request.id], request);
  return request;
}

/** Newest first. */
export async function listRequests(
  kv: Deno.Kv,
  limit = LIST_LIMIT,
): Promise<EstimateRequest[]> {
  const requests: EstimateRequest[] = [];
  for await (
    const entry of kv.list<EstimateRequest>({ prefix: PREFIX }, { reverse: true, limit })
  ) {
    requests.push(entry.value);
  }
  return requests;
}

/** Returns false when the request doesn't exist. */
export async function setHandled(
  kv: Deno.Kv,
  ts: number,
  id: string,
  handled: boolean,
): Promise<boolean> {
  const key = [...PREFIX, ts, id];
  const entry = await kv.get<EstimateRequest>(key);
  if (entry.value === null) return false;
  await kv.set(key, { ...entry.value, handled });
  return true;
}
