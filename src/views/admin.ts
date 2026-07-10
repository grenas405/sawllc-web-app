/**
 * views/admin.ts — one job: render the admin login and dashboard pages.
 * Same shop-floor design language as the public site, tuned for work:
 * big labels, one section per fact, one save button.
 */

import type { SiteSettings } from "../settings.ts";
import type { EstimateRequest } from "../requests.ts";
import { escape } from "./layout.ts";

const SERVICE_LABELS: Record<string, string> = {
  engine: "Engine repair",
  transmission: "Transmission repair",
  suspension: "Suspension",
  electrical: "Electrical diagnostics",
  performance: "Performance upgrades",
  other: "Other",
};

const WHEN = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function adminShell(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${escape(title)}</title>
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/static/styles.css">
  <link rel="stylesheet" href="/static/admin.css">
</head>
<body class="admin">
${body}
<script src="/static/admin.js" defer></script>
</body>
</html>`;
}

export function renderLoginPage(): string {
  return adminShell(
    "Sign in — SCF AutoWorks Admin",
    `
<main class="login-wrap">
  <form class="login-card" id="login-form" method="post" action="/api/admin/login" novalidate>
    <p class="mono login-kicker">SCF AUTOWORKS LLC — SHOP OFFICE</p>
    <h1>Sign in</h1>
    <div class="field">
      <label for="f-password">Admin password</label>
      <input id="f-password" name="password" type="password" autocomplete="current-password"
        autofocus required>
    </div>
    <p class="form-status mono" id="login-status" role="status" aria-live="polite"></p>
    <button class="btn btn-primary btn-big" type="submit">Open the office</button>
    <p class="login-hint mono">Lost the password? Re-run <code>deno task setup-password</code>
    on the server.</p>
  </form>
</main>`,
  );
}

function textField(id: string, label: string, value: string, hint = ""): string {
  return `
    <div class="panel-field">
      <label for="${id}">${escape(label)}</label>
      <input id="${id}" name="${id}" value="${escape(value)}" required>
      ${hint ? `<p class="hint mono">${escape(hint)}</p>` : ""}
    </div>`;
}

function requestCard(r: EstimateRequest): string {
  const phoneDigits = r.phone.replace(/\D/g, "");
  const service = SERVICE_LABELS[r.service] ?? r.service;
  return `
    <article class="request${r.handled ? " handled" : ""}" data-ts="${r.ts}" data-id="${r.id}">
      <p class="request-meta mono">${escape(WHEN.format(new Date(r.ts)))} —
        ${r.handled ? "HANDLED" : "<strong>NEW</strong>"}</p>
      <h3>${escape(String(r.vehicleYear))} ${escape(r.vehicleMake)} ${escape(r.vehicleModel)}</h3>
      <p class="request-line"><span class="request-tag">${escape(service)}</span></p>
      <p class="request-line">${escape(r.name)} ·
        <a href="tel:+1${escape(phoneDigits)}">${escape(r.phone)}</a>${
    r.email ? ` · <a href="mailto:${escape(r.email)}">${escape(r.email)}</a>` : ""
  }</p>
      ${r.message ? `<blockquote>${escape(r.message)}</blockquote>` : ""}
      <button class="btn btn-ghost btn-mark" type="button">
        ${r.handled ? "Move back to new" : "Mark handled"}</button>
    </article>`;
}

function requestsSection(requests: EstimateRequest[]): string {
  const fresh = requests.filter((r) => !r.handled).length;
  const cards = requests.length === 0
    ? `<p class="request-empty mono">No estimate requests yet — they'll show up here the moment
       a customer sends one from the website.</p>`
    : requests.map(requestCard).join("");
  return `
  <section class="panel panel-requests">
    <h2><span class="panel-num mono">00</span> Incoming requests
      ${fresh > 0 ? `<span class="fresh-count">${fresh} new</span>` : ""}</h2>
    <div id="request-list">${cards}</div>
  </section>`;
}

export function renderDashboard(settings: SiteSettings, requests: EstimateRequest[]): string {
  const brandLines = settings.badges.join("\n");
  return adminShell(
    "Dashboard — SCF AutoWorks Admin",
    `
<header class="site-header">
  <a class="brand" href="/admin">
    <span class="brand-mark" aria-hidden="true">SCF</span>
    <span class="brand-name">Shop Office</span>
  </a>
  <nav class="site-nav" aria-label="Admin">
    <a href="/" target="_blank" rel="noopener">View site ↗</a>
    <button class="nav-cta" id="logout" type="button">Sign out</button>
  </nav>
</header>
<main class="admin-main">
  <h1 class="section-title">Shop <span class="accent">office</span></h1>
  <p class="section-note mono">ESTIMATE REQUESTS COME IN BELOW — SETTINGS GO LIVE THE MOMENT YOU SAVE</p>

  ${requestsSection(requests)}

  <form id="settings-form" novalidate>
    <section class="panel">
      <h2><span class="panel-num mono">01</span> Contact</h2>
      ${textField("phone", "Phone", settings.phone, "Shown in the header, hero, and footer")}
      ${textField("email", "Email", settings.email)}
    </section>

    <section class="panel">
      <h2><span class="panel-num mono">02</span> Address</h2>
      ${textField("address", "Street address", settings.address)}
    </section>

    <section class="panel">
      <h2><span class="panel-num mono">03</span> Hours</h2>
      ${
      textField("hours", "Hours of operation", settings.hours, "e.g. Mon–Fri 8am–6pm · Sat 9am–2pm")
    }
    </section>

    <section class="panel">
      <h2><span class="panel-num mono">04</span> Brands we work on</h2>
      <div class="panel-field">
        <label for="badges">One brand per line</label>
        <textarea id="badges" name="badges" rows="10" spellcheck="false">${
      escape(brandLines)
    }</textarea>
        <p class="hint mono">Shown as badges in the platforms section</p>
      </div>
      <ul class="badge-row" id="brand-preview" role="list" aria-label="Preview"></ul>
    </section>

    <div class="save-bar">
      <p class="form-status mono" id="save-status" role="status" aria-live="polite"></p>
      <button class="btn btn-primary btn-big" type="submit">Save &amp; publish</button>
    </div>
  </form>
</main>`,
  );
}
