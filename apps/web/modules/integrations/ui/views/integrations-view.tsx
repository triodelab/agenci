"use client";

import { useOrganization } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { CopyIcon, ExternalLinkIcon, LockIcon } from "lucide-react";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";
import { toast } from "sonner";
import { DashboardAccentButton } from "@/modules/dashboard/ui/components/dashboard-accent";
import { DashboardPageShell } from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { IntegrationId, INTEGRATIONS } from "../../constants";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useState } from "react";
import { createScript } from "../../utils";

export const IntegrationsView = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState("");
  const { organization } = useOrganization();

  const handleIntegrationClick = (integrationId: IntegrationId) => {
    if (!organization) {
      toast.error("Organization ID not found");
      return;
    }

    const snippet = createScript(integrationId, organization.id);
    setSelectedSnippet(snippet);
    setDialogOpen(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(organization?.id ?? "");
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <>
      <IntegrationsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        snippet={selectedSnippet}
      />
      <DashboardPageShell>
        <header className="dash-page-header-accent mb-10 space-y-3 sm:mb-12">
          <p className="dash-page-kicker">Integrasjoner</p>
          <h1 className="dash-page-title">Setup &amp; innebygging</h1>
          <p className="dash-page-desc dash-page-desc-wide">
            Kobler nettsiden til samme organisasjon som i dashbordet. Velg rammeverk under for
            ferdig snippet — eller kopier org-ID til egen integrasjon.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:gap-10">
          <div className="dash-panel-glass space-y-6 p-7 md:p-8 xl:col-span-5">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Organisasjons-ID
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Samme ID brukes i widget-scriptet og i test-URL.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Label className="sr-only" htmlFor="organization-id">
                  Organization ID
                </Label>
                <Input
                  disabled
                  id="organization-id"
                  readOnly
                  value={organization?.id ?? ""}
                  className="h-11 rounded-xl border-border/80 bg-muted/30 font-mono text-[13px] text-foreground"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="gap-2 rounded-xl"
                  onClick={handleCopy}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <CopyIcon className="size-4" />
                  Kopier ID
                </Button>
                <DashboardAccentButton
                  className="gap-2 rounded-xl"
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
                  <ExternalLinkIcon className="size-4" />
                  Åpne widget
                </DashboardAccentButton>
              </div>
            </div>
            <p className="border-border/60 border-t pt-5 text-[13px] leading-relaxed text-muted-foreground">
              Lokalt: kjør <strong className="text-foreground">pnpm dev:widget</strong> (port
              3001). «Åpne widget» legger på{" "}
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                ?organizationId=
              </code>{" "}
              automatisk.
            </p>
          </div>

          <div className="flex flex-col gap-6 xl:col-span-7">
            <div className="space-y-2">
              <p className="dash-page-kicker">Velg plattform</p>
              <h2 className="text-[17px] font-semibold tracking-tight text-foreground sm:text-lg">
                Innebyggingskode
              </h2>
              <p className="max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                Ett trykk åpner dialog med script-tag klar til liming. Fungerer i ren HTML eller
                i layout-komponent i React/Next.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {INTEGRATIONS.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => handleIntegrationClick(integration.id)}
                  type="button"
                  className="dash-integration-orb group min-h-[8.5rem] text-foreground"
                >
                  <span className="dash-integration-orb-icon transition-transform duration-200 group-hover:scale-[1.04]">
                    <Image
                      alt={integration.title}
                      height={40}
                      src={integration.icon}
                      width={40}
                    />
                  </span>
                  <span className="font-semibold text-[14px] tracking-tight">
                    {integration.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="dash-panel-glass space-y-6 p-7 md:p-8 xl:col-span-12">
            <div className="space-y-1">
              <p className="dash-page-kicker">Veikart</p>
              <h2 className="text-[17px] font-semibold tracking-tight text-foreground sm:text-lg">
                Flere datakilder
              </h2>
              <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                Typiske kilder fra e-post, netthandel og CRM. Ikke aktive ennå — her er
                retningen slik at produktet føles komplett og gjennomtenkt.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  { name: "Gmail", hint: "Vedlegg og tråder som kunnskap" },
                  { name: "Shopify", hint: "Produkt- og ordredata" },
                  { name: "Stripe", hint: "Faktura og kundestatus" },
                  { name: "HubSpot", hint: "CRM-synk" },
                ] as const
              ).map((row) => (
                <div
                  className="flex min-h-[5.5rem] items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3"
                  key={row.name}
                >
                  <div className="min-w-0 text-left">
                    <p className="font-medium text-[14px] text-foreground">{row.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{row.hint}</p>
                  </div>
                  <Badge className="shrink-0 gap-1 text-[10px]" variant="secondary">
                    <LockIcon className="size-3" />
                    Kommer
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardPageShell>
    </>
  );
};

export const IntegrationsDialog = ({
  open,
  onOpenChange,
  snippet,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  snippet: string;
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="dashboard-app-shell gap-0 overflow-hidden rounded-2xl border border-border/80 bg-card p-0 text-card-foreground shadow-2xl sm:max-w-lg">
        <DialogHeader className="border-border/60 border-b bg-muted/25 px-6 py-5 text-left">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            Integrate with your website
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            Follow these steps to add the chatbox to your website
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          <div className="space-y-3">
            <div className="rounded-xl bg-muted/50 px-3 py-2 font-medium text-[13px] text-foreground">
              1. Copy the following code
            </div>
            <div className="group relative">
              <pre className="max-h-[300px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-xl border border-border bg-muted/50 p-4 font-mono text-[12px] leading-relaxed text-foreground">
                {snippet}
              </pre>
              <Button
                className="absolute top-3 right-3 size-9 rounded-lg opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                onClick={handleCopy}
                size="icon"
                variant="secondary"
              >
                <CopyIcon className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl bg-muted/50 px-3 py-2 font-medium text-[13px] text-foreground">
              2. Add the code in your page
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed">
              Paste the chatbox code above in your page. You can add it in the HTML head section.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
