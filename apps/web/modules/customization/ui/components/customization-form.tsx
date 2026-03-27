import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { mergeWidgetAppearance } from "@workspace/ui/lib/widget-appearance";
import { VapiFormFields } from "./vapi-form-fields";
import { WidgetAppearanceFields } from "./widget-appearance-fields";
import type { FormSchema, WidgetCustomizationSection } from "../../types";
import { widgetSettingsSchema } from "../../schemas";
import { cn } from "@workspace/ui/lib/utils";

type WidgetSettings = Doc<"widgetSettings">;

const labelUi =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";
const inputUi =
  "rounded-lg border-border/70 bg-background text-[13px] shadow-none transition-colors focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring/20";

interface CustomizationFormProps {
  initialData?: WidgetSettings | null;
  hasVapiPlugin: boolean;
  activeSection: WidgetCustomizationSection;
}

export const CustomizationForm = ({
  initialData,
  hasVapiPlugin,
  activeSection,
}: CustomizationFormProps) => {
  const upsertWidgetSettings = useMutation(api.private.widgetSettings.upsert);

  const form = useForm<FormSchema>({
    resolver: zodResolver(widgetSettingsSchema),
    defaultValues: {
      widgetTitle:
        initialData?.widgetTitle?.trim() || "Agenci",
      greetMessage:
        initialData?.greetMessage || "Hi! How can I help you today?",
      defaultSuggestions: {
        suggestion1: initialData?.defaultSuggestions.suggestion1 || "",
        suggestion2: initialData?.defaultSuggestions.suggestion2 || "",
        suggestion3: initialData?.defaultSuggestions.suggestion3 || "",
      },
      vapiSettings: {
        assistantId: initialData?.vapiSettings.assistantId || "",
        phoneNumber: initialData?.vapiSettings.phoneNumber || "",
      },
      appearance: mergeWidgetAppearance(initialData?.appearance ?? undefined),
    },
  });

  const onSubmit = async (values: FormSchema) => {
    try {
      const vapiSettings: WidgetSettings["vapiSettings"] = {
        assistantId:
          values.vapiSettings.assistantId === "none"
            ? ""
            : values.vapiSettings.assistantId,
        phoneNumber:
          values.vapiSettings.phoneNumber === "none"
            ? ""
            : values.vapiSettings.phoneNumber,
      };

      await upsertWidgetSettings({
        widgetTitle: values.widgetTitle.trim(),
        greetMessage: values.greetMessage,
        defaultSuggestions: values.defaultSuggestions,
        vapiSettings,
        appearance: mergeWidgetAppearance(values.appearance),
      });

      form.reset(values);
      toast.success("Innstillinger lagret");
    } catch (error) {
      console.error(error);
      toast.error("Noe gikk galt");
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn(
          "flex flex-col",
          activeSection === "appearance"
            ? "min-h-0 flex-1"
            : "min-h-full",
        )}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div
          className={cn(
            "pb-28",
            activeSection === "appearance"
              ? "flex min-h-0 flex-1 flex-col px-0 py-0"
              : "flex-1 px-8 py-8",
          )}
        >
          <div
            className={cn(activeSection !== "messages" && "hidden")}
            id="widget-section-messages"
          >
            <FormField
              control={form.control}
              name="greetMessage"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelUi}>Greeting message</FormLabel>
                  <FormControl>
                    <Textarea
                      className={cn(
                        inputUi,
                        "min-h-[120px] resize-y px-3 py-3 leading-relaxed",
                      )}
                      placeholder="Welcome message shown when chat opens"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[12px] leading-relaxed">
                    The first message customers see when they open the chat.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div
            className={cn(activeSection !== "suggestions" && "hidden")}
            id="widget-section-suggestions"
          >
            <div className="space-y-6">
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                Quick reply suggestions shown to customers to guide the
                conversation. Leave blank to hide a chip.
              </p>
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="defaultSuggestions.suggestion1"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelUi}>Suggestion 1</FormLabel>
                      <FormControl>
                        <Input
                          className={cn(inputUi, "h-10 px-3")}
                          placeholder="e.g., How do I get started?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultSuggestions.suggestion2"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelUi}>Suggestion 2</FormLabel>
                      <FormControl>
                        <Input
                          className={cn(inputUi, "h-10 px-3")}
                          placeholder="e.g., What are your pricing plans?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultSuggestions.suggestion3"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={labelUi}>Suggestion 3</FormLabel>
                      <FormControl>
                        <Input
                          className={cn(inputUi, "h-10 px-3")}
                          placeholder="e.g., I need help with my account"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div
            className={cn(
              activeSection !== "appearance" && "hidden",
              activeSection === "appearance" &&
                "flex min-h-0 flex-1 flex-col",
            )}
            id="widget-section-appearance"
          >
            <WidgetAppearanceFields />
          </div>

          {hasVapiPlugin ? (
            <div
              className={cn(activeSection !== "voice" && "hidden")}
              id="widget-section-voice"
            >
              <VapiFormFields
                form={form}
                labelClassName={labelUi}
                selectTriggerClassName={cn(inputUi, "h-10 w-full px-3")}
              />
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 z-10 border-border/60 border-t bg-background px-8 py-4">
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-[12px] text-muted-foreground">
              {form.formState.isDirty ? (
                <span className="text-foreground/80">Ulagrede endringer</span>
              ) : (
                <span>Alle endringer er lagret</span>
              )}
            </p>
            <Button
              className="h-10 rounded-lg px-8 text-[13px] font-semibold sm:min-w-[160px]"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
              type="submit"
            >
              {form.formState.isSubmitting ? "Lagrer…" : "Lagre"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
