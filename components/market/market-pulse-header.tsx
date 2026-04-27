import type { ComponentType } from "react";
import { Activity, BellRing, Globe2, TimerReset } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";

interface MarketPulseHeaderProps {
  session: string;
  volatility: string;
  activeSignals: number;
  pendingSignals: number;
  environment: string;
}

export function MarketPulseHeader({
  session,
  volatility,
  activeSignals,
  pendingSignals,
  environment,
}: MarketPulseHeaderProps) {
  const sessionTone =
    session.toLowerCase().includes("london") || session.toLowerCase().includes("new york")
      ? "positive"
      : "warning";

  return (
    <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="eyebrow">Market Pulse</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
            {session} active, {volatility.toLowerCase()} volatility, signal desk synchronized.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Risk-defined signal flow, session context, and member delivery health from the same
            operational surface.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
          <PulseStat icon={Activity} label="Active signals" value={`${activeSignals}`} />
          <PulseStat icon={TimerReset} label="Pending setups" value={`${pendingSignals}`} />
          <PulseStat icon={BellRing} label="Environment" value={environment.toUpperCase()} />
          <PulseStat icon={Globe2} label="Timezone" value="Africa/Nairobi" />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <StatusPill tone={sessionTone}>{session}</StatusPill>
        <StatusPill tone="warning">Volatility {volatility}</StatusPill>
        <StatusPill tone="positive">Live desk routing</StatusPill>
        <StatusPill tone="neutral">Analyst verified flow</StatusPill>
      </div>
    </section>
  );
}

function PulseStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-white/7 bg-black/22 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-white">{value}</div>
    </div>
  );
}
