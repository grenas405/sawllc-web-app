import { assertEquals } from "@std/assert";
import { addRequest, listRequests, setHandled } from "./requests.ts";

const fields = {
  name: "Pedro G",
  phone: "(405) 555-0139",
  email: "",
  vehicleYear: 2019,
  vehicleMake: "Chevrolet",
  vehicleModel: "Silverado",
  service: "engine" as const,
  message: "Rough idle when cold",
};

Deno.test("requests list newest first", async () => {
  const kv = await Deno.openKv(":memory:");
  const first = await addRequest(kv, fields);
  await new Promise((resolve) => setTimeout(resolve, 5));
  const second = await addRequest(kv, { ...fields, vehicleModel: "Tahoe" });
  const list = await listRequests(kv);
  assertEquals(list.length, 2);
  assertEquals(list[0].id, second.id);
  assertEquals(list[1].id, first.id);
  assertEquals(list[0].handled, false);
  kv.close();
});

Deno.test("setHandled flips the flag and reports missing requests", async () => {
  const kv = await Deno.openKv(":memory:");
  const request = await addRequest(kv, fields);
  assertEquals(await setHandled(kv, request.ts, request.id, true), true);
  assertEquals((await listRequests(kv))[0].handled, true);
  assertEquals(await setHandled(kv, request.ts, request.id, false), true);
  assertEquals((await listRequests(kv))[0].handled, false);
  assertEquals(await setHandled(kv, 12345, crypto.randomUUID(), true), false);
  kv.close();
});
