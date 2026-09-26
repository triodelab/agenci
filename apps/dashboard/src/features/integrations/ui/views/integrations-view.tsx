import { useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  LockIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { authClient } from "@/lib/auth-client";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";
import {
  DashboardPageHeader,
  DashboardPageShell,
} from "@/features/dashboard/ui/dashboard-page-shell";
import { INTEGRATIONS, type IntegrationId } from "../../constants";
import { createScript } from "../../utils";

const PLATFORM_META: Record<IntegrationId, string> = {
  html: "Lim inn i <body>",
  react: "Root-komponent",
  nextjs: "layout.tsx",
  javascript: "Ingen rammeverk",
};

type ComingSoonIntegration = {
  id: string;
  name: string;
  category: string;
  color: string;
  letter: string;
};

const COMING_SOON: ComingSoonIntegration[] = [
  { id: "hubspot", name: "HubSpot", category: "CRM", color: "#FF7A59", letter: "H" },
  { id: "shopify", name: "Shopify", category: "E-handel", color: "#96BF48", letter: "S" },
  { id: "stripe", name: "Stripe", category: "Betaling", color: "#635BFF", letter: "S" },
  { id: "gmail", name: "Gmail", category: "E-post", color: "#EA4335", letter: "G" },
  { id: "slack", name: "Slack", category: "Meldinger", color: "#4A154B", letter: "S" },
  { id: "zapier", name: "Zapier", category: "Automatisering", color: "#FF4A00", letter: "Z" },
  { id: "zendesk", name: "Zendesk", category: "Support", color: "#03363D", letter: "Z" },
  { id: "teams", name: "Microsoft Teams", category: "Meldinger", color: "#464EB8", letter: "T" },
];

export function IntegrationsView({ agentId }: { agentId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] =
    useState<IntegrationId | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState("");
  const [copied, setCopied] = useState(false);
  const { data: organization } = authClient.useActiveOrganization();

  const handlePlatformClick = (integrationId: IntegrationId) => {
    if (!organization) {
      toast.error(
        "Fant ikke organisasjon. Sjekk at du er innlogget med riktig team.",
      );
      return;
    }
    setSelectedPlatform(integrationId);
    setSelectedSnippet(createScript(integrationId, organization.id, agentId));
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
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedPlatform(null);
        }}
        snippet={selectedSnippet}
      />

      <DashboardPageShell>
        <DashboardPageHeader
          kicker="Integrasjoner"
          title="Koble chatten til systemene dine"
          description="Legg til chat-widgeten på nettsiden din på under 2 minutter. Velg rammeverk og lim inn én kodelinje."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
          <div className="dash-panel-glass flex flex-col gap-6 p-6 md:p-7 xl:col-span-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Organisasjons-ID
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Denne IDen kobler widgeten til riktig konto.
              </p>
            </div>

            <div className="rounded-[10px] border border-border/60 bg-muted/40 px-3.5 py-3 font-mono text-[13px] break-all text-foreground select-all">
              {organization?.id ?? (
                <span className="text-muted-foreground/50">Laster…</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleCopyOrgId()}
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

              <Button
                className="h-8 gap-1.5 rounded-[8px] px-3 text-[13px] font-semibold"
                disabled={!organization}
                onClick={() => {
                  if (!organization) return;
                  window.open(
                    getWidgetPreviewUrl(organization.id, { agentId }),
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                size="sm"
                type="button"
              >
                <ExternalLinkIcon className="size-3.5" />
                Forhåndsvis widget
              </Button>
            </div>

            <p className="border-t border-border/40 pt-4 text-[12px] leading-relaxed text-muted-foreground/70">
              Lokalt: kjør{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">
                bun dev:widget
              </code>{" "}
              på port 3001.
            </p>
          </div>

          <div className="flex flex-col gap-5 xl:col-span-8">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
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
              {INTEGRATIONS.map((integration, index) => (
                <PlatformCard
                  key={integration.id}
                  integration={integration}
                  description={PLATFORM_META[integration.id] ?? ""}
                  selected={selectedPlatform === integration.id}
                  style={{ animationDelay: `${index * 60}ms` }}
                  onClick={() => handlePlatformClick(integration.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14">
          <div className="mb-6 flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Plattformer
                </p>
                <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-primary" />
                  Kommer snart
                </span>
              </div>
              <h2 className="mt-1.5 text-[17px] font-semibold tracking-tight text-foreground">
                Direkte integrasjoner
              </h2>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                Vi jobber med å koble Agenci direkte til CRM, e-handel og
                support-verktøy. Gi oss beskjed om hvilke du ønsker først.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {COMING_SOON.map((integration, index) => (
              <ComingSoonCard
                key={integration.id}
                integration={integration}
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))}
          </div>
        </div>
      </DashboardPageShell>
    </>
  );
}

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
      {selected ? (
        <span className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-primary">
          <CheckIcon className="size-2.5 text-white" strokeWidth={2.5} />
        </span>
      ) : null}
      <span
        className="flex size-9 items-center justify-center rounded-[10px] text-[13px] font-bold text-white"
        style={{
          backgroundColor: integration.color,
          color: integration.id === "javascript" ? "#111" : "#fff",
        }}
      >
        {integration.letter}
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
      className="dash-integration-orb group relative flex cursor-default flex-col items-center justify-center gap-3 p-5 text-center opacity-60 transition-opacity duration-200 animate-[fadeSlideUp_0.35s_ease_both] hover:opacity-80"
    >
      <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full border border-border/60 bg-muted/60">
        <LockIcon className="size-2.5 text-muted-foreground" strokeWidth={2} />
      </span>
      <span
        className="flex size-9 items-center justify-center rounded-[10px] text-[18px] font-bold text-white"
        style={{ backgroundColor: integration.color }}
      >
        {integration.letter}
      </span>
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

function IntegrationsDialog({
  open,
  onOpenChange,
  snippet,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  snippet: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Kopiert til utklippstavlen");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(
        "Kunne ikke kopiere. Prøv å markere koden og bruke Ctrl+C / Cmd+C.",
      );
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
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                1
              </span>
              <span className="text-[13px] font-medium text-foreground">
                Kopier koden
              </span>
            </div>
            <div className="group relative">
              <pre className="max-h-[220px] overflow-auto rounded-[10px] border border-border/60 bg-muted/40 p-4 pr-12 font-mono text-[12px] leading-relaxed break-all whitespace-pre-wrap text-foreground">
                {snippet}
              </pre>
              <button
                type="button"
                aria-label="Kopier innebyggingskode"
                onClick={() => void handleCopy()}
                className={cn(
                  "absolute top-3 right-3 flex size-8 items-center justify-center rounded-[8px] border transition-all duration-150",
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

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted text-[10px] font-bold text-muted-foreground">
                2
              </span>
              <span className="text-[13px] font-medium text-foreground">
                Publiser og test
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Etter deploy: sjekk at chat-knappen vises og test en kort samtale.
              Bruk{" "}
              <span className="font-medium text-foreground">
                Forhåndsvis widget
              </span>{" "}
              for å teste lokalt først.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
