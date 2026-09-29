import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api";
import { getQueryClient } from "@/router";

export type WidgetCustomizationData = Awaited<
  ReturnType<typeof client.private.widgetCustomization.get>
>;
export type WidgetCustomization = WidgetCustomizationData["saved"];
export type WidgetAppearanceDraft = NonNullable<
  WidgetCustomization["appearance"]
>;

const key = (agentId: string) => ["widget-customization", agentId] as const;

export function useWidgetCustomizationQuery(agentId: string) {
  return useQuery({
    queryKey: key(agentId),
    queryFn: () => client.private.widgetCustomization.get({ agentId }),
  });
}

export function useSaveWidgetCustomizationMutation(agentId: string) {
  return useMutation({
    mutationFn: (settings: WidgetCustomization) =>
      client.private.widgetCustomization.save({ agentId, settings }),
    onSuccess: (data) => {
      getQueryClient().setQueryData(key(agentId), data);
      toast.success("Widgeten er oppdatert — endringene er live på nettsiden.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Kunne ikke lagre endringene",
      );
    },
  });
}

export type WidgetSitePreview = Awaited<
  ReturnType<typeof client.private.widgetCustomization.site>
>;

/**
 * The agent's real website (from onboarding) for the live preview — live
 * iframe when the site allows it, otherwise a fresh screenshot.
 */
export function useWidgetSiteQuery(
  agentId: string,
  device: "desktop" | "mobile",
) {
  return useQuery({
    queryKey: ["widget-site", agentId, device],
    queryFn: () => client.private.widgetCustomization.site({ agentId, device }),
    // Shorter than the preview session so a cached link is never a dead one.
    staleTime: 10 * 60 * 1000,
  });
}

/** Fetch a brand-new preview (new session, fresh frameability check). */
export async function reloadWidgetSite(agentId: string, device: "desktop" | "mobile") {
  const fresh = await client.private.widgetCustomization.site({ agentId, device, refresh: true });
  getQueryClient().setQueryData(["widget-site", agentId, device], fresh);
  return fresh;
}
