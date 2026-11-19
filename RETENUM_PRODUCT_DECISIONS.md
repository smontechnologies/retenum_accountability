# Retenum — Product Decisions

*Created 18 November 2026. This is the single source of truth for product direction. Requirements live in `RETENUM_PRD.md`, technical choices in `RETENUM_TECHNICAL_ARCHITECTURE.md`, and risks in `RETENUM_RISK_REGISTER.md`. When a decision changes, update its row, add a dated entry to the change log at the bottom, and explain why.*

**Status key**
- **DECIDED**: build against it.
- **HYPOTHESIS**: build against it, but it is untested and must be checked with real users or customers.
- **GATED**: cannot go live until the stated condition is met.
- **OPEN**: not yet decided.

---

## 0. The honest starting position

- **No customer evidence exists yet.** Everything Phases 1–3 established is desk research. The Phase 3 interviews, participation tests, pilots and willingness-to-pay experiments have **not** been run (`RETENUM_PHASE_3_VALIDATION_PLAN.md`).
- **D-00 (DECIDED by the founder): build the MVP in parallel with Phase 3 validation, rather than after it.** This reverses the sequence recommended in Phase 3, which said to validate before writing a PRD. The founder has accepted the risk.
  - **Mitigation:** the first release goes to **design partners only** (invited businesses running real engagements), and is treated as the Phase 3 pilot with software. The Phase 3 measures, thresholds and GO / REVISE / NO-GO rules still apply. A NO-GO or REVISE result must change this document.
  - **Consequence:** some of what we build may be thrown away. Slices are ordered so the riskiest assumption, whether the payer will take part, is testable as early as possible (Slice 2).

---

## 1. Product direction

| ID | Decision | Status | Reasoning |
|---|---|---|---|
| D-01 | **Definition:** Retenum is a **shared commercial record with connected payments**. Two parties use it to confirm what was agreed, what changed, what was authorised, what was delivered, and what is owed and paid. Each figure traces back to the commitment or transaction behind it | DECIDED | Combines the Phase 2 operating model with the founder's direction to make payments central |
| D-02 | **The central principle:** nothing counts as agreed until both parties confirm it, and nothing confirmed can be silently changed. Confirmed history is never edited. It is only added to | DECIDED | Phase 2 §1.1, §5.3 |
| D-03 | **Positioning: what Retenum is not.** It is not project management, accounting, a contract generator, a marketplace, escrow, a payment gateway or a dispute authority | DECIDED | Phase 1 §3. Avoids saturated categories and regulated roles |
| D-04 | **Neutrality is enforced by rules, not messaging.** Both sides have the same powers (propose, respond, dispute, attach evidence, export). The paying subscriber gets no extra power over the shared record. Paid features are confined to workspace tools (templates, team seats, number of active engagements) | DECIDED | Phase 2 §2.4. Prevents "the subscriber's tool" perception |
| D-05 | **Value proposition** (to test): *for the hired party*, extras are confirmed and priced before the work, payment is requested against clear obligations, and the cost of chasing approvals falls. *For the hiring party*, the final cost equals the agreed baseline plus changes they personally confirmed, and they pay only against obligations that are due | HYPOTHESIS | Phase 2 §9.4. **We do not claim Retenum fixes late payment** |

### Challenges to the proposed direction (recorded deliberately)

1. **"Commercial accountability *and payment* platform" creates pressure to hold money.** The safe version of payments, where the provider settles directly to the payee, cannot enforce anything. It makes paying easier and records it reliably. That is useful, but it is not "accountability" over money. Escrow-like expectations must be avoided in all marketing (R-L04).
2. **Payments may not be used.** Phase 1 found small business payment runs mostly on bank transfers and accounting tools. In our recommended market (§2), many business clients pay by bank transfer from their own banking app or through their accounts team. **So recording off-platform payments, confirmed by both parties, is a MUST** (D-22). Without it, the financial record is incomplete for most engagements.
3. **Payment revenue is uncertain.** Local Nigerian card fees are low (Paystack, for comparison, caps local card fees at ₦2,000 per transaction ([Paystack](https://support.paystack.com/hc/en-us/articles/360009881920))). Bachs' pricing has not yet been reviewed (O-08). Any Retenum payment fee competes with a cheap baseline. Subscription is the primary revenue (D-30).

---

## 2. Initial market

| ID | Decision | Status |
|---|---|---|
| D-10 | **Launch market hypothesis:** client-service businesses (independent agencies, studios, consultancies and similar B2B service firms, roughly 2–50 staff) and their **business clients**. The cross-industry core stays generic. The first engagement template and vocabulary are designed for client-service work | HYPOTHESIS |
| D-11 | **Second market (planned, not built):** residential renovation and fit-out, as soon as the core is proven | HYPOTHESIS |
| D-12 | **Not in the MVP:** specialty subcontracting (progress valuations, retention, statutory notices), goods supply, and consumer-only engagements | DECIDED |

**Why client-service firms, not renovation or construction.** This rests on Phase 1–2 desk evidence only, which is why it is labelled a hypothesis:
- **Frequent, small, unpriced changes** are exactly the "unconfirmed commitments" problem a shared record addresses. 57% of agencies report $1k–$5k a month in unbilled scope; only 1% bill all of it (Phase 1 §2.2, a vendor survey).
- **Both parties are businesses.** That avoids consumer-law restrictions on deemed acceptance, deposit caps and statutory change-order formats (Phase 2 §8.1). It also suits the B2B subscription model.
- **Repeat engagements** support a subscription. Homeowners are one-off payers (Phase 2, C3).
- **Acceptance is by deliverable or revision round,** the simplest acceptance model. Construction needs progress valuations (Phase 2 §8.5).
- **Easiest to reach online,** and faster to recruit design partners (Phase 1 §7).

**Against it:**
- Less money is at stake per engagement than in construction.
- Larger clients pay through their own procurement systems and won't use a supplier's checkout.
- "Done" is more subjective for creative work.

**What would change this:** if Phase 3 interviews or design-partner usage show payer participation or willingness to pay is clearly stronger in renovation and fit-out, switch the first template. The core model does not change.

**[OPEN] O-01:** No Nigerian-specific evidence for the problem exists in Phases 1–3, which used UK and US sources. The Phase 3 interviews must be run in the launch jurisdiction (§3).

---

## 3. Jurisdiction

| ID | Decision | Status |
|---|---|---|
| D-20 | **Launch jurisdiction: Nigeria** (Lagos first). Currency: NGN | HYPOTHESIS + GATED for live payments |
| D-21 | Phase 3's provisional choice of England & Wales is **superseded** | DECIDED |

**Comparison**

| Factor | Nigeria | England & Wales | United States (one state) |
|---|---|---|---|
| Founder can recruit and operate | **Strong** (founder's operating context) | Weak without a UK presence | Weak |
| Desk evidence for the problem | None specific (O-01) | Strong (Phase 1) | Strong |
| Payment provider for a platform | **Bachs** (chosen by the founder, D-27). Its "Connect" product gives each seller a sub account with its own balance, and supports split payments and payouts ([Bachs docs](https://docs.bachs.io), [split payments](https://docs.bachs.io/connect/split-payments.md)). Settles in NGN (also GHS, KES, ZAR) ([bachs.io](https://bachs.io)) | Stripe Connect. With "direct charges" the connected account (the payee) is the merchant of record, and the platform is still liable for negative balances ([Stripe](https://docs.stripe.com/connect/merchant-of-record)) | Stripe Connect (same) |
| How cleanly money avoids the platform | **Partly clear.** Bachs' "direct" split shape makes the sale the sub account's, so refunds and lost disputes debit the payee's account, not Retenum's. But Retenum creates and owns the sub accounts, and funds sit in a Bachs balance until withdrawn. Who is merchant of record and who legally holds those balances is not stated in the docs | Cleaner. The payee is the merchant of record | Cleaner |
| Regulation of payments | CBN licensing. Payment Solution Service Providers cover gateways and "merchant aggregation and collections" ([CBN categories summary](https://threshold-attorneys.com/wp-content/uploads/2021/01/CBN-New-Payments-System.pdf)). **Whether Retenum as a main account collecting for subaccounts is regulated activity needs a Nigerian legal opinion** | FCA payment services rules. Non-custodial structures are usually outside, but this needs advice | State money-transmitter laws. Usually avoided via Connect, but needs advice |
| Data protection | NDPA 2023 plus GAID 2025. Cross-border transfer rules apply ([NDPC GAID](https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf)) | UK GDPR | State laws |
| Fees | Bachs pricing not yet reviewed (O-08) | Stripe UK pricing | Stripe US pricing |
| Refunds | Bachs refunds and disputes via API ([refunds guide](https://docs.bachs.io/guides/refunds.md)). A third-party plugin reports **one refund operation per charge**, so a partial refund uses up the refund for that charge (to verify) | Stripe refunds | Stripe refunds |

**Why Nigeria despite weaker desk evidence:** you can only validate (D-00) where you can recruit design partners and talk to both parties in person. Commercially, the UK and US are better documented but operationally out of reach for the founder today. The product core is jurisdiction-neutral, and payments sit behind a provider abstraction, so adding Stripe Connect for the UK later is a provider addition, not a redesign.

**What must happen before live payments in Nigeria** (gate G-PAY, all required):
1. **Written legal opinion from a Nigerian fintech lawyer** on whether Retenum operating a Bachs platform account with payee sub accounts is regulated activity (CBN), and on Retenum's liability and control over payee balances.
2. **Written confirmation from Bachs** of: its own licensing or licensed partner for collecting and settling in Nigeria (not stated on its website); who is merchant of record and who holds sub-account balances; refund and chargeback liability for "direct" charges; and acceptable use for this model.
3. **Retenum's legal entity** registered in Nigeria (CAC), with Bachs business compliance complete and Connect active in production (Bachs requires this before live sub accounts).
4. **NDPA compliance:** privacy notice, lawful basis, and a cross-border transfer basis if hosting is outside Nigeria. Plus registration with the NDPC if Retenum qualifies as being of "major importance."
5. Customer and counterparty **terms of service** that state Retenum does not hold funds, guarantee payment or decide disputes.

Until G-PAY passes, payments are developed and tested **only in the Bachs sandbox**. Design partners use off-platform payment recording (D-22).

---

## 4. Payment model

| ID | Decision | Status |
|---|---|---|
| D-22 | **Off-platform payments are first-class.** The payer records a payment made outside Retenum (bank transfer, cash, cheque). It counts as **paid only when the payee confirms receipt**. Until then it shows as "reported, awaiting confirmation" | DECIDED (MUST) |
| D-23 | **Model A + B in the MVP:** the payer starts payment against a specific payment obligation through Bachs hosted checkout. The charge uses Bachs' **"direct" shape**: the sale belongs to the payee's sub account, so refunds and lost disputes debit the payee, not Retenum. The payee's balance is paid out only to the payee's own verified bank account, on an automatic schedule. Retenum marks money as paid **only** from provider-verified information (signed webhook plus server-side retrieval). Partial payments against an obligation are allowed | DECIDED, GATED (G-PAY) for live |
| D-24 | **Model C (conditional payments, escrow, held funds) is excluded** from the MVP and from all messaging. Not built, not simulated. Revisit only with a regulated escrow partner, a legal opinion, and evidence of demand | DECIDED |
| D-25 | **No wallet, no stored balances, no Retenum-held funds, no card data stored.** Card entry happens only on the provider's hosted checkout | DECIDED |
| D-26 | **Refunds:** refunds come from the provider's `refund.*` events and are recorded against the original transaction and obligation. **Starting refunds inside Retenum is a SHOULD and is GATED** on Bachs confirming refund liability (G-PAY item 2). Because Bachs reportedly allows only one refund operation per charge, a partial refund must be confirmed by the payee before it is sent. Until then, refunds are started in the provider dashboard by Retenum operations only, at the payee's written request. Off-platform refunds are recorded the same way as off-platform payments | DECIDED |
| D-27 | **Payment provider: Bachs** (founder decision, 2026-11-18; replaces Paystack). **A provider abstraction from day one:** payment transactions store provider, provider reference, amount in minor units, currency and a status history. Bachs is the first adapter. Others (Paystack, Stripe Connect) remain possible later adapters | DECIDED |
| D-28 | **Payment failure:** Retenum treats an initiated payment as *pending* until the provider confirms an outcome. If no outcome event arrives, it marks the payment *abandoned* after a time-out, once a server-side retrieval confirms it did not succeed. Bachs' exact failure events are to be verified in the sandbox | DECIDED (verify in the payment slice) |
| D-29a | **Retenum's control over payee balances is restricted by product rule.** Bachs lets the platform move money between itself and accounts it owns. Retenum's code may only (a) create direct charges for the payee, and (b) withdraw a payee's balance to that payee's own verified bank account. It never transfers money out of a payee balance to Retenum or anyone else. The only exception is a platform fee, and only after payment revenue is switched on (D-34) and disclosed. Enforced in the adapter and tested | DECIDED |

**Challenge to the founder's starting preference.** The preference listed "direct settlement to the service provider." Bachs' direct charges are closer to that than Paystack splits were, because the sale and refunds belong to the payee's account. Two concerns remain:
- **Custody and control.** Funds sit in a Bachs balance until withdrawn, and Retenum (not the payee) owns the sub account in the API. That is real control over the payee's money, so D-29a restricts it and gate G-PAY asks the lawyer about it.
- **Provider assurance.** Bachs' website does not state its licensing or regulatory status, and it is a much younger provider than Paystack. Its licensing must be confirmed in writing (G-PAY item 2).

If either answer is negative, the fallback (D-29) keeps the product useful.

| D-29 | **Fallback if G-PAY fails:** keep off-platform recording (D-22), plus *payee-supplied payment links*. The payee pastes a link to their **own** payment page (any provider) or bank details into a payment request, and confirms receipt in Retenum. Retenum never handles provider credentials belonging to payees | DECIDED (contingency) |

---

## 5. Business model and pricing

| ID | Decision | Status |
|---|---|---|
| D-30 | **B2B SaaS subscription is primary. Payment revenue is secondary and OFF at launch** | DECIDED |
| D-31 | **The initiating business's workspace is the customer.** Counterparties join, view, respond, attach evidence, pay and export **free, with no limits.** Inviting a counterparty is never charged | DECIDED |
| D-32 | **Pricing is measured by *active engagements* per workspace**, with team seats as a secondary limit. Not by contract value (it feels like a tax and doesn't fit services) and not by business size (hard to verify) | DECIDED |
| D-33 | Price points (all to be tested, below). Only Free + Pro need to exist at design-partner launch, and **billing itself is not built in the MVP** (design partners invoiced manually) | HYPOTHESIS |
| D-34 | **Payment fee (when payment revenue is switched on, after G-PAY):** a flat Retenum fee per successful provider payment, borne by the payee via the split. The amount is to be tested. Not charged on off-platform payments, so recording is never discouraged | HYPOTHESIS |

**Initial pricing architecture (hypotheses; NGN; untested)**

| Plan | Active engagements | Seats | Test price |
|---|---|---|---|
| Free | 1 | 1 | ₦0 |
| Pro | 10 | 3 | ₦25,000 / month |
| Business | 40 | 10 | ₦75,000 / month |

"Active" means not closed. A counterparty who becomes an initiator of their own engagements needs their own workspace plan (the land-and-expand path). **These numbers are placeholders for commercial testing, not market facts.**

---

## 6. MVP scope decisions (detail in the PRD)

| ID | Decision | Status |
|---|---|---|
| D-40 | **Two parties per engagement** (one payer side, one payee side; each side can have several team members). Multi-party and linked engagements come later | DECIDED |
| D-41 | **Agreement, authorisation and valuation are separate statuses** on every change | DECIDED (founder requirement; Phase 3 tests whether users understand it) |
| D-42 | **Silence is recorded as "no response," never as acceptance.** Response deadlines exist and trigger reminders. **No deemed acceptance in the MVP** | DECIDED |
| D-43 | **Counterparty access:** an invitation link plus a one-time email code. This creates a lightweight identity with no password and no workspace. Counterparties can create a full workspace later | HYPOTHESIS (Phase 3, M2 approach) |
| D-44 | **Retention, progress-percentage billing, statutory notices and deemed acceptance are excluded** from the MVP (they belong to the construction segment) | DECIDED |
| D-45 | **The Retenum record does not replace the signed contract.** An engagement may reference a source document. The default clause shown to both parties at confirmation: "Where a signed contract exists, it governs; this record summarises it and records changes, delivery and payment." | DECIDED, pending legal review |
| D-46 | **Disputes are a status on a specific item with both positions recorded.** Undisputed amounts are never frozen. No resolution workflow | DECIDED |
| D-47 | **Records are described as "tamper-evident and time-stamped,"** never as "legally binding," "conclusive" or "impossible to challenge" | DECIDED |

---

## 6b. Visual identity and delivery format

| ID | Decision | Status |
|---|---|---|
| D-60 | **Strictly monochrome identity** (black, white, neutral greys), with light, dark and system themes. Spec: `RETENUM_DESIGN_SYSTEM.md` | DECIDED (founder requirement) |
| D-61 | **Delivered as a Progressive Web App**, mobile-first and excellent on desktop. Spec: `RETENUM_UI_UX_SPECIFICATION.md` | DECIDED (founder requirement) |
| D-62 | **No offline queueing of commercial actions.** Offline is read-only for already-open pages, and nothing is confirmed, recorded or paid without the server | DECIDED |
| D-64 | **Guided onboarding, no empty states as destinations:** a workspace must be created before using the app; "New engagement" is always visible on Overview and Engagements; creation never leaves an empty engagement (FR-ONB-01…03, FR-ENG-11/12) | DECIDED (founder requirement) |
| D-63 | **A design-system slice (1A) comes before further screens**, and the design quality gate is part of every UI slice | DECIDED |

## 6a. Build order

| ID | Decision | Status |
|---|---|---|
| D-50 | **The payment provider integration is the last slice** (founder decision, 2026-11-18). Everything else is built first: engagements, changes, delivery, the financial record, off-platform payments, closure, notifications, admin and production readiness. The provider-neutral payment model and a fake provider are still built with the financial record, so adding Bachs does not reshape existing records | DECIDED |

**Consequence:** the design-partner release runs without provider payments. Payments are recorded off-platform and confirmed by the payee (D-22), which G-PAY required anyway.

## 7. Open issues

| ID | Issue | Needed to decide |
|---|---|---|
| O-01 | Nigerian evidence for the problem and for payer participation | Phase 3 interviews in Lagos |
| O-02 | Whether the Bachs platform and sub-account model is lawful and commercially acceptable | G-PAY legal opinion + Bachs confirmation |
| O-03 | Hosting region versus NDPA cross-border transfer | Legal advice. Provider region options |
| O-04 | Whether client-service firms are the right first market | Design-partner data (D-00 mitigation) |
| O-05 | Final prices and the payment fee | Willingness-to-pay experiments (Phase 3 §11) |
| O-06 | Whether payers use the lightweight access, and whether they respond | Design-partner metrics (PRD §30) |
| O-07 | VAT treatment and invoice formats (Retenum does not issue tax invoices in the MVP) | Accountant advice before billing customers |
| O-08 | Bachs fees, settlement timing, payout rules for sub accounts, webhook signature scheme and event names, and amount format (docs content seen so far is incomplete) | Review Bachs pricing and API reference. Sandbox testing in the payment slice |
| O-09 | Whether to use Bachs subscriptions to bill Retenum's own customers. Bachs offers subscriptions, trials, proration and a customer portal; billing is currently out of MVP scope (D-33) | Decide once design partners convert to paid |

---

## Change log

| Date | Change | Reason |
|---|---|---|
| 2026-11-19 | Added D-64 (onboarding and always-available New engagement) | Founder requirement |
| 2026-11-18 | Added D-60…D-63 (monochrome identity, PWA, no offline queueing, design slice first) | Founder design and PWA requirements |
| 2026-11-18 | Payment provider switched from Paystack to **Bachs** (D-27, D-23, D-26, D-28, new D-29a, G-PAY items 1–3, O-08, O-09). Provider integration moved to the **last** slice (D-50) | Founder instruction |
| 2026-11-18 | Document created. D-21 supersedes Phase 3's provisional England & Wales choice. D-00 records the founder's decision to build in parallel with validation | Founder brief (product finalisation) |
