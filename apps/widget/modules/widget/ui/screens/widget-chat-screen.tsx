"use client";

import { AISuggestion, AISuggestions } from "@workspace/ui/components/ai/suggestion";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { Button } from "@workspace/ui/components/button";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon, MenuIcon, ExternalLinkIcon } from "lucide-react";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useWidgetDisplayTitle } from "@/lib/widget-display-title";
import {
  contactSessionIdAtomFamily,
  conversationIdAtomFamily,
  organizationIdAtom,
  screenAtom,
  sessionIsAnonymousAtomFamily,
  widgetSettingsAtom,
} from "../../atoms/widget-atoms";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Form, FormField } from "@workspace/ui/components/form";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { useMemo, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

const formSchema = z.object({
  message: z.string().min(1, "Skriv en melding"),
});

export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const setConversationId = useSetAtom(
    conversationIdAtomFamily(organizationId || ""),
  );
  const setContactSessionId = useSetAtom(
    contactSessionIdAtomFamily(organizationId || ""),
  );

  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const widgetTitle = useWidgetDisplayTitle();
  const conversationId = useAtomValue(
    conversationIdAtomFamily(organizationId || ""),
  );
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const onBack = () => {
    setConversationId(null);
    setScreen("selection");
  };

  const suggestions = useMemo(() => {
    if (!widgetSettings) {
      return [];
    }

    return Object.keys(widgetSettings.defaultSuggestions).map((key) => {
      return widgetSettings.defaultSuggestions[
        key as keyof typeof widgetSettings.defaultSuggestions
      ];
    });
  }, [widgetSettings]);

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        } 
      : "skip"
  );

  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : "skip",
    { initialNumItems: 10 },
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const createMessage = useAction(api.public.messages.create);
  const deleteMySession = useMutation(api.public.contactSessions.deleteMySession);
  const updateIdentity = useMutation(api.public.contactSessions.updateIdentity);
  const [isAwaitingAssistant, setIsAwaitingAssistant] = useState(false);
  const uiMessages = useMemo(
    () => toUIMessages(messages.results ?? []).filter((m) => m.content?.trim()),
    [messages.results],
  );
  // While an action is in-flight, collapse consecutive trailing assistant messages
  // into just the last one — prevents double bubbles from multi-step tool call sequences.
  const displayMessages = useMemo(() => {
    if (!isAwaitingAssistant) return uiMessages;
    let i = uiMessages.length - 1;
    while (i > 0 && uiMessages[i]?.role === "assistant" && uiMessages[i - 1]?.role === "assistant") {
      i--;
    }
    if (i === uiMessages.length - 1) return uiMessages;
    return [...uiMessages.slice(0, i), uiMessages[uiMessages.length - 1]!];
  }, [uiMessages, isAwaitingAssistant]);
  const lastUiMessage = uiMessages[uiMessages.length - 1];
  const showTypingIndicator = isAwaitingAssistant && lastUiMessage?.role !== "assistant";
  const sessionIsAnonymous = useAtomValue(
    sessionIsAnonymousAtomFamily(organizationId || "")
  );
  const setSessionIsAnonymous = useSetAtom(
    sessionIsAnonymousAtomFamily(organizationId || "")
  );
  const [showPrivacyPanel, setShowPrivacyPanel] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [identityName, setIdentityName] = useState("");
  const [identityEmail, setIdentityEmail] = useState("");
  const [isIdentitySubmitting, setIsIdentitySubmitting] = useState(false);
  const [identityDismissed, setIdentityDismissed] = useState(false);

  const showIdentityBanner = sessionIsAnonymous && !identityDismissed;

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSessionId || !identityName.trim() || !identityEmail.trim()) return;
    setIsIdentitySubmitting(true);
    try {
      await updateIdentity({
        contactSessionId,
        name: identityName.trim(),
        email: identityEmail.trim(),
      });
      setSessionIsAnonymous(false);
      setIdentityDismissed(true);
      setShowIdentityForm(false);
    } finally {
      setIsIdentitySubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId) {
      return;
    }

    form.reset();
    setIsAwaitingAssistant(true);
    try {
      await createMessage({
        threadId: conversation.threadId,
        prompt: values.message,
        contactSessionId,
      });
    } finally {
      setIsAwaitingAssistant(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!contactSessionId) return;
    setIsDeleting(true);
    try {
      await deleteMySession({ contactSessionId });
    } catch {
      // best-effort; clear local state regardless
    } finally {
      setContactSessionId(null);
      setConversationId(null);
      setIsDeleting(false);
      setShowPrivacyPanel(false);
      setScreen("auth");
    }
  };

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <WidgetHeader className="flex w-full min-w-0 shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-x-2">
          <Button
            className="shrink-0"
            onClick={onBack}
            size="icon"
            variant="transparent"
          >
            <ArrowLeftIcon />
          </Button>
          <p className="min-w-0 flex-1 truncate text-left font-semibold">
            {widgetTitle}
          </p>
        </div>
        <Button
          className="shrink-0"
          size="icon"
          variant="transparent"
          onClick={() => setShowPrivacyPanel(true)}
          aria-label="Personvern og innstillinger"
        >
          <MenuIcon />
        </Button>
      </WidgetHeader>

      {/* Action sheet */}
      {showPrivacyPanel && (
        <div className="absolute inset-0 z-10 flex flex-col justify-end">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.32)" }}
            onClick={() => setShowPrivacyPanel(false)}
          />
          <div className="relative z-10 mx-2 mb-2 flex flex-col gap-2">
            {/* Actions */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{ backgroundColor: "var(--widget-bg, #fff)" }}
            >
              <button
                type="button"
                onClick={handleDeleteHistory}
                disabled={isDeleting}
                className="w-full px-4 py-[15px] text-[15px] font-normal text-red-500 transition-opacity active:opacity-50 disabled:opacity-40"
              >
                {isDeleting ? "Sletter…" : "Slett min historikk"}
              </button>
              <div style={{ height: "0.5px", backgroundColor: "var(--widget-input-border, #e4e4e7)" }} />
              <a
                href="https://agenci.no/personvern"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between px-4 py-[15px] text-[15px] transition-opacity active:opacity-50"
                style={{ color: "var(--widget-input-text, #18181b)" }}
              >
                Personvernerklæring
                <ExternalLinkIcon className="size-3.5 opacity-35" />
              </a>
            </div>
            {/* Cancel */}
            <button
              type="button"
              onClick={() => setShowPrivacyPanel(false)}
              className="w-full rounded-2xl px-4 py-[15px] text-[15px] font-semibold transition-opacity active:opacity-50"
              style={{
                backgroundColor: "var(--widget-bg, #fff)",
                color: "var(--widget-input-text, #18181b)",
              }}
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
      <AIConversation className="min-h-0 min-w-0 flex-1 bg-[var(--widget-bg,#fff)]">
        <AIConversationContent className="px-3 pb-2 pt-1 sm:px-4">
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            loadMoreText="Last tidligere meldinger"
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {displayMessages.map((message) => {
            return (
              <AIMessage
                from={message.role === "user" ? "user" : "assistant"}
                key={message.id}
              >
                <AIMessageContent
                  className={cn(
                    message.role === "user"
                      ? "!border-transparent !bg-[var(--widget-bubble-user-bg)] !text-[var(--widget-bubble-user-text)] dark:!bg-[var(--widget-bubble-user-bg)] dark:!text-[var(--widget-bubble-user-text)]"
                      : "!border-[var(--widget-input-border)]/80 !bg-[var(--widget-bubble-assistant-bg)] !text-[var(--widget-bubble-assistant-text)] dark:!border-[var(--widget-input-border)]/80 dark:!bg-[var(--widget-bubble-assistant-bg)] dark:!text-[var(--widget-bubble-assistant-text)]",
                  )}
                >
                  <AIResponse>{message.content}</AIResponse>
                </AIMessageContent>
                {message.role === "assistant" && (
                  <DicebearAvatar
                    imageUrl="/AgenciLogo.png"
                    seed="assistant"
                    size={32}
                  />
                )}
              </AIMessage>
            )
          })}
          {showTypingIndicator ? (
            <AIMessage from="assistant" key="__typing">
              <AIMessageContent
                className={cn(
                  "!border-[var(--widget-input-border)]/80 !bg-[var(--widget-bubble-assistant-bg)] !text-[var(--widget-bubble-assistant-text)] dark:!border-[var(--widget-input-border)]/80 dark:!bg-[var(--widget-bubble-assistant-bg)] dark:!text-[var(--widget-bubble-assistant-text)]",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="sr-only">Skriver</span>
                  <span className="inline-flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        aria-hidden
                        className="inline-block size-1.5 rounded-full bg-current opacity-80 motion-safe:animate-bounce"
                        key={i}
                        style={{ animationDelay: `${i * 0.14}s` }}
                      />
                    ))}
                  </span>
                </span>
              </AIMessageContent>
              <DicebearAvatar
                imageUrl="/AgenciLogo.png"
                seed="assistant"
                size={32}
              />
            </AIMessage>
          ) : null}
        </AIConversationContent>
      </AIConversation>
      {uiMessages.length === 1 && (
        <AISuggestions className="flex w-full flex-col items-end gap-1.5 px-3 pb-2 sm:px-4">
          {suggestions.map((suggestion) => {
            if (!suggestion) {
              return null;
            }

            return (
              <AISuggestion
                key={suggestion}
                onClick={() => {
                  form.setValue("message", suggestion, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                  form.handleSubmit(onSubmit)();
                }}
                suggestion={suggestion}
              />
            )
          })}
        </AISuggestions>
      )}
      {showIdentityBanner && (
        <div
          className="shrink-0 border-t border-[var(--widget-input-border)] px-3 py-2.5"
          style={{ backgroundColor: "var(--widget-input-bg, #fff)" }}
        >
          {!showIdentityForm ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] leading-snug" style={{ color: "var(--widget-input-placeholder, #8a8f98)" }}>
                Legg til kontaktinfo for å motta bekreftelser
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowIdentityForm(true)}
                  className="rounded-lg px-2.5 py-1 text-[12px] font-semibold transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--widget-header-bg, #5e6ad2)",
                    color: "var(--widget-header-text, #fff)",
                  }}
                >
                  Legg til
                </button>
                <button
                  type="button"
                  onClick={() => setIdentityDismissed(true)}
                  className="text-[12px] transition-opacity hover:opacity-60"
                  style={{ color: "var(--widget-input-placeholder, #8a8f98)" }}
                  aria-label="Lukk"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => void handleIdentitySubmit(e)} className="flex flex-col gap-1.5">
              <input
                type="text"
                placeholder="Ditt navn"
                value={identityName}
                onChange={(e) => setIdentityName(e.target.value)}
                required
                className="h-9 w-full rounded-lg border px-3 text-[13px] outline-none focus:ring-1"
                style={{
                  backgroundColor: "var(--widget-bg, #fff)",
                  borderColor: "var(--widget-input-border, #e4e4e7)",
                  color: "var(--widget-input-text, #18181b)",
                }}
              />
              <input
                type="email"
                placeholder="din@epost.no"
                value={identityEmail}
                onChange={(e) => setIdentityEmail(e.target.value)}
                required
                className="h-9 w-full rounded-lg border px-3 text-[13px] outline-none focus:ring-1"
                style={{
                  backgroundColor: "var(--widget-bg, #fff)",
                  borderColor: "var(--widget-input-border, #e4e4e7)",
                  color: "var(--widget-input-text, #18181b)",
                }}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isIdentitySubmitting || !identityName.trim() || !identityEmail.trim()}
                  className="flex-1 rounded-lg py-1.5 text-[13px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{
                    backgroundColor: "var(--widget-header-bg, #5e6ad2)",
                    color: "var(--widget-header-text, #fff)",
                  }}
                >
                  {isIdentitySubmitting ? "Lagrer…" : "Lagre"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowIdentityForm(false)}
                  className="rounded-lg px-3 py-1.5 text-[13px] transition-opacity hover:opacity-70"
                  style={{
                    color: "var(--widget-input-placeholder, #8a8f98)",
                    border: "1px solid var(--widget-input-border, #e4e4e7)",
                  }}
                >
                  Avbryt
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      <Form {...form}>
        <AIInput
          className="flex shrink-0 flex-row items-end gap-2 divide-y-0 rounded-none border-x-0 border-b-0 border-t border-[var(--widget-input-border)] bg-[var(--widget-input-bg)] p-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="min-w-0 flex-1">
          <FormField
            control={form.control}
            disabled={
              conversation?.status === "resolved" || isAwaitingAssistant
            }
            name="message"
            render={({ field }) => (
              <AIInputTextarea
                className="!min-h-[44px] !max-h-[120px] !resize-none !bg-transparent !py-2.5 !text-[var(--widget-input-text)] placeholder:!text-[var(--widget-input-placeholder)] dark:!bg-transparent"
                disabled={
                  conversation?.status === "resolved" || isAwaitingAssistant
                }
                maxHeight={120}
                minHeight={44}
                onChange={field.onChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
                placeholder={
                  conversation?.status === "resolved"
                    ? "Samtalen er avsluttet."
                    : "Skriv en melding…"
                }
                value={field.value}
              />
            )}
          />
          </div>
          <AIInputToolbar className="shrink-0 border-0 p-0">
            <AIInputTools />
            <AIInputSubmit
              className={cn(
                "size-10 shrink-0 rounded-xl border-0 shadow-sm",
                "!bg-[var(--widget-header-bg)] !text-[var(--widget-header-text)]",
                "hover:!bg-[var(--widget-header-bg)] hover:opacity-90",
                "focus-visible:ring-2 focus-visible:ring-[var(--widget-header-text)]/25",
                "[&_svg]:text-[var(--widget-header-text)]",
              )}
              disabled={
                conversation?.status === "resolved" ||
                !form.formState.isValid ||
                isAwaitingAssistant
              }
              status={isAwaitingAssistant ? "submitted" : "ready"}
              type="submit"
            />
          </AIInputToolbar>
        </AIInput>
      </Form>
    </div>
  );
};
