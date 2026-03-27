"use client";

import { use } from "react";

import { WidgetView } from "@/modules/widget/ui/views/widget-view";
import { WidgetMissingOrg } from "./widget-missing-org";

interface Props {
  searchParams: Promise<{
    organizationId?: string;
    playground?: string;
  }>;
}

const centeredShell =
  "box-border flex min-h-screen w-full items-start justify-center bg-[var(--hero-bg)] p-3 sm:items-center sm:p-4 dark:bg-background";

const Page = ({ searchParams }: Props) => {
  const params = use(searchParams);
  const organizationId = params.organizationId?.trim() ?? null;
  const playground =
    params.playground === "1" || params.playground === "true";

  if (!organizationId) {
    return (
      <div className={centeredShell}>
        <WidgetMissingOrg />
      </div>
    );
  }

  if (playground) {
    return (
      <div className="h-[100dvh] w-full overflow-hidden bg-background">
        <WidgetView organizationId={organizationId} />
      </div>
    );
  }

  return (
    <div className={centeredShell}>
      <WidgetView organizationId={organizationId} />
    </div>
  );
};

export default Page;
