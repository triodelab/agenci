"use client";

import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { useAction, useMutation, useQuery } from "convex/react";
import { ClipboardListIcon, Wand2Icon, ChevronLeftIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConversationStatusButton } from "../components/conversation-status-button";
import {
  ConversationReviewSheet,
  type ConversationReviewPayload,
} from "../components/conversation-review-sheet";
import { ContactAvatar } from "../components/contact-avatar";
import { ContactPanel } from "../components/contact-panel";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

const formSchema = z.object({
  message: z.string().min(1, "Skriv en melding"),
});

function findPreviousUserContent(
  messages: { role: string; content: unknown }[],
  assistantIndex: number,
): string {
  for (let i = assistantIndex - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "user") {
      return typeof m.content === "string" ? m.content : String(m.content ?? "");
    }
  }
  return "";
}

export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) => {
  const router = useRouter();
  const params = useParams();
  const agentId = typeof params?.agentId === "string" ? params.agentId : undefined;
  const backUrl = agentId ? `/agents/${agentId}/conversations` : "/conversations";

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
      toast.error("Noe gikk galt. Prøv igjen.");
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

  const [playgroundTab, setPlaygroundTab] = useState<"chat" | "details">("chat");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewPayload, setReviewPayload] =
    useState<ConversationReviewPayload | null>(null);

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
  const uiMessages = toUIMessages(messages.results ?? []) ?? [];

  const buildReviewPayload = (
    assistantIndex: number,
    assistantContent: string,
  ): ConversationReviewPayload => {
    const userMsg = findPreviousUserContent(
      uiMessages as { role: string; content: unknown }[],
      assistantIndex,
    );
    return {
      conversationId,
      userMessage: userMsg || "(Ingen tidligere brukermelding i tråden)",
      assistantMessage: assistantContent,
      contactName: contact.name,
      contactEmail: contact.email,
      conversationStatus: conversation.status,
      updatedAt: conversation._creationTime,
    };
  };

  const openReview = (assistantIndex: number, assistantContent: string) => {
    setReviewPayload(buildReviewPayload(assistantIndex, assistantContent));
    setReviewOpen(true);
  };

  const openReviewFromHeader = () => {
    const msgs = uiMessages as { role: string; content: unknown }[];
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m?.role === "assistant") {
        const content =
          typeof m.content === "string" ? m.content : String(m.content ?? "");
        openReview(i, content);
        return;
      }
    }
    toast.info("Ingen assistentsvar å gjennomgå ennå.");
  };

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <Tabs
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-hidden"
        onValueChange={(v) => setPlaygroundTab(v as "chat" | "details")}
        value={playgroundTab}
      >
        <header className="shrink-0 border-border/60 border-b bg-card/95 backdrop-blur-sm">
          <div className="px-4 pt-3 sm:px-5">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Konversasjon
            </p>
          </div>
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:pt-0">
            <div className="flex min-w-0 items-center gap-3">
              {/* Back button — mobile only */}
              <button
                onClick={() => router.push(backUrl)}
                className="lg:hidden flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Tilbake"
              >
                <ChevronLeftIcon className="size-5" strokeWidth={2} />
              </button>
              <ContactAvatar name={contact.name || "?"} size={40} />
              <div className="min-w-0">
                <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground sm:text-[16px]">
                  {contact.name}
                </h1>
                <p className="truncate text-[12px] text-muted-foreground">
                  {contact.email}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <TabsList className="h-9 w-full rounded-lg border border-border/50 bg-muted/40 p-0.5 sm:w-auto lg:hidden">
                <TabsTrigger
                  className="rounded-md px-4 text-[13px] font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  value="chat"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-md px-4 text-[13px] font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  value="details"
                >
                  Detaljer
                </TabsTrigger>
              </TabsList>
              <Button
                className="h-9 gap-1.5 rounded-lg px-3 text-[13px] font-medium"
                onClick={openReviewFromHeader}
                type="button"
                variant="outline"
              >
                <ClipboardListIcon className="size-4" />
                Review
              </Button>
              <ConversationStatusButton
                disabled={isUpdatingStatus}
                onClick={handleToggleStatus}
                status={conversation.status}
              />
            </div>
          </div>
        </header>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div
            className={cn(
              "grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden",
              playgroundTab === "chat" ? "grid" : "hidden lg:grid",
            )}
          >
            <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
              <AIConversation className="dash-conversations-canvas min-h-0 min-w-0 flex-1">
                <AIConversationContent className="px-0 py-0">
                  <div className="mx-auto w-full max-w-[min(100%,40rem)] px-4 py-5 sm:px-6">
                    <InfiniteScrollTrigger
                      canLoadMore={canLoadMore}
                      isLoadingMore={isLoadingMore}
                      onLoadMore={handleLoadMore}
                      ref={topElementRef}
                    />
                    <div className="flex flex-col gap-4">
                  {uiMessages.map((message, index) => {
                    const content =
                      typeof message.content === "string"
                        ? message.content
                        : String(message.content ?? "");
                    const isUser = message.role === "user";

                    if (isUser) {
                      return (
                        <div
                          className="flex justify-end gap-2 pl-8"
                          key={message.id}
                        >
                          <div
                            className={cn(
                              "max-w-[min(100%,85%)] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm",
                              "bg-foreground text-background",
                            )}
                          >
                            <AIResponse>{content}</AIResponse>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        className="flex flex-col gap-2 pr-6 sm:pr-10"
                        key={message.id}
                      >
                        <div
                          className={cn(
                            "max-w-[min(100%,92%)] rounded-2xl border border-border/60 bg-card px-4 py-3 text-[13px] leading-relaxed text-foreground shadow-sm",
                            "dark:bg-card/80",
                          )}
                        >
                          <AIResponse>{content}</AIResponse>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 border-border/40 border-t border-dashed pt-2 pl-0.5 text-[11px] text-muted-foreground">
                          <Button
                            className="h-8 rounded-lg px-3 text-[12px] font-medium"
                            onClick={() => openReview(index, content)}
                            type="button"
                            variant="outline"
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                    </div>
                  </div>
                </AIConversationContent>
                <AIConversationScrollButton />
              </AIConversation>
            </div>

            <div className="shrink-0 border-border/60 border-t bg-background px-4 py-3">
              <Form {...form}>
              <AIInput
                className="mx-auto w-full max-w-[min(100%,40rem)] rounded-xl border border-border/70 bg-card p-2 shadow-sm"
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
                          : "Skriv et svar til kunden…"
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
                      {isEnhancing ? "Forbedrer…" : "Forbedre utkast"}
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

          <div
            className={cn(
              "flex min-h-0 shrink-0 flex-col overflow-hidden border-border/60 lg:w-[22rem] lg:min-w-[19rem] lg:border-l",
              playgroundTab === "details" ? "flex" : "hidden lg:flex",
            )}
          >
            <ContactPanel />
          </div>
        </div>
      </Tabs>

      <ConversationReviewSheet
        onOpenChange={setReviewOpen}
        open={reviewOpen}
        payload={reviewPayload}
      />
    </div>
  );
};

export const ConversationIdViewLoading = () => {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center gap-4 border-border/60 border-b bg-card/90 px-4 py-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </header>
      <div className="dash-conversations-canvas min-h-0 flex-1 px-4 py-8">
        <div className="mx-auto w-full max-w-md space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className={cn(
                "flex w-full",
                index % 2 === 0 ? "justify-start" : "justify-end",
              )}
              key={index}
            >
              <Skeleton
                className={cn(
                  "h-16 rounded-2xl",
                  index % 2 === 0 ? "w-[85%]" : "w-[70%]",
                )}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="shrink-0 border-border/60 border-t bg-card/80 px-4 py-4">
        <Skeleton className="mx-auto h-24 w-full max-w-md rounded-xl" />
      </div>
    </div>
  );
};
