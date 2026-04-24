import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Clock3, Ratio, Timer } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import type { Signal } from "@/lib/types";
import { formatTimestamp, signed } from "@/lib/utils";

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

  return (
    <Link
      href={`/signals/${signal.slug}`}
      className="glass-panel group flex flex-col gap-5 rounded-[1.75rem] p-5 transition-transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-sky-100/55">
              {signal.asset_class}
            </span>
            <StatusPill tone={tone}>
              {signal.status}
              {signal.result !== "open" ? ` • ${signal.result}` : ""}
            </StatusPill>
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
            {signal.symbol}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-300/75">{signal.notes}</p>
        </div>
        <span
          className={`flex size-11 items-center justify-center rounded-2xl ${
            isLong
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-rose-400/10 text-rose-300"
          }`}
        >
          {isLong ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
        <div className="glass-panel-soft rounded-2xl p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Timer className="size-4" />
            Timeframe
          </div>
          <div className="mt-2 font-medium">{signal.timeframe}</div>
        </div>
        <div className="glass-panel-soft rounded-2xl p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Ratio className="size-4" />
            R:R
          </div>
          <div className="mt-2 font-medium">{signal.risk_reward_ratio.toFixed(2)}</div>
        </div>
      </div>

      <div className="stat-grid">
        <Metric label="Entry" value={signal.entry_price.toString()} />
        <Metric label="Take Profit" value={signal.take_profit.toString()} />
        <Metric label="Stop Loss" value={signal.stop_loss.toString()} />
        <Metric
          label="Pips"
          value={
            signal.realized_pips !== null ? `${signed(signal.realized_pips)} pips` : "Tracking"
          }
        />
      </div>

      <div className="faint-divider pt-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Clock3 className="size-4" />
          Published {formatTimestamp(signal.created_at)}
        </div>
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-300/8 bg-slate-950/30 p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}
