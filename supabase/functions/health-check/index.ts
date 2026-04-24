type HealthState = "healthy" | "degraded" | "offline";

interface HealthInsert {
  checked_at: string;
  vercel_status: HealthState;
  supabase_status: HealthState;
  telegram_status: HealthState;
  billing_status: HealthState;
  api_latency_ms: number;
  error_rate: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-healthcheck-secret, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const secret =
    request.headers.get("x-healthcheck-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!Deno.env.get("HEALTHCHECK_SECRET") || secret !== Deno.env.get("HEALTHCHECK_SECRET")) {
    return json({ error: "Unauthorized" }, 401);
  }

  const startedAt = performance.now();
  const checkedAt = new Date().toISOString();
  const supabaseStatus = await checkSupabase();
  const telegramStatus = await checkTelegram();
  const billingStatus = await checkPaystack();
  const appStatus = await checkApp();
  const latency = Math.round(performance.now() - startedAt);

  const health: HealthInsert = {
    checked_at: checkedAt,
    vercel_status: appStatus,
    supabase_status: supabaseStatus,
    telegram_status: telegramStatus,
    billing_status: billingStatus,
    api_latency_ms: latency,
    error_rate: [supabaseStatus, telegramStatus, billingStatus, appStatus].filter(
      (status) => status !== "healthy",
    ).length,
  };

  const insertResult = await insertHealthLog(health);

  if (!insertResult.ok) {
    return json({ error: insertResult.error, health }, 500);
  }

  return json({ health });
});

async function checkSupabase(): Promise<HealthState> {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) return "offline";

  try {
    const response = await fetch(`${url}/rest/v1/app_health_logs?select=id&limit=1`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    return response.ok ? "healthy" : "degraded";
  } catch {
    return "offline";
  }
}

async function checkTelegram(): Promise<HealthState> {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!token) return "degraded";

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    return response.ok ? "healthy" : "degraded";
  } catch {
    return "offline";
  }
}

async function checkPaystack(): Promise<HealthState> {
  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secret) return "degraded";

  try {
    const response = await fetch("https://api.paystack.co/bank?country=kenya&perPage=1", {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    return response.ok ? "healthy" : "degraded";
  } catch {
    return "offline";
  }
}

async function checkApp(): Promise<HealthState> {
  const appUrl = Deno.env.get("APP_URL");
  if (!appUrl) return "degraded";

  try {
    const response = await fetch(`${appUrl}/api/metrics/summary`, {
      headers: {
        "User-Agent": "RedCandle-HealthCheck/1.0",
      },
    });

    return response.ok ? "healthy" : "degraded";
  } catch {
    return "offline";
  }
}

async function insertHealthLog(health: HealthInsert) {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    return { ok: false, error: "Missing Supabase function secrets." };
  }

  try {
    const response = await fetch(`${url}/rest/v1/app_health_logs`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(health),
    });

    if (!response.ok) {
      return { ok: false, error: await response.text() };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown insert failure.",
    };
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
