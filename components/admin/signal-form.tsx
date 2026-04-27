"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, SendHorizonal } from "lucide-react";
import { getPipTargets, getRiskRewardRatio, signalInputSchema } from "@/lib/trading";

const defaults = {
  symbol: "EURUSD",
  asset_class: "forex",
  direction: "long",
  entry_type: "market",
  timeframe: "H1",
  entry_price: "1.0842",
  take_profit: "1.0899",
  stop_loss: "1.0813",
  notes: "London liquidity sweep followed by bullish structure shift and reclaim of intraday support.",
};

export function SignalForm() {
  const router = useRouter();
  const [values, setValues] = useState(defaults);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const metrics = useMemo(() => {
    const parsed = signalInputSchema.safeParse(values);
    if (!parsed.success) {
      return {
        valid: false,
        rr: null,
        tpDistance: null,
        slDistance: null,
        error: parsed.error.issues[0]?.message ?? "Invalid signal.",
      };
    }

    const { tpDistance, slDistance } = getPipTargets(
      parsed.data.direction,
      parsed.data.entry_price,
      parsed.data.take_profit,
      parsed.data.stop_loss,
      parsed.data.symbol,
    );

    return {
      valid: true,
      rr: getRiskRewardRatio(
        parsed.data.direction,
        parsed.data.entry_price,
        parsed.data.take_profit,
        parsed.data.stop_loss,
        parsed.data.symbol,
      ),
      tpDistance,
      slDistance,
      error: null,
    };
  }, [values]);

  function updateField(name: string, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function submit() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch("/api/signals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          entry_price: Number(values.entry_price),
          take_profit: Number(values.take_profit),
          stop_loss: Number(values.stop_loss),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to publish signal.");
        return;
      }

      setSuccess("Signal published. Telegram fanout handled by the backend route.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel rounded-[1.75rem] p-6">
        <div className="mb-6">
          <p className="eyebrow">Signal Composer</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
            Publish directly from the desk.
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            The form enforces pip-safe trade structure, computes R:R in real time, and routes
            Telegram delivery from the server after validation.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Symbol">
            <input
              value={values.symbol}
              onChange={(event) => updateField("symbol", event.target.value)}
              className="w-full rounded-2xl border border-slate-300/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
            />
          </Field>
          <Field label="Asset Class">
            <select
              value={values.asset_class}
              onChange={(event) => updateField("asset_class", event.target.value)}
              className="w-full rounded-2xl border border-slate-300/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
            >
              <option value="forex">Forex</option>
              <option value="crypto">Crypto</option>
              <option value="indices">Indices</option>
              <option value="commodities">Commodities</option>
            </select>
          </Field>
          <Field label="Direction">
            <select
              value={values.direction}
              onChange={(event) => updateField("direction", event.target.value)}
              className="w-full rounded-2xl border border-slate-300/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </Field>
          <Field label="Entry Type">
            <select
              value={values.entry_type}
              onChange={(event) => updateField("entry_type", event.target.value)}
              className="w-full rounded-2xl border border-slate-300/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
            >
              <option value="market">Market</option>
              <option value="pending">Pending</option>
            </select>
          </Field>
          <Field label="Timeframe">
            <input
              value={values.timeframe}
              onChange={(event) => updateField("timeframe", event.target.value)}
              className="w-full rounded-2xl border border-slate-300/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
            />
          </Field>
          <Field label="Entry Price">
            <input
              value={values.entry_price}
              onChange={(event) => updateField("entry_price", event.target.value)}
              className="w-full rounded-2xl border border-slate-300/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
            />
          </Field>
          <Field label="Take Profit">
            <input
              value={values.take_profit}
              onChange={(event) => updateField("take_profit", event.target.value)}
              className="w-full rounded-2xl border border-slate-300/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
            />
          </Field>
          <Field label="Stop Loss">
            <input
              value={values.stop_loss}
              onChange={(event) => updateField("stop_loss", event.target.value)}
              className="w-full rounded-2xl border border-slate-300/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
            />
          </Field>
        </div>

        <Field label="Trade Notes" className="mt-4">
          <textarea
            value={values.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-300/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
          />
        </Field>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/15 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {success}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={!metrics.valid || isPending}
            className="premium-button premium-button-primary"
          >
            {isPending ? "Publishing..." : "Publish signal"}
            <SendHorizonal className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/signals")}
            className="premium-button premium-button-secondary"
          >
            Review queue
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <aside className="glass-panel rounded-[1.75rem] p-6">
        <p className="eyebrow">Live Preview</p>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
          Member and Telegram snapshot
        </h3>
        <div className="mt-6 space-y-3 rounded-[1.5rem] border border-slate-300/10 bg-slate-950/45 p-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Symbol</span>
            <span className="font-medium text-white">{values.symbol.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Direction</span>
            <span className="font-medium text-white">{values.direction.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Entry</span>
            <span className="font-medium text-white">{values.entry_price}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Take Profit</span>
            <span className="font-medium text-white">{values.take_profit}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Stop Loss</span>
            <span className="font-medium text-white">{values.stop_loss}</span>
          </div>
          <div className="faint-divider pt-4" />
          <div className="grid gap-3 sm:grid-cols-3">
            <PreviewMetric
              label="TP Distance"
              value={metrics.tpDistance !== null ? `${metrics.tpDistance} pips` : "--"}
            />
            <PreviewMetric
              label="SL Distance"
              value={metrics.slDistance !== null ? `${metrics.slDistance} pips` : "--"}
            />
            <PreviewMetric
              label="R:R"
              value={metrics.rr !== null ? metrics.rr.toFixed(2) : "--"}
            />
          </div>
          <div className="rounded-2xl border border-slate-300/10 bg-slate-900/80 p-4 text-slate-300">
            {metrics.error ?? values.notes}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-300/10 bg-slate-950/50 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-base font-semibold text-white">{value}</div>
    </div>
  );
}
