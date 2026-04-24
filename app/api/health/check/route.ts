import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getHealthLogs, runHealthCheck } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const healthcheckSecret = env.HEALTHCHECK_SECRET;

  if (healthcheckSecret && authorization === `Bearer ${healthcheckSecret}`) {
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

  if (!env.HEALTHCHECK_SECRET || secret !== env.HEALTHCHECK_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const health = await runHealthCheck();
  return NextResponse.json(health);
}
