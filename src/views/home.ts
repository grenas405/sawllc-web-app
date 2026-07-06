/**
 * views/home.ts — one job: render the home page from shop data.
 * Each section is its own small function; the page is their concatenation.
 * The page is styled as a shop work order: labor-op line items, spec
 * leaders, and a paper estimate form.
 */

import { platforms, serviceArea, services, shop } from "../data/shop.ts";
import { escape, layout } from "./layout.ts";

function header(): string {
  return `
<header class="site-header" id="top">
  <a class="brand" href="#top">
    <span class="brand-mark" aria-hidden="true">SCF</span>
    <span class="brand-name">AutoWorks <em>LLC</em></span>
  </a>
  <nav class="site-nav" aria-label="Primary">
    <a href="#work">The Work</a>
    <a href="#platforms">Platforms</a>
    <a href="#area">Service Area</a>
    <a class="nav-cta" href="#estimate">Open a Work Order</a>
  </nav>
</header>`;
}

function hero(): string {
  return `
<section class="hero">
  <p class="hero-kicker mono reveal">// ${escape(shop.city).toUpperCase()}, ${
    escape(shop.state)
  } — ${escape(shop.credential).toUpperCase()} — WORK ORDER OPEN</p>
  <h1 class="hero-title">
    <span class="line reveal">Engine.</span>
    <span class="line reveal">Transmission.</span>
    <span class="line accent reveal">Done&nbsp;right.</span>
  </h1>
  <p class="hero-sub reveal">Late-model domestic specialists in the OKC metro. We diagnose with
  data, repair to spec, and road-test everything before it leaves the bay.</p>
  <div class="hero-actions reveal">
    <a class="btn btn-primary" href="#estimate">Request an estimate</a>
    <a class="btn btn-ghost" href="${shop.phoneHref}">Call ${escape(shop.phone)}</a>
  </div>
  <p class="spec-strip mono reveal" aria-label="Specialties">
    GM LS / LT <span class="sep">·</span> MOPAR HEMI <span class="sep">·</span>
    LATE-MODEL DOMESTIC <span class="sep">·</span> ASIAN IMPORTS <span class="sep">·</span>
    SELECT EUROPEAN
  </p>
</section>`;
}

function workSection(): string {
  const rows = services
    .map(
      (s) => `
    <article class="op-row reveal" id="svc-${escape(s.id)}">
      <span class="op-code mono" aria-hidden="true">${escape(s.op)}</span>
      <div class="op-body">
        <h3>${escape(s.title)}</h3>
        <p>${escape(s.blurb)}</p>
        <ul class="spec-list mono">
          ${s.points.map((p) => `<li><span>${escape(p)}</span></li>`).join("\n          ")}
        </ul>
      </div>
    </article>`,
    )
    .join("");
  return `
<section class="section" id="work">
  <h2 class="section-title reveal">The <span class="accent">work</span></h2>
  <p class="section-note mono reveal">LABOR OPERATIONS — ALL WORK ROAD-TESTED</p>
  <div class="op-table">${rows}</div>
</section>`;
}

function platformSection(): string {
  const badges = platforms.badges
    .map((b) => `<li class="badge">${escape(b)}</li>`)
    .join("");
  return `
<section class="section section-rule" id="platforms">
  <h2 class="section-title reveal">${escape(platforms.headline)}</h2>
  <p class="section-lead reveal">${escape(platforms.detail)}</p>
  <ul class="badge-row reveal" role="list">${badges}</ul>
  <p class="cred reveal"><span class="cred-seal" aria-hidden="true">ASE</span>
  <span>Our technicians are <strong>ASE Certified</strong> — tested, credentialed, and held to a
  national standard.</span></p>
</section>`;
}

function areaSection(): string {
  const towns = serviceArea.map((t) => `<li>${escape(t)}</li>`).join("");
  return `
<section class="section section-rule" id="area">
  <h2 class="section-title reveal">Serving the <span class="accent">OKC metro</span></h2>
  <ul class="town-list mono reveal" role="list">${towns}</ul>
  <p class="section-lead reveal">${escape(shop.hours)} · ${escape(shop.address)}</p>
</section>`;
}

function estimateForm(): string {
  return `
<section class="section paper" id="estimate">
  <div class="paper-sheet reveal">
    <div class="paper-head">
      <h2>Estimate Request</h2>
      <p class="mono">SCF AUTOWORKS LLC — ${escape(shop.city).toUpperCase()}, ${
    escape(shop.state)
  } — NO. <span id="wo-number">PENDING</span></p>
    </div>
    <form class="estimate-form" id="estimate-form" method="post" action="/api/contact" novalidate>
      <div class="field">
        <label for="f-name">Customer name</label>
        <input id="f-name" name="name" autocomplete="name" required>
      </div>
      <div class="field">
        <label for="f-phone">Phone</label>
        <input id="f-phone" name="phone" type="tel" autocomplete="tel" required>
      </div>
      <div class="field">
        <label for="f-email">Email <span class="opt">(optional)</span></label>
        <input id="f-email" name="email" type="email" autocomplete="email">
      </div>
      <div class="field field-trio">
        <div>
          <label for="f-year">Year</label>
          <input id="f-year" name="vehicleYear" inputmode="numeric" placeholder="2019" required>
        </div>
        <div>
          <label for="f-make">Make</label>
          <input id="f-make" name="vehicleMake" placeholder="Chevrolet" required>
        </div>
        <div>
          <label for="f-model">Model</label>
          <input id="f-model" name="vehicleModel" placeholder="Silverado" required>
        </div>
      </div>
      <div class="field">
        <label for="f-service">Requested operation</label>
        <select id="f-service" name="service" required>
          <option value="engine">Engine repair</option>
          <option value="transmission">Transmission repair</option>
          <option value="suspension">Suspension</option>
          <option value="electrical">Electrical diagnostics</option>
          <option value="performance">Performance upgrades</option>
          <option value="other">Something else</option>
        </select>
      </div>
      <div class="field field-wide">
        <label for="f-message">Symptoms / goals <span class="opt">(optional)</span></label>
        <textarea id="f-message" name="message" rows="4"
          placeholder="Noises, warning lights, drivability, build goals…"></textarea>
      </div>
      <input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="form-status mono" id="form-status" role="status" aria-live="polite"></p>
      <button class="btn btn-primary btn-big" type="submit">Send the work order</button>
    </form>
  </div>
</section>`;
}

function footer(): string {
  const year = new Date().getFullYear();
  return `
<footer class="site-footer">
  <p class="footer-brand">SCF <span>AutoWorks LLC</span></p>
  <p>${escape(shop.address)} · <a href="${shop.phoneHref}">${escape(shop.phone)}</a> ·
     <a href="mailto:${escape(shop.email)}">${escape(shop.email)}</a></p>
  <p>${escape(shop.hours)}</p>
  <p class="footer-fine mono">&copy; ${year} ${escape(shop.name)} · ${
    escape(shop.credential)
  } · Oklahoma LLC — records at the
  <a href="https://www.sos.ok.gov" rel="noopener">Oklahoma Secretary of State</a></p>
</footer>`;
}

export function renderHome(): string {
  return layout({
    title: `${shop.name} — Engine, Transmission & Performance | Oklahoma City`,
    description:
      "ASE Certified auto repair in Oklahoma City. Engine & transmission repair, suspension, electrical diagnostics, and performance upgrades. GM & Mopar specialists — Honda, Hyundai, Kia, and other Asian imports welcome.",
    body: [
      header(),
      "<main>",
      hero(),
      workSection(),
      platformSection(),
      areaSection(),
      estimateForm(),
      "</main>",
      footer(),
    ].join("\n"),
  });
}
