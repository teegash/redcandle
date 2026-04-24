import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BellRing, Bot, ChartCandlestick, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { SignalCard } from "@/components/signals/signal-card";
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

  return (
    <div className="space-y-14 py-8 sm:space-y-20 sm:py-10">
      <Reveal>
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-24 top-0 h-56 w-56 rounded-full bg-red-500/12 blur-3xl" />
            <span className="eyebrow">Performance Signal Intelligence</span>
            <h1 className="display-title mt-6 max-w-4xl text-white">
              Precision-bred signal UX with a black-red grand touring edge.
            </h1>
            <p className="subtle-copy mt-6 max-w-2xl text-lg leading-8">
              RedCandle now leans into a motorsport luxury mood: graphite surfaces, metallic type,
              strategic red illumination, and a premium delivery stack across web, admin, and
              Telegram.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signals" className="premium-button premium-button-primary">
                Explore the signal desk
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/pricing" className="premium-button premium-button-secondary">
                View pricing
              </Link>
            </div>
            <div className="stat-grid mt-10">
              <HeroStat label="Environment" value={status.environment.toUpperCase()} />
              <HeroStat label="Win rate" value={percent(analytics.winRate)} />
              <HeroStat label="Net pips" value={`${signed(analytics.netPips)} pips`} />
              <HeroStat label="Profit factor" value={analytics.profitFactor.toFixed(2)} />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="brand-frame min-h-[19rem] p-6">
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <p className="brand-kicker">Brand signature</p>
                  <h2 className="mt-4 max-w-xs text-3xl font-semibold tracking-[-0.05em] text-white">
                    Porsche-like restraint with candle-red energy.
                  </h2>
                </div>
                <div className="relative mt-6 flex items-end justify-between gap-4">
                  <div className="max-w-[12rem] text-sm leading-7 text-stone-300/78">
                    The supplied mark now drives the palette: lacquered reds, dark enamel blacks,
                    and metallic neutrals.
                  </div>
                  <div className="relative h-48 w-48 self-end sm:h-56 sm:w-56">
                    <Image
                      src="https://images.pexels.com/photos/37237271/pexels-photo-37237271.png"
                      alt="RedCandle brand mark"
                      fill
                      className="object-contain drop-shadow-[0_20px_40px_rgba(255,49,49,0.22)]"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
            {[
              {
                icon: Bot,
                title: "Telegram-first distribution",
                copy: "Publish once in the app and distribute cleanly to your channel with audit-friendly routing.",
              },
              {
                icon: ChartCandlestick,
                title: "Pip analytics with integrity",
                copy: "Single-TP trade logic, expectancy, drawdown, Sharpe, and symbol-level breakdowns.",
              },
              {
                icon: ShieldCheck,
                title: "Operational health and billing",
                copy: "Track platform health, Paystack readiness, subscription status, and delivery confidence.",
              },
              {
                icon: BellRing,
                title: "Premium member experience",
                copy: "Dense but calm information design tuned for mobile-first scanning and low-noise action.",
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

      <Reveal delay={0.1}>
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Signal Preview"
            title="Today's desk is built for trust, not noise."
            description="Each signal is compact, scan-ready, and designed to carry the same clean shape across dashboard, detail view, and Telegram."
          />
          <div className="signal-grid">
            {signals.slice(0, 3).map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <section className="glass-panel rounded-[2rem] p-8 sm:p-10">
          <SectionHeading
            eyebrow="Why It Feels Different"
            title="A dark pro interface with a disciplined product spine."
            description="The front-end is intentionally premium, but it stays honest to the operational core: fast scanning, low-friction admin publishing, and measurable signal quality."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <WhyCard
              title="Compact hierarchy"
              copy="Tight card systems, strong typography, and very little dead space."
            />
            <WhyCard
              title="Useful motion"
              copy="GSAP-driven reveals and transitions that support continuity instead of distracting from execution."
            />
            <WhyCard
              title="Backend-ready"
              copy="Supabase auth/data, Paystack billing, Telegram fanout, and health monitoring are already modeled into the shell."
            />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.2}>
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Pricing"
            title="Monetization is built into the platform, not bolted on."
            description="The pricing stack routes through a billing endpoint that can operate in demo mode now and switch to live Paystack credentials when you are ready."
          />
          <PricingCards plans={plans} />
        </section>
      </Reveal>
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
