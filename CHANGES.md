# Changes

## 2026-07-06 — Deployment configs (systemd + nginx)

- Added `systemd/denogenesis.service`: hardened unit (ProtectSystem=strict, NoNewPrivileges,
  PrivateTmp, etc.) running the app as `grenas405` on `127.0.0.1:8004` with least-privilege Deno
  flags; estimate data persists in `/var/lib/denogenesis` via `StateDirectory`; module cache kept in
  the state dir so restarts don't re-download deps.
- Added `nginx/denogenesis.com.conf`: HTTP→HTTPS redirect, apex→www canonicalization, TLS 1.2/1.3,
  full security-header set with CSP extended for Google Fonts, gzip, and a proxy to
  `127.0.0.1:8004`; `/healthz` proxied with access_log off; `client_max_body_size` raised to 16k so
  the estimate form's 2000-char message fits. Access/error logs named `scfllc-web-app.*.log`
  (originally `sfcllc`, a typo, fixed same day).
- Added `scripts/setup-vps.sh`: idempotent root script that installs the systemd unit and nginx
  config on the VPS, enables the service, and reloads nginx — skipping the nginx activation with
  guidance if the Let's Encrypt certificate doesn't exist yet.

## 2026-07-06 — Fix: shop.ts was missing from the repository

- The unanchored `data/` pattern in `.gitignore` also matched `src/data/`, so `src/data/shop.ts` was
  silently excluded from the initial commit. Anchored the pattern to the repo root (`/data/`) and
  committed the file.

## 2026-07-06 — Generic contact placeholders

- Replaced the realistic-looking placeholder contact details in `src/data/shop.ts` with unmistakably
  generic ones (`(405) 000-0000`, `info@example.com`, `123 Placeholder Ave`) so they cannot be
  mistaken for real business information before launch.

## 2026-07-06 — Initial release

- Scaffolded Deno web app: `@std/http` server, Zod validation, no build step.
- Unix-philosophy architecture: one job per module (`config`, `log`, `router`, `server`,
  `schema/contact`, `handlers/*`, `views/*`, `data/shop`), composed in a single visible place
  (`src/server.ts`).
- Routes: `GET /` (home), `POST /api/contact` (estimate intake, JSON or form-encoded),
  `GET /healthz`, `GET /static/*`.
- Estimate intake validated with Zod (field-scoped 422 errors), persisted as append-only JSONL in
  `data/estimate-requests.jsonl`; honeypot field silently drops bot submissions.
- Work-order design system: labor-op service rows (OP 100–400), torque-spec dotted leaders, manila
  paper estimate form, Hemi Orange accent, Big Shoulders Display / Barlow / IBM Plex Mono
  typography.
- Progressive enhancement: page fully usable without JS; scroll reveals gate behind a `js` class;
  `prefers-reduced-motion` respected; responsive to 390px.
- Unit tests for router and contact schema (10 tests); `deno task check` runs type-check, lint, and
  format.
- Research note: web listings (Bizapedia) show SCF AUTOWORKS LLC registered in Tuttle, OK; official
  records at the Oklahoma Secretary of State (sos.ok.gov). Contact details in `src/data/shop.ts` are
  placeholders pending real values.
