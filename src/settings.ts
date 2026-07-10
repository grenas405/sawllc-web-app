/**
 * settings.ts — one job: the admin-editable site settings, in Deno KV.
 * Defaults come from data/shop.ts; whatever the admin saves overrides
 * them. The public site always renders from loadSettings().
 */

import { platforms, shop } from "./data/shop.ts";

const SETTINGS_KEY = ["site", "settings"];

export interface SiteSettings {
  readonly phone: string;
  readonly email: string;
  readonly address: string;
  readonly hours: string;
  readonly badges: readonly string[];
}

export function defaultSettings(): SiteSettings {
  return {
    phone: shop.phone,
    email: shop.email,
    address: shop.address,
    hours: shop.hours,
    badges: platforms.badges,
  };
}

export async function loadSettings(kv: Deno.Kv): Promise<SiteSettings> {
  const entry = await kv.get<Partial<SiteSettings>>(SETTINGS_KEY);
  return { ...defaultSettings(), ...entry.value };
}

export async function saveSettings(kv: Deno.Kv, settings: SiteSettings): Promise<void> {
  await kv.set(SETTINGS_KEY, settings);
}

/** "(405) 555-0139" → "tel:+14055550139" */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `tel:+1${digits}` : `tel:+${digits}`;
}

export interface AddressParts {
  readonly street: string;
  readonly locality: string;
  readonly region: string;
}

/** Best-effort split of a one-line address ("street, city, ST zip") into
 * schema.org PostalAddress parts. Unparseable input lands in `street`. */
export function splitAddress(address: string): AddressParts {
  const parts = address.split(",").map((p) => p.trim());
  return {
    street: parts[0] ?? address,
    locality: parts[1] ?? "",
    region: parts.slice(2).join(", "),
  };
}
