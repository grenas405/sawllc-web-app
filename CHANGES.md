# Changes

## 2026-07-10 — Hamburger nav on tablets too

- The drawer navigation (hamburger, full-screen panel) now applies up to 1024px instead of 720px, so
  tablets get the same big touch-friendly menu as phones; the inline link row is desktop-only. This
  replaces the old 721–980px rule that just hid the phone number for lack of space.

## 2026-07-10 — Estimate-request inbox in the admin dashboard

- The dashboard (now "Shop Office") opens with an Incoming Requests inbox: every estimate request
  from the website shows as a card — date, NEW/HANDLED state, big vehicle title, service tag,
  customer name with tap-to-call phone and mailto email, and the customer's message. A "Mark
  handled" button files it away (dimmed, reversible); the panel header counts the new ones.
- Estimate requests now persist in Deno KV (keyed by timestamp for newest-first listing) alongside
  the existing JSONL audit log. New `POST /api/admin/requests/mark` endpoint (session-protected).
- Fix: ghost buttons rendered with the user-agent's gray background when used on `<button>` elements
  — `.btn-ghost` now sets `background: transparent`.

## 2026-07-06 — Mobile-friendly navigation

- Public nav rebuilt as an industry-standard mobile drawer: hamburger toggle (44px touch target,
  animated to an X with a Menu/Close label) opening a full-screen panel with huge Big Shoulders
  Display links, numbered like the work-order sections, dotted rules, a tap-to-call phone item
  (pulled from admin-editable settings), and a full-width work-order CTA. Closes on link tap or
  Escape; body scroll locks while open.
- Desktop links upgraded to the display face (bigger, bolder) with a sliding orange underline on
  hover; phone number joins the desktop nav (hidden 721–980px where it doesn't fit).
- No-JS fallback: without JavaScript the nav renders as always-visible wrapped links; the hamburger
  never appears.
- Fix: the header's `backdrop-filter` made it the CSS containing block for the fixed drawer,
  collapsing the panel to the header strip — mobile header is now solid asphalt instead.

## 2026-07-06 — Zod from JSR instead of npm

- Swapped the `zod` import mapping to `jsr:@zod/zod` and regenerated `deno.lock` (also dropping a
  stray `playwright-core` entry picked up during local testing). The dependency tree is now entirely
  JSR — no npm registry needed. Code imports (`from "zod"`) are unchanged.

## 2026-07-06 — Admin dashboard, login, and Deno KV settings

- Admin dashboard at `/admin` (login at `/admin/login`) for managing contact details, address,
  hours, and the brand badges — changes go live on the public site the moment they're saved.
- Storage moved to Deno KV (`KV_PATH`, default `data/site.kv`): site settings, the admin credential,
  sessions (8h TTL via KV `expireIn`), and login throttling (5 fails → 15-minute lockout) all live
  there. Public pages render from KV settings merged over `src/data/shop.ts` defaults.
- Auth: PBKDF2-SHA256 (210k iterations) password hashing, constant-time verify, HttpOnly
  SameSite=Strict session cookie (Secure behind HTTPS).
- `scripts/setup-admin-password.ts` (`deno task setup-password`) sets or replaces the admin password
  — interactive with hidden input, or via `SCF_ADMIN_PASSWORD` for automation.
- systemd unit gains `--unstable-kv`, `KV_PATH=/var/lib/denogenesis/site.kv`, and KV_PATH in
  `--allow-env`. New tests for auth, sessions, KV settings, and the settings schema (19 total).

## 2026-07-06 — Add Asian imports to platform coverage

- Per SCF AutoWorks: the shop also works on Honda, Hyundai, Kia, and other Asian vehicles. Added
  them to the platform badges and copy in `src/data/shop.ts`, the hero spec strip, and the meta
  description.

## 2026-07-06 — Fix: systemd unit failed on the VPS (217/USER)

- The unit was written with this dev box's user (`grenas405`); the VPS runs as `sysadmin`, so
  systemd exited 217/USER. Switched `User`, `Group`, and all paths in `systemd/denogenesis.service`
  to `sysadmin`.
- `scripts/setup-vps.sh` now preflights the unit against the host — user exists, ExecStart binary is
  executable, WorkingDirectory exists and matches the checkout — so mismatches fail with a clear
  message instead of an opaque 217/USER or 203/EXEC from systemd.

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
