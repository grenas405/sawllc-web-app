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
    "We work primarily on late-model domestic vehicles — trucks, muscle, and daily drivers — with deep specialization in GM and Mopar platforms. We also service Honda, Hyundai, Kia, and the other Asian imports, plus select European vehicles.",
  badges: [
    "Chevrolet",
    "GMC",
    "Cadillac",
    "Dodge",
    "RAM",
    "Jeep",
    "Chrysler",
    "Honda",
    "Hyundai",
    "Kia",
    "Asian Imports",
    "Select European",
  ],
} as const;

export interface Faq {
  readonly q: string;
  readonly a: string;
}

/** Counter questions. Wording is a sensible default — have the shop verify
 * policies (fees, warranty terms) before launch. */
export const faqs: readonly Faq[] = [
  {
    q: "Do you charge for diagnostics?",
    a: "Yes — an honest diagnosis takes real shop time and factory-level tooling, and it's the difference between fixing the problem and throwing parts at it. We quote the diagnostic fee up front, and if you approve the repair with us, that time goes toward the job.",
  },
  {
    q: "Is the work guaranteed?",
    a: "We stand behind our repairs with a parts-and-labor warranty on the work we perform. Ask for the current terms when you approve the estimate — we put it in writing.",
  },
  {
    q: "How long will my repair take?",
    a: "Diagnostics are usually same- or next-day. Most repairs run days, not weeks; engine and transmission jobs take longer, and you get a timeline before we start. If the plan changes, you hear it from us first.",
  },
  {
    q: "Will you work on my vehicle?",
    a: "Late-model domestic — especially GM and Mopar — is our home turf. Honda, Hyundai, Kia, and the other Asian imports are welcome, and we take select European vehicles case by case. Fastest answer: send the year, make, and model through the estimate form.",
  },
  {
    q: "Can I bring my own parts?",
    a: "Sometimes. Part quality makes or breaks a repair, so we'll tell you straight whether we'll install what you've got. Customer-supplied parts aren't covered by our warranty — parts we source are.",
  },
  {
    q: "Do I need an appointment?",
    a: "Start with the estimate form or a phone call and we'll schedule the drop-off. Walk-ins are welcome for a look, but booked work goes on the lift first.",
  },
] as const;

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
