# Retenum — Product Discovery

*Working draft · 18 November 2026 · Desk research only. No customer interviews have been done yet.*

**How to read this document.** Each important claim has a label:

- **[Fact]**: verified from a primary or credible source (linked).
- **[Finding]**: reported by research, a survey or a vendor. Real data, but the method, sample or motive may limit it.
- **[Assumption]**: something we believe but have not tested.
- **[Recommendation]**: what we suggest doing.

Vendor reports (Rabbet, Siteline, Billd, Ignition) are useful but are written partly to sell products. Treat them as signals, not proof.

---

## 1. Executive Summary

**What we investigated.** Is there a business in giving both sides of a paid work engagement one shared record that runs from agreement through changes, delivery, acceptance and payment?

**What the research suggests so far:**

1. **The pain is real, common and expensive. The evidence is strongest for the party *being paid*.** UK government research estimates late payment costs the economy about £11bn a year and affects 28% of businesses ([DBT/London Economics, 2025](https://assets.publishing.service.gov.uk/media/688a089a6478525675738ff9/late_payments_research_impact_on_uk_economy.pdf)). US construction subcontractors report waiting 51–96 days to get paid, depending on the survey. Agencies report regularly doing out-of-scope work they never bill.
2. **Most of the pain is about cash flow and power, not missing records.** Payers often pay late because it suits them, not because they are unsure what was agreed. A shared record does not fix that by itself. This is the biggest weakness in the hypothesis.
3. **The part a shared record *can* fix looks narrower:** changes and acceptances that are agreed informally (a phone call, a WhatsApp message, a site conversation) and never turned into a confirmed obligation. That gap shows up as unpaid extras, disputed completion and withheld payment.
4. **The market is crowded at the edges.** Construction has Procore, Buildertrend, Siteline and others. Freelancers have Upwork, HoneyBook and Bonsai. Enterprises have contract-management (CLM) software. Renovation escrow already has several startups. A generic "manage the relationship" tool would compete with all of them. A narrow, neutral, two-sided record of commitments might not, but that is unproven.
5. **The "protect both parties" promise conflicts with how customers buy.** The party who suffers most (the payee) is the natural buyer. The party with power (the payer) has to join for the record to mean anything. Getting both sides of a two-sided product to adopt it is the core go-to-market risk.
6. **No entry market is proven yet.** The evidence points to two candidates worth validating first: **small residential renovation contractors and their homeowner clients**, and **small specialty subcontractors** (trade firms such as electrical or plumbing). Agencies are a credible third. We should not pick one until interviews are done.

**Bottom line [Recommendation]:** The opportunity deserves further investigation, but not building yet. The first thing to test is whether payees will pay for, and payers will accept, a shared confirmation step for changes and acceptance.

---

## 2. The Problem

### 2.1 What goes wrong

| Problem | What it looks like | Who feels it most |
|---|---|---|
| **Late payment** | Invoice is valid but paid weeks or months late | Payee (small suppliers, subcontractors, freelancers) |
| **Non-payment** | Invoice is never paid, or only part of it | Payee |
| **Unpaid extra work (scope creep)** | Work beyond the original agreement is requested informally and never priced or billed | Payee |
| **Disputed completion** | "It's not finished" vs "it's done." No agreed test for "done" | Both |
| **Poor or incomplete work** | Payer pays upfront or in stages and gets defective or abandoned work | Payer (especially consumers) |
| **Price and deadline drift** | Prices or dates change without a clear record of who agreed | Both |
| **Lost value in big contracts** | Obligations, rebates and penalties are agreed but never tracked | Payer (larger companies) |

### 2.2 Evidence of size and frequency

**Late and non-payment (general business)**
- **[Fact]** UK: about £11bn a year cost to the economy, about 14,000 business closures a year, 1.5m businesses (28%) affected. On average each affected business is owed £17,000 at any time and spends 86 staff hours a year chasing payment ([DBT/London Economics, July 2025](https://assets.publishing.service.gov.uk/media/688a089a6478525675738ff9/late_payments_research_impact_on_uk_economy.pdf)).
- **[Finding]** A survey of more than 10,800 suppliers by SAP Taulia found only 37% of invoices were paid on time in 2025, down from 54% in 2019 ([GTR](https://www.gtreview.com/news/global/late-payment-worsening-as-trade-uncertainty-bites-supplier-survey-finds/)).

**Construction**
- **[Finding]** Rabbet estimates slow payment cost US construction about $299bn in 2025, roughly 14% of project costs. 82% of contractors wait more than 30 days to be paid ([Rabbet 2025](https://rabbet.com/reports/construction-payments-2025), [2024 release](https://business.mammothtimes.com/mammothtimes/article/gnwcq-2024-10-1-slow-payments-cost-280-billion-in-2024-threaten-us-construction-industrys-financial-health)). Rabbet sells payment software, so this is a vendor estimate.
- **[Finding]** In Billd's survey of 800+ firms, subcontractors waited on average 56 days after submitting a pay application, while general contractors *believed* the wait was 30 days ([Billd 2025](https://billd.com/pdf/Billd_2025_National_Subcontractor_Report.pdf)). The 2026 figures were 51 vs 35 days.
- **[Finding]** Siteline reports an average 96-day wait for subcontractors ([Siteline 2025](https://www.newswire.com/news/siteline-report-reveals-deepening-crisis-in-construction-payments-and-22624023)). It also reports 92% of subcontractors "floated payroll" in 2025, meaning they paid staff from their own reserves while waiting for payment ([2026 report coverage](https://www.windowanddoor.com/news/92-subcontractors-floated-payroll-last-year)).
- **[Finding]** Large construction disputes average about 14 months to resolve worldwide and 15.6 months in North America ([Arcadis via Pinsent Masons](https://www.pinsentmasons.com/out-law/news/construction-disputes-becoming-faster-and-cheaper-says-report)). These are big-project disputes, not small jobs.

**Consumers and home improvement**
- **[Finding]** Home improvement is consistently the second most complained-about consumer category in the US, after cars (Consumer Federation of America surveys, most recently reported for 2023 ([FinanceBuzz summary](https://financebuzz.com/contractor-scams)). We could not verify the 2023 ranking directly).
- **[Fact]** UK Citizens Advice received 36,534 home maintenance and improvement complaints in the year to June 2025. 52.8% were about substandard work ([Citizens Advice](https://www.citizensadvice.org.uk/about-us/media-centre/press-releases/shoddy-tradeswork-is-sparking-more-than-700-complaints-a-week-says-citizens/)).
- **[Finding]** US homeowners spent about $517bn on improvements and maintenance in the 12 months to June 2026 ([Harvard JCHS via Farnsworth](https://www.thefarnsworthgroup.com/blog/shop-talk-home-improvement-demand)).

**Agencies and professional services**
- **[Finding]** 57% of US agencies lose $1,000–$5,000 a month to unbilled out-of-scope work, 30% lose more than $5,000, and only 1% bill for all of it (Ignition 2025, 273 agency leaders ([summary](https://dev.to/valynx_saas/57-of-agencies-lose-1k-5k-monthly-to-scope-creep-heres-why-it-keeps-happening-39hf), [The Drum](https://www.thedrum.com/news/2025/05/22/cash-flow-crunch-us-agencies-struggle-grow-late-payments-and-scope-creep-bite))). Ignition sells proposal and billing software.

**Freelancers**
- **[Finding]** In a 2015 Freelancers Union survey of 5,358 people, about half had trouble getting paid in the previous year. A 2022 New York survey found 60% had not been paid for work performed at some point ([Freelancers Union](https://blog.freelancersunion.org/2022/05/12/over-60-of-ny-freelancers-report-not-being-paid-for-work-performed)). This data is old and focused on New York.

**Large-company contracts**
- **[Finding]** World Commerce & Contracting estimates poor contract management loses about 8.6% of contract value on average, around 3% for the best performers and 15% or more for the worst ([WorldCC 2023 benchmark](https://www.worldcc.com/Portals/IACCM/Reports/Benchmark-report-2023.pdf)).

### 2.3 Separate problems, or one deeper problem?

**[Finding, our analysis]** Most of these problems come from two different root causes. Mixing them up is the main risk to the hypothesis.

1. **Unconfirmed commitments.** Something was agreed (an extra, a new date, "this is done") but never confirmed by both sides in a form either could later rely on. This causes unpaid extras, disputed completion and drift. **A shared record can address this.**
2. **Cash and power imbalance.** The payer delays payment because holding the money benefits them, the payee cannot afford to push back, and the contract is too costly to enforce. This causes most late payment. **A shared record barely affects this.** What changes it is legal rules (UK reforms, prompt-payment laws), money held in advance (escrow), financing, or reputation.

The Billd gap (subcontractors say 56 days, contractors think 30) suggests there is also a **visibility problem**: payers often don't see their own delays.

### 2.4 Will people pay to solve it?

- **[Finding]** Payees already pay for adjacent tools: Siteline (custom pricing), Buildertrend (reportedly $199–$829 a month, depending on source), HoneyBook (about $36 a month and up), and Upwork fees (0–15%). So *some* willingness to pay exists.
- **[Assumption]** Payers will not pay to be held more accountable, unless they are consumers wanting protection or large companies trying to stop value leakage.
- **[Unknown]** Whether payees will pay for a *shared* record, rather than tools that only serve their own side. No evidence either way.

---

## 3. Existing Solutions

### 3.1 How people manage this today

Most small engagements run on **email, WhatsApp or text, a PDF quote or contract, photos on a phone, and an accounting tool** (QuickBooks, Xero). Changes are agreed verbally or by message. Evidence is pieced together after a dispute starts.

### 3.2 Software landscape

| Category | Examples | Who uses it | Business model | Strength | Limitation for Retenum's idea |
|---|---|---|---|---|---|
| Commercial construction management | **Procore** | General contractors, owners | Annual fee based on construction volume. Third-party estimates range roughly $4.5k–$80k a year ([Projul](https://projul.com/blog/procore-pricing-analysis-2026/)) | Deep, industry-standard | Owned and configured by the contractor, not neutral. Too heavy for small jobs |
| Residential builder / remodeler tools | **Buildertrend**, JobTread, Houzz Pro, Jobber | Contractors | Monthly subscription (Buildertrend reportedly $199–$829 a month, plus payment fees ([Tekpon](https://tekpon.com/software/buildertrend/pricing), [TechRepublic](https://techrepublic.com/article/buildertrend-review))) | Change orders with client e-sign, client portal, invoicing | Contractor-controlled, so the homeowner is a guest in the contractor's system |
| Subcontractor billing | **Siteline**, GCPay, Textura (Oracle) | Specialty subcontractors | Custom pricing ([Siteline](https://siteline.com/pricing)) | Pay applications, change orders, lien waivers | Construction-only. Fixes billing paperwork, not the agreement itself |
| Construction finance | **Billd**, Rabbet, Built | Subcontractors, lenders | Financing fees, SaaS | Speeds up cash | Treats the symptom (cash gap), not the record |
| Freelance marketplaces | **Upwork**, Fiverr | Freelancers and clients | 0–15% fee on payments ([Upwork](https://support.upwork.com/hc/en-us/articles/14044146250259)) | Escrow on funded milestones, 14-day auto-approval, mediation | Only protects work done *on the marketplace* and milestones *funded in advance* |
| Freelancer / small-business client tools | **HoneyBook**, Bonsai (reportedly acquired by Zoom, Dec 2025), Dubsado | Solo and small service businesses | $9–$50+ a month | Proposal → contract → invoice | One-sided. Weak on structured change approval and acceptance |
| Renovation escrow startups | **Renno** (NL/UK), Ratedeed (US), ContractorsNest (US, 2026), HomePay (SG), Build Safe Escrow | Homeowners and contractors | Fees on escrowed funds (not verified) | Money released per approved milestone, photo evidence | Early-stage, crowded, involves regulated money handling ([overview](https://www.renno.pro/how-it-works), [HomePay](https://e27.co/homepay-aims-to-fix-renovation-woes-with-escrow-system-completion-guarantee-20240219/)) |
| Enterprise contract management (CLM) and procurement | Ironclad, DocuSign CLM, Icertis, Coupa, SAP Ariba | Large companies | Enterprise contracts | Contract drafting, approvals, purchase orders, invoice matching | Buyer-side, expensive, built for legal and procurement teams |
| Statutory processes (UK construction) | Construction Act payment notices, pay less notices, adjudication | UK construction | Law | Already forces structured "notice and respond" behaviour | Construction-only. Enforcement still costly. Reform in progress ([CMS](https://cms.law/en/gbr/legal-updates/Late-payment-reform-What-UK-construction-developers-and-contractors-need-to-know)) |

### 3.3 Where the gaps may be

- **[Finding]** Almost every tool belongs to one side. The record lives in the payee's system (Buildertrend, HoneyBook) or the payer's (Procore, Coupa). Neither side fully trusts the other's system as the "truth."
- **[Finding]** The tools that are genuinely shared (Upwork, escrow apps) work because they **hold the money**. That is the source of their power, and also their regulatory and trust burden.
- **[Assumption]** There may be room for a **neutral, lightweight, two-sided record** of what was agreed, changed, delivered and accepted, without holding money, for engagements too small for Procore and CLM but too large or risky for a WhatsApp thread.
- **Risk:** Buildertrend-style tools already offer change orders with client signature. The real test is whether *neutrality* is worth paying for, or whether "my contractor's portal" is good enough.

**Honest answer to "is there a genuine gap?"** Possibly, but it is narrow. Without a sharp focus, Retenum becomes another project-management or invoicing tool, and that market is saturated.

---

## 4. The Workflow

### 4.1 The common lifecycle

| Stage | Normal path | When it goes wrong |
|---|---|---|
| **1. Agreement** | Quote or proposal → acceptance (signature, purchase order or "yes" by email) | Scope is vague. Exclusions not listed. "Done" not defined. Agreement is verbal |
| **2. Breaking the work down** | Milestones, stages or a schedule of values (a line-by-line price breakdown used for progress billing) | No breakdown, so progress can't be measured or billed fairly |
| **3. Progress and evidence** | Updates, photos, timesheets, site reports, drafts | Evidence scattered across phones and inboxes. Not linked to a specific obligation |
| **4. Changes** | Change request → price and time impact → written approval → work | **Work starts before approval.** Approval is verbal. Price "to be agreed later." This is the single most common failure point we found |
| **5. Delivery and acceptance** | Inspection, snag or punch list (remaining defects to fix), sign-off | No acceptance criteria. Payer stays silent instead of accepting or rejecting. Endless rework loop |
| **6. Payment obligation** | Invoice or pay application → approval → due date | Payer disputes part of it and holds back the whole amount. Retention (a percentage held back until the end) held for months |
| **7. Payment** | Transfer within terms | Late, partial, never. Payee chases by phone and email |
| **8. Dispute** | Negotiation → mediation → adjudication, arbitration or court | Too expensive for small sums, so the payee writes it off |
| **9. Close-out** | Final account, release of retention, warranties | Final account never agreed. Retention never released |

### 4.2 Industry differences (do not assume one process fits all)

- **Commercial construction:** highly formal. Pay applications, retention, lien waivers (documents giving up the right to claim against the property once paid), and in the UK statutory notices. Long payment chains: owner → main contractor → subcontractor → supplier. Delay passes down the chain.
- **Residential renovation:** semi-formal. Deposit plus stage payments. The payer is a consumer with consumer-law rights, no expertise and high emotion. Both sides fear the other: homeowners fear abandoned or poor work, contractors fear non-payment for extras.
- **Agencies and professional services:** retainers or project fees. "Done" is subjective (creative approval). Scope creep happens gradually through many small requests.
- **Events:** heavy deposits, fixed dates (failure cannot be fixed afterwards), cancellation terms, many suppliers. We found **no good data** on event supplier disputes.
- **Procurement (business buying goods and services):** purchase order → goods receipt → invoice "three-way match," handled by the buyer's systems. The supplier has little visibility.

### 4.3 A useful pattern from construction law

**[Fact]** UK construction law already requires a "notice and respond" process. The payer must issue a payment notice, and must issue a *pay less notice* by a deadline if they intend to pay less. If they don't, the amount claimed becomes payable. Pending reforms tighten the deadlines and ban retentions ([CMS](https://cms.law/en/gbr/legal-updates/The-retentions-ban-under-the-microscope-a-deep-dive-into-the-commercial-payments-bill), [Fenwick Elliott](https://www.fenwickelliott.com/knowledge-hub/blog/retentions-to-be-banned-what-next/)). Upwork uses a similar rule: if the client does not respond within 14 days, the milestone is approved.

**[Finding, our analysis]** "Silence has a consequence after a deadline" is the strongest mechanism we found for fixing unconfirmed commitments. Whether it can be applied by contract outside construction and marketplaces is a **legal question we have not answered**.

---

## 5. Product Opportunity

*This section explores a possible model. It is not a feature list or a decision.*

### 5.1 Candidate central object

| Option | Pros | Cons |
|---|---|---|
| **Project** | Familiar | Implies task management, a crowded market. Usually owned by one side |
| **Contract** | Legally meaningful | Implies legal drafting and CLM. A static document, not a living relationship |
| **Work order** | Fits trades and procurement | Too small for multi-stage work |
| **Engagement** | Neutral. Covers the whole relationship. Owned jointly | Unfamiliar word. Needs explaining |

**[Recommendation, tentative]** Use the **Engagement** as the container. The real heart of the product is a **ledger of commitments** inside it: an add-only history in which each entry is something one party proposed and the other confirmed, rejected, or let lapse after a deadline.

### 5.2 How the model might work

```
Engagement (between Party A and Party B)
 ├─ Original agreement  (frozen once both confirm)
 ├─ Commitments ledger  (add-only, nothing is edited or deleted)
 │    ├─ Scope items / milestones  — price, date, definition of "done"
 │    ├─ Change requests           — proposed → approved / rejected / lapsed
 │    ├─ Delivery claims           — "milestone 2 done" + evidence attached
 │    ├─ Acceptance responses      — accepted / rejected with reasons / deemed accepted
 │    └─ Payment obligations       — created only from accepted work + approved changes
 └─ Payment records    (what was actually paid, ideally read from bank or accounting)
```

Principles worth testing:
- **Nothing is overwritten.** The original agreement is kept forever. Changes are added on top. "Current agreement" = original + approved changes.
- **Money follows confirmed work.** A payment obligation exists only when it can be traced to accepted delivery or an approved change. This serves the payer (no paying for undelivered work) and the payee (no arguing that approved work wasn't agreed).
- **Every request needs a response.** Proposals have deadlines. What happens on silence must be agreed in advance.
- **Evidence is attached to a specific claim**, not dumped in a folder.

### 5.3 More than two parties

- **[Finding]** Real engagements involve chains: client → main contractor → subcontractors → suppliers. Payment delay travels down the chain (see Billd and Siteline).
- **[Recommendation]** Start with **two parties only** and design so an engagement can later be *linked* to a related one (a subcontract linked to the main contract), rather than putting everyone in one shared space. Multi-party support adds permissions, confidentiality and pricing complexity before we know the basic model works.

### 5.4 Unresolved questions

- Will the payer accept a neutral system the payee brought in? Or does it feel like a trap?
- Is a deadline-based "deemed acceptance" enforceable in each market and contract type?
- Would a Retenum record actually help in adjudication, small-claims court or a chargeback? (Needs legal input.)
- How much setup will small businesses tolerate? (Every extra step competes with WhatsApp.)

---

## 6. Commercial Economics

### 6.1 Where the financial value comes from

**For the payee (hired party)**
| Value | Evidence | Strength |
|---|---|---|
| Billing for extras that are currently given away | Agencies report losing $1k–$5k+ a month (Ignition) | Medium (vendor survey) |
| Faster payment, less money tied up | 51–96 day waits in construction. £17k average owed per affected UK business | Medium–strong |
| Less time chasing payment | 86 hours a year per affected UK business (DBT) | Strong (government) |
| Fewer write-offs and disputes | Plausible, but **no data** that better records reduce disputes | Weak |

**For the payer (hiring party)**
| Value | Evidence | Strength |
|---|---|---|
| Not paying for undelivered or defective work | Consumer complaints data (CFA, Citizens Advice) | Medium |
| Price certainty: no surprise extras on the final bill | Logical. Not quantified | Weak |
| Stopping value leakage in larger contracts | WorldCC 8.6% | Medium, but this is an enterprise market |
| Lower dispute costs | Arcadis (large projects only) | Weak for small jobs |

**Contradiction to keep in mind:** For many business payers, *paying late is a benefit* (it is free credit). Retenum cannot honestly promise them savings from faster payment. Their value has to come from certainty, fewer disputes and reputation, all of which are harder to sell.

### 6.2 Who would pay?

- **Most likely: the payee**, as a monthly subscription. They have the clearest, most frequent pain.
- **Possibly: consumer payers** (homeowners) per project, for protection. But consumers buy rarely, so this is not recurring revenue.
- **Possibly: larger payers** who want suppliers on a standard process (as in procurement). Bigger contracts, slower sales.
- **Model to test:** the payee pays and the other party joins free. This is how many client-portal tools work. Free access for the other side is how adoption spreads.

### 6.3 Pricing models to test

| Model | Recurring? | Fit | Risk |
|---|---|---|---|
| Subscription per business (flat or tiered) | Yes | Small payees | Must beat HoneyBook and Buildertrend on value |
| Per engagement or per project fee | Partly | Occasional users, consumers | Lumpy revenue |
| % of contract value tracked | Partly | Construction (Procore prices by volume) | Feels like a tax |
| Payment processing fees | Yes | If payments run through the product | Thin margins, compliance |
| Escrow or holding funds | Yes | Consumer renovation | **Regulated**, crowded, liability (see below) |
| Financing (paying payees early) | Yes | Construction subcontractors | Capital and credit risk. Billd already does this |

### 6.4 Should Retenum hold money?

**[Finding]** Holding or controlling the release of funds is very likely regulated activity. In the US that means state money-transmitter licensing; in the UK and EU, payment-services or e-money rules. Startups usually avoid this by working as an agent of a licensed provider (e.g. Stripe Connect), but holding balances or escrow can still trigger licensing ([Stripe](https://stripe.com/resources/more/what-is-a-money-transmitter), [Faisal Khan](https://faisalkhan.com/solutions/licensing/marketplace-licensing)). This is not legal advice. It needs a fintech lawyer.

**[Recommendation]** **Do not hold money at the start.** First prove that the record has value on its own. Escrow is also where most renovation competitors already are. Payment links and bank or accounting connections can come later. Keep escrow as a future option only if evidence shows the record alone doesn't change behaviour.

### 6.5 Outcomes that would prove value (to measure in pilots)

- Change requests approved *before* work starts (% of changes).
- Value of extras billed vs a baseline period.
- Days from invoice to payment (DSO, days sales outstanding) vs baseline.
- Number of disputed invoices and the amounts written off.
- Payee hours spent chasing payment.
- Payer-side: final cost vs agreed price plus approved changes.

---

## 7. Initial Market

### 7.1 Comparison (based on desk research only, scores are judgement calls)

H = high, M = medium, L = low. For "Competition" and "Complexity," L is better.

| Segment | Severity | Frequency | Money at stake | Willingness to pay | Easy to reach | Competition | Complexity | Expansion potential |
|---|---|---|---|---|---|---|---|---|
| Residential renovation (small contractors + homeowners) | H | H | M ($10k–$200k jobs, assumed) | M (contractor) / H per job (homeowner) | M (trade groups, suppliers, online communities) | H (Buildertrend, Jobber, escrow startups) | M (consumer law) | M |
| Small specialty subcontractors (commercial) | H | H | H | M–H (already pay Siteline/Billd) | M | H | H (chains, lien rules, retention) | M |
| Agencies / professional services | M | H (weekly scope creep) | M | M | H (online, communities) | M (HoneyBook, Bonsai) | L | H (concept transfers well) |
| Freelancers (solo) | M | M | L | L | H | H (Upwork, HoneyBook) | L | M |
| Events suppliers | Possibly H | M (seasonal) | M | Unknown | M | L–M (unclear) | M | M |
| Mid-market procurement / B2B services | M | M | H | Payer may pay | L (long sales cycles) | H (Coupa, Ariba, CLM) | H | H |

### 7.2 What the comparison suggests

- **Residential renovation** has the clearest *two-sided* pain: both parties genuinely fear each other, which matches the "protect both parties" idea. The risk is heavy competition, and contractors may see a neutral record as handing the homeowner leverage.
- **Specialty subcontractors** have the most money at stake and proven willingness to pay, but the problem there is mostly power and cash flow (section 2.3). Specialised incumbents already exist.
- **Agencies** are the easiest to reach and simplest to serve, and their scope-creep pain is exactly the "unconfirmed commitments" problem. The money per firm is smaller, and creative "acceptance" is subjective.

**[Recommendation]** **We do not have enough evidence to choose one market.** Run interviews in **residential renovation** and **agencies** in parallel: one high-stakes two-sided market and one easy-to-reach single-buyer market. Treat specialty subcontractors as a strong third option. Do not start with freelancers (low willingness to pay) or enterprise procurement (slow, crowded).

---

## 8. What We Don't Know

**Most important unknowns**
1. **Will the payer join?** If the other party refuses to confirm items in Retenum, the record is one-sided and loses its value.
2. **Does a better record change behaviour?** Or do late payers pay late regardless? No data found.
3. **Will payees pay for a *neutral* shared record** over tools that serve only them?
4. **Is "deemed acceptance after a deadline" usable** outside construction and marketplaces, and does a Retenum record help in real disputes?
5. **Which segment has the strongest pull?** Every segment score above is desk-based.

**Other gaps**
- No reliable data on events supplier disputes.
- No data on how often renovation disputes come from extras vs quality vs abandonment (UK data says quality, 52.8%).
- Several statistics come from vendors (Rabbet, Siteline, Billd, Ignition) or secondary summaries. Some competitor pricing is third-party and inconsistent.
- No market sizing for the specific wedge (number of firms × likely price). Deliberately not invented here.
- Geography is undecided. UK construction law, US state law and consumer law differ a lot.

**Risks and contradictions in the hypothesis**
- "Protect both parties" can mean "neither party feels it's *their* tool."
- A cross-industry workflow is attractive, but the evidence shows industries differ sharply. Generalising too early risks a vague product.
- The biggest cost (late payment) is the part a record solves least.
- Escrow competitors offer a stronger promise ("your money is safe"), which a record cannot match.
- Small businesses resist extra admin. Any extra step loses to WhatsApp.

---

## 9. What We Need to Validate Next

### 9.1 Interviews (target 30–40 total over 4–6 weeks)

| Who | How many | What to ask | Evidence to collect |
|---|---|---|---|
| Renovation contractors (1–20 staff) | 10 | Walk me through your last job with extras. How were they agreed? Did you get paid for all of them? Last payment dispute: what happened, how much, how long? What software do you pay for and why? | Real job examples, unpaid amounts, current tool spend, change-order documents |
| Homeowners who renovated in the last 2 years | 8 | What did you fear? Did costs exceed the quote? Why? Did you dispute anything? Would you have used a shared record or escrow, and paid for it? | Quote vs final cost, dispute stories, reaction to a contractor inviting them into a shared record |
| Agency owners / ops leads (5–50 staff) | 10 | Last out-of-scope request: how handled, billed or absorbed? How do clients sign off work? Average days to get paid? | Estimated monthly unbilled work (ask them to check real numbers), sign-off process, tools used |
| Agency *clients* (marketing managers) | 4 | How do you approve extra work? Would you accept formal change approvals from your agency? | Willingness to participate on the payer side |
| Specialty subcontractors | 5 | Change orders not paid? Retention outstanding? Would confirmed records have changed the outcome? | Aged receivables, change-order logs |
| Construction / commercial lawyer, adjudicator | 2–3 | Would a timestamped, two-party-confirmed record help? Is deemed acceptance enforceable? | Legal view on evidence value and contract wording |
| Fintech / payments lawyer | 1 | What triggers licensing if we later touch money? | Clear boundaries for the payments roadmap |

**Rules for interviews:** ask about *past behaviour*, not opinions about a future product. Ask to see real documents. Ask what they currently pay for. Don't pitch until the end.

### 9.2 Low-cost experiments (no software build needed)

1. **Concierge pilot.** For 5–10 real engagements, run the "change request → confirm → deadline" process by hand (shared document plus email), with both parties. Measure: does the payer participate? Are changes approved before work? Did anything get billed that otherwise wouldn't have?
2. **Payer acceptance test.** Ask payees to send a mock "please confirm this change" request to real clients. Measure the response rate and objections.
3. **Price test.** Present a priced offer (e.g. a monthly subscription) to interviewed payees and ask for a pre-order or letter of intent. A "yes, I'd use it" does not count.
4. **Dispute file review.** Collect 10–20 real past disputes and classify the cause: unconfirmed change, disputed completion, quality, or plain late payment. This tells us what share of the pain a record could actually fix.

### 9.3 Desk research still needed
- Read the full Rabbet, Siteline and Billd reports, especially for change-order data.
- Check the status of the UK Commercial Payments Bill (ban on retentions).
- Talk to events trade bodies (e.g. PCMA, MPI) for data on supplier disputes.
- Review user reviews of Buildertrend, JobTread and HoneyBook (Capterra, G2) for complaints about change orders and acceptance.

---

## 10. Recommendation

**Is it worth further investigation?** **Yes, with conditions.** The underlying pain is real, large and well documented. The specific product idea (a neutral shared record) is **unproven** and faces three serious tests: will the payer join, does a record change outcomes, and will someone pay for neutrality?

**Validate first, in this order:**
1. **Root cause share.** How much of the money lost comes from *unconfirmed commitments* (which Retenum can fix) vs *plain late payment* (which it mostly can't)? Use the dispute file review and interviews.
2. **Payer participation.** Will clients actually confirm changes and acceptances in a shared process? Use the concierge pilot.
3. **Willingness to pay.** Will payees commit money, not just interest? Use the price test.
4. **Segment choice.** Renovation vs agencies (subcontractors as backup), decided by the evidence above.

**Decisions that should stay open until then:**
- Which industry to enter first.
- Whether Retenum ever handles or holds money (default: no).
- Multi-party support (default: two parties, linkable later).
- The name of the central object and the final feature set.
- Geography (UK vs US) and legal positioning of deemed acceptance.
- Whether the long-term vision is cross-industry or deep in one vertical.

**What would make us stop:** payers routinely refuse to participate; disputes turn out to be mostly about cash and power rather than unclear commitments; or payees won't pay more than they already pay for existing one-sided tools.
