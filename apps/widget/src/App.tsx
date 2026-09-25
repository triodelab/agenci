import { useMemo } from "react";
import { usePreviewBridge } from "@/lib/preview-bridge";
import { WidgetView } from "@/modules/widget/ui/views/widget-view";
import { WidgetMissingOrg } from "@/widget-missing-org";

export function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const organizationId = params.get("organizationId")?.trim() ?? null;
  const agentId = params.get("agentId")?.trim() ?? null;
  const preview =
    params.get("preview") === "1" || params.get("preview") === "true";
  const playground =
    preview ||
    params.get("playground") === "1" ||
    params.get("playground") === "true";
  usePreviewBridge(preview);

  if (!organizationId) {
    return (
      <div className="box-border flex min-h-screen w-full items-center justify-center bg-background p-4">
        <WidgetMissingOrg />
      </div>
    );
  }

  if (playground) {
    return (
      <div className="h-[100dvh] w-full overflow-hidden bg-background">
        <WidgetView organizationId={organizationId} agentId={agentId} />
      </div>
    );
  }

  // Standalone new-tab — fill the full viewport
  return (
    <div style={{ width: "100dvw", height: "100dvh", overflow: "hidden" }}>
      <WidgetView
        organizationId={organizationId}
        agentId={agentId}
        standalone
      />
    </div>
  );
}
