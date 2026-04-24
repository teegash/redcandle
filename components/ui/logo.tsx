import Link from "next/link";
import { Flame } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 via-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-sky-500/20">
        <Flame className="size-5" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm uppercase tracking-[0.32em] text-sky-200/70">
          RedCandle
        </span>
        <span className="text-sm font-semibold text-white">Premium Signal Desk</span>
      </span>
    </Link>
  );
}
