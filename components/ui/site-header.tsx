import Link from "next/link";
import { Activity, CreditCard, LayoutDashboard, ShieldCheck, RadioTower, Search } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/signals", label: "Signals", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: Activity },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/status", label: "Status", icon: Activity },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <div className="glass-panel relative flex w-full items-center justify-between rounded-[1.75rem] px-4 py-3 before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-red-300/45 before:to-transparent before:content-['']">
        <Logo />
        <div className="hidden items-center gap-3 xl:flex">
          <div className="command-bar min-w-[220px]">
            <Search className="size-4 text-slate-500" />
            <span className="text-sm text-slate-400">Search signals, symbols, reports</span>
          </div>
          <span className="header-chip">
            <RadioTower className="size-4" />
            London / New York
          </span>
          <span className="header-chip">EAT</span>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "pill transition-colors hover:border-red-300/30 hover:bg-red-300/8 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/account" className="premium-button premium-button-primary text-sm">
          Member access
        </Link>
      </div>
    </header>
  );
}
