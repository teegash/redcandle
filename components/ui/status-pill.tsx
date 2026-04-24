import { cn } from "@/lib/utils";

interface StatusPillProps {
  tone: "positive" | "neutral" | "negative" | "warning";
  children: React.ReactNode;
}

const toneStyles = {
  positive: "border-emerald-400/20 bg-emerald-400/8 text-emerald-200",
  neutral: "border-slate-300/10 bg-slate-300/6 text-slate-100",
  negative: "border-rose-400/20 bg-rose-400/8 text-rose-200",
  warning: "border-amber-300/20 bg-amber-300/8 text-amber-100",
};

export function StatusPill({ tone, children }: StatusPillProps) {
  return <span className={cn("pill", toneStyles[tone])}>{children}</span>;
}
