import { Reveal } from "@/components/motion/reveal";
import { StatusPill } from "@/components/ui/status-pill";
import { getHealthLogs } from "@/lib/data";

export const metadata = {
  title: "Health",
};

export default async function AdminHealthPage() {
  const health = await getHealthLogs();

  return (
    <div className="space-y-8 py-8">
      <Reveal>
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="eyebrow">Operational Health</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
            Platform readiness across delivery, data, and billing.
          </h1>
        </section>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="space-y-4">
          {health.map((entry) => (
            <article key={entry.id} className="glass-panel rounded-[1.5rem] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{entry.checked_at}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    API latency {entry.api_latency_ms}ms • Error rate {entry.error_rate}%
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <StatusPill tone={entry.vercel_status === "healthy" ? "positive" : "warning"}>
                    Vercel {entry.vercel_status}
                  </StatusPill>
                  <StatusPill tone={entry.supabase_status === "healthy" ? "positive" : "warning"}>
                    Supabase {entry.supabase_status}
                  </StatusPill>
                  <StatusPill tone={entry.telegram_status === "healthy" ? "positive" : "warning"}>
                    Telegram {entry.telegram_status}
                  </StatusPill>
                  <StatusPill tone={entry.billing_status === "healthy" ? "positive" : "warning"}>
                    Billing {entry.billing_status}
                  </StatusPill>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
