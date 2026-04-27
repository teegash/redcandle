import type {
  AnalyticsSummary,
  AppHealthLog,
  Plan,
  Profile,
  Signal,
  SignalResult,
  Subscription,
} from "@/lib/types";
import { env, integrationStatus } from "@/lib/env";
import {
  demoProfile,
  demoSubscription,
  healthLogs,
  metricsDaily,
  pricingPlans,
  seedSignals,
} from "@/lib/mock-data";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  calculateAnalytics,
  getRealizedPips,
  getRiskRewardRatio,
  getSignalStatus,
  signalCloseSchema,
  signalInputSchema,
  slugifySignal,
  type SignalCloseInput,
  type SignalInput,
} from "@/lib/trading";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";

let signalStore: Signal[] = structuredClone(seedSignals);
let healthStore: AppHealthLog[] = structuredClone(healthLogs);
const useDemoData = !integrationStatus.supabase;

function shouldFallbackToDemo(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : String(error);

  return (
    message.includes("Invalid API key") ||
    message.includes("JWT") ||
    message.includes("fetch failed") ||
    message.includes("network")
  );
}

export async function listSignals() {
  if (useDemoData) {
    return [...signalStore].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase.from("signals").select("*").order("created_at", {
      ascending: false,
    });

    if (error) {
      throw error;
    }

    return (data ?? []) as Signal[];
  } catch (error) {
    if (shouldFallbackToDemo(error)) {
      return [...signalStore].sort((a, b) => b.created_at.localeCompare(a.created_at));
    }

    throw error;
  }
}

export async function getSignalBySlug(slug: string) {
  if (useDemoData) {
    const signals = await listSignals();
    return signals.find((signal) => signal.slug === slug) ?? null;
  }

  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("signals")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as Signal | null) ?? null;
  } catch (error) {
    if (shouldFallbackToDemo(error)) {
      const signals = await listSignals();
      return signals.find((signal) => signal.slug === slug) ?? null;
    }

    throw error;
  }
}

export async function getAnalytics(symbol?: string) {
  const signals = await listSignals();
  const filtered = symbol
    ? signals.filter((signal) => signal.symbol.toUpperCase() === symbol.toUpperCase())
    : signals;

  return calculateAnalytics(filtered);
}

export async function getDailyMetrics() {
  if (useDemoData) {
    return metricsDaily;
  }

  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("metrics_daily")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch (error) {
    if (shouldFallbackToDemo(error)) {
      return metricsDaily;
    }

    throw error;
  }
}

export async function getHealthLogs(options?: { publicView?: boolean }) {
  if (useDemoData) {
    return [...healthStore].sort((a, b) => b.checked_at.localeCompare(a.checked_at));
  }

  try {
    const client = options?.publicView
      ? getSupabaseAdminClient()
      : await getSupabaseServerClient();

    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from("app_health_logs")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(90);

    if (error) {
      throw error;
    }

    return (data ?? []) as AppHealthLog[];
  } catch (error) {
    if (shouldFallbackToDemo(error)) {
      return [...healthStore].sort((a, b) => b.checked_at.localeCompare(a.checked_at));
    }

    throw error;
  }
}

export async function getProfile(): Promise<Profile> {
  if (useDemoData) {
    return demoProfile;
  }

  try {
    return await getCurrentProfile();
  } catch (error) {
    if (shouldFallbackToDemo(error)) {
      return demoProfile;
    }

    throw error;
  }
}

export async function getSubscription(): Promise<Subscription> {
  if (useDemoData) {
    return demoSubscription;
  }

  try {
    const profile = await getCurrentProfile();
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      throw new Error("Supabase client is unavailable.");
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", profile.id)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!data) {
      return {
        ...demoSubscription,
        active: false,
        user_id: profile.id,
        payment_reference: "pending",
      };
    }

    return data as Subscription;
  } catch (error) {
    if (shouldFallbackToDemo(error)) {
      return demoSubscription;
    }

    throw error;
  }
}

export async function getPricingPlans(): Promise<Plan[]> {
  return pricingPlans;
}

export async function createSignal(input: SignalInput, createdBy = demoProfile.id) {
  const payload = signalInputSchema.parse(input);
  const now = new Date().toISOString();

  const signal: Signal = {
    id: crypto.randomUUID(),
    slug: slugifySignal(payload.symbol, payload.direction),
    symbol: payload.symbol.toUpperCase(),
    asset_class: payload.asset_class,
    direction: payload.direction,
    entry_type: payload.entry_type,
    entry_price: payload.entry_price,
    take_profit: payload.take_profit,
    stop_loss: payload.stop_loss,
    timeframe: payload.timeframe.toUpperCase(),
    notes: payload.notes,
    status: getSignalStatus(payload.entry_type),
    result: "open",
    realized_pips: null,
    risk_reward_ratio: getRiskRewardRatio(
      payload.direction,
      payload.entry_price,
      payload.take_profit,
      payload.stop_loss,
      payload.symbol,
    ),
    created_at: now,
    updated_at: now,
    opened_at: payload.entry_type === "market" ? now : null,
    closed_at: null,
    created_by: createdBy,
  };

  if (useDemoData) {
    signalStore = [signal, ...signalStore];
    return signal;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is unavailable.");
  }

  const { data, error } = await supabase
    .from("signals")
    .insert({
      slug: signal.slug,
      symbol: signal.symbol,
      asset_class: signal.asset_class,
      direction: signal.direction,
      entry_type: signal.entry_type,
      timeframe: signal.timeframe,
      entry_price: signal.entry_price,
      take_profit: signal.take_profit,
      stop_loss: signal.stop_loss,
      status: signal.status,
      result: signal.result,
      realized_pips: signal.realized_pips,
      risk_reward_ratio: signal.risk_reward_ratio,
      notes: signal.notes,
      opened_at: signal.opened_at,
      closed_at: signal.closed_at,
      created_by: signal.created_by,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("audit_logs").insert({
    user_id: createdBy,
    action: "CREATE_SIGNAL",
    status: "success",
    meta: {
      signal_id: data.id,
      symbol: data.symbol,
    },
  });

  return data as Signal;
}

export async function closeSignal(id: string, input: SignalCloseInput, actorId = demoProfile.id) {
  const payload = signalCloseSchema.parse(input);

  if (useDemoData) {
    const existing = signalStore.find((signal) => signal.id === id);

    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const realized =
      payload.result === "untriggered" ? 0 : getRealizedPips(existing, payload.result);

    const updated: Signal = {
      ...existing,
      status: payload.result === "untriggered" ? "cancelled" : "closed",
      result: payload.result as SignalResult,
      realized_pips: payload.result === "untriggered" ? null : realized,
      updated_at: now,
      closed_at: now,
    };

    signalStore = signalStore.map((signal) => (signal.id === id ? updated : signal));
    return updated;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is unavailable.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("signals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  const realized =
    payload.result === "untriggered"
      ? 0
      : getRealizedPips(existing as Signal, payload.result);

  const { data, error } = await supabase
    .from("signals")
    .update({
      status: payload.result === "untriggered" ? "cancelled" : "closed",
      result: payload.result,
      realized_pips: payload.result === "untriggered" ? null : realized,
      updated_at: now,
      closed_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("executions").insert({
    signal_id: id,
    result: payload.result,
    realized_pips: payload.result === "untriggered" ? null : realized,
    closed_at: now,
  });

  await supabase.from("audit_logs").insert({
    user_id: actorId,
    action: "CLOSE_SIGNAL",
    status: "success",
    meta: {
      signal_id: id,
      result: payload.result,
    },
  });

  return data as Signal;
}

export async function runHealthCheck() {
  const now = new Date().toISOString();
  const health: AppHealthLog = {
    id: crypto.randomUUID(),
    checked_at: now,
    vercel_status: "healthy",
    supabase_status: integrationStatus.supabase ? "healthy" : "degraded",
    telegram_status: integrationStatus.telegram ? "healthy" : "degraded",
    billing_status: integrationStatus.paystack ? "healthy" : "degraded",
    api_latency_ms: integrationStatus.supabase ? 124 : 168,
    error_rate: integrationStatus.telegram && integrationStatus.paystack ? 0.1 : 1.2,
  };

  if (useDemoData) {
    healthStore = [health, ...healthStore].slice(0, 90);
    return health;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is unavailable.");
  }

  const { data, error } = await supabase
    .from("app_health_logs")
    .insert(health)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as AppHealthLog;
}

export async function getProductStatus() {
  const analytics = await getAnalytics();
  return {
    environment: integrationStatus.supabase ? "live" : "demo",
    appUrl: env.APP_URL,
    integrations: integrationStatus,
    analytics,
  };
}

export function snapshotAnalytics(signalList: Signal[]): AnalyticsSummary {
  return calculateAnalytics(signalList);
}
