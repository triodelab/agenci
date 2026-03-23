"use client";

import { use } from "react";

import { WidgetView } from "@/modules/widget/ui/views/widget-view";
import { WidgetMissingOrg } from "./widget-missing-org";

interface Props {
  searchParams: Promise<{
    organizationId?: string;
  }>;
}

const Page = ({ searchParams }: Props) => {
  const params = use(searchParams);
  const organizationId = params.organizationId?.trim() ?? null;

  if (!organizationId) {
    return <WidgetMissingOrg />;
  }

  return <WidgetView organizationId={organizationId} />;
};

export default Page;
