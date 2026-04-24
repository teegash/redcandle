"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EquityPoint } from "@/lib/types";

interface EquityChartClientProps {
  data: EquityPoint[];
}

export function EquityChartClient({ data }: EquityChartClientProps) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Equity Curve</h3>
        <p className="mt-1 text-sm text-slate-400">
          Compounded pip performance with live drawdown visibility.
        </p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                background: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: 16,
              }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#7dd3fc"
              fill="url(#equityFill)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
