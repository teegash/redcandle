import { EquityChart } from "@/components/analytics/equity-chart";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAnalytics, getDailyMetrics } from "@/lib/data";
import { percent, signed } from "@/lib/utils";

export const metadata = {
  title: "Analytics",
};

export default async function AnalyticsPage() {
  const [analytics, daily] = await Promise.all([getAnalytics(), getDailyMetrics()]);

  return (
    <div className="space-y-8 py-8">
      <Reveal>
        <SectionHeading
          eyebrow="Analytics"
          title="Signal quality measured in pips, not vibes."
          description="The analytics stack excludes untriggered trades, compounds realized pips, and keeps the member view fast enough to read during live market flow."
        />
      </Reveal>
      <Reveal delay={0.08}>
        <div className="stat-grid">
          <Kpi label="Win rate" value={percent(analytics.winRate)} detail={`${analytics.wins}/${analytics.totalTrades} closed trades`} />
          <Kpi label="Net pips" value={`${signed(analytics.netPips)} pips`} detail="Realized pip performance" />
          <Kpi label="Expectancy" value={`${signed(analytics.expectancyPips)} pips`} detail="Expected pips per trade" />
          <Kpi label="Profit factor" value={analytics.profitFactor.toFixed(2)} detail="Gross wins divided by gross losses" />
          <Kpi label="Sharpe" value={analytics.sharpe.toFixed(2)} detail="Normalized pip-return volatility" />
          <Kpi label="Max drawdown" value={`${analytics.maxDrawdown.toFixed(1)} pips`} detail="Largest peak-to-trough pullback" />
        </div>
      </Reveal>
      <Reveal delay={0.14}>
        <EquityChart data={analytics.equityCurve} />
      </Reveal>
      <Reveal delay={0.2}>
        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Trades</th>
                <th>Win rate</th>
                <th>Expectancy</th>
                <th>Profit factor</th>
                <th>Sharpe</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.trades_count}</td>
                  <td>{percent(row.win_rate)}</td>
                  <td>{signed(row.expectancy_pips)} pips</td>
                  <td>{row.profit_factor.toFixed(2)}</td>
                  <td>{row.sharpe.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </Reveal>
    </div>
  );
}

function Kpi({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{detail}</div>
    </div>
  );
}
