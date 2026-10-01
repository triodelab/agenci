import {
  mergeWidgetAppearance,
  widgetAppearanceToRootStyle,
  widgetAppearanceToStandaloneStyle,
} from "@workspace/ui/lib/widget-appearance";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  embedFullscreenAtom,
  screenAtom,
  widgetSettingsAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen";
import { WidgetChatScreen } from "@/modules/widget/ui/screens/widget-chat-screen";
import { WidgetErrorScreen } from "@/modules/widget/ui/screens/widget-error-screen";
import { WidgetLoadingScreen } from "@/modules/widget/ui/screens/widget-loading-screen";
import { WidgetBranding } from "../components/widget-branding";
import { WidgetCloseButton } from "../components/widget-close-button";

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
  const setFullscreen = useSetAtom(embedFullscreenAtom);
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

  // The embed script says when the chat fills a phone screen.
  useEffect(() => {
    if (window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== window.parent) return;
      const data = e.data as { type?: string; value?: unknown };
      if (data?.type === "agenci:fullscreen") setFullscreen(data.value === true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setFullscreen]);

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
    chat: <WidgetChatScreen />,
  };

  return (
    <main
      className="flex h-full min-h-0 w-full flex-col overflow-hidden"
      style={rootStyle}
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        {screenComponents[screen]}
        {/* The chat header has its own; other screens get one in the corner. */}
        {screen !== "chat" ? (
          <WidgetCloseButton className="absolute right-2 top-2 z-20" />
        ) : null}
      </div>
      <WidgetBranding />
    </main>
  );
};
