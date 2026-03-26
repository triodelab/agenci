"use client";

import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { useAction, useMutation, useQuery } from "convex/react";
import { ChevronDownIcon, Wand2Icon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputButton,
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
import { Form, FormField } from "@workspace/ui/components/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils";
import { ConversationStatusButton } from "../components/conversation-status-button";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

const messageBubbleClass =
  "max-w-[min(100%,44rem)] rounded-xl border border-border/50 bg-muted/25 px-4 py-2.5 text-[13px] leading-relaxed shadow-none sm:text-[14px] " +
  "group-[.is-user]:border-border/60 group-[.is-user]:bg-foreground group-[.is-user]:text-background";

export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) => {
  const conversation = useQuery(api.private.conversations.getOne, {
    conversationId,
  });

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId ? { threadId: conversation.threadId } : "skip",
    { initialNumItems: 10 },
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
  } = useInfiniteScroll({
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

  const [isEnhancing, setIsEnhancing] = useState(false);
  const enhanceResponse = useAction(api.private.messages.enhanceResponse);
  const handleEnhanceResponse = async () => {
    setIsEnhancing(true);
    const currentValue = form.getValues("message");

    try {
      const response = await enhanceResponse({ prompt: currentValue });

      form.setValue("message", response);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const createMessage = useMutation(api.private.messages.create);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMessage({
        conversationId,
        prompt: values.message,
      });

      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const updateConversationStatus = useMutation(
    api.private.conversations.updateStatus,
  );
  const handleToggleStatus = async () => {
    if (!conversation) {
      return;
    }

    setIsUpdatingStatus(true);

    let newStatus: "unresolved" | "resolved" | "escalated";

    if (conversation.status === "unresolved") {
      newStatus = "escalated";
    } else if (conversation.status === "escalated") {
      newStatus = "resolved";
    } else {
      newStatus = "unresolved";
    }

    try {
      await updateConversationStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (
    conversation === undefined ||
    conversation === null ||
    messages.status === "LoadingFirstPage"
  ) {
    return <ConversationIdViewLoading />;
  }

  const contact = conversation.contactSession;
  if (!contact) {
    return <ConversationIdViewLoading />;
  }
  const country = getCountryFromTimezone(contact.metadata?.timezone);
  const countryBadgeUrl = country?.code
    ? getCountryFlagUrl(country.code)
    : undefined;

  const meta = contact.metadata;
  const detailRows: { label: string; value: string }[] = [];
  if (meta?.timezone) {
    detailRows.push({ label: "Tidssone", value: meta.timezone });
  }
  if (meta?.language) {
    detailRows.push({ label: "Språk", value: meta.language });
  }
  if (meta?.currentUrl) {
    detailRows.push({ label: "Side", value: meta.currentUrl });
  }
  if (meta?.referrer) {
    detailRows.push({ label: "Henvisning", value: meta.referrer });
  }
  if (meta?.screenResolution) {
    detailRows.push({ label: "Skjerm", value: meta.screenResolution });
  }
  if (meta?.viewportSize) {
    detailRows.push({ label: "Viewport", value: meta.viewportSize });
  }
  if (meta?.platform) {
    detailRows.push({ label: "Plattform", value: meta.platform });
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <header className="shrink-0 border-border/60 border-b bg-card/55 backdrop-blur-md supports-[backdrop-filter]:bg-card/45 dark:bg-card/35">
        <div className="mx-auto flex w-full max-w-[min(100%,72rem)] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-3.5">
          <Collapsible
            className="min-w-0 flex-1"
            onOpenChange={setContactDetailsOpen}
            open={contactDetailsOpen}
          >
            <div className="flex gap-3 sm:gap-4">
              <DicebearAvatar
                badgeImageUrl={countryBadgeUrl}
                className="shrink-0"
                seed={contact._id}
                size={44}
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <h1 className="break-words text-base font-semibold tracking-tight text-foreground sm:text-lg">
                      {contact.name}
                    </h1>
                    <p className="break-all text-sm leading-snug text-muted-foreground">
                      {contact.email}
                    </p>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button
                      className="h-8 shrink-0 gap-1.5 text-xs"
                      type="button"
                      variant="outline"
                    >
                      <ChevronDownIcon
                        className={cn(
                          "size-3.5 transition-transform duration-200",
                          contactDetailsOpen && "rotate-180",
                        )}
                      />
                      {contactDetailsOpen ? "Skjul" : "Detaljer"}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  {detailRows.length > 0 ? (
                    <dl className="grid gap-x-6 gap-y-2 border-t border-border/60 pt-3 text-sm sm:grid-cols-2">
                      {detailRows.map((row) => (
                        <div className="min-w-0" key={row.label}>
                          <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            {row.label}
                          </dt>
                          <dd className="mt-0.5 break-all font-medium text-foreground">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="border-t border-border/60 pt-3 text-sm text-muted-foreground">
                      Ingen ekstra enhets- eller besøksdata er registrert for denne
                      samtalen.
                    </p>
                  )}
                </CollapsibleContent>
              </div>
            </div>
          </Collapsible>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">
            <ConversationStatusButton
              disabled={isUpdatingStatus}
              onClick={handleToggleStatus}
              status={conversation.status}
            />
            <Button
              asChild
              className="h-9 px-4 text-[13px] font-medium"
              size="sm"
              variant="outline"
            >
              <Link href="/conversations">Lukk</Link>
            </Button>
          </div>
        </div>
      </header>

      <AIConversation className="min-h-0 flex-1 bg-transparent">
        <AIConversationContent className="px-0 py-0">
          <div className="mx-auto w-full max-w-[min(100%,56rem)] px-3 py-4 sm:px-5 sm:py-5 md:px-6">
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              ref={topElementRef}
            />
            <div className="space-y-5">
              {toUIMessages(messages.results ?? [])?.map((message) => (
                <AIMessage
                  className="[&>div]:max-w-[min(96%,52rem)]"
                  key={message.id}
                  from={message.role === "user" ? "assistant" : "user"}
                >
                  <AIMessageContent className={messageBubbleClass}>
                    <AIResponse>{message.content}</AIResponse>
                  </AIMessageContent>
                  {message.role === "user" && (
                    <DicebearAvatar
                      seed={conversation.contactSessionId ?? "user"}
                      size={32}
                      className="shrink-0"
                    />
                  )}
                </AIMessage>
              ))}
            </div>
          </div>
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>

      <div className="shrink-0 border-border/60 border-t bg-card/50 px-3 py-3 backdrop-blur-md sm:px-5 dark:bg-card/30">
        <Form {...form}>
          <AIInput
            className="mx-auto w-full max-w-[min(100%,56rem)] rounded-xl border border-border/70 bg-card/95 p-2 shadow-md dark:bg-card/80"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              disabled={conversation?.status === "resolved"}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  className="min-h-[44px] text-[13px] placeholder:text-muted-foreground/70"
                  disabled={
                    conversation?.status === "resolved" ||
                    form.formState.isSubmitting ||
                    isEnhancing
                  }
                  onChange={field.onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "Samtalen er avsluttet"
                      : "Skriv et svar…"
                  }
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar className="px-1 pb-1">
              <AIInputTools>
                <AIInputButton
                  disabled={
                    conversation?.status === "resolved" ||
                    isEnhancing ||
                    !form.formState.isValid
                  }
                  onClick={handleEnhanceResponse}
                >
                  <Wand2Icon className="size-4" />
                  {isEnhancing ? "Enhancing…" : "Enhance"}
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit
                disabled={
                  conversation?.status === "resolved" ||
                  !form.formState.isValid ||
                  form.formState.isSubmitting ||
                  isEnhancing
                }
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </div>
  );
};

export const ConversationIdViewLoading = () => {
  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <header className="flex shrink-0 items-center justify-between gap-4 border-border/60 border-b bg-card/55 px-4 py-3 backdrop-blur-md dark:bg-card/35">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="h-9 w-20 rounded-lg" />
      </header>
      <div className="min-h-0 flex-1 bg-transparent px-4 py-8 sm:px-5">
        <div className="mx-auto w-full max-w-[min(100%,56rem)] space-y-4">
          {Array.from({ length: 6 }, (_, index) => {
            const isUser = index % 2 === 0;
            const widths = ["w-48", "w-60", "w-72"];
            const width = widths[index % widths.length];

            return (
              <div
                className={cn(
                  "flex w-full items-end gap-2",
                  isUser ? "justify-end" : "justify-start",
                )}
                key={index}
              >
                <Skeleton
                  className={cn("h-10 rounded-lg", width, !isUser && "order-2")}
                />
                {isUser ? (
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-border/60 border-t bg-card/50 px-4 py-4 backdrop-blur-md sm:px-5 dark:bg-card/30">
        <Skeleton className="mx-auto h-24 w-full max-w-[min(100%,56rem)] rounded-xl" />
      </div>
    </div>
  );
};
