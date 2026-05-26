"use client";

import { use } from "react";

import { WidgetView } from "@/modules/widget/ui/views/widget-view";
import { WidgetMissingOrg } from "./widget-missing-org";

interface Props {
  searchParams: Promise<{
    organizationId?: string;
    agentId?: string;
    playground?: string;
  }>;
}

const Page = ({ searchParams }: Props) => {
  const params = use(searchParams);
  const organizationId = params.organizationId?.trim() ?? null;
  const agentId = params.agentId?.trim() ?? null;
  const playground =
    params.playground === "1" || params.playground === "true";

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
      <WidgetView organizationId={organizationId} agentId={agentId} standalone />
    </div>
  );
};

export default Page;
