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
    q: "Er dette ikke bare en vanlig chatbot?",
    a: "Nei. Vanlige chatboter gir deg forhåndsdefinerte svar på forhåndsdefinerte spørsmål — og mislykkes med alt annet. Agenci leser innholdet ditt og svarer fritt ut fra det, akkurat som om du hadde skrevet svaret selv. Stiller kunden et spørsmål du ikke har dekket, sier den fra — og kunden kan kontakte deg direkte.",
  },
  {
    q: "Hvor lang tid tar det å sette opp?",
    a: "Under 10 minutter for det grunnleggende. Du limer inn én linje kode på nettsiden, laster opp FAQ-en din eller kopierer inn tekst, og er i gang. Du trenger ikke utvikler, og du trenger ikke gjøre noe om igjen. Vil du finjustere utseende og tone etterpå, gjør du det i dashboardet.",
  },
  {
    q: "Hva skjer hvis assistenten svarer feil?",
    a: "Du ser alle samtaler i dashboardet og kan rette opp underveis. Hvis assistenten er usikker, vil den si fra til kunden i stedet for å gjette. Du kan også legge inn instrukser for hva den aldri skal svare på — det styrer du helt selv.",
  },
  {
    q: "Hva med GDPR og personvern?",
    a: "Kundedata lagres i henhold til GDPR. Du eier dataene. Vi lagrer ikke samtaler til treningsformål uten avtale. Du kan slette alt til enhver tid.",
  },
  {
    q: "Hva skjer når en kunde trenger å snakke med et menneske?",
    a: "Du ser samtalen live i dashboardet og kan ta over når som helst. Kunden slipper å forklare alt på nytt — all historikk er der. Du kan også sette opp at visse spørsmål alltid går rett til deg.",
  },
  {
    q: "Hva koster det etter prøveperioden?",
    a: "Pro-planen koster 50 dollar i måneden. Ingen bindingstid — du kan si opp når som helst. Gratis-planen forblir gratis, men uten AI-assistenten. Bruker du mer enn du forventet? Ta kontakt, så finner vi noe som passer.",
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
            Spørsmål vi får ofte
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-500 md:text-base">
            Finner du ikke svaret? Send oss en melding — vi svarer innen én arbeidsdag.
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
