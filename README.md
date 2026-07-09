# Charger Billing — AI Billing Workspace

Enterprise billing workspace with ChargerFleet / Pearl design system. React 19 + TypeScript + Vite.

## Live

- **Production:** https://charger-billing.vercel.app
- **GitHub:** https://github.com/dhilllon001/charger-billing

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + ChargerFleet design tokens (`src/styles/`)
- Framer Motion (page transitions, drawers, toasts)
- TanStack Table v8 + SrDataTable reporting grid
- Lucide React icons
- Zustand (UI state)
- React Router

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Modules

| Route | Module |
|-------|--------|
| `/` | Overview (dashboard, KPIs, AI insights) |
| `/batch-invoicing` | Batch invoicing pipeline + enterprise table |
| `/orders/:orderId` | Full-page order detail |
| `/consolidated` | Consolidated invoicing (master-detail) |
| `/invoiced` | Invoiced orders |
| `/email-delivery` | Email delivery rules |
| `/rates-fuel` | Fuel indices & expired rates |
| `/customers` | Customer management |
| `/permissions` | User groups & permissions |

## Design system

- `src/styles/report-tokens.css` — `--sr-*` ChargerFleet / Pearl tokens
- `src/styles/sr-table.css` — enterprise reporting table + filters
- `src/styles/app-shell.css` — dark sidebar, topbar, report layout
- `src/components/report/` — SrDataTable, filters, row hover popover

## AI Features

- **⌘K** — Open AI Copilot drawer
- Topbar Ask-AI bar
- AI Check column, auto-validate, insight strips
- Mock answers in `src/lib/ai.ts` (replace with real LLM endpoint)

## Data

Mock data lives in `src/data/` with TypeScript models in `src/data/models.ts`. Swap for API calls when ready.
