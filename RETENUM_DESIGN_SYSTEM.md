# Retenum — Design System

*Version 1.0 · 18 November 2026. This is the binding reference for every interface. Tokens live in `app/src/app/globals.css`. Components live in `app/src/components/ui/`. Requirement IDs (DES-xx, PWA-xx) are in `RETENUM_PRD.md` §16a. Screen-level behaviour is in `RETENUM_UI_UX_SPECIFICATION.md`.*

---

## 1. Design intent

Retenum is a **neutral commercial record**. The interface should feel like a well-kept ledger: calm, precise and impartial. It should never feel like a dashboard competing for attention.

| We want it to feel | So we… | We avoid |
|---|---|---|
| Trustworthy, neutral | Use one restrained monochrome palette for both parties. Nothing visually favours payer or payee | Brand colour, "hero" accents, celebratory effects |
| Financially clear | Give money its own typographic treatment: tabular figures, fixed alignment, explicit currency | Charts as decoration, rounded-off amounts, colour-coded money |
| Precise | Use a strict 4 px spacing grid, consistent radii by hierarchy, and hairline structure | Random spacing, one radius on everything, heavy shadows |
| Serious, professional | Write in plain sentence-case language and use a single typeface family | All-caps labels, emoji, marketing tone inside the app |

**The one memorable element is the ledger.** That means the engagement's financial position (Agreed · Paid · Outstanding) set in large tabular figures with hairline dividers, plus a **status grammar** that works without colour. Everything around it stays quiet.

---

## 2. Colour

### 2.1 Palette (the only colours allowed)

Black, white and neutral greys. **No hue, no gradients, no tinted greys.**

### 2.2 Semantic tokens

Components **never** use raw hex values. They use these tokens, exposed to Tailwind as colour utilities (e.g. `bg-surface`, `text-fg-muted`, `border-line`).

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--bg` | Page background | `#FFFFFF` | `#0E0E0E` |
| `--surface` | Secondary surfaces: sidebar, table header, inset areas | `#F5F5F5` | `#171717` |
| `--surface-raised` | Cards, dialogs, drawers, menus | `#FFFFFF` | `#1E1E1E` |
| `--surface-sunken` | Wells, disabled inputs, code/reference blocks | `#EDEDED` | `#0A0A0A` |
| `--fg` | Primary text and icons | `#000000` | `#FFFFFF` |
| `--fg-secondary` | Secondary text | `#3D3D3D` | `#C8C8C8` |
| `--fg-muted` | Supporting text, captions, placeholders | `#666666` | `#9C9C9C` |
| `--line` | Decorative borders, dividers (hairlines) | `#E2E2E2` | `#2B2B2B` |
| `--line-strong` | Interactive borders (inputs, outline buttons, badges) | `#858585` | `#737373` |
| `--action` | Primary action background | `#000000` | `#FFFFFF` |
| `--action-fg` | Text on primary action | `#FFFFFF` | `#000000` |
| `--action-hover` | Primary action hover | `#262626` | `#E0E0E0` |
| `--focus` | Focus ring | `#000000` | `#FFFFFF` |
| `--overlay` | Scrim behind dialogs and drawers | `rgb(0 0 0 / 0.45)` | `rgb(0 0 0 / 0.7)` |

### 2.3 Contrast (WCAG 2.2 AA, checked)

| Pair | Light | Dark | Requirement |
|---|---|---|---|
| `fg` on `bg` | 21.0 | 19.3 | ≥ 4.5 |
| `fg-secondary` on `bg` / `surface` | 10.9 / 10.0 | 11.5 / 10.7 | ≥ 4.5 |
| `fg-muted` on `bg` / `surface` / `surface-raised` / `surface-sunken` | 5.7 / 5.3 / 5.7 / 4.9 | 7.0 / 6.5 / 6.1 / 7.2 | ≥ 4.5 |
| `line-strong` on `bg` / `surface` / `surface-raised` (input borders, non-text) | 3.7 / 3.4 / 3.7 | 4.1 / 3.8 / 3.5 | ≥ 3.0 |
| `action-fg` on `action` | 21.0 | 21.0 | ≥ 4.5 |

*Ratios computed with the WCAG relative-luminance formula (script run 18 Nov 2026).*

`--line` is decorative only. It must never be the sole boundary of an interactive control. Automated axe checks run in both themes (DES-09).

### 2.4 Themes

- Three user choices: **Light**, **Dark**, **System** (DES-02).
- Implemented with `data-theme` on `<html>`: `light`, `dark`, or `system`. When the value is `system`, `prefers-color-scheme` selects the token set in CSS, so no JavaScript is needed and nothing flashes.
- The server reads the preference cookie when rendering `<html>`, so the first paint is in the right theme. The preference is also saved to the user's account and restored on sign-in on another device (DES-03).
- `color-scheme` is set so native controls (scrollbars, date pickers) follow the theme.
- `theme-color` meta values: `#FFFFFF` (light) and `#0E0E0E` (dark).

---

## 3. Typography

### 3.1 Family

**IBM Plex Sans** (400, 500, 600), self-hosted through `next/font` so there are no third-party requests at runtime and it is cached for offline use.

Why: its institutional, engineered character suits commercial records, it has true **tabular figures** (`tnum`), it is clearly legible at small sizes, and it isn't one of the default UI faces most SaaS products use. One family only. Hierarchy comes from size and weight, not from a second face. **No monospace** in the UI, including for references and IDs, which use tabular figures in Plex Sans.

### 3.2 Scale

Base 16 px (inputs are never below 16 px, which prevents iOS zoom on focus). Ratio roughly 1.2.

| Token | Size / line height | Weight | Use |
|---|---|---|---|
| `text-figure-xl` | 32 / 36 (mobile 26 / 30) | 500, tabular | Ledger figures in the engagement header |
| `text-display` | 28 / 34 | 600 | Page title (one per page) |
| `text-h2` | 22 / 28 | 600 | Section title |
| `text-h3` | 18 / 24 | 600 | Panel and card title |
| `text-body` | 16 / 24 | 400 | Body text, inputs |
| `text-small` | 14 / 20 | 400 | Secondary text, table cells, buttons |
| `text-caption` | 13 / 18 | 400/500 | Captions, badge labels, timestamps |

### 3.3 Rules

- **Sentence case everywhere.** No all-caps labels, no tracked-out eyebrows above headings.
- **Money:** always `tabular-nums`, always with the currency symbol, always exactly two decimals for NGN (₦1,250,000.00), right-aligned in tables, and never abbreviated in a record (₦1.2m is allowed only in an explicitly labelled summary, never on a statement). Negative values use a leading minus. Credits are labelled "Credit", not shown in a different colour (DES-05).
- **Dates:** "18 Nov 2026" (in tables), "18 Nov 2026, 14:05" (in history). Times are shown in Africa/Lagos time, with relative time ("2 hours ago") as secondary text only, never instead of the date.
- Line length ≤ 75 characters for running text.
- Emphasis uses weight 600, never colour or italics.

---

## 4. Spacing, layout grid, radii, borders, elevation

### 4.1 Spacing (4 px base)

`1 = 4 px`, `2 = 8`, `3 = 12`, `4 = 16`, `5 = 20`, `6 = 24`, `8 = 32`, `10 = 40`, `12 = 48`, `16 = 64`. Use only these steps.

| Context | Mobile | Desktop |
|---|---|---|
| Page side gutter | 16 | 32 |
| Gap between sections | 32 | 40 |
| Gap inside a panel | 16 | 20 |
| Form field vertical gap | 20 | 20 |
| Minimum touch target | 44 × 44 | 32 px height allowed for dense desktop tables (with a 44 px hit area on touch devices) |

### 4.2 Breakpoints

| Name | Min width | Notes |
|---|---|---|
| (base) | 320 | Small phones. Must work with no horizontal scroll |
| `sm` | 400 | Large phones |
| `md` | 768 | Tablets. Icon rail navigation |
| `lg` | 1024 | Small desktop. Full sidebar |
| `xl` | 1280 | Standard desktop. Engagement right rail appears |
| `2xl` | 1536 | Large desktop. Content max-width 1240, centred within the main area |

### 4.3 Radii (by hierarchy, not one value everywhere)

| Element | Radius |
|---|---|
| Status badges, tags | 4 px |
| Controls: buttons, inputs, selects, tabs | 6 px |
| Panels, cards, tables, alerts | 10 px |
| Dialogs, drawers, menus | 14 px (drawer top corners only) |

### 4.4 Borders

- Hairline 1 px `--line` for structure: dividers, panel outlines, table rows.
- 1 px `--line-strong` for interactive boundaries.
- 2 px `--fg` for the "needs your response" emphasis and selected states.

### 4.5 Elevation

Flat by default. **Only overlays** (dialog, drawer, menu, toast) are raised:

- **Light:** a single shadow `0 8px 24px rgb(0 0 0 / 0.12)` plus a `--line` border.
- **Dark:** shadows are invisible, so raised layers use `--surface-raised` plus a `--line` border. The contrast between layers comes from the surface step, not from a shadow.

No shadows on cards, buttons or inputs.

### 4.6 Motion

- 120 ms ease-out for state changes (hover, press, expand). 200 ms for dialog and drawer entry.
- No entrance animations on page load, and no decorative motion.
- Everything respects `prefers-reduced-motion` (transitions become instant).

---

## 5. Iconography

- **Lucide** icon set (outline, 1.5 px stroke), sized 16 / 20 / 24, inheriting `currentColor`.
- Icons accompany text. They never replace a label on a primary action.
- Icon-only buttons (e.g. close) always have an accessible name.

---

## 6. Status grammar (no colour required)

Every commercial state is a **badge = icon + label + style**. Style encodes *who needs to act*. The icon encodes *what kind of state* it is. The label is always present. The PRD's states map as follows, and the `StatusBadge` component accepts only these keys.

| Style | Meaning | Visual |
|---|---|---|
| **Settled** | Final, no action needed | Solid `--fg` background, `--bg` text |
| **Waiting** | Waiting on the other party or on the system | 1 px `--line-strong` outline |
| **Needs you** | The current viewer must act | 2 px `--fg` outline, weight 600, "Your response" prefix in lists |
| **Contested** | Rejected, disputed or overdue | 1 px `--fg` outline plus an icon that signals the problem (✕, flag, alert) |
| **Neutral** | Informational (draft, withdrawn) | `--surface-sunken` fill, no border |

| State (PRD) | Key | Icon | Style |
|---|---|---|---|
| Draft | `draft` | file-pen | Neutral |
| Proposed | `proposed` | clock | Waiting (Needs you for the responder) |
| Confirmed | `confirmed` | check | Settled |
| Rejected | `rejected` | x | Contested |
| Countered | `countered` | arrow-left-right | Waiting |
| Withdrawn | `withdrawn` | undo | Neutral |
| Stale | `stale` | refresh-ccw | Contested |
| Authorised | `authorised` | key-round | Settled |
| Authorisation declined | `declined` | key-round + x | Contested |
| Valuation pending | `valuation_pending` | scale | Waiting |
| Valuation agreed | `valuation_agreed` | scale + check | Settled |
| Submitted for acceptance | `submitted` | send | Waiting (Needs you for the payer) |
| Accepted | `accepted` | check-check | Settled |
| Partially accepted | `partially_accepted` | circle-half | Waiting |
| Correction requested | `correction_requested` | rotate-ccw | Waiting (Needs you for the payee) |
| Disputed | `disputed` | flag | Contested |
| Scheduled (payment) | `scheduled` | calendar | Neutral |
| Due | `due` | circle-dot | Waiting (Needs you for the payer) |
| Payment pending | `payment_pending` | loader | Waiting |
| Reported, awaiting confirmation | `reported` | inbox | Waiting (Needs you for the payee) |
| Paid | `paid` | badge-check | Settled |
| Not received | `not_received` | circle-alert | Contested |
| Refunded | `refunded` | undo-2 | Neutral |
| Overdue | `overdue` | alarm-clock | Contested |
| Response overdue | `response_overdue` | timer-off | Contested |
| Active (engagement) | `active` | circle-play | Settled |
| Stopped | `stopped` | octagon-pause | Contested |
| Closed | `closed` | lock | Settled |
| Closed with open items | `closed_open_items` | lock-open | Contested |

**The separation rule (DES-06).** Agreement, authorisation, valuation, delivery, acceptance and payment are **never merged into one badge**. A change shows up to three badges side by side, each with a dimension label: *Agreement: Proposed · Authorisation: Authorised · Valuation: Pending*.

---

## 7. Components

All components live in `app/src/components/ui/`. They use tokens only, support both themes, keyboard operation and visible focus, and have the states listed. **One-off styling in screens is not allowed.** If a screen needs something new, it is added here first.

| Component | Variants / parts | States | Notes |
|---|---|---|---|
| **Button** | `primary` (solid action), `secondary` (outline), `ghost` (text), `destructive` (outline, 2 px, with an icon; always behind a confirmation) | default, hover, active, focus, disabled, loading (spinner + label kept), offline-disabled | Labels are verbs ("Confirm change", not "Submit"). Full-width on mobile forms |
| **Input / Textarea** | text, email, password, number, money (₦ prefix, tabular, right-aligned on desktop) | default, focus, invalid (2 px border + icon + message), disabled, read-only | Label above, hint below the label, error below the field, linked with `aria-describedby` |
| **Select** | native `<select>` styled | as Input | Native for mobile usability |
| **Checkbox / acknowledgement** | single, with long-text label | default, focus, invalid | Used for baseline confirmation acknowledgements |
| **Field** | label + hint + control + error | — | The only way to lay out form controls |
| **Form** | binds to a server action | idle, submitting, success, error, offline | Keeps non-secret values after an error. Blocks submission while offline |
| **Dialog** | native `<dialog>`, title, body, actions | open, closing | Focus trapped, Esc closes, initial focus on the least destructive action |
| **ConfirmDialog** | Dialog + consequence summary + typed confirmation for irreversible commercial acts (optional) | — | States exactly what will be recorded and that it cannot be edited later |
| **Drawer** | bottom sheet (mobile), side panel (desktop ≥ lg) | open, closing | For composing changes, recording payments, reviewing deliveries |
| **Card / Panel** | header, body, footer. `Panel` = bordered section; `Card` = clickable summary | default, hover (cards only), focus | Not every block is a card; prefer panels and lists |
| **Table** | header, rows, numeric columns right-aligned | empty, loading | At `< md` turns into a **stacked list** (label: value rows). No horizontal scroll |
| **DescriptionList** | label/value pairs | — | Used for commitment details and payment details |
| **StatusBadge** | key from §6, optional dimension label | — | Icon + text always |
| **MoneyFigure** | sizes `xl`, `md`, `sm` | — | Formats `bigint` minor units, tabular, aria-label with the full spoken amount |
| **LedgerStrip** | Agreed · Paid · Outstanding (+ secondary: Due, Disputed, Pending valuation) | loading | The signature element. Two columns on mobile, one row on desktop |
| **PaymentSummary** | obligation, amount due, paid, outstanding, method, provider/off-platform label, status | — | Used before any payment or confirmation of receipt |
| **Tabs** | link-based (each tab is a route) | selected (2 px underline + weight 600), focus | Desktop engagement workspace. On mobile the section list replaces tabs |
| **Navigation** | Sidebar (lg+), IconRail (md), BottomNav (< md), TopBar (< lg) | current page (`aria-current`) | See the UI/UX spec §2 |
| **Alert** | `info`, `success`, `warning`, `error` (icon + title + text; monochrome) | — | `role="alert"` for errors, `status` otherwise |
| **Toast** | single region, polite | auto-dismiss 6 s, pauses on hover/focus | Confirms completed actions using the same verb as the button |
| **EmptyState** | icon, title, one sentence, primary action | — | Says what to do next |
| **Skeleton / LoadingState** | line, block, ledger | — | Matches final layout. `aria-busy` |
| **ErrorState** | title, what happened, how to fix it, retry | — | Never says "Oops", never vague |
| **OfflineBanner** | persistent top banner | offline, reconnected (auto-hides after 3 s) | See PWA rules |
| **UpdateBanner** | "A new version of Retenum is ready" + "Reload" | — | Shown when a new service worker is waiting |
| **ThemeSelect** | Light / Dark / System radio group | — | In Settings → Appearance |
| **Timeline** | grouped by day, event icon, actor + side, time | — | Activity tab |

---

## 8. Interaction states (all interactive components)

| State | Treatment |
|---|---|
| Hover | Primary: `--action-hover`. Secondary and ghost: `--surface` background |
| Active / pressed | Slight background darkening, no scale effects |
| Focus | 2 px `--focus` outline, 2 px offset, always visible on keyboard focus (`:focus-visible`) |
| Disabled | 40% opacity plus `cursor: not-allowed`. The reason is shown nearby (e.g. "Available when you're back online") |
| Loading | Label kept, spinner icon added, `aria-busy`, control disabled |
| Selected | 2 px `--fg` border or underline plus weight 600 |
| Invalid | 2 px `--fg` border, alert icon, message text. Never colour alone |

---

## 9. Accessibility rules (non-negotiable)

1. WCAG 2.2 AA in **both** themes, verified by automated axe checks and manual review (DES-09).
2. Every status has text. Colour (in this case, shade) is never the only signal.
3. Keyboard: everything operable, logical order, visible focus, skip link, Esc closes overlays, focus returns to the trigger.
4. Touch targets ≥ 44 × 44 px on touch devices.
5. Forms: visible labels (no placeholder-only labels), errors announced, errors summarised at the top with links to fields for forms with more than 3 fields.
6. Money is announced in full: `aria-label="1,250,000 naira and 0 kobo"` on figures.
7. Reduced motion respected. No content that flashes.
8. Zoom to 200% without loss of content. Reflow at 320 px.
9. Language set (`lang="en"`), page titles unique per screen.

---

## 10. Writing rules

- Plain, specific verbs: "Confirm change", "Authorise work", "Record payment", "Confirm receipt".
- An action keeps its name through the flow: button "Confirm change" leads to toast "Change confirmed" and timeline entry "Confirmed the change".
- Neutral voice. The product never says who is right.
- Errors state what happened and what to do next. No apologies, no blame.
- Commercial consequences are stated before irreversible actions: "This will be added to the engagement record and cannot be edited later."

---

## 11. Quality gate (applies to every UI slice; DES-10)

A UI slice is not complete until each screen passes:

- [ ] Uses tokens and shared components only (no raw hex, no one-off component styling).
- [ ] Light and dark themes reviewed; automated axe run passes in both.
- [ ] No horizontal overflow at 320, 390, 768, 1024, 1280 and 1536 px.
- [ ] Mobile pattern is deliberate (bottom nav, stacked tables, reachable primary action), not a shrunk desktop layout.
- [ ] Loading, empty, error and offline states implemented.
- [ ] Statuses use the status grammar; agreement, authorisation, valuation, delivery, acceptance and payment are visually distinct.
- [ ] Money uses `MoneyFigure` (tabular, full precision).
- [ ] Journey tested end to end in the browser at mobile and desktop sizes.
