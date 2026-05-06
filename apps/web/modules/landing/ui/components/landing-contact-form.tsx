"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import {
  LANDING_MARKETING_PRIMARY_CTA_SHADOW_CLASS,
  LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS,
} from "@/modules/landing/constants";
import { Loader2 } from "lucide-react";

type LandingContactFormProps = {
  variant?: "dark" | "light";
  /** Ekstra klasser på ytre wrapper (f.eks. max-width) */
  className?: string;
};

const labelDark = "text-[13px] font-medium text-[#8a8f98]";
const labelLight = "text-foreground";
// Linear text-input spec: surface-1 bg, hairline border, ink text, lavender focus ring
const fieldDark =
  "h-10 rounded-[8px] border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] placeholder:text-[#62666d] focus-visible:border-[#5e6ad2] focus-visible:ring-2 focus-visible:ring-[#5e6ad2]/50 focus-visible:outline-none transition-colors";
const fieldLight =
  "border-border/80 focus-visible:border-[#5e6ad2]/55 focus-visible:ring-[3px] focus-visible:ring-[#5e6ad2]/18";

export function LandingContactForm({
  variant = "light",
  className,
}: LandingContactFormProps) {
  const isDark = variant === "dark";
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const subject = String(fd.get("subject") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const company = String(fd.get("company") ?? "").trim();

    if (!name || !email || !subject || !message) {
      toast.error("Fyll inn navn, e-post, emne og melding.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          subject,
          message,
          company,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.status === 429) {
        throw new Error(
          data.error ??
            "For mange innsendinger. Vent et øyeblikk og prøv igjen.",
        );
      }
      if (!res.ok) throw new Error(data.error ?? "Kunne ikke sende");
      toast.success("Takk — vi tar kontakt så snart vi kan.");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative space-y-5", className)}
      aria-label="Kontaktskjema"
      aria-busy={loading}
      aria-describedby="contact-consent-hint"
      noValidate
    >
      {/* Honeypot — skjult for mennesker */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"
        aria-hidden
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name" className={cn(isDark ? labelDark : labelLight)}>
            Navn{" "}
            <span className={isDark ? "text-[#62666d]" : "text-red-400"}>*</span>
          </Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={cn(
              isDark ? fieldDark : "h-10 rounded-[8px] " + fieldLight,
            )}
            placeholder="Ditt navn"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email" className={cn(isDark ? labelDark : labelLight)}>
            E-post{" "}
            <span className={isDark ? "text-[#62666d]" : "text-red-400"}>*</span>
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={cn(isDark ? fieldDark : "h-10 rounded-[8px] " + fieldLight)}
            placeholder="din@epost.no"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-phone" className={cn(isDark ? labelDark : labelLight)}>
            Telefon{" "}
            <span className={isDark ? "text-[#62666d]" : "text-muted-foreground"}>
              (valgfritt)
            </span>
          </Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={cn(isDark ? fieldDark : "h-10 rounded-[8px] " + fieldLight)}
            placeholder="+47 …"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-subject" className={cn(isDark ? labelDark : labelLight)}>
            Emne{" "}
            <span className={isDark ? "text-[#62666d]" : "text-red-400"}>*</span>
          </Label>
          <Input
            id="contact-subject"
            name="subject"
            type="text"
            required
            className={cn(isDark ? fieldDark : "h-10 rounded-[8px] " + fieldLight)}
            placeholder="Demo, prising, support …"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message" className={cn(isDark ? labelDark : labelLight)}>
          Melding{" "}
          <span className={isDark ? "text-[#62666d]" : "text-red-400"}>*</span>
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className={cn(
            "min-h-[120px]",
            isDark
              ? "rounded-[8px] border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] placeholder:text-[#62666d] focus-visible:border-[#5e6ad2] focus-visible:ring-2 focus-visible:ring-[#5e6ad2]/50 focus-visible:outline-none transition-colors"
              : "rounded-[8px] " + fieldLight,
          )}
          placeholder="Fortell kort om behov, volum eller tidslinje …"
        />
      </div>

      <p
        id="contact-consent-hint"
        className={cn("text-[12px] leading-[1.5]", isDark ? "text-[#62666d]" : "text-muted-foreground")}
      >
        Ved å sende inn samtykker du til at vi lagrer opplysningene for å besvare henvendelsen. Les mer i{" "}
        <a
          href="/personvern"
          className={cn(
            "underline underline-offset-4 transition-colors",
            isDark
              ? "text-[#5e6ad2] decoration-[#5e6ad2]/30 hover:text-[#828fff]"
              : "text-[#0f766e] decoration-[#2DD4BF]/40 hover:text-[#0d9488]",
          )}
        >
          personvernerklæringen
        </a>
        .
      </p>

      <Button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className={cn(
          isDark
            ? "h-9 rounded-[8px] bg-[#5e6ad2] px-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#828fff] disabled:opacity-50 sm:w-auto"
            : cn(
                LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS,
                "h-10 rounded-[8px] sm:w-auto sm:min-w-[10rem]",
                LANDING_MARKETING_PRIMARY_CTA_SHADOW_CLASS,
              ),
          "w-full",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Sender…
          </>
        ) : (
          "Send melding"
        )}
      </Button>
    </form>
  );
}
