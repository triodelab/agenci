import { useAtomValue, useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { api, setWidgetContactSessionId } from "@/lib/api";
import { useWidgetDisplayTitle } from "@/lib/widget-display-title";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  conversationIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
  widgetSettingsAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

type InitStep = "org" | "session" | "settings" | "done";

export const WidgetLoadingScreen = ({
  organizationId,
  agentId,
}: {
  organizationId: string | null;
  agentId: string | null;
}) => {
  const [step, setStep] = useState<InitStep>("org");
  const [sessionValid, setSessionValid] = useState(false);
  const widgetTitle = useWidgetDisplayTitle();

  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setWidgetSettings = useSetAtom(widgetSettingsAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const setAgentId = useSetAtom(agentIdAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(
    conversationIdAtomFamily(organizationId || ""),
  );
  const savedConversationId = useAtomValue(
    conversationIdAtomFamily(organizationId || ""),
  );

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || ""),
  );

  // Step 1: Validate organization
  useEffect(() => {
    if (step !== "org") return;

    setLoadingMessage("Verifiserer organisasjon…");

    if (!organizationId) {
      setErrorMessage("Organisasjons-ID er påkrevd");
      setScreen("error");
      return;
    }

    api.public.organizations
      .validate({ organizationId })
      .then((result) => {
        if (result.valid) {
          setOrganizationId(organizationId);
          setAgentId(agentId);
          setStep("session");
        } else {
          setErrorMessage(result.reason || "Ugyldig konfigurasjon");
          setScreen("error");
        }
      })
      .catch(() => {
        setErrorMessage("Kunne ikke verifisere organisasjonen");
        setScreen("error");
      });
  }, [
    step,
    organizationId,
    agentId,
    setErrorMessage,
    setScreen,
    setOrganizationId,
    setAgentId,
    setLoadingMessage,
  ]);

  // Step 2: Validate contact session (if one is saved locally)
  useEffect(() => {
    if (step !== "session") return;

    setLoadingMessage("Validerer økt…");

    if (!contactSessionId) {
      setSessionValid(false);
      setStep("settings");
      return;
    }

    setWidgetContactSessionId(contactSessionId);
    api.public.contactSessions
      .validate({ contactSessionId })
      .then((result) => {
        setSessionValid(result.valid);
        setStep("settings");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("settings");
      });
  }, [step, contactSessionId, setLoadingMessage]);

  // Step 3: Load widget settings
  useEffect(() => {
    if (step !== "settings" || !organizationId) return;

    setLoadingMessage("Laster widget-innstillinger…");

    api.public.widgetSettings
      .getByOrganizationId({
        organizationId,
        ...(agentId ? { agentId } : {}),
      })
      .then((settings) => {
        setWidgetSettings(settings);
        setStep("done");
      })
      .catch(() => {
        setWidgetSettings(null);
        setStep("done");
      });
  }, [step, organizationId, agentId, setWidgetSettings, setLoadingMessage]);

  useEffect(() => {
    if (step !== "done") return;

    const hasValidSession = Boolean(contactSessionId && sessionValid);

    if (!hasValidSession || !organizationId || !contactSessionId) {
      setScreen("auth");
      return;
    }

    // No booking/voice configured yet (Task 4.3) — straight to chat.
    // Conversation history lives in Mastra's thread memory; the thread id
    // just needs to be stable across messages, so generate one locally.
    setConversationId(savedConversationId ?? crypto.randomUUID());
    setScreen("chat");
  }, [
    step,
    contactSessionId,
    sessionValid,
    organizationId,
    savedConversationId,
    setConversationId,
    setScreen,
  ]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 pb-6 pt-1 font-semibold">
          <p className="text-center text-[15px] font-semibold tracking-tight">
            {widgetTitle}
          </p>
          <p className="text-3xl">Hei! 👋</p>
          <p className="text-lg">La oss komme i gang</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage || "Laster…"}</p>
      </div>
    </>
  );
};
