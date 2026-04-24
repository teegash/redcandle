"use client";

import dynamic from "next/dynamic";
import type { EquityPoint } from "@/lib/types";

interface EquityChartProps {
  data: EquityPoint[];
}

const EquityChartClient = dynamic(
  () =>
    import("@/components/analytics/equity-chart-client").then(
      (module) => module.EquityChartClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="glass-panel rounded-[1.75rem] p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Equity Curve</h3>
          <p className="mt-1 text-sm text-slate-400">
            Compounded pip performance with live drawdown visibility.
          </p>
        </div>
        <div className="flex h-[320px] items-center justify-center rounded-[1.25rem] border border-slate-300/10 bg-slate-950/35 text-sm text-slate-400">
          Preparing chart...
        </div>
      </div>
    ),
  },
);

export function EquityChart({ data }: EquityChartProps) {
  if (!data.length) {
    return (
      <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-[1.75rem] p-8 text-slate-400">
        Close signals to start rendering the equity curve.
      </div>
    );
  }

  return <EquityChartClient data={data} />;
}
