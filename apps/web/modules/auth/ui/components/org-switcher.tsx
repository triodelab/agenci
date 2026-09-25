/**
 * Thin Norwegian org switcher backed by Better Auth.
 */
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronsUpDownIcon, Loader2Icon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export function OrgSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: orgs, isPending } = authClient.useListOrganizations();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!session?.user) return null;

  const label = activeOrg?.name ?? "Velg organisasjon";

  const setActive = async (organizationId: string) => {
    setBusy(true);
    try {
      await authClient.organization.setActive({ organizationId });
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        disabled={isPending || busy}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-transparent px-2 text-[12px] font-medium hover:bg-muted disabled:opacity-50"
      >
        {busy ? (
          <Loader2Icon className="size-3.5 animate-spin" />
        ) : (
          <span className="max-w-[140px] truncate">{label}</span>
        )}
        <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[200px] rounded-lg border border-border/60 bg-card p-1 shadow-xl">
          {(orgs ?? []).map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => void setActive(org.id)}
              className={cn(
                "flex w-full rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-muted",
                org.id === activeOrg?.id && "font-semibold",
              )}
            >
              {org.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/onboarding");
            }}
            className="mt-0.5 flex w-full rounded-md border-t border-border/50 px-2 py-1.5 text-left text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Opprett organisasjon
          </button>
        </div>
      )}
    </div>
  );
}
