# Retenum — Product Requirements Document (MVP)

*Version 0.3 · 18 November 2026 (adds §16a visual design, UI/UX and PWA; payment provider: Bachs; provider integration built last) · Status: draft for build. Decisions referenced as D-xx are in `RETENUM_PRODUCT_DECISIONS.md`, risks as R-xx in `RETENUM_RISK_REGISTER.md`. No customer validation has happened yet (D-00). Every requirement marked **[H]** rests on an untested hypothesis.*

**Priority (MoSCoW):** **M** = must have for design-partner release · **S** = should have before general release · **C** = could have · **W** = won't have in the MVP.
**Requirement IDs** are stable. Code and tests reference them (e.g. `FR-CHG-04`).

---

## 1. Product overview

Retenum gives two parties to a paid engagement one shared record. It covers what was agreed, every change (and whether it was agreed, authorised and priced), what was delivered and accepted, what is owed, and what has been paid. Payments can be made through a licensed provider, or recorded when made elsewhere. Every number on the financial statement traces back to a commitment or a transaction.

## 2. Problem statement

When one party pays another for work, the agreement drifts. Changes are agreed in calls and chats, permission to proceed is given before a price is agreed, completion is contested, and payments are made without a clear link to what they pay for. Each side reconstructs history from scattered messages when it matters most. The result is unbilled work, surprise costs, disputes and slow payment. The evidence is in Phase 1 §2 and is desk research: UK, US and vendor surveys, nothing Nigeria-specific yet (O-01). Phase 1 found the part a record can fix is **unconfirmed commitments**. It found late payment caused by **cash or power imbalance** is largely outside a record's influence.

## 3. Product vision

Every commercial engagement, in any industry, has one trusted, neutral record that both parties rely on from first agreement to final payment. MVP horizon: one market (client-service firms), one jurisdiction (Nigeria), two parties per engagement.

## 4. Positioning

**For** client-service businesses and their clients **who** lose money and time to unpriced changes, contested sign-off and unclear balances, **Retenum is** a shared commercial record with connected payments **that** connects what was agreed, changed, authorised, delivered and paid. **Unlike** project tools, invoicing tools or contract tools, which belong to one side, Retenum is neutral. Both parties have the same powers, and confirmed history can't be rewritten by either. **Not:** project management, accounting, contract generation, marketplace, escrow, payment gateway or dispute authority (D-03).

## 5. Target customers

- **Paying customer:** the business that initiates engagements. Launch: agencies, studios and consultancies, 2–50 staff, in Nigeria (D-10, D-20). **[H]**
- **Participating counterparty (free):** the other party, usually the client business. Sometimes the initiator is the client and the counterparty is the service firm.
- **Not served in the MVP:** consumers as primary users, construction subcontracting, goods supply (D-12).

## 6. Initial market

Client-service firms and their business clients in Lagos, Nigeria. The rationale and its weaknesses are in D-10. This is a launch **hypothesis**. Design-partner data (§30) decides whether it holds.

## 7. Personas and roles

| Persona | Side | Description | Key need |
|---|---|---|---|
| **Ada, agency owner** | Usually payee, initiator | Runs a 12-person agency. Quotes in PDFs, agrees changes on WhatsApp, chases invoices | Get paid for every agreed extra. Know exactly what's due |
| **Tunde, account lead** | Payee team member | Manages client delivery | Log changes and deliveries quickly, from a phone |
| **Ngozi, client marketing manager** | Payer, counterparty | Hires agencies. Answers to finance | No surprise costs. Approve only what she agreed. Simple proof for finance |
| **Femi, client finance officer** | Payer team member (S) | Pays suppliers | A clear statement of what's due and why |
| **Retenum operator** | Internal | Support and operations staff | Investigate payment issues without altering records |

**System roles**
- **Workspace roles:** `owner`, `admin`, `member`.
- **Engagement party roles:** `payer` / `payee`.
- **Party authority:** `approver` (can confirm, reject, authorise, accept, confirm receipt) vs `contributor` (can draft, propose and submit, but not confirm on behalf of the party).
- **Internal role:** `platform_admin`.

## 8. Core jobs to be done

| JTBD | Who |
|---|---|
| J1 "When we agree a job, I want us both to confirm exactly what's included and how it will be paid, so we don't argue later" | Both |
| J2 "When the client asks for something extra, I want it agreed and priced before (or explicitly while) I do it" | Payee |
| J3 "When I let work proceed before the price is settled, I want that recorded as permission, not as agreeing to any price" | Payer |
| J4 "When I deliver, I want a clear acceptance or a clear reason why not" | Payee |
| J5 "When I pay, I want to pay against a specific obligation and have it recorded both sides" | Payer |
| J6 "At any moment, I want to know what's agreed, due, paid, outstanding and disputed" | Both |
| J7 "At the end, I want a final account we both confirm, or a precise list of what's still open" | Both |

## 9. Business model

B2B SaaS. The initiating workspace pays a subscription priced by active engagements. Counterparties participate free and without limits (D-30 to D-32). Payment revenue is off at launch (D-30, D-34).

## 10. Revenue model

| Stream | MVP status | Notes |
|---|---|---|
| Subscription (Free / Pro / Business, test prices in D-33) | Plans enforced as **limits in the product**. **Billing is not built**; design partners are invoiced manually | `FR-WS-07` |
| Payment fee per provider payment | **W** in the MVP. The architecture allows a flat split fee later (D-34) | Gated by G-PAY |

## 11. Product principles

| ID | Principle |
|---|---|
| P-1 | **Nothing is agreed until both confirm.** Drafts and proposals are visibly unconfirmed |
| P-2 | **History is added to, never edited.** Corrections are new entries |
| P-3 | **Same powers for both sides.** Paying for Retenum buys workspace tools, never power over the shared record |
| P-4 | **Agreement, authorisation and valuation are different things** and are shown separately |
| P-5 | **Silence is recorded, not interpreted.** No deemed outcomes |
| P-6 | **Money is "paid" only on verified evidence:** a provider-verified event, or the payee confirming an off-platform payment |
| P-7 | **Every number is traceable** to the commitment, change or transaction that produced it |
| P-8 | **Disputes isolate, not freeze.** Disputing one amount never blocks unrelated amounts |
| P-9 | **Retenum records. It doesn't judge.** No verdicts, no legal claims about the record |
| P-10 | **Workflow over dashboards.** The engagement and its open items are the home screen. No decorative charts |

## 12. MVP scope (summary)

**In:**
- Accounts, workspaces and team.
- Counterparty invitation with lightweight access.
- Engagements with commitments and a payment schedule.
- Two-party baseline confirmation.
- Changes with separate agreement, authorisation and valuation.
- Versions.
- Delivery with evidence, and acceptance (full or partial, correction, rejection).
- Disputes as status.
- Financial statement.
- Payment requests.
- Provider payments through Bachs (**built last**, D-50; sandbox until G-PAY).
- Off-platform payments with confirmation.
- Refund recording.
- Timeline and export.
- Closure.
- Email notifications.
- Minimal internal admin.

## 13. Explicit exclusions (W)

- Escrow, conditional release, wallets or stored balances (D-24, D-25).
- Retention, progress-percentage billing, statutory notices, deemed acceptance (D-42, D-44).
- Multi-party and linked engagements (D-40).
- Tasks, scheduling and chat.
- Bookkeeping and tax invoices (O-07).
- Contract drafting.
- In-app subscription billing.
- Ratings and reputation.
- AI extraction of scope.
- Native mobile apps (the web app is mobile-first).
- SMS and WhatsApp notifications (C after MVP).
- Retenum-initiated refunds before G-PAY item 2.

---

## 14. User journeys

**UJ-1 Set up (payee initiator):** Ada registers → verifies email → creates the workspace "Ada Studio" → invites Tunde as a member.

**UJ-2 Create and confirm an engagement:**
1. Ada creates "Q1 Campaign for Kola Foods." She is the payee; the currency is NGN.
2. She adds commitments: 3 concepts (₦600k), 2 revision rounds (included), launch assets (₦900k). She adds a client obligation: "Brand assets by 10 Jan."
3. She sets the payment schedule: 40% on confirmation, 30% on acceptance of concepts, 30% on acceptance of launch assets.
4. She sets response windows (3 working days for changes, 5 for deliveries).
5. She attaches the signed quote PDF and invites Ngozi (ngozi@kolafoods.ng) as the payer representative.
6. Ngozi opens the link → enters the email code → sees the baseline → confirms.
7. The engagement becomes **Active, v1**. The deposit obligation becomes **Due**.

**UJ-3 Change with authorisation before valuation:**
1. Ngozi asks for a radio script.
2. Tunde proposes change CH-1: add "Radio script (30s)", price ₦150k, no date change, added to the final payment.
3. Ngozi needs it urgently but thinks ₦150k is high. She **authorises the work** and **disputes the valuation**, counter-offering ₦100k.
4. The change's scope is agreed and authorised; its valuation is pending, with the payee asking ₦150k and the payer offering ₦100k.
5. The statement shows **"Authorised, valuation pending: ₦100k–₦150k"**, outside the agreed value.
6. Ada accepts ₦120k after negotiation, through a counter that Ngozi confirms → valuation agreed → **v2**, and the agreed value rises by ₦120k.

**UJ-4 Delivery and partial acceptance:** Tunde submits "3 concepts" with files. Ngozi **partially accepts**: 2 of 3 accepted, 1 needs correction. The concepts payment obligation becomes due pro-rata (2/3 of 30%). Tunde resubmits the third concept → accepted → the remainder becomes due.

**UJ-5 Pay through the provider:** Ngozi opens the due obligation → **Pay ₦X** → Bachs hosted checkout (sandbox before G-PAY) → returns to Retenum, which shows "Payment processing." The webhook arrives and server verification confirms it → **Paid**. Both parties are notified.

**UJ-6 Off-platform payment:** Femi pays by bank transfer. Ngozi records "₦480,000 transfer, 12 Feb, ref 0034…" against the deposit → **Reported, awaiting confirmation**. Ada confirms receipt → **Paid**. If Ada says it was not received, it shows **"Payee reports not received,"** visible to both.

**UJ-7 Dispute:** Ngozi disputes ₦50k of an obligation (claiming a missed deadline caused extra cost). The disputed portion is shown separately and the undisputed remainder stays due. Ada records her position. They resolve it by agreeing a confirmed change (a deduction).

**UJ-8 Close:** Ada proposes a final account. Ngozi confirms → **Closed – agreed**. Or Ngozi disputes one line → Ada closes it as **Closed – with open items**, listing the line.

**UJ-9 Payment failure:** Ngozi starts a payment, then abandons checkout. The transaction stays **Pending** → verification after the time-out shows it wasn't successful → **Abandoned**. The obligation is still due, and Ngozi can retry.

---

## 15. Functional requirements

### 15.1 Identity and workspaces (FR-ID, FR-WS)

| ID | Requirement | P |
|---|---|---|
| FR-ID-01 | Users register with name, email and password. Passwords are hashed with a modern algorithm (argon2id or scrypt). Minimum length 10 characters, checked against a common-password list | M |
| FR-ID-02 | Email verification is required before creating a workspace or acting on an engagement | M |
| FR-ID-03 | Login and logout. Sessions use secure, httpOnly cookies. Idle expiry 7 days; absolute expiry 30 days | M |
| FR-ID-04 | Password reset by emailed single-use link, valid 30 minutes | M |
| FR-ID-05 | **Lightweight counterparty identity:** an invitation link plus a 6-digit email code (valid 10 minutes, max 5 attempts, stored hashed) creates a passwordless user bound to the email address (D-43). The link is the counterparty's way back in, so it stays usable until revoked (each resend or new submission revokes earlier links), but **it never grants access by itself**: every use requires a fresh code sent to the invited email | M |
| FR-ID-06 | A lightweight user can later set a password and create a workspace without losing access | S |
| FR-ID-07 | Rate limits on login, registration, password reset and code endpoints | M |
| FR-ID-08 | Two-factor authentication (TOTP) for workspace owners and admins | S |
| FR-WS-01 | A verified user can create a workspace (business name, optional registration number, address, contact email). The creator is `owner` | M |
| FR-WS-02 | Workspace types: `business` or `individual` (sole practitioner). Same capabilities | M |
| FR-WS-03 | The owner or an admin invites members by email, with role `admin` or `member`. Invitations expire after 7 days | M |
| FR-WS-04 | The owner or an admin changes roles or removes members. A workspace must always have exactly one owner. Ownership can be transferred | M |
| FR-WS-05 | Users can belong to several workspaces and switch between them | S |
| FR-WS-06 | Removing a member does not alter any record they authored. Their past actions keep their name | M |
| FR-WS-07 | Plan limits by active engagements and seats (D-33). Exceeding a limit blocks *creating* new engagements or seats, never responding to or closing existing ones | M |

### 15.1a Onboarding (FR-ONB) — founder requirement, 19 Nov 2026

| ID | Requirement | P |
|---|---|---|
| FR-ONB-01 | A verified user who belongs to no workspace is sent to onboarding from every app screen and cannot use the app until they create a workspace. **Exception (Slice 2):** a counterparty-only user (invited to confirm an engagement, D-43) is never forced to create a workspace; they land on that engagement | M |
| FR-ONB-02 | Onboarding is two steps: (1) set up the business (create the workspace), (2) create the first engagement. After step 1 the user lands on the Overview with a "Your workspace is ready" message and a prominent "New engagement" action | M |
| FR-ONB-03 | Users who already belong to a workspace never see onboarding. Invited colleagues join through their invitation link instead of creating a workspace | M |

### 15.2 Engagements and parties (FR-ENG)

| ID | Requirement | P |
|---|---|---|
| FR-ENG-01 | A workspace member creates an engagement with a title, description, currency (NGN in the MVP) and **initiator role** (payer or payee) | M |
| FR-ENG-02 | The counterparty is identified by organisation name, representative name and representative email. If that email belongs to a user in an existing workspace, they may link it on acceptance | M |
| FR-ENG-03 | The engagement is a **Draft**, visible only to the initiator's workspace, until submitted | M |
| FR-ENG-04 | Optional source document upload (PDF, image, DOCX up to 20 MB) with a "governing document" note (D-45). *Built in Slice 4 with the file storage used for delivery evidence; the governing-document clause is already shown at confirmation* | M |
| FR-ENG-05 | Response windows (working days) for: baseline, changes, deliveries, payment confirmations. Defaults 5 / 3 / 5 / 3. Shown to both before confirmation and part of the baseline | M |
| FR-ENG-06 | Party authority: each side designates which of its people are `approver`s. The initiator defaults to the creator. The counterparty representative is automatically an approver | M |
| FR-ENG-07 | A counterparty approver can add colleagues from their organisation as approver or contributor | S |
| FR-ENG-08 | Engagement statuses: `draft` → `awaiting_confirmation` → `active` → `closed_agreed` / `closed_open_items`. Plus `stopped`, and `withdrawn` (only from draft or awaiting_confirmation) | M |
| FR-ENG-09 | The engagement page shows, in order: status and version; **items awaiting my response**; the financial statement; commitments; changes; deliveries; payments; timeline | M |
| FR-ENG-10 | A list of the user's engagements across workspaces, filterable by status and "needs my response" | M |
| FR-ENG-11 | "New engagement" is always available on the Overview (header) and the Engagements page, whether or not there are active engagements. When the plan limit is reached the action stays visible, and attempting it explains the limit (FR-WS-07) instead of hiding the option | M |
| FR-ENG-12 | No empty engagements: the creation flow does not leave a blank engagement behind. A draft exists only once it has a title and counterparty, and it can't be sent for confirmation until it has at least one priced commitment and a payment schedule | M |

### 15.3 Commitments and baseline (FR-COM, FR-BAS)

| ID | Requirement | P |
|---|---|---|
| FR-COM-01 | A commitment has: kind (`deliverable`, `party_obligation`, `payment_obligation`), owed-by side, title, description, quantity + unit (optional), definition of done (deliverables), due date (optional), price in minor units (deliverables; optional, since "included" items may be 0), exclusions (optional) | M |
| FR-COM-02 | `party_obligation` captures things either side must provide (e.g. client provides brand assets by date). Tracked with status: open, fulfilled (confirmed by the other side), missed (recorded by the other side) | M |
| FR-COM-03 | A `payment_obligation` has an amount, a **trigger**, optional **terms** (days after trigger), and optional linked deliverable(s). Triggers: `on_confirmation`, `on_date`, `on_acceptance` (of linked deliverables), `on_request` (due when the payee issues a payment request) | M |
| FR-COM-04 | Payment obligations triggered `on_acceptance` have **pro-rata on partial acceptance** (default on) | M |
| FR-COM-05 | The payment schedule total is compared with agreed value. Any difference is shown as **"Unscheduled amount"** to both parties. Submission is allowed but shows a warning | M |
| FR-BAS-01 | The initiator submits the draft for confirmation. A **baseline proposal** snapshot is created and the counterparty is notified | M |
| FR-BAS-02 | The counterparty approver can: **Confirm** (engagement → active, v1); **Request changes** (with comments; the engagement returns to the initiator to edit and resubmit, and the previous submission stays in history); or **Decline** (engagement → withdrawn, with reason) | M |
| FR-BAS-03 | Before confirmation, the initiator may edit and resubmit. Each submission is a new snapshot. Only the latest is open | M |
| FR-BAS-04 | Confirmation requires an explicit acknowledgement checkbox showing the governing-document clause (D-45) and the response rules | M |
| FR-BAS-05 | After v1, **no direct edits** to commitments by anyone. All changes go through FR-CHG | M |

### 15.4 Changes (FR-CHG)

| ID | Requirement | P |
|---|---|---|
| FR-CHG-01 | Either side's approver or contributor can draft a change. Only an approver can **send** it | M |
| FR-CHG-02 | A change contains one or more operations: **add** commitment; **modify** commitment fields (quantity, price, definition of done, due date, owed-by, description); **remove** commitment; **add or modify** a payment obligation. Each operation stores the **was** values captured at proposal time | M |
| FR-CHG-03 | Required: reason category (client request, discovered issue, supplier issue, error, missed party obligation, other) + reason text. Optional: time effect (days), evidence | M |
| FR-CHG-04 | **Three separate statuses** per change: `agreement_status`, `authorisation_status`, `valuation_status` (§19) | M |
| FR-CHG-05 | The proposer may mark the change **"Logged from a conversation"** with the date and channel ("confirm what we discussed") | M |
| FR-CHG-06 | The responding approver can: confirm the change in full; reject it; counter (creating a linked new proposal; the original becomes `countered`); **authorise work only**; and/or set valuation to agreed, propose an alternative figure, or dispute it | M |
| FR-CHG-07 | The payer side may grant authorisation independently of agreement, including on its own proposals. Authorisation can be **withdrawn** going forward. Withdrawal is recorded with a time and does not erase prior authorisation | M |
| FR-CHG-08 | The proposer may **withdraw** a change before any response | M |
| FR-CHG-09 | **Stale proposal rule:** if any commitment a change modifies has been changed by another confirmed change since this one was proposed, confirmation is blocked and the change is marked `stale`. The proposer must re-propose against the current version | M |
| FR-CHG-10 | Confirmed scope changes create a new **engagement version**. A valuation becoming agreed later also creates a new version. Authorisation alone does not | M |
| FR-CHG-11 | The payee may record **"work started before authorisation"** on a change. Shown to both. It never implies payment is owed | M |
| FR-CHG-12 | A side-by-side "was → now" view for every version and change | M |
| FR-CHG-13 | Deductions (e.g. payer claims a credit) are changes that reduce a price or obligation. They follow the same rules | M |

### 15.5 Delivery and acceptance (FR-DEL)

| ID | Requirement | P |
|---|---|---|
| FR-DEL-01 | A payee-side member submits a delivery against one or more deliverables, with a note, a claimed portion (full, or quantity, or amount) and evidence attachments | M |
| FR-DEL-02 | Evidence: up to 20 files per submission, 20 MB each. Types PDF, JPG, PNG, WEBP, HEIC, DOCX, XLSX, PPTX, MP4 (≤100 MB, S). A SHA-256 hash is recorded. Evidence can't be removed once submitted, only added to | M |
| FR-DEL-03 | The payer approver responds: **Accept**, **Accept with issues** (an issue list; counts as accepted), **Partially accept** (quantity or amount accepted, ≤ claimed), **Request correction** (reason), or **Reject** (reason referencing the definition of done) | M |
| FR-DEL-04 | Resubmission after a correction or rejection creates a new submission linked to the previous one. The loop count is visible | M |
| FR-DEL-05 | Either side can **raise an issue after acceptance** (e.g. a defect found later). It's recorded, and acceptance stays in history | S |
| FR-DEL-06 | Party obligations: the side owed the obligation can mark it **fulfilled** or **missed**, and the other side can dispute that | M |
| FR-DEL-07 | No response by the deadline → status "**Response overdue**" plus reminders. Never auto-accepted (D-42) | M |
| FR-DEL-08 | Either side can **dispute** a delivery response (§21) | M |

### 15.6 Financial record (FR-FIN)

| ID | Requirement | P |
|---|---|---|
| FR-FIN-01 | Statement figures per §22, always calculated from records, never typed in | M |
| FR-FIN-02 | Every figure is clickable down to its contributing items (commitments, changes, obligations, transactions) | M |
| FR-FIN-03 | **Payment requests:** a payee approver can request payment of a due (or `on_request`) obligation, fully or partly, with an optional external invoice number and PDF. Requests can be cancelled | M |
| FR-FIN-04 | Disputes on obligations specify an **amount** (≤ outstanding). Only that amount is "disputed." The remainder stays due and payable | M |
| FR-FIN-05 | Overdue: outstanding amounts on obligations past their due date. Days overdue shown | M |
| FR-FIN-06 | All money is stored as integer minor units (kobo for NGN) with an ISO 4217 currency. One currency per engagement | M |
| FR-FIN-07 | Overpayment on an obligation is shown as **credit** on the engagement, never silently reallocated | M |
| FR-FIN-08 | CSV export of the statement and transactions | S |

### 15.7 Payments (FR-PAY)

| ID | Requirement | P |
|---|---|---|
| FR-PAY-01 | A payer-side member can **Pay** a due obligation (or an open payment request), for any amount between the provider minimum and the outstanding amount | M |
| FR-PAY-02 | The server creates a **payment transaction** (status `initiated`) with a unique Retenum reference, then initializes the provider checkout. The user is redirected to the provider-hosted page. Retenum never collects card data | M |
| FR-PAY-03 | Payment status changes only from: a signed provider webhook that passes signature checks **and** a server-side verification call confirming the amount, currency and reference; or a scheduled reconciliation verifying status. The browser return URL **never** changes status | M |
| FR-PAY-04 | Webhook processing is **idempotent**. Each provider event is stored once (unique on provider plus event key). Repeats are acknowledged and ignored | M |
| FR-PAY-05 | Out-of-order events: status moves only forward along allowed transitions (§23). Late or older events are recorded but don't reverse a later state | M |
| FR-PAY-06 | Pending transactions older than 30 minutes are re-verified. If the provider reports them unsuccessful or not found, they become `abandoned` or `failed` | M |
| FR-PAY-07 | Amount mismatch (provider amount ≠ initiated amount) → the transaction becomes `needs_review`, is not counted as paid, and an admin alert is raised | M |
| FR-PAY-08 | **Settlement destination:** each payee workspace has a Bachs **sub account**, created by Retenum through hosted onboarding. Charges use the **direct** shape, so the sale (and any refund or lost dispute) belongs to the payee's sub account (D-23). The balance is withdrawn only to the payee's own verified bank account on an automatic schedule (D-29a). **GATED: G-PAY for live mode** | M (sandbox) |
| FR-PAY-09 | Payee payout setup uses Bachs hosted onboarding for the sub account's details and payout bank account. The payee must see and confirm the bank account name before payouts are enabled. Retenum stores only the provider account id and the last 4 digits | M |
| FR-PAY-16 | The payment adapter exposes only: create direct charge, retrieve charge, refund (gated), create or onboard sub account, and withdraw to the payee's verified bank account. **No transfer from a payee balance to any other destination** exists in the code (D-29a). An automated test asserts this | M |
| FR-PAY-10 | **Off-platform payments:** a payer approver records amount, date, method, reference and an optional proof file against one or more obligations → `reported`. A payee approver confirms → `confirmed` (counts as paid) or rejects with a reason → `not_received` (not paid, visible) | M |
| FR-PAY-11 | **Refunds:** provider refund events (`refund.processed`, `refund.failed`, etc.) are recorded as refund records linked to the transaction. Processed refunds reduce "paid." Off-platform refunds are recorded by the payee and confirmed by the payer | M |
| FR-PAY-12 | In-app refund initiation by the payee (full or partial) through the provider. Because Bachs reportedly allows one refund operation per charge, the UI warns that a partial refund closes further refunds on that charge | S, GATED (D-26) |
| FR-PAY-13 | Reconciliation job (daily): verifies every non-final transaction from the last 7 days and flags differences between provider and Retenum | M |
| FR-PAY-14 | Live mode can be switched on **only** via server configuration by a platform admin, after the G-PAY checklist is recorded as complete | M |
| FR-PAY-15 | Payee-supplied external payment link on a payment request (D-29 fallback) | C |

### 15.8 History, timeline and export (FR-HIS)

| ID | Requirement | P |
|---|---|---|
| FR-HIS-01 | Every state-changing action writes an **engagement event**: actor (user and side), action, target, before and after summary, timestamp (UTC), request metadata (IP hash, user agent) | M |
| FR-HIS-02 | Events are **append-only**, enforced by the database (no update or delete) | M |
| FR-HIS-03 | Events are **hash-chained** per engagement, so tampering is detectable. Described as "tamper-evident," never "tamper-proof" (D-47) | S |
| FR-HIS-04 | A human-readable timeline, filterable by type (agreement, changes, deliveries, money, disputes) | M |
| FR-HIS-05 | Either party can export a **PDF engagement record**: baseline, versions, changes with all three statuses, deliveries, statement, transactions, disputes and timeline. The footer states what the record is and is not | M |
| FR-HIS-06 | Removed users and closed workspaces never cause history to disappear for the other party | M |

### 15.9 Disputes (FR-DSP)

| ID | Requirement | P |
|---|---|---|
| FR-DSP-01 | Either side's approver can open a dispute on: a change (or its valuation), a delivery response, a party-obligation status, an obligation amount, or an off-platform payment status | M |
| FR-DSP-02 | A dispute records the target, the disputed amount (if financial), the raising side's position, and evidence. The other side can add its position and evidence | M |
| FR-DSP-03 | Statuses: `open` → `resolved_by_agreement` (resolution text, confirmed by both) / `withdrawn` (by the raiser) / `unresolved_at_close` | M |
| FR-DSP-04 | Disputes never alter the agreement, block unrelated actions, or block payment of the disputed amount if the payer chooses to pay | M |
| FR-DSP-05 | Retenum displays no verdicts, scores or recommended outcomes | M |

### 15.10 Closure (FR-CLS)

| ID | Requirement | P |
|---|---|---|
| FR-CLS-01 | Either approver can propose a **final account**: a snapshot of agreed value, changes, due, paid, outstanding, disputed, credit and open items | M |
| FR-CLS-02 | The other side confirms → `closed_agreed`, or disputes specific lines. After a dispute, or no response past the window, the proposer can close as `closed_open_items`, and the open items are listed | M |
| FR-CLS-03 | **Stop notice:** either approver can record that the engagement has stopped (with date and reason). It freezes a snapshot. The engagement becomes `stopped`. Payments, payment confirmations, disputes and closure are still allowed | M |
| FR-CLS-04 | Closed engagements are read-only except for: recording late payments against outstanding obligations, confirming them, and adding positions to disputes left `unresolved_at_close` | M |

### 15.11 Notifications (FR-NOT)

See §25.

### 15.12 Admin (FR-ADM)

See §29.

---

## 16. Non-functional requirements

| ID | Requirement | P |
|---|---|---|
| NFR-01 | Mobile-first responsive progressive web app. Fully usable at 320 px width. Excellent at desktop widths (see DES-08, PWA-01…08) | M |
| NFR-02 | Accessibility: WCAG 2.2 AA. Keyboard-operable. Statuses never conveyed by colour alone | M |
| NFR-03 | Performance: server p95 under 500 ms for page data. Engagement page under 200 KB JavaScript on first load (target, for low-bandwidth users) | S |
| NFR-04 | Availability target 99.5% monthly (design-partner phase) | S |
| NFR-05 | Data durability: managed Postgres with point-in-time recovery of 7 days or more, plus daily logical backups retained 30 days. File storage with versioning | M |
| NFR-06 | All timestamps stored in UTC and displayed in the user's time zone (default Africa/Lagos) | M |
| NFR-07 | English UI. Number and currency formatting by locale (en-NG) | M |
| NFR-08 | Observability: structured logs, error tracking, payment-event metrics | M |
| NFR-09 | Separate development, staging (provider test mode) and production environments, with separate credentials | M |

## 16a. Visual design, UI/UX and PWA requirements

Binding detail: `RETENUM_DESIGN_SYSTEM.md` (tokens, components, status grammar, quality gate) and `RETENUM_UI_UX_SPECIFICATION.md` (information architecture, screens, patterns, offline).

| ID | Requirement | P |
|---|---|---|
| DES-01 | Strictly monochrome identity: black, white and neutral greys only. No brand accent, gradients, decorative illustrations or heavy shadows | M |
| DES-02 | Light, dark and system themes, user-selectable in Settings → Appearance | M |
| DES-03 | Theme preference persists across sessions (cookie, no flash on first paint) and across devices (saved to the account, applied at sign-in) | M |
| DES-04 | Semantic design tokens only. No raw colours in components | M |
| DES-05 | Money shown with tabular figures, full precision and explicit currency, never colour-coded | M |
| DES-06 | Statuses use the status grammar (icon + label + style). Agreement, authorisation, valuation, delivery, acceptance and payment are never merged into one indicator | M |
| DES-07 | Shared component library (design system §7). Screens may not introduce one-off component styling | M |
| DES-08 | Responsive layouts verified at 320, 390, 768, 1024, 1280 and 1536 px. Mobile uses bottom navigation, stacked tables and a reachable primary action. Desktop uses a persistent sidebar and the engagement right rail | M |
| DES-09 | WCAG 2.2 AA in both themes, verified with automated axe checks in each UI slice | M |
| DES-10 | Design quality gate (design system §11) is part of every UI slice's definition of done | M |
| DES-11 | Information architecture: Overview, Engagements, Payments, Activity, Business, Settings. The engagement workspace has six sections (Overview, Agreement, Changes, Delivery, Payments, Activity) and a header showing name, other party, status, agreed value, paid and outstanding | M |
| DES-12 | The Overview shows actionable information only (active engagements, due, outstanding, received, awaiting confirmation, changes awaiting authorisation, deliveries awaiting acceptance, recent activity), each item linking to its source. No decorative charts | M |
| PWA-01 | Web app manifest, installable on supported mobile and desktop browsers, with icons (192, 512, maskable, Apple touch) and splash configuration | M |
| PWA-02 | Service worker: cache-first for versioned static assets; network-only for pages, actions and APIs; offline fallback page | M |
| PWA-03 | Network status banner (offline / back online) | M |
| PWA-04 | Update handling: a waiting new version is offered with "Reload to update". No forced reloads | M |
| PWA-05 | No caching of authenticated pages or financial data in the MVP. Balances are always computed by the server from verified records | M |
| PWA-06 | While offline, no confirmation, payment or record can be submitted. Nothing is shown as complete before the server acknowledges it | M |
| PWA-07 | No automatic queueing or replay of commercial actions after reconnecting (offline actions can never silently overwrite server records) | M |
| PWA-08 | Installability and basic offline behaviour are covered by automated browser tests | M |

## 17. Permissions and access control

Every server action passes through an authorisation policy. Policy: **deny by default**.

| Action | Initiator approver | Initiator contributor | Counterparty approver | Counterparty contributor | Platform admin |
|---|---|---|---|---|---|
| View engagement (non-draft) | ✓ | ✓ | ✓ | ✓ | ✓ read-only, logged |
| Edit draft / submit baseline | ✓ | draft only | — | — | — |
| Confirm / decline baseline | — | — | ✓ | — | — |
| Draft change | ✓ | ✓ | ✓ | ✓ | — |
| Send change | ✓ | — | ✓ | — | — |
| Respond to the other side's change | ✓ | — | ✓ | — | — |
| Authorise work | payer side only | — | payer side only | — | — |
| Submit delivery | payee side | payee side | payee side | payee side | — |
| Respond to delivery | payer side | — | payer side | — | — |
| Request payment | payee side | — | payee side | — | — |
| Pay / record off-platform payment | payer side | payer side (record: S) | payer side | payer side (record: S) | — |
| Confirm receipt | payee side | — | payee side | — | — |
| Open dispute / add position | ✓ | — | ✓ | — | — |
| Propose final account / stop notice | ✓ | — | ✓ | — | — |
| Export record | ✓ | ✓ | ✓ | ✓ | ✓ (logged) |
| Alter any confirmed record | ✗ | ✗ | ✗ | ✗ | **✗** |

*"Payer side" and "payee side" depend on the engagement's roles, not on who initiated it. No role, including platform admin, can edit or delete events, confirmed entries, evidence or transactions.*

## 18. Commercial engagement lifecycle

```
draft ──submit──► awaiting_confirmation ──confirm──► active ──final account confirmed──► closed_agreed
  ▲                   │ request changes                │  └─ proposer closes w/ open items ──► closed_open_items
  └───────────────────┘                                └─ stop notice ──► stopped ──(closure)──► closed_*
draft / awaiting_confirmation ──withdraw/decline──► withdrawn
```

Versions: v1 is set when the baseline is confirmed. +1 for each confirmed scope change, and for each valuation that becomes agreed.

## 19. Agreement, authorisation and valuation model

Each change carries three independent statuses (D-41):

| Dimension | Question | Values |
|---|---|---|
| **Agreement** (`agreement_status`) | Have both sides confirmed the terms (scope, dates, responsibilities)? | `proposed`, `confirmed`, `rejected`, `countered`, `withdrawn`, `stale` |
| **Authorisation** (`authorisation_status`) | Has the payer permitted work to proceed? | `not_requested`, `requested`, `authorised`, `declined`, `withdrawn` |
| **Valuation** (`valuation_status`) | What is the status of the price effect? | `none` (no price effect), `proposed`, `agreed`, `pending` (open, with optional payee and payer figures), `disputed` |

**Rules**
- **V-1** A change counts towards **agreed value** only when `agreement_status = confirmed` AND `valuation_status ∈ {agreed, none}`.
- **V-2** `authorised` + valuation `pending` or `disputed` appears in the statement as **"Authorised, valuation pending"**, showing both figures. It is excluded from agreed value.
- **V-3** Authorisation can exist without agreement, e.g. emergency work: "go ahead, we'll agree the details." The UI must say "**You are permitting work to proceed. You are not agreeing a price.**"
- **V-4** Agreeing a valuation on an already-confirmed change creates a new version.
- **V-5** Confirming a change that has a `proposed` valuation, without separately disputing it, confirms both, with explicit UI copy. Choosing "Confirm scope only" sets the valuation to `pending`.
- **V-6** Only the payer side can authorise. Either side can propose or counter a valuation. Agreement and valuation require the *non-proposing* side to confirm the latest figure.

| Example | Agreement | Authorisation | Valuation | In agreed value? |
|---|---|---|---|---|
| Extra asset, priced, confirmed | confirmed | authorised | agreed | Yes |
| Urgent fix: "go ahead, price later" | proposed | authorised | pending | No; shown as pending |
| Scope agreed, price disputed | confirmed | authorised | disputed | No; shown as pending |
| Rejected extra | rejected | declined | proposed | No |
| Date change only | confirmed | not_requested | none | n/a |

## 20. Change management rules

- **C-1** Changes never edit history. Confirmed changes produce new commitment versions. The previous values remain viewable.
- **C-2** One open proposal per counter chain. Countering closes the previous one (`countered`).
- **C-3** Stale rule (FR-CHG-09).
- **C-4** Removing a commitment that has accepted deliveries or paid obligations is blocked. A deduction or credit change is used instead.
- **C-5** A change that adds price must state its payment schedule effect: add to an existing obligation, or create a new obligation with a trigger.
- **C-6** Response deadlines: computed in working days (Mon–Fri, excluding Nigerian public holidays from a maintained list, S). Reminders go 1 working day before and on the deadline. Past it, the item shows "Response overdue."
- **C-7** Changes proposed by the payer that add scope still require the payee's agreement on scope, time and price.

## 21. Delivery and acceptance rules

- **A-1** Only deliverables can be submitted. Party obligations use fulfilled or missed (FR-DEL-06).
- **A-2** Partial acceptance records an accepted quantity or amount. `on_acceptance` obligations become due pro-rata: `due = floor(obligation_amount × accepted_value ÷ deliverable_value)` in minor units, accumulated across submissions and never above the obligation amount. If deliverable value is 0, the obligation becomes due only on full acceptance.
- **A-3** "Accept with issues" counts as full acceptance. Issues are listed and trackable but don't affect money unless a deduction change is confirmed.
- **A-4** Acceptance can't be reversed. Later issues use FR-DEL-05.
- **A-5** Disputing a rejection or correction request records both positions. The deliverable stays not accepted until a new response or a resolution.

## 22. Financial calculations and balance definitions

All amounts are in minor units. "Confirmed" means confirmed under the rules above. Definitions per engagement (and per obligation where relevant):

| Figure | Definition |
|---|---|
| **Original value** | Σ price of deliverables in v1 |
| **Approved variations** | Σ price effects of changes counted under V-1 (positive or negative) |
| **Revised value (agreed)** | Original value + approved variations |
| **Authorised, valuation pending** | Σ payee and payer figures for changes under V-2 (shown as a range; not in revised value) |
| **Scheduled** | Σ amounts of active payment obligations (current version) |
| **Unscheduled** | Revised value − scheduled (warning if ≠ 0) |
| **Due** | Σ over obligations of their due amount: `on_confirmation` → full amount once v1 is confirmed; `on_date` → full amount when date ≤ today; `on_acceptance` → pro-rata per A-2; `on_request` → Σ open and paid payment requests for it |
| **Requested** | Σ amounts of payment requests not cancelled |
| **Paid** | Σ allocations of `succeeded` provider transactions + `confirmed` off-platform payments − Σ `processed` refunds (provider) − Σ `confirmed` off-platform refunds |
| **Outstanding** | Per obligation: max(0, due − paid). Engagement: Σ outstanding |
| **Overdue** | Σ outstanding on obligations whose due date (trigger date + terms) < today |
| **Disputed** | Σ amounts of `open` disputes on obligations (each capped at that obligation's outstanding) |
| **Undisputed outstanding** | Outstanding − disputed |
| **Credit** | Σ over obligations of max(0, paid − due), plus unallocated confirmed payments |
| **Pending payments** (shown, not counted) | Σ `initiated` / `pending` provider transactions + `reported` off-platform payments |

**Rounding:** integer arithmetic only. Pro-rata uses floor; the final acceptance makes up the remainder. **Allocation:** a payment is allocated to the obligation(s) chosen by the payer at payment time. A payment against a request goes to that request's obligation.

## 23. Payment workflows

**Provider transaction states:** `initiated` → `pending` → `succeeded` | `failed` | `abandoned` | `needs_review`. After success: `partially_refunded` → `refunded`. Allowed transitions only. Terminal states never move back.

**Initiation (FR-PAY-02)**
1. Server checks: the actor is payer side, the obligation is open, the amount is valid, the provider is configured, and the payee has an active Bachs sub account with collection enabled (sandbox before G-PAY).
2. Create the transaction (`initiated`, reference `RTN-<ulid>`).
3. Create a Bachs checkout session as the payee's sub account (direct shape), with amount, currency, Retenum reference, return URL and metadata (engagement id, obligation ids). On a provider error the transaction is `failed`, with an error message.
4. Redirect to the provider-hosted checkout. Status → `pending` once initialize succeeds.

**Confirmation:** Webhook → verify the signature using the scheme in Bachs' webhook reference (constant-time comparison; scheme to be confirmed, O-08) → store the raw event (dedup) → retrieve the charge from the provider API → compare amount, currency and reference → transition the state → write the event → notify both sides. The return page polls Retenum's own status.

**Off-platform:** see FR-PAY-10.

## 24. Payment failure and refund scenarios

| Scenario | Behaviour |
|---|---|
| User abandons checkout | Stays `pending`. The re-verify job marks it `abandoned`. The obligation is still due. The user can retry |
| Card declined | Provider verify shows failure → `failed`, with the provider message shown to the payer only |
| Webhook never arrives | The re-verify job (30 min) and daily reconciliation resolve the status |
| Duplicate webhook | Stored once. Second delivery acknowledged with 200, no effect |
| Webhook with bad signature | 401. Logged as a security event. No processing |
| Event for an unknown reference | Stored, flagged `needs_review`. Admin alert |
| Amount differs from initiated | `needs_review`. Not counted as paid. Admin alert |
| Two payments race on the same obligation | Both may succeed. The excess becomes **credit** (FR-FIN-07). Never auto-refunded |
| Payment succeeds after the engagement is closed | Recorded and allocated. The closure statement is updated, with an event |
| Refund (provider) | `refund.processed` → refund record → paid reduced → transaction `partially_refunded` / `refunded`. `refund.failed` recorded, no money effect |
| Provider outage at initiation | Friendly error. Transaction `failed` (no money moved). Retry allowed |
| Off-platform payment rejected by payee | `not_received`, shown to both. The payer can attach proof or open a dispute |

## 25. Notification requirements

Email (M) plus an in-app "Awaiting your response" list (M). Each email links to the item, contains no financial secrets, and includes an unsubscribe for non-essential messages.

| ID | Event | Recipients | P |
|---|---|---|---|
| NOT-01 | Workspace member invitation | Invitee | M |
| NOT-02 | Engagement invitation / baseline submitted | Counterparty representative | M |
| NOT-03 | Response requested: change, authorisation, delivery, off-platform payment confirmation, final account | Approvers of the responding side | M |
| NOT-04 | Response given (confirmed, rejected, countered, accepted…) | Approvers of the other side + the proposer | M |
| NOT-05 | Deadline reminder (1 working day before; on the day) | Responding approvers | M |
| NOT-06 | Obligation became due; overdue on day 1 and day 7 | Payer approvers (due/overdue), payee approvers (overdue) | M |
| NOT-07 | Provider payment succeeded / failed | Payer initiator + both sides' approvers (success) | M |
| NOT-08 | Dispute opened / position added / resolved | Both sides' approvers | M |
| NOT-09 | Engagement stopped / closed | Both sides | M |
| NOT-10 | Daily digest instead of individual emails (user setting) | Any | C |
| NOT-11 | SMS / WhatsApp | — | W |

Notifications are sent via an **outbox** (reliable retries). Failures never roll back the business action.

## 26. Audit and recordkeeping

- **AUD-01 (M)** Engagement events (FR-HIS-01..03).
- **AUD-02 (M)** Security audit log: logins, failed logins, password resets, role changes, admin access to engagements, configuration changes (live mode), webhook signature failures.
- **AUD-03 (M)** Raw provider webhook payloads retained, with redaction of any card fragments the provider includes.
- **AUD-04 (M)** Retention: commercial records kept for the life of the engagement plus 6 years, *pending legal advice* (O-03, R-L05). Personal data minimised. Erasure requests are handled by pseudonymising personal identifiers in non-commercial fields while keeping the commercial record (policy to be confirmed by counsel).
- **AUD-05 (M)** Evidence files are immutable once attached (storage key includes the content hash; no overwrite).

## 27. Security and privacy requirements

| ID | Requirement | P |
|---|---|---|
| SEC-01 | TLS everywhere. HSTS. Secure cookies | M |
| SEC-02 | Authorisation policy check on every server action and route. Automated permission tests for every row of §17 | M |
| SEC-03 | Input validation with schemas on every boundary. Parameterised queries only | M |
| SEC-04 | CSRF protection on state-changing requests (same-site cookies + origin checks) | M |
| SEC-05 | Rate limiting: authentication, email codes, invitations, payment initiation | M |
| SEC-06 | Invitation and reset tokens: 32+ bytes of randomness, stored hashed, single-use, expiring | M |
| SEC-07 | Files: type allow-list, size limits, served via short-lived signed URLs, `Content-Disposition: attachment` for non-images, no public bucket | M |
| SEC-08 | Secrets in environment or secret manager only. Provider secret keys never sent to the browser. Separate keys per environment | M |
| SEC-09 | No card data stored or processed. Hosted checkout only | M |
| SEC-10 | Security headers (CSP, frame-ancestors none, referrer-policy) | M |
| SEC-11 | Dependency scanning in CI. Lockfile committed | M |
| SEC-12 | Personal data: collect only what's needed. A privacy notice is shown at registration and invitation. NDPA-aligned (O-03) | M |
| SEC-13 | Payout bank details shown masked except the last 4 digits | M |
| SEC-14 | Malware scanning of uploaded files | S |

## 28. Regulatory and legal dependencies

| ID | Dependency | Blocks |
|---|---|---|
| LEG-01 | Nigerian legal opinion on the payment structure (G-PAY 1) | Live payments |
| LEG-02 | Bachs written confirmation of its licensing, merchant of record, custody of sub-account balances and refund/chargeback liability (G-PAY 2) | Live payments, in-app refunds |
| LEG-03 | Retenum entity + Bachs business compliance complete and Connect active in production (G-PAY 3) | Live payments |
| LEG-04 | NDPA privacy compliance, hosting and transfer basis (G-PAY 4, O-03) | Production launch with real personal data |
| LEG-05 | Terms of service and privacy notice: Retenum doesn't hold funds, guarantee payment, decide disputes, or make records legally binding (G-PAY 5) | Design-partner launch |
| LEG-06 | Legal review of the governing-document clause, confirmation wording and retention periods | General release |

## 29. Admin requirements (internal)

| ID | Requirement | P |
|---|---|---|
| FR-ADM-01 | `platform_admin` role, assigned only via a server-side command (no UI self-assignment). 2FA required (S) | M |
| FR-ADM-02 | Search users, workspaces and engagements. View read-only. Every view of an engagement is logged (AUD-02) | M |
| FR-ADM-03 | Suspend or unsuspend a user or workspace (blocks login and new actions; never deletes records). Reason required | M |
| FR-ADM-04 | Payment console: transactions with status history, raw webhook events, `needs_review` queue. "Re-verify with provider" action | M |
| FR-ADM-05 | Support notes on a user or workspace (internal only) | S |
| FR-ADM-06 | Abuse report intake (a link on every engagement page) → admin queue | S |
| FR-ADM-07 | Admins cannot edit or delete any commercial record, event or transaction | M |

## 30. Analytics and success metrics

These are product events, privacy-respecting and first-party. They map to Phase 3's metrics so design partners act as the pilot (D-00).

| Metric | Definition | Design-partner target (provisional, from Phase 3 §10) |
|---|---|---|
| Counterparty activation | % of invited counterparties who open the link and verify | ≥70% |
| Payer response rate | % of payer-directed requests answered within the window | ≥70% median |
| Changes confirmed before work | % of changes with agreement (+ valuation for priced changes) before "work started" | ≥60% |
| Authorised, valuation pending | Count, and how they resolved | Descriptive |
| Off-platform share of payments | % of paid value recorded off-platform | Descriptive (informs the payment strategy) |
| Provider payment success rate | Succeeded ÷ initiated (excluding abandoned) | Descriptive |
| Unbilled value captured | Value of "logged from conversation" changes confirmed | Descriptive |
| Closure rate | % of engagements reaching `closed_agreed` | Descriptive |
| Retention | Workspaces creating a 2nd engagement within 60 days | ≥50% |
| Willingness to pay | Design partners converting to paid at the test price | ≥3 (Phase 3 GO rule) |

## 31. Acceptance criteria (major features)

Each is written to be automated (Given / When / Then). The full test list lives in the build plan per slice.

- **AC-BAS-1** Given a submitted draft, when the counterparty approver confirms with acknowledgement, then the engagement is `active` v1, `on_confirmation` obligations are due, an event is written, and the initiator is notified.
- **AC-BAS-2** Given an active engagement, when anyone attempts to edit a commitment directly, then the request is rejected (403 or 409) and nothing changes.
- **AC-CHG-1** Given change CH with price +P proposed by the payee, when the payer chooses "Authorise work only," then authorisation is `authorised`, agreement `proposed`, valuation `pending`. Revised value is unchanged, and "Authorised, valuation pending" includes P.
- **AC-CHG-2** Given two changes proposed against the same commitment, when the first is confirmed, then confirming the second is blocked and it is marked `stale`.
- **AC-CHG-3** Given a confirmed change, then the previous commitment values are visible in version history, and revised value = original + approved variations.
- **AC-DEL-1** Given an `on_acceptance` obligation of ₦300,000 linked to a deliverable worth ₦600,000, when the payer partially accepts ₦400,000, then due = ₦200,000.
- **AC-FIN-1** Given outstanding ₦500,000 and an open dispute of ₦50,000, then disputed = ₦50,000, undisputed outstanding = ₦450,000, and the payer can still pay any amount up to ₦500,000.
- **AC-PAY-1** Given an initiated transaction, when the browser returns from checkout with a "success" query string but no verified webhook exists, then the status is not `succeeded` and paid is unchanged.
- **AC-PAY-2** Given a valid webhook delivered twice, then exactly one transition and one event are recorded, and paid increases once.
- **AC-PAY-3** Given a webhook with an invalid signature, then the response is 401 and nothing is processed.
- **AC-PAY-4** Given a verified amount different from the initiated amount, then status = `needs_review` and paid is unchanged.
- **AC-PAY-5** Given an off-platform payment reported by the payer, then paid is unchanged until the payee confirms. On confirmation, paid increases.
- **AC-HIS-1** Given any engagement event row, when an UPDATE or DELETE is attempted at the database level, then it fails.
- **AC-PERM-1** For every row of §17, a test asserts allowed actors succeed and all others are refused.

## 32. Edge cases

| Case | Handling |
|---|---|
| Counterparty email typo | The initiator can cancel the invitation and re-invite while `awaiting_confirmation`. The old token is revoked |
| Counterparty invites someone else to answer | S: colleagues (FR-ENG-07). In the MVP, the representative must answer |
| Both sides in the same workspace | Blocked: payer and payee must be different organisations or individuals |
| Person leaves the counterparty company | An approver from that side adds a colleague (S). Otherwise the platform admin can reassign the representative on written request from both sides (logged) |
| Initiator workspace downgrades or goes over limit | Existing engagements continue fully (FR-WS-07) |
| Initiator workspace suspended | Counterparty keeps read and export access to shared engagements |
| Currency mismatch on a provider payment | Rejected at initiation |
| Change reduces the price below the amount already paid | Allowed. Results in credit |
| Obligation linked to a removed deliverable | The remove is blocked unless the change also modifies or removes the obligation |
| Due date on a weekend | No adjustment (shown as is). Working days apply to response windows only |
| Time zones | All deadlines computed in Africa/Lagos for the MVP |
| Very large engagement (500+ commitments) | Paginated lists. Statement calculation must stay under 300 ms (index requirement) |
| Payee sub-account bank details wrong | Payouts are enabled only after the payee confirms the bank account name (FR-PAY-09). Changing payout details requires owner re-authentication and notifies the counterparty on open engagements |

## 33. Risks and unresolved decisions

See `RETENUM_RISK_REGISTER.md` (top risks: R-C01 payer participation, R-L01 payment structure legality, R-C02 willingness to pay, R-P01 complexity of the three-status model) and Product Decisions §7 (O-01 to O-07).

## 34. Release criteria

**Design-partner release (no provider payments yet; off-platform recording live, D-50):**
1. All **M** requirements implemented, with acceptance criteria automated and passing.
2. Permission test suite (AC-PERM-1) passing. Security review checklist (architecture §12) complete.
3. Terms and privacy notice in place (LEG-05).
4. Backups verified by a test restore.
5. Error monitoring and payment alerts wired.
6. At least 3 design-partner engagement pairs recruited, with consent to collect §30 metrics.

**Live payments** (the last slice, D-50): G-PAY complete and recorded (D-20), live keys in production only, end-to-end live test with a small real transaction and refund, reconciliation job verified.

**General release:** Phase 3 decision is GO (or REVISE completed). **S** requirements done. LEG-06 complete.
