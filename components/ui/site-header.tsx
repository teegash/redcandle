import Link from "next/link";
import { Activity, CreditCard, LayoutDashboard, ShieldCheck } from "lucide-react";
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
      <div className="glass-panel flex w-full items-center justify-between rounded-[1.75rem] px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-2 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "pill transition-colors hover:border-sky-300/30 hover:bg-sky-200/6",
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
