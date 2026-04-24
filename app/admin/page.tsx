import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { StatusPill } from "@/components/ui/status-pill";
import { getAnalytics, getHealthLogs, getProductStatus, listSignals } from "@/lib/data";
import { percent, signed } from "@/lib/utils";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const [signals, analytics, status, health] = await Promise.all([
    listSignals(),
    getAnalytics(),
    getProductStatus(),
    getHealthLogs(),
  ]);

  const latestHealth = health[0];

  return (
    <div className="space-y-8 py-8">
      <Reveal>
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="eyebrow">Admin Desk</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
            Publish, monitor, and monetize from one control surface.
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <StatusPill tone={status.integrations.telegram ? "positive" : "warning"}>
              Telegram {status.integrations.telegram ? "connected" : "demo"}
            </StatusPill>
            <StatusPill tone={status.integrations.paystack ? "positive" : "warning"}>
              Paystack {status.integrations.paystack ? "ready" : "demo"}
            </StatusPill>
            <StatusPill tone={status.integrations.supabase ? "positive" : "warning"}>
              Supabase {status.integrations.supabase ? "connected" : "demo"}
            </StatusPill>
          </div>
        </section>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="stat-grid">
          <AdminMetric label="Signals tracked" value={`${signals.length}`} detail="Published ideas in store" />
          <AdminMetric label="Closed-trade win rate" value={percent(analytics.winRate)} detail="Realized pip analytics" />
          <AdminMetric label="Net pip outcome" value={`${signed(analytics.netPips)} pips`} detail="Closed trades only" />
          <AdminMetric label="API latency" value={`${latestHealth.api_latency_ms}ms`} detail="Latest health sample" />
        </div>
      </Reveal>
      <Reveal delay={0.14}>
        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard href="/admin/signals/new" title="Create signal" copy="Live pip preview, validation, and Telegram fanout." />
          <ActionCard href="/admin/signals" title="Manage queue" copy="Close trades, inspect statuses, and review desk activity." />
          <ActionCard href="/admin/health" title="Health monitor" copy="Track integration readiness, latency, and error posture." />
        </div>
      </Reveal>
    </div>
  );
}

function AdminMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{detail}</div>
    </div>
  );
}

function ActionCard({
  href,
  title,
  copy,
}: {
  href: string;
  title: string;
  copy: string;
}) {
  return (
    <Link href={href} className="glass-panel rounded-[1.75rem] p-6 transition-transform hover:-translate-y-1">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-200">
        Open
        <ArrowRight className="size-4" />
      </div>
    </Link>
  );
}
