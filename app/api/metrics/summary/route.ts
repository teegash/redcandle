import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await getAnalytics();
  return NextResponse.json(summary);
}
