"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import type { Plan } from "@/lib/types";

interface PricingCardsProps {
  plans: Plan[];
  email?: string;
}

export function PricingCards({ plans, email = "member@redcandle.app" }: PricingCardsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubscribe(planId: string) {
    setSelected(planId);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/billing/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planId, email }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to initialize billing.");
        return;
      }

      window.location.assign(payload.authorizationUrl);
    });
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-2xl border border-rose-400/15 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      <div className="signal-grid">
        {plans.map((plan) => (
          <article key={plan.id} className="glass-panel flex flex-col rounded-[1.75rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-200/55">
                  {plan.name}
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {plan.price}
                </h3>
                <p className="mt-2 text-sm text-slate-400">per {plan.cadence}</p>
              </div>
              <span className="pill border-sky-300/20 bg-sky-300/10 text-sky-100">
                {plan.id === "pro" ? "Most popular" : "Premium"}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300/80">{plan.summary}</p>
            <div className="faint-divider my-6" />
            <ul className="space-y-3 text-sm text-slate-200">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-sky-300" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="premium-button premium-button-primary mt-8 w-full"
              onClick={() => handleSubscribe(plan.id)}
              disabled={isPending && selected === plan.id}
            >
              {isPending && selected === plan.id ? "Preparing checkout..." : "Start membership"}
              <ArrowRight className="size-4" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
