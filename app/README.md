# Retenum app

Product and technical context lives one level up:
`RETENUM_PRODUCT_DECISIONS.md`, `RETENUM_PRD.md`, `RETENUM_TECHNICAL_ARCHITECTURE.md`,
`RETENUM_BUILD_PLAN.md`, `RETENUM_RISK_REGISTER.md`.

## Run locally

Requires Node 22.12+ (22.11 works but needs the manually added `@rolldown/binding-darwin-x64` dev
dependency) and pnpm 10.

```bash
pnpm install
cp .env.example .env.local        # set BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm db:migrate                   # creates the local embedded database in ../.data/pglite (outside app/ on purpose)
pnpm dev                          # http://localhost:3000  (health: /api/health; components: /dev/components)
```

No Docker or Postgres install is needed locally: development and tests use PGlite (real Postgres in
WebAssembly). Production requires `DATABASE_URL` (managed Postgres) and refuses to start without it.

## Checks (all must pass before a slice is marked done)

```bash
pnpm typecheck
pnpm test        # unit + integration tests against fresh in-memory Postgres with real migrations
pnpm build       # webpack (much faster than Turbopack on this machine)
pnpm test:e2e    # builds and starts a local production server, then runs Playwright in installed Chrome
```

## Rules that the code enforces

- Money is integer minor units (`bigint`), never floats — `src/domain/money.ts`.
- Engagement history is append-only (database trigger) and hash-chained — `src/server/events/append.ts`.
- Notifications go through the transactional outbox — `src/server/outbox/`.
- Payments are test-mode only until gate G-PAY (see product decisions D-20).
