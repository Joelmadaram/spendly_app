# Spendly 💸 — Family Expense Tracker PWA

A mobile-first Progressive Web App for tracking family expenses, budgets, savings, and investments. Installable on iPhone via Safari.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React + TypeScript | Type-safe, component-driven |
| Build | Vite | Blazing fast dev server + PWA plugin |
| Styling | Tailwind CSS v4 | Mobile-first utility classes |
| State | Zustand | Minimal, no boilerplate |
| Database | Dexie.js (IndexedDB) | Offline-capable local storage |
| Charts | Recharts | Responsive budget visualizations |
| PWA | vite-plugin-pwa + Workbox | Service worker, offline, installable |

## Features

- **Add entries** — Expenses, Savings, Investments with category, amount, date, note, and family member
- **Budget limits** — Set monthly limits per expense category with color-coded progress bars
- **Dashboard** — Spending pie chart, budget status, summary cards, recent entries
- **History** — Filterable, grouped by date, with swipe-to-delete
- **Settings** — Add family members with emoji avatars, custom categories
- **Offline** — Full offline support via Workbox service worker
- **Installable** — Add to iPhone home screen via Safari → Share → Add to Home Screen

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview  # Preview production PWA locally
```

## iOS Installation

1. Open in Safari on iPhone
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add** — launches like a native app!
