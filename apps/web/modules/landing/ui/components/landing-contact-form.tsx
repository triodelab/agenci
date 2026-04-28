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

const labelDark = "text-zinc-300";
const labelLight = "text-foreground";
const fieldDark =
  "border-white/15 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-[#2DD4BF]/25";
const fieldLight =
  "border-border/80 focus-visible:border-[#2DD4BF]/55 focus-visible:ring-[3px] focus-visible:ring-[#2DD4BF]/18";

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
        <div className="space-y-2">
          <Label htmlFor="contact-name" className={cn(isDark ? labelDark : labelLight)}>
            Navn <span className="text-red-400">*</span>
          </Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={cn(
              "h-11 rounded-xl",
              isDark ? fieldDark : fieldLight,
            )}
            placeholder="Ola Nordmann"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className={cn(isDark ? labelDark : labelLight)}>
            E-post <span className="text-red-400">*</span>
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={cn("h-11 rounded-xl", isDark ? fieldDark : fieldLight)}
            placeholder="ola@firma.no"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-phone" className={cn(isDark ? labelDark : labelLight)}>
            Telefon <span className="text-zinc-500">(valgfritt)</span>
          </Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={cn("h-11 rounded-xl", isDark ? fieldDark : fieldLight)}
            placeholder="+47 …"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-subject" className={cn(isDark ? labelDark : labelLight)}>
            Emne <span className="text-red-400">*</span>
          </Label>
          <Input
            id="contact-subject"
            name="subject"
            type="text"
            required
            className={cn("h-11 rounded-xl", isDark ? fieldDark : fieldLight)}
            placeholder="Demo, prising, support …"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message" className={cn(isDark ? labelDark : labelLight)}>
          Melding <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className={cn(
            "min-h-[120px] rounded-xl",
            isDark ? fieldDark : fieldLight,
          )}
          placeholder="Fortell kort om behov, volum eller tidslinje …"
        />
      </div>

      <p
        id="contact-consent-hint"
        className={cn("text-xs", isDark ? "text-zinc-500" : "text-muted-foreground")}
      >
        Ved å sende inn samtykker du til at vi lagrer opplysningene for å besvare henvendelsen. Les mer i{" "}
        <a
          href="/personvern"
          className={cn(
            "font-medium underline underline-offset-4 transition-colors",
            isDark
              ? "text-teal-300/90 decoration-teal-400/35 hover:text-teal-200"
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
          LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS,
          "h-11 w-full rounded-xl sm:w-auto sm:min-w-[10rem]",
          !isDark && LANDING_MARKETING_PRIMARY_CTA_SHADOW_CLASS,
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
