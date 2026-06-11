"use client";

import { useAtomValue } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  mergeWidgetAppearance,
  widgetAppearanceToRootStyle,
  widgetAppearanceToStandaloneStyle,
} from "@workspace/ui/lib/widget-appearance";
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen";
import { screenAtom, widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetErrorScreen } from "@/modules/widget/ui/screens/widget-error-screen";
import { WidgetLoadingScreen } from "@/modules/widget/ui/screens/widget-loading-screen";
import { WidgetSelectionScreen } from "@/modules/widget/ui/screens/widget-selection-screen";
import { WidgetChatScreen } from "@/modules/widget/ui/screens/widget-chat-screen";
import { WidgetInboxScreen } from "../screens/widget-inbox-screen";
import { WidgetVoiceScreen } from "../screens/widget-voice-screen";
import { WidgetContactScreen } from "../screens/widget-contact-screen";
import { WidgetBookingScreen } from "../screens/widget-booking-screen";
import { WidgetBranding } from "../components/widget-branding";

interface Props {
  organizationId: string | null;
  agentId?: string | null;
  standalone?: boolean;
}

export const WidgetView = ({ organizationId, agentId, standalone = false }: Props) => {
  const searchParams = useSearchParams();
  const embedPlayground =
    searchParams.get("playground") === "1" ||
    searchParams.get("playground") === "true";

  const screen = useAtomValue(screenAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const appearance = mergeWidgetAppearance(widgetSettings?.appearance ?? undefined);
  const rootStyle = standalone
    ? widgetAppearanceToStandaloneStyle(appearance)
    : widgetAppearanceToRootStyle(appearance);

  // Dynamically load the brand font if one was extracted from the customer's domain
  useEffect(() => {
    const font = appearance.fontFamily;
    if (!font) return;
    const name = font.replace(/['"]/g, "").split(",")[0]?.trim();
    if (!name) return;
    const id = `widget-brand-font-${name.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }, [appearance.fontFamily]);

  useEffect(() => {
    if (!widgetSettings || window.parent === window) return;
    window.parent.postMessage(
      {
        type: "bubble-config",
        payload: {
          color: appearance.bubbleButtonColor,
          iconColor: appearance.bubbleButtonIconColor,
          size: appearance.bubbleButtonSize,
        },
      },
      "*",
    );
  }, [widgetSettings]);

  const screenComponents = {
    loading: <WidgetLoadingScreen organizationId={organizationId} agentId={agentId ?? null} />,
    error: <WidgetErrorScreen />,
    auth: <WidgetAuthScreen />,
    voice: <WidgetVoiceScreen />,
    inbox: <WidgetInboxScreen />,
    selection: <WidgetSelectionScreen />,
    chat: <WidgetChatScreen />,
    contact: <WidgetContactScreen />,
    booking: <WidgetBookingScreen />,
  };

  return (
    <main
      className="flex h-full min-h-0 w-full flex-col overflow-hidden"
      style={rootStyle}
    >
      <div className="flex min-h-0 flex-1 flex-col">{screenComponents[screen]}</div>
      <WidgetBranding />
    </main>
  );
};
