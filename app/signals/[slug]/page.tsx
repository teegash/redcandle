import { notFound } from "next/navigation";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { StatusPill } from "@/components/ui/status-pill";
import { getSignalBySlug } from "@/lib/data";
import { formatTimestamp, signed } from "@/lib/utils";

interface SignalDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SignalDetailPage({ params }: SignalDetailPageProps) {
  const { slug } = await params;
  const signal = await getSignalBySlug(slug);

  if (!signal) {
    notFound();
  }

  const isLong = signal.direction === "long";

  return (
    <Reveal>
      <div className="space-y-6 py-8">
        <section className="glass-panel rounded-[2rem] p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill
                  tone={
                    signal.result === "tp_hit"
                      ? "positive"
                      : signal.result === "sl_hit"
                        ? "negative"
                        : signal.status === "pending"
                          ? "warning"
                          : "neutral"
                  }
                >
                  {signal.status} • {signal.result}
                </StatusPill>
                <span className="pill">{signal.asset_class}</span>
                <span className="pill">{signal.entry_type}</span>
              </div>
              <h1 className="mt-5 text-5xl font-semibold tracking-[-0.06em] text-white">
                {signal.symbol}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-8 text-slate-400">
                {signal.notes}
              </p>
            </div>
            <div
              className={`flex size-16 items-center justify-center rounded-[1.75rem] ${
                isLong ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"
              }`}
            >
              {isLong ? <ArrowUpRight className="size-8" /> : <ArrowDownRight className="size-8" />}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-white">Trade structure</h2>
            <div className="stat-grid mt-6">
              <Detail label="Entry" value={signal.entry_price.toString()} />
              <Detail label="Take Profit" value={signal.take_profit.toString()} />
              <Detail label="Stop Loss" value={signal.stop_loss.toString()} />
              <Detail label="Timeframe" value={signal.timeframe} />
              <Detail label="R:R" value={signal.risk_reward_ratio.toFixed(2)} />
              <Detail
                label="Realized"
                value={
                  signal.realized_pips !== null ? `${signed(signal.realized_pips)} pips` : "Pending"
                }
              />
            </div>
          </div>
          <div className="glass-panel rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-white">Lifecycle</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Published</span>
                <span>{formatTimestamp(signal.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Opened</span>
                <span>{signal.opened_at ? formatTimestamp(signal.opened_at) : "Pending trigger"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Closed</span>
                <span>{signal.closed_at ? formatTimestamp(signal.closed_at) : "Still active"}</span>
              </div>
              <div className="rounded-[1.5rem] border border-slate-300/10 bg-slate-950/40 p-4 text-slate-400">
                Signals are published in-app first, then mirrored to Telegram. This detail page
                remains the canonical source of truth.
              </div>
            </div>
          </div>
        </section>
      </div>
    </Reveal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-300/10 bg-slate-950/35 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-3 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
