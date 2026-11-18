# Retenum — Technical Architecture

*Version 0.1 · 18 November 2026. Requirements are in `RETENUM_PRD.md` (IDs such as FR-PAY-03). Decisions are numbered TD-xx. When one changes, update it here and note why in the change log.*

## 1. Starting point

- **Workspace inspected:** it contained only discovery documents. There was no code, no repository and no existing stack to assess.
- **Environment:** macOS, Node 22.11, npm 10.9, pnpm, git. **No Docker and no local Postgres.** That shapes TD-04.
- **Who maintains it:** a non-engineer founder working with Claude Code. That favours one codebase, one language, managed services, few moving parts and strong conventions.

## 2. Architecture decisions

| ID | Decision | Why | Rejected alternatives |
|---|---|---|---|
| TD-01 | **A single modular web application** (no microservices) | One deployable unit, simplest to run and change | Separate API + SPA (two codebases); microservices (operational burden) |
| TD-02 | **TypeScript (strict) + Next.js (App Router)**, React server components, server actions for mutations, route handlers for webhooks and cron | One language end to end. Large ecosystem and documentation. First-class Vercel hosting | Remix (smaller ecosystem); Rails or Django (second language for the founder) |
| TD-03 | **PostgreSQL** as the only datastore of record | Transactions, row locks for payments, constraints, triggers for append-only history | Document databases (weaker integrity for money) |
| TD-04 | **Drizzle ORM + drizzle-kit SQL migrations.** **PGlite** (Postgres compiled to WebAssembly, runs inside Node) for local development and tests. **Managed Postgres (Neon)** for staging and production | Real Postgres semantics locally without Docker. Migrations are plain SQL the founder can read | Prisma (heavier engine; PGlite support less mature); SQLite locally (different SQL from production) |
| TD-05 | **Better Auth** for authentication (email + password, email verification, email OTP for counterparties, sessions, rate limiting; 2FA plugin later) with its Drizzle adapter | Maintained library; avoids hand-rolled crypto; supports the passwordless counterparty flow (D-43) | Auth.js (weaker email/password); building our own (security risk); hosted auth such as Clerk (cost per user, and counterparties are free users) |
| TD-06 | **Authorisation in our own policy module** (`can(actor, action, resource)`), enforced in the service layer, never only in the UI | Engagement-level party roles are domain-specific | Row-level security only (harder to test and reason about) |
| TD-07 | **Domain logic as pure functions** (state machines, financial calculations) in `src/domain`, with no database or framework imports | Most important rules become fast, exhaustively testable unit tests | Logic spread across components |
| TD-08 | **Money as `bigint` minor units + ISO currency** in the database, and `bigint` in TypeScript | No floating-point errors | Decimal or float |
| TD-09 | **Append-only engagement events** with a database trigger rejecting UPDATE and DELETE, plus a per-engagement SHA-256 hash chain | Tamper-evident history (FR-HIS-02/03) enforced below the application | Application-only discipline |
| TD-10 | **Payment provider abstraction** (`PaymentProvider` interface). **Paystack** is the first adapter | D-27; Stripe Connect can be added later | Hard-coding Paystack |
| TD-11 | **Webhook inbox pattern:** verify signature → store raw event (unique key) → process in a transaction with a row lock → state-machine guard | Idempotent, survives duplicates and out-of-order events | Processing directly in the handler without dedup |
| TD-12 | **Transactional outbox for notifications.** Rows are written in the same transaction as the business action, sent after commit, and retried by cron | Notifications never lost and never roll back business actions | Sending email inside the request |
| TD-13 | **Files in S3-compatible object storage** (Cloudflare R2) via short-lived pre-signed URLs. Local filesystem adapter in development | Cheap, no bandwidth charges, private by default | Database blobs |
| TD-14 | **Email through Resend** (HTTP API). A console adapter in development and tests | Simple API, good deliverability | Running our own email server |
| TD-15 | **Hosting: Vercel** (app + cron) **+ Neon** (Postgres, EU region pending O-03) **+ R2 + Resend + Sentry** | Managed, low ops, free or cheap tiers to start | Self-managed VPS (ops burden) |
| TD-16 | **Validation with Zod** at every boundary (forms, server actions, webhooks, env) | Single schema language | Ad hoc checks |
| TD-17 | **Styling: Tailwind CSS.** Accessible primitives built in-house (forms, dialog, status badge) | Fast, consistent, mobile-first | A heavy component kit |
| TD-18 | **Testing: Vitest** (unit + integration against PGlite with real migrations). **Playwright** end-to-end from Slice 3. Table-driven permission tests | Fast feedback without Docker | Jest |
| TD-19 | **CI: GitHub Actions** (typecheck, lint, test, build, dependency audit) once a remote exists | Standard | — |
| TD-20 | **Exact dependency versions** pinned, with the lockfile committed | Reproducible builds | Version ranges |

## 3. Module structure

```
retenum/                         (repository root = app/)
  src/
    app/                         Next.js routes (UI, server actions, route handlers)
      (auth)/  (app)/  api/webhooks/[provider]/  api/cron/[job]/  api/health/
    domain/                      PURE logic: no DB, no framework
      money.ts  engagement-state.ts  change-state.ts  delivery-state.ts
      payment-state.ts  financials.ts  working-days.ts  hash-chain.ts
    server/
      db/        schema/*.ts  client.ts  migrate.ts
      auth/      better-auth config, session helpers
      policy/    can(), actor resolution
      modules/   identity, workspaces, engagements, changes, deliveries,
                 finance, payments, disputes, closure, notifications, files, admin
                 (each: service.ts = use-cases; queries.ts; validation.ts)
      payments/  provider.ts (interface)  paystack/  registry.ts
      events/    append-only event writer (hash chain)
      outbox/    enqueue + dispatcher
      lib/       env.ts (validated), logger.ts, errors.ts, ids.ts, rate-limit.ts
  drizzle/                       generated SQL migrations (committed)
  tests/  unit/ integration/ e2e/  helpers/ (test DB factory, fixtures)
```

**Dependency rule:** `app` → `server/modules` → (`domain`, `server/db`, `server/policy`, `server/events`). `domain` imports nothing internal. Enforced by an import-boundary lint rule (Slice 0, S).

**Service use-case pattern:** every mutation is one function, for example `confirmChange(actor, input)`. It:
1. Validates input with Zod.
2. Loads the resource inside a DB transaction.
3. Checks `can()`.
4. Applies the domain state-machine transition (pure).
5. Writes rows.
6. Appends the engagement event.
7. Enqueues outbox notifications.
8. Commits.

Server actions are thin wrappers around these functions.

## 4. Data model (core tables)

*Identity (Better Auth managed):* `user`, `session`, `account`, `verification`.

| Table | Key columns | Notes |
|---|---|---|
| `workspaces` | id, name, type (business/individual), reg_number, plan, suspended_at | |
| `workspace_members` | workspace_id, user_id, role (owner/admin/member) | Unique (workspace, user). One owner, enforced by service plus a partial unique index |
| `workspace_invitations` | workspace_id, email, role, token_hash, expires_at, accepted_at | |
| `engagements` | id, initiator_workspace_id, title, currency, status, current_version, response_windows (jsonb), source_file_id | |
| `engagement_parties` | engagement_id, side (payer/payee), workspace_id (nullable), org_name, is_initiator | Exactly 2 per engagement |
| `party_members` | party_id, user_id, authority (approver/contributor) | |
| `engagement_invitations` | engagement_id, party_id, email, token_hash, expires_at, accepted_at, revoked_at | |
| `commitments` | id, engagement_id, kind, owed_by_side, current_revision_id, removed_in_version | Identity row |
| `commitment_revisions` | id, commitment_id, version_from, fields (title, qty, unit, dod, due_date, price_minor, trigger, terms_days, linked_deliverables, pro_rata), created_by_change_id | Never updated. The current version is resolved by version range |
| `baseline_submissions` | engagement_id, seq, snapshot (jsonb), status, responded_by, responded_at, comment | |
| `changes` | id, engagement_id, seq, proposed_by_side, proposed_by_user, base_version, operations (jsonb with *was*/*now*), reason_category, reason_text, time_effect_days, from_conversation (jsonb), agreement_status, authorisation_status, valuation_status, payee_figure_minor, payer_figure_minor, agreed_figure_minor, countered_from_id, work_started_before_auth_at, respond_by | Three statuses per D-41 |
| `engagement_versions` | engagement_id, version, cause (baseline/change/valuation), change_id, created_at | |
| `deliveries` | id, engagement_id, deliverable_ids, claimed (jsonb), note, status, previous_delivery_id, respond_by | |
| `delivery_responses` | delivery_id, response, accepted_value_minor, accepted_qty, issues (jsonb), reason, user_id | |
| `party_obligation_updates` | commitment_id, status (fulfilled/missed), by_side, note | |
| `payment_requests` | id, obligation_commitment_id, amount_minor, external_invoice_no, file_id, status | |
| `payment_transactions` | id, engagement_id, source (provider/offline), provider, provider_reference (unique), retenum_reference (unique), amount_minor, currency, status, status_history (jsonb), verified_at, reported_by, confirmed_by | Offline: reported → confirmed / not_received |
| `payment_allocations` | transaction_id, obligation_commitment_id, amount_minor | Σ = transaction amount |
| `refunds` | id, transaction_id, source, provider_refund_id (unique), amount_minor, status | |
| `provider_events` | id, provider, event_key (unique with provider), type, raw (jsonb), signature_valid, received_at, processed_at, result | Webhook inbox |
| `payout_accounts` | workspace_id, provider, bank_code, account_last4, account_name, provider_subaccount_code, verified_at, mode (test/live) | Full account number not stored after subaccount creation |
| `disputes` | id, engagement_id, target_type, target_id, amount_minor, status, raised_by_side | |
| `dispute_positions` | dispute_id, side, text, user_id, created_at | Append-only |
| `closures` | engagement_id, proposed_by_side, snapshot, status, responded_by | |
| `files` | id, storage_key (content-addressed), sha256, mime, size, uploaded_by, engagement_id | Immutable |
| `engagement_events` | id, engagement_id, seq, actor_user_id, actor_side, type, target, data (jsonb), prev_hash, hash, created_at, ip_hash, user_agent | **Trigger: no UPDATE/DELETE** |
| `security_audit_log` | id, actor, type, data, created_at | Append-only trigger |
| `outbox` | id, kind, payload, status, attempts, next_attempt_at, last_error | |
| `rate_limits` | key, window_start, count | Or provided by Better Auth |

**Financial figures are never stored.** They are computed by `domain/financials.ts` from commitments (current revisions), changes, delivery responses, payment requests, transactions, allocations, refunds and disputes (PRD §22). Snapshots are stored only in closures and stop notices, as records of a moment.

## 5. Authentication and access

- **Better Auth:** email + password (hash: scrypt by library default), email verification required, password reset, the email-OTP plugin for counterparty invitations (passwordless users), and database sessions in httpOnly secure cookies.
- **Session → Actor:** `{ userId, platformAdmin, memberships[] }`. For engagement actions, the policy resolves the user's party membership (side + authority).
- **Policy:** `can(actor, action, ctx)`. A single table-driven implementation mirrors PRD §17. A test enumerates every action × role.
- **Admin role:** set only by a CLI script (`pnpm admin:grant <email>`), audited.

## 6. Payment architecture

```
Payer ──► Retenum server: initiate(obligation, amount)
            │ create payment_transaction(initiated, RTN-ref)  [tx]
            │ provider.initialize(ref, amount, currency, subaccount, callback)
            └──► redirect to provider-hosted checkout
Provider ──► POST /api/webhooks/paystack   (raw body)
            1 verify HMAC-SHA512(raw, secret) — constant-time        → 401 if bad
            2 INSERT provider_events (provider, event_key) ON CONFLICT DO NOTHING
               → already present? return 200 (duplicate)
            3 BEGIN; SELECT payment_transaction FOR UPDATE (by reference)
            4 provider.verify(reference)  → amount/currency/status check
            5 domain.paymentTransition(current, verified)  (forward-only)
            6 write transaction status + engagement_event + outbox; COMMIT
            7 mark provider_event processed (result)
Return URL ─► page polls GET own status (never trusts query string)
Cron  ──► re-verify pending > 30 min; daily reconcile last 7 days
```

**`PaymentProvider` interface:**
- `initialize(input) → {checkoutUrl, providerReference}`
- `verify(reference) → VerifiedPayment`
- `parseWebhook(rawBody, headers) → {valid, eventKey, type, reference, …}`
- `resolveBankAccount(bankCode, accountNumber)`
- `createPayoutAccount(…) → subaccountCode`
- `refund(reference, amount?)` (GATED)
- `listBanks()`

**Paystack specifics (to be verified in the sandbox in Slice 7; current information comes from docs and third-party guides):**
- Signature header `x-paystack-signature` = hex HMAC-SHA512 of the raw body, keyed with the secret key.
- Verify via `GET /transaction/verify/:reference`.
- Amounts are in kobo.
- Subaccount via `subaccount` on initialize, with `bearer` configuration.
- No failed-charge webhook, so rely on re-verification (D-28).
- `refund.*` events for the refund lifecycle.
- The event key for dedup = event type + `data.id` (transaction or refund id). To be confirmed against real payloads.

**Rules:**
- Card data never touches Retenum.
- The secret key is held server-side only, with separate test and live keys per environment.
- Live mode requires `PAYMENTS_MODE=live` **and** a recorded G-PAY completion flag in the database (FR-PAY-14). Otherwise initialization refuses to run against live keys.
- Amounts are integers end to end. Initialization amount = allocation sum.
- Currency precision: NGN has 2 minor digits (kobo). A currency table holds the exponents.

## 7. Notifications

Outbox rows are written in the same transaction as the action. Dispatcher:
- runs immediately after commit (best effort);
- retries via cron every 5 minutes with exponential back-off (max 8 attempts);
- dead-letters to the admin view.

Templates are typed functions, rendered to plain HTML and text. Recipients are resolved at send time from party approvers.

## 8. Files and evidence

Upload flow:
1. The client requests an upload intent.
2. The server validates type and size and returns a pre-signed PUT URL to a temporary key.
3. On completion, the server computes or verifies the SHA-256 and moves the file to a content-addressed key `sha256/<hash>`.
4. A `files` row is created.

Downloads go through a server route that checks `can()` and issues a 60-second pre-signed GET. The bucket is private. Malware scanning is S (a provider integration later).

## 9. Audit logging

`events.append(tx, {engagementId, actor, type, target, data})`:
- reads the last event's hash for the engagement (`FOR UPDATE` on the engagement row, which serialises appends);
- computes `hash = sha256(prev_hash ‖ canonical_json(event))`;
- inserts the row.

The trigger rejects UPDATE and DELETE. A verification function recomputes the chain (admin action plus a test). `security_audit_log` gets the same append-only trigger, without a chain.

## 10. Environments, hosting and deployment

| Env | App | DB | Payments | Email | Files |
|---|---|---|---|---|---|
| local | `next dev` | PGlite file in `.data/` | Paystack **test** keys (optional) | console | local disk |
| test (CI) | Vitest | PGlite in-memory, migrations applied | fake provider for unit tests; real Paystack sandbox tests run **only** when `PAYSTACK_TEST_SECRET_KEY` is set (reported as skipped otherwise) | in-memory | in-memory |
| staging | Vercel preview | Neon branch | Paystack test | Resend (test domain) | R2 staging bucket |
| production | Vercel production | Neon main | test until G-PAY, then live | Resend | R2 prod bucket |

- **Deployment:** `main` → production, after the CI pipeline (typecheck, lint, unit + integration tests, build). Migrations run as a deploy step (`drizzle-kit migrate`) before the new version serves traffic. Migrations must be backward-compatible with the previous release (expand/contract).
- **Secrets:** Vercel environment variables. `src/server/lib/env.ts` validates them at boot and fails fast.

## 11. Monitoring, backups, recovery

- **Monitoring:** Sentry for errors (server + client). Structured JSON logs (request id, user id hash, engagement id). Health endpoint `/api/health` (DB ping). Alerts:
  - webhook signature failures over 5 in 10 minutes;
  - `needs_review` transactions;
  - outbox dead letters;
  - reconciliation mismatches.
- **Backups:** Neon point-in-time recovery (7 days on paid plans; check the plan), plus a nightly `pg_dump` to R2 with 30-day retention via a scheduled GitHub Action. R2 object versioning on.
- **Recovery targets** (design-partner phase): RPO 24 hours (≤ minutes with PITR), RTO 4 hours. Restore drill before each release gate.

## 12. Security review checklist (release gate)

1. Permission matrix tests pass (AC-PERM-1).
2. No secret in the client bundle (build-output grep).
3. CSP, HSTS and frame-ancestors headers present.
4. Rate limits active on auth, OTP, invitations and payment initiation.
5. Webhook signature tests: valid, invalid, missing, replay.
6. File upload type spoofing tested.
7. Dependency audit is clean of high or critical issues.
8. Admin actions audited.
9. Live payment guard tested (FR-PAY-14).
10. Error responses leak no stack traces in production.

## 13. Testing strategy

| Layer | What | Tooling |
|---|---|---|
| Unit | Domain state machines (every allowed and forbidden transition), financial calculations (PRD §22 examples + property-style cases), money, working days, hash chain | Vitest |
| Integration | Services against PGlite with real migrations: permissions, transactions, append-only trigger, idempotent webhook processing, outbox | Vitest |
| Provider contract | Paystack adapter against recorded fixtures. Live sandbox suite when keys are present | Vitest |
| End-to-end | Key journeys UJ-1 to UJ-9 in a browser (mobile + desktop viewports) | Playwright (from Slice 3) |
| Accessibility | axe checks in e2e | @axe-core/playwright |

Rules:
- A slice is done only when its tests have been executed and pass.
- Skipped tests are reported as skipped, never as passed.

## Change log

| Date | Change |
|---|---|
| 2026-11-18 | Created |
| 2026-11-18 | Slice 1 findings: `next dev` runs with `--webpack` (Turbopack dev reload loop on macOS 13/Node 22.11); local data lives in `../.data` outside `app/`; e2e uses Playwright driving installed Chrome (bundled Chromium unsupported on macOS 13); dev/e2e email adapter writes JSON lines to a file and is refused in production; Tailwind pinned to 4.2.4 until Node ≥ 22.12 |
