import { MarketPulseHeader } from "@/components/market/market-pulse-header";
import { Reveal } from "@/components/motion/reveal";
import { SignalCard } from "@/components/signals/signal-card";
import { EmptyState } from "@/components/ui/empty-state";
import { RiskDisclaimer } from "@/components/ui/risk-disclaimer";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { getProductStatus, listSignals } from "@/lib/data";

export const metadata = {
  title: "Signals",
};

export default async function SignalsPage() {
  const [signals, status] = await Promise.all([listSignals(), getProductStatus()]);
  const activeSignals = signals.filter((signal) => signal.status === "open");
  const pendingSignals = signals.filter((signal) => signal.status === "pending");
  const closedSignals = signals.filter((signal) => signal.status === "closed");

  return (
    <div className="space-y-8 py-8">
      <Reveal>
        <SectionHeading
          eyebrow="Member Feed"
          title="Signals, invalidation, and execution context in one disciplined feed."
          description="This is the member-facing signal surface for active and historical setups. The layout stays compact on mobile while preserving entry, stop loss, target, rationale, and freshness data."
        />
      </Reveal>
      <Reveal delay={0.06}>
        <MarketPulseHeader
          session="London Session"
          volatility="Normal"
          activeSignals={activeSignals.length}
          pendingSignals={pendingSignals.length}
          environment={status.environment}
        />
      </Reveal>
      <Reveal delay={0.1}>
        <div className="flex flex-wrap gap-3">
          <StatusPill tone="positive">Active {activeSignals.length}</StatusPill>
          <StatusPill tone="warning">Pending {pendingSignals.length}</StatusPill>
          <StatusPill tone="neutral">Closed {closedSignals.length}</StatusPill>
          <StatusPill tone="neutral">All signals {signals.length}</StatusPill>
        </div>
      </Reveal>
      <Reveal delay={0.14}>
        {signals.length ? (
          <div className="signal-grid">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active signals right now."
            description="The desk is waiting for cleaner confirmation before issuing a new setup. Check back after the next session rotation or review archived signal history."
          />
        )}
      </Reveal>
      <Reveal delay={0.18}>
        <RiskDisclaimer />
      </Reveal>
    </div>
  );
}
