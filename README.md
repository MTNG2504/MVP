# CryptoTracker

An AI-powered cryptocurrency trading dashboard for real-time market analysis, portfolio management, and trading insights. Built as a modern single-page application with authenticated user sessions, live market data, and persistent portfolio storage.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Routes](#routes)
- [External APIs](#external-apis)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Key Components](#key-components)
- [Development Notes](#development-notes)

---

## Overview

CryptoTracker (also branded **Coin Rich** in marketing metadata) is a front-end dashboard that gives traders a unified view of crypto markets. Users can sign in, track holdings, explore market data, screen venture-capital wallets, and interact with an AI trading assistant.

The app is built with **React 18** and **TypeScript**, served through **Next.js** (with a legacy Vite configuration also present). UI is composed with **shadcn/ui** components styled via **Tailwind CSS**.

---

## Features

### Dashboard (`/dashboard`)
- Live market statistics and top coin listings
- **Fear & Greed Index** widget (Alternative.me API with fallback data)
- **Sentiment Analysis** panel with confidence scoring
- **Market Pulse** indicators (volume, volatility, liquidity, network activity)
- Embedded **TradingView** chart (BTC/USDT by default)
- Portfolio summary card with quick-glance holdings

### Market (`/market`)
- Global crypto market cap, volume, and dominance metrics via CoinGecko
- Top 100 coins by market cap with sparkline charts
- Trending coins section
- Auto-refreshes every 30–60 seconds

### Portfolio (`/portfolio`)
- Add, view, and delete crypto holdings
- Coin search with CoinGecko integration and custom coin support
- Real-time price lookups with 5-minute client-side caching
- Aggregated holdings with profit/loss calculations
- Portfolio analytics charts (allocation, performance)
- Data persisted to Supabase per authenticated user

### Screener (`/screener`)
- Browse mock venture-capital firm holdings (Multicoin, a16z, Paradigm, etc.)
- On-chain wallet view for Alameda Research wallet on Ethereum mainnet
- Sidebar navigation between VC profiles and holdings tables

### AI Chat (`/chat`)
- Conversational trading assistant interface
- Simulated AI responses for market and portfolio questions
- Message history with user/AI distinction

### NFT (`/nft`)
- Coming-soon showcase page with preview gallery

### Landing (`/`)
- Public marketing page with feature highlights
- Call-to-action to sign up or sign in

### Auth (`/auth`)
- Clerk-powered sign-in and sign-up flows
- Custom dark-themed appearance matching the app design

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (primary), [Vite](https://vitejs.dev/) (legacy config) |
| Language | TypeScript |
| UI Library | React 18 |
| Component System | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) |
| Styling | Tailwind CSS, tailwindcss-animate |
| Routing | React Router DOM v6 |
| Authentication | [Clerk](https://clerk.com/) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Data Fetching | TanStack React Query v5 |
| Charts | Recharts, TradingView widget |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Notifications | Sonner, Radix Toast |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (SPA)                       │
│  React Router → Pages → Components → Services           │
└────────────┬───────────────────────────┬────────────────┘
             │                           │
     ┌───────▼───────┐           ┌───────▼────────┐
     │  Clerk Auth   │           │  External APIs │
     │  (Sign in/up) │           │  CoinGecko     │
     └───────┬───────┘           │  Alternative.me│
             │ JWT               │  TradingView   │
     ┌───────▼───────┐           └────────────────┘
     │   Supabase    │
     │  (profiles,   │
     │   holdings)   │
     └───────────────┘
```

Next.js serves the app via a catch-all page (`pages/[[...slug]].tsx`) that dynamically loads the React SPA with SSR disabled. Clerk handles authentication; a Supabase JWT template bridges Clerk sessions to row-level-secured database access.

---

## Project Structure

```
store-v1/
├── pages/                    # Next.js entry points
│   ├── _app.tsx              # ClerkProvider wrapper
│   └── [[...slug]].tsx       # Catch-all → loads src/App.tsx
├── src/
│   ├── App.tsx               # Root app, routing, providers
│   ├── main.tsx              # Vite entry (legacy)
│   ├── index.css             # Global styles & CSS variables
│   ├── pages/                # Route-level page components
│   │   ├── Landing.tsx
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Market.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Screener.tsx
│   │   ├── Chat.tsx
│   │   ├── NFT.tsx
│   │   └── NotFound.tsx
│   ├── components/           # Reusable UI and feature components
│   │   ├── ui/               # shadcn/ui primitives
│   │   ├── screener/         # VC screener components
│   │   ├── Header.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── CryptoChart.tsx
│   │   ├── TradingViewChart.tsx
│   │   ├── FearGreedIndex.tsx
│   │   ├── SentimentAnalysis.tsx
│   │   ├── MarketPulse.tsx
│   │   ├── PortfolioCard.tsx
│   │   ├── PortfolioAnalytics.tsx
│   │   └── AddAssetForm.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx   # Clerk ↔ Supabase user sync
│   ├── services/
│   │   ├── marketDataService.ts
│   │   ├── portfolioService.ts
│   │   └── portfolioApiService.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts     # Supabase client setup
│   │       └── types.ts      # Generated DB types
│   ├── hooks/                # Custom React hooks
│   └── lib/
│       └── utils.ts          # cn() and shared utilities
├── public/                   # Static assets
├── next.config.js
├── vite.config.ts            # Legacy Vite dev server (port 8080)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

Path alias `@/` resolves to `./src/` in both Next.js and Vite configurations.

---

## Prerequisites

- **Node.js** 18 or later ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **npm** (comes with Node.js)
- A [Clerk](https://clerk.com/) account with a publishable key
- A [Supabase](https://supabase.com/) project with Clerk JWT integration configured

---

## Getting Started

### 1. Clone the repository

```sh
git clone <GIT_URL>
cd store-v1
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

### 4. Start the development server

```sh
npm run dev
```

This starts Coin Rich at [http://localhost:3000](http://localhost:3000) and the admin API at [http://localhost:3001](http://localhost:3001). `npm install` also installs the admin workspace.

### 5. Build for production

```sh
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key for client-side authentication |
| `VITE_CLERK_PUBLISHABLE_KEY` | No | Legacy alias; used as fallback in `next.config.js` |

Example `.env`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

Supabase URL and anon key are configured in `src/integrations/supabase/client.ts`. For production deployments, consider moving these to environment variables.

### Clerk + Supabase setup

1. In the Clerk dashboard, create a **JWT template** named `supabase`.
2. Configure the template with your Supabase JWT secret.
3. Enable the template for your application.
4. In Supabase, set up Row Level Security (RLS) policies on `profiles` and `portfolio_holdings` tables so users can only access their own data.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Coin Rich on port 3000 and the admin API on port 3001 |
| `npm run dev:main` | Start only the Next.js app |
| `npm run dev:admin` | Start only the admin API |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint across the project |

### Alternative: Vite dev server

A legacy Vite configuration is available for direct SPA development on port **8080**:

```sh
npx vite
```

This bypasses the Next.js wrapper and loads `src/main.tsx` directly via `index.html`.

---

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Landing / marketing page |
| `/auth` | Public | Sign in / sign up |
| `/dashboard` | Protected | Main trading dashboard |
| `/market` | Protected | Global market overview |
| `/portfolio` | Protected | Portfolio management |
| `/screener` | Protected | VC holdings screener |
| `/chat` | Protected | AI trading assistant |
| `/nft` | Protected | NFT gallery (coming soon) |
| `*` | Public | 404 Not Found page |

Protected routes redirect unauthenticated users to `/auth`.

---

## External APIs

| Service | Endpoint | Used By |
|---------|----------|---------|
| **CoinGecko** | `api.coingecko.com/api/v3/*` | Market page, portfolio pricing, coin search |
| **Alternative.me** | `api.alternative.me/fng/` | Fear & Greed Index widget |
| **TradingView** | `s3.tradingview.com/tv.js` | Embedded price charts |

CoinGecko free tier has rate limits. The portfolio service caches prices for 5 minutes to reduce API calls.

---

## Database Schema

Supabase stores user data in two tables:

### `profiles`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `string` | Clerk user ID (primary key) |
| `email` | `string` | User email |
| `full_name` | `string` | Display name |
| `avatar_url` | `string` | Profile image URL |
| `created_at` | `timestamp` | Record creation time |
| `updated_at` | `timestamp` | Last update time |

### `portfolio_holdings`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Holding ID (primary key) |
| `user_id` | `string` | Owner (Clerk user ID) |
| `symbol` | `string` | Coin ticker (e.g. `BTC`) |
| `name` | `string` | Coin display name |
| `coin_id` | `string` | CoinGecko coin ID |
| `amount` | `number` | Quantity held |
| `avg_price` | `number` | Average purchase price (USD) |
| `purchase_date` | `date` | Date of purchase |
| `notes` | `string` | Optional notes |
| `created_at` | `timestamp` | Record creation time |
| `updated_at` | `timestamp` | Last update time |

TypeScript types for these tables are auto-generated in `src/integrations/supabase/types.ts`.

---

## Authentication Flow

1. User signs in via Clerk on `/auth`.
2. `AuthContext` requests a Supabase JWT from Clerk using the `supabase` template.
3. On first login, a `profiles` row is created (or updated) in Supabase.
4. Portfolio operations use `createAuthedSupabaseClient(token)` for authenticated requests.
5. JWT tokens are refreshed automatically every 45 minutes and on expiry.
6. `ProtectedRoute` guards authenticated pages and redirects to `/auth` when no session exists.

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `Header` | Top navigation bar with route links and user menu |
| `ProtectedRoute` | Auth guard wrapper for private pages |
| `FearGreedIndex` | Crypto Fear & Greed Index display |
| `SentimentAnalysis` | Multi-factor sentiment scoring widget |
| `MarketPulse` | Real-time market health indicators |
| `TradingViewChart` | Embedded TradingView price chart |
| `CryptoChart` | Recharts-based price visualization |
| `PortfolioCard` | Dashboard portfolio summary |
| `PortfolioAnalytics` | Allocation and performance charts |
| `AddAssetForm` | Form to add new portfolio holdings |
| `VCListSidebar` | VC firm selector for screener |
| `VCHoldingsTable` | Holdings table for selected VC/wallet |

---

## Development Notes

- **Dual bundler setup**: The project runs on Next.js in production (`npm run dev`), but retains a Vite config and `index.html` from its original scaffolding. The Next.js catch-all page loads the SPA with `ssr: false`.
- **Strict mode**: React Strict Mode is enabled in `next.config.js`.
- **Path aliases**: Import with `@/components/...` instead of relative paths.
- **shadcn/ui**: UI primitives live in `src/components/ui/`. Add new components with the shadcn CLI if extending the design system.
- **React Query**: Server state is managed with TanStack Query. Market data refetches on intervals; portfolio data invalidates on mutations.
- **Theming**: Dark theme is the default. CSS variables are defined in `src/index.css` and extended in `tailwind.config.ts`.

---

## License

Private project. All rights reserved.
