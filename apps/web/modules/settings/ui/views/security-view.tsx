"use client";

import { useState } from "react";
import { useUser, useClerk, useSession } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  LockIcon, ShieldCheckIcon, KeyRoundIcon, Trash2Icon,
  MonitorIcon, SmartphoneIcon, GlobeIcon, AlertTriangleIcon,
  ExternalLinkIcon, LogOutIcon, ClockIcon, CheckCircle2Icon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

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

function SecurityRow({
  icon: Icon, title, description, status, action,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description?: string;
  status?: "ok" | "warning" | "info";
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          status === "ok" ? "bg-green-50 dark:bg-green-950/40"
            : status === "warning" ? "bg-amber-50 dark:bg-amber-950/40"
            : "bg-muted",
        )}>
          <Icon className={cn(
            "size-4",
            status === "ok" ? "text-green-600 dark:text-green-400"
              : status === "warning" ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground",
          )} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground">{title}</p>
          {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function formatDate(ts: number | Date | null | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("no-NO", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Security view ─────────────────────────────────────────────────────────────

export function SecurityView() {
  const { user } = useUser();
  const { session } = useSession();
  const { openUserProfile, signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const hasPassword = user?.passwordEnabled;
  const hasTwoFactor = user?.twoFactorEnabled;
  const lastSignIn = user?.lastSignInAt;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      toast.error("Kunne ikke logge ut. Prøv igjen.");
      setSigningOut(false);
    }
  };

  const getDeviceIcon = (deviceType: string | undefined) => {
    if (!deviceType) return MonitorIcon;
    if (deviceType.toLowerCase().includes("mobile")) return SmartphoneIcon;
    return MonitorIcon;
  };

  return (
    <div className="space-y-4">

      {/* Security status */}
      <Card title="Sikkerhetsstatus" description="Oversikt over kontosikkerhet">
        <SecurityRow
          icon={hasTwoFactor ? ShieldCheckIcon : ShieldCheckIcon}
          title="Tofaktorautentisering"
          description={hasTwoFactor ? "2FA er aktivert — kontoen din er ekstra sikret" : "2FA er ikke aktivert"}
          status={hasTwoFactor ? "ok" : "warning"}
          action={
            <button
              onClick={() => openUserProfile()}
              className="shrink-0 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {hasTwoFactor ? "Administrer" : "Aktiver 2FA"}
            </button>
          }
        />
        <SecurityRow
          icon={KeyRoundIcon}
          title="Passord"
          description={hasPassword ? "Passord er satt" : "Ingen passord — bruker kun OAuth"}
          status={hasPassword ? "ok" : "info"}
          action={
            <button
              onClick={() => openUserProfile()}
              className="shrink-0 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {hasPassword ? "Endre passord" : "Legg til passord"}
            </button>
          }
        />
        <SecurityRow
          icon={GlobeIcon}
          title="Tilkoblede kontoer"
          description={`${(user?.externalAccounts ?? []).length} OAuth-konto${(user?.externalAccounts ?? []).length !== 1 ? "er" : ""} tilkoblet`}
          status="info"
          action={
            <button
              onClick={() => openUserProfile()}
              className="shrink-0 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Administrer
            </button>
          }
        />
        <SecurityRow
          icon={ClockIcon}
          title="Siste innlogging"
          description={lastSignIn ? formatDate(lastSignIn) : "Ukjent"}
          status="info"
        />
      </Card>

      {/* Active session */}
      <Card title="Aktiv økt" description="Din nåværende innloggingsøkt">
        {session ? (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
                  <CheckCircle2Icon className="size-5 text-green-600 dark:text-green-400" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Nåværende økt</p>
                  <p className="text-[11px] text-muted-foreground">
                    Aktiv siden {formatDate(session.lastActiveAt)}
                  </p>
                  {session.expireAt && (
                    <p className="text-[11px] text-muted-foreground/60">
                      Utløper {formatDate(session.expireAt)}
                    </p>
                  )}
                </div>
              </div>
              <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                Aktiv
              </span>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-muted-foreground">Ingen aktiv økt-informasjon.</p>
        )}

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-foreground">Logg ut av alle enheter</p>
            <p className="text-[11px] text-muted-foreground">Avslutter alle aktive økter på alle enheter</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3.5 py-2 text-[12px] font-medium text-foreground hover:bg-muted/70 transition-colors disabled:opacity-50"
          >
            <LogOutIcon className="size-3.5" strokeWidth={1.75} />
            {signingOut ? "Logger ut..." : "Logg ut"}
          </button>
        </div>
      </Card>

      {/* Recent security activity */}
      <Card title="Kontooversikt" description="Registrerte detaljer om kontoen din">
        <div className="space-y-3">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <LockIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
              <p className="text-[13px] font-semibold text-foreground">Profilsikkerhet</p>
            </div>
            <div className="space-y-2">
              {[
                { label: "E-post verifisert", value: user?.primaryEmailAddress?.verification?.status === "verified" ? "Ja" : "Nei", ok: user?.primaryEmailAddress?.verification?.status === "verified" },
                { label: "Passord aktivert", value: hasPassword ? "Ja" : "Nei", ok: hasPassword },
                { label: "2FA aktivert", value: hasTwoFactor ? "Ja" : "Nei", ok: hasTwoFactor },
              ].map(({ label, value, ok }) => (
                <div key={label} className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-medium", ok ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => openUserProfile()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted/70 transition-colors"
          >
            <ExternalLinkIcon className="size-4" strokeWidth={1.75} />
            Åpne fullstendig sikkerhetssenter
          </button>
        </div>
      </Card>

      {/* Danger zone */}
      <Card title="Faresone" description="Irreversible handlinger">
        <div className="rounded-lg border border-red-200/60 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20 p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/60">
              <AlertTriangleIcon className="size-4 text-red-600 dark:text-red-400" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Slett konto</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                Sletter din brukerprofil og alle tilhørende personopplysninger permanent.
                Organisasjonsdata (agenter, samtaler) slettes ikke automatisk — kontakt oss separat.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-medium text-red-700 hover:bg-red-100 transition-colors dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              <Trash2Icon className="size-4" strokeWidth={1.75} />
              Slett konto
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-[12px] font-medium text-red-700 dark:text-red-400">
                Skriv <strong>SLETT</strong> for å bekrefte at du ønsker å slette kontoen:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="SLETT"
                className="h-9 w-full rounded-lg border border-red-200 dark:border-red-900/60 bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-shadow"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (deleteInput !== "SLETT") {
                      toast.error("Skriv «SLETT» for å bekrefte.");
                      return;
                    }
                    openUserProfile();
                    toast.info("Åpne Security → Delete account for å fullføre slettingen.");
                    setShowDeleteConfirm(false);
                    setDeleteInput("");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-100 px-4 py-2 text-[13px] font-medium text-red-700 hover:bg-red-200 transition-colors dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400 disabled:opacity-50"
                >
                  <Trash2Icon className="size-3.5" strokeWidth={1.75} />
                  Bekreft og fortsett
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted/70 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}
