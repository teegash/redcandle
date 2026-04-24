# RedCandle

Premium signal platform scaffold built with Next.js App Router, Tailwind v4, Supabase-ready data wiring, Telegram delivery hooks, Paystack checkout routing, and pip-based analytics.

## What is implemented

- Premium dark public landing page with compact, glassy Apple-like UI language
- Member-facing signal feed, signal detail, analytics, pricing, and account pages
- Admin-facing overview, signal creation flow, signal queue, and health monitor
- API routes for signal publish/close, analytics summaries, health checks, billing session init, webhook verification, and Telegram retry
- Supabase migration with tables, enums, indexes, and baseline RLS policies
- Supabase Edge Function for production health sampling
- GitHub Actions workflows for Edge Function deployment and scheduled health checks
- Demo-first data layer that works immediately and can switch to live Supabase/Telegram/Paystack credentials later
- GSAP-based reveal motion and a reusable design token layer
- Vitest coverage for core trading math and validation

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add Supabase, Telegram, and Paystack credentials when you are ready.
3. Run:

```bash
pnpm install
pnpm dev
```

## Important paths

- `app/` route tree and route handlers
- `components/` premium UI building blocks
- `lib/` mock data, integrations, trading math, and helpers
- `supabase/migrations/0001_redcandle_init.sql` database bootstrap
- `supabase/functions/health-check/index.ts` production status sampler
- `.github/workflows/deploy-supabase-functions.yml` Edge Function deployment
- `.github/workflows/health-check.yml` scheduled GitHub Actions health invocation
- `tests/trading.test.ts` trading math regression coverage

## Notes

- Without credentials, the app stays fully explorable in demo mode.
- Telegram publishing is server-side and skips safely if credentials are missing.
- Paystack checkout falls back to a demo redirect until live keys are configured.
- Production status checks should be scheduled through GitHub Actions invoking the Supabase Edge Function, not Vercel Cron.
