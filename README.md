# Charger Billing — AI Billing Workspace

A modern Apple-style billing workspace rebuilt from legacy logistics billing. React 18 + TypeScript + Vite.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (design tokens in `src/index.css`)
- Framer Motion (page transitions, drawers, toasts)
- TanStack Table v8 (sorting, filtering, column visibility, layouts)
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
| `/batch-invoicing` | Batch invoicing pipeline |
| `/consolidated` | Consolidated invoicing (master-detail) |
| `/invoiced` | Invoiced orders |
| `/email-delivery` | Email delivery rules |
| `/rates-fuel` | Fuel indices & expired rates |
| `/customers` | Customer management |
| `/permissions` | User groups & permissions |

## AI Features

- **⌘K** — Open AI Copilot drawer
- Topbar Ask-AI bar
- AI Check column, auto-validate, insight strips
- Mock answers in `src/lib/ai.ts` (replace with real LLM endpoint)

## Data

Mock data lives in `src/data/` with TypeScript models in `src/data/models.ts`. Swap for API calls when ready.
