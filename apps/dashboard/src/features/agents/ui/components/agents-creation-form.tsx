import { BotIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { useAgentDraftStore } from "@/features/agents/store/agent-draft-store";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";

const createAgentFormSchema = z.object({
  name: z.string().trim().min(1, "Navn er påkrevd"),
  description: z.string().trim().min(1, "Beskrivelse er påkrevd"),
});

type AgentsCreationFormProps = {
  className?: string;
  onCancel?: () => void;
  /** Called after draft is saved to the global store (no backend create). */
  onContinue?: () => void;
};

function fieldErrorMessage(errors: unknown[]): string | null {
  const first = errors[0];
  if (!first) return null;
  if (typeof first === "string") return first;
  if (
    typeof first === "object" &&
    first !== null &&
    "message" in first &&
    typeof (first as { message: unknown }).message === "string"
  ) {
    return (first as { message: string }).message;
  }
  return null;
}

export default function AgentsCreationForm({
  className,
  onCancel,
  onContinue,
}: AgentsCreationFormProps) {
  const draft = useAgentDraftStore((s) => s.draft);
  const setDraft = useAgentDraftStore((s) => s.setDraft);

  const form = useForm({
    defaultValues: {
      name: draft?.name ?? "",
      description: draft?.description ?? "",
    },
    validators: {
      onChange: createAgentFormSchema,
    },
    onSubmit: ({ value }) => {
      setDraft(value);
      onContinue?.();
    },
  });

  return (
    <form
      className={cn("space-y-5", className)}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="space-y-1.5">
        <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
          <BotIcon className="size-4 text-foreground" strokeWidth={1.75} />
        </div>
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
          Ny agent
        </h2>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Gi agenten et navn og beskriv hva den skal hjelpe kundene med. Du
          fullfører oppsettet i neste steg (nettside → kunnskapsbase).
        </p>
      </div>

      <form.Field name="name">
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors);
          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Navn</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="F.eks. Kundestøtte"
                autoComplete="off"
                aria-invalid={!!error}
                className="h-10 rounded-xl"
              />
              {field.state.meta.isTouched && error ? (
                <p className="text-[12px] font-medium text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field name="description">
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors);
          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Beskrivelse</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Hva skal denne agenten brukes til?"
                aria-invalid={!!error}
                className="min-h-[96px] resize-y rounded-xl"
              />
              {field.state.meta.isTouched && error ? (
                <p className="text-[12px] font-medium text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe
        selector={(state) =>
          [state.canSubmit, state.isSubmitting, state.values] as const
        }
      >
        {([canSubmit, isSubmitting, values]) => {
          const ready =
            values.name.trim().length > 0 &&
            values.description.trim().length > 0;

          return (
            <div className="flex items-center justify-end gap-2 pt-1">
              {onCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={isSubmitting}
                  onClick={onCancel}
                >
                  Avbryt
                </Button>
              ) : null}
              <Button
                type="submit"
                className="rounded-xl"
                disabled={isSubmitting || !canSubmit || !ready}
              >
                Fortsett
              </Button>
            </div>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
