"use client";

import { useOrganization } from "@clerk/nextjs";
import { useState } from "react";
import {
  CopyIcon,
  ExternalLinkIcon,
  LockIcon,
  CheckIcon,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { DashboardAccentButton } from "@/modules/dashboard/ui/components/dashboard-accent";
import { IntegrationId, INTEGRATIONS } from "../../constants";
import { createScript } from "../../utils";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";

// ─── Platform card descriptions ───────────────────────────────────────────────

const PLATFORM_META: Record<IntegrationId, string> = {
  html: "Lim inn i <body>",
  react: "Root-komponent",
  nextjs: "layout.tsx",
  javascript: "Ingen rammeverk",
};

// ─── Coming soon integrations ─────────────────────────────────────────────────

type ComingSoonIntegration = {
  id: string;
  name: string;
  category: string;
  logo: string | null;
  color: string;
  letter?: string;
};

const COMING_SOON: ComingSoonIntegration[] = [
  { id: "hubspot",  name: "HubSpot",         category: "CRM",            logo: "/brands/hubspot.svg",  color: "#FF7A59" },
  { id: "shopify",  name: "Shopify",          category: "E-handel",       logo: "/brands/shopify.svg",  color: "#96BF48" },
  { id: "stripe",   name: "Stripe",           category: "Betaling",       logo: "/brands/stripe.svg",   color: "#635BFF" },
  { id: "gmail",    name: "Gmail",            category: "E-post",         logo: "/brands/gmail.svg",    color: "#EA4335" },
  { id: "slack",    name: "Slack",            category: "Meldinger",      logo: null, color: "#4A154B", letter: "S" },
  { id: "zapier",   name: "Zapier",           category: "Automatisering", logo: null, color: "#FF4A00", letter: "Z" },
  { id: "zendesk",  name: "Zendesk",          category: "Support",        logo: null, color: "#03363D", letter: "Z" },
  { id: "teams",    name: "Microsoft Teams",  category: "Meldinger",      logo: null, color: "#464EB8", letter: "T" },
];

// ─── Main view ────────────────────────────────────────────────────────────────

export const IntegrationsView = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<IntegrationId | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState("");
  const [copied, setCopied] = useState(false);
  const { organization } = useOrganization();

  const handlePlatformClick = (integrationId: IntegrationId) => {
    if (!organization) {
      toast.error("Fant ikke organisasjon. Sjekk at du er innlogget med riktig team.");
      return;
    }
    const snippet = createScript(integrationId, organization.id);
    setSelectedPlatform(integrationId);
    setSelectedSnippet(snippet);
    setDialogOpen(true);
  };

  const handleCopyOrgId = async () => {
    try {
      await navigator.clipboard.writeText(organization?.id ?? "");
      setCopied(true);
      toast.success("Kopiert til utklippstavlen");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kunne ikke kopiere. Prøv å markere og kopiere manuelt.");
    }
  };

  return (
    <>
      <IntegrationsDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setSelectedPlatform(null);
        }}
        snippet={selectedSnippet}
      />

      <DashboardPageShell>
        <DashboardPageHeader
          kicker="Integrasjoner"
          title="Koble chatten til systemene dine"
          description="Legg til chat-widgeten på nettsiden din på under 2 minutter. Velg rammeverk og lim inn én kodelinje."
        />

        {/* ── Embed setup ───────────────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">

          {/* Org ID panel */}
          <div className="dash-panel-glass flex flex-col gap-6 p-6 md:p-7 xl:col-span-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Organisasjons-ID
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Denne IDen kobler widgeten til riktig konto.
              </p>
            </div>

            <div className="rounded-[10px] border border-border/60 bg-muted/40 px-3.5 py-3 font-mono text-[13px] text-foreground break-all select-all">
              {organization?.id ?? <span className="text-muted-foreground/50">Laster…</span>}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyOrgId}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-[8px] border px-3 text-[13px] font-medium transition-all duration-150",
                  copied
                    ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                    : "border-border/70 bg-muted/40 text-foreground hover:bg-muted/70",
                )}
              >
                {copied ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
                {copied ? "Kopiert" : "Kopier ID"}
              </button>

              <DashboardAccentButton
                className="h-8 gap-1.5 rounded-[8px] px-3 text-[13px]"
                disabled={!organization}
                onClick={() => {
                  if (!organization) return;
                  window.open(
                    getWidgetPreviewUrl(organization.id),
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                size="sm"
                type="button"
              >
                <ExternalLinkIcon className="size-3.5" />
                Forhåndsvis widget
              </DashboardAccentButton>
            </div>

            <p className="text-[12px] leading-relaxed text-muted-foreground/70 border-t border-border/40 pt-4">
              Lokalt: kjør{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">
                pnpm dev:widget
              </code>{" "}
              på port 3001.
            </p>
          </div>

          {/* Platform selector */}
          <div className="flex flex-col gap-5 xl:col-span-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Velg plattform
              </p>
              <h2 className="mt-1.5 text-[17px] font-semibold tracking-tight text-foreground">
                Innebyggingskode
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Klikk på rammeverket ditt — du får koden klar til kopiering.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {INTEGRATIONS.map((integration, i) => (
                <PlatformCard
                  key={integration.id}
                  integration={integration}
                  description={PLATFORM_META[integration.id as IntegrationId]!}
                  selected={selectedPlatform === integration.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => handlePlatformClick(integration.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Coming soon ───────────────────────────────────────────────── */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Plattformer
                </p>
                <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className="mr-1.5 inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                  Kommer snart
                </span>
              </div>
              <h2 className="mt-1.5 text-[17px] font-semibold tracking-tight text-foreground">
                Direkte integrasjoner
              </h2>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                Vi jobber med å koble Agenci direkte til CRM, e-handel og support-verktøy. Gi oss beskjed om hvilke du ønsker først.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {COMING_SOON.map((integration, i) => (
              <ComingSoonCard
                key={integration.id}
                integration={integration}
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </div>
      </DashboardPageShell>
    </>
  );
};

// ─── Platform card ────────────────────────────────────────────────────────────

function PlatformCard({
  integration,
  description,
  selected,
  onClick,
  style,
}: {
  integration: (typeof INTEGRATIONS)[number];
  description: string;
  selected: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(
        "dash-integration-orb group relative flex flex-col items-center justify-center gap-3 p-5 text-center",
        "animate-[fadeSlideUp_0.35s_ease_both]",
        selected && "border-primary/50 bg-primary/5 dark:bg-primary/10",
      )}
    >
      {selected && (
        <span className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-primary">
          <CheckIcon className="size-2.5 text-white" strokeWidth={2.5} />
        </span>
      )}
      <span className="transition-transform duration-200 group-hover:scale-[1.08]">
        <Image
          alt={integration.title}
          height={36}
          src={integration.icon}
          width={36}
          className="drop-shadow-sm"
        />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold tracking-tight text-foreground">
          {integration.title}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {description}
        </span>
      </span>
    </button>
  );
}

// ─── Coming soon card ─────────────────────────────────────────────────────────

function ComingSoonCard({
  integration,
  style,
}: {
  integration: ComingSoonIntegration;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className="dash-integration-orb group relative flex flex-col items-center justify-center gap-3 p-5 text-center opacity-60 transition-opacity duration-200 hover:opacity-80 animate-[fadeSlideUp_0.35s_ease_both] cursor-default"
    >
      {/* Lock overlay */}
      <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full border border-border/60 bg-muted/60">
        <LockIcon className="size-2.5 text-muted-foreground" strokeWidth={2} />
      </span>

      {/* Icon */}
      <span>
        {integration.logo ? (
          <Image
            alt={integration.name}
            height={36}
            src={integration.logo}
            width={36}
            className="grayscale"
          />
        ) : (
          <span
            className="flex size-9 items-center justify-center rounded-[10px] text-[18px] font-bold text-white"
            style={{ backgroundColor: integration.color }}
          >
            {integration.letter ?? integration.name[0]}
          </span>
        )}
      </span>

      {/* Text */}
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold tracking-tight text-foreground">
          {integration.name}
        </span>
        <span className="text-[11px] text-muted-foreground/70">
          {integration.category}
        </span>
      </span>
    </div>
  );
}

// ─── Embed dialog ─────────────────────────────────────────────────────────────

export const IntegrationsDialog = ({
  open,
  onOpenChange,
  snippet,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  snippet: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Kopiert til utklippstavlen");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kunne ikke kopiere. Prøv å markere koden og bruke Ctrl+C / Cmd+C.");
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="dashboard-app-shell gap-0 overflow-hidden rounded-2xl border border-border/80 bg-card p-0 text-card-foreground shadow-2xl sm:max-w-lg">
        <DialogHeader className="border-b border-border/50 bg-muted/20 px-6 py-5 text-left">
          <DialogTitle className="text-[16px] font-semibold tracking-tight">
            Legg chatten på nettsiden
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
            Lim inn script-taggen én gang — vanligvis rett før{" "}
            <code className="rounded bg-muted px-1 py-px font-mono text-[11px] text-foreground">
              &lt;/body&gt;
            </code>{" "}
            eller i rot-layout i rammeverket ditt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          {/* Step 1 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                1
              </span>
              <span className="text-[13px] font-medium text-foreground">Kopier koden</span>
            </div>
            <div className="group relative">
              <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap break-all rounded-[10px] border border-border/60 bg-muted/40 p-4 pr-12 font-mono text-[12px] leading-relaxed text-foreground">
                {snippet}
              </pre>
              <button
                type="button"
                aria-label="Kopier innebyggingskode"
                onClick={handleCopy}
                className={cn(
                  "absolute right-3 top-3 flex size-8 items-center justify-center rounded-[8px] border transition-all duration-150",
                  copied
                    ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                    : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {copied ? (
                  <CheckIcon className="size-3.5" strokeWidth={2.5} />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted border border-border/60 text-[10px] font-bold text-muted-foreground">
                2
              </span>
              <span className="text-[13px] font-medium text-foreground">Publiser og test</span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Etter deploy: sjekk at chat-knappen vises og test en kort samtale. Bruk{" "}
              <span className="font-medium text-foreground">Forhåndsvis widget</span> for å teste lokalt først.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
