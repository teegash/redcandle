import { describe, expect, it } from "vitest";
import { seedSignals } from "@/lib/mock-data";
import {
  calculateAnalytics,
  getPipSize,
  getPipTargets,
  getRiskRewardRatio,
  signalInputSchema,
} from "@/lib/trading";

describe("trading helpers", () => {
  it("detects symbol pip size correctly", () => {
    expect(getPipSize("EURUSD")).toBe(0.0001);
    expect(getPipSize("USDJPY")).toBe(0.01);
    expect(getPipSize("XAUUSD")).toBe(0.01);
    expect(getPipSize("BTCUSDT")).toBe(1);
  });

  it("calculates pip targets and RR for long setups", () => {
    const targets = getPipTargets("long", 1.1, 1.106, 1.097, "EURUSD");

    expect(targets.tpDistance).toBe(60);
    expect(targets.slDistance).toBe(30);
    expect(getRiskRewardRatio("long", 1.1, 1.106, 1.097, "EURUSD")).toBe(2);
  });

  it("rejects invalid short setups", () => {
    const parsed = signalInputSchema.safeParse({
      symbol: "EURUSD",
      asset_class: "forex",
      direction: "short",
      entry_type: "market",
      timeframe: "H1",
      entry_price: 1.1,
      take_profit: 1.11,
      stop_loss: 1.12,
      notes: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("builds analytics excluding open trades", () => {
    const analytics = calculateAnalytics(seedSignals);

    expect(analytics.totalTrades).toBe(2);
    expect(analytics.wins).toBe(1);
    expect(analytics.losses).toBe(1);
    expect(analytics.winRate).toBe(50);
    expect(analytics.netPips).toBe(33);
  });
});
