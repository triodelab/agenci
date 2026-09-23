/**
 * Task 1.2 Step 2 — Thin user menu (replaces Clerk UserButton).
 */
"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2Icon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return <Loader2Icon className="size-4 animate-spin text-muted-foreground" />;
  }
  if (!session?.user) return null;

  const initial =
    session.user.name?.charAt(0)?.toUpperCase() ??
    session.user.email.charAt(0).toUpperCase();

  const signOut = async () => {
    setBusy(true);
    try {
      await authClient.signOut();
      router.replace("/sign-in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center rounded-lg border border-border/70 bg-transparent p-1 hover:bg-muted"
        aria-label="Brukermeny"
      >
        <span className="flex size-6 items-center justify-center rounded-md bg-muted text-[11px] font-semibold">
          {initial}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[200px] rounded-lg border border-border/60 bg-card p-1 shadow-xl">
          <div className="border-b border-border/50 px-2 py-2">
            <p className="truncate text-[12px] font-medium">{session.user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {session.user.email}
            </p>
          </div>
          <Link
            href="/settings/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] hover:bg-muted"
          >
            <UserIcon className="size-3.5" />
            Profil
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] hover:bg-muted"
          >
            <SettingsIcon className="size-3.5" />
            Innstillinger
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] hover:bg-muted disabled:opacity-50"
          >
            {busy ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <LogOutIcon className="size-3.5" />
            )}
            Logg ut
          </button>
        </div>
      )}
    </div>
  );
}
