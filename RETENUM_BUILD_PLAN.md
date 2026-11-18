# Retenum — Build Plan

*Version 0.1 · 18 November 2026.*

The work is a sequence of vertical slices: each one delivers working behaviour across the database, server, domain logic and user interface, with tests. Requirement IDs refer to `RETENUM_PRD.md`; technical decisions (TD-xx) to `RETENUM_TECHNICAL_ARCHITECTURE.md`.

- **Effort** is in focused developer-days with Claude Code assistance. These are estimates, not commitments.
- **Release:** a slice marked "Releasable" can be deployed to staging for design partners to try.

## Changes from the suggested sequence (and why)

1. **Counterparty invitation is merged with the engagement draft and baseline confirmation (Slice 2).** An invitation has no value without something to confirm. This also puts the riskiest assumption, whether payers take part (R-C01), in design partners' hands as early as possible.
2. **Money primitives, the append-only event log and the outbox are built in Slice 0.** Every later slice writes history and notifications.
3. **The payment abstraction and off-platform payments come before the Paystack integration (Slice 5 before 6).** The financial record and the provider-transaction model are designed once. The provider adapter plugs in later, and live activation is gated on G-PAY anyway.
4. **Delivery comes before finance (Slice 4 before 5).** "Due on acceptance" needs acceptance to exist.
5. **Disputes span slices.** Dispute status on changes and deliveries arrives with those slices. Amount disputes arrive with finance (Slice 5). Closure and export get their own slice.

## Progress summary

| Slice | Name | Status | Effort (est.) |
|---|---|---|---|
| 0 | Foundation | ✅ Done (see log) | 3 d |
| 1 | Identity and workspaces | ✅ Done (see log) | 3 d |
| 2 | Engagement draft, counterparty invitation, baseline confirmation | ⏳ Next | 5 d |
| 3 | Changes: agreement, authorisation, valuation, versions | Not started | 5 d |
| 4 | Delivery, evidence and acceptance; party obligations | Not started | 4 d |
| 5 | Financial record, payment requests, off-platform payments, provider abstraction, amount disputes | Not started | 5 d |
| 6 | Paystack sandbox integration (payout accounts, checkout, webhooks, re-verification, reconciliation, refund events) | Not started | 5 d |
| 7 | Closure, stop notice, timeline, PDF export, dispute positions | Not started | 3 d |
| 8 | Notifications completion, reminders, minimal admin and payment console | Not started | 4 d |
| 9 | Production readiness and design-partner release | Not started | 4 d |
| | **Total** | | **≈41 d** |

---

## Slice 0 — Foundation

- **Objective:** a running, tested, deployable skeleton. Every later slice builds on its database, domain primitives, history and error conventions.
- **User value:** none directly. It is a prerequisite.
- **Requirements:** NFR-05/06/08/09 (partial), FR-HIS-02/03 (infrastructure), FR-FIN-06, SEC-03/08/10 (partial), TD-01…TD-20.
- **Dependencies:** none.
- **Frontend:** Next.js app shell, a mobile-first base layout, a status badge primitive, a health page.
- **Backend:** validated environment config; logger; typed errors; ID generator; health route; Better Auth configured (email + password) with Drizzle; outbox enqueue and dispatcher with console email; append-only event writer with hash chain.
- **Database:** Drizzle schema plus first migration: auth tables, `engagement_events`, `security_audit_log`, `outbox`; append-only triggers.
- **Security:** env validation fails fast; secrets server-only; security headers.
- **Testing:**
  - unit: money, hash chain, working days;
  - integration: migrations apply on PGlite, append-only trigger rejects UPDATE and DELETE, event chain verifies and detects tampering, outbox enqueue and dispatch, Better Auth sign-up and sign-in against PGlite.
- **Acceptance criteria:**
  - `pnpm test` passes;
  - `pnpm typecheck` passes;
  - `pnpm build` succeeds;
  - AC-HIS-1 automated.
- **Definition of done:** all of the above executed and passing; Git initialised and committed.
- **Risks:** Better Auth + PGlite compatibility (R-O02); Next.js version churn.
- **Releasable:** to staging only (no user features).

## Slice 1 — Identity and workspaces

- **Objective:** people can register, verify their email, sign in, create a workspace and invite team members.
- **User value:** UJ-1.
- **Requirements:** FR-ID-01…04, 07; FR-WS-01…04, 06, 07 (limits model); SEC-05/06; AUD-02 (auth events).
- **Dependencies:** Slice 0.
- **Frontend:** register, verify, sign-in, reset, create-workspace, members pages (mobile-first, accessible forms).
- **Backend:** workspace and member services, invitation tokens (hashed), `can()` module (workspace actions), rate limits, email templates via outbox.
- **Database:** `workspaces`, `workspace_members`, `workspace_invitations`; partial unique index enforcing one owner.
- **Security:** a token entropy test; enumeration-safe responses on reset and sign-in; role checks.
- **Testing:**
  - integration: the full registration → verification → workspace flow;
  - the invitation lifecycle (expired, reused, wrong email);
  - the one-owner invariant;
  - a permission matrix for workspace actions;
  - unverified users blocked.
- **Acceptance criteria:**
  - an unverified user cannot create a workspace;
  - an admin can invite and remove members, and a member cannot;
  - the last owner cannot leave;
  - an invitation token can be used once and expires.
- **Definition of done:** tests executed and passing; a manual run-through in the browser at a mobile width.
- **Risks:** email delivery in development (console adapter).
- **Releasable:** yes (staging).

## Slice 2 — Engagement draft, counterparty invitation, baseline confirmation

- **Objective:** an initiator creates an engagement with commitments and a payment schedule. The counterparty joins through a secure link and email code, and confirms, requests changes or declines.
- **User value:** UJ-2. **This is the first design-partner test of payer participation.**
- **Requirements:** FR-ENG-01…06, 08…10; FR-COM-01…05; FR-BAS-01…05; FR-ID-05; FR-HIS-01, 04 (basic timeline); NOT-02/03/04; AC-BAS-1/2; §17 rows for drafts and baseline.
- **Dependencies:** Slice 1.
- **Frontend:**
  - engagement list and "needs my response";
  - a draft editor (commitments, payment schedule, response windows, source document);
  - the counterparty landing page → code → baseline review with acknowledgement;
  - the engagement page skeleton (status, version, awaiting-response list, commitments, timeline).
- **Backend:**
  - engagement, party, commitment and revision services;
  - baseline submission snapshots;
  - the email-OTP flow;
  - the domain engagement state machine;
  - the unscheduled-amount check.
- **Database:** `engagements`, `engagement_parties`, `party_members`, `engagement_invitations`, `commitments`, `commitment_revisions`, `baseline_submissions`, `engagement_versions`, `files` (source document; local adapter).
- **Security:**
  - drafts are invisible to the counterparty;
  - the token is hashed, single-use, revocable and expiring;
  - OTP is attempt-limited;
  - a payer and payee in the same organisation are blocked.
- **Testing:**
  - unit: engagement state machine;
  - integration: every baseline transition; resubmission history; direct edit after v1 rejected;
  - permission matrix rows;
  - first Playwright e2e of UJ-2 (mobile + desktop).
- **Acceptance criteria:** AC-BAS-1, AC-BAS-2; the counterparty can act without a password; a revoked invitation fails.
- **Definition of done:** tests executed and passing; e2e green.
- **Risks:** R-C01 (measure it); R-P02.
- **Releasable:** **yes, to design partners** with off-platform agreements only.

## Slice 3 — Changes: agreement, authorisation, valuation, versions

- **Objective:** either side proposes changes. The other side confirms, rejects or counters; the payer authorises separately; valuations are agreed or left pending; versions are tracked.
- **User value:** UJ-3 (J2, J3).
- **Requirements:** FR-CHG-01…13; PRD §19 (V-1…V-6), §20 (C-1…C-7); FR-DSP-01 (change and valuation disputes); NOT-03/04/05 (change items); AC-CHG-1/2/3.
- **Dependencies:** Slice 2.
- **Frontend:** a change composer (operations: add, modify, remove, plus schedule effect); "Logged from conversation"; a response panel with three distinct controls and explicit copy; the "was → now" diff; version history.
- **Backend:** the change service; a pure change state machine for the three dimensions; operation application producing new commitment revisions; the stale check; working-day deadlines.
- **Database:** `changes`; versions linked to changes.
- **Security:** only the payer side can authorise; the proposer cannot confirm their own change; concurrent confirmations serialised with a row lock.
- **Testing:**
  - unit: an exhaustive transition table for all three statuses, and V-1 inclusion rules;
  - integration: the stale rule, counter chains, valuation agreed later creating a new version, removal blocked when deliveries or payments exist;
  - e2e UJ-3.
- **Acceptance criteria:** AC-CHG-1/2/3.
- **Definition of done:** tests executed and passing.
- **Risks:** R-P01 (UI comprehension).
- **Releasable:** yes.

## Slice 4 — Delivery, evidence and acceptance; party obligations

- **Objective:** the payee submits deliveries with evidence; the payer accepts, partially accepts, requests corrections or rejects. Party obligations are marked fulfilled or missed.
- **User value:** UJ-4 (J4).
- **Requirements:** FR-DEL-01…08; PRD §21; FR-COM-02; SEC-07; AUD-05; NOT-03/04 (delivery).
- **Dependencies:** Slice 2 (Slice 3 optional).
- **Frontend:** delivery submission with uploads; review panel; correction loop; issue list.
- **Backend:** delivery services; file service (pre-signed URLs, R2 adapter, SHA-256); delivery state machine.
- **Database:** `deliveries`, `delivery_responses`, `party_obligation_updates`.
- **Security:** file type and size enforcement; signed-URL expiry; files immutable.
- **Testing:**
  - unit: delivery state machine; pro-rata due calculation (AC-DEL-1);
  - integration: resubmission linkage; acceptance irreversible; upload spoofing rejected.
- **Acceptance criteria:** AC-DEL-1; evidence cannot be removed.
- **Definition of done:** tests executed and passing.
- **Releasable:** yes.

## Slice 5 — Financial record, payment requests, off-platform payments, provider abstraction, amount disputes

- **Objective:** a traceable statement with all PRD §22 figures; payment requests; off-platform payments confirmed by the payee; amount disputes isolating only the disputed amount. The provider-transaction model and the `PaymentProvider` interface, with a fake adapter for tests.
- **User value:** UJ-6, UJ-7 (J5, J6).
- **Requirements:** FR-FIN-01…07; FR-PAY-10, 11 (off-platform part); FR-DSP-01…05 (amounts); FR-PAY-03…05 infrastructure (state machine, inbox table); AC-FIN-1, AC-PAY-5.
- **Dependencies:** Slices 3 and 4.
- **Frontend:** a statement panel with drill-down; obligations list; request-payment form; record-payment and confirm-receipt panels; dispute panel with positions.
- **Backend:** `domain/financials.ts` (pure); payment request and off-platform services; payment state machine; `provider_events` inbox; fake provider.
- **Database:** `payment_requests`, `payment_transactions`, `payment_allocations`, `refunds`, `provider_events`, `disputes`, `dispute_positions`.
- **Security:** only the payee side can confirm receipt; allocation sums must equal the transaction amount (database check plus service).
- **Testing:**
  - unit: financial calculations against every PRD §22 definition and the worked examples; rounding; credit; overdue;
  - integration: report → confirm / not received; disputes not freezing other obligations; idempotent inbox with the fake provider.
- **Acceptance criteria:** AC-FIN-1, AC-PAY-5, AC-PAY-2 (with the fake provider).
- **Definition of done:** tests executed and passing.
- **Releasable:** **yes. Design partners get a complete record without provider payments.**

## Slice 6 — Paystack sandbox integration

- **Objective:** real provider payments in **test mode**: payout setup (resolve → subaccount), checkout initialization, signed webhooks, verification, re-verification of pending payments, daily reconciliation, refund events, and the live-mode guard.
- **User value:** UJ-5, UJ-9.
- **Requirements:** FR-PAY-01…09, 11, 13, 14; PRD §23–24; AC-PAY-1…4.
- **Dependencies:** Slice 5; **a Paystack test account and test keys from the founder (blocking)**.
- **Frontend:** payout account setup (payee); Pay button and amount selection; return page that polls status; failure and abandoned messages.
- **Backend:** the Paystack adapter; webhook route (raw body, HMAC); verify; cron jobs (re-verify, reconcile); amount-mismatch review queue.
- **Database:** `payout_accounts`; G-PAY flag (config table).
- **Security:** signature verification; secrets server-only; live guard (FR-PAY-14); rate limit on initiation.
- **Testing:**
  - contract tests on recorded payloads;
  - **live sandbox tests** (run only with keys; otherwise reported as skipped): initialize → test card success; decline; abandoned; duplicate webhook replay; partial refund;
  - every Paystack assumption in architecture §6 verified, with the findings recorded there.
- **Acceptance criteria:** AC-PAY-1…4 against the sandbox.
- **Definition of done:** sandbox suite executed and passing, with the architecture doc updated.
- **Risks:** R-PAY03; R-L01 (live remains gated).
- **Releasable:** yes, test mode only.

## Slice 7 — Closure, stop notice, timeline, export

- **Objective:** final account; closed-with-open-items; stop notice snapshot; full timeline filters; PDF export; dispute positions and resolution.
- **Requirements:** FR-CLS-01…04; FR-HIS-04…06; FR-DSP-03; NOT-08/09.
- **Dependencies:** Slice 5.
- **Testing:** closure state machine; snapshot correctness; late payment after closure updates the record; PDF contains every required section; hash-chain verification in export.
- **Releasable:** yes.

## Slice 8 — Notifications completion, reminders, admin

- **Objective:** all NOT-01…09 messages; working-day reminders; due and overdue notices; minimal admin (search, read-only view with access log, suspend, payment console, needs-review queue, re-verify, outbox dead letters).
- **Requirements:** FR-NOT (§25); FR-ADM-01…04, 07; AUD-02.
- **Testing:** reminder scheduling with a fixed clock; admin access logged; admin cannot mutate records (permission tests).
- **Releasable:** yes.

## Slice 9 — Production readiness and design-partner release

- **Objective:** meet the PRD §34 design-partner release criteria.
- **Work:**
  - security review checklist (architecture §12);
  - full permission matrix;
  - Playwright suite for UJ-1…UJ-9 at mobile and desktop sizes;
  - axe accessibility checks;
  - performance budget check;
  - Sentry;
  - backups and restore drill;
  - privacy notice and terms (LEG-05);
  - production deploy;
  - integration suite against a Neon branch;
  - release checklist signed.
- **Releasable:** design-partner production release (provider payments in test mode until G-PAY).

---

## Execution log

*Updated as work happens. Test results are pasted from actual runs.*

### Slice 0 — Foundation: ✅ complete (18 Nov 2026, commit `1f0ba5e`)

**Built**
- Next.js 16 + TypeScript (strict) app in `app/`.
- Validated environment config: production refuses to start without `DATABASE_URL` and a strong secret.
- Structured logger, typed errors (internal details never leaked), IDs and secret tokens (hashed).
- Drizzle schema + SQL migrations: Better Auth tables, `engagement_events`, `security_audit_log`, `outbox`.
- **Database triggers rejecting UPDATE, DELETE and TRUNCATE** on both history tables.
- Hash-chained event writer with chain verification.
- Transactional outbox with retry, back-off and dead-lettering.
- Better Auth (email + password, verification required, reset, sessions).
- `/api/health`; security headers; mobile-first base layout; status badge primitive.
- Domain primitives: money (bigint minor units, parsing, formatting, pro-rata), working-day deadlines (Lagos time, holidays), hash chain.
- CI workflow (typecheck, test, build, audit).

**Requirements satisfied (foundation level):** FR-FIN-06; FR-HIS-02; FR-HIS-03 (infrastructure); AC-HIS-1; FR-ID-01 (password length + hashing); FR-ID-02 (sign-in blocked until verified); SEC-03 (partial); SEC-06 (token generation); SEC-08 (env-only secrets); SEC-10 (headers, partial); NFR-06; NFR-09 (env separation, partial); TD-01…TD-20 (foundations).

**Tests actually run**
- `pnpm test`: **7 files, 43 tests, all passed**.
  - Unit: money, working days, hash chain, env, IDs, errors.
  - Integration on PGlite with real migrations: tables created; append-only triggers; event sequencing and per-engagement chains; rollback leaves no event; tamper detection after a simulated superuser bypass; outbox commit-only, single delivery, back-off, dead letter; auth sign-up hashing, unverified sign-in refused, verified sign-in, wrong password, short password, enumeration-safe duplicate sign-up.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- **Runtime smoke test (dev server):**
  - `/api/health` → 200 `{"status":"ok"}`;
  - sign-up → unverified user returned;
  - sign-in before verification → `403 EMAIL_NOT_VERIFIED`;
  - security headers present;
  - `next start` without `DATABASE_URL` → health 503 with a clear configuration error (intended production guard).

**Deviations and known issues**
- **Local Node is 22.11.** Vite 8 (used by Vitest 5) wants 22.12 or later, so its macOS x64 native binding had to be added manually as a dev dependency, and Tailwind was pinned to 4.2.4 (4.3 needs `require(esm)` from Node 22.12). **Recommendation: upgrade local Node to 22.12+**, then remove the manual binding and unpin Tailwind.
- ESLint is not configured yet; type checking is the only static check. Add it in Slice 1 or 9.
- Duplicate sign-up returns a normal-looking response (Better Auth's enumeration protection when verification is required). Tested: no second account, original unchanged.
- The CI workflow is committed, but no GitHub remote exists yet, so CI has never run.
- `engagement_events.engagement_id` has no foreign key yet. It gets one in Slice 2.

### Slice 1 — Identity and workspaces: ✅ complete (18 Nov 2026)

**Built**
- Registration, email verification (link), sign-in, sign-out, forgot/reset password (server actions over Better Auth, `nextCookies`).
- Open-redirect-safe `next` parameter; identical message for unknown email and wrong password.
- Workspaces (business/individual), membership roles, deny-by-default workspace policy matrix, invitations (hashed single-use tokens, 7-day expiry, email-bound acceptance, revocation).
- Role change, removal, leave, ownership transfer; one-owner invariant enforced by a partial unique index; plan seat limits (pending invitations count); 20 invitations/hour per workspace; security audit log for every workspace and auth-relevant change.
- Mobile-first, accessible pages: labelled fields, announced errors, text-based status badges, kept form values after failed submits (never passwords).
- Email delivery: console / file (dev and e2e only) / Resend; production refuses non-Resend modes; outbox sent after each action and after auth API requests; `/api/cron/outbox` retry endpoint protected by `CRON_SECRET`.
- Playwright end-to-end suite driving installed Chrome, mobile (Pixel 7) and desktop.

**Requirements satisfied:** FR-ID-01, 02, 03, 04, 07 (production rate limit via Better Auth; invitation limit in service); FR-WS-01, 02, 03, 04, 06, 07 (seats; engagement limit applies from Slice 2); SEC-05 (partial), SEC-06; AUD-02 (workspace/auth events); PRD §17 workspace rows; NFR-01/02 (key pages).

**Tests actually run**
- `pnpm test`: **8 files, 88 tests, all passed**. Includes a 28-case workspace permission matrix; workspace creation (verified only, owner, audit, validation, non-members get NOT_FOUND); invitations (free-plan seat limit, token hashed, single use, wrong email refused, expired/revoked/invalid, duplicates, members cannot invite, pending counts toward seats); roles/removal/leave/transfer; database refuses a second owner; password reset end to end; reset does not reveal account existence; production email-mode guard.
- `pnpm test:e2e` (Chrome 157): **8 passed** (4 scenarios × mobile and desktop): UJ-1 (validation messages → sign-up → unverified sign-in refused → anonymous redirect → verify via emailed link → create workspace → seat-limit message → owner cannot leave → sign out → wrong password message with email kept → sign in); password reset via emailed link; invalid invitation link; no horizontal scroll on key pages.
- `pnpm typecheck` passed; `pnpm build` passed.
- `pnpm audit --audit-level high`: no high/critical. One **moderate** advisory in esbuild via drizzle-kit (development tool only, not shipped).

**Bugs found and fixed during verification**
1. Turbopack dev server reload-looped (~10 full reloads/second) on this machine (macOS 13, Node 22.11), interrupting every form. Isolated by elimination (not data files, not config root); webpack dev mode does not loop. **`pnpm dev` and e2e now use `next dev --webpack`**; production build still uses Turbopack. Revisit after upgrading Node/macOS.
2. Local data (`.data/`) moved outside `app/` (`../.data/`) so database/email writes never trigger dev reloads.
3. Emails queued by direct auth API calls were only sent by cron; the auth route now sends after each request.
4. Failed submissions wiped typed values (React 19 form reset); the form now keeps non-secret values.

**Known gaps (carried forward)**
- Invitation **acceptance** is verified by integration tests, not yet in the browser suite (the free plan has 1 seat and there is no admin UI to change plans; add once admin tooling exists in Slice 8).
- No ESLint yet. TOTP 2FA (FR-ID-08, S) and multi-workspace switcher polish (FR-WS-05, S) not built.
- Better Auth's built-in rate limiting is enabled only in production and uses in-memory storage — must switch to database storage before running more than one server instance (R-S02).
- CI has still never run (no remote).
