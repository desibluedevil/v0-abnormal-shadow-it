# v0-abnormal-shadow-it

**AI‑powered Shadow IT detection & remediation** — an interactive prototype built with **Next.js + TypeScript + Tailwind + shadcn/ui** and v0 (by Vercel). It showcases the two core user journeys:

* **SecOps Analyst:** investigate → explain → remediate with human‑approved automation
* **CISO / Leadership:** posture at a glance → trends → exportable audit trail

> **Live demo:** [https://v0-abnormal-shadow-it.vercel.app/dashboard](https://v0-abnormal-shadow-it.vercel.app/dashboard)

---

## ✨ What’s inside

* **Shadow IT Dashboard** — KPIs, trend of new apps/week, risk distribution, TTR (time‑to‑remediate)
* **App Inventory** — searchable/ filterable table (Name, Publisher, Risk, Users, First/Last Seen, Status, Actions)
* **App Detail Drawer** — permissions, top users, **AI explanation** (reasons + citations), suggested actions
* **Review Queue** — prioritized items with quick actions (Approve/Sanction, Dismiss, View, Prepare Plan)
* **Remediation Agent** — plan preview → Approve & Execute steps (Revoke grants, End sessions, Notify, Ticket)
* **Case Audit** — append‑only receipts (IDs, timestamps, tool), CSV export
* **Settings / Alerts** — email/Slack toggles, risk threshold, preview, test alert
* **RBAC Personas** — **SecOps** (full actions) and **CISO** (read‑only)

---

## 🧠 Architecture (high level)

* **App router** (Next.js) with route groups:

  * `/dashboard`, `/inventory`, `/review`, `/audit`, `/settings`
* **State:** lightweight client store (Zustand‑style) for apps, personas, receipts, and KPIs
* **UI system:** Tailwind + shadcn/ui; design tokens via CSS variables; domain tokens for risk/status
* **Charts:** lightweight components themed by CSS tokens
* **Receipts:** simulated tool “calls” appended to store for demo (revoke, end‑sessions, notify, ticket)
* **AI:** explanation panel (RAG‑like) with structured summary and reasons (demo content)

```
.
├─ app/
│  ├─ dashboard/        # Shadow IT Overview
│  ├─ inventory/        # App Inventory + Detail Drawer
│  ├─ review/           # Review Queue
│  ├─ audit/            # Case Audit (receipts)
│  └─ settings/         # Alerts & preferences
├─ components/
│  ├─ ui/               # shadcn/ui primitives (button, dialog, table, etc.)
│  ├─ charts/           # Line/Donut + theme
│  └─ domain/           # RiskBadge, StatusPill, KpiCard
├─ data/seed.json       # Demo data for apps and users
├─ store/shadowStore.ts # App state, actions, receipts
├─ types/shadow-it.ts   # Domain types
└─ styles/abnormal.css  # Design tokens (colors, radius, shadows)
```

---

## 🚀 Getting started

### Prerequisites

* Node 18+ and **pnpm** (or npm/yarn)

### Install & run

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

### Common scripts

```bash
pnpm build     # production build
pnpm start     # run production server
pnpm lint      # lint sources
pnpm format    # format with prettier
```

> **Tip:** The UI theme is driven by `styles/abnormal.css`. Updating tokens (e.g., `--primary`, `--risk-high`) re‑skins the entire app.

---

## 🧭 Primary user flows (for reviewers)

1. **SecOps remediation (happy path)**

   * Dashboard → **Review All** → Inventory (High risk)
   * Row → **Explain** (drawer) → **Prepare Plan** → **Approve & Execute**
   * Open **Audit** → see 4 receipts (revoke, end sessions, notify, ticket)

2. **CISO governance**

   * Switch persona to **CISO** (read‑only banner)
   * Review Dashboard posture & TTR → drill to Inventory → **Explain** (view‑only)
   * **Audit** → filter by action → **Export CSV**

3. **Sanction & Notify**

   * Inventory → select a known‑safe app → **Mark Sanctioned**
   * **Notify Users** → send templated note → confirm toast → Audit shows `notify.email`

---

## 🎨 Design system (tokens & theming)

* **Tokens:** CSS variables for surfaces, text, borders, focus ring, and domain colors:

  * `--risk-high`, `--risk-medium`, `--risk-low`
  * `--status-sanctioned`, `--status-unsanctioned`, `--status-revoked`
* **Components:** shadcn/ui primitives skinned for consistent radius, shadow, density, and focus
* **Charts:** colors sourced from tokens; empty/skeleton states for clarity
* **Accessibility:** visible focus rings, aria‑labels on icon buttons, `Esc` closes dialogs/drawers

---

## 🔒 Notes & limitations (prototype)

* All data and tool “receipts” are **simulated** for demo purposes
* No real OAuth revocations are performed; agent steps update local state only
* AI explanation content is seeded; RAG pipeline is represented in the UI

---

## 🧪 Manual QA checklist

* Drawer opens from **row click** and **Explain**; shows AI explanation + risk factors
* **Prepare Plan** → **Approve & Execute** updates status and appends 4 receipts
* **Notify Users** closes with toast and adds `notify.email` to Audit
* **Review Queue** actions (Approve/Sanction, Dismiss) update counts and remove rows
* **CISO persona** shows read‑only banner; destructive actions disabled/hidden
* **Export CSV** works on Inventory and Audit; toast confirms download

---

## 🗺️ Roadmap (next)

* Connector catalog (M365, Google Workspace, Okta, Slack)
* Policy guardrails (exception windows, approval workflow)
* Deeper explainability (scope diffs, activity snapshots)
* Board‑ready reporting and scheduled exports

---

## 🙌 Contributing

Issues and PRs welcome. Please:

* Use conventional commits (e.g., `feat:`, `fix:`, `docs:`)
* Keep components accessible and token‑driven
* Snapshot new UI states in `/docs` (screens or GIFs)

---

## 📄 License

MIT © You — for demo and interview use.

---

### Appendix

* Built with **v0 (by Vercel)**, **Next.js**, **TypeScript**, **Tailwind**, **shadcn/ui**
* Demo: [https://v0-abnormal-shadow-it.vercel.app/dashboard](https://v0-abnormal-shadow-it.vercel.app/dashboard)
