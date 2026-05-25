"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserCircle2,
  GemIcon,
  Building2,
  Shield,
  Lock,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const NAV = [
  { href: "/settings/profile", label: "Profil", icon: UserCircle2 },
  { href: "/settings/plan", label: "Plan", icon: GemIcon },
  { href: "/settings/organization", label: "Organisasjon", icon: Building2 },
  { href: "/settings/privacy", label: "Personvern", icon: Shield },
  { href: "/settings/security", label: "Sikkerhet", icon: Lock },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="w-52 shrink-0">
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
        Innstillinger
      </p>
      <ul className="space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-foreground text-background [&_svg]:text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:text-muted-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
