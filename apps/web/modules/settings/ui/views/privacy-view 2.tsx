"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import {
  Download, MailIcon, FileTextIcon, ShieldIcon,
  InfoIcon, ClockIcon, DatabaseIcon, CheckIcon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTs(ts: number) {
  return new Date(ts).toLocaleString("no-NO", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
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

function InfoBlock({ icon: Icon, title, body }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border/50 bg-muted/30 p-4">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
        <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

// ─── Privacy view ──────────────────────────────────────────────────────────────

export function PrivacyView() {
  const { user } = useUser();
  const exportData = useQuery(api.users.getExportData);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    if (!exportData) return;
    setExporting(true);
    try {
      const readable = {
        eksportert: formatTs(exportData.exportedAt),
        bruker: { navn: exportData.user.name, epost: exportData.user.email },
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
        merknad: "Selve samtaleinnholdet er ikke inkludert av sikkerhetshensyn. Kontakt post@triodelab.no for fullstendig utlevering.",
      };
      const blob = new Blob([JSON.stringify(readable, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agenci-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data lastet ned.");
      setExported(true);
      setTimeout(() => setExported(false), 4000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* Data portability */}
      <Card
        title="Dataportabilitet"
        description="GDPR artikkel 20 — Last ned en kopi av dine data"
      >
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <DatabaseIcon className="mx-auto size-5 text-muted-foreground mb-2" strokeWidth={1.5} />
            <p className="text-[11px] font-medium text-muted-foreground">Samtaler</p>
            <p className="text-[18px] font-bold text-foreground">{exportData?.conversations.length ?? "—"}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <FileTextIcon className="mx-auto size-5 text-muted-foreground mb-2" strokeWidth={1.5} />
            <p className="text-[11px] font-medium text-muted-foreground">Agenter</p>
            <p className="text-[18px] font-bold text-foreground">{exportData?.agents.length ?? "—"}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <ClockIcon className="mx-auto size-5 text-muted-foreground mb-2" strokeWidth={1.5} />
            <p className="text-[11px] font-medium text-muted-foreground">Konto opprettet</p>
            <p className="text-[13px] font-bold text-foreground">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("no-NO", { day: "numeric", month: "short", year: "numeric" })
                : "—"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
          <p className="text-[13px] font-semibold text-foreground mb-1">Last ned mine data</p>
          <p className="text-[12px] leading-relaxed text-muted-foreground mb-3">
            Filen inneholder profil, agenter og samtalestatistikk i JSON-format.
            Selve meldingsinnholdet er ikke inkludert av sikkerhetshensyn — kontakt oss for fullstendig utlevering.
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={!exportData || exporting}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-[13px] font-medium transition-colors disabled:opacity-50",
              exported
                ? "border-green-500/30 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                : "border-border bg-muted text-foreground hover:bg-muted/70",
            )}
          >
            {exported ? (
              <><CheckIcon className="size-4" strokeWidth={2.5} />Lastet ned</>
            ) : (
              <><Download className="size-4" strokeWidth={1.75} />{exporting ? "Laster ned..." : "Last ned JSON-fil"}</>
            )}
          </button>
        </div>
      </Card>

      {/* Rights overview */}
      <Card title="Dine rettigheter" description="Oversikt over GDPR-rettigheter som gjelder for deg">
        <div className="space-y-2.5">
          <InfoBlock
            icon={ShieldIcon}
            title="Artikkel 15 — Rett til innsyn"
            body="Du kan be om innsyn i alle personopplysninger vi behandler om deg. Send e-post til post@triodelab.no med emnet «Innsyn»."
          />
          <InfoBlock
            icon={FileTextIcon}
            title="Artikkel 16 — Rett til retting"
            body="Har vi feil opplysninger? Kontakt oss så retter vi dette innen én arbeidsdag."
          />
          <InfoBlock
            icon={ClockIcon}
            title="Artikkel 17 — Rett til sletting"
            body="Du kan be om sletting av dine personopplysninger. Merk at driftsrelaterte data kan beholdes i opptil 30 dager."
          />
          <InfoBlock
            icon={InfoIcon}
            title="Artikkel 21 — Rett til innsigelse"
            body="Du kan protestere mot behandlingen av dine data til markedsføring eller profilering."
          />
        </div>
      </Card>

      {/* Contact */}
      <Card title="Kontakt personvernansvarlig" description="Vi svarer innen én arbeidsdag">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              For alle personvernrelaterte forespørsler, kontakt oss på{" "}
              <a
                href="mailto:post@triodelab.no"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                post@triodelab.no
              </a>{" "}
              med emnet «Personvern». Behandlingsansvarlig: Triodelab DA, org.nr. 835796892.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="mailto:post@triodelab.no?subject=Personvern"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              <MailIcon className="size-4" strokeWidth={1.75} />
              Send e-post
            </a>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="font-semibold text-foreground">Datatilsynet:</strong>{" "}
            Dersom du mener vi behandler dine personopplysninger i strid med GDPR, har du rett til å
            klage til Datatilsynet på{" "}
            <a
              href="https://www.datatilsynet.no"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              datatilsynet.no
            </a>
            .
          </p>
        </div>
      </Card>

    </div>
  );
}
