import { EquityChart } from "@/components/analytics/equity-chart";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { RiskDisclaimer } from "@/components/ui/risk-disclaimer";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAnalytics, getDailyMetrics, listSignals } from "@/lib/data";
import { formatPips, formatPrice, formatTimestamp, percent, signed } from "@/lib/utils";

export const metadata = {
  title: "Analytics",
};

export default async function AnalyticsPage() {
  const [analytics, daily, signals] = await Promise.all([
    getAnalytics(),
    getDailyMetrics(),
    listSignals(),
  ]);

  const closedSignals = signals.filter(
    (signal) => signal.result === "tp_hit" || signal.result === "sl_hit",
  );
  const pairPerformance = buildPairPerformance(closedSignals);

  return (
    <div className="space-y-8 py-8">
      <Reveal>
        <SectionHeading
          eyebrow="Performance"
          title="Closed-signal analytics calculated from realized outcomes."
          description="Untriggered setups are excluded from win rate and pip performance. The dashboard stays grounded in closed trade results, strategy discipline, and drawdown visibility."
        />
      </Reveal>
      <Reveal delay={0.08}>
        <div className="stat-grid">
          <Kpi label="Win rate" value={percent(analytics.winRate)} detail={`${analytics.wins}/${analytics.totalTrades} closed trades`} />
          <Kpi label="Net realized pips" value={`${signed(analytics.netPips)} pips`} detail="Closed trades only" />
          <Kpi label="Expectancy per signal" value={`${signed(analytics.expectancyPips)} pips`} detail="Expected pip outcome per closed trade" />
          <Kpi label="Profit factor" value={analytics.profitFactor.toFixed(2)} detail="Gross winners divided by gross losers" />
          <Kpi label="Average win" value={formatPips(analytics.averageWin)} detail="Mean positive pip outcome" />
          <Kpi label="Max drawdown" value={`${analytics.maxDrawdown.toFixed(1)} pips`} detail="Largest peak-to-trough retracement" />
        </div>
      </Reveal>
      <Reveal delay={0.14}>
        <EquityChart data={analytics.equityCurve} />
      </Reveal>
      <Reveal delay={0.18}>
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-white">Pair performance</h2>
            <div className="mt-5 space-y-3">
              {pairPerformance.length ? (
                pairPerformance.map((pair) => (
                  <div
                    key={pair.symbol}
                    className="rounded-[1.2rem] border border-slate-300/10 bg-slate-950/35 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{pair.symbol}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                          {pair.trades} closed trades
                        </div>
                      </div>
                      <div className={pair.netPips >= 0 ? "text-emerald-200" : "text-rose-200"}>
                        {formatPips(pair.netPips)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No closed signals yet."
                  description="Pair-level analytics will appear after at least one signal closes with a realized outcome."
                />
              )}
            </div>
          </div>

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
        </section>
      </Reveal>
      <Reveal delay={0.22}>
        {closedSignals.length ? (
          <section className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Issued</th>
                  <th>Symbol</th>
                  <th>Direction</th>
                  <th>Entry</th>
                  <th>Exit Basis</th>
                  <th>Result</th>
                  <th>Pips</th>
                </tr>
              </thead>
              <tbody>
                {closedSignals.map((signal) => (
                  <tr key={signal.id}>
                    <td>{formatTimestamp(signal.created_at)}</td>
                    <td>{signal.symbol}</td>
                    <td>{signal.direction.toUpperCase()}</td>
                    <td>{formatPrice(signal.symbol, signal.entry_price)}</td>
                    <td>
                      {signal.result === "tp_hit"
                        ? formatPrice(signal.symbol, signal.take_profit)
                        : formatPrice(signal.symbol, signal.stop_loss)}
                    </td>
                    <td>{signal.result === "tp_hit" ? "Target hit" : "Stopped out"}</td>
                    <td className={signal.realized_pips && signal.realized_pips < 0 ? "text-rose-200" : "text-emerald-200"}>
                      {formatPips(signal.realized_pips ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          <EmptyState
            title="No closed signals for this period."
            description="Try widening the date range later or return once the desk has more completed trade history."
          />
        )}
      </Reveal>
      <Reveal delay={0.25}>
        <RiskDisclaimer />
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

function buildPairPerformance(
  signals: Awaited<ReturnType<typeof listSignals>>,
) {
  const grouped = new Map<string, { symbol: string; trades: number; netPips: number }>();

  for (const signal of signals) {
    const current = grouped.get(signal.symbol) ?? {
      symbol: signal.symbol,
      trades: 0,
      netPips: 0,
    };

    current.trades += 1;
    current.netPips += signal.realized_pips ?? 0;
    grouped.set(signal.symbol, current);
  }

  return [...grouped.values()].sort((a, b) => b.netPips - a.netPips);
}
