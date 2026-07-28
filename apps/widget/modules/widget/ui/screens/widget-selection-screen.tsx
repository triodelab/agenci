"use client";

import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { useAtomValue, useSetAtom } from "jotai";
import { CalendarIcon, ChevronRightIcon, MessageSquareTextIcon, MicIcon, PhoneIcon } from "lucide-react";
import { useWidgetDisplayTitle } from "@/lib/widget-display-title";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  conversationIdAtomFamily,
  errorMessageAtom,
  hasVapiSecretsAtom,
  organizationIdAtom,
  screenAtom,
  sessionIsAnonymousAtomFamily,
  widgetSettingsAtom,
} from "../../atoms/widget-atoms";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import { WidgetFooter } from "../components/widget-footer";

export const WidgetSelectionScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const setConversationId = useSetAtom(
    conversationIdAtomFamily(organizationId || ""),
  );

  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const widgetTitle = useWidgetDisplayTitle();
  const hasVapiSecrets = useAtomValue(hasVapiSecretsAtom);
  const agentId = useAtomValue(agentIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const sessionIsAnonymous = useAtomValue(
    sessionIsAnonymousAtomFamily(organizationId || "")
  );

  const createConversation = useMutation(api.public.conversations.create);
  const [isPending, setIsPending] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const handleNewConversation = async () => {
    if (!organizationId) {
      setScreen("error");
      setErrorMessage("Organisasjons-ID mangler");
      return;
    }

    if (!contactSessionId) {
      setScreen("auth");
      return;
    }

    setLimitReached(false);
    setIsPending(true);
    try {
      const conversationId = await createConversation({
        contactSessionId,
        organizationId,
        agentId: agentId ?? undefined,
      });

      setConversationId(conversationId);
      setScreen("chat");
    } catch (err: unknown) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      if (code === "LIMIT_REACHED") {
        setLimitReached(true);
      } else {
        setScreen("auth");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 pb-6 pt-1">
          <div className="flex items-center justify-center gap-2">
            {widgetSettings?.faviconUrl && (
              <img
                src={widgetSettings.faviconUrl}
                alt=""
                className="size-5 rounded-sm object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <p
              className="text-center text-[15px] font-semibold tracking-tight"
              style={{ color: "var(--widget-header-text)" }}
            >
              {widgetTitle}
            </p>
          </div>
          <p
            className="text-3xl font-semibold"
            style={{ color: "var(--widget-header-text)" }}
          >
            Hei! 👋
          </p>
          <p
            className="text-lg font-medium"
            style={{ color: "var(--widget-header-text)", opacity: 0.85 }}
          >
            La oss komme i gang
          </p>
        </div>
      </WidgetHeader>
      <div
        className="flex flex-1 flex-col gap-y-3 p-4 overflow-y-auto"
        style={{ backgroundColor: "var(--widget-bg, #fff)" }}
      >
        {limitReached ? (
          <div
            className="flex h-16 w-full items-center justify-center rounded-xl border px-4 text-[13px] opacity-40 cursor-not-allowed select-none"
            style={{
              backgroundColor: "var(--widget-input-bg, #fff)",
              borderColor: "var(--widget-input-border, #e4e4e7)",
              color: "var(--widget-input-text, #18181b)",
            }}
          >
            Chat utilgjengelig
          </div>
        ) : (
        <button
          type="button"
          className="flex h-16 w-full items-center justify-between rounded-xl border px-4 text-[14px] font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            backgroundColor: "var(--widget-input-bg, #fff)",
            borderColor: "var(--widget-input-border, #e4e4e7)",
            color: "var(--widget-input-text, #18181b)",
          }}
          onClick={handleNewConversation}
          disabled={isPending}
        >
          <div className="flex items-center gap-x-2.5">
            <MessageSquareTextIcon className="size-4 shrink-0" />
            <span>Start samtale</span>
          </div>
          <ChevronRightIcon className="size-4 shrink-0 opacity-50" />
        </button>
        )}
        {widgetSettings?.bookingEnabled && !sessionIsAnonymous && (
          <button
            type="button"
            className="flex h-16 w-full items-center justify-between rounded-xl border px-4 text-[14px] font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              backgroundColor: "var(--widget-input-bg, #fff)",
              borderColor: "var(--widget-input-border, #e4e4e7)",
              color: "var(--widget-input-text, #18181b)",
            }}
            onClick={() => setScreen("booking")}
            disabled={isPending}
          >
            <div className="flex items-center gap-x-2.5">
              <CalendarIcon className="size-4 shrink-0" />
              <span>Book time</span>
            </div>
            <ChevronRightIcon className="size-4 shrink-0 opacity-50" />
          </button>
        )}
        {hasVapiSecrets && widgetSettings?.vapiSettings?.assistantId && (
          <button
            type="button"
            className="flex h-16 w-full items-center justify-between rounded-xl border px-4 text-[14px] font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              backgroundColor: "var(--widget-input-bg, #fff)",
              borderColor: "var(--widget-input-border, #e4e4e7)",
              color: "var(--widget-input-text, #18181b)",
            }}
            onClick={() => setScreen("voice")}
            disabled={isPending}
          >
            <div className="flex items-center gap-x-2.5">
              <MicIcon className="size-4 shrink-0" />
              <span>Start talesamtale</span>
            </div>
            <ChevronRightIcon className="size-4 shrink-0 opacity-50" />
          </button>
        )}
        {hasVapiSecrets && widgetSettings?.vapiSettings?.phoneNumber && (
          <button
            type="button"
            className="flex h-16 w-full items-center justify-between rounded-xl border px-4 text-[14px] font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              backgroundColor: "var(--widget-input-bg, #fff)",
              borderColor: "var(--widget-input-border, #e4e4e7)",
              color: "var(--widget-input-text, #18181b)",
            }}
            onClick={() => setScreen("contact")}
            disabled={isPending}
          >
            <div className="flex items-center gap-x-2.5">
              <PhoneIcon className="size-4 shrink-0" />
              <span>Ring oss</span>
            </div>
            <ChevronRightIcon className="size-4 shrink-0 opacity-50" />
          </button>
        )}
      </div>
      <WidgetFooter />
    </>
  );
};
