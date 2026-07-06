# SCF AutoWorks LLC — Web App

Marketing site and estimate-request intake for SCF AutoWorks LLC, an ASE Certified auto repair shop
in the Oklahoma City metro specializing in GM & Mopar platforms: engine & transmission repair,
suspension, electrical diagnostics, and performance upgrades.

Built with **Deno**, `@std/http`, and **Zod**. No framework, no build step.

## Run it

```sh
deno task dev    # develop with file watching
deno task start  # production
deno task test   # unit tests (router + schema)
deno task check  # type-check, lint, format check
```

The server listens on `http://0.0.0.0:8000` by default. Configure with env vars: `PORT`, `HOST`,
`DATA_DIR`, `STATIC_DIR`.

## Architecture

Unix philosophy: every module does one job, stated in its header comment, and composition happens in
exactly one visible place (`src/server.ts`).

```
main.ts                    entry — load config, start server
src/
  config.ts                read env → Config
  log.ts                   one structured line per request to stdout
  router.ts                explicit route table → handler
  server.ts                composition: routes → security headers → log
  schema/contact.ts        Zod schema, single source of truth for intake
  handlers/
    pages.ts               HTML pages (home, 404)
    contact.ts             POST /api/contact — validate, append JSONL
    health.ts              GET /healthz
    static.ts              GET /static/* via @std/http serveDir
  data/shop.ts             every fact about the shop, in one place
  views/
    layout.ts              HTML document shell
    home.ts                home page sections, rendered from shop data
static/                    styles.css, app.js, favicon.svg
data/                      estimate-requests.jsonl (created at runtime)
```

Estimate requests are appended to `data/estimate-requests.jsonl` — one JSON object per line. Read
them with any text tool:

```sh
tail -f data/estimate-requests.jsonl | jq .
```

## Routes

| Method | Path           | Purpose                                 |
| ------ | -------------- | --------------------------------------- |
| GET    | `/`            | Home page                               |
| POST   | `/api/contact` | Estimate request (JSON or form-encoded) |
| GET    | `/healthz`     | Liveness probe                          |
| GET    | `/static/*`    | Static assets                           |

`POST /api/contact` returns `201 {ok, id}` on success, `422 {ok:false, errors:[{field,message}]}` on
validation failure. A honeypot field (`company`) silently drops bot submissions.

## Design

Styled as a shop work order: services are labor-op line items (OP 100–400) with torque-spec dotted
leaders, and the estimate form is a manila paper sheet inside the dark site. Palette: asphalt
charcoal, bone white, Hemi Orange (`#e8622c` — an actual Mopar engine paint color). Type: Big
Shoulders Display / Barlow / IBM Plex Mono. The page works without JavaScript (form falls back to a
normal POST; reveal animations only engage when JS is present) and respects
`prefers-reduced-motion`.

## Before launch

Placeholders live in `src/data/shop.ts` — replace phone, email, address, and hours with the real
values. Oklahoma LLC records are held by the [Oklahoma Secretary of State](https://www.sos.ok.gov)
(Business Entity Search); public listings show SCF AUTOWORKS LLC registered in Tuttle, OK.
