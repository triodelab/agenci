"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { BellIcon, SidebarIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LogoIcon } from "@/components/logo";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

export function DashboardTopNav() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="dash-topnav flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-card px-4 lg:px-5">
      {/* Left: toggle + logo */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle sidebar"
        >
          <SidebarIcon className="size-4" strokeWidth={1.75} />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <LogoIcon className="size-7 rounded-lg brightness-0 dark:invert" />
          <span className="font-semibold text-[15px] tracking-tight text-foreground hidden sm:block">
            Agenci
          </span>
        </Link>
      </div>

      {/* Right: theme, org, bell, user */}
      <div className="flex items-center gap-2 shrink-0">
        <ModeToggle
          contentClassName="dashboard-app-shell"
          triggerClassName="size-8 rounded-lg border border-border/70 bg-transparent hover:bg-muted transition-colors flex items-center justify-center"
        />

        <Suspense fallback={<div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />}>
          <OrganizationSwitcher
            hidePersonal
            skipInvitationScreen
            appearance={{
              elements: {
                rootBox: "h-8!",
                avatarBox: "size-4! rounded-md!",
                organizationSwitcherTrigger:
                  "h-8! rounded-lg! border border-border/70 bg-transparent px-2! text-[12px]! font-medium! hover:bg-muted! shadow-none!",
                organizationPreviewTextContainer: "text-[12px]! font-medium! text-foreground!",
                organizationSwitcherTriggerIcon: "ml-1! size-3.5! text-muted-foreground!",
              },
            }}
          />
        </Suspense>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Varsler"
            >
              <BellIcon className="size-4" strokeWidth={1.75} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="dashboard-app-shell w-80 p-0"
            sideOffset={8}
          >
            <div className="border-b border-border/60 px-4 py-3">
              <p className="text-[13px] font-semibold text-foreground">Varsler</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/50 bg-muted/30">
                <BellIcon className="size-[1.125rem] text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-medium text-foreground">Ingen varsler</p>
              <p className="text-[12px] text-muted-foreground">
                Nye samtaler og hendelser vises her.
              </p>
            </div>
          </PopoverContent>
        </Popover>

        <Suspense fallback={<div className="size-8 animate-pulse rounded-lg bg-muted" />}>
          <UserButton
            appearance={{
              elements: {
                rootBox: "h-8!",
                userButtonTrigger: "h-8! rounded-lg! border border-border/70 bg-transparent p-1! hover:bg-muted!",
                avatarBox: "size-6! rounded-md!",
              },
            }}
          />
        </Suspense>
      </div>
    </header>
  );
}
