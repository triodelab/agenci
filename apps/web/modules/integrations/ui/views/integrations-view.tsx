"use client";

import { useOrganization } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { CopyIcon, ExternalLinkIcon } from "lucide-react";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";
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
      <DashboardPageShell contentClassName="max-w-screen-md">
        <DashboardPageHeader
          description="Koble nettsiden til chat-widgeten med organisasjons-ID og innebyggingskode."
          kicker="Integrasjoner"
          title="Setup & Integrations"
        />

        <div className="mt-2 space-y-12">
          <div className="app-dashboard-panel space-y-5 rounded-2xl p-6 md:p-8 [&_strong]:font-medium [&_strong]:text-foreground">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  org_id
                </p>
                <Label className="sr-only" htmlFor="organization-id">
                  Organization ID
                </Label>
                <Input
                  disabled
                  id="organization-id"
                  readOnly
                  value={organization?.id ?? ""}
                  className="rounded-xl border-border bg-muted/40 font-mono text-sm text-foreground"
                />
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  className="gap-2 rounded-xl"
                  onClick={handleCopy}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <CopyIcon className="size-4" />
                  Copy
                </Button>
                <Button
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
                </Button>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Du må ha <strong>widget</strong> kjørende (
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                pnpm dev:widget
              </code>
              , port 3001). Knappen åpner riktig URL med{" "}
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                ?organizationId=
              </code>{" "}
              ferdig utfylt.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <p className="dash-page-kicker">Velg plattform</p>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Integrations
              </h2>
              <p className="max-w-md text-muted-foreground text-[13px] leading-relaxed">
                Én trykk — du får ferdig innebyggingskode til chatboksen.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {INTEGRATIONS.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => handleIntegrationClick(integration.id)}
                  type="button"
                  className="dash-integration-orb group text-foreground"
                >
                  <span className="dash-integration-orb-icon transition-transform duration-200 group-hover:scale-[1.04]">
                    <Image
                      alt={integration.title}
                      height={36}
                      src={integration.icon}
                      width={36}
                    />
                  </span>
                  <span className="font-semibold text-[14px] tracking-tight">{integration.title}</span>
                </button>
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
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-border/80 p-0 sm:max-w-lg">
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
