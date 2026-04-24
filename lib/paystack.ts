import crypto from "node:crypto";
import { env, integrationStatus } from "@/lib/env";

interface CheckoutOptions {
  email: string;
  amount: number;
  plan: string;
  callbackUrl?: string;
}

export async function createCheckoutSession(options: CheckoutOptions) {
  if (!integrationStatus.paystack) {
    return {
      mode: "demo" as const,
      authorization_url: `${env.APP_URL}/account?billing=demo`,
      reference: `demo-${crypto.randomUUID()}`,
    };
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: options.email,
      amount: options.amount,
      callback_url: options.callbackUrl ?? `${env.APP_URL}/account`,
      metadata: {
        plan: options.plan,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to initialize Paystack transaction.");
  }

  const payload = await response.json();
  return {
    mode: "live" as const,
    authorization_url: payload.data.authorization_url as string,
    reference: payload.data.reference as string,
  };
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
) {
  const verificationSecret = env.PAYSTACK_WEBHOOK_SECRET ?? env.PAYSTACK_SECRET_KEY;

  if (!integrationStatus.paystack || !verificationSecret || !signature) {
    return false;
  }

  const digest = crypto
    .createHmac("sha512", verificationSecret)
    .update(payload)
    .digest("hex");

  const digestBuffer = Buffer.from(digest);
  const signatureBuffer = Buffer.from(signature);

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}
