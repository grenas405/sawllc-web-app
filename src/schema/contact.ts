/**
 * schema/contact.ts — one job: define and validate the shape of an
 * estimate/contact request. Zod is the single source of truth; the
 * TypeScript type is inferred from it, never written by hand.
 */

import { z } from "zod";

const currentYear = new Date().getFullYear();

export const ServiceKind = z.enum([
  "engine",
  "transmission",
  "suspension",
  "electrical",
  "performance",
  "other",
]);

export const ContactRequestSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+.-]{7,20}$/, "Enter a valid phone number"),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  vehicleYear: z.coerce
    .number()
    .int()
    .min(1960, "Year looks too old")
    .max(currentYear + 1, "Year looks too new"),
  vehicleMake: z.string().trim().min(2, "What make is the vehicle?").max(60),
  vehicleModel: z.string().trim().min(1, "What model is the vehicle?").max(60),
  service: ServiceKind,
  message: z.string().trim().max(2000, "Keep it under 2000 characters").default(""),
  // Honeypot: humans never fill this in; bots do. Accept anything so the
  // handler can silently drop tripped submissions instead of tipping off bots.
  company: z.string().optional(),
});

export type ContactRequest = z.infer<typeof ContactRequestSchema>;

export interface FieldError {
  readonly field: string;
  readonly message: string;
}

export type ParseResult =
  | { ok: true; data: ContactRequest }
  | { ok: false; errors: FieldError[] };

/** Validate unknown input; return data or a flat, client-friendly error list. */
export function parseContactRequest(input: unknown): ParseResult {
  const result = ContactRequestSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const errors = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return { ok: false, errors };
}
