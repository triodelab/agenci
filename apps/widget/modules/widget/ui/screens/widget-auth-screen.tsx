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
  contactSessionIdAtomFamily,
  conversationIdAtomFamily,
  organizationIdAtom,
  screenAtom,
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
  const setContactSessionId = useSetAtom(
    contactSessionIdAtomFamily(organizationId || ""),
  );
  const setConversationId = useSetAtom(
    conversationIdAtomFamily(organizationId || ""),
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

  const startSession = async (name: string, email: string) => {
    if (!organizationId) return;

    const metadata: Doc<"contactSessions">["metadata"] = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(","),
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      cookieEnabled: navigator.cookieEnabled,
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

    if (playgroundEmbed) {
      const conversationId = await createConversation({
        contactSessionId,
        organizationId,
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
    await startSession("Anonym", `anon_${anonId}@widget.local`);
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 pb-6 pt-1 font-semibold">
          <p className="text-center text-[15px] font-semibold tracking-tight">
            {widgetTitle}
          </p>
          <p className="text-3xl">
            Hei! 👋
          </p>
          <p className="text-lg">
            La oss komme i gang
          </p>
        </div>
      </WidgetHeader>
      <Form {...form}>
        <form
          className="flex flex-1 flex-col gap-y-4 p-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="h-10 bg-background"
                    placeholder="f.eks. Ola Nordmann"
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
                    className="h-10 bg-background"
                    placeholder="f.eks. ola@eksempel.no"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="bg-black hover:bg-black/85 border-0 text-white"
            disabled={form.formState.isSubmitting}
            size="lg"
            type="submit"
          >
            Fortsett
          </Button>
          <button
            type="button"
            onClick={() => void onSkip()}
            disabled={form.formState.isSubmitting}
            className="text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            Hopp over — chat anonymt
          </button>
        </form>
      </Form>
    </>
  )
}