# Retenum — Engagement as a Bubble-style workflow (plan for alignment)

*19 November 2026 · Status: **proposal, no code written**. Founder request: "the entire engagement should work like Bubble workflows, and feel exactly the same." This document describes how Bubble's workflow editor works, how Retenum would adopt it, what must differ for commercial and legal reasons, and the decisions we need to agree before building.*

---

## 1. How Bubble's workflow editor works (researched)

Sources: Bubble manual, [Workflows](https://manual.bubble.io/help-guides/logic/workflows), [Events](https://manual.bubble.io/help-guides/logic/workflows/events.md), [The workflow property editor](https://manual.bubble.io/core-resources/bubble-workflows/the-workflow-property-editor), [Conditional workflow properties](https://manual.bubble.io/core-resources/bubble-workflows/conditional-workflow-properties); Bubble support, [Workflow actions](https://bubble.io/support/en/articles/11013060-workflow-actions-in-bubble).

| Concept | How Bubble does it |
|---|---|
| **Workflow** | "The combination of an *event* that triggers one or more *actions*" |
| **Where** | Each page has a **Workflow tab**. Server-side logic lives in **Backend workflows** |
| **Layout** | A left list of workflows; a **vertical canvas**: "A workflow reads from top to bottom, starting with the event"; a **property editor docked on the right** |
| **Events** | Element events (button clicked), general events (page loaded, user logged in, "a condition becoming true"), **custom events** (reusable, triggered by other workflows); backend: scheduled API workflows, **recurring events**, **database triggers** ("fire when a data change matches the conditions you set") |
| **Adding actions** | "Click the **+** icon underneath the event" (older editor: "Click here to add an action") → a **categorised, searchable menu** (Account, Data, Elements, Navigation, Email and notifications, Plugins…) |
| **Steps** | Numbered (Step 1, 2, 3…). Each card shows a **category icon, label and its condition**. Order matters ("actions start in the order you place them") |
| **Property editor** | Opens on the right when you select an event or action: action-specific fields, **Only when**, **Disable action**, **breakpoint**, **notes** |
| **Only when** | Per event (the whole workflow) or per action. A false condition **skips that step only**; the workflow continues |
| **Data between steps** | "**Result of step X**" uses an earlier step's output |
| **Control** | "**Terminate this workflow**". Workflows can be **disabled** without being deleted |
| **Organising** | **Folders**, **colours**, filters (by folder, by event type, show conditions), search, a shareable URL per workflow |
| **Debugger** | Shows, step by step, which actions **ran** and which were **skipped** by their condition |

---

## 2. What Retenum would adopt, and what must be different

Retenum users aren't app builders: they're agencies and their clients agreeing money. So we keep **Bubble's structure, look and interaction pattern**, but with a **fixed commercial vocabulary** instead of Bubble's open-ended expression builder. The steps read like plain sentences.

| Bubble | Retenum equivalent | Same / different |
|---|---|---|
| Page with a Workflow tab | **The engagement *is* the workflow editor** (the main view of every engagement) | Same idea, made central |
| Left list of workflows (folders, colours) | Left list of the engagement's workflows, grouped by **stage** (Agreement, Delivery, Payments, Changes, Reminders) | Same |
| Event at the top of a workflow | **Trigger**, e.g. "When *Launch assets* is accepted", "On 12 Jan", "When a change is confirmed" | Same, fixed list (§3) |
| Numbered actions under the event | Numbered **steps**, e.g. "1 Make *Balance ₦900,000* due · 2 Notify Kola Foods · 3 Unlock *Stage 2*" | Same |
| **+** under the event → categorised menu | **+** under each trigger and after each step → menu: Deliver, Pay, Approve, Notify, Remind, Control | Same |
| Property editor on the right | **Step editor** on the right (desktop) or a bottom sheet (mobile) | Same on desktop; mobile adapted |
| Only when | **Only when** with a plain-language condition builder ("only when delivered before 31 Jan", "only when change CH-2 is confirmed") | Same concept, guided builder (no free expressions) |
| Result of step X | Steps can refer to earlier ones ("the payment created in step 1") | Same |
| Terminate this workflow | **Stop this workflow** | Same |
| Disable workflow / action | **Draft only.** After confirmation nothing can be silently disabled; it needs a confirmed change | **Different** (integrity) |
| Debugger (ran / skipped) | **Run history**: every time a workflow ran, each step shows *ran*, *skipped (condition false)* or *waiting for confirmation*. This becomes the engagement's audit trail | Same, and it doubles as the tamper-evident record |
| One builder, full control | **Two parties.** Commercial workflows are agreed by both | **Different, essential** (§4) |
| Runs in the browser or backend | **Runs on the server only**, recorded and idempotent | Different (money and integrity) |

---

## 3. Vocabulary (version 1 proposal)

### Triggers (events)

| Trigger | Example |
|---|---|
| Agreement confirmed | "When the agreement is confirmed" |
| Deliverable submitted / accepted / partly accepted / rejected | "When *Three concepts* is accepted" |
| A party's obligation fulfilled / missed | "When *brand assets* are provided" |
| Date reached | "On 12 Jan 2027" or "14 days after the agreement is confirmed" |
| Change confirmed / authorised | "When a change is confirmed" |
| Payment received (confirmed) / failed | "When *Deposit* is paid" |
| No response by deadline | "When Kola Foods hasn't responded within 3 working days" |
| Workflow finished | "When workflow *Stage 1* finishes" (Bubble's custom event) |

### Steps (actions), with menu categories

| Category | Steps | Commercial? |
|---|---|---|
| **Pay** | Make a payment due (amount, payable within N days) · Request payment · Hold back (retention, later) | Yes |
| **Deliver** | Start a deliverable (it becomes active) · Require evidence | Yes |
| **Approve** | Ask the other party to accept / confirm | Yes |
| **Notify** | Notify a party · Send a reminder (after N days, repeat) | No (helper) |
| **Control** | Unlock the next stage (start another workflow) · Stop this workflow | Yes, when it unlocks commercial steps |

**Commercial steps** create or change what someone owes or must deliver, so they're part of the agreement. **Helper steps** only inform.

### Only-when conditions (guided, version 1)

- A deliverable was accepted / was delivered before a date.
- A payment has been made in full.
- A change has been confirmed.
- Days since a trigger is more or less than N.
- The amount outstanding is more or less than X.

---

## 4. Rules that keep it a neutral commercial record

1. **Commercial workflows are part of the agreement.** Both parties confirm them together, as version 1.
2. **After confirmation, commercial workflows are locked.** Adding, editing, reordering or disabling a step is proposed as a **change** that the other party confirms (agreement, authorisation and valuation stay separate statuses on that change). This *is* Slice 3, in workflow form.
3. **Helper workflows** (reminders, notifications) can be added by either side anytime and are visible to both. They can't create obligations.
4. **The engine runs only on the server, from verified events.** A payment counts as received only from a confirmed record, never from the browser.
5. **Nothing is silently skipped.** Every run is recorded with which steps ran, were skipped (and which condition was false), or are waiting. That record is append-only and hash-chained, like today's events.
6. **Retenum never decides disputes.** A disputed step pauses its workflow ("waiting: disputed") until resolved. It isn't resolved automatically.

---

## 5. The experience

### Desktop: three panes, like Bubble

```
┌ App sidebar ┬─ Workflows ───────────┬─ Canvas ─────────────────────────────┬─ Step editor ───────────┐
│ Overview    │ Search workflows      │ ● When the agreement is confirmed    │ Make a payment due      │
│ Engagements │ ▾ Agreement           │ │                                    │                         │
│ Payments    │   ● Agreement confirmed│ ├ 1 💳 Make "Deposit" due            │ Payment name  Deposit   │
│ …           │ ▾ Delivery            │ │     ₦600,000 · payable in 7 days    │ Amount        ₦600,000  │
│             │   ● Concepts accepted │ ├ 2 🔔 Notify Kola Foods             │ Payable within 7 days   │
│             │   ● Launch accepted   │ │                                    │                         │
│             │ ▾ Payments            │ ├ 3 ▶ Start "Three concepts"         │ Only when               │
│             │ ▾ Reminders (helper)  │ │     Only when: brand assets provided│ [+ Add a condition]     │
│             │                        │ │                                    │                         │
│             │ [+ New workflow]       │ └ [+] Add a step                     │ Notes                   │
└─────────────┴────────────────────────┴──────────────────────────────────────┴─────────────────────────┘
 Header above all: engagement name · other party · status · Agreed / Paid / Outstanding (ledger)
```

### Mobile: the same model, adapted

- The **workflow list** is the engagement's home screen (grouped by stage, each showing its trigger and a status).
- Tapping a workflow opens the **vertical canvas** full-screen.
- Tapping a step or "+" opens the **step editor as a bottom sheet**.
- The **primary pending action** ("Confirm agreement", "Accept delivery") stays in a sticky bar.

### Running state (after confirmation)

The canvas turns from **design** into **live** mode. Each step shows **Done ✓ (date)**, **Waiting for Kola Foods**, **Skipped (condition false)** or **Not started**. Triggers the parties act on ("Accept delivery", "Confirm payment received") become buttons right on the canvas.

### Run history (Bubble's debugger, made permanent)

Every run is listed: *"14 Feb 10:02 — Launch assets accepted by Ngozi → Step 1 Balance ₦900,000 became due ✓ · Step 2 Notified Ada Studio ✓ · Step 3 skipped (condition: delivered before 31 Jan was false)."*

### Building from a blank start (no templates)

Founder decision (§10.6): **there are no templates.** The initiator builds their own agreement the way a Bubble user builds an app. They click **+**, choose which element of the engagement goes there (a deliverable, a payment, an approval, a reminder…), and place it where they want it. The experience should make them feel like **both the engineer and the lawyer of their own agreement**: simple visual building blocks that compose a precise commercial agreement.

- A new engagement opens with one workflow, **"When the agreement is confirmed"**, and an empty **+** under it, plus **+ New workflow** in the list.
- An empty canvas is fine while drafting. It still **can't be sent** until it has at least one priced deliverable and a payment (FR-ENG-12), and the editor lists what's missing.
- **"Read as agreement" (proposed, to confirm):** a toggle that renders the workflows as numbered plain-language clauses, e.g. *"3. When Kola Foods accepts the Launch assets, a payment of ₦900,000 (Balance) becomes due, payable within 7 days."* That's what the counterparty reviews and confirms, so the visual build and the agreement text always say the same thing.

---

## 6. How it maps to what's already built

| Built (Slices 0–2 + step flow) | In the workflow model |
|---|---|
| Engagement, parties, counterparty code access, baseline confirmation, versions, event chain | **Kept as is** |
| Commitments (deliverables, party obligations, payment obligations with triggers) | Become **steps** inside workflows; their triggers become workflow **triggers**. The data migrates; nothing is lost |
| Step flow UI (Agreement tab) | Replaced by the **three-pane workflow editor** |
| Domain rules (no empty engagement, summaries, due amounts) | Kept; computed from workflow steps |

---

## 7. Effect on the build plan

| Slice | Before | After (proposed) |
|---|---|---|
| **W1** (new) | — | Workflow model: workflows, triggers, steps, conditions, templates, migration of existing commitments; the three-pane editor in **draft** mode; confirmation of the workflows as the agreement |
| **W2** (new) | — | **Engine**: server-side runner for triggers and steps (idempotent, recorded runs, hash-chained); live canvas; run history |
| 3 | Changes | **Workflow changes**: propose add, edit, reorder or remove steps after confirmation, with agreement, authorisation and valuation |
| 4 | Delivery | Delivery triggers and steps (submit, accept, partial, reject, evidence files) |
| 5 | Financial record | Pay steps, the ledger computed from runs, off-platform payments |
| 6–9 | Closure, notifications, production readiness, Bachs | Unchanged in purpose; notifications become helper steps |

**Estimate:** W1 about 6–8 days and W2 about 5–7 days. The work replaces parts of Slices 3–5 rather than simply adding to them.

---

## 8. Risks and challenges

| Risk | Mitigation |
|---|---|
| **Too complex for non-technical clients** (Bubble is a builder's tool) | Templates; plain-sentence steps; a fixed vocabulary; the counterparty mainly *reviews* and *acts*, rarely builds |
| **Mobile editing of a canvas is hard** | List → canvas → bottom-sheet editor. Building complex workflows is best on desktop; acting is easy on mobile |
| **Legal:** an automated step making money due is an obligation | Commercial steps exist only because both confirmed them (§4). The run history records why each step ran |
| **Engine errors could create wrong obligations** | Server-only, deterministic, idempotent; each run recorded; disputes pause; extensive tests per trigger and step |
| **Scope growth** | Version 1 vocabulary only (§3). New triggers and steps are added deliberately |
| **Rework of the step flow just built** | The data model is reused. Only the UI layer is replaced |

---

## 9. Decisions to align before any code

1. **Is the workflow editor the *main view* of every engagement** (replacing the Overview / Agreement / Changes / Delivery / Payments tabs), with the ledger header kept on top? *Recommendation: yes.*
2. **Layout: three panes on desktop** (workflow list · vertical canvas · step editor), and list → canvas → bottom sheet on mobile? *Recommendation: yes.*
3. **Version 1 vocabulary** (§3): enough, too much, or anything missing for your market?
4. **Who builds:** only the initiating business while in draft, or can the counterparty also propose workflow edits before confirming? *Recommendation: the initiator builds; the counterparty can "ask for changes" with comments (as today), and propose step edits after confirmation via changes.*
5. **Helper workflows** (reminders, notifications) in version 1, or after the engine is proven? *Recommendation: include "Notify" and "Remind" in W2.*
6. **Templates:** which 2–3 templates first? *Proposal: "Agency project (deposit, milestones, balance)", "Retainer (monthly)", "Simple fixed price (pay on completion)".*
7. **Run history replaces the Activity tab?** *Recommendation: yes. Activity becomes the run history plus other records (confirmations, disputes).*
8. **Re-sequenced build plan (§7):** approve W1 → W2 → workflow changes → delivery → payments?

---

## 10. Agreed decisions (19 Nov 2026)

| # | Decision | Agreed |
|---|---|---|
| 1 | The workflow editor **is the main view** of every engagement, replacing the Overview / Agreement / Changes / Delivery / Payments tabs. The ledger header (Agreed · Paid · Outstanding) stays on top. Activity becomes the **run history** | ✅ Yes |
| 2 | **Three panes on desktop** (workflow list · vertical canvas · step editor docked right). Mobile: list → canvas → bottom-sheet editor | ✅ Yes |
| 4 | **The initiator builds** the draft workflows. The counterparty reviews and can ask for changes with comments. After confirmation, either side proposes step changes, which the other confirms | ✅ Yes |
| 5 | **Helper workflows (Notify, Remind) in version 1** of the engine. Visible to both, never create obligations | ✅ Yes |

| 3 | **Version 1 vocabulary** as in §3: all listed triggers and steps | ✅ Yes |
| 6 | **No templates.** Users build from a blank start with + and the element menu ("feel like the engineer and lawyer of their own agreement") | ✅ Founder decision |
| 8 | **Build order:** W1 (workflow model + three-pane editor + confirming workflows as the agreement) → W2 (server engine, live canvas, run history) → workflow changes → delivery → payments → closure, notifications, production readiness, Bachs | ✅ Approved |

**Open (proposed):** the "Read as agreement" clause view (§5) as part of W1.
