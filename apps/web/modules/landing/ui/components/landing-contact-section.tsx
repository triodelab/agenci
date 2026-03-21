"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import {
  LandingGradientText,
  landingIconSurfaceClassName,
} from "@/modules/landing/ui/components/landing-gradient-text";
import { LandingSectionHeader } from "@/modules/landing/ui/components/landing-section-header";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { Mail, Phone, MessageSquare, Clock } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function LandingContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const reduced = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone") || undefined,
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Kunne ikke sende");
      }

      setSubmitted(true);
      form.reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Noe gikk galt. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const channels = [
    { icon: Mail, label: "E-post", value: "post@triodelab.no" },
    { icon: Phone, label: "Telefon", value: "+47 988 46 460" },
    { icon: Clock, label: "Respons", value: "Innen 24 timer" },
  ] as const;

  return (
    <section
      id={LANDING_SECTION_IDS.contact}
      aria-labelledby="contact-heading"
      className="relative scroll-mt-24 overflow-hidden bg-muted/15 py-20 md:py-28 dark:bg-muted/5"
    >
      <div
        aria-hidden
        className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-35"
      />

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:items-start">
          <div>
            <LandingSectionHeader
              align="left"
              eyebrow="Kontakt"
              titleId="contact-heading"
              title={
                <>
                  La oss ta <LandingGradientText>en prat</LandingGradientText>
                </>
              }
              description="Demo, enterprise, partnerskap eller support — skriv noen ord, så svarer vi så raskt vi kan."
              className="max-w-lg"
            />
            <ul className="mt-10 space-y-4">
              {channels.map(({ icon: Icon, label, value }, i) => (
                <motion.li
                  key={label}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background/80 px-4 py-3 dark:bg-background/50"
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      landingIconSurfaceClassName(),
                    )}
                  >
                    <Icon className="size-4" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="rounded-[1.75rem] border border-border/50 bg-background p-6 shadow-[0_32px_100px_-50px_rgba(0,0,0,0.18)] dark:bg-card/30 dark:shadow-[0_32px_100px_-50px_rgba(0,0,0,0.45)] md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Kontaktskjema">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Navn
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Ditt navn"
                    required
                    aria-required="true"
                    className="h-11 rounded-xl border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-post
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="din@epost.no"
                    required
                    aria-required="true"
                    autoComplete="email"
                    className="h-11 rounded-xl border-border/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefon <span className="font-normal text-muted-foreground">(valgfritt)</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+47 …"
                  autoComplete="tel"
                  className="h-11 rounded-xl border-border/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Emne
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="F.eks. demo, enterprise eller support"
                  required
                  aria-required="true"
                  className="h-11 rounded-xl border-border/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  Melding
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Hva kan vi hjelpe med?"
                  required
                  aria-required="true"
                  rows={5}
                  className="resize-none rounded-xl border-border/60"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl shadow-[0_12px_32px_-8px_color-mix(in_oklab,var(--primary)_38%,transparent)]"
                disabled={isSubmitting || submitted}
                aria-busy={isSubmitting}
                aria-live="polite"
              >
                {isSubmitting ? (
                  "Sender…"
                ) : submitted ? (
                  <span className="inline-flex items-center gap-2">
                    <MessageSquare className="size-4" aria-hidden />
                    Sendt — vi tar kontakt
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Mail className="size-4" aria-hidden />
                    Send melding
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
