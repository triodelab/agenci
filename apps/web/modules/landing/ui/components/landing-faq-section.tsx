"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LANDING_SECTION_IDS, landingSectionHref } from "@/modules/landing/constants";

const faqs = [
  {
    q: "Er dette ikke bare en vanlig chatbot?",
    a: "Nei. Vanlige chatboter gir deg forhåndsdefinerte svar på forhåndsdefinerte spørsmål — og mislykkes med alt annet. Agenci leser innholdet ditt og svarer fritt ut fra det. Stiller kunden et spørsmål du ikke har dekket, sier den fra og tilbyr å koble til deg.",
  },
  {
    q: "Hvor lang tid tar det å sette opp?",
    a: "Under 10 minutter for det grunnleggende. Lim inn én linje kode, last opp FAQ-en din, og du er i gang. Ingen utvikler nødvendig. Finjuster utseende og tone etterpå i dashboardet.",
  },
  {
    q: "Hva skjer hvis assistenten svarer feil?",
    a: "Du ser alle samtaler i dashboardet og kan rette opp underveis. Hvis assistenten er usikker, sier den fra til kunden i stedet for å gjette. Du kan legge inn instrukser for hva den aldri skal svare på.",
  },
  {
    q: "Hva med GDPR og personvern?",
    a: "Kundedata lagres i henhold til GDPR. Du eier dataene. Vi lagrer ikke samtaler til treningsformål uten avtale. Du kan slette alt til enhver tid.",
  },
  {
    q: "Hva skjer når en kunde trenger å snakke med et menneske?",
    a: "Du ser samtalen live i dashboardet og kan ta over når som helst. Kunden slipper å forklare alt på nytt — all historikk er der.",
  },
  {
    q: "Hva koster det etter prøveperioden?",
    a: "Pro-planen koster 499 kr per måned. Ingen bindingstid — si opp når som helst. Gratis-planen forblir gratis, men uten AI-assistenten.",
  },
] as const;

export function LandingFaqSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.faq}
      data-landing-nav-surface="dark"
      className="border-t border-[#1a1a1a] bg-black"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28 xl:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.8fr] lg:gap-20 xl:gap-28">

          {/* Left — sticky */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-5 font-mono text-[11px] tracking-[0.2em] text-[#333]">FAQ</p>
            <h2
              id="faq-heading"
              className="text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.045em] text-[#f0eeeb] sm:text-[2.1rem]"
            >
              Spørsmål vi får ofte
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-[#555]">
              Finner du ikke svaret du leter etter?
            </p>
            <Link
              href={landingSectionHref("contact")}
              className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-[#666] transition-colors hover:text-[#aaa]"
            >
              Send oss en melding
              <ArrowRight className="size-3.5" strokeWidth={2} />
            </Link>
          </div>

          {/* Right — accordion */}
          <Accordion type="single" collapsible defaultValue="item-0">
            {faqs.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="border-[#1a1a1a]"
              >
                <AccordionTrigger className="py-5 text-left text-[14px] font-medium leading-snug text-[#ccc] hover:text-[#f0eeeb] hover:no-underline [&>svg]:text-[#333] [&[data-state=open]>svg]:text-[#666]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[13.5px] leading-[1.75] text-[#555]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
