export type Role = "admin" | "member";
export type AssetClass = "forex" | "crypto" | "indices" | "commodities";
export type Direction = "long" | "short";
export type EntryType = "market" | "pending";
export type SignalStatus = "pending" | "open" | "closed" | "cancelled";
export type SignalResult = "open" | "tp_hit" | "sl_hit" | "untriggered";
export type PlanId = "starter" | "pro" | "desk";

export interface Profile {
  id: string;
  display_name: string;
  role: Role;
  email: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanId;
  active: boolean;
  valid_until: string;
  payment_provider: "paystack";
  payment_reference: string;
}

export interface Signal {
  id: string;
  slug: string;
  symbol: string;
  asset_class: AssetClass;
  direction: Direction;
  entry_type: EntryType;
  entry_price: number;
  take_profit: number;
  stop_loss: number;
  notes: string;
  timeframe: string;
  status: SignalStatus;
  result: SignalResult;
  realized_pips: number | null;
  risk_reward_ratio: number;
  created_at: string;
  updated_at: string;
  opened_at: string | null;
  closed_at: string | null;
  created_by: string;
}

export interface AuditLog {
  id: string;
  action: string;
  status: "success" | "failed" | "skipped";
  created_at: string;
  meta: Record<string, unknown>;
}

export interface MetricsDaily {
  date: string;
  trades_count: number;
  wins: number;
  losses: number;
  win_rate: number;
  expectancy_pips: number;
  profit_factor: number;
  max_drawdown: number;
  sharpe: number;
  sortino: number;
}

export interface AppHealthLog {
  id: string;
  checked_at: string;
  vercel_status: "healthy" | "degraded" | "offline";
  supabase_status: "healthy" | "degraded" | "offline";
  telegram_status: "healthy" | "degraded" | "offline";
  billing_status: "healthy" | "degraded" | "offline";
  api_latency_ms: number;
  error_rate: number;
}

export interface KPI {
  label: string;
  value: string;
  detail: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
}

export interface EquityPoint {
  name: string;
  equity: number;
  drawdown: number;
}

export interface AnalyticsSummary {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  expectancyPips: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpe: number;
  sortino: number;
  netPips: number;
  averageWin: number;
  averageLoss: number;
  equityCurve: EquityPoint[];
}
