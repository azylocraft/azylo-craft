# AZYLO

AZYLO is an online store for premium made-to-order furniture: power reclining sofas, convertible sofa beds, and modular, small-space and compressed sofas, plus smart tables. Delivery is free and duties are included.

Shoppers can:
- browse collections and configure a product by model and colour;
- save favourites and pay with Razorpay (test mode);
- track their orders;
- read the Sofa Journal and the Sofa Materials Guide.

The store owner runs products, media (photos, live photos, videos), content, orders and messages from a built-in admin panel.

The site is web only and built responsive for phone browsers.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript + React 19 |
| Styling | Tailwind CSS v4 driven by typed design tokens (`src/theme/tokens.ts`) |
| Fonts | Manrope, Instrument Serif, JetBrains Mono via `next/font` |
| Backend | Supabase: Postgres + RLS, Auth, Storage (`product-media`), Edge Functions |
| Payments | Razorpay Standard Checkout, test mode, charged in CAD, totals computed on the server |
| Email | Resend (optional; skipped when no key is set) |
| State | Zustand (guest cart, wishlist, language/currency on the device) |
| Tests | Playwright (desktop 1440 and mobile 390 viewports) |

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values (see SETUP.md)
npm run dev               # http://localhost:3000, also reachable on your LAN
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload, listening on all interfaces |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run test:e2e` | Playwright end-to-end tests (dev server must be running) |
| `node e2e/screens.mjs <dir>` | Screenshots for design comparison |

## Project layout

```
src/app/(shop)/      storefront routes (header, footer, chat pill)
src/components/ui/   design-system primitives (Btn, Chip, Eyebrow, H, Missing…)
src/components/shop/ header, footer, drawers, cards
src/theme/           tokens.ts + fonts.ts (single source of design values)
src/i18n/            en.json / fr.json
src/lib/             prefs, i18n, routes, stores, helpers
supabase/            migrations + edge functions (added in the database phase)
e2e/                 Playwright specs
```

## Content rules

Product data, brand copy, policies and photos come only from `assets/` or the admin panel. Anything missing shows a visible `MISSING: <field>` label. Nothing is invented.

See [SETUP.md](SETUP.md) for the accounts and keys you need, and [PLAN.md](PLAN.md) for the full build plan.
