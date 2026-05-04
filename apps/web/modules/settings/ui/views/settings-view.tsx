"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import { Download, Shield, User, ExternalLink } from "lucide-react";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";

/* ─── Section wrapper ────────────────────────────────────────────── */

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-muted">
          <Icon className="size-4 text-foreground" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-foreground">{title}</p>
          {description && (
            <p className="text-[12px] text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-b-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium text-foreground">{value}</span>
    </div>
  );
}

/* ─── Main view ──────────────────────────────────────────────────── */

function formatTs(ts: number) {
  return new Date(ts).toLocaleString("no-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SettingsView() {
  const { user } = useUser();
  const exportData = useQuery(api.users.getExportData);
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!exportData) return;
    setExporting(true);
    try {
      const readable = {
        eksportert: formatTs(exportData.exportedAt),
        bruker: {
          navn: exportData.user.name,
          epost: exportData.user.email,
        },
        organisasjonId: exportData.organizationId,
        agenter: exportData.agents.map((a) => ({
          navn: a.name,
          opprettet: formatTs(a.createdAt),
        })),
        samtaler: {
          totalt: exportData.conversations.length,
          uløste: exportData.conversations.filter((c) => c.status === "unresolved").length,
          eskalerte: exportData.conversations.filter((c) => c.status === "escalated").length,
          løste: exportData.conversations.filter((c) => c.status === "resolved").length,
          liste: exportData.conversations.map((c) => ({
            status: c.status,
            opprettet: formatTs(c.createdAt),
          })),
        },
        merknad:
          "Selve samtaleinnholdet (meldinger) er ikke inkludert her av sikkerhetshensyn. Kontakt post@triodelab.no for fullstendig utlevering.",
      };

      const blob = new Blob([JSON.stringify(readable, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agenci-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data lastet ned.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardPageShell contentClassName="max-w-2xl">
      <DashboardPageHeader
        kicker="Konto"
        title="Innstillinger"
        description="Administrer kontoen din og personverninnstillinger."
      />

      <div className="mt-8 space-y-4">
        {/* Profile */}
        <Section icon={User} title="Profil" description="Informasjon fra din konto">
          <div>
            <Row label="Navn" value={user?.fullName ?? "—"} />
            <Row
              label="E-post"
              value={user?.primaryEmailAddress?.emailAddress ?? "—"}
            />
            <Row
              label="Konto opprettet"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("no-NO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"
              }
            />
          </div>
          <p className="mt-4 text-[12px] text-muted-foreground">
            For å endre navn eller e-post, bruk kontomeny-ikonet øverst til høyre i dashboardet.
          </p>
        </Section>

        {/* Privacy / data export */}
        <Section
          icon={Shield}
          title="Personvern og data"
          description="GDPR — dine rettigheter etter personvernforordningen"
        >
          <div className="space-y-4">
            <div>
              <p className="text-[13px] font-medium text-foreground">Last ned mine data</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Last ned en kopi av dataene vi har lagret om deg og din organisasjon (GDPR artikkel 20
                — dataportabilitet). Filen inneholder profil, samtaler og agenter i JSON-format.
              </p>
              <button
                type="button"
                onClick={handleExport}
                disabled={!exportData || exporting}
                className="mt-3 inline-flex items-center gap-2 rounded-[8px] border border-border bg-muted px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
              >
                <Download className="size-4" strokeWidth={1.75} />
                {exporting ? "Laster ned..." : "Last ned mine data"}
              </button>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-[13px] font-medium text-foreground">Andre rettigheter</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                For forespørsler om innsyn, retting eller sletting av spesifikke data (f.eks.
                samtalehistorikk), kontakt oss på{" "}
                <a
                  href="mailto:post@triodelab.no"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  post@triodelab.no
                </a>{" "}
                med emnet «Personvern». Vi svarer innen én arbeidsdag.
              </p>
            </div>
          </div>
        </Section>

        {/* Delete account — via Clerk */}
        <Section
          icon={ExternalLink}
          title="Slett konto"
          description="Permanent fjerning av din brukerkonto"
        >
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Kontosletting gjøres via kontoinnstillingene øverst til høyre i dashboardet: klikk på
            profilbildet ditt → <strong className="font-medium text-foreground">Manage account</strong> →{" "}
            <strong className="font-medium text-foreground">Security</strong> →{" "}
            <strong className="font-medium text-foreground">Delete account</strong>. Slettingen fjerner
            din brukerkonto og tilhørende personopplysninger automatisk fra hele systemet.
          </p>
          <p className="mt-3 text-[12px] text-muted-foreground">
            For full datarens av hele organisasjonen (samtaler, agenter, filer), ta kontakt på{" "}
            <a
              href="mailto:post@triodelab.no"
              className="text-primary underline-offset-2 hover:underline"
            >
              post@triodelab.no
            </a>
            .
          </p>
        </Section>
      </div>
    </DashboardPageShell>
  );
}
