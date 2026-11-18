# Retenum — Operating Model

*Phase 2 discovery · 18 November 2026 · Builds on `RETENUM_PRODUCT_DISCOVERY.md` (Phase 1). Desk research and design reasoning only. There have been no customer interviews or pilots, so nothing here is validated.*

**Labels used**
- **[Fact]**: verified from a primary or credible source (linked).
- **[Finding]**: from research or commentary. Real, but limited.
- **[Design proposal]**: how we think Retenum *could* work. Untested.
- **[Assumption]**: believed, not tested.
- **[Open]**: we cannot decide yet (see section 9).

Nothing in this document is legal advice. Legal points are flagged so a qualified lawyer can review them.

**What Phase 1 concluded (in one paragraph).** The money problems between hiring and hired parties have two root causes. The first is **unconfirmed commitments**: changes, extras and "it's done" claims agreed informally and never confirmed by both sides. The second is **cash and power**: the payer simply pays late. A shared record can help with the first and barely touches the second. This document explains how Retenum would work in practice to fix the first, and is honest about where it won't help.

---

## 1. Product Operating Model

### 1.1 What Retenum does, in one sentence

**Retenum is a shared record in which nothing about the deal counts as agreed until both parties have confirmed it, and nothing confirmed can be quietly changed afterwards.**

### 1.2 How it works, in plain English

1. One party creates an **engagement** (a single piece of paid work between two parties) and invites the other.
2. Together they confirm the **baseline**: what will be delivered, by whom, by when, for how much, and when money becomes payable. This is version 1 of the deal.
3. As work happens, either party can **propose** something: a change, a completed delivery, a deduction, a payment made. Each proposal waits for the other party to **respond**: confirm, reject, counter-propose, or dispute.
4. Confirmed proposals update the **current position**. Rejected or disputed ones stay visible as open items. Nothing is deleted.
5. Both parties always see the same **statement**: agreed value, what has become due, what has been requested, what has been paid, what is outstanding, and what is disputed.
6. At the end, both confirm a **final account**, or the engagement closes with the open items clearly listed.

### 1.3 What Retenum is *not*

- **Not a project manager.** It doesn't schedule tasks or manage teams.
- **Not an accounting system.** It records obligations and reconciles payments. It doesn't do bookkeeping, tax or payroll.
- **Not a bank or escrow service.** It doesn't hold or release money (Phase 1, section 6.4).
- **Not a judge.** It records each side's position. It never decides who is right.
- **Not a chat app.** Conversations can happen anywhere. Retenum is where the *outcome* of a conversation becomes a confirmed commitment.

### 1.4 The core idea: "confirm what we discussed"

**[Design proposal]** The most valuable single action in Retenum may be this: after a phone call, a site visit or a WhatsApp exchange, one party logs *"We agreed: extra double socket in kitchen, $150, no change to finish date"* and the other party taps **Confirm**. That one step turns an informal agreement, which Phase 1 found to be the most common failure point, into a dated, two-party record.

### 1.5 Where this model could fail (challenge)

- **Friction.** Every confirmation is an extra step. If confirming takes longer than a WhatsApp thumbs-up, people won't do it.
- **Relationship damage.** Asking a homeowner or client to formally confirm every small change can feel distrustful. Some payees may avoid it to keep the relationship warm.
- **Power.** A large contractor or corporate client can simply refuse to use Retenum. Then the record is one-sided (see section 9, P1).
- **Late payment remains.** A perfect record of what is owed does not make a reluctant payer pay.

---

## 2. The Two Parties

### 2.1 Why each party would use it

| | **Hiring party (payer)** | **Hired party (payee)** |
|---|---|---|
| Main fear | Paying for work not done, done badly, or never agreed. Surprise extras on the final bill | Doing work and not being paid, especially for extras. Endless "not finished yet" |
| What Retenum gives them | Every price change needs their confirmation. Payment is tied to delivery they have reviewed. A running total that matches what they agreed | A confirmed record of extras *before* doing them. A clear point at which work counts as delivered. A statement showing what is due and overdue |
| Information they need | What was agreed, what has changed and why, evidence of delivery, what they owe and when | Confirmed scope and prices, the client's responses, what has been paid, what is disputed and why |
| Likely reason to join | Protection and price certainty (strongest for consumers and smaller businesses) | Getting paid for all work, and spending less time chasing |
| Likely reason to refuse | "Feels like the contractor's tool." "Another system." "I'd rather keep flexibility." | "My client won't use it." "I already have Buildertrend / HoneyBook." |

**[Assumption]** The payee will usually bring Retenum into the relationship (Phase 1, section 6.2). The design must therefore make it *safe and worthwhile for the payer to join*, or it becomes a payee tool with a guest login.

### 2.2 What each party can do

| Action | Payer | Payee | Notes |
|---|---|---|---|
| Create an engagement and invite the other | ✓ | ✓ | Either can start |
| Propose the baseline agreement | ✓ | ✓ | Usually the payee (from their quote) or the payer (from their purchase order) |
| Propose a change (add, remove, quantity, price, date, specification, responsibility) | ✓ | ✓ | Payers request extras. Payees flag discovered problems and price rises |
| Log "what we discussed" for confirmation | ✓ | ✓ | |
| Claim a delivery or completion | — | ✓ | The payer can log delivery of *their own* obligations (e.g. "site access provided") |
| Accept, partly accept, reject or request correction of a delivery | ✓ | — | The payee responds the same way to the payer's own obligations |
| Propose a deduction (defect, backcharge, delay) | ✓ | — | Treated as a proposal, not a fact |
| Log a payment made | ✓ | — | |
| Confirm receipt of a payment | — | ✓ | So both sides agree the money arrived |
| Dispute any proposal or response | ✓ | ✓ | |
| Add evidence or comments to any item | ✓ | ✓ | |
| Propose closure / final account | ✓ | ✓ | |
| Export the full history | ✓ | ✓ | Each party can always take the record away |

### 2.3 What neither party can do alone

- Edit or delete anything already confirmed, or anything already sent to the other party.
- Confirm their own proposal.
- Change the price, scope, dates or payment terms in force.
- Mark a disputed item as resolved.
- Remove the other party's access to the record they shared.
- Change the response rules (deadlines and what silence means) after the baseline is confirmed, except through a confirmed change.

### 2.4 Keeping the product neutral

**[Design proposal]** Neutrality has to be built into the rules, not promised in marketing:

1. **Symmetry.** Both parties have the same kinds of powers: propose, respond, dispute, evidence, export.
2. **Payer obligations are commitments too.** "Client provides brand assets by 3 March" or "homeowner clears the kitchen by Monday" are recorded and tracked exactly like the payee's deliverables. This is the clearest protection *for the payee* that doesn't feel like pressure on the payer.
3. **No default favours either side.** What silence means, how long responses take and how disputes are flagged are set *by both parties* when they confirm the baseline. Retenum's defaults should be neutral (section 3E).
4. **Only shared information.** The payer never sees the payee's costs or margins. The payee never sees the payer's internal budget. Retenum holds the *shared deal*, not either side's private books.
5. **A dispute is a status, not a verdict.** Retenum shows both positions side by side.
6. **Either party can leave and keep the record.**
7. **No scores or ratings of the other party.** Ratings would turn the record into a pressure tool. (Possibly revisit later; see section 7.4.)

---

## 3. Complete Engagement Workflow

```
 START ──► BASELINE ──► WORK ◄──► CHANGES ──► DELIVERY & ACCEPTANCE ──► MONEY ──► CLOSURE
           (v1)         evidence    (v2, v3…)   claim → review → response   due → requested →    final account
                                                                             paid → outstanding    or closed with
                                     ▲                                              │              open items
                                     └──────── disputes can arise at any stage ─────┘
```

### A. Starting an engagement

| Question | Answer |
|---|---|
| Who can start it? | Either party. **[Assumption]** In most small jobs the payee starts from their quote. In supplier and procurement cases the payer starts from a purchase order. |
| How does the other party join? | By an invitation link. **[Open, P1]** Whether they need a full account or can respond with a lightweight confirmation (email link plus identity check) is a key adoption decision. |
| What information is needed? | The two parties (names, legal entities, the people authorised to approve), a short description, currency, and a reference to any existing contract document. |
| What if a signed contract, quotation or purchase order already exists? | It is attached as the **source document**. The parties then confirm a structured summary of its key commitments (items, prices, dates, payment terms). **[Open, P10]** We need to decide what happens if the summary and the document disagree. The safest default is "the signed document governs; the Retenum record evidences performance and changes." |
| When is the engagement mutually confirmed? | When both parties confirm the baseline. Until then it is a **draft**, visibly labelled as unconfirmed, and nothing in it counts as agreed. |

### B. Establishing the agreement (the baseline)

Each **commitment** in the baseline records:

| Field | Example | Why it matters |
|---|---|---|
| What | "Supply and fit 14 m² floor tiles, type X" | Defines scope |
| Who owes it | Payee (or payer, for payer obligations) | Makes responsibilities two-way |
| Quantity and unit | 14 m² | Allows changes by quantity and partial acceptance |
| Specification / definition of done | "Grouted, sealed, level within 3 mm" | The single biggest reducer of "it's not finished" disputes (Phase 1, section 4.1) |
| Due date | 12 March | Basis for delay records |
| Price | $2,100 (or rate × quantity) | Basis for the financial record |
| Exclusions | "Excludes removal of existing floor" | Prevents future arguments about scope |

**Payment terms** are recorded separately as **payment obligations** with a *trigger* (what makes them due) and *terms* (how long after the trigger). See section 6. Examples: "10% deposit on confirmation," "40% on acceptance of stage 2," "net 30 after invoice," "5% retention released 60 days after completion."

**Response rules** are confirmed as part of the baseline: how many days each party has to respond to proposals and deliveries, and what happens if they don't (section 3E).

**Confirming.** Each party confirms the whole baseline. **[Open, L1]** Whether that confirmation creates or changes a legally binding contract is a legal question. Electronic signatures are generally valid where there is an intention to authenticate (England and Wales: [Law Commission, 2019](https://cms.law/en/gbr/legal-updates/law-commission-report-on-the-electronic-execution-of-documents)). But some contracts have statutory formalities. For example, California home improvement contracts have prescribed contents and deposit limits ([CSLB](https://www.cslb.ca.gov/consumers/hire_a_contractor/Home_Improvement_Contracts/What_Is_A_Contract.aspx)).

### C. Managing work

- **Progress** is optional in the minimum product. Retenum is not a progress tracker. Progress matters only where it triggers money (e.g. construction progress billing) or where a party wants to build evidence.
- **Evidence** (photos, documents, delivery notes, timesheets, test certificates) is always attached to a *specific commitment or proposal*, never to a general folder. That is what makes it useful later.
- **Communication.** Short comments can sit on an item ("Can you send a closer photo of the grout line?"). **[Design proposal]** Retenum should not try to replace email, phone or WhatsApp. Its job is to capture the *outcome* via "confirm what we discussed."
- **Recorded automatically:** who created or sent each entry and when; when the other party was notified and opened it; response deadlines and when they passed; every version of the agreement; payment confirmations; status changes. Nobody types these, and nobody can edit them.

### D. Managing changes (critical)

**Every change is a proposal with these fields [Design proposal]:**

| Field | Example |
|---|---|
| Proposed by | Payee |
| Type | Add / remove / quantity / price / date / specification / responsibility (one or more) |
| What was agreed | "14 m² tile type X, $2,100, due 12 March" (pulled automatically from the current version) |
| What changes | "Change to tile type Y" |
| Why | "Type X discontinued by supplier" (free text plus optional category: client request, discovered condition, supplier issue, design error, other) |
| Price effect | +$420 |
| Time effect | +3 days to 15 March |
| Effect on payment schedule | Added to stage 3 payment |
| Response needed by | 4 days (per response rules) |
| Evidence | Supplier email |

**How each type of change behaves:**

| Change | Who usually proposes | Notes |
|---|---|---|
| Additional work | Payer asks, payee prices. Or payee proposes after discovering a problem | Classic source of unpaid extras |
| Removed work (an "omission") | Payer | Creates a credit. Payee may claim costs already incurred |
| Quantity change | Either | Price follows the agreed rate if one exists, so it can be fast to confirm |
| Price change (same scope) | Usually payee (cost rise) | Most contentious. Needs a reason |
| Deadline change | Either | Should record the *claimed cause* (who or what caused the delay). Retenum records the claim and does not decide it |
| Specification change | Either | May have no price effect but changes the definition of done |
| Responsibility change | Either | E.g. "client will now supply the appliances." Moves an obligation from one party to the other |

**Who must approve?** The *other* party. A change is two-sided even when the payer asks for it: the payer wants the extra and the payee must agree the price and time. **[Open, P2]** Within a business, *which person* has authority to approve (and up to what amount) needs deciding.

**Possible responses:**
- **Confirm.** A new version of the agreement is created (v2 = v1 + this change).
- **Reject.** The current version stands. The rejected proposal stays in history.
- **Counter-propose.** E.g. "+$300, not +$420."
- **Confirm scope, price to follow.** The work goes ahead; the price is agreed or disputed later. **[Finding]** Construction already has this pattern. The AIA "Construction Change Directive" lets an owner direct changed work while price is unresolved, to be settled later or disputed ([AIA Contracts](https://learn.aiacontracts.com/articles/construction-change-directive-vs-change-order/)). Retenum should support this, because real work often can't wait for pricing.

**What happens if work starts before approval?**
- **[Finding]** Whether the payee can be paid for unapproved extra work depends heavily on jurisdiction and conduct. Some US courts allow recovery ("quantum meruit," meaning payment for the reasonable value of work done) when the owner requested it. Others refuse when the contract required written change orders ([National Law Review, Illinois](https://natlawreview.com/article/risk-providing-free-construction-work-illinois-when-contractor-may-rely-quantum); [Washington Court of Appeals](https://www.courts.wa.gov/opinions/pdf/692259.pdf)). California says an extra-work order is not enforceable against a homeowner unless it states the scope, the price change and the effect on payments and completion ([Cal. B&P §7159.6](https://law.justia.com/codes/california/2023/code-bpc/division-3/chapter-9/article-10/section-7159-6/)).
- **[Design proposal]** Retenum should let a party flag a change as **"work started before confirmation."** That makes the risk visible to both sides at once, rather than months later. It must not imply that payment is owed.

**Keeping the original traceable.** The baseline is never edited. The "current agreement" is always *original + confirmed changes*. Either party can view any earlier version and see exactly which change produced each difference.

> **Useful finding:** California's legal requirements for a home improvement change order (scope, price change, effect on payment schedule and completion date) closely match the change fields above. A well-designed Retenum change record might help payees comply with such rules. That would need legal confirmation in each jurisdiction before being promised.

### E. Delivery and acceptance

**Submitting.** The payee makes a **delivery claim** against one or more commitments ("Stage 2: first-fix electrics complete"), with evidence.

**What qualifies as evidence?** **[Open, P6]** Options range from "anything attached" to "evidence required per commitment" (e.g. photo of each room, test certificate, signed delivery note). Retenum should record *what* was submitted and *when*. It should not claim the evidence is true.

**Inspection and response.** The payer reviews and responds:

| Response | Effect |
|---|---|
| **Accept** | Commitment fulfilled. Any payment triggered by acceptance becomes due |
| **Accept with defects** (partial or conditional) | Accepted, with a list of items to fix (a "snag list"). **[Open, P4]** Whether part of the payment is held until snags are cleared must be set by the agreed payment terms, not by Retenum |
| **Partly accept** | By quantity ("60 of 100 chairs accepted") or by portion. Payment for the accepted part becomes due |
| **Request correction** | Not accepted yet. The payee fixes and resubmits. The correction loop is recorded |
| **Reject** | Must give reasons tied to the definition of done. The payee can dispute |

**What if the payer doesn't respond?** The research is clear that this must not be assumed:

- **[Fact]** General contract law: silence is normally *not* acceptance. Exceptions include where the parties agreed in advance that silence counts, or where past dealings make it reasonable ([Felthouse v Bindley; Restatement (Second) §69 summary](https://en.wikipedia.org/wiki/Felthouse_v_Bindley)).
- **[Fact]** Goods (US): a buyer who fails to reject after a reasonable chance to inspect is treated as having accepted ([UCC §2-606](https://www.law.cornell.edu/ucc/2/2-606)).
- **[Finding]** Construction contracts sometimes build in deemed acceptance. NEC4 treats a contractor's quotation as accepted if the project manager still fails to reply two weeks after being *notified* of the failure ([NEC guidance](https://www.neccontract.com/support/faqs/accepting-quotations-in-a-timely-manner)). The UK Construction Act makes the claimed amount payable if no valid pay less notice is given in time (Phase 1, section 4.3).
- **[Finding]** Platforms do it by agreement. Upwork auto-approves funded milestones after 14 days without response (Phase 1).
- **[Fact]** UK consumers have specific rights. For services, the main remedy is repeat performance and then a price reduction. For goods, there is a 30-day short-term right to reject ([Trading Standards Wales](https://tradingstandards.gov.wales/en/consumer-advice/detail/InDispute/337148/Remedies-and-redress-an-overview-of-your-key-consumer-rights)). Terms that deem a consumer to have accepted may also face unfair-terms rules. **[Open, L2]**

**[Design proposal]** Three possible settings, agreed by both parties in the baseline:
1. **Record only (neutral default).** Silence is recorded ("no response after 7 days"), reminders are sent, and the item is marked overdue for response. It never becomes "accepted."
2. **Deemed outcome after a final notice (business-to-business only, by agreement).** NEC-style: deadline passes → final notice → second deadline passes → recorded as "deemed accepted under clause agreed on [date]." Retenum records that the agreed rule was triggered, not that the work was good.
3. **Off.** No deadlines at all.

**Can acceptance be disputed later?** Yes, in a limited way. Acceptance stays in history and is never reversed. A later **"defect reported after acceptance"** entry can be added (for hidden or latent defects, or warranty claims). Whether that gives a legal remedy depends on the contract and the law (e.g. US "revocation of acceptance" for goods). Retenum just keeps the timeline.

### F. Financial obligations and payments

Covered in full in section 6. Key principles:
- Payment can become due **before** acceptance (deposits, advances, materials, date-based instalments, progress payments) as well as after it.
- Every amount traces back to a commitment or a confirmed change.
- Payments are confirmed by **both** sides (payer logs, payee confirms receipt).

### G. Disagreements and closure

| Situation | How Retenum handles it |
|---|---|
| **Scope disagreement** ("that was included" vs "that's extra") | The disputed proposal shows both positions, linked to the baseline wording. If the work must proceed: "confirm scope, price to follow" |
| **Disputed change** | Stays open as "disputed." The current version is unchanged. The disputed value appears separately in the statement |
| **Disputed delivery** | Rejection reasons vs the payee's response, each with evidence, against the agreed definition of done |
| **Defective work** | The payer proposes a correction request or a deduction. The payee confirms (and fixes or credits) or disputes |
| **Delayed payment** | Overdue amounts flagged automatically from the due dates. Retenum shows how many days overdue. **[Finding]** UK business payees have a statutory right to interest (8% above Bank of England base rate) and fixed compensation of £40–£100 per invoice ([Small Business Commissioner](https://www.smallbusinesscommissioner.gov.uk/interest-calculator-guidance-page/)). Retenum could *show* this. It should not demand or collect it |
| **Partial completion / abandonment** | Either party can log a **stop notice** ("engagement stopped by X on date, reason"). Retenum freezes a **snapshot** at that moment: accepted work, delivered but unreviewed work, paid, due, disputed. That snapshot is exactly what a mediator, adjudicator or court would need. **[Open, L3]** Whether a Retenum entry can count as a formal contractual or statutory notice is a legal question |
| **Final reconciliation** | One party proposes a final account (agreed value, all changes, deductions, payments, retention). The other confirms or disputes specific lines |
| **Closure** | **Closed – agreed:** both confirmed the final account. **Closed – with open items:** one party closed it and the outstanding and disputed items are listed. Retention or warranty periods can keep specific obligations open after closure |

**Retenum never resolves a dispute.** What it can do is produce an **engagement file**: a chronological, exportable record of the baseline, versions, proposals, responses, evidence and payments, for negotiation, mediation, adjudication or small-claims court. **[Open, L4]** How much weight such a record carries as evidence is unknown.

---

## 4. Core Product Model

### 4.1 Which concepts are real objects?

The test applied: *does it have its own identity and lifecycle, and do people need to refer to it on its own?* If not, it is an attribute, a grouping, a status or a calculated view.

| Concept | Verdict | Reasoning |
|---|---|---|
| **Engagement** | **Fundamental object** | The container, the relationship between two parties and its rules |
| **Party** (and its authorised people) | **Fundamental object** | Who is bound, and who can confirm on their behalf |
| **Commitment** | **Fundamental object** | One obligation owed by one party to the other: deliver something, pay something, or provide something (access, information, materials) |
| **Entry** (a proposal or a response) | **Fundamental object — the ledger** | Every statement one party makes and every response by the other. This is the history |
| Original agreement | Not separate. **It is the first confirmed set of entries (version 1)** | A snapshot, not a different kind of thing |
| Deliverable | **Kind of commitment** (owed by the payee) | |
| Payment obligation | **Kind of commitment** (owed by the payer) | Treating money as just another commitment keeps scope and money linked |
| Milestone | **Grouping** of commitments, often used as a payment trigger | Not a separate object |
| Change request | **Kind of entry** (proposal to change commitments) | |
| Delivery claim | **Kind of entry** (proposal that a commitment is fulfilled) | |
| Review / acceptance | **Kind of entry** (a response) | |
| Deduction | **Kind of entry** (proposal to reduce an amount) | |
| Payment record | **Kind of entry** (payer: "paid $X on date"; payee: "received") plus how it is allocated to obligations | The actual money moves outside Retenum |
| Evidence | **Supporting record** attached to entries; cannot be changed once attached | Has identity, but no lifecycle of its own |
| Dispute | **Status of an entry** plus both parties' positions | Not a separate object in the minimum model. Might become one if structured negotiation is added later |
| Closure | **Kind of entry** (final account proposal and response) plus engagement status | |
| Current agreement, balances, overdue amounts | **Calculated views** | Never typed in. Always recalculated from the entries |

### 4.2 How they relate

```
ENGAGEMENT ─── between ───► PARTY A (payer)   PARTY B (payee)
    │                          (people authorised to confirm)
    │
    ├── RESPONSE RULES (deadlines, what silence means) ← agreed in baseline
    │
    ├── COMMITMENTS  (what each party owes)
    │     • deliverables (B → A)     • payer obligations (A → B: access, info…)
    │     • payment obligations (A → B: deposit, milestone, retention…)
    │     • grouped into milestones/stages where useful
    │
    └── LEDGER OF ENTRIES  (add-only history)
          proposal ──► response
          (baseline, change, "what we discussed", delivery claim, deduction,
           payment logged, stop notice, final account)
                │                      │
          evidence attached      confirm / reject / counter / dispute / (deemed, if agreed)
                │
                ▼
          CONFIRMED entries ──► recalculate ──► CURRENT POSITION
                                                • current agreement (v1 + changes)
                                                • statement (agreed/due/requested/paid/outstanding/disputed)
                                                • open items (awaiting response, disputed, overdue)
```

**The model in one line:** two parties, a list of commitments, and a history of proposals and responses that changes those commitments. Everything else is derived from those.

**Challenge.** This model is deliberately minimal. It might be *too* abstract for small businesses who think in "jobs," "quotes," "extras" and "invoices." The interface would need to speak their language (section 9, P9) while the underlying model stays the same.

### 4.3 Two parties first, linked engagements later

**[Finding]** Real projects form chains (owner → contractor → subcontractor → supplier), and payment delay travels down the chain (Phase 1).

**[Design proposal]** Keep each engagement strictly **two-party**. A subcontract is its **own engagement**, which can later be **linked** to the main one. The link lets a contractor see that "this change on the main contract created this change on the subcontract." The rule: **no visibility crosses the link.** A subcontractor never sees the main contract's prices, and the owner never sees the subcontract.

Reasons:
- Confidentiality. Margins between tiers are commercially sensitive.
- Each relationship has different terms.
- It avoids multi-party permission complexity before the basic model is proven.

**Risk:** "pay-when-paid" chains (the contractor pays the sub only when the owner pays the contractor) create links between engagements that Retenum might later need to represent. This is noted as a later decision (P8).

---

## 5. The Commitments Ledger

### 5.1 What kind of record is it?

The brief asked whether the ledger should be an immutable history, a record of proposals and responses, a record of confirmed obligations, or a combination. **[Design proposal]** It should be a combination, structured like a bank account:

| Layer | Bank analogy | Retenum |
|---|---|---|
| **History** (add-only, unchangeable) | Every transaction on the statement | Every proposal and response, with time, author and evidence |
| **Current position** (calculated) | Your balance | Current agreement (version N), commitments and their status, financial statement |
| **Open items** (calculated) | Pending transactions | Proposals awaiting response, disputes, overdue responses, overdue payments |

Nobody edits the balance directly. It is always recalculated from the history. That is how Retenum shows **what is true now without losing how it got there.**

### 5.2 Life of an entry

```
            ┌──► CONFIRMED ──► changes the current position (new version where relevant)
            │
PROPOSED ───┼──► REJECTED ───► no change; stays in history (proposer may dispute or re-propose)
 (sent to   │
  the other ├──► COUNTERED ──► becomes a new proposal from the other party
  party)    │
            ├──► DISPUTED ───► no change; shown as disputed with both positions
            │
            ├──► WITHDRAWN ──► (by proposer, before any response) stays in history
            │
            └──► NO RESPONSE ─► "response overdue" recorded; reminders
                                └─► DEEMED (only if both agreed a deemed rule in the baseline)
```

### 5.3 Rules of the ledger

1. **Add-only.** Mistakes are corrected by a new entry ("correction to entry #14"), never by editing.
2. **Every entry has an author, a time, and a link** to the commitment(s) it affects.
3. **Only confirmed (or validly deemed) entries change the current position.**
4. **Versions.** Each confirmed change to scope, price, dates or terms creates a new version number. Payments and deliveries change *status* and *balances*, not the agreement version.
5. **Evidence, once attached, can't be replaced**, only supplemented.
6. **Drafts are private** until sent. Once sent, an entry belongs to the shared record.

**[Open, L6]** Privacy law and "never delete" can conflict. Under GDPR-type laws people can ask for personal data to be erased. That has to be reconciled with an unchangeable record, for example by retaining commercial records for a legal period but removing personal details. This needs legal design before any build.

---

## 6. Financial Model

### 6.1 The six numbers both parties see

| # | Number | Plain meaning | Where it comes from |
|---|---|---|---|
| 1 | **Agreed** | Total value of the deal *as it currently stands* | Baseline prices + confirmed changes − confirmed omissions |
| 2 | **Due** | Amounts whose trigger has happened (whether or not yet payable under the terms) | Payment obligations whose trigger is confirmed: date reached, deposit on signing, delivery accepted, progress confirmed, materials delivered |
| 3 | **Requested / invoiced** | What the payee has formally asked to be paid | Payment request entries (or invoices referenced from the payee's accounting tool) |
| 4 | **Paid** | Money that both sides agree has arrived | Payer-logged payments confirmed by the payee |
| 5 | **Outstanding** | Due − paid, with **overdue** shown where the payment-terms date has passed | Calculated |
| 6 | **Disputed** | The part of a due or requested amount the payer has formally contested, with reasons | Dispute entries. **The undisputed remainder stays due** |

Two more balances sit alongside:
- **Retention held:** money kept back from payments under the agreement, with its release condition.
- **Advance credit:** deposits or advances paid that have not yet been set against delivered work.

**Why "due" and "requested" are separate.** In some industries money is due automatically on a trigger (construction progress, consumer deposit). In others nothing is payable until an invoice is issued. Keeping them separate shows both "you haven't invoiced this yet" and "you invoiced this but it isn't due."

**[Finding]** The rule that disputing part of an amount shouldn't freeze the rest mirrors UK construction practice, where the payer must state in a pay less notice what they intend to pay and why ([CMS](https://cms.law/en/gbr/legal-updates/Late-payment-reform-What-UK-construction-developers-and-contractors-need-to-know)). It is also how procurement three-way matching works: pay for what was received and raise an exception for the rest ([summary](https://www.tradogram.com/blog/three-way-match-accounts-payable)).

### 6.2 How each type of money is represented

| Item | How it's represented | When it becomes due |
|---|---|---|
| **Deposit** | Payment obligation, trigger = baseline confirmed. Once paid it becomes advance credit, unless agreed as a separate fee | On confirmation. **[Fact]** Some laws cap it: California home improvement deposits are limited to $1,000 or 10%, whichever is less ([CSLB](https://www.cslb.ca.gov/consumers/hire_a_contractor/Home_Improvement_Contracts/What_Is_A_Contract.aspx)) |
| **Advance payment** | Like a deposit, with a rule for how it is set against later amounts ("recouped 20% from each stage payment") | Date or event |
| **Materials payment** | Payment obligation, trigger = evidence of purchase or delivery to site | On confirmed delivery or evidence |
| **Milestone payment** | Payment obligation, trigger = acceptance of a group of commitments | On acceptance (or deemed acceptance, if agreed) |
| **Payment for completed work / progress** | Trigger = confirmed progress valuation (e.g. "60% of item complete") | On confirmation of the valuation. Mainly construction |
| **Retention** | A rule: X% of each payment is held, released on a condition (completion, end of defects period) | Release trigger confirmed. **[Finding]** UK reforms propose banning retentions in construction (Phase 1) |
| **Approved additional cost** | Comes from a confirmed change. Assigned to an existing or new payment obligation | Per the change's stated effect on the payment schedule |
| **Deduction** | Payer proposal (defect, backcharge, delay damages). Confirmed → reduces agreed value or a payment. Rejected → becomes a disputed amount | When confirmed |
| **Partial payment** | Payment record allocated to one or more obligations. The remainder stays outstanding | — |
| **Overdue payment** | Calculated: outstanding past its due date | — |
| **Disputed amount** | Payer's contest of a specific amount with reasons. Can be partial | — |
| **Refund / adjustment** | Credit entry (payee → payer), e.g. after an omission or over-payment | When confirmed |

### 6.3 Worked example (illustrative numbers only)

| Event | Agreed | Due | Requested | Paid | Outstanding | Disputed |
|---|---|---|---|---|---|---|
| Baseline confirmed: $40,000, 10% deposit (credited back equally across 3 stages), stages of 30% / 30% / 40%, 5% retention | 40,000 | 4,000 | 4,000 | — | 4,000 | — |
| Deposit paid and confirmed | 40,000 | 4,000 | 4,000 | 4,000 | 0 | — |
| Change confirmed: +$2,500 (to stage 3) | 42,500 | 4,000 | 4,000 | 4,000 | 0 | — |
| Stage 1 accepted (30% of $40k = $12,000, less 5% retention = $11,400, less 1/3 of deposit = $10,067) | 42,500 | 14,067 | 14,067 | 4,000 | 10,067 | — |
| Payer pays $8,000, disputes $2,067 (claims tile defect) | 42,500 | 14,067 | 14,067 | 12,000 | 2,067 | 2,067 |
| Defect fixed. Dispute withdrawn. $2,067 paid | 42,500 | 14,067 | 14,067 | 14,067 | 0 | 0 |
| *Retention held so far: $600* | | | | | | |

This is the kind of statement both parties would see at any moment. Every number links back to a specific commitment or entry.

### 6.4 What Retenum does *not* do with money

- It does not **move, hold or release** money. Payments happen by bank transfer, card, cheque or the payer's own systems.
- It does not **issue tax invoices** in the minimum product. Payees already use QuickBooks, Xero and similar tools. Retenum can *reference* an invoice and later read it from those systems.
- It does not **collect debts.** **[Open, L5]** If Retenum ever sends payment reminders on a payee's behalf, especially to consumers, debt-collection and consumer-protection rules may apply.

---

## 7. Minimum Complete Workflow

### 7.1 The smallest thing that delivers real value

**Goal:** two real parties can run one real engagement from agreement to final account, and finish with a confirmed record of what was agreed, changed, delivered and paid.

```
1. Payee (or payer) creates engagement from an existing quote / PO   ─┐
2. Other party joins via link                                        │ START
3. Both confirm the baseline: items, prices, definition of done,     │
   payment schedule, response times                                 ─┘
4. During work, either party proposes changes or logs                ─┐
   "what we discussed" → other confirms / rejects / counters         │ CHANGE
   → new version                                                     ─┘
5. Payee claims delivery with evidence → payer accepts /             ─┐ DELIVER
   partly accepts / requests correction / rejects                    ─┘
6. Payment obligations become due from triggers → payer logs         ─┐ MONEY
   payment → payee confirms receipt → shared statement updates       ─┘
7. Either proposes final account → other confirms (or disputes lines)  CLOSE
   → engagement closed, full history exportable by both
```

**What it produces:** a final account both parties confirmed, or a precise list of what's still open, plus a full history either party can take away.

### 7.2 Answers to the brief's questions

| Question | Answer |
|---|---|
| What starts it? | An existing quote or purchase order, and an invitation |
| What does each party do? | Payee: proposes baseline, changes and deliveries, confirms receipt of payments. Payer: confirms baseline, approves or rejects changes, reviews deliveries, logs payments. Both can propose changes, dispute and close |
| What information is exchanged? | Commitments, prices, dates, definitions of done, change details, evidence, payments |
| What gets confirmed? | Baseline, each change, each delivery outcome, each payment, final account |
| What happens when something changes? | A change proposal → response → new version, or an open or disputed item |
| How is delivery established? | Delivery claim + evidence + payer response (or a deemed rule, if agreed) |
| How are financial obligations updated? | Recalculated automatically from confirmed entries |
| Outcome? | A confirmed final account and a shared history |

### 7.3 Capability tiers

| Tier | Capabilities | Why |
|---|---|---|
| **Essential** (workflow breaks without these) | Engagement + invitation · Baseline of commitments with price, date and definition of done · Two-party confirmation · Change proposals with responses and versioning · "Confirm what we discussed" · Delivery claims with evidence and accept / partial / correct / reject · Payment obligations with triggers · Payment logging + receipt confirmation · Shared six-number statement · Dispute status with both positions · Response deadlines with reminders (email) · Full history export | Each is one step of the minimum workflow |
| **Supporting** (makes it practical; can be manual at first) | Start from an uploaded quote or PO · Simple templates per industry · Retention and advance-recoupment rules · Optional deemed-response rules · Rate cards for fast quantity changes · Reading invoices and payments from QuickBooks or Xero · Stop notice and snapshot · Linking to an accounting invoice | Reduce effort. Their absence doesn't break the workflow |
| **Can wait** | Linked engagements (subcontracts) · Multi-party views · Progress-percentage valuations (construction) · Mobile offline capture · Issuing invoices · Payment links · Extracting scope from documents automatically (AI) · Approval limits within large organisations · Showing statutory interest | Each serves one segment or scale level. Validate first |
| **Not Retenum** | Task and schedule management · General chat · Bookkeeping and tax · Holding or releasing money (escrow) · Deciding disputes · Legal advice or contract drafting · General file storage · Public ratings of parties | Either already well served by others, would compromise neutrality, or brings regulatory burden without proven need |

**On AI, payments, messaging and file storage:** none is essential to the core workflow. AI could later reduce setup effort (turning a quote into commitments). That's a supporting role, not a reason to exist.

### 7.4 Deliberately excluded for now: reputation

Ratings or payment-behaviour scores might be the only lever that affects late payment (Phase 1, section 2.3). But they turn a neutral record into a pressure tool and invite gaming. Excluded from the minimum product. Revisit only with evidence.

---

## 8. Real-World Scenarios

*All figures are illustrative, not research data.*

### 8.1 Homeowner hires a contractor (kitchen renovation, $48,000)

| Stage | What happens in Retenum |
|---|---|
| **Start** | The contractor creates the engagement from their quote and invites the homeowner by text and email link |
| **Agreed** | 22 line items (demolition, cabinets, worktops, tiling, electrics, plumbing), each with a definition of done. Homeowner obligations: empty the kitchen by day 1, choose tiles by day 10. Exclusions: appliances |
| **Money** | Deposit (capped by law in some places, e.g. California), 3 stage payments on acceptance, 5% held until the final walkthrough. No deemed acceptance (consumer) |
| **Changes** | (1) The homeowner upgrades tiles, +$2,400: confirmed in a day. (2) The contractor finds rotten subfloor, +$3,100 (discovered condition). The homeowner disputes the price but agrees the work must happen: **"scope confirmed, price to follow."** (3) An extra socket agreed on site is logged via "confirm what we discussed," +$150, confirmed |
| **Delivery** | Stage claims with photos per room. At the final walkthrough, the homeowner **accepts with a snag list** of 6 items |
| **Acceptance & payment** | Stages 1 and 2 accepted and paid. The final stage stays partly outstanding until snags are cleared, per the agreed terms |
| **Disagreement** | The subfloor price. Both positions are recorded with evidence (photos, supplier invoice). It's settled at $2,700 by a counter-proposal. Had it not been, the engagement file supports mediation or small claims |
| **What it reveals** | The two-sided fear matches Retenum well. **Consumer law changes the rules**: no deemed acceptance, statutory change-order requirements, deposit caps. **Discovered conditions** need the "proceed, price later" path. Risk: the homeowner may find formal confirmations off-putting |

### 8.2 Business hires a marketing agency (campaign, $60,000)

| Stage | What happens in Retenum |
|---|---|
| **Start** | The agency creates it from its statement of work. The client's marketing manager joins. The client's procurement team requires invoices through their own system |
| **Agreed** | Strategy, 3 creative concepts, 2 revision rounds, assets for 3 channels, launch date. **Client obligations:** brand assets by week 1, feedback within 3 working days. Rate card for extras (e.g. $1,200 per additional asset) |
| **Money** | 40% on confirmation, 30% on concept approval, 30% on launch. Net 30 after invoice |
| **Changes** | Many small ones: a 4th concept, a third revision round, a new channel. With the rate card, most are **quantity changes at an agreed rate**, confirmed in one tap. The client's feedback arrives 9 days late, so the agency logs a **date change caused by a missed client obligation** |
| **Delivery** | Concepts submitted as files |
| **Acceptance** | Subjective ("not quite on brand"). The definition of done here is about **process** ("up to 2 revision rounds"), not quality. The client requests a correction, which uses up revision round 1 |
| **Payment** | The concept-approval payment becomes due on acceptance. The invoice is raised in the client's procurement portal. Retenum references the invoice and the client logs payment |
| **Disagreement** | "Is round 3 extra?" The baseline says 2 rounds included. The change shows a proposed $2,000. The client counters at $1,000, and the agency confirms |
| **What it reveals** | The value is mostly **more complete billing of small, frequent changes** (Phase 1: agencies rarely bill all out-of-scope work). **Payer obligations and caused delays** matter a lot. **Silence is common**, so B2B deemed approval may be wanted, but it needs evidence from agencies. Retenum must **coexist with the client's procurement and invoicing systems**, not replace them |

### 8.3 Contractor hires a subcontractor (electrical package, $420,000)

| Stage | What happens in Retenum |
|---|---|
| **Start** | The subcontractor proposes using Retenum. The main contractor already runs the project in Procore and may refuse (**the weakest point for payer participation**) |
| **Agreed** | A line-by-line price breakdown (a "schedule of values"), drawings by reference, programme dates. Subcontract terms often include "pay-when-paid" clauses and 5–10% retention (US). In the UK, statutory payment notice rules apply |
| **Money** | Monthly **progress claims** based on percentage complete, not discrete acceptance. Retention on each claim. Lien waivers (US) on payment |
| **Changes** | The contractor directs extra circuits urgently, so the change is **"proceed, price to follow"** (the construction change directive pattern). There are also design-driven changes and a demand to work faster (acceleration) |
| **Delivery** | Progress valuations, not one-off acceptance. The contractor confirms 55% instead of the claimed 65%. The difference is a disputed amount |
| **Payment** | Claimed $X, contractor confirms $Y, pays $Y − retention. The undisputed portion is due; the rest is disputed |
| **Disagreement** | A backcharge for site clean-up (a deduction proposal), which the sub disputes |
| **What it reveals** | The core model holds (commitments, changes, proposals and responses, statement). But **progress valuation** replaces accept/reject. **Statutory regimes** (Construction Act notices, lien law, retention reform) need specialist treatment. **Linked engagements** to the main contract matter here. The payer is often already in a dominant system. **Conclusion: commercial subcontracting probably needs a specialised version later, not the first one** |

### 8.4 Business buys goods from a supplier (400 custom hotel chairs, $96,000)

| Stage | What happens in Retenum |
|---|---|
| **Start** | The hotel group creates it from its purchase order. The supplier joins |
| **Agreed** | 400 chairs, specification and approved sample, delivery in 2 batches, delivery location |
| **Money** | 30% advance on confirmation, balance net 30 after each accepted batch |
| **Changes** | The supplier proposes a 6% price rise (raw material costs) and a two-week delay. The buyer rejects the price but accepts the delay. Later the buyer increases the quantity to 420 at the agreed unit price, confirmed quickly |
| **Delivery** | Batch 1: 200 delivered with a delivery note and photos |
| **Acceptance** | **Partial by quantity:** 188 accepted, 12 rejected (damaged), with photos. The supplier confirms and replaces the 12. **[Fact]** In US goods sales, failing to reject after a reasonable chance to inspect counts as acceptance (UCC §2-606). So the law already has a default for silence here, unlike services |
| **Payment** | Due for 188 chairs less the share of the advance. The replacements trigger the remainder when accepted. A credit note is raised if they can't be replaced |
| **Disagreement** | A cost claim for the rejected price rise. It stays recorded as rejected; no amount is due |
| **What it reveals** | Quantity-based partial acceptance fits naturally. Goods have **default legal rules on acceptance** that differ from services. Larger buyers already do this with procurement systems (purchase order, goods receipt, invoice matching), so **Retenum's value is likely in SME-to-SME purchasing without such systems**, or for the *supplier's* visibility |

### 8.5 What the scenarios show

| Element | Same across all four? | Where treatment differs |
|---|---|---|
| Engagement, two parties, invitation | ✓ | Who usually starts it (payee from a quote vs payer from a PO) |
| Baseline of commitments with price and date | ✓ | Level of detail (22 items vs a schedule of values vs 1 SKU × quantity) |
| Payer obligations | ✓ | Most important in agency and renovation work |
| Changes as proposal → response → version | ✓ | Frequency and size (agency: many small; construction: fewer, larger, urgent). "Proceed, price later" needed in renovation and construction |
| Delivery and acceptance | Partly | Accept/reject by item (renovation), by revision rounds (agency), **by progress %** (subcontract), **by quantity** (goods) |
| Silence | ✗ | Consumers: no deemed acceptance. Goods: the law has a default. Construction: contract or statute may deem. Agency: unknown, needs evidence |
| Money triggers | Partly | Milestone acceptance (renovation, agency), progress valuation + retention (construction), delivery + net terms (goods) |
| Statutory requirements | ✗ | Heavy in consumer renovation and construction. Lighter in agency and goods |
| Coexisting with other systems | ✗ | Procore (construction), procurement portals (agency clients), ERP (larger buyers) |

**Conclusion.** One core model works across all four. But **acceptance methods, silence rules, money triggers and legal requirements genuinely differ.** They should be handled as a small number of **engagement types** built on the same core, not as one universal process. Residential renovation and agency work need the fewest special rules among the higher-pain segments. That is consistent with Phase 1's shortlist.

---

## 9. Unresolved Decisions

### 9.1 Product decisions

| # | Decision | Why it matters | Options | Trade-offs | Evidence needed |
|---|---|---|---|---|---|
| **P1** | **How the payer participates** | Without payer responses the record is one-sided | (a) Full account required (b) Respond by secure link, no account (c) One-sided mode: the payee records and sends confirmations by email, and silence is logged | (a) strongest record, most friction (b) balanced (c) easiest, weakest record | Concierge pilot: payer response rates by method. Payer interviews on objections |
| **P2** | **Who can confirm on behalf of a party** | A site foreman "agreeing" a $20k extra may not bind the company | Anyone invited / named approvers / approvers with amount limits | Simplicity vs reliability | Interviews: how authority works today in each segment |
| **P3** | **Silence and response deadlines** | Determines whether stalled approvals ever resolve | Record only / deemed after final notice (B2B, by agreement) / none | Neutrality and legal safety vs effectiveness | Legal review (L2). Agency and supplier interviews: do their contracts already deem acceptance? |
| **P4** | **Partial acceptance granularity** | Affects fairness and payment timing | By item / by quantity / by % / conditional with snag list | Flexibility vs complexity | Real past disputes: how partial acceptance happened |
| **P5** | **Which payment structures to support first** | Defines the first market | Milestone + deposit (renovation, agency) / progress % + retention (construction) / delivery + net terms (goods) | Breadth vs depth | Segment choice (Phase 1) |
| **P6** | **Evidence standard** | Too loose = weak record; too strict = friction | Free attachments / suggested evidence per item / required evidence per item / captured with time and location data | Trust vs effort | Dispute file review: what evidence actually decided outcomes |
| **P7** | **How far disputes go in the product** | Risk of looking like an arbitrator | Status + positions only / structured offer and counter-offer / referral to outside mediators | Usefulness vs neutrality and liability | Interviews: what happens after disputes today, and cost |
| **P8** | **Multi-party** | Needed for construction and supply chains | Two-party only / two-party + links / shared multi-party | Simplicity vs real-world fit | Subcontractor interviews (later phase) |
| **P9** | **Industry handling** | Generic = vague; vertical = narrow | One core + engagement types and vocabulary / separate vertical products | Expansion vs fit | Pilots in two segments using the same core |
| **P10** | **Relationship to the signed contract** | Conflicts between record and document | Retenum summarises and evidences / Retenum *is* the agreement for small jobs without a contract | Safety vs usefulness for informal jobs | Legal review (L1, L3). How many target jobs have no written contract |
| **P11** | **Data ownership on exit** | Trust for both sides | Both keep full copies / shared archive / time-limited access | | Interviews. Legal input (L6) |

### 9.2 Legal questions (for qualified lawyers, in the target jurisdiction)

| # | Question |
|---|---|
| **L1** | Does confirming the baseline or a change in Retenum create or vary a binding contract? What makes that confirmation reliable (identity, intent, audit trail)? |
| **L2** | Are agreed "deemed acceptance" rules enforceable between businesses? Are they unfair or unenforceable against consumers? |
| **L3** | Can a Retenum entry satisfy statutory formalities: home improvement contract and change-order rules (e.g. California §7159 and §7159.6), Construction Act payment and pay less notices, contractual notice clauses? |
| **L4** | What evidential weight would the record carry in adjudication, arbitration or small-claims court? |
| **L5** | Do reminders and overdue notices to consumers trigger debt-collection or consumer-credit rules? |
| **L6** | How do we reconcile an unchangeable record with data-protection rights (erasure, retention limits)? |
| **L7** | What is Retenum's liability if the record is wrong, or if a party relies on it to their loss? |

### 9.3 Commercial assumptions (to test, not decide)

| # | Assumption | Test |
|---|---|---|
| C1 | The payee pays and the payer joins free | Price test with payees. Watch whether payers object to a "payee's tool" |
| C2 | The main value is more complete billing (extras captured) plus price certainty for the payer | Pilot metrics (section 10) |
| C3 | Engagement frequency supports a subscription (agencies: yes; homeowners: one-off) | Interviews: engagements per year per payee |
| C4 | Users will confirm changes in Retenum rather than by message | Concierge pilot: share of changes confirmed through the process |
| C5 | Renovation and agency are the best first segments | Pilot results compared side by side |

### 9.4 The commercial value claim, honestly stated

**[Assumption, to test]** In order of how strongly we expect to see it:

1. **More complete billing.** Extras confirmed before work, so fewer are absorbed. *Payee value.*
2. **Price certainty.** The final cost equals the baseline plus changes the payer confirmed. No surprise bill. *Payer value.*
3. **Fewer and smaller disputes.** Disagreements are caught at the change or delivery stage, with evidence. *Both.*
4. **Faster approvals.** Clear requests with deadlines. *Both.*
5. **Less admin and chasing.** One statement instead of reconstructing emails. *Both.*
6. **Faster payment.** **Not claimed.** At most an indirect effect: undisputed amounts made clear, overdue amounts visible to the payer (Phase 1 found payers often don't realise how late they are). Must be measured, not promised.

---

## 10. Recommended Next Steps

These build on Phase 1, section 9 (interviews, dispute file review, price test) and add tests specific to the operating model. **Nothing here requires building software.**

| # | Step | What it tests | How | Success signal |
|---|---|---|---|---|
| 1 | **Paper walkthrough with real pairs** | Whether both sides understand the model and accept it | Take 8–10 recently finished engagements (renovation and agency). Rebuild each in a simple shared document or spreadsheet as baseline → changes → deliveries → statement. Walk both parties through it separately | Both say it reflects what happened and would have prevented at least one argument. Note objections from payers |
| 2 | **Concierge pilot** (live, manual) | Payer participation (P1), friction (C4), silence (P3), value (C2) | 5–8 live engagements: 3 renovation, 3 agency, 1–2 SME supplier. Founder runs the process by email and shared sheet: baseline confirmation, change confirmations, delivery responses, payment confirmations | Payer responds to more than 70% of requests within the agreed time (target to set in advance). Changes are confirmed *before* work in most cases |
| 3 | **Response method test** | P1 | Within the pilot, compare responses via secure link vs "reply YES to this email" vs a call | Response rate and time by method |
| 4 | **Dispute file review** (Phase 1 step, sharpened) | P4, P6, C2 | 15–20 past disputes. Classify: unconfirmed change / disputed completion / quality / payment only. For each, ask "would a confirmed record have changed the outcome?" | More than half involve unconfirmed changes or completion (threshold to be agreed) |
| 5 | **Legal review in ONE jurisdiction** | L1, L2, L3, L6 | Brief one lawyer covering consumer + B2B contracts in the chosen geography | Clear answer on confirmation validity, deemed acceptance and statutory change orders |
| 6 | **Price test** (Phase 1 step) | C1, C3 | After the walkthrough, ask payees for a pre-order or letter of intent at a stated price | Payees commit money or a signed intent, not just praise |
| 7 | **Choose a geography** | Legal and segment fit | UK vs US (state). Consumer and construction rules differ sharply | Decision made before the PRD |

**Pilot metrics** (record a baseline from each participant's last comparable job):

| Metric | Who benefits |
|---|---|
| % of changes confirmed before the work was done | Both |
| Value of extras billed vs the previous comparable job | Payee |
| Final cost vs baseline + confirmed changes (surprise amount) | Payer |
| Number and value of disputed items, and days to resolve | Both |
| Days from change request to response. Days from delivery claim to response | Both |
| Days from invoice to payment (measured, not promised) | Payee |
| Self-reported hours spent chasing approvals or payment | Payee |
| Did both parties confirm the final account? | Both |

**Before writing a PRD, we should be able to say:**
1. Payers in at least one segment actively respond to proposals (step 2).
2. A material share of past disputes came from unconfirmed changes or completion (step 4).
3. The core confirmation mechanics are legally sound in our chosen jurisdiction (step 5).
4. Payees will commit money (step 6).
5. Which one segment and one geography we are designing for first.

If payers won't participate, or disputes turn out to be mostly about cash rather than unclear commitments, the operating model in this document should be reconsidered before anything is built.
