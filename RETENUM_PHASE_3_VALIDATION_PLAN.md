# Retenum — Phase 3: Customer and Workflow Validation Plan

*18 November 2026 · Builds on `RETENUM_PRODUCT_DISCOVERY.md` (Phase 1) and `RETENUM_OPERATING_MODEL.md` (Phase 2). This is a plan. No research in it has been carried out yet. There are no interview findings or pilot results. Development is not authorised.*

**Labels**
- **[Established]**: supported by Phase 1 or 2 desk research (sources are in those documents).
- **[Assumption]**: carried forward untested.
- **[Test]**: what Phase 3 will do.
- **[Unresolved]**: a decision we cannot make yet. The evidence needed is stated.

**Provisional thresholds.** Every numerical threshold in this plan is a *working hypothesis* set before data collection so that we can't move the goalposts afterwards. None is an industry benchmark. With samples this small (8–10 reconstructions, 30–40 interviews, 5–8 pilots), results show *direction and mechanism*, not market-wide demand.

---

## 1. Phase 3 Purpose and Research Questions

**Purpose.** Produce a defensible **GO / REVISE / NO-GO** decision on whether Retenum solves a painful, frequent, commercially valuable problem for *both* parties, and identify what must be decided before a PRD.

**Research questions** (each maps to the evidence objectives in the brief):

| # | Question | Main methods |
|---|---|---|
| RQ1 | Do the problems identified in Phases 1–2 actually occur in real engagements, and what *really* causes the losses? | Reconstructions (section 5), interviews (6) |
| RQ2 | How large are the losses in money, time, delay and disputes? | Reconstructions, interviews |
| RQ3 | Could a shared record of commitments, changes, delivery and payment have prevented or reduced them, or only documented them? | Reconstructions ("counterfactual" test), pilot (8) |
| RQ4 | Will **both** parties participate, and under which participation method? | Participation experiment (7), pilot |
| RQ5 | Is the workflow useful **without** holding money, processing payments or acting as a legal authority? | Pilot, interviews, legal review (12) |
| RQ6 | Will at least one side **commit money**? | Willingness-to-pay experiments (11) |
| RQ7 | Which segment has the strongest combination of pain, access, participation and willingness to pay? | Market comparison (13) |
| RQ8 | Does the model need to separate **agreement, authorisation and valuation**? | Reconstructions, walkthroughs, pilot (sections 5.4, 8.5) |

---

## 2. Assumptions Carried Forward

### 2.1 What previous research established

- **[Established]** Late payment, unpaid extras and disputed completion are common and costly (UK £11bn a year; subcontractors waiting 51–96 days; agencies reporting $1k–$5k+ a month in unbilled scope). *Phase 1, section 2.*
- **[Established]** Losses come from two different roots: **unconfirmed commitments** (which a record can address) and **cash and power imbalance** (which it barely touches). *Phase 1, section 2.3.*
- **[Established]** Existing tools mostly belong to one side. Shared tools tend to hold money. *Phase 1, section 3.*
- **[Established]** The law on silence, deemed acceptance and change orders varies by contract type, consumer vs business, and jurisdiction. *Phase 2, sections 3D–3E.*
- **[Established]** Acceptance methods, money triggers and legal rules differ by segment (by item, by revision round, by progress percentage, by quantity). *Phase 2, section 8.5.*

### 2.2 Assumptions Phase 3 must test

| ID | Assumption (from Phase 1 / 2) | Source | Tested by |
|---|---|---|---|
| A1 | A material share of losses comes from unconfirmed changes or disputed completion, rather than plain late payment | P1 §2.3 | Reconstructions (cause classification) |
| A2 | The payee usually introduces the tool, and the payer will join and respond | P1 §6.2, P2 §2.1 | Participation experiment, pilot |
| A3 | "Confirm what we discussed" is a step parties will actually take | P2 §1.4 | Pilot |
| A4 | Confirming changes before work starts is achievable in practice | P2 §3D | Pilot ("confirmed before work" rate) |
| A5 | The main value is more complete billing (payee) and price certainty (payer), not faster payment | P2 §9.4 | Reconstructions, pilot metrics |
| A6 | A neutral record, with no held money, is enough to change behaviour | P1 §6.4 | Pilot, interviews (escrow comparison questions) |
| A7 | Silence should be recorded as non-response by default. Deemed outcomes only by prior B2B agreement | P2 §3E | Pilot, legal review |
| A8 | Separating undisputed from disputed amounts is understood and useful | P2 §6.1 | Walkthrough, pilot |
| A9 | Payer obligations (access, information, approvals) matter and should be tracked | P2 §2.4 | Reconstructions, pilot |
| A10 | The payee pays; the payer joins free | P1 §6.2, P2 C1 | Willingness-to-pay experiments |
| A11 | Engagement frequency supports a subscription (agencies yes, homeowners no) | P2 C3 | Interviews |
| A12 | Residential renovation and agencies are the strongest first segments. Subcontracting needs a specialised version later | P1 §7, P2 §8.5 | Market comparison |
| A13 | Users understand the six-number statement (agreed, due, requested, paid, outstanding, disputed) | P2 §6.1 | Walkthrough |
| A14 | **New for Phase 3:** agreement, authorisation and valuation may need to be recorded separately | Brief / P2 "scope confirmed, price to follow" | Sections 5.4, 8.5 |

---

## 3. Evidence Gaps and Validation Priorities

Ranked by how much each could change the decision (most decisive first):

| Priority | Gap | Why it matters | If evidence is negative |
|---|---|---|---|
| **1** | **Payer participation** (A2) | Without payer responses the record is one-sided and loses most of its value | REVISE (payee-only tool) or NO-GO |
| **2** | **Root-cause share** (A1) | If losses are mainly cash and power, a record can't influence the outcome | NO-GO or REVISE toward a different value proposition |
| **3** | **Willingness to pay** (A10) | No business without it | REVISE (segment or pricing) or NO-GO |
| **4** | **Prevention vs documentation** (A3, A4, A6) | Documenting a problem is not solving it | REVISE workflow |
| **5** | **Agreement / authorisation / valuation** (A14) | Shapes the core model before any PRD | Model change only |
| **6** | **Segment choice** (A12) | Determines the PRD's scope | Choose a different segment |
| **7** | **Legal boundaries** (A7, L1–L7) | Defines what can safely be claimed | Narrow the claims and design |
| **8** | **Statement comprehension, silence rules, deadlines** (A7, A8, A13) | Detailed design | Adjust design |

---

## 4. Target Segments and Participant Recruitment

### 4.1 Segments

| Segment | Role in Phase 3 | Why |
|---|---|---|
| **Residential renovation** (contractors 1–20 staff; homeowners who renovated in the last 24 months) | Primary candidate | Two-sided fear (P1 §7.2). Consumer rules apply (P2 §8.1) |
| **Agencies and client-service firms** (5–50 staff; their client-side marketing or ops managers) | Primary candidate | Frequent small scope changes. Easy to reach (P1 §7.2, P2 §8.2) |
| **Specialty subcontracting** (trade firms on commercial jobs; main-contractor commercial or quantity-surveyor staff) | Comparison candidate | Highest money at stake. Payer participation expected to be weakest (P2 §8.3). Included so the hypothesis is tested, not assumed |
| **Other: screening only** | Only if evidence emerges | Candidates: **property managers or landlords hiring trades** (repeat payer, frequent small jobs), **SME-to-SME suppliers** (P2 §8.4), **software development studios**. Add a segment to Phase 3 only if ≥3 interviews independently point to it |

Not prioritised: solo freelancers (low willingness to pay, P1 §7) and enterprise procurement (slow, crowded).

### 4.2 Jurisdiction (for recruitment and legal review)

**[Unresolved, decide in week 0]** Legal review must happen in **one** jurisdiction (P2 step 7).
- **Provisional selection: England & Wales.** One legal system covers both consumer (Consumer Rights Act 2015) and construction (the Construction Act payment regime). There is strong official late-payment data (P1). The retention and payment reforms are live.
- **Switch condition:** if the founder's network and recruitment access are mainly US-based, select **California** instead (detailed home-improvement change-order and deposit rules, P2 §3D).
- **All recruitment for the pilot must come from the selected jurisdiction.** Interviews may include a few from outside it, tagged as such.

### 4.3 Interview distribution (target 36 + 2 legal)

| Group | Side | Target | Minimum | Screening criteria |
|---|---|---|---|---|
| Renovation contractors | Payee | 7 | 5 | ≥2 jobs over £10k in the last 12 months |
| Homeowners (renovation) | Payer | 6 | 4 | Job of ≥£10k completed in the last 24 months |
| Agency owners or ops leads | Payee | 7 | 5 | ≥5 active clients. Project or retainer work |
| Agency clients (marketing, ops, procurement) | Payer | 5 | 3 | Hired an agency in the last 12 months |
| Specialty subcontractors | Payee | 4 | 3 | Commercial jobs. Changes or retention in the last 12 months |
| Main contractor commercial staff / QS | Payer | 3 | 2 | Manage subcontract payments |
| Other screened segment (if triggered) | Either | 4 | 0 | As defined when triggered |
| **Legal professionals** | — | **2** | 2 | 1 contract / construction lawyer; 1 consumer or data-protection lawyer, in the selected jurisdiction |
| **Total** | | **36 + 2** | 22 + 2 | |

**Dyads (both sides of the same engagement).** Aim for **≥4 dyads** (e.g. a contractor and that contractor's homeowner, an agency and that agency's client). Dyads are the strongest evidence on whether each side's understanding differed (RQ1) and whether payers will engage (RQ4). Ask every payee interviewee at the end: *"Would you be willing to introduce us to the other party on the job we discussed?"*

**Balance rule.** No segment may finish with fewer than **40% payers** among its interviews, or that segment's payer-participation evidence is marked *insufficient*.

### 4.4 Recruitment channels and incentives

| Group | Channels | Incentive (test) |
|---|---|---|
| Contractors and subcontractors | Founder network; trade associations and local trade groups; builders' merchants (trade counter notices); local tradesperson social-media groups; referrals from each interviewee | £50 voucher or donation, 45 min |
| Homeowners | Neighbourhood groups and forums; renovation forums; referrals from contractors (flag possible bias); personal network | £30 voucher, 40 min |
| Agencies | Agency-owner communities and forums; LinkedIn; founder network; agency accounting or consulting firms | £50 voucher or summary of findings |
| Agency clients | Introductions from agencies (dyads); LinkedIn marketing and ops managers | £40 voucher |
| Main contractor staff | Subcontractor introductions; LinkedIn (QS, commercial manager) | £50 voucher |
| Lawyers | Paid consultation (see section 16 for budget) | Fee |

**Screener (all participants, 5 questions):** role and side; size of business; number and value of relevant engagements in the last 12 months; most recent engagement where something went wrong (yes/no plus one line); willingness to share redacted documents (yes/no/maybe).

**Bias controls.** Track the recruitment source for each participant. Note where people introduced by the other party may be friendlier than average. Don't recruit only people who reported problems: include ≥25% "nothing went badly" engagements in the reconstructions to estimate how often things go wrong.

---

## 5. Retrospective Engagement Reconstruction Method

### 5.1 Scope

**8–10 completed engagements**, at least **3 segments**, no more than 4 from any one segment. Target: 3 renovation, 3 agency, 2 subcontract, plus up to 2 from "other" or extra. **≥2 must be dyads** (both parties interviewed separately). **≥2 should be "nothing went badly"** engagements.

### 5.2 Procedure (per engagement, about 2–3 hours total)

1. **Pre-call (15 min):** confirm consent and confidentiality (section 10.3). Ask the participant to gather the quote or contract, key messages, invoices and payment dates.
2. **Reconstruction interview (60–75 min):** walk the timeline using template R1 (below). Participant shares their screen or reads from documents. **Researcher records facts in bands and codes, not raw documents.**
3. **Second party (if dyad, 45–60 min):** same template, run separately, without revealing the first party's account.
4. **Coding (30–45 min):** fill R2 (incident coding) and R3 (counterfactual test). A second person codes independently for ≥4 of the engagements. Disagreements are resolved by discussion and logged.

### 5.3 Template R1 — Engagement reconstruction

```
ENGAGEMENT ID: R-__   Segment: ______   Jurisdiction: ______   Dyad? Y/N (partner ID: ___)
Interviewee side: Payer / Payee   Role: ______   Recruitment source: ______
Value band: <£5k / £5–25k / £25–100k / £100–500k / >£500k     Duration: ___ weeks
Engagement outcome (interviewee's words): __________________________________

A. ORIGINAL AGREEMENT
A1 Form: written contract / signed quote / emailed quote / PO / verbal / other: ___
A2 What was agreed (main items, price structure, dates):
A3 Payment structure: deposit __% / stages ___ / progress / on completion / retainer / retention __%
A4 Definition of "done" written down?  Yes / partly / no
A5 Payer obligations recorded? (access, info, materials, approvals) Yes / partly / no
A6 What did THIS party understand the agreement to mean? (quote their words)
A7 Anything they now think the other party understood differently? ______

B. CHANGES   (one row per change; add rows)
| # | What changed (add/remove/qty/price/date/spec/responsibility) | Requested by | How communicated (call/site/msg/email/doc) | Documented? (none/msg/email/signed doc) | Work AUTHORISED? (explicit/implied/no) | VALUE agreed? (agreed/estimated/open/never) | Work done before value agreed? Y/N | Value band | Eventually billed? Paid? |

C. DELIVERY AND ACCEPTANCE
C1 How was completion shown? (photos/walkthrough/files/delivery note/sign-off/none)
C2 Acceptance: explicit / implied / silent / disputed / partial
C3 Disagreements about delivery or quality? Describe. How resolved?
C4 Silence or slow responses from the other side? How long? Consequence?

D. MONEY
D1 Agreed value at start: band ___   Final agreed value: band ___
D2 Total invoiced: ___   Total paid: ___   (bands or % of agreed)
D3 Unpaid: ___   Disputed: ___   Never invoiced (unbilled work): ___
D4 Days from invoice to payment: typical ___ / worst ___
D5 Deductions or retention held? Released?

E. RECORDS
E1 Records that exist today: contract / messages / email / photos / invoices / bank / other
E2 Records that were missing when needed: ______
E3 Where the "truth" lived: ______

F. CONSEQUENCES
F1 Money lost or written off: ___   F2 Staff or personal hours spent on the issue: ___
F3 Delay to completion: ___ days   F4 Relationship: continued / damaged / ended
F5 Escalation: none / formal complaint / lawyer / adjudication / small claims / court
F6 Other cost (financing, materials floated, stress-related, reviews): ______

G. CURRENT TOOLS / WORKAROUNDS
G1 Tools used for this job: ______   G2 Anything paid for to prevent this? ______

H. INTERVIEWEE'S VIEW (record separately; opinion, not evidence)
H1 What would they do differently? ______
```

### 5.4 Agreement, authorisation and valuation in reconstructions

For **every change** in section B, record three separate states (R1 columns):

| Dimension | Question | Values |
|---|---|---|
| **Agreement** | Did both parties confirm the terms of the change? | confirmed / one-sided / not at all |
| **Authorisation** | Did the payer permit the work to go ahead? | explicit / implied (e.g. present on site, said "go ahead") / none |
| **Valuation** | What was the status of the price? | agreed / estimated / left open / never discussed |

**What this reveals:** how often changes sit in mixed states (e.g. *authorised + value open*), and whether those mixed states are where losses concentrate. That is direct evidence for or against recording the three dimensions separately (A14).

### 5.5 Template R2 — Incident coding

One row per incident (an engagement can have several). Multiple causes are allowed. Mark **one primary**.

| Code | Cause | Coding guide |
|---|---|---|
| C1 | Unconfirmed original commitments | Parties understood the baseline differently. Scope, exclusions or "done" missing |
| C2 | Unauthorised or undocumented scope change | Work changed without clear permission or record |
| C3 | Authorised but not financially valued | Permission existed. Price open or never agreed |
| C4 | Delivery or acceptance disagreement | "Not finished," "not to spec," endless correction loop, silence on review |
| C5 | Payment delay despite clear agreement | Amount and obligation undisputed. Payment still late |
| C6 | Cash-flow or power imbalance | Payer could not or chose not to pay. Payee could not push back |
| C7 | Poor communication or missing records | The facts may have been agreed, but nobody could prove them |
| C8 | Payer obligation missed | Access, information or approvals late, causing delay or cost |
| C9 | Other (describe) | Must be described. Review C9 entries weekly for new patterns |

```
INCIDENT ID: R-__-I_   Primary cause: C_   Contributing: C_, C_
Value at stake (band): ___   Hours: ___   Delay: ___ days
Evidence basis: documents seen / both parties agree / one party's account only
Coder: ___   Second coder (if any): ___   Agreed? Y/N
```

### 5.6 Template R3 — Counterfactual test ("could a shared record have helped?")

For each incident, both coders independently answer:

| Question | Answer |
|---|---|
| Q1 Which Retenum step would have applied? (baseline confirmation / change confirmation / "confirm what we discussed" / delivery response / payment confirmation / statement / none) | |
| Q2 Would the **payer realistically have confirmed** at that moment? Evidence? | yes / unclear / no |
| Q3 Effect: **prevent** (the issue would not have arisen) / **reduce** (smaller, earlier, or cheaper to resolve) / **document only** (better evidence, same outcome) / **none** | |
| Q4 Rationale (1–2 sentences, citing facts from R1) | |

**Rule:** C5 and C6 incidents default to "document only" unless there is specific evidence otherwise. This stops us crediting Retenum with fixing late payment (P2 §9.4).

### 5.7 Reconstruction outputs

- Share of incidents and value by **primary cause**.
- Share coded **prevent / reduce / document only / none**.
- Distribution of agreement × authorisation × valuation states for changes, and the loss associated with each.
- Points where the two parties' accounts **diverge**, in dyads.

---

## 6. Interview Scripts

### 6.1 Rules for every interview

- Ask about the **most recent specific engagement**, not general habits. "Tell me about the last time…"
- **Never** pitch or describe Retenum before the final section. Never ask "would you use…?", "is this a good idea?" or "would a shared record solve…?"
- For every claim, ask for **the instance**: "When did that last happen? What exactly was said? What do you have in writing?"
- Separate **experienced** from **believed**. Tag each note: **[E]** experienced and specific, **[G]** generalisation ("usually…"), **[H]** hypothetical ("I would…"). Only [E] counts as behavioural evidence.
- Ask for **numbers as ranges** ("roughly how much: under £500, £500–£2k, more?").
- Record **what they already pay for**. Money already spent is the strongest signal of pain.
- 40–50 minutes. Recorded only with consent. Notes made in the evidence log (section 10).

### 6.2 Payee script (contractors, agencies, subcontractors, service providers)

**Opening (3 min).** Purpose: "We're researching how businesses manage agreements, changes and payment on client work. We're not selling anything." Consent, confidentiality, recording.

**Context (5 min)**
1. What kind of work do you do, and for whom? Roughly how many jobs or clients in the last 12 months? Typical value?
2. How do jobs usually start? Who writes what down?

**Most recent problem engagement (20 min)**
3. Tell me about the most recent job where something about scope, changes, sign-off or payment didn't go as expected.
4. What was originally agreed? How was it recorded? Can you show me (redacted)?
5. Did the client understand it the same way? How do you know?
6. What changed during the job? Take each change: who asked, how (call, site, message), what was said.
   - *Follow-up:* At that moment, how did you know you had permission to go ahead? [authorisation]
   - *Follow-up:* Was the price agreed then, later or never? [valuation]
   - *Follow-up:* Did you start before the price was agreed? Why?
   - *Follow-up:* What exists in writing about that change today?
7. How did you show the work was done? How did the client confirm? What happened if they didn't respond?
8. What did you invoice? What was paid? When? What's still unpaid, disputed or never invoiced?
9. What did it cost you: money written off, hours chasing, delay, financing, relationship?
10. What did you do to resolve it? What happened in the end?

**Patterns and tools (8 min)**
11. Is that job typical? Of your last 10 jobs, roughly how many had a change that wasn't priced before the work was done? *(Ask them to check records if possible.)*
12. What tools or methods do you use now for quotes, changes, sign-off and invoicing? What do you pay for them?
13. Have you tried anything specifically to stop unpaid extras or disputes? What happened?
14. When a client is asked to sign or confirm something formally, how do they react? Give me an example. [participation evidence]

**Counterpart and closing (5 min)**
15. If you could change one thing about how changes and sign-off work with clients, what would it be? *(Record as [H].)*
16. Would you introduce us to the client on the job we discussed? *(Dyad recruitment.)*
17. *(Only now)* Brief neutral description of the Phase 2 concept (section 6.4). "What would worry you about using something like this with your clients?" Record objections, not praise.
18. Would you be willing to try a manual version on a live job? *(Pilot recruitment, section 8.)*

**Probes to separate experience from belief**
- "You said clients 'always' delay sign-off. When did that last happen? Which client?"
- "What did you actually do then, not what you'd ideally do?"
- "Do you have that message? What does it say?"
- "Has that ever actually happened, or is it something you worry about?"

### 6.3 Payer script (homeowners, agency clients, main contractors, purchasing decision-makers)

**Opening (3 min).** As for payees. Emphasise: "We're equally interested in the client's side."

**Context (5 min)**
1. What did you hire someone to do recently? Value? How did you choose them?
2. *(Business payers)* Who in your organisation approves extra cost? What systems are involved (POs, procurement portal, finance approvals)?

**Most recent engagement (20 min)**
3. Tell me about the most recent job where scope, cost, quality or timing didn't go as expected.
4. What did you think you were getting for the agreed price? Where was that written?
5. What changed? For each change: who suggested it, how, what you said.
   - *Follow-up:* Did you give permission for the work before you knew the price? Why? [authorisation vs valuation]
   - *Follow-up:* When the price arrived, was it what you expected?
   - *Follow-up:* Was anything charged that you didn't think you'd agreed to?
6. How did you decide the work was finished and acceptable? Did you ever hold back a response or payment? Why?
7. Were there things *you* were supposed to provide (access, decisions, information)? Were any late? What happened? [payer obligations]
8. How did the final cost compare with the original price? What explains the difference?
9. Did you ever pay late or hold back an amount? Why? *(Ask neutrally. Distinguish dispute, cash flow, process and deliberate timing.)*
10. What did the issue cost you: money, time, delay, stress, getting someone else to fix it?

**Patterns and tools (8 min)**
11. How do you keep track of what's been agreed and what you owe? Show me if you can.
12. *(Business)* Do you use any system suppliers must work within? Would you accept a supplier's system? Have you before? Why or why not?
13. When a supplier or contractor has asked you to formally confirm a change or sign off work, how did you feel about it? Did you do it? How fast?
14. Has a contractor or supplier ever used their records against you? What happened? [bias-perception evidence]

**Closing (5 min)**
15. *(Only now)* Neutral concept description (section 6.4). "If your contractor or agency asked you to use this, what would you think they were trying to achieve?" "What would make you refuse?"
16. "Would you personally pay anything for this? Who should pay?" *(Record as [H]. Not willingness-to-pay evidence.)*
17. Would you be willing to take part, with your supplier, in a trial on a current job?

### 6.4 Neutral concept description (read verbatim, end of interview only)

> "One idea we're exploring is a shared record between the two parties on a job. Both sides would confirm the original agreement, any changes and the price of those changes, when work is delivered and accepted, and payments made. Nothing would count as agreed unless both confirmed it, and nothing confirmed could be changed later without the other side agreeing. It wouldn't hold money or decide disputes. What, if anything, would concern you about that?"

### 6.5 Legal professional interviews

These use the question set in section 12, sent in advance as a written brief. They are not run with this script.

---

## 7. Shared Participation Experiment

### 7.1 What we are testing

Whether payers will **open, understand, respond to and keep responding to** confirmation requests from a payee, and whether the **method** changes that. Also whether payers see the process as **protection, admin, or a tool that helps the other side**.

### 7.2 The three methods (no Retenum software. Use existing off-the-shelf tools)

| Method | How it's simulated | What the payer experiences |
|---|---|---|
| **M1: Account required** | A shared workspace in an off-the-shelf tool that needs the payer to **sign up or log in** to view and respond (e.g. a shared spreadsheet or database tool that requires a named account) | Create login → open record → respond in the tool |
| **M2: Secure link, no account** | A **unique link per request** to a view-only summary plus a short response form (Confirm / Reject / Propose change / Question). No login | Click → read → choose a response |
| **M3: Existing channel, structured** | **Email** (or the channel they already use) from the payee, with a structured summary and the instruction: "Reply CONFIRM, REJECT, or describe your change" | Read email → reply |

The **content** of the request must be identical across methods. Use the same template (section 9, T2 or T3).

### 7.3 Two experiment tracks

**Track A: Invitation test (larger sample, lower stakes).** Runs during interviews (weeks 3–6).
- Payee interviewees who agree send their payer (current or recent) a **real, low-stakes confirmation request**. For example: "Can you confirm this summary of what we agreed for [current or upcoming job]?" or a pending change.
- Target **24–30 invitations**, about 8–10 per method. Assign the method in rotation (M1, M2, M3, M1…), balanced within each segment, decided **before** knowing who the payer is.
- The payee sends from **their own identity**. The researcher never contacts the payer without the payee's consent. Payers receive a short note that the payee is participating in research, plus an opt-out.
- **Limitation:** the sample is still small. Treat differences of fewer than ~3 responses between methods as noise.

**Track B: Pilot participation (higher stakes, real use).** Runs during the live pilot (section 8).
- Each pilot engagement is assigned **one primary method for the whole engagement** (to avoid learning effects). Spread methods across engagements and segments as evenly as possible.
- In the final week, offer the payer a **switch** to another method and record whether they take it and why.

### 7.4 What to record (per invitation or request)

| Measure | Definition |
|---|---|
| Opened | Payer opened the link or email (link-click or tool view where available; otherwise payer self-report at follow-up) |
| Understood | At follow-up, the payer can correctly state in their own words what they were asked to confirm (scored: correct / partly / wrong) |
| Responded | Any response within **7 calendar days** (provisional window) |
| Response type | Confirm / reject / propose change / question / refused process |
| Time to response | Hours from send to response |
| Objection | Any stated objection to the record or process (verbatim) |
| Perception | Follow-up question (section 7.5): protection / admin / advantage to the other side / neutral |
| Continuation | (Track B) Responds to later requests without reminders. Accepts or rejects an offer to continue after the pilot |

### 7.5 Payer follow-up call (10 min, within 10 days of the request, all methods)

1. What did you understand you were being asked to do?
2. Why did you respond, or not respond?
3. How did it feel to be asked this way? Did it change how you see the contractor, agency or supplier?
4. Did you feel it gave them an advantage? Gave *you* any protection? Neither?
5. If they asked you this way on every change, would you keep doing it? What would make you stop?
6. Would another way have been easier or more acceptable? *(Show the other two methods briefly.)*

### 7.6 Interpreting results

- **Don't assume less friction means more trust.** M3 (email) may get the most replies but carry the weakest confirmation, and may not be perceived as a "record." Compare response rate *and* understanding *and* perception.
- A method "wins" only if it beats the others on response rate **without** worse understanding, and without more "advantage to the other side" perceptions.
- If **all** methods fall below the participation threshold (section 14), the problem is the *request itself*, not the method. Escalate to REVISE or NO-GO on A2.

---

## 8. Manual Live Pilot Protocol

### 8.1 Scope

**5–8 live engagements**, both parties consenting, in the selected jurisdiction. Target mix: 2–3 renovation, 2–3 agency, 1–2 from the third-ranked segment (subcontract or a screened "other"). Each engagement should have **≥4 weeks** of remaining work and **expected changes**. Run each for **4–8 weeks**, or to completion.

**Tools:** one shared spreadsheet per engagement (tabs per template below), email, and the participation method assigned in section 7. **No Retenum software.** The pilot operator holds the master record.

**Payment:** test a **paid pilot** (section 11, E1). Where a participant won't pay, run free but record it.

### 8.2 Roles and responsibilities

| Role | Responsibilities |
|---|---|
| **Pilot operator** (founder or researcher) | Sets up the record from existing documents. Sends every confirmation request using the templates. Logs responses, timestamps and evidence. Calculates the statement weekly. Sends reminders per the agreed response rules. Never interprets the contract, takes sides or advises. Logs own time per engagement. Runs weekly check-ins and the exit interviews |
| **Payee** | Provides the existing quote or contract. Informs the operator of every change, delivery and invoice within 2 working days (or copies the operator in). Responds to payer proposals. Confirms receipt of payments |
| **Payer** | Reviews and responds to requests within the agreed response time. Informs the operator of change requests they make, payments made and acceptance decisions |
| **Second reviewer** (optional, part-time) | Audits 20% of log entries weekly for accuracy and neutrality |

**Operator neutrality rules**
1. Same wording, same reminder schedule and same visibility for both parties.
2. The operator records what each party says. It never characterises who is right.
3. Both parties see the full shared record at all times (view access).
4. Private information (margins, budgets) is never asked for and never recorded.
5. If asked for advice, the operator replies: "I can record your position. I can't advise on it."

### 8.3 Step-by-step protocol

| Step | What happens | Template | Who confirms |
|---|---|---|---|
| **0. Onboarding** (week 0) | Joint 20-min call (or separate calls) explaining the process. Consent and confidentiality. Agree **response rules**: response window (default 3 working days for changes, 5 for deliveries), and **silence = recorded as no response** (no deemed outcomes in the pilot) | T1 | Both |
| **1. Record the existing agreement** | Operator builds the engagement record and commitments list from the quote, contract or PO | T1, T2 | — |
| **2. Initial commitment review** | Both parties review the list. Each item: confirm / query / dispute. Unresolved items are logged, not forced | T2 | Both |
| **3. New requests and changes** | Either party (or the operator when copied in) logs a change proposal. Sent to the other party | T3 | Other party |
| **4. Authorisation** | For each change, record whether the payer permitted work to proceed, separately from agreeing the price | T4 | Payer |
| **5. Valuation** | Record valuation status: agreed / estimated / open / disputed, and any later updates | T5 | Both (for "agreed") |
| **6. Delivery and acceptance** | Payee submits a delivery claim with evidence. Payer responds | T6 | Payer |
| **7. Payment obligations and payments** | Operator updates the obligations from triggers. Payer logs payment. Payee confirms receipt. Weekly statement sent to both | T7 | Payer logs, payee confirms |
| **8. Disputes** | Either party flags a disagreement. Both positions recorded. Undisputed portion separated | T8 | — (positions only) |
| **9. Weekly check-in** | 10-min call or message with each party: anything not captured? Time spent? Usefulness? | Observation log (section 10.2) | — |
| **10. Close** | Final account proposed and confirmed, or open items listed. Exit interviews (section 8.6) | T9 | Both |

### 8.4 Capturing what happened outside the process

Changes agreed by phone or on site will happen. Each week, ask both parties: **"Was anything agreed, changed, delivered or paid this week that isn't in the record?"** Log each as **"off-process event."** The ratio of off-process to in-process events is a key friction metric (section 10).

### 8.5 Testing agreement, authorisation and valuation in the pilot

- Every change is recorded with **three separate statuses** (T3–T5).
- **Comprehension check:** at the first change, and again at exit, ask each party to explain in their own words the difference between "you agreed the change," "you allowed the work to go ahead" and "you agreed the price." Score correct / partly / wrong.
- **Usefulness check (exit):** show each party their own change log in two forms. **Form A:** one status per change (confirmed / rejected / disputed). **Form B:** three statuses. Ask: "Which would you rather rely on if there was a disagreement? Why?" Record the choice and the reason.
- **Analysis:** count changes where the three statuses diverged (e.g. authorised + value open) and what happened to them. If divergent states are **rare (<15% of changes)** *and* participants prefer Form A, collapse the model. If they are **common (≥25%)**, *or* losses or disputes cluster there, keep them separate. In between: **[Unresolved]**, so carry the question to PRD-stage testing.

### 8.6 Exit interviews (each party, 30 min)

1. Walk me through the record. Is anything wrong or missing?
2. Did the process change anything you did? Give a specific example. *(Prevented vs documented.)*
3. Was there a moment it helped? A moment it got in the way?
4. Did it change how you saw the other party?
5. How much time did it take you each week?
6. Would you use this process on your next engagement? With this counterpart? With others? *(Then the commitment test, section 11.)*
7. Comprehension and Form A/B check (section 8.5).
8. What did you expect it to do that it didn't? *(E.g. make them pay.)*

### 8.7 Prevented vs documented

For every issue arising in the pilot, the operator and second reviewer independently classify:

| Classification | Definition | Example |
|---|---|---|
| **Prevented** | An issue that would plausibly have arisen did not, because of a process step, and a participant confirms this | Payer rejected a priced change before work, so no extra work was done unpaid |
| **Surfaced earlier** | A disagreement became visible earlier than it otherwise would have (participant confirms) | Price dispute raised at the change, not at final invoice |
| **Recovered** | Unbilled work identified and invoiced because of the record | Logged "confirm what we discussed" extras billed |
| **Documented only** | Recorded accurately, outcome unchanged | Payment 20 days late, fully recorded |
| **Missed** | Happened off-process, not captured | Site-agreed change not logged |

**A late payment that is recorded is "documented only."** It is never counted as solved.

---

## 9. Pilot Templates

*Use as tabs in one spreadsheet per engagement, or as email bodies. Field names are fixed so results can be compared across engagements.*

### T1 — Initial engagement record

```
ENGAGEMENT: P-__        Segment: ______      Jurisdiction: ______
Payer: [Org/Person code]   Authorised approver(s): ______
Payee: [Org/Person code]   Authorised approver(s): ______
Source document(s): quote / contract / PO / email — reference & date: ______
Governing document if conflict: "The signed source document governs. This record
  summarises it and records changes and performance."   Both acknowledge: ☐ Payer ☐ Payee
Start date: ___   Expected completion: ___   Currency: ___
Agreed value at start: ______
Payment structure: deposit ___ / stages ___ / progress ___ / retention ___% / terms (e.g. net 30)
Participation method (section 7): M1 / M2 / M3
RESPONSE RULES (agreed by both)
  Response window — changes: ___ working days   deliveries: ___ working days
  If no response: recorded as "no response"; reminder at day ___; no deemed outcome.
  Both acknowledge: ☐ Payer (date) ☐ Payee (date)
Consent & confidentiality signed: ☐ Payer ☐ Payee
```

### T2 — Commitment confirmation

| ID | Commitment (what) | Owed by (payer/payee) | Qty / unit | Definition of done | Due date | Price | Exclusions | Payer status (confirm/query/dispute) | Payee status | Note | Date |
|---|---|---|---|---|---|---|---|---|---|---|---|
| C-01 | | | | | | | | | | | |

*Payment obligations are listed here too (owed by payer), with their **trigger**: e.g. "Deposit 10%, trigger: baseline confirmed, terms: 7 days."*

**Baseline status:** ☐ Fully confirmed (date) ☐ Confirmed with open items (list IDs)

### T3 — Change proposal

```
CHANGE: CH-__     Date proposed: ___     Proposed by: Payer / Payee
How it arose: call / site / message / email / meeting / logged "what we discussed"
Type: add / remove / quantity / price / date / specification / responsibility
Commitment(s) affected: C-__
WAS (current version): ______________________
PROPOSED: ______________________
REASON: client request / discovered condition / supplier issue / design error /
        missed payer obligation / other: ___
Price effect (proposed): + / − ______      Time effect: ___ days
Effect on payment schedule: ______
Evidence attached: ______
Response requested by: ___ (date)
RESPONSE  (other party): Confirm / Reject / Counter (details) / Question / No response
Response date & time: ___    By: ___
Resulting version: v__ (if confirmed)
```

### T4 — Work authorisation

```
CHANGE: CH-__
Has the payer permitted the work to proceed?   Explicit / Implied / Not authorised / Withdrawn
Form of permission: written (ref) / verbal (logged by ___ on ___) / conduct (describe)
Authorised by (name/role): ___     Date/time: ___
Scope of permission: full / limited to: ______   Cost ceiling stated? Y (___) / N
Work started? Y/N  Date: ___    Started BEFORE authorisation? Y/N
Payer acknowledges this authorisation entry: ☐ Yes ☐ Disputes (reason) ☐ No response
```

### T5 — Financial valuation status

```
CHANGE: CH-__
Status: Agreed / Estimated (range ___–___) / Open (to be agreed) / Disputed / Not chargeable (agreed)
Payee's figure: ___    Payer's figure: ___    Basis: rate card / quote / cost+ / lump sum
History:  [date] status → status (by whom, why)
Agreed value (if agreed): ___   Agreed date: ___   Both confirmed: ☐ ☐
Was work completed before value agreed? Y/N
```

### T6 — Delivery and acceptance

```
DELIVERY: D-__    Commitment(s): C-__ / CH-__     Submitted by payee: date ___
Claim: "______ complete"     Quantity/portion claimed: ___
Evidence: photos / files / delivery note / test cert / walkthrough / other (refs)
Review requested by: ___
PAYER RESPONSE: Accept / Accept with defects (list) / Partly accept (qty/portion ___) /
                Request correction (what) / Reject (reason vs definition of done) / No response
Response date: ___   Correction loop #: ___   Resubmitted: ___
Defect reported after acceptance? date ___ description ___
```

### T7 — Payment record and statement

**Payment obligations**

| Obligation | Trigger | Trigger met? (date, evidence) | Amount | Retention held | Advance recouped | Due date (per terms) |
|---|---|---|---|---|---|---|

**Payments**

| Pay ID | Date paid (payer) | Amount | Allocated to | Payee confirmed receipt? (date) | Method |
|---|---|---|---|---|---|

**Weekly statement (sent to both)**

| As of date | Agreed | Due | Requested / invoiced | Paid | Outstanding | of which overdue | Disputed | Retention held | Advance credit |
|---|---|---|---|---|---|---|---|---|---|

*Check: Outstanding = Due − Paid. Undisputed outstanding = Outstanding − Disputed. Both parties asked weekly: "Is anything here wrong?"*

### T8 — Dispute or disagreement

```
DISPUTE: DS-__    Raised by: Payer / Payee    Date: ___
About: baseline item C-__ / change CH-__ / delivery D-__ / deduction / payment / other
Amount in dispute: ___     Undisputed portion: ___ (still due? Y/N per terms)
Payer position (their words): ______  Evidence: ___
Payee position (their words): ______  Evidence: ___
Status: open / resolved by agreement (terms) / withdrawn / escalated (to: ___) / unresolved at close
Date resolved: ___     How surfaced: at change / at delivery / at invoice / at final account
Operator note (factual only): ___
```

### T9 — Engagement closure

```
CLOSURE: P-__    Proposed by: ___   Date: ___
Final agreed value (baseline + confirmed changes − omissions): ___
Total due: ___   Paid: ___   Outstanding: ___   Disputed: ___   Retention outstanding (release date): ___
Open items: [IDs, descriptions]
Payer: ☐ Confirms final account  ☐ Disputes lines: ___
Payee: ☐ Confirms final account  ☐ Disputes lines: ___
Closure type: Closed–agreed / Closed–with open items / Stopped (stop notice date, by whom, reason) /
              Pilot ended, engagement ongoing
Exit interviews done: ☐ Payer ☐ Payee   Continuation offer result: ___ (section 11)
```

---

## 10. Metrics and Evidence Capture

### 10.1 Pilot metrics

| Metric | Definition | Source | Provisional threshold (GO-supporting) | Why this threshold |
|---|---|---|---|---|
| Invitation acceptance | % of invited payers who join or respond to the first request | T1, section 7 | ≥70% | Below this, most real deployments would be one-sided |
| Payer participation | % of payer-directed requests answered within the window, per engagement | T3–T6 | ≥70% median across engagements | The record's value depends on two-sided confirmation |
| Payee participation | % of changes, deliveries and payments the payee reported in-process | Section 8.4 | ≥80% | Payees are the assumed buyer. If they don't engage, the value claim fails |
| Confirmation rate | % of proposals with an explicit response (confirm, reject or counter) vs no response | T3, T6 | ≥75% | Silence undermines the whole model |
| Response time | Median hours to response | T3, T6 | Within the agreed window | Tests whether deadlines are realistic |
| Changes recorded | Count per engagement, in-process and off-process | T3, section 8.4 | Off-process ≤30% of all changes | A high off-process share means the process is bypassed |
| Confirmed before work | % of changes with agreement (and, for priced changes, valuation) before work started | T3–T5 | ≥60%, and higher than the reconstruction baseline for that segment | A real behaviour change, measured against how they worked before |
| Authorised, value open | Count and % of changes authorised with valuation open; how they ended | T4, T5 | Descriptive (feeds section 8.5) | Tests A14 |
| Disagreements surfaced earlier | Count classified "surfaced earlier" (section 8.7) | T8, exits | ≥1 per engagement on average, confirmed by a participant | Evidence of prevention, not just recording |
| Unbilled work identified or recovered | Value billed because of the record | T3, T7, exits | Recovered value per engagement ≥ the tested monthly price (section 11) | The value must at least cover the price |
| Payment delay | Days from due date to paid, vs participant's typical | T7 | **Descriptive only. No GO threshold** | Retenum isn't claimed to fix late payment (P2 §9.4) |
| Admin time | Minutes per week per party, and operator minutes | Check-ins, operator log | Party ≤20 min a week. Operator time recorded to estimate cost to serve | Must beat existing friction |
| Voluntary continuation | Party continues or asks to continue after the pilot, or takes the commitment offer | Section 11 | ≥50% of payees. ≥1 payer per segment | Behaviour, not opinion |
| Prevented / documented ratio | Issues classified prevented + surfaced earlier + recovered vs documented only | Section 8.7 | Prevented + earlier + recovered ≥ 50% of classified issues | Distinguishes solving from recording |

### 10.2 Evidence log (single shared spreadsheet, one row per observation)

| Field | Values |
|---|---|
| Evidence ID | E-### |
| Source | Interview I-__ / Reconstruction R-__ / Pilot P-__ / Participation test A-__ / Legal L-__ |
| Participant code, side, segment | |
| Type | [E] experienced / [G] generalisation / [H] hypothetical / [O] observed behaviour / [C] commercial commitment |
| Assumption(s) addressed | A1–A14 |
| Direction | supports / weakens / neutral |
| Summary (no confidential details) | |
| Value band / hours / days (if any) | |
| Quote (anonymised) | |
| Strength | documented & two-sided / documented one-sided / account only |

**Weekly synthesis:** for each assumption, count supporting vs weakening entries by type and strength. Only **[E], [O] and [C]** entries can move an assumption to "validated" or "invalidated." [G] and [H] entries are context only.

### 10.3 Confidentiality and evidence handling

- **Participant codes only** (e.g. PAYEE-REN-03). The key linking codes to identities is kept separately and access-restricted.
- **Money recorded in bands** or as a % of agreed value unless the participant explicitly permits exact figures.
- **Documents viewed, not collected.** Participants screen-share or read out. If a document must be kept, the participant redacts names, addresses, prices (if wished) and third parties first.
- **Dyads:** never reveal one party's account to the other. Pilot records are shared only with both parties' consent, and only contain what both already see.
- **Consent form** covers: purpose, recording, coding, retention (delete raw recordings within 90 days of the decision; keep anonymised codes), the right to withdraw, and no sharing with the counterparty.
- **Pilot data processing:** a short data agreement with both parties (who holds the record, how long, deletion on request). Check it against data-protection requirements in the selected jurisdiction (section 12, L6).
- **No legal positions.** The operator never states whether something is owed.

---

## 11. Willingness-to-Pay Experiments

### 11.1 Principles

- Only **commitments** count: money paid, a signed letter of intent with terms, or an accepted invoice. Compliments, survey scores and "I'd pay for that" are logged as [H] and excluded.
- Test **both** sides separately. Never ask a payer to pay in front of the payee, or the reverse.
- Prices below are **hypotheses to test**. They were chosen relative to tools participants already pay for (Phase 1: HoneyBook at roughly $36 a month and up; Buildertrend reportedly $199–$829 a month). They are not market facts.

### 11.2 Pricing hypotheses (GBP, assuming England & Wales; convert if California is selected)

| ID | Hypothesis | Who pays | Test price |
|---|---|---|---|
| PH1 | Payee subscription for small firms | Payee | £39 / month (up to 5 active engagements) |
| PH2 | Payee subscription for teams | Payee (agencies, larger contractors) | £99 / month (unlimited engagements, 3 users) |
| PH3 | Per-engagement fee | Either (homeowner or contractor) | £49 per engagement under £50k value |
| PH4 | Payer-paid protection for one-off jobs | Homeowner | £79 per engagement |
| PH5 | Shared cost | Split | Half of PH3 each |

**[Unresolved]** Which of these is right. The experiments aim to rule hypotheses out, not to set the final price.

### 11.3 Commitment experiments

| ID | Experiment | Who | When | Counts as WTP evidence if… |
|---|---|---|---|---|
| **E1** | **Paid manual pilot.** Offer each pilot payee the operated pilot for **£150 per engagement** (founder-operated; refundable if the payer refuses to take part) | Payees | At pilot recruitment | They pay. Record acceptance rate and the reasons for refusal |
| **E2** | **Continuation offer.** At pilot exit, offer to continue the manual service on their **next** engagement at the PH1 or PH2 equivalent, invoiced monthly | Payees (and payers separately at PH4) | Exit interview | They sign or pay the first invoice |
| **E3** | **Refundable pre-order.** After the interview concept section, offer a refundable 3-month pre-order at the PH1, PH2 or PH3 price for a future product, with a defined scope (the minimum workflow, P2 §7) and a refund if not delivered by a stated date | Payees from interviews | Weeks 5–8 | Card payment or bank transfer made. **[Unresolved, L7]** Check consumer-law and pre-order obligations before offering |
| **E4** | **Letter of intent** (business buyers). A non-binding LOI naming price, number of seats or engagements, start condition and decision-maker | Agencies, contractors, business payers | Weeks 6–9 | Signed by a person with budget authority, with a price stated |
| **E5** | **Payer price probe.** Ask payers in exit or follow-up calls to choose: "free if your contractor pays" / "£X for your protection on this job" / "would not use." Then offer PH4 with real payment on their **next** job | Homeowners and business payers | Exit | They pay (PH4). The probe answer alone is [H] |
| **E6** | **Who-pays test.** Offer pilot payees continuation where the **payer is invited free** vs where the **payer must also pay**. Record whether payees still commit when the payer won't pay | Payees | Exit | Payee commits even though the payer pays nothing |

### 11.4 Questions the experiments answer

| Question | Experiments |
|---|---|
| Which party experiences enough value to pay? | E1–E6 by side |
| Does the payee pay for protection of their commercial position? | E1, E2, E3 + exit reasons |
| Does the payer pay for cost visibility and fewer disputes? | E5 |
| Would either pay for a *shared* system? | E2, E6 |
| Does the payer expect it free? | E5 probe + refusal reasons |
| Would the payee pay without the payer paying? | E6 |

---

## 12. Legal and Trust Review Questions

**Jurisdiction:** England & Wales (provisional; see section 4.2). **Format:** a written brief to two lawyers (one contract/construction; one consumer/data protection), a 60–90 min consultation each, and written answers. **This is to understand boundaries, not to obtain approval.** Retenum will not claim to guarantee payment, enforce contracts, resolve disputes or make confirmations binding.

**Context to give lawyers:** a short description of the operating model (P2 §1.2), the T1–T9 templates, and three scenarios (renovation discovered-condition change; agency extra revision round; supplier partial acceptance).

| # | Question | Why we need it | Product decision affected |
|---|---|---|---|
| L1 | Can a confirmation recorded via link, email reply or account act as **evidence of agreement**? What strengthens it (identity, timestamps, audit trail, an unchangeable record)? | Core of the record's value | Participation method (P1); evidence standard (P6) |
| L2 | Can confirming a change **vary the contractual obligations**? Does a "the signed contract governs" clause (T1) affect that? Do contracts with "variations must be in writing and signed" clauses accept these confirmations? | Avoid unintended contract variations | Relationship to contract (P10) |
| L3 | Can work be **authorised while valuation is unresolved**? How should that be recorded so neither side is prejudiced (e.g. without implying the price is accepted)? Any consumer-specific concerns? | Tests A14 legally | Agreement / authorisation / valuation model |
| L4 | Can parties **agree response deadlines in advance** (B2B and consumer)? What is the effect of missing one? | Response rules (T1) | P3 |
| L5 | Can **silence ever have an agreed consequence**? Is **deemed acceptance** appropriate or enforceable B2B? Against consumers (unfair-terms rules)? | Phase 2 left this open (A7) | P3; default settings |
| L6 | **Privacy and data:** what personal data does the record contain? Lawful basis? Retention periods for commercial records? How to handle **erasure requests** against an unchangeable record? Obligations during the manual pilot itself? | Phase 2 L6 | Ledger design; pilot data agreement |
| L7 | Does the workflow create **unintended responsibilities**: acting as an agent, notice-giver, debt collector (reminders to consumers), or a provider of regulated services? Do pre-orders (E3) create obligations? | Avoid regulatory surprises | Scope boundaries; WTP experiments |
| L8 | Can a Retenum entry serve as a **contractual or statutory notice** (e.g. Construction Act payment or pay less notices) or not? Should the product explicitly state that it is *not* a notice mechanism? | Construction segment viability | Segment choice; disclaimers |
| L9 | What **records should be preserved**, and in what form, to be most useful in negotiation, adjudication or small claims? | Evidence value | Evidence standard (P6) |
| L10 | What **liability** could Retenum carry if the record is inaccurate or relied upon? What disclaimers and terms are needed even for the manual pilot? | Risk | Pilot terms; product terms |

**Trust questions (for participants, in exit interviews):** Who should be able to see the record? Who should "own" it? Would you trust a record run by your counterpart's supplier? What would make you trust it more (neutral operator, export rights, unchangeable history)?

---

## 13. Candidate-Market Comparison Framework

### 13.1 Scoring

Score each segment **1–5** per criterion, **using only Phase 3 evidence** (cite the evidence IDs). Where evidence is missing, mark **"–" (insufficient)**, not a guess.

| Criterion | Evidence source | Weight (provisional) | Renovation | Agency | Subcontract | Other (if screened) |
|---|---|---|---|---|---|---|
| Frequency of the problem | Reconstructions, interviews [E] | 10% | | | | |
| Financial impact per engagement | R1 section F, interviews | 10% | | | | |
| Frequency of scope changes | R1 section B, pilot | 5% | | | | |
| Difficulty establishing what was agreed | Dyad divergence, R2 C1/C7 | 5% | | | | |
| Existing tools and workarounds (higher = less entrenched) | Interviews Q12 | 5% | | | | |
| Dissatisfaction with existing solutions | Interviews [E] (switching attempts, complaints) | 5% | | | | |
| **Payer willingness to participate** | Section 7 Tracks A/B | **20%** | | | | |
| **Payee willingness to pay** | Section 11 [C] only | **20%** | | | | |
| Ease of recruiting pilot participants | Recruitment log (contacts → interviews → pilots) | 5% | | | | |
| Legal and operational complexity (higher = simpler) | Section 12, interviews | 5% | | | | |
| Addressable without holding money | Interviews (escrow questions), pilot | 10% | | | | |
| **Weighted total** | | 100% | | | | |

**Why these weights:** participation and willingness to pay carry the most weight because Phases 1–2 found the problem's *existence* is already well established. The open questions are adoption and payment. The weights are provisional and must be fixed **before** scoring begins.

### 13.2 Selection rules

1. A segment **cannot be selected** if payer participation or payee willingness to pay scores ≤2, regardless of total.
2. A segment needs **≥1 paying commitment** (section 11) to be recommended.
3. If the top two segments are within 10% of each other, report both and state what would separate them. Do not force a choice.
4. "Largest reported problem" (e.g. subcontract dollar amounts) is only one input. It cannot override rules 1–2.
5. Write a short **"why / why not"** paragraph for each segment, citing evidence IDs.

---

## 14. GO / REVISE / NO-GO Decision Framework

*Thresholds are provisional, set in advance to avoid post-hoc reasoning. With a small sample, a decision means "enough evidence to proceed to the next stage," never "the market is proven."*

### GO: proceed to product definition (PRD) for one segment

| | |
|---|---|
| **Required evidence** | Reconstructions complete (≥8, ≥3 segments). ≥30 interviews with ≥40% payers. ≥5 pilots run ≥4 weeks. Legal answers for L1–L6 |
| **Positive signals** | **Root cause:** ≥40% of incident value (and ≥40% of incidents) has primary cause C1–C4 or C8, *and* ≥50% of those are coded "prevent" or "reduce." **Participation:** in the target segment, payer response ≥70% for at least one method, with ≥70% "understood." **Behaviour change:** "confirmed before work" ≥60% and above the reconstruction baseline. Off-process ≤30%. **Value:** prevented + earlier + recovered ≥50% of classified pilot issues. Unbilled work recovered in ≥2 pilots. **WTP:** ≥3 paying commitments from payees in one segment (E1/E2/E3/E4 with price), *and* E6 shows payees commit without payer payment, or payers commit (E5). **Legal:** no blocking issue for the minimum workflow without deemed acceptance |
| **Negative signals that block GO** | Any blocking legal issue. Payer refusal pattern ("advantage to the other side") in >1/3 of target-segment payers |
| **Critical risks still open at GO** | Scale beyond the founder's network; cost to serve; whether results hold outside the pilot participants; competition responding |
| **Decision that follows** | Write the PRD for **one segment, one jurisdiction**, scoped to the minimum complete workflow (P2 §7), with section 15's open decisions explicitly carried in |

### REVISE: the problem is real but something material must change

| | |
|---|---|
| **Required evidence** | Same as GO |
| **Typical patterns** | (a) Root cause supported, but **payer participation below 70% for every method** → test a payee-only record or a different participation model. (b) Participation fine but **WTP weak** in the planned segment, strong elsewhere → switch segment. (c) Value is real but comes from a different place (e.g. statement reconciliation, not change control) → reframe the value proposition. (d) Three-status model confuses people, or divergent states are rare → simplify the model. (e) Legal limits rule out a key mechanism (e.g. link confirmation has weak evidential value) → change the mechanism |
| **Positive signals** | ≥30% of incident value from C1–C4/C8. At least one segment with ≥1 paying commitment. Participants describe specific prevented or surfaced issues |
| **Negative signals** | Below the GO thresholds on one or two dimensions, not all |
| **Critical risks** | Revision may be "tuning to a small sample." Require a **second, focused round** (e.g. 3–4 more pilots in the revised configuration) before a PRD |
| **Decision that follows** | Define the revision. Run a time-boxed (4–6 week) follow-up validation on the changed variable only. Re-apply this framework |

### NO-GO: stop or fundamentally rethink

| | |
|---|---|
| **Required evidence** | Reconstructions + interviews complete. At least 3 pilots attempted (pilot recruitment failure is itself evidence) |
| **Signals (any two are sufficient)** | **Root cause:** <30% of incident value from C1–C4/C8 (losses mostly C5/C6 cash and power). **Prevention:** the record would only "document" in >70% of incidents. **Participation:** payers respond <40% across *all* methods, or refuse in most segments. **WTP:** zero paying commitments after E1–E4 across all segments. **Holding money:** most participants say the problem only goes away if someone holds the money (escrow), which Retenum has ruled out (P1 §6.4). **Legal:** the core confirmation mechanism has no evidential value or creates unacceptable liability |
| **Critical risks** | A false negative due to a poor pilot operation or the wrong segment. Check that the pilot was run as designed before concluding |
| **Decision that follows** | Stop investment in the shared-record concept. Document the learnings. Consider whether the evidence points to a different product (e.g. a payee-side change-control tool, or a payments or financing product). That would be a new discovery, not a continuation |

---

## 15. Evidence Required Before Moving to a PRD

Every item must be answered with **Phase 3 evidence**, cited by evidence ID:

1. **Root cause:** share of losses (count and value) by primary cause, from reconstructions, with the prevent / reduce / document classification.
2. **Payer participation:** response, understanding and perception results by method, in the target segment.
3. **Behaviour change:** "confirmed before work" and off-process rates vs the reconstruction baseline.
4. **Prevented vs documented:** classified pilot issues.
5. **Willingness to pay:** list of actual commitments (who, which side, what price, which form).
6. **Who pays:** the E6 result (does the payee pay without the payer paying?).
7. **Agreement / authorisation / valuation:** divergence frequency, comprehension and the Form A/B preference → decision to keep three statuses, collapse them, or leave unresolved.
8. **Silence and deadlines:** whether response windows were met and found useful. Whether participants wanted any deemed outcome. Legal answers L4–L5.
9. **Segment and jurisdiction:** the scored comparison (section 13) with rationale.
10. **Legal boundaries:** written answers to L1–L10, and the list of claims Retenum must **not** make.
11. **Cost to serve:** operator minutes per engagement in the pilot, as an early indicator.
12. **Decisions still open** (carried into the PRD as explicit open questions, not assumed): participation method (P1), approval authority (P2), partial-acceptance granularity (P4), payment structures (P5), evidence standard (P6), dispute depth (P7), multi-party (P8), industry handling (P9), and the final price.

---

## 16. Execution Sequence, Dependencies and Effort

**Team assumption:** founder full-time on research (about 4 days a week), plus an optional part-time second coder or reviewer (about 1 day a week from week 4). Effort is in person-days (pd).

| Week | Workstream | Activities | Depends on | Effort |
|---|---|---|---|---|
| **0** | Set-up | Confirm jurisdiction (section 4.2). Finalise consent form, data agreement, screener, evidence log. Fix thresholds and weights (sections 13–14) in writing. Book lawyers | — | 3 pd |
| **1–2** | Recruitment | Outreach across all channels. Screen. Schedule interviews and reconstructions. Begin pilot-candidate list | Week 0 | 5 pd (continues at ~1 pd a week) |
| **1–2** | Legal brief | Prepare the lawyer brief (model summary, templates, scenarios, L1–L10) | Week 0 | 2 pd |
| **2–5** | Interviews | 30–36 interviews (about 8–10 a week). Same-day notes into the evidence log | Recruitment | 14 pd (interview + notes ≈ 0.4 pd each) |
| **2–5** | Reconstructions | 8–10 reconstructions incl. ≥2 dyads. Dual coding on ≥4 | Recruitment, consent | 8 pd |
| **3–6** | Participation Track A | 24–30 invitations via payees. Follow-up calls | Payee interviewees' consent | 4 pd |
| **3–4** | Legal consultations | Two consultations. Written answers | Legal brief | 1 pd + fees (budget **[Unresolved]**; obtain quotes in week 0) |
| **4** | **Checkpoint 1** | Interim synthesis: root-cause shares so far, Track A early signal, legal blockers. **Go/no-go on running the pilot** (stop if a legal blocker exists, or if the reconstructions show <20% of value from C1–C4/C8) | Interviews ≥50%, reconstructions ≥5, legal answers | 1 pd |
| **4–5** | Pilot recruitment and onboarding | Recruit 5–8 live engagements (both parties). E1 paid-pilot offer. Set up T1–T2 per engagement | Checkpoint 1; templates | 4 pd |
| **5–12** | Live pilot | Run T3–T9. Weekly statements. Check-ins. Off-process capture. Track B participation | Onboarding | ~0.5 pd per engagement per week → 15–25 pd total |
| **5–8** | WTP: pre-orders and LOIs | E3, E4 with interviewees and others | Interviews; L7 answer for pre-orders | 3 pd |
| **8** | **Checkpoint 2** | Mid-pilot review: participation rates, off-process rate, early prevented/documented counts. Adjust operations only (not thresholds) | Pilot ≥3 weeks | 1 pd |
| **10–12** | Pilot close | T9 closures, exit interviews, E2/E5/E6 offers, Form A/B tests | Pilot running ≥4 weeks | 5 pd |
| **12–13** | Analysis | Complete coding. Metrics. Market scoring (section 13). Apply the decision framework (section 14). Second reviewer audit | All above | 6 pd |
| **13–14** | Decision write-up | Phase 3 findings and decision (a section appended to this plan or a findings memo, *only once authorised*), with the section 15 evidence list | Analysis | 3 pd |

**Total:** about **75–90 person-days over 13–14 weeks**, plus incentives (≈36 × £30–£50 ≈ **£1,300–£1,800**) and legal fees **[Unresolved]**.

**Critical path:** recruitment → interviews and reconstructions → Checkpoint 1 → pilot recruitment → pilot (≥4 weeks) → exit and WTP → analysis. **Pilot recruitment is the most likely delay.** Start collecting pilot candidates from the first interview, and accept that some pilot engagements will still be in progress at week 12 (closure type: "pilot ended, engagement ongoing").

**Stop rules during execution**
- **Checkpoint 1:** a legal blocker, or <20% of reconstructed loss value from causes a record could affect → pause the pilot and reassess.
- **Recruitment:** if fewer than 3 dyads or 3 pilot pairs can be recruited by week 6, record this as evidence on A2 (payer participation) and proceed with what exists. Do not lower the bar silently.
- **Thresholds and weights** are fixed at week 0 and changed only with a written reason logged *before* the relevant data is analysed.

---

### Plan quality check

| Requirement | Where addressed |
|---|---|
| Builds on Phases 1 and 2 | Sections 2–3 (assumptions A1–A14 mapped to sources). Templates follow the P2 model |
| Every major assumption has a validation activity | Section 2.2 table |
| Both payers and payees represented | Section 4.3 (≥40% payers rule, dyads). Separate scripts (6.2, 6.3). Payer-side WTP (E5) |
| Tests behaviour, not opinions | [E]/[G]/[H] tagging. Reconstructions. Live pilot. Commitment-only WTP |
| Agreement, authorisation and valuation examined separately | Sections 5.4, 8.5. Templates T3–T5. Legal L3 |
| Pilot runs without software | Section 8.1 (spreadsheet, email, off-the-shelf tools) |
| WTP through real commitments | Section 11 (E1–E6) |
| Legal questions framed for professional review | Section 12 |
| Can produce GO / REVISE / NO-GO | Section 14 with pre-set thresholds. Section 15 evidence list |
| Does not slip into product development | No features, screens or architecture. The PRD is gated behind section 15 |
