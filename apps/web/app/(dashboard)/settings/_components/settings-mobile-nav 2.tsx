"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserCircle2, GemIcon, Building2, Shield, Lock,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const NAV = [
  { href: "/settings/profile", label: "Profil", icon: UserCircle2 },
  { href: "/settings/plan", label: "Plan", icon: GemIcon },
  { href: "/settings/organization", label: "Organisasjon", icon: Building2 },
  { href: "/settings/privacy", label: "Personvern", icon: Shield },
  { href: "/settings/security", label: "Sikkerhet", icon: Lock },
] as const;

export function SettingsMobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden mt-4 flex overflow-x-auto gap-1 pb-1 scrollbar-none">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap",
              active
                ? "bg-foreground text-background [&_svg]:text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
