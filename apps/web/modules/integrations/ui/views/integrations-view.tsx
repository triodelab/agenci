"use client";

import { useOrganization } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { CopyIcon, ExternalLinkIcon } from "lucide-react";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";
import { toast } from "sonner";
import {
  DashboardPagePanel,
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
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
            Setup & Integrations
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Koble nettsiden til chat-widgeten med organisasjons-ID og innebyggingskode.
          </p>
        </header>

        <DashboardPagePanel className="mt-8 space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Label className="shrink-0 sm:w-36" htmlFor="organization-id">
                Organization ID
              </Label>
              <Input
                disabled
                id="organization-id"
                readOnly
                value={organization?.id ?? ""}
                className="flex-1 bg-muted/40 font-mono text-sm"
              />
              <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                <Button className="gap-2" onClick={handleCopy} size="sm" type="button">
                  <CopyIcon className="size-4" />
                  Copy
                </Button>
                <Button
                  className="gap-2"
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
                  variant="default"
                >
                  <ExternalLinkIcon className="size-4" />
                  Åpne widget
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Du må ha <strong className="font-medium text-foreground">widget</strong> kjørende (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                pnpm dev:widget
              </code>
              , port 3001). Knappen åpner riktig URL med{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                ?organizationId=
              </code>{" "}
              ferdig utfylt.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Integrations</Label>
              <p className="text-muted-foreground text-sm">
                Velg plattform for å få ferdig innebyggingskode til chatboksen.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {INTEGRATIONS.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => handleIntegrationClick(integration.id)}
                  type="button"
                  className="flex items-center gap-4 rounded-xl border border-border/80 bg-background/80 p-4 text-left transition hover:border-primary/25 hover:bg-muted/50"
                >
                  <Image
                    alt={integration.title}
                    height={32}
                    src={integration.icon}
                    width={32}
                  />
                  <p className="font-medium">{integration.title}</p>
                </button>
              ))}
            </div>
          </div>
        </DashboardPagePanel>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with your website</DialogTitle>
          <DialogDescription>
            Follow these steps to add the chatbox to your website
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="rounded-md bg-accent p-2 text-sm">
              1. Copy the following code
            </div>
            <div className="group relative">
              <pre className="max-h-[300px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-md bg-foreground p-2 font-mono text-secondary text-sm">
                {snippet}
              </pre>
              <Button
                className="absolute top-4 right-6 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleCopy}
                size="icon"
                variant="secondary"
              >
                <CopyIcon className="size-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-md bg-accent p-2 text-sm">
              2. Add the code in your page
            </div>
            <p className="text-muted-foreground text-sm">
              Paste the chatbox code above in your page. You can add it in the HTML head section.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
