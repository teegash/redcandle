import { NextRequest, NextResponse } from "next/server";
import { HttpError, requireAdmin } from "@/lib/auth";
import { listSignals } from "@/lib/data";
import { publishSignalToTelegram } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const signalId = body.signalId as string | undefined;

    if (!signalId) {
      return NextResponse.json({ error: "signalId is required." }, { status: 400 });
    }

    const signals = await listSignals();
    const signal = signals.find((item) => item.id === signalId);

    if (!signal) {
      return NextResponse.json({ error: "Signal not found." }, { status: 404 });
    }

    const result = await publishSignalToTelegram(
      signal,
      signal.closed_at ? "close" : "create",
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to retry Telegram delivery.",
      },
      { status: error instanceof HttpError ? error.status : 400 },
    );
  }
}
