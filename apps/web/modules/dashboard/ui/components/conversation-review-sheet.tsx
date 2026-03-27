"use client";

import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Textarea } from "@workspace/ui/components/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export type ConversationReviewPayload = {
  conversationId: Id<"conversations">;
  userMessage: string;
  assistantMessage: string;
  /** Visning */
  contactName?: string;
  contactEmail?: string;
  conversationStatus?: "unresolved" | "escalated" | "resolved";
  updatedAt?: number;
};

type ConversationReviewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: ConversationReviewPayload | null;
};

function statusLabel(
  s: ConversationReviewPayload["conversationStatus"],
): string {
  switch (s) {
    case "unresolved":
      return "Uavklart";
    case "escalated":
      return "Eskalert";
    case "resolved":
      return "Løst";
    default:
      return "—";
  }
}

export function ConversationReviewSheet({
  open,
  onOpenChange,
  payload,
}: ConversationReviewSheetProps) {
  const [expected, setExpected] = useState("");
  const [saving, setSaving] = useState(false);
  const save = useMutation(api.private.answerTraining.saveExample);

  useEffect(() => {
    if (open && payload) {
      setExpected("");
    }
  }, [open, payload?.conversationId, payload?.assistantMessage]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setExpected("");
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!payload?.conversationId || !expected.trim()) {
      return;
    }
    setSaving(true);
    try {
      await save({
        conversationId: payload.conversationId,
        userMessage: payload.userMessage,
        assistantMessage: payload.assistantMessage,
        expectedResponse: expected.trim(),
      });
      toast.success("Oppdatert svar er lagret.");
      handleOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Kunne ikke lagre. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet onOpenChange={handleOpenChange} open={open}>
      <SheetContent
        className="dashboard-app-shell flex w-full flex-col gap-0 overflow-hidden border-border/60 bg-background p-0 sm:max-w-xl"
        side="right"
      >
        <SheetHeader className="border-border/60 border-b bg-background px-6 py-5 text-left">
          <SheetTitle className="text-[18px] font-semibold tracking-tight">
            Review
          </SheetTitle>
          <SheetDescription className="text-[13px] leading-relaxed text-muted-foreground">
            Samme mønster som Chatbase: se kundens melding, dagens svar, og skriv
            hvordan assistenten burde svart. Brukes til kvalitet og opplæring.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-0 overflow-y-auto">
          <section className="space-y-3 px-6 py-4">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Generelt
            </p>
            <div className="grid gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 text-[13px]">
              {payload?.contactName ? (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Kontakt</span>
                  <span className="min-w-0 text-right font-medium text-foreground">
                    {payload.contactName}
                  </span>
                </div>
              ) : null}
              {payload?.contactEmail ? (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">E-post</span>
                  <span className="min-w-0 break-all text-right text-[12px] text-foreground">
                    {payload.contactEmail}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-foreground">
                  {statusLabel(payload?.conversationStatus)}
                </span>
              </div>
              {payload?.updatedAt ? (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Siste aktivitet</span>
                  <span className="tabular-nums text-foreground">
                    {formatDistanceToNow(payload.updatedAt, { addSuffix: true })}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Stemning</span>
                <span className="text-muted-foreground italic">Ikke analysert</span>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Brukermelding
              </Label>
              <Textarea
                className="min-h-[80px] resize-none rounded-xl border-border/70 bg-muted/30 text-[13px] leading-relaxed"
                readOnly
                value={payload?.userMessage ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Assistentens svar (nå)
              </Label>
              <Textarea
                className="min-h-[120px] resize-none rounded-xl border-border/70 bg-muted/30 text-[13px] leading-relaxed"
                readOnly
                value={payload?.assistantMessage ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label
                className="text-[10px] font-semibold tracking-[0.1em] text-foreground uppercase"
                htmlFor="expected-review"
              >
                Forventet svar
              </Label>
              <Textarea
                className="min-h-[160px] resize-y rounded-xl border-border/80 bg-background text-[13px] leading-relaxed"
                id="expected-review"
                onChange={(e) => setExpected(e.target.value)}
                placeholder="Skriv det korrekte / ønskede svaret her…"
                value={expected}
              />
            </div>
          </section>
        </div>

        <div className="flex shrink-0 gap-3 border-border/60 border-t bg-background px-6 py-4">
          <Button
            className="flex-1 rounded-xl"
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            Avbryt
          </Button>
          <Button
            className="flex-1 rounded-xl font-medium"
            disabled={saving || !expected.trim() || !payload}
            onClick={() => void handleSubmit()}
            type="button"
            variant="default"
          >
            {saving ? "Lagrer…" : "Oppdater svar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
