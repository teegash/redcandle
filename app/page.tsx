import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Bot,
  ChartCandlestick,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import { MarketPulseHeader } from "@/components/market/market-pulse-header";
import { Reveal } from "@/components/motion/reveal";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { SignalCard } from "@/components/signals/signal-card";
import { RiskDisclaimer } from "@/components/ui/risk-disclaimer";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAnalytics, getPricingPlans, getProductStatus, listSignals } from "@/lib/data";
import { percent, signed } from "@/lib/utils";

export default async function Home() {
  const [signals, analytics, plans, status] = await Promise.all([
    listSignals(),
    getAnalytics(),
    getPricingPlans(),
    getProductStatus(),
  ]);

  const activeSignals = signals.filter((signal) => signal.status === "open").length;
  const pendingSignals = signals.filter((signal) => signal.status === "pending").length;

  return (
    <div className="space-y-14 py-8 sm:space-y-20 sm:py-10">
      <Reveal>
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-24 top-0 h-56 w-56 rounded-full bg-red-500/12 blur-3xl" />
            <span className="eyebrow">Market Intelligence Dashboard</span>
            <h1 className="display-title mt-6 max-w-4xl text-white">
              Risk-defined forex signals, session context, and verified delivery from one desk.
            </h1>
            <p className="subtle-copy mt-6 max-w-2xl text-lg leading-8">
              RedCandle is built as a serious signal operations platform: disciplined member
              delivery, transparent pip analytics, clear invalidation, and a premium execution
              surface across web, admin, and Telegram.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signals" className="premium-button premium-button-primary">
                Open signal feed
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/analytics" className="premium-button premium-button-secondary">
                Review performance
              </Link>
            </div>
            <div className="stat-grid mt-10">
              <HeroStat label="Environment" value={status.environment.toUpperCase()} />
              <HeroStat label="Closed-trade win rate" value={percent(analytics.winRate)} />
              <HeroStat label="Net realized pips" value={`${signed(analytics.netPips)} pips`} />
              <HeroStat label="Profit factor" value={analytics.profitFactor.toFixed(2)} />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="glass-panel rounded-[1.75rem] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="brand-kicker">Control Surface</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    Enterprise-grade signal command center
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Create, validate, distribute, and audit analyst-led signals with a clean
                    operational path from desk entry to member delivery.
                  </p>
                </div>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-red-400/12 text-red-200">
                  <RadioTower className="size-5" />
                </span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <OpsMetric label="Active signals" value={`${activeSignals}`} />
                <OpsMetric label="Pending setups" value={`${pendingSignals}`} />
                <OpsMetric label="Distribution path" value="Web + Telegram" />
                <OpsMetric label="Audit posture" value="Tracked" />
              </div>
            </div>
            {[
              {
                icon: Bot,
                title: "Telegram channel routing",
                copy: "Publish once in-app, then distribute to the channel with server-side formatting, logging, and retry-aware operations.",
              },
              {
                icon: ChartCandlestick,
                title: "Performance verified from closed signals",
                copy: "Expectancy, drawdown, profit factor, and symbol-level performance stay grounded in closed outcomes instead of vanity metrics.",
              },
              {
                icon: ShieldCheck,
                title: "Operational health visibility",
                copy: "Supabase, billing, Telegram, and app health can be surfaced in one monitoring layer for members and admins.",
              },
              {
                icon: BellRing,
                title: "Premium member experience",
                copy: "Dense but calm layouts help traders scan quickly without losing risk context, invalidation, or timing clarity.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="glass-panel rounded-[1.75rem] p-5">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-red-400/12 text-red-200">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <MarketPulseHeader
          session="London / New York Overlap"
          volatility="Elevated"
          activeSignals={activeSignals}
          pendingSignals={pendingSignals}
          environment={status.environment}
        />
      </Reveal>

      <Reveal delay={0.12}>
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Signal Preview"
            title="Live and pending setups designed for fast, risk-aware scanning."
            description="Every signal surfaces direction, trade structure, pip outcome, invalidation, and data freshness without forcing traders to open a detail page just to understand the setup."
          />
          <div className="signal-grid">
            {signals.slice(0, 3).map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.16}>
        <section className="glass-panel rounded-[2rem] p-8 sm:p-10">
          <SectionHeading
            eyebrow="Product Standard"
            title="Built to feel credible under real trading pressure."
            description="The product language, data hierarchy, and layout choices prioritize trust: risk first, transparent performance, live delivery state, and zero hype-led clutter."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <WhyCard
              title="Structured market language"
              copy="Signals reference session flow, confirmation, invalidation, and disciplined risk instead of vague profit-first copy."
            />
            <WhyCard
              title="Useful motion only"
              copy="GSAP-driven reveals support continuity and polish, but the core signal workflow stays quiet and highly readable."
            />
            <WhyCard
              title="Backend-aware from day one"
              copy="Supabase auth and data, Telegram fanout, billing hooks, and health checks are reflected directly in the product shell."
            />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.2}>
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Membership"
            title="Subscription access aligned to signal quality and operational trust."
            description="The pricing flow is already modeled for Paystack so we can move from demo-grade checkout to live subscriptions without reshaping the product later."
          />
          <PricingCards plans={plans} />
          <RiskDisclaimer />
        </section>
      </Reveal>
    </div>
  );
}

function OpsMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-stone-300/8 bg-black/24 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-stone-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-300/8 bg-black/24 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-stone-500">{label}</div>
      <div className="mt-3 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function WhyCard({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="glass-panel-soft rounded-[1.5rem] p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
    </div>
  );
}
