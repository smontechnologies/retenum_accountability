# Retenum — UI/UX Specification

*Version 1.0 · 18 November 2026. Visual rules: `RETENUM_DESIGN_SYSTEM.md`. Requirements: `RETENUM_PRD.md` (journeys UJ-x, requirements FR-x, DES-x, PWA-x). This document defines structure, screens and interaction patterns. Each screen lists the build slice that delivers it.*

---

## 1. Information architecture

```
Retenum
├── Overview                      what needs me, money position, recent activity
├── Engagements                   list, filters, "needs my response"
│   └── Engagement workspace      header + ledger, then six sections
│       ├── Overview              position, awaiting responses, latest activity
│       ├── Agreement             baseline, current version, version history
│       ├── Changes               proposals with agreement / authorisation / valuation
│       ├── Delivery              submissions, reviews, party obligations
│       ├── Payments              schedule, obligations, requests, payments, disputes on amounts
│       └── Activity              tamper-evident timeline, export
├── Payments                      cross-engagement: due to me, due from me, awaiting confirmation
├── Activity                      cross-engagement timeline
├── Business                      current workspace: profile, team, plan, payout setup (Slice 9)
└── Settings                      personal: profile, appearance (theme), security, notifications
```

**Is more navigation needed?** No.
- Notifications live on Overview ("Needs your response") and in email.
- Disputes are shown where they occur (on the item) and filtered in Engagements and Payments.
- Admin is a separate internal area (`/admin`, Slice 7), never shown to customers.
- Workspace switching is a control at the top of the sidebar, not a section.

**Counterparty users** (lightweight identity, no workspace, D-43) see the same structure minus Business. Engagements and Payments are scoped to engagements they are party to.

---

## 2. Navigation

| Viewport | Pattern |
|---|---|
| **< 768 (mobile)** | **Top bar:** page title, back arrow on nested pages, overflow menu. **Bottom navigation** (5 items, icon + label, ≥ 44 px): Overview, Engagements, Payments, Activity, More. **More** opens a sheet with Business, Settings, switch workspace, sign out |
| **768–1023 (tablet)** | **Icon rail** (72 px) with labels as tooltips plus a visible label for the current item. Top bar with page title |
| **≥ 1024 (desktop)** | **Persistent sidebar** (248 px): wordmark, workspace switcher, primary nav (Overview, Engagements, Payments, Activity), then secondary nav (Business, Settings), with the user menu at the bottom |

- Current location uses `aria-current="page"` plus the selected style (DES §8).
- Engagement sections: **desktop and tablet** use a tab bar under the engagement header. **Mobile** uses an engagement overview with a **section list** (each row shows its section name, a count and the most urgent status), and each section opens as its own page with a back arrow. No horizontally scrolling tab bar.
- **Primary action placement:** on mobile, the single most important pending action for the viewer sits in a **sticky action bar** above the bottom nav (e.g. "Review change"). On desktop it's in the engagement header's action area and the right rail.

---

## 3. Layouts

### 3.1 Desktop app shell (≥ 1024)

```
┌────────────┬───────────────────────────────────────────────────────────┐
│ Retenum    │  Page title                               [primary action] │
│ [Ada Studio▾]                                                           │
│            │  ┌───────────────────────────────────────────────────────┐ │
│ Overview   │  │                    page content                        │ │
│ Engagements│  │                 (max-width 1240)                       │ │
│ Payments   │  └───────────────────────────────────────────────────────┘ │
│ Activity   │                                                             │
│ ────────── │                                                             │
│ Business   │                                                             │
│ Settings   │                                                             │
│            │                                                             │
│ Ada Obi ▾  │                                                             │
└────────────┴───────────────────────────────────────────────────────────┘
```

### 3.2 Engagement workspace, desktop (≥ 1280 with right rail)

```
┌ sidebar ┬──────────────────────────────────────────────┬─ right rail (320) ─┐
│         │ Q1 Campaign · Kola Foods (payer)   [Active v2]│ Needs your response│
│         │ You are the payee                  [Actions ▾]│ ▢ Change CH-3      │
│         │ ┌──────────┬──────────┬──────────────────────┐│   Valuation: open  │
│         │ │ Agreed   │ Paid     │ Outstanding          ││ ▢ Delivery D-2     │
│         │ │₦1,620,000│ ₦600,000 │ ₦420,000 · ₦50,000   ││                    │
│         │ │          │          │ disputed             ││ Recent activity    │
│         │ └──────────┴──────────┴──────────────────────┘│ 14:05 Ngozi        │
│         │ Overview Agreement Changes Delivery Payments  │  authorised CH-3   │
│         │ Activity                                      │ …                  │
│         │ ───────────────────────────────────────────── │                    │
│         │ section content                               │                    │
└─────────┴──────────────────────────────────────────────┴────────────────────┘
```

At 1024–1279 the right rail content moves into the Overview section.

### 3.3 Mobile engagement overview (< 768)

```
┌──────────────────────────────┐
│ ←  Q1 Campaign           ⋯   │  top bar
├──────────────────────────────┤
│ Kola Foods · you are payee   │
│ [Active] [Version 2]         │
│ ┌────────────┬─────────────┐ │
│ │ Agreed     │ Outstanding │ │  ledger (2 × 2)
│ │ ₦1,620,000 │ ₦420,000    │ │
│ │ Paid       │ Disputed    │ │
│ │ ₦600,000   │ ₦50,000     │ │
│ └────────────┴─────────────┘ │
│ Needs your response (2)      │
│ ▢ Change CH-3 · valuation    │
│ ▢ Delivery D-2 · review      │
│ ──────────────────────────── │
│ Agreement        v2       ›  │  section list
│ Changes          3 open   ›  │
│ Delivery         1 waiting›  │
│ Payments         1 due    ›  │
│ Activity                  ›  │
├──────────────────────────────┤
│ [ Review change CH-3       ] │  sticky action bar
├──────────────────────────────┤
│ ⌂    ▤     ₦     ↺     ⋯     │  bottom nav
└──────────────────────────────┘
```

### 3.4 Tables on mobile

Every table becomes a stacked list at < 768: one row becomes a block with its main label in bold, a status badge, and the key figure right-aligned. Secondary fields appear as label/value lines. Nothing is dropped. Fields that don't fit the block appear on the row's detail page.

---

## 4. Screen inventory

| # | Screen | Route | Purpose | Slice |
|---|---|---|---|---|
| S0 | Onboarding: set up your business (step 1 of 2) | `/onboarding` | No app screen without a workspace; then the Overview prompts the first engagement (FR-ONB-01/02) | 1A+ |
| S1 | Sign in, sign up, check email, forgot / reset password | `/sign-in` etc. | Access | 1 → restyled 1A |
| S2 | Workspace invitation | `/invite/[token]` | Join a team | 1 → 1A |
| S3 | Overview | `/app` | What needs me, money position, recent activity | 1A (empty states) → filled in 2–5 |
| S4 | Engagements list | `/app/engagements` | Find engagements, filter by status and "needs my response" | 1A shell → 2 |
| S5 | New engagement (draft editor) | `/app/engagements/new` | Commitments, payment schedule, response windows, source document, counterparty | 2 |
| S6 | Engagement workspace: Overview | `/app/engagements/[id]` | Header + ledger + needs-response + sections | 2 |
| S7 | Agreement | `…/agreement` | Baseline, current version, "was → now" history | 2–3 |
| S8 | Changes (list + detail + composer drawer) | `…/changes` | Propose and respond (three dimensions) | 3 |
| S9 | Delivery (list + submission drawer + review) | `…/delivery` | Submit and review, partial acceptance | 4 |
| S10 | Payments (engagement) | `…/payments` | Schedule, obligations, requests, record and confirm payments, amount disputes | 5 (provider checkout 9) |
| S11 | Activity (engagement) | `…/activity` | Timeline, filters, export PDF | 6 |
| S12 | Counterparty landing → code → baseline review | `/e/[token]` | Join without a password and confirm | 2 |
| S13 | Payments (global) | `/app/payments` | Due to me, due from me, awaiting confirmation | 1A shell → 5 |
| S14 | Activity (global) | `/app/activity` | Cross-engagement timeline | 1A shell → 6 |
| S15 | Business | `/app/business` | Workspace profile, team, invitations, plan; payout setup (9) | 1A (moves `/app/w/[id]`) |
| S16 | Create workspace | `/app/business/new` | First-run and additional workspaces | 1A |
| S17 | Settings | `/app/settings` | Profile, Appearance (theme), Security | 1A |
| S18 | Offline page | `/offline.html` (self-contained, no framework scripts) | Shown by the service worker when a page isn't available offline | 1A |
| S19 | Close engagement / final account | `…/close` (drawer) | Final account proposal and response | 6 |
| S20 | Admin | `/admin/*` | Internal operations | 7 |
| S21 | Pay (checkout hand-off and return) | `…/payments/[obligation]/pay`, `/pay/return` | Provider checkout | 9 |

---

## 5. Core user journeys (screen flow)

| Journey | Flow |
|---|---|
| UJ-1 Set up | S1 sign up → check email → verify → **S0 onboarding (create workspace)** → S3 Overview ("Your workspace is ready", **New engagement**) → S15 invite team (optional) |
| UJ-2 Create and confirm | S4 → S5 draft (commitments → schedule → response windows → counterparty) → review → submit → counterparty S12 (code → baseline review → acknowledge → confirm) → both see S6 **Active v1** |
| UJ-3 Change with authorisation before valuation | S8 composer (what changes → price and time effect → schedule effect → reason) → send → payer S8 detail: **three separate response controls** → "Authorise work only" + valuation counter → payee counters → payer confirms valuation → v2 |
| UJ-4 Delivery and partial acceptance | S9 submit (pick deliverables → claim → evidence) → payer review (Accept / Accept with issues / Partly accept / Request correction / Reject) → obligations become due pro-rata in S10 |
| UJ-5 Pay via provider (Slice 9) | S10 obligation → PaymentSummary → "Continue to secure payment" → provider checkout → S21 return page shows "Checking payment…" until a verified status arrives |
| UJ-6 Off-platform payment | S10 obligation → "Record a payment you made" drawer → PaymentSummary → record → status *Reported, awaiting confirmation* → payee confirms receipt → *Paid* |
| UJ-7 Dispute | Any item → "Dispute" → amount (if financial) + position + evidence → both positions shown side by side; undisputed amount remains *Due* |
| UJ-8 Close | S19 propose final account → other side confirms, or disputes lines → *Closed* / *Closed with open items* |

---

## 6. Interaction patterns

### 6.1 Agreement and confirmation (FR-BAS, DES-06)

1. **Review before confirming.** The confirmation screen shows the full baseline as structured lists: commitments, the party obligations of both sides, the payment schedule with triggers, and response windows. It also shows the governing-document note (D-45) and a link to the source document.
2. **Explicit acknowledgement.** A checkbox: "I confirm this agreement on behalf of [organisation]. Once confirmed, it becomes version 1 of the shared record and can only change through confirmed changes."
3. **Commit button** names the act: "Confirm agreement". Alternatives sit beside it: "Request changes" (comment required) and "Decline" (reason required, behind a ConfirmDialog).
4. **Pending state:** the button shows "Confirming…" until the server responds. Nothing appears confirmed before the server acknowledges it (PWA-06).
5. **Result:** a toast ("Agreement confirmed"), the status badge changes to *Confirmed / Active v1*, and a timeline entry appears.

### 6.1a The agreement as a step flow (D-65)

```
① Agreement confirmed
   ↳ Deposit ₦600,000 becomes due when the agreement is confirmed
   + Payment when confirmed
② Deliverable · Three concepts                      ₦600,000
   Done when: …                     Edit · Remove · ↓
   + Payment when accepted
③ Deliverable · Launch assets                       ₦900,000
   ↳ Balance ₦900,000 becomes due when this is accepted
   + Payment when accepted
[ + Add step ]  → Deliverable · What a party provides · Payment on a date · Payment when requested
```

The order is part of the agreement. Draft-only controls are Edit, Remove, ↑ and ↓. The counterparty sees the same flow without controls.

### 6.2 Responding to a change: three dimensions, never merged (§19 of the PRD)

The change detail shows **Was → Now** (side by side on desktop, stacked on mobile), the reason, and the price, time and schedule effects. Below that are **three labelled response groups**, each with its own state badge and controls:

```
Agreement     [Proposed]      ( Confirm terms )  ( Reject )  ( Counter )
Authorisation [Requested]     ( Authorise work only )  ( Decline )     ← payer side only
Valuation     [Proposed ₦150,000]  ( Agree ₦150,000 )  ( Offer another amount )  ( Dispute )
```

- "Authorise work only" opens a ConfirmDialog stating: "**You are permitting work to proceed. You are not agreeing a price.**" (V-3)
- "Confirm change" (agreement + valuation together) is offered as a single primary action only when the valuation is a single proposed figure, and its dialog lists both effects (V-5).
- A change that is stale (FR-CHG-09) shows a *Stale* badge, and the controls are replaced by "This change was proposed against version 1. Ask for it to be re-proposed against version 2."

### 6.3 Delivery review

The review drawer lists the claimed items and evidence (thumbnails with file name, size and SHA-256 shortened, all openable). Response options are radio cards with a one-line consequence each. "Partly accept" reveals a quantity or money field showing the resulting due amount live (A-2). "Reject" and "Request correction" require a reason that references the definition of done (shown inline).

### 6.4 Payment interaction patterns

- **PaymentSummary always precedes money actions.** It shows: obligation, why it's due (trigger), amount due, already paid, this payment, outstanding after it, the recipient (payee organisation), and how it's paid ("Bank transfer you make yourself" or "Secure card / transfer payment via Bachs"). Before Slice 9, only the off-platform route exists.
- **Recording an off-platform payment:** the form asks for amount (defaulting to outstanding), date, method, reference and an optional proof file. After recording, the status shows *Reported, awaiting confirmation*. The copy says plainly that it counts as paid once the payee confirms receipt.
- **Confirming receipt (payee):** shows the reported details and proof, with "Confirm receipt" and "I haven't received this" (reason required).
- **Provider payments (Slice 9):** "Continue to secure payment" hands off to the hosted checkout. The return page polls Retenum's own status and shows *Checking payment…*, then *Paid*, *Payment failed* (with the provider's reason, shown to the payer only) or *Payment not completed* (abandoned). **The browser return alone never shows "Paid"** (FR-PAY-03).
- Disputed amounts are shown as a separate line under the obligation. The **Pay** action still allows paying up to the full outstanding amount (P-8).

### 6.5 Destructive and irreversible actions

Commercial acts (confirm, decline, reject, authorise, accept, dispute, close, stop notice) always go through a ConfirmDialog that states what will be recorded and that it cannot be edited afterwards. The least destructive option gets initial focus.

---

## 7. States

| State | Pattern |
|---|---|
| **Loading** | Skeletons matching the final layout (ledger skeleton, list rows). Route-level `loading.tsx` per section. No full-page spinners |
| **Empty** | EmptyState with one sentence and the next action. E.g. Engagements: "No engagements yet. Create one from a quote you've already agreed." → "New engagement" |
| **Error** | ErrorState: what failed, what to do ("Try again" / "Go to Overview"). Server errors never show technical details. Form errors use inline messages plus a summary |
| **Permission** | Non-members get a "not found" page (no hint that the resource exists) |
| **Offline** | See §8 |
| **Stale data** | After reconnecting, pages refresh their data. Any form opened before going offline re-checks the version on submit (stale rule) |

---

## 8. PWA and offline behaviour

| Topic | Behaviour |
|---|---|
| Install | Manifest with name, short name, icons (192, 512, maskable 512, Apple 180), `display: standalone`, `start_url: /app`, theme and background colours per scheme. Installable on Android/Chrome desktop. iOS via "Add to Home Screen" (Apple touch icon, status-bar style) |
| Splash | Generated from the manifest name, background colour and 512 icon (Android). Apple uses the touch icon |
| Service worker caching | **Cache-first** for versioned static assets (`/_next/static/*`, fonts, icons). **Network-only** for pages, server actions, API routes and the auth endpoint. **Offline fallback** page (`/offline.html`, self-contained) for navigations that fail. Authenticated pages and financial data are **not** cached in the MVP (PWA-05) |
| Network status | `OfflineBanner`: "You're offline. You can read pages already open, but nothing can be confirmed, recorded or paid until you reconnect." Reconnecting shows "Back online" for 3 s, and the current page's data is refreshed |
| Offline actions | All submit buttons are disabled with the reason shown. Nothing is queued or retried automatically, so a confirmation is never sent later without the user knowing (PWA-06, PWA-07). Next.js `experimental.useOffline` auto-retry is **not used** for this reason |
| Updates | A new service worker waits. `UpdateBanner` offers "Reload to update". It activates only when the user agrees (no mid-form reloads) |
| Payments | Always require online verification (FR-PAY-03). Pay buttons are hidden offline, replaced by "Payments need a connection" |

---

## 9. Responsive test matrix (DES-08)

| Width | Device class | Checks |
|---|---|---|
| 320 × 640 | Small phone | No horizontal scroll, bottom nav fits, forms usable |
| 390 × 844 | Large phone | Primary journeys |
| 768 × 1024 | Tablet | Icon rail, tables still readable |
| 1024 × 768 | Small desktop | Sidebar plus content without the rail |
| 1280 × 800 | Standard desktop | Right rail in the engagement workspace |
| 1536 × 900 | Large desktop | Max-width content, no stretched lines |

Every UI slice runs automated overflow checks at all six widths and axe checks in light and dark themes. Key journeys run end to end at 390 and 1280 in both themes.
