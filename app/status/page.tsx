import { StatusDashboard } from "@/components/status/status-dashboard";
import { Reveal } from "@/components/motion/reveal";
import { getHealthLogs } from "@/lib/data";
import { formatTimestamp } from "@/lib/utils";

export const metadata = {
  title: "Status",
};

export default async function StatusPage() {
  const health = await getHealthLogs({ publicView: true });
  const latest = health[0];

  return (
    <div className="space-y-8 py-8">
      <Reveal>
        <div className="max-w-4xl">
          <p className="eyebrow">Public Status</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-white">
            RedCandle system status
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Public operational visibility for the signal platform, delivery stack, database, and
            billing readiness.
          </p>
          {latest ? (
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-slate-500">
              Last health sample {formatTimestamp(latest.checked_at)}
            </p>
          ) : null}
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <StatusDashboard health={health} />
      </Reveal>
    </div>
  );
}
