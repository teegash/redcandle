import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import type { AppHealthLog } from "@/lib/types";

interface StatusDashboardProps {
  health: AppHealthLog[];
}

type Row = {
  name: string;
  key: keyof Pick<
    AppHealthLog,
    "vercel_status" | "supabase_status" | "telegram_status" | "billing_status"
  >;
  components: number;
};

const rows: Row[] = [
  { name: "Platform API", key: "vercel_status", components: 8 },
  { name: "Database", key: "supabase_status", components: 5 },
  { name: "Telegram Delivery", key: "telegram_status", components: 3 },
  { name: "Billing", key: "billing_status", components: 4 },
];

export function StatusDashboard({ health }: StatusDashboardProps) {
  const timeline = [...health].reverse();
  const latest = health[0];
  const allOperational =
    latest &&
    latest.vercel_status === "healthy" &&
    latest.supabase_status === "healthy" &&
    latest.telegram_status === "healthy" &&
    latest.billing_status === "healthy";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] border border-emerald-300/30 bg-white/95 text-slate-900 shadow-2xl shadow-black/10">
        <div className="flex items-center gap-3 border-b border-emerald-200 bg-emerald-100 px-6 py-5">
          <CheckCircle2 className="size-6 text-emerald-600" />
          <div>
            <h2 className="text-2xl font-semibold">
              {allOperational ? "We're fully operational" : "Some systems are degraded"}
            </h2>
          </div>
        </div>
        <div className="px-6 py-6 text-lg text-slate-700">
          {allOperational
            ? "We're not aware of any issues affecting our systems."
            : "One or more systems show degradation. Check the timelines below for detail."}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white/95 text-slate-900 shadow-2xl shadow-black/10">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-2xl font-semibold">System status</div>
          <div className="flex items-center gap-3 text-slate-500">
            <ChevronLeft className="size-4" />
            <span>Recent checks</span>
            <ChevronRight className="size-4" />
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {!timeline.length ? (
            <div className="px-6 py-10 text-slate-500">
              No health samples yet. Run the protected health check endpoint after deployment to
              start the timeline.
            </div>
          ) : null}
          {rows.map((row) => {
            const segments = timeline.map((entry) => entry[row.key]);
            const healthyCount = segments.filter((segment) => segment === "healthy").length;
            const uptime = segments.length ? (healthyCount / segments.length) * 100 : 100;

            return (
              <article key={row.name} className="px-6 py-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-emerald-500" />
                    <div className="font-medium">{row.name}</div>
                    <div className="text-slate-400">{row.components} components</div>
                  </div>
                  <div className="text-slate-500">{uptime.toFixed(2)}% uptime</div>
                </div>
                <div className="flex gap-1">
                  {segments.map((segment, index) => (
                    <span
                      key={`${row.name}-${index}`}
                      className={`h-8 min-w-1.5 flex-1 rounded-sm ${
                        segment === "healthy"
                          ? "bg-emerald-400"
                          : segment === "degraded"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      }`}
                    />
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
