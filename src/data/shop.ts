/**
 * data/shop.ts — one job: hold every fact about the shop in one place.
 * Change a phone number or add a service here; nothing else needs to move.
 *
 * NOTE: phone, address, and hours are PLACEHOLDERS — replace with the real
 * values before going live. Oklahoma LLC filings live with the Oklahoma
 * Secretary of State (sos.ok.gov → Business Entity Search); public listings
 * show SCF AUTOWORKS LLC registered in Tuttle, OK (OKC metro).
 */

export const shop = {
  name: "SCF AutoWorks LLC",
  tagline: "Built right. Backed by certification.",
  city: "Oklahoma City",
  state: "OK",
  // ── GENERIC PLACEHOLDERS — replace every value before launch ──────────
  phone: "(405) 000-0000",
  phoneHref: "tel:+14050000000",
  email: "info@example.com",
  address: "123 Placeholder Ave, Oklahoma City, OK 73100",
  hours: "Mon–Fri 8am–5pm",
  // ──────────────────────────────────────────────────────────────────────
  credential: "ASE Certified",
} as const;

export interface Service {
  readonly id: string;
  /** Labor-operation code, the way a shop work order lines out jobs. */
  readonly op: string;
  readonly title: string;
  readonly blurb: string;
  readonly points: readonly string[];
}

export const services: readonly Service[] = [
  {
    id: "engine",
    op: "OP 100",
    title: "Engine & Transmission Repair",
    blurb:
      "From misfires and oil consumption to full rebuilds and transmission overhauls — diagnosed with data, repaired to spec, road-tested before it leaves.",
    points: [
      "Full rebuilds & replacements",
      "Timing, gaskets, internals",
      "Automatic & manual transmissions",
    ],
  },
  {
    id: "suspension",
    op: "OP 200",
    title: "Suspension Work",
    blurb:
      "Ride quality, handling, and alignment-critical components. We restore factory feel — or dial in something better.",
    points: [
      "Shocks, struts & springs",
      "Control arms, bushings, ball joints",
      "Steering components",
    ],
  },
  {
    id: "electrical",
    op: "OP 300",
    title: "Electrical Diagnostics",
    blurb:
      "Late-model vehicles are rolling networks. We trace parasitic drains, module faults, and wiring gremlins with factory-level scan tools — not guesswork.",
    points: [
      "Module & network (CAN) diagnosis",
      "Parasitic drain isolation",
      "Sensor & wiring repair",
    ],
  },
  {
    id: "performance",
    op: "OP 400",
    title: "Performance Upgrades & Mods",
    blurb:
      "Bolt-ons to big builds on the platforms we know best. Power you can drive daily, done with parts that hold up.",
    points: [
      "GM LS/LT & Mopar HEMI builds",
      "Intake, exhaust & forced induction",
      "Supporting mods done right",
    ],
  },
] as const;

export const platforms = {
  headline: "GM & Mopar are our home turf.",
  detail:
    "We work primarily on late-model domestic vehicles — trucks, muscle, and daily drivers — with deep specialization in GM and Mopar platforms. We also take on select European vehicles.",
  badges: ["Chevrolet", "GMC", "Cadillac", "Dodge", "RAM", "Jeep", "Chrysler", "Select European"],
} as const;

export const serviceArea: readonly string[] = [
  "Oklahoma City",
  "Tuttle",
  "Edmond",
  "Moore",
  "Norman",
  "Yukon",
  "Mustang",
  "Midwest City",
  "Del City",
  "Bethany",
  "El Reno",
] as const;
