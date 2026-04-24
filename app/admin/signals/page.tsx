import { Reveal } from "@/components/motion/reveal";
import { SignalCard } from "@/components/signals/signal-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { listSignals } from "@/lib/data";

export const metadata = {
  title: "Manage Signals",
};

export default async function AdminSignalsPage() {
  const signals = await listSignals();

  return (
    <div className="space-y-8 py-8">
      <Reveal>
        <SectionHeading
          eyebrow="Signal Queue"
          title="Open, pending, and closed trades in one admin stream."
          description="This view gives the desk a quick command center until the deeper CRUD cycle is expanded into role-gated Supabase actions."
        />
      </Reveal>
      <Reveal delay={0.08}>
        <div className="signal-grid">
          {signals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </Reveal>
    </div>
  );
}
