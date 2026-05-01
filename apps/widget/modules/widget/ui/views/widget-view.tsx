"use client";

import { useAtomValue } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@workspace/ui/lib/utils";
import {
  mergeWidgetAppearance,
  widgetAppearanceToRootStyle,
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

interface Props {
  organizationId: string | null;
}

export const WidgetView = ({ organizationId }: Props) => {
  const searchParams = useSearchParams();
  const embedPlayground =
    searchParams.get("playground") === "1" ||
    searchParams.get("playground") === "true";

  const screen = useAtomValue(screenAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const appearance = mergeWidgetAppearance(widgetSettings?.appearance ?? undefined);
  const rootStyle = widgetAppearanceToRootStyle(appearance);

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
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    error: <WidgetErrorScreen />,
    auth: <WidgetAuthScreen />,
    voice: <WidgetVoiceScreen />,
    inbox: <WidgetInboxScreen />,
    selection: <WidgetSelectionScreen />,
    chat: <WidgetChatScreen />,
    contact: <WidgetContactScreen />,
  }

  return (
    <main
      className="flex h-full min-h-0 w-full flex-col overflow-hidden"
      style={rootStyle}
    >
      {screenComponents[screen]}
    </main>
  );
};
