import { StatusDashboard } from "@/components/status/status-dashboard";
import { Reveal } from "@/components/motion/reveal";
import { getHealthLogs } from "@/lib/data";

export const metadata = {
  title: "Status",
};

export default async function StatusPage() {
  const health = await getHealthLogs({ publicView: true });

  return (
    <div className="space-y-8 py-8">
      <Reveal>
        <div className="max-w-3xl">
          <p className="eyebrow">Public Status</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-white">
            RedCandle system status
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            A public-facing operational page for platform health, uptime history, and component
            visibility, modeled after the style you attached.
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <StatusDashboard health={health} />
      </Reveal>
    </div>
  );
}
