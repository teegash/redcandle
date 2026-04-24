import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Provide a symbol query parameter." }, { status: 400 });
  }

  const summary = await getAnalytics(symbol);
  return NextResponse.json(summary);
}
