import { Reveal } from "@/components/motion/reveal";
import { StatusPill } from "@/components/ui/status-pill";
import { getProductStatus, getProfile, getSubscription } from "@/lib/data";
import { formatTimestamp } from "@/lib/utils";

export const metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const [profile, subscription, status] = await Promise.all([
    getProfile(),
    getSubscription(),
    getProductStatus(),
  ]);

  return (
    <div className="space-y-6 py-8">
      <Reveal>
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="eyebrow">Account</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
            {profile.display_name}
          </h1>
          <p className="mt-3 text-slate-400">{profile.email}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <StatusPill tone="positive">{subscription.plan.toUpperCase()} active</StatusPill>
            <StatusPill tone={status.environment === "live" ? "positive" : "warning"}>
              {status.environment} environment
            </StatusPill>
          </div>
        </section>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-white">Membership</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Plan</span>
                <span>{subscription.plan.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Provider</span>
                <span>{subscription.payment_provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reference</span>
                <span>{subscription.payment_reference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Valid until</span>
                <span>{formatTimestamp(subscription.valid_until)}</span>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-white">Integration readiness</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Supabase</span>
                <StatusPill tone={status.integrations.supabase ? "positive" : "warning"}>
                  {status.integrations.supabase ? "connected" : "demo mode"}
                </StatusPill>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Telegram</span>
                <StatusPill tone={status.integrations.telegram ? "positive" : "warning"}>
                  {status.integrations.telegram ? "ready" : "needs credentials"}
                </StatusPill>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Paystack</span>
                <StatusPill tone={status.integrations.paystack ? "positive" : "warning"}>
                  {status.integrations.paystack ? "ready" : "demo checkout"}
                </StatusPill>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
