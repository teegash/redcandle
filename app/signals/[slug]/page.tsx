import { notFound } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Clock3, ShieldAlert } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { DataFreshnessBadge } from "@/components/ui/data-freshness-badge";
import { RiskDisclaimer } from "@/components/ui/risk-disclaimer";
import { StatusPill } from "@/components/ui/status-pill";
import { getSignalBySlug } from "@/lib/data";
import {
  deriveSignalInvalidation,
  deriveSignalRationale,
  formatDirection,
  formatEntryType,
  formatPips,
  formatPrice,
  formatSignalResult,
  formatSignalStatus,
  formatTimestamp,
  getDataFreshness,
} from "@/lib/utils";

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
  const freshness = getDataFreshness(signal.updated_at);
  const invalidation = deriveSignalInvalidation(
    signal.symbol,
    signal.timeframe,
    signal.direction,
    signal.stop_loss,
  );
  const rationale = deriveSignalRationale(signal.notes, signal.timeframe);

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
                  {formatSignalStatus(signal.status)} • {formatSignalResult(signal.result)}
                </StatusPill>
                <StatusPill tone={isLong ? "positive" : "negative"}>
                  {formatDirection(signal.direction)}
                </StatusPill>
                <span className="pill">{signal.asset_class}</span>
                <span className="pill">{formatEntryType(signal.entry_type)}</span>
                <span className="pill">{signal.timeframe}</span>
              </div>
              <h1 className="mt-5 text-5xl font-semibold tracking-[-0.06em] text-white">
                {signal.symbol}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-8 text-slate-400">{rationale}</p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <div
                className={`flex size-16 items-center justify-center rounded-[1.75rem] ${
                  isLong ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"
                }`}
              >
                {isLong ? (
                  <ArrowUpRight className="size-8" />
                ) : (
                  <ArrowDownRight className="size-8" />
                )}
              </div>
              <DataFreshnessBadge
                label={freshness.label}
                detail={freshness.detail}
                tone={freshness.tone}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="glass-panel rounded-[1.75rem] p-6">
              <h2 className="text-xl font-semibold text-white">Trade structure</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Detail label="Entry" value={formatPrice(signal.symbol, signal.entry_price)} />
                <Detail
                  label="Take profit"
                  value={formatPrice(signal.symbol, signal.take_profit)}
                />
                <Detail label="Stop loss" value={formatPrice(signal.symbol, signal.stop_loss)} />
                <Detail label="Risk reward" value={`1:${signal.risk_reward_ratio.toFixed(2)}`} />
                <Detail
                  label="Realized pips"
                  value={signal.realized_pips !== null ? formatPips(signal.realized_pips) : "Pending"}
                />
                <Detail label="Signal type" value={formatEntryType(signal.entry_type)} />
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                <ShieldAlert className="size-4" />
                Invalidation and rationale
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <NarrativeCard
                  title="Invalidation"
                  body={invalidation}
                  detail="If invalidation prints, the setup is no longer valid under the current structure."
                />
                <NarrativeCard
                  title="Rationale"
                  body={rationale}
                  detail="This narrative is the canonical desk explanation used for member review and Telegram distribution."
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-[1.75rem] p-6">
              <h2 className="text-xl font-semibold text-white">Lifecycle</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-300">
                <TimelineRow label="Published" value={formatTimestamp(signal.created_at)} />
                <TimelineRow
                  label="Triggered"
                  value={signal.opened_at ? formatTimestamp(signal.opened_at) : "Pending trigger"}
                />
                <TimelineRow
                  label="Closed"
                  value={signal.closed_at ? formatTimestamp(signal.closed_at) : "Still active"}
                />
                <TimelineRow label="Last update" value={formatTimestamp(signal.updated_at)} />
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-6">
              <h2 className="text-xl font-semibold text-white">Execution notes</h2>
              <div className="mt-5 rounded-[1.5rem] border border-slate-300/10 bg-slate-950/40 p-4 text-sm leading-7 text-slate-400">
                Signals are created in-app first and mirrored to Telegram after validation. This
                page remains the source of truth for trade structure, timing, and realized outcome.
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Clock3 className="size-4" />
                Last synchronized {formatTimestamp(signal.updated_at)}
              </div>
            </div>

            <RiskDisclaimer compact />
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

function NarrativeCard({
  title,
  body,
  detail,
}: {
  title: string;
  body: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-300/10 bg-slate-950/35 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{title}</div>
      <div className="mt-3 text-sm leading-7 text-slate-200">{body}</div>
      <div className="mt-3 text-xs leading-6 text-slate-500">{detail}</div>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
