import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, HttpError } from "@/lib/auth";
import { integrationStatus } from "@/lib/env";
import { createCheckoutSession } from "@/lib/paystack";

const priceByPlan = {
  starter: 350000,
  pro: 890000,
  desk: 2400000,
} as const;

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const plan = body.plan as keyof typeof priceByPlan;
    const email = integrationStatus.supabase
      ? (await getCurrentProfile()).email
      : (body.email as string);

    if (!plan || !priceByPlan[plan] || !email) {
      return NextResponse.json(
        { error: "Plan and email are required." },
        { status: 400 },
      );
    }

    const session = await createCheckoutSession({
      email,
      amount: priceByPlan[plan],
      plan,
    });

    return NextResponse.json({
      authorizationUrl: session.authorization_url,
      reference: session.reference,
      mode: session.mode,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to start checkout session.",
      },
      { status: error instanceof HttpError ? error.status : 500 },
    );
  }
}
