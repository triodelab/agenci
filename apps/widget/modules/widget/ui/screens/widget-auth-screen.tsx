import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useSearchParams } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { useWidgetDisplayTitle } from "@/lib/widget-display-title";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  conversationIdAtomFamily,
  organizationIdAtom,
  screenAtom,
  sessionIsAnonymousAtomFamily,
} from "../../atoms/widget-atoms";

const formSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email("Ugyldig e-postadresse"),
});

export const WidgetAuthScreen = () => {
  const searchParams = useSearchParams();
  const playgroundEmbed =
    searchParams.get("playground") === "1" ||
    searchParams.get("playground") === "true";

  const setScreen = useSetAtom(screenAtom);
  const widgetTitle = useWidgetDisplayTitle();

  const organizationId = useAtomValue(organizationIdAtom);
  const agentId = useAtomValue(agentIdAtom);
  const setContactSessionId = useSetAtom(
    contactSessionIdAtomFamily(organizationId || ""),
  );
  const setConversationId = useSetAtom(
    conversationIdAtomFamily(organizationId || ""),
  );
  const setSessionIsAnonymous = useSetAtom(
    sessionIsAnonymousAtomFamily(organizationId || ""),
  );

  const createConversation = useMutation(api.public.conversations.create);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const createContactSession = useMutation(api.public.contactSessions.create);

  const startSession = async (name: string, email: string, anonymous = false) => {
    if (!organizationId) return;

    const metadata: Doc<"contactSessions">["metadata"] = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      referrer: document.referrer || "direct",
      currentUrl: window.location.href,
    };

    setConversationId(null);

    const contactSessionId = await createContactSession({
      name,
      email,
      organizationId,
      metadata,
    });

    setContactSessionId(contactSessionId);
    setSessionIsAnonymous(anonymous);

    if (playgroundEmbed) {
      const conversationId = await createConversation({
        contactSessionId,
        organizationId,
        agentId: agentId ?? undefined,
      });
      setConversationId(conversationId);
      setScreen("chat");
    } else {
      setScreen("selection");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await startSession(values.name, values.email);
  };

  const onSkip = async () => {
    const anonId = Math.random().toString(36).slice(2, 10);
    await startSession("Anonym", `anon_${anonId}@widget.local`, true);
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 pb-6 pt-1">
          <p
            className="text-center text-[15px] font-semibold tracking-tight"
            style={{ color: "var(--widget-header-text)" }}
          >
            {widgetTitle}
          </p>
          <p
            className="text-3xl font-semibold"
            style={{ color: "var(--widget-header-text)" }}
          >
            Hei! 👋
          </p>
          <p
            className="text-lg font-medium"
            style={{ color: "var(--widget-header-text, #fff)", opacity: 0.85 }}
          >
            La oss komme i gang
          </p>
        </div>
      </WidgetHeader>
      <Form {...form}>
        <form
          className="flex flex-1 flex-col gap-y-3 p-4"
          style={{ backgroundColor: "var(--widget-bg, #fff)" }}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="h-10 border focus-visible:ring-1"
                    style={{
                      backgroundColor: "var(--widget-input-bg, #fff)",
                      borderColor: "var(--widget-input-border, #e4e4e7)",
                      color: "var(--widget-input-text, #18181b)",
                    }}
                    placeholder="Ditt navn"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="h-10 border focus-visible:ring-1"
                    style={{
                      backgroundColor: "var(--widget-input-bg, #fff)",
                      borderColor: "var(--widget-input-border, #e4e4e7)",
                      color: "var(--widget-input-text, #18181b)",
                    }}
                    placeholder="din@epost.no"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button
            className="mt-1 h-10 w-full rounded-lg text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "var(--widget-header-bg, #5e6ad2)",
              color: "var(--widget-header-text, #fff)",
            }}
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            Fortsett
          </button>
          <button
            type="button"
            onClick={() => void onSkip()}
            disabled={form.formState.isSubmitting}
            className="text-center text-[13px] transition-opacity hover:opacity-80 underline-offset-2 hover:underline disabled:opacity-40"
            style={{ color: "var(--widget-input-placeholder, #8a8f98)" }}
          >
            Hopp over — chat anonymt
          </button>
          <p
            className="text-center text-[11px] leading-relaxed"
            style={{ color: "var(--widget-input-placeholder, #8a8f98)", opacity: 0.8 }}
          >
            Ved å fortsette godtar du at navn og e-post lagres for å håndtere din henvendelse.{" "}
            <a
              href="https://agenci.no/personvern"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Personvernerklæring
            </a>
          </p>
        </form>
      </Form>
    </>
  )
}