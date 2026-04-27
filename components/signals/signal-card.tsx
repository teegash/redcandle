import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Clock3, ShieldAlert, Timer } from "lucide-react";
import { DataFreshnessBadge } from "@/components/ui/data-freshness-badge";
import { StatusPill } from "@/components/ui/status-pill";
import type { Signal } from "@/lib/types";
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

interface SignalCardProps {
  signal: Signal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const isLong = signal.direction === "long";
  const tone =
    signal.result === "tp_hit"
      ? "positive"
      : signal.result === "sl_hit"
        ? "negative"
        : signal.status === "pending"
          ? "warning"
          : "neutral";

  const freshness = getDataFreshness(signal.updated_at);
  const pipsLabel =
    signal.realized_pips !== null ? formatPips(signal.realized_pips) : "Awaiting realized outcome";
  const rationale = deriveSignalRationale(signal.notes, signal.timeframe);
  const invalidation = deriveSignalInvalidation(
    signal.symbol,
    signal.timeframe,
    signal.direction,
    signal.stop_loss,
  );

  return (
    <Link
      href={`/signals/${signal.slug}`}
      className="glass-panel group flex flex-col gap-5 rounded-[1.75rem] p-5 transition-transform hover:-translate-y-1 hover:border-red-300/25"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-red-100/60">
              {signal.asset_class}
            </span>
            <StatusPill tone={tone}>
              {formatSignalStatus(signal.status)}
              {signal.result !== "open" ? ` • ${formatSignalResult(signal.result)}` : ""}
            </StatusPill>
            <StatusPill tone={isLong ? "positive" : "negative"}>
              {formatDirection(signal.direction)}
            </StatusPill>
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
            {signal.symbol}
          </h3>
          <p className="mt-1 max-w-lg text-sm leading-7 text-slate-300/75">{rationale}</p>
        </div>
        <span
          className={`flex size-11 items-center justify-center rounded-2xl ${
            isLong ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-500/16 text-rose-300"
          }`}
        >
          {isLong ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Entry"
          value={formatPrice(signal.symbol, signal.entry_price)}
          detail={formatEntryType(signal.entry_type)}
        />
        <Metric label="Stop loss" value={formatPrice(signal.symbol, signal.stop_loss)} />
        <Metric label="Take profit" value={formatPrice(signal.symbol, signal.take_profit)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Timeframe" value={signal.timeframe} icon={<Timer className="size-4" />} />
        <Metric label="Risk reward" value={`1:${signal.risk_reward_ratio.toFixed(2)}`} />
        <Metric
          label="Pip outcome"
          value={pipsLabel}
          tone={signal.realized_pips !== null && signal.realized_pips < 0 ? "loss" : "default"}
        />
      </div>

      <div className="rounded-[1.35rem] border border-slate-300/8 bg-black/20 p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
          <ShieldAlert className="size-4" />
          Invalidation
        </div>
        <div className="mt-2 text-sm leading-7 text-slate-300">{invalidation}</div>
      </div>

      <div className="faint-divider pt-4 text-sm text-slate-400">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4" />
            Published {formatTimestamp(signal.created_at)}
          </div>
          <DataFreshnessBadge
            label={freshness.label}
            detail={freshness.detail}
            tone={freshness.tone}
          />
        </div>
      </div>
    </Link>
  );
}

function Metric({
  label,
  value,
  detail,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  tone?: "default" | "loss";
}) {
  return (
    <div className="rounded-2xl border border-stone-300/8 bg-black/24 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-stone-500">
        {icon}
        {label}
      </div>
      <div className={`mt-2 text-sm font-medium ${tone === "loss" ? "text-rose-200" : "text-white"}`}>
        {value}
      </div>
      {detail ? <div className="mt-1 text-xs text-slate-500">{detail}</div> : null}
    </div>
  );
}
