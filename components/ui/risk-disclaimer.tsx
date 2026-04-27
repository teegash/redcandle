interface RiskDisclaimerProps {
  compact?: boolean;
}

export function RiskDisclaimer({ compact = false }: RiskDisclaimerProps) {
  return (
    <div
      className={`rounded-[1.25rem] border border-amber-300/14 bg-amber-300/6 ${
        compact ? "px-4 py-3 text-xs" : "px-5 py-4 text-sm"
      } text-amber-50/88`}
    >
      Trading forex and CFDs involves substantial risk and may not be suitable for all investors.
      Signals are analytical tools, not guaranteed outcomes. Always define risk before entry.
    </div>
  );
}
