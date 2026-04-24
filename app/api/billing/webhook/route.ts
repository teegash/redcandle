import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { verifyWebhookSignature } from "@/lib/paystack";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const valid = await verifyWebhookSignature(rawBody, signature);

  if (!valid) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    event?: string;
    data?: {
      reference?: string;
      customer?: { email?: string };
      metadata?: { plan?: string };
    };
  };

  if (payload.event === "charge.success" && payload.data?.customer?.email) {
    const supabase = getSupabaseAdminClient();

    if (supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", payload.data.customer.email)
        .maybeSingle();

      if (profile?.id) {
        const validUntil = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString();

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", profile.id)
          .maybeSingle();

        if (existing?.id) {
          await supabase
            .from("subscriptions")
            .update({
              plan: payload.data.metadata?.plan ?? "pro",
              active: true,
              valid_until: validUntil,
              payment_provider: "paystack",
              payment_reference: payload.data.reference,
              provider_metadata: payload,
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("subscriptions").insert({
            user_id: profile.id,
            plan: payload.data.metadata?.plan ?? "pro",
            active: true,
            valid_until: validUntil,
            payment_provider: "paystack",
            payment_reference: payload.data.reference,
            provider_metadata: payload,
          });
        }
      }
    }
  }

  return NextResponse.json({
    received: true,
    message: "Webhook verified and processed.",
  });
}
