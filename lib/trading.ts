import { z } from "zod";
import type {
  AnalyticsSummary,
  Direction,
  EquityPoint,
  Signal,
  SignalResult,
  SignalStatus,
} from "@/lib/types";

export const signalInputSchema = z
  .object({
    symbol: z.string().min(3).max(20),
    asset_class: z.enum(["forex", "crypto", "indices", "commodities"]),
    direction: z.enum(["long", "short"]),
    entry_type: z.enum(["market", "pending"]),
    timeframe: z.string().min(1).max(10),
    entry_price: z.coerce.number().positive(),
    take_profit: z.coerce.number().positive(),
    stop_loss: z.coerce.number().positive(),
    notes: z.string().max(600).default(""),
  })
  .superRefine((value, ctx) => {
    if (value.direction === "long") {
      if (value.take_profit <= value.entry_price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Long trades require take profit above entry.",
          path: ["take_profit"],
        });
      }
      if (value.stop_loss >= value.entry_price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Long trades require stop loss below entry.",
          path: ["stop_loss"],
        });
      }
    }

    if (value.direction === "short") {
      if (value.take_profit >= value.entry_price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Short trades require take profit below entry.",
          path: ["take_profit"],
        });
      }
      if (value.stop_loss <= value.entry_price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Short trades require stop loss above entry.",
          path: ["stop_loss"],
        });
      }
    }
  });

export const signalCloseSchema = z.object({
  result: z.enum(["tp_hit", "sl_hit", "untriggered"]),
});

export type SignalInput = z.infer<typeof signalInputSchema>;
export type SignalCloseInput = z.infer<typeof signalCloseSchema>;

export function getPipSize(symbol: string) {
  const normalized = symbol.toUpperCase();
  if (normalized.includes("JPY")) return 0.01;
  if (normalized.startsWith("XAU")) return 0.01;
  if (normalized.startsWith("BTC") || normalized.startsWith("ETH")) return 1;
  return 0.0001;
}

export function getPipTargets(
  direction: Direction,
  entryPrice: number,
  takeProfit: number,
  stopLoss: number,
  symbol: string,
) {
  const pipSize = getPipSize(symbol);

  const tpDistance =
    direction === "long"
      ? (takeProfit - entryPrice) / pipSize
      : (entryPrice - takeProfit) / pipSize;

  const slDistance =
    direction === "long"
      ? (entryPrice - stopLoss) / pipSize
      : (stopLoss - entryPrice) / pipSize;

  return {
    pipSize,
    tpDistance: Number(tpDistance.toFixed(1)),
    slDistance: Number(slDistance.toFixed(1)),
  };
}

export function getRiskRewardRatio(
  direction: Direction,
  entryPrice: number,
  takeProfit: number,
  stopLoss: number,
  symbol: string,
) {
  const { tpDistance, slDistance } = getPipTargets(
    direction,
    entryPrice,
    takeProfit,
    stopLoss,
    symbol,
  );
  return Number((tpDistance / slDistance).toFixed(2));
}

export function getRealizedPips(signal: Signal, result: SignalResult) {
  if (result === "tp_hit") {
    return getPipTargets(
      signal.direction,
      signal.entry_price,
      signal.take_profit,
      signal.stop_loss,
      signal.symbol,
    ).tpDistance;
  }

  if (result === "sl_hit") {
    return Number(
      (
        getPipTargets(
          signal.direction,
          signal.entry_price,
          signal.take_profit,
          signal.stop_loss,
          signal.symbol,
        ).slDistance * -1
      ).toFixed(1),
    );
  }

  return 0;
}

export function getSignalStatus(entryType: Signal["entry_type"]): SignalStatus {
  return entryType === "market" ? "open" : "pending";
}

export function slugifySignal(symbol: string, direction: Direction) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${symbol}-${direction}-${stamp}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

export function buildEquityCurve(signals: Signal[]): EquityPoint[] {
  let runningEquity = 0;
  let runningPeak = 0;

  return signals
    .filter((signal) => signal.result === "tp_hit" || signal.result === "sl_hit")
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((signal, index) => {
      runningEquity += signal.realized_pips ?? 0;
      runningPeak = Math.max(runningPeak, runningEquity);
      return {
        name: `${index + 1}`,
        equity: Number(runningEquity.toFixed(1)),
        drawdown: Number((runningPeak - runningEquity).toFixed(1)),
      };
    });
}

export function calculateAnalytics(signals: Signal[]): AnalyticsSummary {
  const closed = signals.filter(
    (signal) => signal.result === "tp_hit" || signal.result === "sl_hit",
  );
  const wins = closed.filter((signal) => signal.result === "tp_hit");
  const losses = closed.filter((signal) => signal.result === "sl_hit");
  const totalTrades = closed.length;
  const totalPositive = wins.reduce(
    (sum, signal) => sum + (signal.realized_pips ?? 0),
    0,
  );
  const totalNegativeAbs = Math.abs(
    losses.reduce((sum, signal) => sum + (signal.realized_pips ?? 0), 0),
  );
  const series = closed.map((signal) => (signal.realized_pips ?? 0) / 100);
  const downsideSeries = series.filter((point) => point < 0);
  const mean = series.length
    ? series.reduce((sum, value) => sum + value, 0) / series.length
    : 0;
  const deviation = series.length
    ? Math.sqrt(
        series.reduce((sum, value) => sum + (value - mean) ** 2, 0) / series.length,
      )
    : 0;
  const downsideDeviation = downsideSeries.length
    ? Math.sqrt(
        downsideSeries.reduce((sum, value) => sum + value ** 2, 0) /
          downsideSeries.length,
      )
    : 0;
  const equityCurve = buildEquityCurve(closed);
  const maxDrawdown = equityCurve.length
    ? Math.max(...equityCurve.map((point) => point.drawdown))
    : 0;

  return {
    totalTrades,
    wins: wins.length,
    losses: losses.length,
    winRate: totalTrades ? (wins.length / totalTrades) * 100 : 0,
    expectancyPips: totalTrades
      ? (totalPositive - totalNegativeAbs) / totalTrades
      : 0,
    profitFactor: totalNegativeAbs ? totalPositive / totalNegativeAbs : totalPositive,
    maxDrawdown,
    sharpe: deviation ? mean / deviation : 0,
    sortino: downsideDeviation ? mean / downsideDeviation : 0,
    netPips: totalPositive - totalNegativeAbs,
    averageWin: wins.length ? totalPositive / wins.length : 0,
    averageLoss: losses.length ? totalNegativeAbs / losses.length : 0,
    equityCurve,
  };
}
