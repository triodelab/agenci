"use client";

import { useState } from "react";
import { useUser, useAuthActions } from "@/lib/auth-hooks";
import { useTheme } from "next-themes";
import {
  CopyIcon, CheckIcon, ExternalLinkIcon, SunIcon, MoonIcon,
  MonitorIcon, UserCircle2, KeyRoundIcon, AtSignIcon,
  CalendarIcon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useCopy(text: string | undefined | null) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return { copy, copied };
}

function formatDate(ts: number | Date) {
  return new Date(ts).toLocaleDateString("no-NO", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border/60 bg-muted/20 px-5 py-4">
        <p className="text-[14px] font-semibold text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>}
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, value, mono, action }: {
  label: string; value?: string | null; mono?: boolean; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0 gap-4">
      <span className="text-[13px] text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn(
          "text-[13px] font-medium text-foreground text-right truncate",
          mono && "font-mono text-[11px] text-muted-foreground",
        )}>
          {value ?? "—"}
        </span>
        {action}
      </div>
    </div>
  );
}

// ─── Profile view ─────────────────────────────────────────────────────────────

export function ProfileView() {
  const { user } = useUser();
  const { goToProfileSettings } = useAuthActions();
  const { theme, setTheme } = useTheme();
  const { copy: copyId, copied: copiedId } = useCopy(user?.id);

  const themeOptions = [
    { value: "light", icon: SunIcon, label: "Lyst" },
    { value: "dark", icon: MoonIcon, label: "Mørkt" },
    { value: "system", icon: MonitorIcon, label: "System" },
  ] as const;

  // Email + password is the only sign-in method enabled in packages/auth.
  const hasPassword = Boolean(user);

  return (
    <div className="space-y-4">

      {/* Identity card */}
      <Card title="Identitet" description="Navn, e-post og profilbilde">
        <div className="flex items-start gap-4 mb-5">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="size-16 rounded-xl object-cover ring-2 ring-border/40 shrink-0"
            />
          ) : (
            <div className="size-16 rounded-xl bg-muted flex items-center justify-center ring-2 ring-border/40 shrink-0">
              <UserCircle2 className="size-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-[17px] font-semibold text-foreground">{user?.name ?? "—"}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {user?.email ?? "—"}
            </p>
            {user?.createdAt && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <CalendarIcon className="size-3" strokeWidth={1.75} />
                Ble med {formatDate(user.createdAt)}
              </p>
            )}
          </div>
          <button
            onClick={() => goToProfileSettings()}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3.5 py-2 text-[12px] font-medium text-foreground hover:bg-muted/70 transition-colors"
          >
            <ExternalLinkIcon className="size-3.5" strokeWidth={1.75} />
            Rediger profil
          </button>
        </div>

        <div className="rounded-lg border border-border/60 overflow-hidden">
          <FieldRow label="Fullt navn" value={user?.name} />
          <FieldRow
            label="Fornavn"
            value={user?.firstName}
          />
          <FieldRow
            label="E-postadresse"
            value={user?.email}
            action={
              <span className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                user?.emailVerified
                  ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
              )}>
                {user?.emailVerified ? "Verifisert" : "Uverifisert"}
              </span>
            }
          />
          <FieldRow
            label="Konto-ID"
            value={user?.id}
            mono
            action={
              <button
                onClick={copyId}
                className="shrink-0 flex size-6 items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {copiedId
                  ? <CheckIcon className="size-3.5" strokeWidth={2.5} />
                  : <CopyIcon className="size-3.5" strokeWidth={1.75} />
                }
              </button>
            }
          />
        </div>
      </Card>

      {/* Påloggingsmetoder */}
      <Card title="Påloggingsmetoder" description="Kontoer og passord koblet til profilen din">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <KeyRoundIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
              <div>
                <p className="text-[13px] font-medium text-foreground">Passord</p>
                <p className="text-[11px] text-muted-foreground">
                  {hasPassword ? "Passord aktivert" : "Ingen passord satt"}
                </p>
              </div>
            </div>
            <button
              onClick={() => goToProfileSettings()}
              className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {hasPassword ? "Endre" : "Legg til"}
            </button>
          </div>

          {user?.email && (
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <AtSignIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
                <div>
                  <p className="text-[13px] font-medium text-foreground">E-postadresse</p>
                  <p className="text-[11px] text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => goToProfileSettings()}
                className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Administrer
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Tema */}
      <Card title="Utseende" description="Velg fargetema for dashboardet">
        <div className="flex gap-2">
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-2 rounded-lg border py-4 text-[12px] font-medium transition-all",
                theme === value
                  ? "border-foreground bg-foreground text-background [&_svg]:text-background"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:bg-muted/60 hover:text-foreground [&_svg]:text-muted-foreground",
              )}
            >
              <Icon className="size-5" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      </Card>

    </div>
  );
}
