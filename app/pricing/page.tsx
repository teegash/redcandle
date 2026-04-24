import { PricingCards } from "@/components/marketing/pricing-cards";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPricingPlans } from "@/lib/data";

export const metadata = {
  title: "Pricing",
};

export default async function PricingPage() {
  const plans = await getPricingPlans();

  return (
    <div className="space-y-8 py-8">
      <Reveal>
        <SectionHeading
          eyebrow="Membership"
          title="Subscription access that matches the product quality."
          description="The billing route is wired for Paystack and already supports a safe demo fallback, so the product can be polished before live credentials are dropped in."
        />
      </Reveal>
      <Reveal delay={0.08}>
        <PricingCards plans={plans} />
      </Reveal>
    </div>
  );
}
