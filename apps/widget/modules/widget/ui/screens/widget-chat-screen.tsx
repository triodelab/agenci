"use client";

import { AISuggestion, AISuggestions } from "@workspace/ui/components/ai/suggestion";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { Button } from "@workspace/ui/components/button";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useWidgetDisplayTitle } from "@/lib/widget-display-title";
import {
  contactSessionIdAtomFamily,
  conversationIdAtomFamily,
  organizationIdAtom,
  screenAtom,
  widgetSettingsAtom,
} from "../../atoms/widget-atoms";
import { useAction, useQuery } from "convex/react";
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
  message: z.string().min(1, "Message is required"),
});

export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const setConversationId = useSetAtom(
    conversationIdAtomFamily(organizationId || ""),
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
  const [isAwaitingAssistant, setIsAwaitingAssistant] = useState(false);

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

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
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
        >
          <MenuIcon />
        </Button>
      </WidgetHeader>
      <AIConversation className="min-h-0 min-w-0 flex-1 bg-[var(--widget-bg,#fff)]">
        <AIConversationContent className="px-3 pb-2 pt-1 sm:px-4">
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            loadMoreText="Last tidligere meldinger"
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? [])?.map((message) => {
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
          {isAwaitingAssistant ? (
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
      {toUIMessages(messages.results ?? [])?.length === 1 && (
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
              className="size-10 shrink-0 rounded-xl"
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
