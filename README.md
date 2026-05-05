# Sathi AI Web

Sathi AI helps entrepreneurs in Nepal quickly discover relevant government schemes, concessional loans, and startup support paths.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Private-lightgrey)](#)

It combines:
- profile-based filtering from a verified local schemes dataset
- AI-assisted matching and bilingual guidance (English + Nepali)
- practical action roadmap (documents, where to apply, next steps)

## Visual Preview

Add product visuals to make this page immediately scannable:

```text
web/public/readme/landing.png
web/public/readme/assessment.gif
web/public/readme/results.png
```

Then replace these placeholders:

![Sathi AI Landing](./public/readme/landing.png)
![Sathi AI Assessment Flow](./public/readme/assessment.gif)
![Sathi AI Results](./public/readme/results.png)

## Why this exists

Navigating scheme eligibility in Nepal is fragmented and time-consuming. Sathi AI makes the first pass easier by turning user profile + business context into an actionable shortlist.

Important: guidance is indicative. Final eligibility is always decided by the issuing office/bank/regulator.

## Core Features

- Fast multi-step assessment form (`/assess`)
- AI match generation with robust parse/repair handling
- Deterministic fallback result when model output is malformed
- Results view with roadmap and share support (`/results`)
- Turnstile verification and rate limiting support
- Light/dark UI with bilingual-friendly typography

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Radix UI primitives
- Anthropic SDK (Claude models)
- Supabase (optional server-side logging/storage)
- Upstash Redis (rate limiting)
- Cloudflare Turnstile (bot protection)

## Project Structure

```text
app/
  (site)/
    page.tsx              # Landing
    assess/page.tsx       # Assessment flow
    results/page.tsx      # Results view
    privacy/page.tsx
    terms/page.tsx
  api/
    assess/route.ts       # Main assessment pipeline
    waitlist/route.ts     # Waitlist stub (expandable)
components/
  layout/                 # Navbar/Footer/Theme/Lang toggles
  ui/                     # Button/Card/Badge/Progress/etc.
lib/
  assess-ai.ts            # Prompt, parsing, schema
  assess-prefilter.ts     # Rule-based prefiltering
  schemes.json            # App-local scheme dataset copy
```

## Local Development

### 1) Install

```bash
npm install
```

### 2) Configure environment

Copy and edit:

```bash
cp .env.example .env.local
```

Minimum required for real AI responses:
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` (recommended: `claude-sonnet-4-6`)

Recommended for production hardening:
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3) Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Run production server
- `npm run lint` - ESLint checks

## Deployment (Vercel)

1. Import `web/` as a Vercel project
2. Add environment variables from `.env.example`
3. Set `NEXT_PUBLIC_APP_URL` to your deployed domain
4. Deploy
5. Smoke test:
   - landing page
   - `/assess` end-to-end
   - `/results` rendering
   - rate limit + Turnstile behavior

## Data Notes

- Canonical scheme data lives at repository root (`../schemes.json`)
- App uses `lib/schemes.json` during runtime
- When updating scheme data, sync root dataset into `web/lib/schemes.json`

## Current Status

Implemented:
- assessment pipeline with resilient parsing + fallback
- polished UX loading/error/retry states
- Apple Vision-inspired glass loading treatment

In progress / next:
- persist full assessments in Supabase + `/results/[id]`
- waitlist flow with throttling
- result cards with source links from scheme records
- basic analytics events

## Disclaimer

Sathi AI is an informational tool, not legal/financial advice. Scheme rules can change. Always verify the latest terms directly with official issuing bodies.
