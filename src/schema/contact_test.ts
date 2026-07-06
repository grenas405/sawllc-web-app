import { assertEquals } from "@std/assert";
import { parseContactRequest } from "./contact.ts";

const valid = {
  name: "Pedro G",
  phone: "(405) 555-0139",
  email: "pedro@example.com",
  vehicleYear: "2019",
  vehicleMake: "Chevrolet",
  vehicleModel: "Silverado",
  service: "engine",
  message: "Rough idle when cold.",
  company: "",
};

Deno.test("accepts a valid estimate request and coerces the year", () => {
  const result = parseContactRequest(valid);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.data.vehicleYear, 2019);
    assertEquals(result.data.service, "engine");
  }
});

Deno.test("accepts an empty optional email", () => {
  const result = parseContactRequest({ ...valid, email: "" });
  assertEquals(result.ok, true);
});

Deno.test("rejects a missing phone with a field-scoped error", () => {
  const result = parseContactRequest({ ...valid, phone: "" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.errors.some((e) => e.field === "phone"), true);
  }
});

Deno.test("rejects an unknown service kind", () => {
  const result = parseContactRequest({ ...valid, service: "detailing" });
  assertEquals(result.ok, false);
});

Deno.test("rejects an implausible vehicle year", () => {
  const result = parseContactRequest({ ...valid, vehicleYear: "1899" });
  assertEquals(result.ok, false);
});
