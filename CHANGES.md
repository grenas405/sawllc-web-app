# Changes

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
