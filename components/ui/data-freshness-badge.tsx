import { StatusPill } from "@/components/ui/status-pill";

interface DataFreshnessBadgeProps {
  label: string;
  detail: string;
  tone: "positive" | "warning" | "negative";
}

export function DataFreshnessBadge({
  label,
  detail,
  tone,
}: DataFreshnessBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill tone={tone}>{label}</StatusPill>
      <span className="text-xs uppercase tracking-[0.16em] text-slate-500">{detail}</span>
    </div>
  );
}
