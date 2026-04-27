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
          title="Subscription access structured for serious signal subscribers."
          description="Plans are positioned around signal visibility, verified analytics, and operational trust. The billing layer is already modeled for Paystack and can move from demo to live credentials without reshaping the product."
        />
      </Reveal>
      <Reveal delay={0.08}>
        <PricingCards plans={plans} />
      </Reveal>
    </div>
  );
}
