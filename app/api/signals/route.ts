import { NextRequest, NextResponse } from "next/server";
import { createSignal, listSignals } from "@/lib/data";
import { HttpError, requireAdmin } from "@/lib/auth";
import { publishSignalToTelegram } from "@/lib/telegram";
import { signalInputSchema } from "@/lib/trading";

export const dynamic = "force-dynamic";

export async function GET() {
  const signals = await listSignals();
  return NextResponse.json({ signals });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const payload = signalInputSchema.parse(body);
    const signal = await createSignal(payload, admin.id);
    const telegram = await publishSignalToTelegram(signal, "create");

    return NextResponse.json({
      signal,
      telegram,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create signal.",
      },
      { status: error instanceof HttpError ? error.status : 400 },
    );
  }
}
