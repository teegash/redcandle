import { NextRequest, NextResponse } from "next/server";
import { HttpError, requireAdmin } from "@/lib/auth";
import { closeSignal } from "@/lib/data";
import { publishSignalToTelegram } from "@/lib/telegram";
import { signalCloseSchema } from "@/lib/trading";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const payload = signalCloseSchema.parse(body);
    const signal = await closeSignal(id, payload, admin.id);

    if (!signal) {
      return NextResponse.json({ error: "Signal not found." }, { status: 404 });
    }

    const telegram = await publishSignalToTelegram(signal, "close");

    return NextResponse.json({
      signal,
      telegram,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to close signal.",
      },
      { status: error instanceof HttpError ? error.status : 400 },
    );
  }
}
