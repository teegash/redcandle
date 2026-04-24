import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getHealthLogs, runHealthCheck } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const cronSecret = env.CRON_SECRET ?? env.HEALTHCHECK_SECRET;

  if (cronSecret && authorization === `Bearer ${cronSecret}`) {
    const health = await runHealthCheck();
    return NextResponse.json(health);
  }

  const health = await getHealthLogs({ publicView: true });
  return NextResponse.json({ health });
}

export async function POST(request: NextRequest) {
  const secret =
    request.headers.get("x-healthcheck-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  const allowedSecret = env.HEALTHCHECK_SECRET ?? env.CRON_SECRET;

  if (!allowedSecret || secret !== allowedSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const health = await runHealthCheck();
  return NextResponse.json(health);
}
