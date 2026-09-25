import {
  mergeWidgetAppearance,
  widgetAppearanceToRootStyle,
  widgetAppearanceToStandaloneStyle,
} from "@workspace/ui/lib/widget-appearance";
import { useAtomValue } from "jotai";
import { lazy, useEffect } from "react";
import {
  screenAtom,
  widgetSettingsAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen";
import { WidgetChatScreen } from "@/modules/widget/ui/screens/widget-chat-screen";
import { WidgetErrorScreen } from "@/modules/widget/ui/screens/widget-error-screen";
import { WidgetLoadingScreen } from "@/modules/widget/ui/screens/widget-loading-screen";
import { WidgetBranding } from "../components/widget-branding";
import { WidgetContactScreen } from "../screens/widget-contact-screen";
import { WidgetVoiceScreen } from "../screens/widget-voice-screen";

// Still on legacy Convex (not yet ported to apps/server — booking moves to MCP).
// Lazy so their Convex imports never load unless someone navigates there.
const WidgetSelectionScreen = lazy(() =>
  import("../screens/widget-selection-screen").then((m) => ({
    default: m.WidgetSelectionScreen,
  })),
);
const WidgetInboxScreen = lazy(() =>
  import("../screens/widget-inbox-screen").then((m) => ({
    default: m.WidgetInboxScreen,
  })),
);
const WidgetBookingScreen = lazy(() =>
  import("../screens/widget-booking-screen").then((m) => ({
    default: m.WidgetBookingScreen,
  })),
);

interface Props {
  organizationId: string | null;
  agentId?: string | null;
  standalone?: boolean;
}

export const WidgetView = ({
  organizationId,
  agentId,
  standalone = false,
}: Props) => {
  const screen = useAtomValue(screenAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const appearance = mergeWidgetAppearance(
    widgetSettings?.appearance ?? undefined,
  );
  const baseStyle = standalone
    ? widgetAppearanceToStandaloneStyle(appearance)
    : widgetAppearanceToRootStyle(appearance);
  // The customer's brand font applies to the whole widget, including bot
  // replies (which otherwise use Agenci's own voice font, --font-bot-voice).
  const rootStyle = appearance.fontFamily
    ? {
        ...baseStyle,
        fontFamily: appearance.fontFamily,
        ["--font-bot-voice" as string]: appearance.fontFamily,
      }
    : baseStyle;

  /**
   * Handshake for embedders (e.g. dashboard's live preview iframe): identifies
   * this frame as the real Agenci widget so the parent can tell it apart from
   * some other local dev server that happens to be squatting the same port.
   * Sent immediately and repeated briefly in case the parent's listener
   * attaches a beat after this frame's first paint.
   */
  useEffect(() => {
    if (window.parent === window) return;
    const send = () =>
      window.parent.postMessage(
        { type: "agenci-widget-handshake", organizationId },
        "*",
      );
    send();
    const id = window.setInterval(send, 500);
    const stop = window.setTimeout(() => window.clearInterval(id), 3000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [organizationId]);

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
    loading: (
      <WidgetLoadingScreen
        organizationId={organizationId}
        agentId={agentId ?? null}
      />
    ),
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
      <div className="flex min-h-0 flex-1 flex-col">
        {screenComponents[screen]}
      </div>
      <WidgetBranding />
    </main>
  );
};
