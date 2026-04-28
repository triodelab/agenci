"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

const faqs = [
  {
    q: "Hva er Agenci?",
    a: "Agenci er en KI-drevet chat som dere legger på nettsiden. Den svarer ut fra innholdet dere gir (FAQ, dokumenter, produkttekster), viser samtaler i et dashboard, og lar mennesker ta over når saken krever det. Målet er færre henvendelser som stopper i e-post, og flere fornøyde kunder uten at dere må skalere support lineært.",
  },
  {
    q: "Hvor raskt kan vi være live?",
    a: "Mange kommer i gang på kort tid: widget inn, kunnskap inn, test med ekte spørsmål. Vi anbefaler en enkel pilot først — så skalerer dere når flyten sitter.",
  },
  {
    q: "Hva skjer med data og personvern?",
    a: "Dere beholder kontroll over kundedata i tråd med avtale og gjeldende regler. Roller, innsyn og sporbarhet er bygget inn slik at dere kan dokumentere hvordan data brukes.",
  },
  {
    q: "Kan Agenci kobles til CRM, e-post og andre systemer?",
    a: "Ja. Poenget er at samtalen ikke skal leve isolert: koble der det gir mening for dere, så leads og saker havner der teamet allerede jobber.",
  },
  {
    q: "Hva skjer når kunden må snakke med et menneske?",
    a: "Samtalen kan overtas eller sendes videre med historikk og kontekst, slik at kunden slipper å gjenta seg og saken ikke forsvinner.",
  },
  {
    q: "Finnes det bindingstid?",
    a: "Det avhenger av avtale og nivå. Ta kontakt om volum, SLA og eventuelle forpliktelser — vi legger opp det som passer dere.",
  },
] as const;

export function LandingFaqSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.faq}
      data-landing-nav-surface="dark"
      className="relative scroll-mt-24 overflow-hidden border-t border-white/[0.07] bg-[#050507] py-20 md:py-28"
      aria-labelledby="faq-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(45,212,191,0.06),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
      />

      <div className="relative mx-auto max-w-3xl px-5 md:px-10">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-400/70 md:text-xs">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="mt-3 text-balance text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl"
          >
            Det dere ofte lurer på
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-500 md:text-base">
            Finner dere ikke svaret? Send en kort melding — vi hjelper med konkret oppsett for deres bransje.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12 w-full" defaultValue="item-0">
          {faqs.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="border-white/[0.08] data-[state=open]:border-white/[0.12]"
            >
              <AccordionTrigger
                className={cn(
                  "py-5 text-left text-[15px] font-semibold leading-snug text-zinc-100 hover:no-underline md:text-base",
                  "[&>svg]:text-zinc-500 [&[data-state=open]>svg]:text-teal-400/80",
                )}
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-zinc-400 md:text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
