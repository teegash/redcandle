import { Reveal } from "@/components/motion/reveal";
import { SignalCard } from "@/components/signals/signal-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { listSignals } from "@/lib/data";

export const metadata = {
  title: "Signals",
};

export default async function SignalsPage() {
  const signals = await listSignals();

  return (
    <div className="space-y-8 py-8">
      <Reveal>
        <SectionHeading
          eyebrow="Member Feed"
          title="Every live and historical signal in one premium feed."
          description="This is the compact member surface for active signal consumption. It preserves clarity on mobile while still giving enough context for rapid decision-making."
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
