# Retenum — Risk Register

*Version 0.1 · 18 November 2026.*

- **Likelihood (L) and impact (I):** each scored 1–5. **Score** = L × I.
- **Owner:** F = founder, E = engineering, Lg = legal counsel.
- Review fortnightly and at each slice completion.
- Decisions are in `RETENUM_PRODUCT_DECISIONS.md`.

## Top risks (score ≥ 15)

| ID | Risk | L | I | Score | Mitigation | Trigger / signal | Owner |
|---|---|---|---|---|---|---|---|
| R-C01 | **Payers don't participate.** They ignore invitations or don't respond, so the record is one-sided | 4 | 5 | 20 | Lightweight access (D-43). Neutral design (D-04). Slice 2 ships early to design partners. Measure activation and response rate (PRD §30). Phase 3 participation experiment | Payer activation <70% or response <70% after 4 weeks of design-partner use | F |
| R-C02 | **No one pays.** Payees value it but won't pay; payers expect it free | 3 | 5 | 15 | Commitment tests (Phase 3 §11). Free tier limited to 1 active engagement. Convert design partners at test prices | <3 paid conversions by the end of the design-partner period | F |
| R-L01 | **The payment structure is regulated or exposes Retenum to liability.** With Bachs Connect, Retenum creates and owns the payee sub accounts, and funds sit in Bachs balances until withdrawn. That gives Retenum control over payee money, and CBN collection rules may apply | 3 | 5 | 15 | Gate G-PAY (legal opinion + written Bachs confirmation) before live. Direct charges only. Restricted adapter (D-29a, FR-PAY-16). Off-platform recording first-class (D-22). Fallback D-29. Provider integration built last (D-50) | Negative or unclear legal opinion | Lg/F |
| R-PAY07 | **Bachs provider assurance:** licensing not stated publicly; young provider (see Payment section) | 3 | 5 | 15 | G-PAY item 2; provider abstraction; off-platform recording | Bachs cannot confirm licensing in writing | F/Lg |
| R-P00 | **Building before validation** (D-00) wastes effort on the wrong market or workflow | 4 | 4 | 16 | Slice order puts the participation test first. Design-partner release is treated as the pilot. GO/REVISE/NO-GO still applies | Phase 3 REVISE or NO-GO signals | F |

## Product and commercial

| ID | Risk | L | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-P01 | Separate agreement, authorisation and valuation statuses confuse users | 3 | 3 | 9 | Plain-language UI copy (PRD §19 V-3). Comprehension check with design partners (Phase 3 §8.5). Keep the data model but simplify the display if needed | F/E |
| R-P02 | Confirmation friction: people agree on WhatsApp and never log it | 4 | 4 | 16 | "Logged from conversation" changes (FR-CHG-05). Mobile-first quick change. Measure off-process share | F/E |
| R-P03 | Formal confirmations feel distrustful and harm client relationships | 3 | 3 | 9 | Neutral wording. Payer protections emphasised. Monitor objections | F |
| R-C03 | Wrong first market (client-service firms) | 3 | 4 | 12 | Cross-industry core. Renovation template planned (D-11). Decide on design-partner data | F |
| R-C04 | No Nigerian evidence for the problem (desk research was UK/US) | 4 | 3 | 12 | Run Phase 3 interviews in Lagos alongside the build (O-01) | F |
| R-C05 | Larger clients pay only through their own procurement systems, so provider payments go unused | 4 | 2 | 8 | Off-platform recording. Reference external invoice numbers | F |
| R-C06 | Payment revenue is negligible (capped local fees) | 4 | 2 | 8 | Subscription is primary (D-30) | F |
| R-C07 | Competitors add "client confirmation" features | 3 | 3 | 9 | Neutrality and a two-sided record are hard for one-sided tools to copy credibly | F |
| R-C08 | Retenum is mistaken for escrow ("my money is protected") | 3 | 4 | 12 | Messaging rules (D-24, D-47). Terms of service. UI copy at checkout: "Paid directly to [payee]" | F |

## Legal and regulatory

| ID | Risk | L | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-L02 | NDPA non-compliance (registration, transfers outside Nigeria, consent) | 3 | 4 | 12 | Legal review before production with real data (LEG-04). Data minimisation | Lg/F |
| R-L03 | Users treat Retenum confirmations as a binding contract, then dispute it | 3 | 3 | 9 | Governing-document clause (D-45). Wording "tamper-evident record." Legal review LEG-06 | Lg |
| R-L04 | Marketing over-claims ("guaranteed payment", "legally binding") | 2 | 4 | 8 | Claims checklist (D-47) | F |
| R-L05 | The append-only record conflicts with erasure requests | 3 | 3 | 9 | Pseudonymisation policy (AUD-04). Legal advice | Lg/E |
| R-L06 | Retenum is considered to be debt collecting via overdue reminders | 2 | 3 | 6 | Neutral notifications. No demands or threats. Legal check | Lg |
| R-L07 | Tax or VAT obligations on subscriptions are unclear | 2 | 3 | 6 | Accountant before billing (O-07) | F |

## Payment

| ID | Risk | L | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-PAY01 | A payment is marked paid without the money arriving (fake redirect, forged webhook) | 2 | 5 | 10 | Signature + server verify + amount check (FR-PAY-03, AC-PAY-1/3/4) | E |
| R-PAY02 | Duplicate or out-of-order webhooks corrupt state | 3 | 4 | 12 | Inbox dedup + row lock + forward-only state machine (TD-11) | E |
| R-PAY03 | Bachs behaviour differs from what the docs suggest (signature scheme, event names, amount format, sub-account payouts, one refund per charge) | 3 | 3 | 9 | Verify every item in architecture §6 in the sandbox in Slice 9. Record findings in the architecture doc | E |
| R-PAY07 | **Provider assurance:** Bachs' licensing or regulatory status is not stated on its website, and it is a much younger provider than Paystack. Risks include settlement failure, sudden service changes, or regulatory action against the provider | 3 | 5 | 15 | Written confirmation of licensing and fund-holding arrangements (G-PAY 2). Provider abstraction (D-27) keeps a second adapter possible. Off-platform recording means the product works without the provider | F/Lg |
| R-PAY04 | Payouts go to the wrong bank account | 2 | 5 | 10 | Resolve and name confirmation (FR-PAY-09). Re-auth plus counterparty notice on change. Paystack disclaims liability for wrong account details | E/F |
| R-PAY05 | Live keys are used before G-PAY | 2 | 5 | 10 | Double guard (FR-PAY-14). Separate environments | E |
| R-PAY06 | Overpayment or race conditions create confusion | 3 | 2 | 6 | Credit display (FR-FIN-07). No auto-refunds | E |

## Security

| ID | Risk | L | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-S01 | Broken access control exposes one engagement to another party | 3 | 5 | 15 | Deny-by-default policy. Permission matrix tests (AC-PERM-1). Service-layer enforcement | E |
| R-S02 | Account takeover via weak passwords or OTP brute force | 3 | 4 | 12 | Rate limits, password policy, OTP attempt limits, 2FA for admins (S) | E |
| R-S03 | Malicious file uploads | 3 | 3 | 9 | Allow-list, size limits, attachment disposition, private bucket, scanning (S) | E |
| R-S04 | Secrets leak (provider keys) | 2 | 5 | 10 | Environment-only, server-only imports, build grep check | E |
| R-S05 | Insider or admin alters records | 1 | 5 | 5 | No edit capability. Append-only triggers. Admin access logged | E |
| R-S06 | Dependency vulnerabilities | 3 | 3 | 9 | Pinned versions, CI audit | E |

## Operational and delivery

| ID | Risk | L | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-O01 | A solo non-engineer founder can't maintain a complex codebase | 3 | 4 | 12 | Monolith, conventions, pure domain logic with tests, documented decisions | E/F |
| R-O02 | PGlite behaves differently from production Postgres | 2 | 3 | 6 | Run the integration suite against a Neon branch in CI before release | E |
| R-O03 | Hosting outside Nigeria causes latency or data-transfer problems | 3 | 2 | 6 | Lightweight pages. Legal review of transfers (O-03) | E/Lg |
| R-O04 | Email deliverability to Nigerian corporate domains | 3 | 3 | 9 | Authenticated domain (SPF/DKIM/DMARC). The in-app "awaiting response" list doesn't rely on email | E |
| R-O05 | Scope creep delays design-partner release | 3 | 3 | 9 | MoSCoW discipline. W list in PRD §13 | F/E |
| R-O06 | Dev environment diverges from production (webpack dev vs Turbopack build; Node 22.11 locally; Chrome-driven e2e) and hides bugs | 3 | 2 | 6 | Upgrade local Node to ≥22.12; run e2e against a production build in Slice 8; CI on Linux | E |

## Change log

| Date | Change |
|---|---|
| 2026-11-18 | Created |
| 2026-11-18 | Payment provider switched to Bachs: R-L01 and R-PAY03 rewritten; R-PAY07 (provider assurance, score 15) added |
| 2026-11-18 | Added R-O06 (dev toolchain divergence). Updated R-S02 note: Better Auth rate-limit storage is in-memory until moved to DB |
