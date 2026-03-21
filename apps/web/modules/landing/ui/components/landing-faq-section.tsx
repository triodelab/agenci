"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import { LandingGradientText } from "@/modules/landing/ui/components/landing-gradient-text";
import { LandingSectionHeader } from "@/modules/landing/ui/components/landing-section-header";
import { cn } from "@workspace/ui/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { motion, useReducedMotion } from "motion/react";

const faqs = [
  {
    q: "Hvor lang tid tar det å komme i gang?",
    a: "De fleste er live på minutter: lim inn widget, koble til innhold, og sett enkle regler for hva Agenci skal svare på. Deretter finjusterer dere i dashboard.",
  },
  {
    q: "Kan samtalen overføres til et menneske?",
    a: "Ja. Når saken krever det, eller kunden ber om det, kan teamet ta over — uten at historikken går tapt.",
  },
  {
    q: "Hva kan Agenci faktisk svare på?",
    a: "Typisk kundeservice: FAQ, produktinfo, levering, retur, booking og mer. Dere definerer policy og innhold; Agenci holder seg innenfor det.",
  },
  {
    q: "Hvordan forholder dere dere til sikkerhet og GDPR?",
    a: "Vi bygger for B2B med kontroll på data og innhold. Enterprise kan tilpasses avtaler og sikkerhetskrav der det trengs.",
  },
  {
    q: "Trenger vi utviklere for å vedlikeholde?",
    a: "Daglig drift skjer i dashboard: oppdatere tekster, justere tone og se hva kundene spør om. Kodetrengs bare ved første install.",
  },
] as const;

export function LandingFaqSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.faq}
      aria-labelledby="faq-heading"
      className="relative scroll-mt-24 overflow-hidden border-b border-border/40 bg-background py-20 md:py-28"
    >
      <div
        aria-hidden
        className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_0%,transparent_0%,var(--color-background)_78%)]"
      />

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 lg:items-start">
          <div className="lg:sticky lg:top-28">
            <LandingSectionHeader
              align="left"
              eyebrow="FAQ"
              titleId="faq-heading"
              title={
                <>
                  Det dere lurer på — <LandingGradientText>kort fortalt</LandingGradientText>
                </>
              }
              description="Finnes ikke svaret her? Send en melding, så hjelper vi dere videre."
              className="max-w-md"
            />
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-border/50 bg-card/70 p-2 shadow-[0_28px_90px_-48px_rgba(0,0,0,0.2)] backdrop-blur-sm dark:bg-card/40 dark:shadow-[0_28px_90px_-48px_rgba(0,0,0,0.45)] md:p-3"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item) => (
                <AccordionItem key={item.q} value={item.q} className="border-border/45 px-1">
                  <AccordionTrigger
                    className={cn(
                      "rounded-xl px-4 py-4 text-left text-[15px] font-medium hover:no-underline md:px-5 md:py-5",
                      "data-[state=open]:bg-muted/40",
                    )}
                  >
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-[15px] leading-relaxed text-muted-foreground md:px-5 md:pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
