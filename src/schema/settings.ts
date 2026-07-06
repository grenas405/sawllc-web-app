/**
 * schema/settings.ts — one job: validate admin input (login + settings).
 * Same pattern as schema/contact.ts: Zod is the source of truth and
 * errors come back as a flat, client-friendly list.
 */

import { z } from "zod";
import type { FieldError } from "./contact.ts";

export const SettingsSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+.-]{7,20}$/, "Enter a valid phone number"),
  email: z.email("Enter a valid email"),
  address: z.string().trim().min(5, "Address looks too short").max(160),
  hours: z.string().trim().min(3, "Hours look too short").max(120),
  badges: z
    .array(z.string().trim().min(2, "Brand names need 2+ characters").max(40))
    .min(1, "Keep at least one brand")
    .max(24, "24 brands max"),
});

export const LoginSchema = z.object({
  password: z.string().min(1, "Enter the password").max(256),
});

export type SettingsInput = z.infer<typeof SettingsSchema>;

export type SettingsParse =
  | { ok: true; data: SettingsInput }
  | { ok: false; errors: FieldError[] };

export function parseSettings(input: unknown): SettingsParse {
  const result = SettingsSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    errors: result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };
}

export function parsePassword(input: unknown): string | null {
  const result = LoginSchema.safeParse(input);
  return result.success ? result.data.password : null;
}
